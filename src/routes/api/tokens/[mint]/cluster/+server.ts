import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/client.js';
import { tokens, clusters } from '$lib/server/db/schema/index.js';
import { eq } from 'drizzle-orm';
import { insertToken } from '$lib/server/repositories/token.repository.js';

export async function GET({ params }) {
	const { mint } = params;
	
	try {
		// 1. Coba cari di database lokal dulu (Cache-first)
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
			if (!data.cluster) {
				// Token ada tapi masih dalam proses embed/cluster
				return json({ 
					status: 'queued', 
					message: 'Token ini sedang berada dalam antrean pemrosesan radar.' 
				});
			}
			// Ketemu dan sudah ada clusternya
			return json({
				status: 'found',
				cluster: data.cluster,
				token: data.token
			});
		}

		// 2. Jika tidak ada di DB, ambil metadata ringan dari DexScreener (Bukan AI, murni request ringan < 1 detik)
		const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
		if (dexRes.ok) {
			const dexData = await dexRes.json();
			if (dexData.pairs && dexData.pairs.length > 0) {
				const baseToken = dexData.pairs[0].baseToken;
				
				// Simpan ke database lokal dengan status 'pending_embed'
				await insertToken({
					mint: mint,
					ticker: baseToken.symbol.slice(0, 15),
					name: baseToken.name.slice(0, 100),
					createdAt: new Date(), // Simpan waktu saat direquest
					status: 'pending_embed'
				});

				return json({ 
					status: 'queued', 
					message: 'Token baru terdeteksi! Tycho telah menambahkannya ke antrean prioritas untuk sapuan radar berikutnya.' 
				});
			}
		}

		// Jika memang tidak valid atau belum masuk DexScreener
		return json({ 
			status: 'not_found', 
			message: 'CA tidak valid atau token belum tercatat di jaringan (terlalu baru).' 
		}, { status: 404 });
		
	} catch (error) {
		console.error("Lookup error:", error);
		return json({ error: "Internal server error" }, { status: 500 });
	}
}
