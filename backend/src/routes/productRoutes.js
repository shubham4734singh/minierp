"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.get('/', productController_1.getProducts);
router.get('/:id', productController_1.getProductById);
// Optionally restrict creation/updates to certain roles
router.post('/', (0, authMiddleware_1.authorize)(['ADMIN', 'WAREHOUSE']), productController_1.createProduct);
router.put('/:id', (0, authMiddleware_1.authorize)(['ADMIN', 'WAREHOUSE']), productController_1.updateProduct);
// Adjust stock explicitly (IN/OUT)
router.post('/:id/stock', (0, authMiddleware_1.authorize)(['ADMIN', 'WAREHOUSE']), productController_1.adjustStock);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map