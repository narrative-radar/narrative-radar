import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getUntweetedBreakouts, markClusterAsTweeted } from '$lib/server/repositories/cluster.repository.js';
import { postTweet } from '$lib/server/integrations/x/x.client.js';

export async function POST({ request }) {
	try {
		// Basic auth against unauthorized cron triggers
		const authHeader = request.headers.get('authorization');
		if (env.CRON_SECRET && authHeader !== `Bearer ${env.CRON_SECRET}`) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const untweeted = await getUntweetedBreakouts();
		let successCount = 0;

		for (const cluster of untweeted) {
			const label = cluster.label || cluster.label || 'Unknown Theme';
			const memberCount = cluster.memberCount;
			
			// Format the tweet as specified
			const text = `⚠️ NARRATIVE BREAKOUT: ${label} (${memberCount} tokens) - tycho.xyz/radar`;

			const success = await postTweet(text);
			if (success) {
				await markClusterAsTweeted(cluster.id);
				successCount++;
			}
		}

		return json({ 
			message: 'Cron post-update processed',
			processed: untweeted.length,
			successfulTweets: successCount
		});
	} catch (error) {
		console.error('[CRON] post-update error:', error);
		return json({ error: 'Failed to process post-update cron' }, { status: 500 });
	}
}
