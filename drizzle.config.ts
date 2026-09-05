import { defineConfig } from 'drizzle-kit';

// drizzle-kit runs as a standalone CLI tool — no SvelteKit context.
// It reads .env automatically via dotenv. Ensure DATABASE_URL is set.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not set. Check your .env file.');

export default defineConfig({
	schema: './src/lib/server/db/schema/index.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: databaseUrl
	},
	verbose: true,
	strict: true
});
