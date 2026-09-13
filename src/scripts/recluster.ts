import { db } from '../lib/server/db/client.js';
import { clusters, tokens } from '../lib/server/db/schema/index.js';
import { runClusteringAssignment } from '../lib/server/services/clustering.service.js';
import { eq } from 'drizzle-orm';

async function run() {
    console.log('Wiping clusters...');
    await db.update(tokens).set({ clusterId: null });
    await db.delete(clusters);

    console.log('Re-clustering all embedded tokens...');
    const allTokens = await db.select().from(tokens).where(eq(tokens.status, 'clustered'));
    // reset their status so they get picked up
    await db.update(tokens).set({ status: 'embedded' }).where(eq(tokens.status, 'clustered'));
    
    await runClusteringAssignment();
    
    console.log('Re-clustering done.');
    process.exit(0);
}
run();
