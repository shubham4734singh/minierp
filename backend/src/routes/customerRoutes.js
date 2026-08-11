"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerController_1 = require("../controllers/customerController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Require authentication for all customer routes
router.use(authMiddleware_1.authenticate);
router.get('/', customerController_1.getCustomers);
router.get('/:id', customerController_1.getCustomerById);
router.post('/', customerController_1.createCustomer);
router.put('/:id', customerController_1.updateCustomer);
exports.default = router;
//# sourceMappingURL=customerRoutes.js.map