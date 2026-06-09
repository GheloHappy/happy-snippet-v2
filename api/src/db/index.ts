import { Pool } from 'pg';
import { DB_USER, DB_PASSWORD, DB_NAME, DB_SERVER, DB_PORT } from 'src/config/constants';

const pool = new Pool({
  user: DB_USER,
  host: DB_SERVER,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const executeQuery = async (text: string, params?: any[]) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  return client;
};