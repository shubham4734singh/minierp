"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomer = exports.createCustomer = exports.getCustomerById = exports.getCustomers = void 0;
const express_1 = require("express");
const db_1 = __importDefault(require("../utils/db"));
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const customerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    mobile: zod_1.z.string().min(10),
    email: zod_1.z.string().email().optional().or(zod_1.z.literal('')),
    businessName: zod_1.z.string().optional(),
    gstNumber: zod_1.z.string().optional(),
    type: zod_1.z.nativeEnum(client_1.CustomerType).optional(),
    address: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.CustomerStatus).optional(),
    followUpDate: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
const getCustomers = async (req, res) => {
    try {
        const search = req.query.search;
        const type = req.query.type;
        const status = req.query.status;
        const customers = await db_1.default.customer.findMany({
            where: {
                ...(search && {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { mobile: { contains: search } },
                        { businessName: { contains: search, mode: 'insensitive' } },
                    ],
                }),
                ...(type && { type }),
                ...(status && { status }),
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getCustomers = getCustomers;
const getCustomerById = async (req, res) => {
    try {
        const customer = await db_1.default.customer.findUnique({
            where: { id: req.params.id },
            include: { salesChallans: true },
        });
        if (!customer) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getCustomerById = getCustomerById;
const createCustomer = async (req, res) => {
    try {
        const data = customerSchema.parse(req.body);
        const customer = await db_1.default.customer.create({
            data: {
                ...data,
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
            },
        });
        res.status(201).json(customer);
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
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const data = customerSchema.partial().parse(req.body);
        const customer = await db_1.default.customer.update({
            where: { id: req.params.id },
            data: {
                ...data,
                followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
            },
        });
        res.json(customer);
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
exports.updateCustomer = updateCustomer;
//# sourceMappingURL=customerController.js.map