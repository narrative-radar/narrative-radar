import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/client.js';
import { tokens, clusters } from '$lib/server/db/schema/index.js';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
	const { mint } = params;
	
	try {
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

		// State 3: Benar-benar tidak ketemu
		return json({ 
			status: 'not_found', 
			message: 'Not detected on radar yet. If this just launched, please check back in a few minutes.' 
		}, { status: 404 });
		
	} catch (error) {
		console.error("Lookup error:", error);
		return json({ error: "Internal server error" }, { status: 500 });
	}
}
