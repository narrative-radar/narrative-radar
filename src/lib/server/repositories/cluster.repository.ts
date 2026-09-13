import { eq, and, sql, desc, isNotNull } from 'drizzle-orm';
import { db } from '../db/client.js';
import { clusters } from '../db/schema/index.js';
import type { NewCluster, Cluster, ClusterStatus } from '../db/schema/index.js';

// ---------------------------------------------------------------------------
// cluster.repository.ts
// Handles all DB reads/writes for the `clusters` table.
// IMPORTANT: peak_member_count and peak_growth_rate are ONLY increased here,
// never decreased. Enforcement is via GREATEST() in SQL, not application logic.
// ---------------------------------------------------------------------------

/**
 * Create a new cluster and return its full row.
 */
export async function createCluster(data: NewCluster): Promise<Cluster> {
	const [row] = await db.insert(clusters).values(data).returning();
	return row;
}

/**
 * Fetch all active (non-archived) clusters for the live radar feed.
 * This is the hot path for GET /api/clusters — must stay fast.
 * Cache-first: we read what [4] RECOMPUTE already stored.
 */
export async function getActiveClusters(): Promise<Cluster[]> {
	return db
		.select()
		.from(clusters)
		.where(
			and(
				sql`${clusters.status} IN ('active', 'cooling')`,
				sql`${clusters.memberCount} >= 3`,
				isNotNull(clusters.label),
				sql`${clusters.label} != ''`
			)
		)
		.orderBy(desc(clusters.growthRate));
}

/**
 * Fetch a single cluster by id.
 */
export async function getClusterById(id: string): Promise<Cluster | null> {
	const [row] = await db.select().from(clusters).where(eq(clusters.id, id)).limit(1);
	return row ?? null;
}

/**
 * Fetch all active clusters WITH their centroid for similarity search.
 * Used exclusively by [3] ASSIGN — not for API responses.
 */
export async function getClustersWithCentroid(): Promise<Cluster[]> {
	return db
		.select()
		.from(clusters)
		.where(
			and(
				sql`${clusters.status} IN ('active', 'cooling')`,
				isNotNull(clusters.centroid)
			)
		);
}

/**
 * Recompute a cluster's aggregate stats after new members are assigned.
 *
 * KEY INVARIANTS enforced here via SQL:
 * - peak_member_count = GREATEST(current, new_count)   ← never decreases
 * - peak_growth_rate  = GREATEST(current, new_rate)    ← never decreases
 * - sparkline_points  = last 12 entries of appended array
 * - ever_reached_breakout: once true, stays true
 */
export async function recomputeCluster(
	id: string,
	{
		memberCount,
		growthRate,
		centroid,
		sparklinePoints,
		status,
		everReachedBreakout
	}: {
		memberCount: number;
		growthRate: number;
		centroid: string; // JSON-encoded float array
		sparklinePoints: number[]; // the pre-computed sliced array
		status: ClusterStatus;
		everReachedBreakout: boolean;
	}
): Promise<Cluster> {
	const growthRateStr = growthRate.toFixed(4);

	const [row] = await db
		.update(clusters)
		.set({
			memberCount,
			growthRate: growthRateStr,
			centroid,
			// peak_member_count: GREATEST(existing, new) — never decreases
			peakMemberCount: sql`GREATEST(${clusters.peakMemberCount}, ${memberCount})`,
			// peak_growth_rate: GREATEST(existing, new) — never decreases
			peakGrowthRate: sql`GREATEST(${clusters.peakGrowthRate}, ${growthRateStr}::numeric)`,
			// sparkline: computed in JS, passed directly
			sparklinePoints,
			status,
			// ever_reached_breakout: monotone — once true stays true
			everReachedBreakout: sql`(${clusters.everReachedBreakout} OR ${everReachedBreakout})`,
			lastUpdated: sql`now()`
		})
		.where(eq(clusters.id, id))
		.returning();

	return row;
}

/**
 * Update only the cluster label (called once from LLM labeling, §4a).
 * Idempotent: if label already set, skip.
 */
export async function setClusterLabel(id: string, label: string): Promise<void> {
	await db
		.update(clusters)
		.set({ label })
		.where(and(eq(clusters.id, id), sql`${clusters.label} IS NULL`));
}

/**
 * Transition cluster status. Handles cooling → archived with archived_at timestamp.
 */
export async function setClusterStatus(id: string, status: ClusterStatus): Promise<void> {
	await db
		.update(clusters)
		.set({
			status,
			...(status === 'archived' ? { archivedAt: sql`now()` } : {}),
			lastUpdated: sql`now()`
		})
		.where(eq(clusters.id, id));
}

/**
 * Fetch clusters that have ever reached breakout, ordered by archived_at DESC.
 * Used by GET /api/clusters/track-record (V1.1).
 * Returns ALL qualifying clusters regardless of current status.
 */
export async function getBreakoutClusters(): Promise<Cluster[]> {
	return db
		.select()
		.from(clusters)
		.where(eq(clusters.everReachedBreakout, true))
		.orderBy(desc(clusters.archivedAt));
}

/**
 * Count active/cooling clusters (for QuickStats sidebar).
 */
export async function countActiveClusters(): Promise<number> {
	const [row] = await db
		.select({ count: sql<number>`COUNT(*)::int` })
		.from(clusters)
		.where(sql`${clusters.status} IN ('active', 'cooling')`);
	return row?.count ?? 0;
}

/**
 * Fetch breakout clusters that have not been tweeted yet.
 */
export async function getUntweetedBreakouts(): Promise<Cluster[]> {
	return db
		.select()
		.from(clusters)
		.where(
			and(
				eq(clusters.everReachedBreakout, true),
				sql`${clusters.tweetedAt} IS NULL`
			)
		);
}

/**
 * Mark a cluster as tweeted.
 */
export async function markClusterAsTweeted(id: string): Promise<void> {
	await db
		.update(clusters)
		.set({ tweetedAt: sql`now()` })
		.where(eq(clusters.id, id));
}
