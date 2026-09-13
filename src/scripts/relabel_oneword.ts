import { db } from '../lib/server/db/client.js';
import { clusters } from '../lib/server/db/schema/index.js';
import { generateClusterLabel } from '../lib/server/services/labeling.service.js';
import { getTokensByClusterId } from '../lib/server/repositories/token.repository.js';
import { setClusterLabel } from '../lib/server/repositories/cluster.repository.js';

async function run() {
    const allClusters = await db.select().from(clusters);
    
    for (const cluster of allClusters) {
        if (!cluster.label) continue;
        
        const words = cluster.label.trim().split(/\s+/);
        if (words.length > 1) continue; // Skip if already > 1 word
        
        console.log(`Relabeling 1-word cluster: "${cluster.label}"`);
        const tokens = await getTokensByClusterId(cluster.id);
        const names = tokens.map((t: any) => t.name);
        const tickers = tokens.map((t: any) => t.ticker);
        
        try {
            const newLabel = await generateClusterLabel(names, tickers);
            await setClusterLabel(cluster.id, newLabel);
            console.log(` -> New label: "${newLabel}"`);
        } catch(e) {
            console.error(` -> Error:`, e);
        }
        
        await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log("Done relabeling 1-word clusters.");
    process.exit(0);
}

run();
