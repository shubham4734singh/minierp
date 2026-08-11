import { Request, Response } from 'express';
import prisma from '../utils/db';

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    // Note: If customer has challans, this might fail due to foreign key constraints,
    // but we allow basic deletion for CRUD demonstration
    await prisma.customer.delete({ where: { id: req.params.id } });
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};
