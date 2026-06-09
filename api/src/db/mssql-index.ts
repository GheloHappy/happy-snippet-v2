import { connect, type ConnectionPool, type IResult } from 'mssql';
import { DB_NAME, DB_USER, DB_PASSWORD, DB_SERVER, DB_PORT } from 'src/config/constants';

const config = {
  user: DB_USER,
  password: DB_PASSWORD,
  server: DB_SERVER,
  database: DB_NAME,
  port: DB_PORT,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 20,
    min: 0,
    idleTimeoutMillis: 30000,
  },
} satisfies Parameters<typeof connect>[0];

let pool: ConnectionPool | null = null;

export const getPool = async (): Promise<ConnectionPool> => {
  if (!pool) {
    pool = await connect(config);
  }
  return pool;
};

export const executeQuery = async <T = any>(
  query: string,
  params?: { name: string; type: any; value: any }[]
): Promise<IResult<T>> => {
  try {
    const connection = await getPool();
    const request = connection.request();
    if (params) {
      for (const param of params) {
        request.input(param.name, param.type, param.value);
      }
    }
    return await request.query<T>(query);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};
