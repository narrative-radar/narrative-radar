export const prerender = false;

import { json } from '@sveltejs/kit';
import { getBreakoutClusters } from '$lib/server/repositories/cluster.repository.js';

export async function GET() {
	try {
		const records = await getBreakoutClusters();
		return json({ records });
	} catch (error) {
		console.error('[API] /api/clusters/track-record error:', error);
		return json({ error: 'Failed to fetch track record' }, { status: 500 });
	}
}
