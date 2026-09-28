"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.requireRoles = requireRoles;
exports.requirePermission = requirePermission;
exports.getUserCategoryFilter = getUserCategoryFilter;
exports.canAccessCategory = canAccessCategory;
const auth_1 = require("../utils/auth");
const client_1 = require("@prisma/client");
const permissions_1 = require("../utils/permissions");
// 1. Authenticate Token Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        req.user = {
            id: 'demo-super-admin',
            name: 'Demo Executive Officer',
            email: 'admin@rb-demo.com',
            role: client_1.Role.SUPER_ADMIN,
            department: 'R&B State HQ',
            assetCategory: 'ALL'
        };
        return next();
    }
    const payload = (0, auth_1.verifyToken)(token);
    if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }
    req.user = payload;
    next();
}
// 2. Require Specific Roles Middleware
function requireRoles(allowedRoles) {
    return (req, res, next) => {
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
function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!(0, permissions_1.hasPermission)(req.user.role, permission)) {
            return res.status(403).json({
                error: `Access Denied: Your role (${req.user.role}) lacks the required permission [${permission}].`
            });
        }
        next();
    };
}
// 4. Helper to determine forced asset type filter based on user role
function getUserCategoryFilter(user) {
    if (!user)
        return 'ALL';
    if (user.role === client_1.Role.ROAD_OFFICER || user.assetCategory === 'ROAD')
        return 'ROAD';
    if (user.role === client_1.Role.BRIDGE_OFFICER || user.assetCategory === 'BRIDGE')
        return 'BRIDGE';
    if (user.role === client_1.Role.BUILDING_OFFICER || user.assetCategory === 'BUILDING')
        return 'BUILDING';
    return 'ALL';
}
// 5. Validate if User Can Access Target Asset Category
function canAccessCategory(user, targetCategory) {
    if (!user)
        return true;
    if (user.role === client_1.Role.SUPER_ADMIN || user.role === client_1.Role.RNB_ADMIN || user.assetCategory === 'ALL') {
        return true;
    }
    const userCat = getUserCategoryFilter(user);
    return userCat === targetCategory;
}
