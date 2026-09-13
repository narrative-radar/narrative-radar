import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/client.js';
import { clusters, tokens } from '$lib/server/db/schema/index.js';
import { runClusteringAssignment } from '$lib/server/services/clustering.service.js';
import { eq } from 'drizzle-orm';
import { getActiveClusters } from '$lib/server/repositories/cluster.repository.js';

export async function GET() {
    try {
        console.log('Wiping clusters...');
        await db.update(tokens).set({ clusterId: null });
        await db.delete(clusters);

        console.log('Re-clustering all embedded tokens...');
        await db.update(tokens).set({ status: 'pending_cluster' }).where(eq(tokens.status, 'clustered'));
        
        await runClusteringAssignment();
        
        const active = await getActiveClusters();
        return json({ count: active.length, themes: active.map(c => c.label) });
    } catch(e) {
        return json({ error: String(e) });
    }
}
