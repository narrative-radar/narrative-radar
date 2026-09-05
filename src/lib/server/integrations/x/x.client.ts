import { TwitterApi } from 'twitter-api-v2';
import { env } from '$env/dynamic/private';

// Instantiate client lazily so it doesn't crash if env vars are missing during build
let client: TwitterApi | null = null;

function getClient(): TwitterApi {
	if (client) return client;

	const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET } = env;

	// Only strict check at runtime
	if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_SECRET) {
		console.warn('⚠️ Missing X API credentials. Twitter Bot will run in simulation mode.');
		return new TwitterApi(''); // Returns a dummy client
	}

	client = new TwitterApi({
		appKey: X_API_KEY,
		appSecret: X_API_SECRET,
		accessToken: X_ACCESS_TOKEN,
		accessSecret: X_ACCESS_SECRET
	});

	return client;
}

export async function postTweet(text: string): Promise<boolean> {
	try {
		const { X_API_KEY } = env;
		if (!X_API_KEY) {
			console.log(`[X SIMULATION] Would have tweeted: "${text}"`);
			return true; // Simulate success
		}

		const twitter = getClient();
		await twitter.v2.tweet(text);
		console.log(`[X] Successfully tweeted: "${text}"`);
		return true;
	} catch (error) {
		console.error('[X] Failed to tweet:', error);
		return false;
	}
}
