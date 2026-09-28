import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional({ checkFalsy: true }).isString(),
    body('company').optional({ checkFalsy: true }).isString(),
    validateRequest,
  ],
  AuthController.register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest,
  ],
  AuthController.login
);

// GET /api/auth/me
router.get('/me', authenticate, AuthController.getMe);

// PUT /api/auth/profile
router.put('/profile', authenticate, AuthController.updateProfile);

export default router;
