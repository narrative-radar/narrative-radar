import { db } from '$lib/server/db/client.js';
import { tokens } from '$lib/server/db/schema/index.js';
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
		return { recentTokens: [] };
	}
}
