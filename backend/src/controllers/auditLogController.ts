import { Request, Response } from 'express';
import db from '../utils/db';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { action, entityType, userId, page = 1, limit = 20 } = req.query;

    const where: any = {};
    if (action) where.action = { contains: action as string, mode: 'insensitive' };
    if (entityType) where.entityType = { contains: entityType as string, mode: 'insensitive' };
    if (userId) where.userId = userId as string;

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      db.auditLog.count({ where })
    ]);

    res.json({
      data: logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
