import { Router } from 'express';
import { body } from 'express-validator';
import { DealController } from '../controllers/deal.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate, requireRole('admin', 'agent'));

router.get('/', DealController.list);

router.post(
  '/',
  [
    body('customerId').isInt({ min: 1 }).withMessage('customerId is required'),
    body('title').trim().notEmpty().withMessage('Deal title is required'),
    body('value').optional().isFloat({ min: 0 }),
    body('probability').optional().isInt({ min: 0, max: 100 }),
    validateRequest,
  ],
  DealController.create
);

router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty(),
    body('value').optional().isFloat({ min: 0 }),
    body('probability').optional().isInt({ min: 0, max: 100 }),
    validateRequest,
  ],
  DealController.update
);

export default router;
