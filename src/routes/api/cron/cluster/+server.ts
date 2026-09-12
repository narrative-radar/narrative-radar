import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { fetchRecentTokens } from '$lib/server/services/dex.service.js';
import { insertTokensBatch, getTokensPendingEmbed, setTokenEmbeddingsBatch } from '$lib/server/repositories/token.repository.js';
import { generateEmbeddingsBatch } from '$lib/server/services/embedding.service.js';
import { runClusteringAssignment } from '$lib/server/services/clustering.service.js';

export async function POST({ request }) {
	// Proteksi endpoint (Sesuai Brief Checklist: Endpoint cron protected)
	const authHeader = request.headers.get('Authorization');
	const cronSecret = env.CRON_SECRET;
	
	if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	console.log('⏳ [CRON] Pipeline Started...');

	try {
		// [Tahap 1] INGEST: Tarik token baru & simpan
		const newTokens = await fetchRecentTokens();
		if (newTokens.length > 0) {
			await insertTokensBatch(newTokens);
		}

		// [Tahap 2] EMBED: Buat vektor
		const pendingEmbed = await getTokensPendingEmbed();
		if (pendingEmbed.length > 0) {
			const texts = pendingEmbed.map(t => `${t.name} (${t.ticker})`);
			const vectors = await generateEmbeddingsBatch(texts);
			
			const updates = pendingEmbed.map((t, i) => ({
				id: t.id,
				embeddingJson: JSON.stringify(vectors[i])
			}));
			await setTokenEmbeddingsBatch(updates);
		}

		// [Tahap 3] ASSIGN/MERGE: Jalankan Clustering
		const clusterResult = await runClusteringAssignment();

		console.log('✅ [CRON] Pipeline Success!');
		
		return json({ 
			success: true, 
			ingested: newTokens.length,
			embedded: pendingEmbed.length,
			clustered: clusterResult.processed,
			newClusters: clusterResult.newClusters
		});

	} catch (err) {
		console.error('❌ [CRON] Pipeline error:', err);
		// Brief 4c: return graceful response even if partial failure
		return json({ error: 'Pipeline encountered an error', details: String(err) }, { status: 500 });
	}
}
