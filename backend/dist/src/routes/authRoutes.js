"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../utils/auth");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        if (user.status === 'DISABLED') {
            return res.status(403).json({ error: 'Account is disabled. Contact Super Administrator.' });
        }
        const passwordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!passwordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            assetCategory: user.assetCategory
        };
        const token = (0, auth_1.generateToken)(payload);
        res.json({
            token,
            user: payload
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during authentication', details: error.message });
    }
});
// GET /api/auth/me
router.get('/me', authMiddleware_1.authenticateToken, async (req, res) => {
    res.json({ user: req.user });
});
exports.default = router;
