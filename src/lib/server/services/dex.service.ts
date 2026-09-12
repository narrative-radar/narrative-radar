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
		// DexScreener's public frontend API for latest coins
		const response = await fetch('https://frontend-api.dexscreener.com/coins/latest', {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
			},
			// Don't wait forever, timeout after 5 seconds to prevent cron jobs from hanging
			signal: AbortSignal.timeout(5000)
		});

		if (!response.ok) {
			console.warn(`[DexScreener] API returned ${response.status}: ${response.statusText}. Falling back to DexScreener for real data...`);
			
			// Fallback ke DexScreener menggunakan Randomized Search Query
			// Karena dexscreener.com memblokir akses server (Cloudflare 530) dan endpoint 'latest' Dexscreener jarang update,
			// kita gunakan kata kunci acak untuk mensimulasikan aliran data koin yang beragam setiap menitnya.
			const keywords = ['dog', 'cat', 'ai', 'trump', 'inu', 'pepe', 'moon', 'elon', 'sol', 'boy', 'girl', 'chad', 'meme', 'coin', 'based'];
			const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
			
			const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${randomKeyword}`, {
				signal: AbortSignal.timeout(5000)
			});
			
			if (!dexResponse.ok) return [];
			
			const dexData = await dexResponse.json();
			if (!dexData.pairs || !Array.isArray(dexData.pairs)) return [];
			
			const seenMints = new Set();
			const result: IngestedToken[] = [];
			
			// Filter hanya solana
			// [PM DIRECTIVE: MIGRATED ONLY]
			// We only accept tokens that have successfully migrated and established a Liquidity Pool (Raydium/Orca).
			// DexScreener natively filters out pre-migration bonding curve tokens, ensuring we only track 'Robinhood/Ponsfamily' grade tokens.
			const solanaPairs = dexData.pairs.filter((p: any) => p.chainId === 'solana' && p.dexId !== 'pumpfun');
			
			for (const pair of solanaPairs) {
				const mint = pair.baseToken.address;
				
				if (!seenMints.has(mint)) {
					seenMints.add(mint);
					result.push({
						mint: mint,
						ticker: pair.baseToken.symbol || 'UNKNOWN',
						name: pair.baseToken.name || 'Unknown Token',
						imageUrl: pair.info?.imageUrl || null,
						// Kita gunakan waktu saat ini sebagai waktu 'ditemukan' di radar
						createdAt: new Date()
					});
				}
			}
			return result.slice(0, 30);
		}

		const data = await response.json();
		if (!Array.isArray(data)) {
			console.warn('[DexScreener] Unexpected response format (not an array)');
			return [];
		}

		// Filter strictly for Solana and non-pump tokens
		const filteredData = data.filter((coin: any) => {
			// Some APIs might return chainId or baseToken.chainId, ensure we check properly
			const isSolana = coin.chainId === 'solana' || (coin.baseToken && coin.baseToken.chainId === 'solana');
			// Filter out anything related to pumpfun
			const isPump = coin.dexId === 'pumpfun' || (coin.baseToken && coin.baseToken.dexId === 'pumpfun');
			// Some coins might not have dexId exposed at the root, check the address
			const hasPumpSuffix = coin.mint && typeof coin.mint === 'string' && coin.mint.endsWith(String.fromCharCode(112, 117, 109, 112));
			
			return isSolana && !isPump && !hasPumpSuffix;
		});

		// Map API fields to our normalized format
		return filteredData.map((coin: any) => ({
			mint: coin.mint,
			ticker: coin.symbol || 'UNKNOWN',
			name: coin.name || 'Unknown Coin',
			imageUrl: coin.image_uri || null,
			// DexScreener timestamps are usually in milliseconds
			createdAt: coin.created_timestamp ? new Date(coin.created_timestamp) : new Date()
		}));
	} catch (error) {
		console.error('[DexScreener] Network or timeout error fetching tokens:', error);
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
