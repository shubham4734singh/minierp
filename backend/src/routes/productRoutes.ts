import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, adjustStock } from '../controllers/productController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getProducts);
router.get('/:id', getProductById);

import { uploadImage } from '../controllers/uploadController';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

// Optionally restrict creation/updates to certain roles
router.post('/upload', authorize(['ADMIN', 'WAREHOUSE']), upload.single('image'), uploadImage);
router.post('/', authorize(['ADMIN', 'WAREHOUSE']), createProduct);
router.put('/:id', authorize(['ADMIN', 'WAREHOUSE']), updateProduct);

import { deleteProduct } from '../controllers/productDeleteController';
router.delete('/:id', authorize(['ADMIN', 'WAREHOUSE']), deleteProduct);

// Adjust stock explicitly (IN/OUT)
router.post('/:id/stock', authorize(['ADMIN', 'WAREHOUSE']), adjustStock);

export default router;
