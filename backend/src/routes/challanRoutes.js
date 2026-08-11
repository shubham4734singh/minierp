"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challanController_1 = require("../controllers/challanController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
router.get('/', challanController_1.getChallans);
router.get('/:id', challanController_1.getChallanById);
router.post('/', challanController_1.createChallan);
exports.default = router;
//# sourceMappingURL=challanRoutes.js.map