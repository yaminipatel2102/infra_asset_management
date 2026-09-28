import { Router, Response } from 'express';
import { prisma } from '../db/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { authenticateToken, requireRoles, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// Enforce authentication & Super Admin role on all user routes
router.use(authenticateToken);
router.use(requireRoles([Role.SUPER_ADMIN]));

// GET /api/users - List users
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
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
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

// POST /api/users - Create User
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, role, department, assetCategory } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields (name, email, password, role)' });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (existing) {
      return res.status(400).json({ error: 'A user with this email address already exists' });
    }

    // Auto-map category if role implies specific infrastructure type
    let category = assetCategory || 'ALL';
    if (role === Role.ROAD_OFFICER) category = 'ROAD';
    if (role === Role.BRIDGE_OFFICER) category = 'BRIDGE';
    if (role === Role.BUILDING_OFFICER) category = 'BUILDING';

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: role as Role,
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
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

// PUT /api/users/:id - Update User Role or Status
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, department, assetCategory, status, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    let passwordHash = existing.passwordHash;
    if (password && password.trim() !== '') {
      passwordHash = await bcrypt.hash(password, 10);
    }

    let category = assetCategory || existing.assetCategory;
    if (role === Role.ROAD_OFFICER) category = 'ROAD';
    if (role === Role.BRIDGE_OFFICER) category = 'BRIDGE';
    if (role === Role.BUILDING_OFFICER) category = 'BUILDING';

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(role && { role: role as Role }),
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
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User account removed successfully', id });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

export default router;
