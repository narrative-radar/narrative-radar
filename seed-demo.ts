import { db } from './src/lib/server/db/index.js';
import { clusters, tokens } from './src/lib/server/db/schema/index.js';

async function seed() {
    console.log("Seeding awesome demo data for Twitter...");

    // 1. Create a historical cluster for the Track Record
    const histCluster = await db.insert(clusters).values({
        id: crypto.randomUUID(),
        theme: 'TRUMP ELECTION DEBATE',
        summary: 'Tokens related to the upcoming presidential debate and Trump quotes.',
        status: 'historical',
        memberCount: 12,
        growthPercent: 1250.50,
        sparklinePoints: [10, 20, 50, 100, 300, 800, 1250],
        centroidJson: JSON.stringify(new Array(3072).fill(0.01)),
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000 * 1)
    }).returning({ id: clusters.id });

    // 2. Create a live BREAKOUT cluster for the Radar
    const breakoutCluster = await db.insert(clusters).values({
        id: crypto.randomUUID(),
        theme: 'AI AGENTS & BOTS',
        summary: 'Tokens mimicking autonomous AI agents trading or chatting on-chain.',
        status: 'breakout',
        memberCount: 8,
        growthPercent: 450.25,
        sparklinePoints: [0, 5, 20, 100, 250, 450],
        centroidJson: JSON.stringify(new Array(3072).fill(0.02)),
        createdAt: new Date(Date.now() - 3600000),
        updatedAt: new Date()
    }).returning({ id: clusters.id });

    // Insert some tokens for the breakout cluster
    await db.insert(tokens).values([
        {
            mint: 'AiBot1111111111111111111111111111111111111',
            ticker: '$AIDEV',
            name: 'AI Developer Bot',
            clusterId: breakoutCluster[0].id,
            embeddingJson: JSON.stringify(new Array(3072).fill(0.02)),
            createdAt: new Date()
        },
        {
            mint: 'AiBot2222222222222222222222222222222222222',
            ticker: '$GPTTRADER',
            name: 'GPT On-Chain Trader',
            clusterId: breakoutCluster[0].id,
            embeddingJson: JSON.stringify(new Array(3072).fill(0.02)),
            createdAt: new Date()
        }
    ]);

    console.log("✅ Demo data seeded! Check /radar and /radar/track-record");
    process.exit(0);
}
seed();
