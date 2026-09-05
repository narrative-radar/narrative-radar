import { env } from '$env/dynamic/private';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Service to generate vector embeddings for text.
 * Switched to Google Gemini (text-embedding-004) for generous free tier.
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
	if (texts.length === 0) return [];

	const apiKey = env.GEMINI_API_KEY;
	if (!apiKey) {
		console.warn('[Embedding] GEMINI_API_KEY is not set. Generating zero-vectors for local testing.');
		return texts.map(() => new Array(3072).fill(0.01)); // Gemini-embedding-2 vectors are size 3072
	}

	try {
		const genAI = new GoogleGenerativeAI(apiKey);
		// Using gemini-embedding-2 because it's available in the user's project
		const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });

		// Gemini API (as of current SDK) doesn't have a direct batchEmbed method that takes an array of strings in one call cleanly,
		// but we can Promise.all it. For high volume, Google recommends batchEmbedContents.
		const requests = texts.map(t => ({
			content: { role: 'user', parts: [{ text: t }] }
		}));

		const result = await model.batchEmbedContents({
			requests
		});

		// Extract the 768-dimensional float arrays
		const vectors = result.embeddings.map(e => e.values);
		return vectors;

	} catch (error) {
		console.error('[Embedding] Error calling Gemini AI:', error);
		throw error;
	}
}

/**
 * Helper to embed a single text string.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
	const results = await generateEmbeddingsBatch([text]);
	return results[0];
}
