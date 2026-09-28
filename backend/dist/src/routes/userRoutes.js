"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../db/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Enforce authentication & Super Admin role on all user routes
router.use(authMiddleware_1.authenticateToken);
router.use((0, authMiddleware_1.requireRoles)([client_1.Role.SUPER_ADMIN]));
// GET /api/users - List users
router.get('/', async (req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                assetCategory: true,
                status: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});
// POST /api/users - Create User
router.post('/', async (req, res) => {
    try {
        const { name, email, password, role, department, assetCategory } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields (name, email, password, role)' });
        }
        const existing = await prisma_1.prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() }
        });
        if (existing) {
            return res.status(400).json({ error: 'A user with this email address already exists' });
        }
        // Auto-map category if role implies specific infrastructure type
        let category = assetCategory || 'ALL';
        if (role === client_1.Role.ROAD_OFFICER)
            category = 'ROAD';
        if (role === client_1.Role.BRIDGE_OFFICER)
            category = 'BRIDGE';
        if (role === client_1.Role.BUILDING_OFFICER)
            category = 'BUILDING';
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const newUser = await prisma_1.prisma.user.create({
            data: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                passwordHash,
                role: role,
                department: department || 'R&B Department',
                assetCategory: category,
                status: 'ACTIVE'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                assetCategory: true,
                status: true,
                createdAt: true
            }
        });
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
});
// PUT /api/users/:id - Update User Role or Status
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, department, assetCategory, status, password } = req.body;
        const existing = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: 'User not found' });
        }
        let passwordHash = existing.passwordHash;
        if (password && password.trim() !== '') {
            passwordHash = await bcryptjs_1.default.hash(password, 10);
        }
        let category = assetCategory || existing.assetCategory;
        if (role === client_1.Role.ROAD_OFFICER)
            category = 'ROAD';
        if (role === client_1.Role.BRIDGE_OFFICER)
            category = 'BRIDGE';
        if (role === client_1.Role.BUILDING_OFFICER)
            category = 'BUILDING';
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id },
            data: {
                ...(name && { name: name.trim() }),
                ...(role && { role: role }),
                ...(department && { department }),
                ...(category && { assetCategory: category }),
                ...(status && { status }),
                passwordHash
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                assetCategory: true,
                status: true,
                updatedAt: true
            }
        });
        res.json(updatedUser);
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
});
// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma_1.prisma.user.delete({ where: { id } });
        res.json({ message: 'User account removed successfully', id });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
});
exports.default = router;
