import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/client.js';
import { clusters } from '$lib/server/db/schema/index.js';
import { generateClusterLabel } from '$lib/server/services/labeling.service.js';
import { getTokensByClusterId } from '$lib/server/repositories/token.repository.js';
import { setClusterLabel } from '$lib/server/repositories/cluster.repository.js';
import { eq } from 'drizzle-orm';

export async function GET() {
    const results = [];
    const allUnnamedClusters = await db.select().from(clusters).where(eq(clusters.label, 'unnamed cluster'));
    
    for (const cluster of allUnnamedClusters) {
        const tokens = await getTokensByClusterId(cluster.id);
        const names = tokens.map((t: any) => t.name);
        const tickers = tokens.map((t: any) => t.ticker);
        
        try {
            const newLabel = await generateClusterLabel(names, tickers);
            await setClusterLabel(cluster.id, newLabel);
            results.push({ id: cluster.id, newLabel });
        } catch(e) {
            console.error(e);
        }
        
        await new Promise(r => setTimeout(r, 1000));
    }
    
    return json({ count: results.length, results });
}
