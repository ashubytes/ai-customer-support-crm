import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes';
import { errorHandler, AppError } from './middleware/error.middleware';

const app = express();

// Security & Parsing Middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root welcome endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'AI-Powered Customer Support & CRM Platform API',
    docs: '/api/health',
    version: '1.0.0',
  });
});

// Mount main API
app.use('/api', apiRouter);

// 404 Handler
app.use('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server`, 404));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
