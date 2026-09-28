import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

async function initDatabase() {
  console.log('[DB-INIT] Starting MySQL database initialization...');

  // Connect to MySQL server without selecting database first
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });

  try {
    console.log(`[DB-INIT] Connected to MySQL host ${config.db.host}:${config.db.port}`);
    
    // Read schema.sql
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('[DB-INIT] Executing schema DDL...');
    
    await connection.query(schemaSql);
    console.log('[DB-INIT] Database and tables initialized successfully!');
  } catch (error: any) {
    console.error('[DB-INIT] Error initializing database:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDatabase();
