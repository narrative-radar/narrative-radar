import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { fetchRecentTokens } from '$lib/server/services/dex.service.js';
import { generateEmbeddingsBatch } from '$lib/server/services/embedding.service.js';
import { runClusteringAssignment } from '$lib/server/services/clustering.service.js';
import * as tokenRepo from '$lib/server/repositories/token.repository.js';
import type { NewToken } from '$lib/server/db/schema/index.js';

export async function GET({ request }) {
	// [0] SECURITY CHECK
	const authHeader = request.headers.get('authorization');
	if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
		// Log attempt to ensure it's not silent
		console.warn('[Cron] Unauthorized execution attempt');
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	console.log('[Cron] Execution started');
	const stats = {
		ingested: 0,
		embedded: 0,
		clustered: 0,
		newClusters: 0,
		errors: [] as string[]
	};

	// -------------------------------------------------------------------------
	// [1] INGEST: Fetch from DexScreener and insert to DB as pending_embed
	// -------------------------------------------------------------------------
	try {
		console.log('[Cron] Stage 1: Ingestion');
		const rawTokens = await fetchRecentTokens();
		if (rawTokens.length > 0) {
			const newTokens: NewToken[] = rawTokens.map(t => ({
				mint: t.mint,
				ticker: t.ticker,
				name: t.name,
				imageUrl: t.imageUrl,
				status: 'pending_embed',
				createdAt: t.createdAt
			}));
			// Insert batch (ignores conflicts on unique 'mint')
			await tokenRepo.insertTokensBatch(newTokens);
			stats.ingested = rawTokens.length;
		}
	} catch (e: any) {
		console.error('[Cron] Ingestion failed:', e);
		stats.errors.push(`Ingestion error: ${e.message}`);
	}

	// -------------------------------------------------------------------------
	// [2] EMBED: Fetch pending_embed from DB, get vectors, save to DB
	// -------------------------------------------------------------------------
	try {
		console.log('[Cron] Stage 2: Embedding');
		const pendingEmbeds = await tokenRepo.getTokensPendingEmbed();
		if (pendingEmbeds.length > 0) {
			// Limit to a reasonable batch size per cron run (e.g., 50) to respect API rate limits
			const batch = pendingEmbeds.slice(0, 50);
			const textsToEmbed = batch.map(t => `${t.name} (${t.ticker})`);
			
			const vectors = await generateEmbeddingsBatch(textsToEmbed);
			
			const updates = batch.map((t, idx) => ({
				id: t.id,
				embeddingJson: JSON.stringify(vectors[idx])
			}));
			
			await tokenRepo.setTokenEmbeddingsBatch(updates);
			stats.embedded = batch.length;
		}
	} catch (e: any) {
		console.error('[Cron] Embedding failed:', e);
		stats.errors.push(`Embedding error: ${e.message}`);
	}

	// -------------------------------------------------------------------------
	// [3] CLUSTER: Fetch pending_cluster, run DBSCAN, save clusters
	// -------------------------------------------------------------------------
	try {
		console.log('[Cron] Stage 3: Clustering');
		const clusterResult = await runClusteringAssignment();
		stats.clustered = clusterResult.processed;
		stats.newClusters = clusterResult.newClusters;
	} catch (e: any) {
		console.error('[Cron] Clustering failed:', e);
		stats.errors.push(`Clustering error: ${e.message}`);
	}

	console.log('[Cron] Execution finished:', stats);

	// Return 200 OK even if there were sub-stage errors, so the cron scheduler doesn't retry infinitely
	return json({
		success: true,
		timestamp: new Date().toISOString(),
		stats
	});
}
