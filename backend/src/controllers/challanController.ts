import { Request, Response } from 'express';
import prisma from '../utils/db';
import { z } from 'zod';
import { ChallanStatus, MovementType } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

const challanItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

const challanSchema = z.object({
  customerId: z.string().uuid(),
  status: z.nativeEnum(ChallanStatus).default(ChallanStatus.DRAFT),
  items: z.array(challanItemSchema).min(1),
});

const generateChallanNumber = async () => {
  const count = await prisma.salesChallan.count();
  return `CH-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
};

export const createChallan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = challanSchema.parse(req.body);
    const userId = req.user!.id;

    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const productIds = data.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      res.status(400).json({ error: 'One or more products not found' });
      return;
    }

    const productMap = new Map(products.map(p => [p.id, p]));

    // Validation for stock if confirming immediately
    if (data.status === ChallanStatus.CONFIRMED) {
      for (const item of data.items) {
        const p = productMap.get(item.productId)!;
        if (p.currentStock < item.quantity) {
          res.status(400).json({ error: `Insufficient stock for product ${p.name}` });
          return;
        }
      }
    }

    const challanNumber = await generateChallanNumber();
    const totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0);

    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId: data.customerId,
          status: data.status,
          totalQuantity,
          createdById: userId,
          items: {
            create: data.items.map(item => {
              const p = productMap.get(item.productId)!;
              return {
                productId: p.id,
                productName: p.name,
                productSku: p.sku,
                unitPrice: p.unitPrice,
                quantity: item.quantity,
              };
            }),
          },
        },
        include: { 
          items: true,
          customer: { select: { name: true, businessName: true } },
          createdBy: { select: { name: true } }
        },
      });

      if (data.status === ChallanStatus.CONFIRMED) {
        for (const item of data.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovementLog.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: MovementType.OUT,
              reason: `Sales Challan ${challanNumber}`,
              createdById: userId,
            },
          });
        }
      }

      return challan;
    });

    const io = require('../socket').getIO();
    if (io) {
      io.emit('new_challan', {
        message: `New Sales Challan ${challanNumber} created by Admin`,
        challanId: result.id,
        challanNumber: result.challanNumber
      });
      if (data.status === ChallanStatus.CONFIRMED) {
        io.emit('stock_updated');
      }
    }

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const getChallans = async (req: Request, res: Response): Promise<void> => {
  try {
    const challans = await prisma.salesChallan.findMany({
      include: {
        customer: { select: { name: true, businessName: true } },
        createdBy: { select: { name: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(challans);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChallanById = async (req: Request, res: Response): Promise<void> => {
  try {
    const challan = await prisma.salesChallan.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: true,
        createdBy: { select: { name: true } },
      },
    });

    if (!challan) {
      res.status(404).json({ error: 'Challan not found' });
      return;
    }

    res.json(challan);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

import { generateChallanPDF } from '../utils/pdfGenerator';

export const exportChallanPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const challan = await prisma.salesChallan.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!challan) {
      res.status(404).json({ error: 'Challan not found' });
      return;
    }

    generateChallanPDF(challan, res);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateChallanStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    if (!Object.values(ChallanStatus).includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: { items: true, customer: { select: { name: true, businessName: true } }, createdBy: { select: { name: true } } },
    });

    if (!challan) {
      res.status(404).json({ error: 'Challan not found' });
      return;
    }

    if (challan.status === status) {
      res.json(challan);
      return;
    }

    // Logic for stock deduction/restoration based on status changes
    const updatedChallan = await prisma.$transaction(async (tx) => {
      // If moving from DRAFT or CANCELLED to CONFIRMED
      if ((challan.status === ChallanStatus.DRAFT || challan.status === ChallanStatus.CANCELLED) && status === ChallanStatus.CONFIRMED) {
        // Verify stock first
        for (const item of challan.items) {
          const p = await tx.product.findUnique({ where: { id: item.productId } });
          if (!p || p.currentStock < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.productName}`);
          }
        }
        
        // Deduct stock
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovementLog.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: MovementType.OUT,
              reason: `Sales Challan ${challan.challanNumber} Confirmed`,
              createdById: userId,
            },
          });
        }
      }

      // If moving to CANCELLED and it was previously CONFIRMED, SHIPPED, DELIVERED
      if (status === ChallanStatus.CANCELLED && challan.status !== ChallanStatus.DRAFT) {
        // Restore stock
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });

          await tx.stockMovementLog.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: MovementType.IN,
              reason: `Sales Challan ${challan.challanNumber} Cancelled`,
              createdById: userId,
            },
          });
        }
      }

      // Update status
      return tx.salesChallan.update({
        where: { id },
        data: { status },
        include: { customer: { select: { name: true, businessName: true } }, createdBy: { select: { name: true } }, items: true }
      });
    });

    const io = require('../socket').getIO();
    if (io && (status === ChallanStatus.CONFIRMED || status === ChallanStatus.CANCELLED)) {
      io.emit('stock_updated');
    }

    res.json(updatedChallan);
  } catch (error: any) {
    if (error.message.includes('Insufficient stock')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
