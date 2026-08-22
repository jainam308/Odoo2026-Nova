import dotenv from 'dotenv';
import path from 'path';
import type { PoolConfig } from 'pg';

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    `DATABASE_URL is not defined. Copy .env.example to .env and set it (loaded from ${envPath}).`
  );
}

const isProduction = process.env.NODE_ENV === 'production';
const useSSL = isProduction || (DATABASE_URL ? DATABASE_URL.includes('neon.tech') || DATABASE_URL.includes('sslmode=require') : true);

export const dbConfig: PoolConfig = {
  connectionString: DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
};
