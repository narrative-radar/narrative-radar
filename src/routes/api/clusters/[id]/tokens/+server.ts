import { json } from '@sveltejs/kit';
import { getTokensByClusterId } from '$lib/server/repositories/token.repository.js';

export async function GET({ params }) {
	const { id } = params;

	try {
		const tokens = await getTokensByClusterId(id);
		return json({ tokens });
	} catch (error) {
		console.error(`[API] /api/clusters/${id}/tokens error:`, error);
		return json({ error: 'Failed to fetch tokens' }, { status: 500 });
	}
}
