import { json } from '@sveltejs/kit';
import { getActiveClusters } from '$lib/server/repositories/cluster.repository.js';

export async function GET() {
	try {
		// Mengambil daftar cluster yang 'active' atau 'cooling'
		const clusters = await getActiveClusters();
		return json({ clusters });
	} catch (error) {
		console.error('[API] /api/clusters error:', error);
		return json({ error: 'Failed to fetch clusters' }, { status: 500 });
	}
}
