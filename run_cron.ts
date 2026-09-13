import { fetchRecentTokens } from './src/lib/server/services/dex.service.js';
import * as tokenRepo from './src/lib/server/repositories/token.repository.js';
import { generateEmbeddingsBatch } from './src/lib/server/services/embedding.service.js';
import { runClusteringAssignment } from './src/lib/server/services/clustering.service.js';

async function run() {
    console.log("Fetching recent tokens from GeckoTerminal...");
    const tokens = await fetchRecentTokens();
    console.log("Tokens fetched:", tokens.length);
    if(tokens.length > 0) {
        await tokenRepo.insertTokensBatch(tokens.map(t => ({
            mint: t.mint, ticker: t.ticker, name: t.name, imageUrl: t.imageUrl, status: 'pending_embed', createdAt: t.createdAt
        })));
    }

    console.log("Embedding pending tokens...");
    const pendingEmbeds = await tokenRepo.getTokensPendingEmbed();
    console.log("Pending embeds:", pendingEmbeds.length);
    if(pendingEmbeds.length > 0) {
        const batch = pendingEmbeds.slice(0, 50);
        const vectors = await generateEmbeddingsBatch(batch.map(t => `${t.name} (${t.ticker})`));
        await tokenRepo.setTokenEmbeddingsBatch(batch.map((t, idx) => ({ id: t.id, embeddingJson: JSON.stringify(vectors[idx]) })));
    }

    console.log("Running clustering...");
    const clusterResult = await runClusteringAssignment();
    console.log("Cluster result:", clusterResult);
    
    process.exit(0);
}
run();
