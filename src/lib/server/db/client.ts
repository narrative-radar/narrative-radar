import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema/index.js';
import { env } from '$env/dynamic/private';

const dbUrl = env.DATABASE_URL;
if (!dbUrl) {
	throw new Error('DATABASE_URL is not set. Check your .env file.');
}

// postgres-js client — used by drizzle-orm/postgres-js
// `max: 1` is safe for serverless/edge — prevents connection pool exhaustion.
const client = postgres(dbUrl, { prepare: false });

export const db = drizzle(client, { schema });
