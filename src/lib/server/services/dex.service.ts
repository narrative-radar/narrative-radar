/**
 * Normalized token interface returned by our ingest service.
 */
export interface IngestedToken {
	mint: string;
	ticker: string;
	name: string;
	imageUrl: string | null;
	createdAt: Date;
}

/**
 * Service to fetch newly launched tokens from DexScreener.
 * Uses the public frontend API. If the API is down or rate-limited,
 * it returns a graceful fallback (empty array or mock data) as required by brief 4c.
 */
export async function fetchRecentTokens(): Promise<IngestedToken[]> {
	try {
		// PENGGUNAAN GECKOTERMINAL:
		// GeckoTerminal punya endpoint khusus 'new_pools' per network (termasuk 'robinhood').
		// Ini memecahkan masalah DexScreener frontend-api yang didominasi Solana/Ethereum.
		const response = await fetch('https://api.geckoterminal.com/api/v2/networks/robinhood/new_pools?include=base_token', {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'User-Agent': 'TychoRadar/1.0'
			},
			signal: AbortSignal.timeout(8000)
		});

		if (!response.ok) {
			console.warn(`[GeckoTerminal] API returned ${response.status}: ${response.statusText}`);
			return [];
		}

		const data = await response.json();
		if (!data.data || !data.included) {
			console.warn('[GeckoTerminal] Unexpected response format (missing data/included arrays)');
			return [];
		}

		// Extrak base_token dari array 'included'
		const tokensMap = new Map();
		for (const inc of data.included) {
			if (inc.type === 'token' && inc.attributes) {
				tokensMap.set(inc.attributes.address.toLowerCase(), inc.attributes);
			}
		}

		const seenMints = new Set();
		const result: IngestedToken[] = [];

		for (const pool of data.data) {
			const relationships = pool.relationships;
			if (!relationships?.base_token?.data?.id) continue;
			
			// id format: "robinhood_0x..."
			const baseTokenIdStr = relationships.base_token.data.id;
			const addressMatch = baseTokenIdStr.split('_');
			if (addressMatch.length !== 2) continue;
			
			const mint = addressMatch[1].toLowerCase();
			const tokenData = tokensMap.get(mint);

			if (tokenData && !seenMints.has(mint)) {
				seenMints.add(mint);
				result.push({
					mint: mint,
					ticker: tokenData.symbol || 'UNKNOWN',
					name: tokenData.name || 'Unknown Token',
					imageUrl: tokenData.image_url || null,
					createdAt: pool.attributes.pool_created_at ? new Date(pool.attributes.pool_created_at) : new Date()
				});
			}
		}

		return result.slice(0, 30);
	} catch (error) {
		console.error('[GeckoTerminal] Network or timeout error fetching tokens:', error);
		return [];
	}
}

