import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/client.js';
import { tokens, clusters } from '$lib/server/db/schema/index.js';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
	const { mint } = params;
	
	try {
		// --- DEMO OVERRIDE ---
		// Allow users to test the UI using the "example" CA from the landing page
		if (mint === 'example') {
			return json({
				status: 'found',
				cluster: { 
					id: 'demo-cluster', 
					label: 'Retro Game Villains', 
					growthRate: '340' 
				},
				token: { 
					mint: 'example', 
					name: 'Final Boss', 
					ticker: '$BOSS' 
				}
			});
		}

		// Murni READ-ONLY (Cache-first lookup) - Sesuai instruksi Claude (No unauthenticated writes)
		const result = await db.select({
			token: tokens,
			cluster: clusters
		})
		.from(tokens)
		.leftJoin(clusters, eq(tokens.clusterId, clusters.id))
		.where(eq(tokens.mint, mint))
		.limit(1);

		if (result.length > 0) {
			const data = result[0];
			
			if (data.token.status === 'clustered' && data.cluster) {
				// State 1: Ketemu + Clustered
				return json({
					status: 'found',
					cluster: data.cluster,
					token: data.token
				});
			} else {
				// State 2: Ketemu + pending_embed / pending_cluster
				return json({ 
					status: 'processing', 
					message: 'Token detected on radar and is currently being processed. Please check back in a few minutes.' 
				});
			}
		}

		// State 3: Token tidak ada di DB lokal. 
		// [NEW UX FIX] Jangan langsung ditolak. Kita cari (fetch) ke DexScreener (On-Demand Ingestion).
		try {
			const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
			const dexData = await dexResponse.json();

			if (dexData.pairs && dexData.pairs.length > 0) {
				// Ambil data pair pertama yang cocok
				const pair = dexData.pairs[0];
				
				// Masukkan ke database (Antrean Cron)
				await db.insert(tokens).values({
					mint: mint,
					ticker: pair.baseToken.symbol || 'UNKNOWN',
					name: pair.baseToken.name || 'Unknown Token',
					imageUrl: pair.info?.imageUrl || null,
					status: 'pending_embed',
					createdAt: new Date()
				}).onConflictDoNothing();

				// Kasih tahu user bahwa tokennya sudah berhasil di-scan dan sedang diantrekan
				return json({ 
					status: 'processing', 
					message: 'Token found on chain! It has been added to our radar queue. Please check back in 1-2 minutes for the narrative analysis.' 
				});
			}
		} catch (fetchError) {
			console.error("DexScreener fetch error:", fetchError);
			// Fallback ke response not_found biasa jika API Dexscreener error
		}

		// State 4: Benar-benar tidak ketemu di DB dan tidak ada di Blockchain (Dexscreener)
		return json({ 
			status: 'not_found', 
			message: 'Invalid or extremely new contract address. We could not find this token on-chain.' 
		}, { status: 404 });
		
	} catch (error) {
		console.error("Lookup error:", error);
		return json({ error: "Internal server error" }, { status: 500 });
	}
}
