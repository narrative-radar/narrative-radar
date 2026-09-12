import { db } from '$lib/server/db/client';
import { tokens } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const prerender = false;

export async function load() {
	try {
		const recentTokens = await db.select()
			.from(tokens)
			.orderBy(desc(tokens.createdAt))
			.limit(50);
		
		return { recentTokens };
	} catch (e) {
		console.error('DB Fetch Error on Brain:', e);
		return { recentTokens: [] };
	}
}
