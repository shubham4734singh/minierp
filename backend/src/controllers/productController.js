"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustStock = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const express_1 = require("express");
const db_1 = __importDefault(require("../utils/db"));
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const productSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    sku: zod_1.z.string().min(2),
    category: zod_1.z.string().min(2),
    unitPrice: zod_1.z.number().positive(),
    minStockAlert: zod_1.z.number().int().nonnegative().optional(),
    location: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
});
const getProducts = async (req, res) => {
    try {
        const search = req.query.search;
        const products = await db_1.default.product.findMany({
            where: {
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { sku: { contains: search, mode: 'insensitive' } },
                        { category: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(products);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const product = await db_1.default.product.findUnique({
            where: { id: req.params.id },
            include: {
                stockMovements: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                    include: { createdBy: { select: { name: true } } },
                },
            },
        });
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const data = productSchema.parse(req.body);
        const existingProduct = await db_1.default.product.findUnique({ where: { sku: data.sku } });
        if (existingProduct) {
            res.status(400).json({ error: 'Product with this SKU already exists.' });
            return;
        }
        const product = await db_1.default.product.create({
            data: {
                ...data,
                currentStock: 0, // Starts at 0, updated via stock movement
            },
        });
        res.status(201).json(product);
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
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const data = productSchema.partial().parse(req.body);
        const product = await db_1.default.product.update({
            where: { id: req.params.id },
            data,
        });
        res.json(product);
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
exports.updateProduct = updateProduct;
const stockMovementSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().positive(),
    type: zod_1.z.nativeEnum(client_1.MovementType),
    reason: zod_1.z.string().optional(),
});
const adjustStock = async (req, res) => {
    try {
        const { quantity, type, reason } = stockMovementSchema.parse(req.body);
        const productId = req.params.id;
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const product = await db_1.default.product.findUnique({ where: { id: productId } });
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        if (type === client_1.MovementType.OUT && product.currentStock < quantity) {
            res.status(400).json({ error: 'Insufficient stock' });
            return;
        }
        const updatedProduct = await db_1.default.$transaction(async (tx) => {
            const updated = await tx.product.update({
                where: { id: productId },
                data: {
                    currentStock: type === client_1.MovementType.IN
                        ? { increment: quantity }
                        : { decrement: quantity },
                },
            });
            await tx.stockMovementLog.create({
                data: {
                    productId,
                    quantity,
                    type,
                    reason,
                    createdById: req.user.id,
                },
            });
            return updated;
        });
        res.json({ message: 'Stock adjusted successfully', product: updatedProduct });
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
exports.adjustStock = adjustStock;
//# sourceMappingURL=productController.js.map