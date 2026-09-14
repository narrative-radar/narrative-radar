import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { tokens } from './src/lib/server/db/schema/index.js';
import { sql, desc } from 'drizzle-orm';

const queryClient = postgres("postgresql://postgres.tfajdcoovsipdogqdjbl:Farhan171002!@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres");
const db = drizzle(queryClient);

async function run() {
  console.log("Searching for 0xfceae4df:");
  const o = await db.execute(sql`SELECT ticker, name, mint FROM tokens WHERE mint ILIKE '%fceae4df%'`);
  console.log(o);
  
  process.exit(0);
}
run().catch(console.error);
