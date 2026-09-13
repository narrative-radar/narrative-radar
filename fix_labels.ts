import postgres from 'postgres';
import { generateClusterLabel } from './src/lib/server/services/labeling.service.js';

const sql = postgres(process.env.DATABASE_URL!);

async function run() {
    const clusters = await sql`SELECT id FROM clusters WHERE member_count >= 3 AND label IS NULL`;
    for(const c of clusters) {
        const tokens = await sql`SELECT name, ticker FROM tokens WHERE cluster_id = ${c.id}`;
        const names = tokens.map(t => t.name);
        const tickers = tokens.map(t => t.ticker);
        const label = await generateClusterLabel(names, tickers);
        console.log("Generated:", label);
        await sql`UPDATE clusters SET label = ${label} WHERE id = ${c.id}`;
    }
    process.exit(0);
}
run();
