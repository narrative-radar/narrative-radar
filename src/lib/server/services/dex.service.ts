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
		// Fetch from both 'new_pools' and 'trending_pools' to ensure we capture
		// both newly launched tokens AND tokens that have migrated/gained high volume.
		const [newPoolsRes, trendingPoolsRes] = await Promise.all([
			fetch('https://api.geckoterminal.com/api/v2/networks/robinhood/new_pools?include=base_token', {
				method: 'GET',
				headers: { Accept: 'application/json', 'User-Agent': 'TychoRadar/1.0' },
				signal: AbortSignal.timeout(8000)
			}).catch(() => null),
			fetch('https://api.geckoterminal.com/api/v2/networks/robinhood/trending_pools?include=base_token', {
				method: 'GET',
				headers: { Accept: 'application/json', 'User-Agent': 'TychoRadar/1.0' },
				signal: AbortSignal.timeout(8000)
			}).catch(() => null)
		]);

		const processResponse = async (res: Response | null) => {
			if (!res || !res.ok) return { data: [], included: [] };
			const json = await res.json().catch(() => null);
			if (!json || !json.data || !json.included) return { data: [], included: [] };
			return json;
		};

		const newPoolsData = await processResponse(newPoolsRes);
		const trendingPoolsData = await processResponse(trendingPoolsRes);

		const combinedData = [...trendingPoolsData.data, ...newPoolsData.data];
		const combinedIncluded = [...trendingPoolsData.included, ...newPoolsData.included];

		if (combinedData.length === 0) {
			console.warn('[GeckoTerminal] No data found from both endpoints');
			return [];
		}

		// Extrak base_token dari array 'included'
		const tokensMap = new Map();
		for (const inc of combinedIncluded) {
			if (inc.type === 'token' && inc.attributes) {
				tokensMap.set(inc.attributes.address.toLowerCase(), inc.attributes);
			}
		}

		const seenMints = new Set();
		const result: IngestedToken[] = [];

		for (const pool of combinedData) {
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

		// Increase slice limit slightly since we are combining two sources
		return result.slice(0, 50);
	} catch (error) {
		console.error('[GeckoTerminal] Network or timeout error fetching tokens:', error);
		return [];
	}
}

