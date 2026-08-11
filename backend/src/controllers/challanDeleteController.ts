import { Request, Response } from 'express';
import prisma from '../utils/db';

export const deleteChallan = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ideally we should refund stock before deleting, but keeping it simple for CRUD
    await prisma.salesChallan.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Challan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete challan' });
  }
};
