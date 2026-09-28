import { Router } from 'express';
import { body } from 'express-validator';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

// Protect all customer routes with authentication and agent/admin role
router.use(authenticate);

// GET /api/customers - List CRM customers (Agent/Admin)
router.get('/', requireRole('agent', 'admin'), CustomerController.listCustomers);

// GET /api/customers/:id - 360-degree CRM Profile (Agent/Admin)
router.get('/:id', requireRole('agent', 'admin'), CustomerController.getCustomerProfile);

// POST /api/customers - Create customer (Agent/Admin)
router.post(
  '/',
  requireRole('agent', 'admin'),
  [
    body('name').trim().notEmpty().withMessage('Customer name is required'),
    body('email').isEmail().withMessage('Valid customer email is required'),
    body('phone').optional().isString(),
    body('company').optional().isString(),
    body('notes').optional().isString(),
    validateRequest,
  ],
  CustomerController.createCustomer
);

// PUT /api/customers/:id - Update customer (Agent/Admin)
router.put(
  '/:id',
  requireRole('agent', 'admin'),
  [
    body('name').optional().trim().notEmpty(),
    body('phone').optional().isString(),
    body('company').optional().isString(),
    body('notes').optional().isString(),
    validateRequest,
  ],
  CustomerController.updateCustomer
);

export default router;
