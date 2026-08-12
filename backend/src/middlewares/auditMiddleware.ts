import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import prisma from '../utils/db';

export const auditLogMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function (body) {
    res.locals.body = body;
    return originalJson.call(this, body);
  };

  res.on('finish', async () => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
      const url = req.originalUrl || req.url;
      let isAuth = url.includes('auth');
      
      let userId = req.user?.id;
      if (isAuth && res.locals.body?.user?.id) {
          userId = res.locals.body.user.id;
      }

      if (userId) {
        let action = 'CREATE';
        if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
        if (req.method === 'DELETE') action = 'DELETE';

        let entityType = 'UNKNOWN';
        if (url.includes('customers')) entityType = 'CUSTOMER';
        else if (url.includes('products')) entityType = 'PRODUCT';
        else if (url.includes('challans')) entityType = 'CHALLAN';
        else if (url.includes('users')) entityType = 'USER';
        else if (isAuth) entityType = 'AUTH';

        const pathParts = url.split('/').filter(Boolean);
        let entityId = 'SYSTEM';
        
        if (pathParts.length >= 3 && !['customers', 'products', 'challans', 'users', 'auth', 'stock', 'status'].includes(pathParts[pathParts.length - 1])) {
           entityId = pathParts[pathParts.length - 1];
           if (entityId.includes('?')) {
               entityId = entityId.split('?')[0];
           }
        } else if (pathParts.length >= 4 && ['stock', 'status'].includes(pathParts[pathParts.length - 1])) {
           entityId = pathParts[pathParts.length - 2];
        }
        
        if (req.method === 'POST' && res.locals.body) {
           entityId = res.locals.body.id || entityId;
           if (entityType === 'AUTH' && res.locals.body.user) {
               entityId = res.locals.body.user.id || 'SYSTEM';
           }
        }

        if (isAuth) {
           if (url.includes('login')) action = 'LOGIN';
           else if (url.includes('register')) action = 'REGISTER';
        }

        try {
          await prisma.auditLog.create({
            data: {
              action,
              entityType,
              entityId: String(entityId),
              userId: userId,
              details: `${action} operation on ${entityType}`,
            }
          });
        } catch (error) {
          console.error('Failed to write audit log', error);
        }
      }
    }
  });

  next();
};
