import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);
router.get('/', getDashboardStats);

export default router;
