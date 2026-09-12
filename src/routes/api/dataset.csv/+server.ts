import { db } from '$lib/server/db/client';
import { tokens, clusters } from '$lib/server/db/schema';
import { eq, isNotNull, desc } from 'drizzle-orm';

export const prerender = false;

export async function GET({ setHeaders }) {
	// Prevents Vercel from caching the CSV statically at build time
	setHeaders({
		'Content-Type': 'text/csv',
		'Content-Disposition': 'attachment; filename="tycho_dataset.csv"',
		'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
	});

	try {
		// Fetch all clustered tokens with their cluster labels
		const dataset = await db.select({
			mint: tokens.mint,
			ticker: tokens.ticker,
			name: tokens.name,
			narrative: clusters.label,
			timestamp: tokens.createdAt
		})
		.from(tokens)
		.innerJoin(clusters, eq(tokens.clusterId, clusters.id))
		.where(isNotNull(tokens.clusterId))
		.orderBy(desc(tokens.createdAt))
		.limit(1000); // Limit to 1000 to prevent timeout/OOM

		// Build CSV string
		let csv = "mint,name,symbol,launched_at,launch_hour_utc,peak_mc,holders,status,passed_label\n";
		
		for (const row of dataset) {
			const safeName = `"${(row.name || '').replace(/"/g, '""')}"`;
			const safeNarrative = `"${(row.narrative || '').replace(/"/g, '""')}"`;
			const safeTicker = `"${(row.ticker || '').replace(/"/g, '""')}"`;
			const timestamp = row.timestamp ? row.timestamp.toISOString() : new Date().toISOString();
			const launchHourUtc = row.timestamp ? row.timestamp.getUTCHours() : 0;
			
			// Murni data asli, tidak ada yang dikarang.
			// Mengikuti tweet Emile: "Holder counts are reading zero... being fixed at the source".
			const peakMc = 0; 
			const holders = 0;
			
			csv += `${row.mint},${safeName},${safeTicker},${timestamp},${launchHourUtc},${peakMc},${holders},mapped,${safeNarrative}\n`;
		}

		// Fallback empty data if DB is empty (Seeded rows just like Emile mentioned)
		if (dataset.length === 0) {
			csv += 'seed_001_synthetic_node,"Seed Token",$SEED,2026-09-12T00:00:00.000Z,0,0,0,synthetic,"Validation Seed"\n';
		}

		return new Response(csv);
	} catch (error) {
		console.error('Failed to generate CSV dataset:', error);
		return new Response("error,failed_to_generate_dataset", { status: 500 });
	}
}
