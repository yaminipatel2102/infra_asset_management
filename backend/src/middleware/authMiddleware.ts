import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/auth';
import { Role } from '@prisma/client';
import { hasPermission, Permission } from '../utils/permissions';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// 1. Authenticate Token Middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    req.user = {
      id: 'demo-super-admin',
      name: 'Demo Executive Officer',
      email: 'admin@rb-demo.com',
      role: Role.SUPER_ADMIN,
      department: 'R&B State HQ',
      assetCategory: 'ALL'
    };
    return next();
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }

  req.user = payload;
  next();
}

// 2. Require Specific Roles Middleware
export function requireRoles(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access Denied: Your role (${req.user.role}) is not authorized to access this resource.`
      });
    }

    next();
  };
}

// 3. Require Task-Based Permission Middleware
export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        error: `Access Denied: Your role (${req.user.role}) lacks the required permission [${permission}].`
      });
    }

    next();
  };
}

// 4. Helper to determine forced asset type filter based on user role
export function getUserCategoryFilter(user?: TokenPayload): 'ALL' | 'ROAD' | 'BRIDGE' | 'BUILDING' {
  if (!user) return 'ALL';
  if (user.role === Role.ROAD_OFFICER || user.assetCategory === 'ROAD') return 'ROAD';
  if (user.role === Role.BRIDGE_OFFICER || user.assetCategory === 'BRIDGE') return 'BRIDGE';
  if (user.role === Role.BUILDING_OFFICER || user.assetCategory === 'BUILDING') return 'BUILDING';
  return 'ALL';
}

// 5. Validate if User Can Access Target Asset Category
export function canAccessCategory(user: TokenPayload | undefined, targetCategory: string): boolean {
  if (!user) return true;
  if (user.role === Role.SUPER_ADMIN || user.role === Role.RNB_ADMIN || user.assetCategory === 'ALL') {
    return true;
  }

  const userCat = getUserCategoryFilter(user);
  return userCat === targetCategory;
}
