import { Router } from 'express';
import { getCustomers, getCustomerById, createCustomer, updateCustomer } from '../controllers/customerController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Require authentication for all customer routes
router.use(authenticate);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', authorize(['ADMIN', 'SALES']), createCustomer);
router.put('/:id', authorize(['ADMIN', 'SALES']), updateCustomer);

import { deleteCustomer } from '../controllers/customerDeleteController';
router.delete('/:id', authorize(['ADMIN']), deleteCustomer);

export default router;
