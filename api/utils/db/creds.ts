import 'dotenv/config.js';
export const database: string | undefined = process.env.DB;
export const user: string | undefined = process.env.DB_USER;
export const password: string | undefined = process.env.DB_PASSWORD;
export const server: string | undefined = process.env.DB_SERVER;