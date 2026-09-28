import { Router } from 'express';
import { body } from 'express-validator';
import { MessageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);

// GET /api/tickets/:id/messages - Get ticket messages
router.get('/:id/messages', MessageController.getTicketMessages);

// POST /api/tickets/:id/messages - Post new message or note
router.post(
  '/:id/messages',
  [
    body('message').trim().notEmpty().withMessage('Message text is required'),
    body('isInternal').optional().isBoolean(),
    validateRequest,
  ],
  MessageController.createTicketMessage
);

export default router;
