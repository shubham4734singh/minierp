import { Request, Response } from 'express';
import prisma from '../utils/db';
import { z } from 'zod';
import { MovementType } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(2),
  category: z.string().min(2),
  unitPrice: z.number().positive(),
  currentStock: z.number().int().nonnegative().optional(),
  minStockAlert: z.number().int().nonnegative().optional(),
  location: z.string().optional(),
  description: z.string(),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { sku: { contains: search, mode: 'insensitive' as const } },
        { category: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: String(req.params.id) },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { createdBy: { select: { name: true } } },
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = productSchema.parse(req.body);

    const existingProduct = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingProduct) {
      res.status(400).json({ error: 'Product with this SKU already exists.' });
      return;
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        currentStock: 0, // Starts at 0, updated via stock movement
      },
    });

    res.status(201).json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: (error as any).errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = productSchema.partial().parse(req.body);

    const product = await prisma.product.update({
      where: { id: String(req.params.id) },
      data,
    });

    res.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: (error as any).errors });
    } else {
      console.error("UPDATE PRODUCT ERROR:", error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

const stockMovementSchema = z.object({
  quantity: z.number().int().positive(),
  type: z.nativeEnum(MovementType),
  reason: z.string().optional(),
});

export const adjustStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quantity, type, reason } = stockMovementSchema.parse(req.body);
    const productId = String(req.params.id);

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (type === MovementType.OUT && product.currentStock < quantity) {
      res.status(400).json({ error: 'Insufficient stock' });
      return;
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          currentStock: type === MovementType.IN 
            ? { increment: quantity }
            : { decrement: quantity },
        },
      });

      await tx.stockMovementLog.create({
        data: {
          productId,
          quantity,
          type,
          reason,
          createdById: req.user!.id,
        },
      });

      return updated;
    });

    res.json({ message: 'Stock adjusted successfully', product: updatedProduct });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: (error as any).errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
