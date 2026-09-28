import { Router } from 'express';
import { body } from 'express-validator';
import { TicketController } from '../controllers/ticket.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

// POST /api/tickets - Create new ticket
router.post(
  '/',
  [
    body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('category').optional().isString(),
    body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
    body('customerId').optional().isInt(),
    validateRequest,
  ],
  TicketController.createTicket
);

// GET /api/tickets - List tickets (scoped by role)
router.get('/', TicketController.listTickets);

// GET /api/tickets/:id - Get single ticket details
router.get('/:id', TicketController.getTicketById);

// PUT /api/tickets/:id/status - Update ticket status (Agent/Admin)
router.put(
  '/:id/status',
  requireRole('agent', 'admin'),
  [
    body('status').isIn(['Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed']).withMessage('Invalid status'),
    body('notes').optional().isString(),
    validateRequest,
  ],
  TicketController.updateStatus
);

// PUT /api/tickets/:id/assign - Assign ticket to agent (Agent/Admin)
router.put(
  '/:id/assign',
  requireRole('agent', 'admin'),
  [
    body('agentId').optional({ nullable: true }),
    validateRequest,
  ],
  TicketController.assignAgent
);

// PUT /api/tickets/:id/priority - Update ticket priority (Agent/Admin)
router.put(
  '/:id/priority',
  requireRole('agent', 'admin'),
  [
    body('priority').isIn(['Low', 'Medium', 'High', 'Urgent']).withMessage('Invalid priority value'),
    validateRequest,
  ],
  TicketController.updatePriority
);

// POST /api/tickets/:id/ai-suggest - Regenerate AI response suggestion (Agent/Admin)
router.post(
  '/:id/ai-suggest',
  requireRole('agent', 'admin'),
  TicketController.regenerateAiSuggestion
);

export default router;
