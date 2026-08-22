import { Pool } from 'pg';
import type { QueryResult, QueryResultRow } from 'pg';
import { dbConfig } from './config';

const pool = new Pool(dbConfig);

pool.on('connect', () => {
  console.log('Connected to Neon PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

/**
 * Run a parameterized query against the shared pool.
 * The generic `R` lets callers type the shape of the returned rows.
 */
export async function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<R>> {
  return pool.query<R>(text, params);
}

export { pool };

export default { query, pool };
