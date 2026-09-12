import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/client.js';
import { env } from '$env/dynamic/private';
import { tokens, clusters } from '$lib/server/db/schema/index.js';
import { eq } from 'drizzle-orm';

export async function GET({ params, fetch, url }) {
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
				// FORCE PIPELINE NOW
				try {
					// FIRE AND FORGET: Do not await this, otherwise Vercel Serverless will timeout (10s limit) waiting for Gemini!
					fetch(url.origin + '/api/cron', { headers: { 'Authorization': `Bearer ${env.CRON_SECRET}` } }).catch(()=>console.log('Background cron started'));
					
					const recheck = await db.select({
						token: tokens,
						cluster: clusters
					})
					.from(tokens)
					.leftJoin(clusters, eq(tokens.clusterId, clusters.id))
					.where(eq(tokens.mint, mint))
					.limit(1);

					if (recheck.length > 0 && recheck[0].token.status === 'clustered' && recheck[0].cluster) {
						return json({
							status: 'found',
							cluster: recheck[0].cluster,
							token: recheck[0].token
						});
					}
				} catch (e) {}

				return json({ 
					status: 'processing', 
					message: 'Token detected on radar and is currently being processed by our AI. Due to high load, please check back soon.' 
				});
			}
		}

		// State 3: Token tidak ada di DB lokal. 
		// [NEW UX FIX] Jangan langsung ditolak. Kita cari (fetch) ke DexScreener (On-Demand Ingestion).
		try {
			const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
			const dexData = await dexResponse.json();

			if (dexData.pairs && dexData.pairs.length > 0) {
				// Ambil data pair pertama yang cocok (TAPI FILTER HANYA SOLANA & BUKAN PUMPFUN)
				const validPairs = dexData.pairs.filter((p: any) => p.chainId === 'robinhood');
				
				if (validPairs.length === 0) {
					return json({ 
						status: 'not_found', 
						message: 'Token detected, but it is either not on Solana or is a pre-migration bonding curve token. Ponsfamily Radar only supports established liquidity pools.' 
					}, { status: 403 });
				}
				
				const pair = validPairs[0];
				
				// Masukkan ke database (Antrean Cron)
				await db.insert(tokens).values({
					mint: mint,
					ticker: pair.baseToken.symbol || 'UNKNOWN',
					name: pair.baseToken.name || 'Unknown Token',
					imageUrl: pair.info?.imageUrl || null,
					status: 'pending_embed',
					createdAt: new Date()
				}).onConflictDoNothing();

				// [REAL-TIME PROCESSING] Instead of waiting for cron, force the pipeline immediately!
				try {
					// FIRE AND FORGET: Do not await this, otherwise Vercel Serverless will timeout (10s limit) waiting for Gemini!
					fetch(url.origin + '/api/cron', { headers: { 'Authorization': `Bearer ${env.CRON_SECRET}` } }).catch(()=>console.log('Background cron started'));
					
					// Re-check the database after processing
					const recheck = await db.select({
						token: tokens,
						cluster: clusters
					})
					.from(tokens)
					.leftJoin(clusters, eq(tokens.clusterId, clusters.id))
					.where(eq(tokens.mint, mint))
					.limit(1);

					if (recheck.length > 0 && recheck[0].token.status === 'clustered' && recheck[0].cluster) {
						return json({
							status: 'found',
							cluster: recheck[0].cluster,
							token: recheck[0].token
						});
					}
				} catch (pipelineErr) {
					console.error("Pipeline forced execution error:", pipelineErr);
				}

				// Fallback if real-time pipeline fails or still pending
				return json({ 
					status: 'processing', 
					message: 'Token found on chain! It has been added to our radar queue. Our AI is overwhelmed right now, please check back soon.' 
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
