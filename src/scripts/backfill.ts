import path from 'path';
import { fileURLToPath } from 'url';

// Run with bun so .env is auto-loaded
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { fetchRecentTokens } from '../lib/server/services/dex.service.js';
import * as tokenRepo from '../lib/server/repositories/token.repository.js';
import { generateEmbeddingsBatch } from '../lib/server/services/embedding.service.js';
import { runClusteringAssignment } from '../lib/server/services/clustering.service.js';
import * as clusterRepo from '../lib/server/repositories/cluster.repository.js';
import { db } from '../lib/server/db/client.js';
import { clusters } from '../lib/server/db/schema/index.js';
import { eq, sql } from 'drizzle-orm';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function fetchTokensFromGecko(page: number) {
    console.log(`[Backfill] Fetching page ${page} from GeckoTerminal...`);
    const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/robinhood/pools?include=base_token&page=${page}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'User-Agent': 'TychoRadar/1.0'
        },
        signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
        console.warn(`[Backfill] API returned ${response.status} on page ${page}`);
        return [];
    }

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

async function run() {
    console.log("Starting Backfill Process...");
    
    // 1. Fetch data with pagination
    const allTokens = [];
    for (let page = 1; page <= 10; page++) {
        const tokens = await fetchTokensFromGecko(page);
        if (tokens.length === 0) break;
        allTokens.push(...tokens);
        // Respect GeckoTerminal rate limit (30 req / min) -> 2 seconds pause
        await sleep(2500);
    }
    
    console.log(`Fetched ${allTokens.length} total tokens from GeckoTerminal.`);
    
    // 2. Insert as pending_embed
    if(allTokens.length > 0) {
        // Remove duplicates internally before insert
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

    // 3. Process Embedding in batches to avoid LLM rate limits
    console.log("Embedding pending tokens...");
    while (true) {
        const pendingEmbeds = await tokenRepo.getTokensPendingEmbed();
        if (pendingEmbeds.length === 0) break;
        
        const batch = pendingEmbeds.slice(0, 40);
        console.log(`Generating embeddings for ${batch.length} tokens...`);
        const vectors = await generateEmbeddingsBatch(batch.map(t => `${t.name} (${t.ticker})`));
        await tokenRepo.setTokenEmbeddingsBatch(batch.map((t, idx) => ({ id: t.id, embeddingJson: JSON.stringify(vectors[idx]) })));
        
        // Sleep to avoid LLM limits
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
    
    console.log("\n==================================");
    console.log("BACKFILL REPORT");
    console.log("==================================");
    console.log(`Tokens Processed: ${allTokens.length}`);
    console.log(`Total Clusters Formed: ${totalClusters}`);
    console.log(`Clusters >= 3 members (Labeled): ${validClusters.length}`);
    console.log("\nSample 5 Themes (Labels):");
    validClusters.slice(0, 5).forEach(c => {
        console.log(`- ${c.label} (Members: ${c.memberCount}, Growth: ${c.growthRate}%)`);
    });
    
    process.exit(0);
}

run();
