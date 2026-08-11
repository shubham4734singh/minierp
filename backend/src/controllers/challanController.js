"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChallanById = exports.getChallans = exports.createChallan = void 0;
const express_1 = require("express");
const db_1 = __importDefault(require("../utils/db"));
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const challanItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().int().positive(),
});
const challanSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid(),
    status: zod_1.z.nativeEnum(client_1.ChallanStatus).default(client_1.ChallanStatus.DRAFT),
    items: zod_1.z.array(challanItemSchema).min(1),
});
const generateChallanNumber = async () => {
    const count = await db_1.default.salesChallan.count();
    return `CH-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
};
const createChallan = async (req, res) => {
    try {
        const data = challanSchema.parse(req.body);
        const userId = req.user.id;
        const customer = await db_1.default.customer.findUnique({ where: { id: data.customerId } });
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        const productIds = data.items.map(item => item.productId);
        const products = await db_1.default.product.findMany({
            where: { id: { in: productIds } },
        });
        if (products.length !== productIds.length) {
            res.status(400).json({ error: 'One or more products not found' });
            return;
        }
        const productMap = new Map(products.map(p => [p.id, p]));
        // Validation for stock if confirming immediately
        if (data.status === client_1.ChallanStatus.CONFIRMED) {
            for (const item of data.items) {
                const p = productMap.get(item.productId);
                if (p.currentStock < item.quantity) {
                    res.status(400).json({ error: `Insufficient stock for product ${p.name}` });
                    return;
                }
            }
        }
        const challanNumber = await generateChallanNumber();
        const totalQuantity = data.items.reduce((sum, item) => sum + item.quantity, 0);
        const result = await db_1.default.$transaction(async (tx) => {
            const challan = await tx.salesChallan.create({
                data: {
                    challanNumber,
                    customerId: data.customerId,
                    status: data.status,
                    totalQuantity,
                    createdById: userId,
                    items: {
                        create: data.items.map(item => {
                            const p = productMap.get(item.productId);
                            return {
                                productId: p.id,
                                productName: p.name,
                                productSku: p.sku,
                                unitPrice: p.unitPrice,
                                quantity: item.quantity,
                            };
                        }),
                    },
                },
                include: { items: true },
            });
            if (data.status === client_1.ChallanStatus.CONFIRMED) {
                for (const item of data.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { currentStock: { decrement: item.quantity } },
                    });
                    await tx.stockMovementLog.create({
                        data: {
                            productId: item.productId,
                            quantity: item.quantity,
                            type: client_1.MovementType.OUT,
                            reason: `Sales Challan ${challanNumber}`,
                            createdById: userId,
                        },
                    });
                }
            }
            return challan;
        });
        res.status(201).json(result);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: error.errors });
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
exports.createChallan = createChallan;
const getChallans = async (req, res) => {
    try {
        const challans = await db_1.default.salesChallan.findMany({
            include: {
                customer: { select: { name: true, businessName: true } },
                createdBy: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(challans);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getChallans = getChallans;
const getChallanById = async (req, res) => {
    try {
        const challan = await db_1.default.salesChallan.findUnique({
            where: { id: req.params.id },
            include: {
                customer: true,
                items: true,
                createdBy: { select: { name: true } },
            },
        });
        if (!challan) {
            res.status(404).json({ error: 'Challan not found' });
            return;
        }
        res.json(challan);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getChallanById = getChallanById;
//# sourceMappingURL=challanController.js.map