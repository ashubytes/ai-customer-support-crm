import { Router } from 'express';
import { body } from 'express-validator';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

// GET /api/users/agents - List active agents (Agent/Admin)
router.get('/agents', requireRole('agent', 'admin'), UserController.getAgentsList);

// GET /api/users - List all users (Admin only)
router.get('/', requireRole('admin'), UserController.listUsers);

// POST /api/users - Create new agent/admin user (Admin only)
router.post(
  '/',
  requireRole('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['customer', 'agent', 'admin']).withMessage('Valid role is required'),
    validateRequest,
  ],
  UserController.createUser
);

// PUT /api/users/:id/status - Toggle active/inactive status (Admin only)
router.put(
  '/:id/status',
  requireRole('admin'),
  [
    body('isActive').isBoolean().withMessage('isActive must be boolean'),
    validateRequest,
  ],
  UserController.toggleUserStatus
);

// PUT /api/users/:id/role - Update user role (Admin only)
router.put(
  '/:id/role',
  requireRole('admin'),
  [
    body('role').isIn(['customer', 'agent', 'admin']).withMessage('Valid role is required'),
    validateRequest,
  ],
  UserController.updateUserRole
);

export default router;
