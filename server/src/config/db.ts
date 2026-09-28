import mysql from 'mysql2/promise';
import { config } from './env';

// Create connection pool for high-performance concurrent queries
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+00:00',
});

// Health check / connectivity validation
export const testDbConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log(`[DB] Successfully connected to MySQL database: ${config.db.name}`);
    return true;
  } catch (error: any) {
    console.error(`[DB] Database connection error: ${error.message}`);
    return false;
  }
};
