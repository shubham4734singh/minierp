import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { Role } from '@prisma/client';

const router = express.Router();

router.use(authenticate);
// Only ADMIN can view audit logs
router.use(authorize([Role.ADMIN]));

router.get('/', getAuditLogs);

export default router;
