import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/client.js';
import { tokens } from '$lib/server/db/schema/index.js';
import { sql } from 'drizzle-orm';

export async function GET() {
    try {
        const total = await db.select({ count: sql<number>`COUNT(*)` }).from(tokens);
        const byStatus = await db.execute(sql`SELECT status, COUNT(*) as cnt FROM tokens GROUP BY status`);
        const noEmbedding = await db.select({ count: sql<number>`COUNT(*)` }).from(tokens).where(sql`embedding IS NULL`);
        return json({ total: total[0].count, byStatus: byStatus.rows, noEmbedding: noEmbedding[0].count });
    } catch(e) {
        return json({ error: String(e) });
    }
}
