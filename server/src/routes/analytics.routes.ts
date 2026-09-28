import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

// GET /api/analytics/overview - Overall KPIs, distributions, and agent performance (Agent/Admin)
router.get('/overview', requireRole('agent', 'admin'), AnalyticsController.getOverview);

export default router;
