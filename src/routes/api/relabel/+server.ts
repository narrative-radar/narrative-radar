import { json } from "@sveltejs/kit";
import { db } from "$lib/server/db/client.js";
import { clusters } from "$lib/server/db/schema/index.js";
import { generateClusterLabel } from "$lib/server/services/labeling.service.js";
import { getTokensByClusterId } from "$lib/server/repositories/token.repository.js";
import { setClusterLabel } from "$lib/server/repositories/cluster.repository.js";

export async function GET() {
    const results: { id: string; oldLabel: string; newLabel: string }[] = [];
    const allClusters = await db.select().from(clusters);
    
    for (const cluster of allClusters) {
        const isFallback = !cluster.label || cluster.label.endsWith(" tokens") || cluster.label.includes("...");
        if (!isFallback) continue;
        
        const tokens = await getTokensByClusterId(cluster.id);
        const names = tokens.map((t: any) => t.name);
        const tickers = tokens.map((t: any) => t.ticker);
        const uniqueNames = new Set(names.map((n: string) => n.toLowerCase().replace(/\s+/g, "")));
        
        if (uniqueNames.size < 3) continue;
        
        try {
            const newLabel = await generateClusterLabel(names, tickers);
            await setClusterLabel(cluster.id, newLabel);
            results.push({ id: cluster.id, oldLabel: cluster.label || "", newLabel });
        } catch(e) {
            results.push({ id: cluster.id, oldLabel: cluster.label || "", newLabel: "ERROR: " + String(e) });
        }
        
        await new Promise(r => setTimeout(r, 500));
    }
    
    return json({ relabeled: results.length, results });
}
