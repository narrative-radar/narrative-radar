import { db } from '../lib/server/db/client.js';
import { clusters } from '../lib/server/db/schema/index.js';
import { generateClusterLabel } from '../lib/server/services/labeling.service.js';
import { getTokensByClusterId } from '../lib/server/repositories/token.repository.js';
import { setClusterLabel } from '../lib/server/repositories/cluster.repository.js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';

const sql = postgres(process.env.DATABASE_URL!);

async function run() {
    const allUnnamedClusters = await db.select().from(clusters).where(eq(clusters.label, 'unnamed cluster'));
    
    console.log(`Found ${allUnnamedClusters.length} unnamed clusters. Processing...`);
    
    for (const cluster of allUnnamedClusters) {
        const tokens = await getTokensByClusterId(cluster.id);
        const names = tokens.map((t: any) => t.name);
        const tickers = tokens.map((t: any) => t.ticker);
        
        try {
            const newLabel = await generateClusterLabel(names, tickers);
            await setClusterLabel(cluster.id, newLabel);
            console.log(`[${cluster.id}] -> New label: "${newLabel}"`);
        } catch(e) {
            console.error(`[${cluster.id}] -> Error:`, e);
        }
        
        // Wait 1s
        await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log("Done relabeling unnamed clusters.");
    process.exit(0);
}

run();
