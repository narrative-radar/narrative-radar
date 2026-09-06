import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/client.js';
import { tokens, clusters } from '$lib/server/db/schema/index.js';
import { eq } from 'drizzle-orm';

export async function GET({ params }) {
	const { mint } = params;
	
	try {
		// Single query to lookup token and its assigned cluster
		const result = await db.select({
			token: tokens,
			cluster: clusters
		})
		.from(tokens)
		.leftJoin(clusters, eq(tokens.cluster_id, clusters.id))
		.where(eq(tokens.mint, mint))
		.limit(1);

		if (result.length === 0) {
			// Token tak ada sama sekali
			return json({ status: 'not_found', message: 'Token belum masuk radar. Kemungkinan terlalu baru.' }, { status: 404 });
		}

		const data = result[0];
		if (!data.cluster) {
			// Token ada tapi belum ke-assign cluster (masih pending_embed atau pending_cluster)
			return json({ status: 'not_clustered', message: 'Token sedang diproses dan belum masuk ke tema naratif apapun.' }, { status: 404 });
		}

		// Found!
		return json({
			status: 'found',
			cluster: data.cluster,
			token: data.token
		});
		
	} catch (error) {
		console.error("Lookup error:", error);
		return json({ error: "Internal server error" }, { status: 500 });
	}
}
