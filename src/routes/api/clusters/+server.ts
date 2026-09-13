import { json } from '@sveltejs/kit';
import { getActiveClusters } from '$lib/server/repositories/cluster.repository.js';
import { getRecentTokens, getTokensTrackedToday } from '$lib/server/repositories/token.repository.js';
import { db } from '$lib/server/db/client.js';
import { cronLogs } from '$lib/server/db/schema/index.js';
import { desc } from 'drizzle-orm';

export async function GET({ setHeaders }) {
	setHeaders({ 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' });
	try {
		// Mengambil daftar cluster yang 'active' atau 'cooling'
		const clusters = await getActiveClusters();
		const recentTokens = await getRecentTokens(10);
		const tokensTrackedToday = await getTokensTrackedToday();

		const latestCronRow = await db.select().from(cronLogs).orderBy(desc(cronLogs.timestamp)).limit(1);
		const latestCronLog = latestCronRow[0] || null;

		return json({ 
			clusters,
			recentTokens,
			tokensTrackedToday,
			latestCronLog,
			similarityThreshold: 0.75
		});
	} catch (error) {
		console.error('[API] /api/clusters error:', error);
		return json({ error: 'Failed to fetch clusters' }, { status: 500 });
	}
}
