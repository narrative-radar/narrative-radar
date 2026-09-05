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
 * Service to fetch newly launched tokens from Pump.fun.
 * Uses the public frontend API. If the API is down or rate-limited,
 * it returns a graceful fallback (empty array or mock data) as required by brief 4c.
 */
export async function fetchRecentTokens(): Promise<IngestedToken[]> {
	try {
		// Pump.fun's public frontend API for latest coins
		const response = await fetch('https://frontend-api.pump.fun/coins/latest', {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
			},
			// Don't wait forever, timeout after 5 seconds to prevent cron jobs from hanging
			signal: AbortSignal.timeout(5000)
		});

		if (!response.ok) {
			console.warn(`[PumpFun] API returned ${response.status}: ${response.statusText}. Falling back to DexScreener for real data...`);
			
			// Fallback ke DexScreener (API Publik tanpa halangan Cloudflare) agar tetap dapat data token asli
			
			// 1. Dapatkan daftar alamat token yang BENAR-BENAR TERBARU rilis detik ini
			const profilesRes = await fetch('https://api.dexscreener.com/token-profiles/latest/v1', { signal: AbortSignal.timeout(5000) });
			if (!profilesRes.ok) return [];
			const profilesData = await profilesRes.json();
			if (!Array.isArray(profilesData)) return [];
			
			// 2. Ambil 30 address terbaru
			const addresses = profilesData.slice(0, 30).map((p: any) => p.tokenAddress).filter(Boolean);
			if (addresses.length === 0) return [];

			// 3. Batch request untuk mendapatkan Nama Asli & Simbol token tersebut
			const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addresses.join(',')}`, {
				signal: AbortSignal.timeout(5000)
			});
			if (!dexResponse.ok) return [];
			
			const dexData = await dexResponse.json();
			if (!dexData.pairs || !Array.isArray(dexData.pairs)) return [];
			
			const seenMints = new Set();
			const result: IngestedToken[] = [];
			
			for (const pair of dexData.pairs) {
				const mint = pair.baseToken.address;
				if (!seenMints.has(mint)) {
					seenMints.add(mint);
					result.push({
						mint: mint,
						ticker: pair.baseToken.symbol || 'UNKNOWN',
						name: pair.baseToken.name || 'Unknown Token',
						imageUrl: pair.info?.imageUrl || null,
						createdAt: new Date()
					});
				}
			}
			return result.slice(0, 30);
		}

		const data = await response.json();
		if (!Array.isArray(data)) {
			console.warn('[PumpFun] Unexpected response format (not an array)');
			return [];
		}

		// Map API fields to our normalized format
		return data.map((coin: any) => ({
			mint: coin.mint,
			ticker: coin.symbol || 'UNKNOWN',
			name: coin.name || 'Unknown Coin',
			imageUrl: coin.image_uri || null,
			// Pump.fun timestamps are usually in milliseconds
			createdAt: coin.created_timestamp ? new Date(coin.created_timestamp) : new Date()
		}));
	} catch (error) {
		console.error('[PumpFun] Network or timeout error fetching tokens:', error);
		// Brief 4c: "Cron run tetap selesai tanpa error fatal"
		return [];
	}
}

/**
 * Standalone mock for testing if the real API blocks us.
 */
export function getMockRecentTokens(): IngestedToken[] {
	return [
		{
			mint: crypto.randomUUID().replace(/-/g, '') + 'mock1',
			ticker: '$RETRO',
			name: 'Retro Game Villain',
			imageUrl: null,
			createdAt: new Date()
		},
		{
			mint: crypto.randomUUID().replace(/-/g, '') + 'mock2',
			ticker: '$AI',
			name: 'AI Poker Bot',
			imageUrl: null,
			createdAt: new Date()
		}
	];
}
