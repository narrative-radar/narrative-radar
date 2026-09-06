import { db } from './src/lib/server/db/client.ts';
import { tokens, clusters } from './src/lib/server/db/schema/index.ts';

async function run() {
    try {
        console.log("Seeding test data...");
        // Insert a cluster
        const [cluster] = await db.insert(clusters).values({
            label: "Test Meta",
            name: "test_meta",
            memberCount: 5,
            growthRate: "25.5",
            status: "active"
        }).returning();

        // Token 1: Clustered
        await db.insert(tokens).values({
            mint: "TOKEN11111111111111111111111111111111111111",
            ticker: "$TOK1",
            name: "Token One",
            status: "clustered",
            clusterId: cluster.id,
            createdAt: new Date()
        });

        // Token 2: Pending Embed
        await db.insert(tokens).values({
            mint: "TOKEN22222222222222222222222222222222222222",
            ticker: "$TOK2",
            name: "Token Two",
            status: "pending_embed",
            createdAt: new Date()
        });

        console.log("Done seeding!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
