import { db } from './src/lib/server/db/client.js';
import { tokens } from './src/lib/server/db/schema/index.js';
import { sql } from 'drizzle-orm';

async function test() {
  const recent = await db
    .select()
    .from(tokens)
    .orderBy(sql`${tokens.createdAt} DESC`)
    .limit(10);
  
  for (const t of recent) {
    console.log(`${t.ticker} - ${t.createdAt} - ID: ${t.id}`);
  }
}

test().catch(console.error);
