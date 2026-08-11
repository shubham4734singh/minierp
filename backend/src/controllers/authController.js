"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const express_1 = require("express");
const db_1 = __importDefault(require("../utils/db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
const login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password.' });
            return;
        }
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ error: 'Invalid email or password.' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
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
exports.login = login;
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.nativeEnum(client_1.Role).optional(),
});
const register = async (req, res) => {
    try {
        const { name, email, password, role } = registerSchema.parse(req.body);
        const existingUser = await db_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists.' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const user = await db_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || client_1.Role.SALES,
            },
        });
        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
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
exports.register = register;
//# sourceMappingURL=authController.js.map