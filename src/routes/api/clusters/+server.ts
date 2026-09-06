import { json } from '@sveltejs/kit';
import { getActiveClusters } from '$lib/server/repositories/cluster.repository.js';
import { getRecentTokens, getTokensTrackedToday } from '$lib/server/repositories/token.repository.js';

export async function GET() {
	try {
		// Mengambil daftar cluster yang 'active' atau 'cooling'
		const clusters = await getActiveClusters();
		const recentTokens = await getRecentTokens(10);
		const tokensTrackedToday = await getTokensTrackedToday();

		return json({ 
			clusters,
			recentTokens,
			tokensTrackedToday
		});
	} catch (error) {
		console.error('[API] /api/clusters error:', error);
		return json({ error: 'Failed to fetch clusters' }, { status: 500 });
	}
}
