import { Request, Response } from 'express';
import prisma from '../utils/db';
import { z } from 'zod';
import { CustomerType, CustomerStatus } from '@prisma/client';

const customerSchema = z.object({
  name: z.string().min(2),
  mobile: z.string().min(10),
  email: z.string().email().optional().or(z.literal('')),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
  type: z.nativeEnum(CustomerType).optional(),
  address: z.string().optional(),
  status: z.nativeEnum(CustomerStatus).optional(),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string;
    const type = req.query.type as CustomerType;
    const status = req.query.status as CustomerStatus;

    const customers = await prisma.customer.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { mobile: { contains: search } },
            { businessName: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(type && { type }),
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: String(req.params.id) },
      include: { salesChallans: true },
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = customerSchema.parse(req.body);

    const customer = await prisma.customer.create({
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      },
    });

    res.status(201).json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: (error as any).errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = customerSchema.partial().parse(req.body);

    const customer = await prisma.customer.update({
      where: { id: String(req.params.id) },
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      },
    });

    res.json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: (error as any).errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
