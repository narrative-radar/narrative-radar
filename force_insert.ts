import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { tokens } from './src/lib/server/db/schema/index.js';

const queryClient = postgres("postgresql://postgres.tfajdcoovsipdogqdjbl:Farhan171002!@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres");
const db = drizzle(queryClient);

async function run() {
  const mint = "0xfceae4df6961cbb3d22491b72e66c7adf415bca8";
  
  const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/robinhood/tokens/${mint}`);
  const data = await res.json();
  
  const attrs = data.data.attributes;
  const createdAt = new Date(attrs.launchpad_details?.completed_at || Date.now() - 86400000);
  
  await db.insert(tokens).values({
    mint: mint,
    ticker: attrs.symbol,
    name: attrs.name,
    imageUrl: attrs.image_url,
    createdAt: createdAt,
    status: 'pending_embed'
  }).onConflictDoNothing();
  
  console.log(`Inserted ${attrs.symbol} successfully.`);
  process.exit(0);
}
run().catch(console.error);
