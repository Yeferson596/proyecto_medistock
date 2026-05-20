import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const pool = new Pool({
  connectionString,
  max: 10
});

export async function query<T = any>(text: string, params?: unknown[]) {
  return pool.query<T>(text, params);
}
