import { Router } from 'express';
import { createChallan, getChallans, getChallanById, exportChallanPDF, updateChallanStatus } from '../controllers/challanController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getChallans);
router.get('/:id', getChallanById);
router.get('/:id/pdf', exportChallanPDF);
router.post('/', createChallan);
router.put('/:id/status', updateChallanStatus);

import { deleteChallan } from '../controllers/challanDeleteController';
router.delete('/:id', deleteChallan);

export default router;
