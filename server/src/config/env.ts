import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'customer_support_crm',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_jwt_key_crm_development_2025_secure',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000',
};
