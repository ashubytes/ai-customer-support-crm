import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/', WebhookController.list);
router.post('/', WebhookController.create);
router.put('/:id', WebhookController.update);
router.patch('/:id/toggle', WebhookController.toggle);
router.delete('/:id', WebhookController.remove);
router.get('/:id/deliveries', WebhookController.deliveries);

export default router;
