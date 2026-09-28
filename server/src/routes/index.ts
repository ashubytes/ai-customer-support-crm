import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import ticketRoutes from './ticket.routes';
import messageRoutes from './message.routes';
import analyticsRoutes from './analytics.routes';
import userRoutes from './user.routes';
import webhookRoutes from './webhook.routes';
import dealRoutes from './deal.routes';
import { testDbConnection } from '../config/db';

const router = Router();

// Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
  const dbConnected = await testDbConnection();
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'healthy' : 'degraded',
    service: 'ai-customer-support-crm-server',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

// Mount module routes
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/tickets', ticketRoutes);
router.use('/tickets', messageRoutes); // Mounts /tickets/:id/messages
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/deals', dealRoutes);

export default router;
