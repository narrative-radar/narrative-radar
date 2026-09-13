import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/client.js';
import { tokens, clusters } from '$lib/server/db/schema/index.js';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
	const { mint } = params;
	
	try {
		// --- DEMO OVERRIDE ---
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

		// PURE READ-ONLY LOOKUP
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
				return json({
					status: 'found',
					cluster: data.cluster,
					token: data.token
				});
			} else {
				return json({ 
					status: 'processing', 
					message: 'Token detected on radar and is currently in queue. Please check back soon.' 
				});
			}
		}

		return json({ 
			status: 'not_found', 
			message: 'Not detected on radar yet. If this just launched, please check back in a few minutes.' 
		}, { status: 404 });
		
	} catch (error) {
		console.error("Lookup error:", error);
		return json({ error: "Internal server error" }, { status: 500 });
	}
}
