import { db } from './src/lib/server/db/index.js';
import { clusters } from './src/lib/server/db/schema/index.js';

async function main() {
    try {
        console.log("Attempting insert...");
        const [row] = await db.insert(clusters).values({
            centroid: "[]",
            memberCount: 1,
            growthRate: '0',
            peakMemberCount: 1,
            peakGrowthRate: '0',
            status: 'active',
            sparklinePoints: [1],
            everReachedBreakout: false,
        }).returning();
        console.log("Success:", row);
    } catch (err) {
        console.error("Insert failed:", err);
    }
    process.exit(0);
}
main();
