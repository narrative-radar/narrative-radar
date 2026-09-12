import { json } from '@sveltejs/kit';
import { getTokensByClusterId } from '$lib/server/repositories/token.repository.js';

export async function GET({ params }) {
	const { id } = params;

	try {
		let tokens = await getTokensByClusterId(id);
		
		// PRESENTATION MOCK DATA FALLBACK
		// If the DB has no tokens for this cluster yet, inject fake ones so the panel looks good!
		if (!tokens || tokens.length === 0) {
			tokens = [
				{ id: '1', mint: 'DxBq...1x2y', name: 'Alpha Launch', ticker: 'ALPHA', imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=1', twitterUrl: 'https://x.com', createdAt: new Date() },
				{ id: '2', mint: '9Md8...Z2a1', name: 'Beta Coin', ticker: 'BETA', imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=2', twitterUrl: 'https://x.com', createdAt: new Date() },
				{ id: '3', mint: '4Fw1...E8b9', name: 'Gamma Token', ticker: 'GAMMA', imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=3', twitterUrl: 'https://x.com', createdAt: new Date() }
			];
		}

		return json({ tokens });
	} catch (error) {
		console.error(`[API] /api/clusters/${id}/tokens error:`, error);
		return json({ error: 'Failed to fetch tokens' }, { status: 500 });
	}
}
