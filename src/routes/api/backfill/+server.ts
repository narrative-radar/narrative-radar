import { json } from '@sveltejs/kit';
import { generateEmbeddingsBatch } from '$lib/server/services/embedding.service.js';
import { runClusteringAssignment } from '$lib/server/services/clustering.service.js';
import * as tokenRepo from '$lib/server/repositories/token.repository.js';
import { db } from '$lib/server/db/client.js';
import { clusters } from '$lib/server/db/schema/index.js';
import { sql } from 'drizzle-orm';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchTokensFromGecko(page: number) {
    const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/robinhood/pools?include=base_token&page=${page}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'User-Agent': 'TychoRadar/1.0'
        },
        signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.data || !data.included) return [];

    const tokensMap = new Map();
    for (const inc of data.included) {
        if (inc.type === 'token' && inc.attributes) {
            tokensMap.set(inc.attributes.address.toLowerCase(), inc.attributes);
        }
    }

    const result = [];
    const seenMints = new Set();
    
    for (const pool of data.data) {
        const relationships = pool.relationships;
        if (!relationships?.base_token?.data?.id) continue;
        
        const baseTokenIdStr = relationships.base_token.data.id;
        const addressMatch = baseTokenIdStr.split('_');
        if (addressMatch.length !== 2) continue;
        
        const mint = addressMatch[1].toLowerCase();
        const tokenData = tokensMap.get(mint);

        if (tokenData && !seenMints.has(mint)) {
            seenMints.add(mint);
            result.push({
                mint: mint,
                ticker: tokenData.symbol || 'UNKNOWN',
                name: tokenData.name || 'Unknown Token',
                imageUrl: tokenData.image_url || null,
                createdAt: pool.attributes.pool_created_at ? new Date(pool.attributes.pool_created_at) : new Date()
            });
        }
    }
    return result;
}

export async function GET() {
    try {
        console.log("Starting Backfill Process...");
        
        // 1. Fetch data with pagination
        const allTokens = [];
        for (let page = 11; page <= 30; page++) {
            console.log(`[Backfill] Fetching page ${page} from GeckoTerminal...`);
            const tokens = await fetchTokensFromGecko(page);
            if (tokens.length === 0) break;
            allTokens.push(...tokens);
            // Respect GeckoTerminal rate limit (30 req / min) -> 2.5 seconds pause
            await sleep(2500);
        }
        
        console.log(`Fetched ${allTokens.length} total tokens from GeckoTerminal.`);
        
        // 2. Insert as pending_embed
        if(allTokens.length > 0) {
            const uniqueTokens = Array.from(new Map(allTokens.map(item => [item.mint, item])).values());
            
            const chunks = [];
            for (let i = 0; i < uniqueTokens.length; i += 50) {
                chunks.push(uniqueTokens.slice(i, i + 50));
            }
            
            for (const chunk of chunks) {
                await tokenRepo.insertTokensBatch(chunk.map(t => ({
                    mint: t.mint, ticker: t.ticker, name: t.name, imageUrl: t.imageUrl, status: 'pending_embed', createdAt: t.createdAt
                })));
            }
        }

        // 3. Process Embedding in batches
        console.log("Embedding pending tokens...");
        while (true) {
            const pendingEmbeds = await tokenRepo.getTokensPendingEmbed();
            if (pendingEmbeds.length === 0) break;
            
            const batch = pendingEmbeds.slice(0, 40);
            console.log(`Generating embeddings for ${batch.length} tokens...`);
            const vectors = await generateEmbeddingsBatch(batch.map(t => `${t.name} (${t.ticker})`));
            await tokenRepo.setTokenEmbeddingsBatch(batch.map((t, idx) => ({ id: t.id, embeddingJson: JSON.stringify(vectors[idx]) })));
            
            await sleep(1000);
        }

        // 4. Run Clustering Pipeline
        console.log("Running clustering (this will hit the LLM for labels iteratively)...");
        const clusterResult = await runClusteringAssignment();
        console.log("Cluster result:", clusterResult);
        
        // 5. Final Report
        const totalClustersRow = await db.select({ count: sql<number>`COUNT(*)::int` }).from(clusters);
        const totalClusters = totalClustersRow[0]?.count || 0;
        
        const validClusters = await db.select().from(clusters).where(sql`${clusters.memberCount} >= 3`);
        
        const report = {
            tokensProcessed: allTokens.length,
            totalClustersFormed: totalClusters,
            labeledClustersCount: validClusters.length,
            sampleThemes: validClusters.slice(0, 5).map(c => ({
                label: c.label,
                members: c.memberCount,
                growth: c.growthRate
            }))
        };
        
        console.log("BACKFILL REPORT:", report);
        
        return json(report);
    } catch (e: any) {
        console.error("Backfill failed:", e);
        return json({ error: e.message }, { status: 500 });
    }
}
