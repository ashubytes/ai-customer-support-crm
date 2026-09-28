import app from './app';
import { config } from './config/env';
import { testDbConnection } from './config/db';

async function startServer() {
  console.log(`[SERVER] Initializing Node.js Express server on port ${config.port}...`);

  // Check database connectivity
  const isDbReady = await testDbConnection();
  if (!isDbReady) {
    console.warn('[SERVER] Warning: Initial database check failed. Please verify MySQL service is running.');
  }

  const server = app.listen(config.port, () => {
    console.log(`[SERVER] Server listening on http://localhost:${config.port}`);
    console.log(`[SERVER] Environment: ${config.nodeEnv}`);
    console.log(`[SERVER] API Health: http://localhost:${config.port}/api/health`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('[SERVER] Shutting down gracefully...');
    server.close(() => {
      console.log('[SERVER] Closed out remaining connections.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
