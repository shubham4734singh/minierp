"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'supersecret');
        req.user = decoded;
        next();
    }
    catch (ex) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ error: 'Access denied. You do not have permission.' });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=authMiddleware.js.map