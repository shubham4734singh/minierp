import { Router } from 'express';
import { getUsers, updateUser, deleteUser } from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Only ADMIN can manage users
router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/', getUsers);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
