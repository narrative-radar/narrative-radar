import { eq, inArray, and, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { tokens } from '../db/schema/index.js';
import type { NewToken, Token, TokenStatus } from '../db/schema/index.js';

// ---------------------------------------------------------------------------
// cluster.repository.ts
// Handles all DB reads/writes for the `tokens` table.
// No business logic — that lives in clustering.service.ts.
// ---------------------------------------------------------------------------

/**
 * Insert a new token. If `mint` already exists, skip silently (idempotent).
 * Returns the inserted (or existing) token id.
 */
export async function insertToken(data: NewToken): Promise<string> {
	const [row] = await db
		.insert(tokens)
		.values(data)
		.onConflictDoNothing({ target: tokens.mint })
		.returning({ id: tokens.id });

	if (row) return row.id;

	// Already existed — fetch the id
	const existing = await db
		.select({ id: tokens.id })
		.from(tokens)
		.where(eq(tokens.mint, data.mint))
		.limit(1);
	return existing[0].id;
}

/**
 * Batch insert tokens. All-or-nothing per batch, skipping existing mints.
 */
export async function insertTokensBatch(data: NewToken[]): Promise<void> {
	if (data.length === 0) return;
	await db.insert(tokens).values(data).onConflictDoNothing({ target: tokens.mint });
}

/**
 * Fetch all tokens with `pending_embed` status (need embeddings).
 * Used by [2] EMBED stage.
 */
export async function getTokensPendingEmbed(): Promise<Token[]> {
	return db.select().from(tokens).where(eq(tokens.status, 'pending_embed'));
}

/**
 * Fetch all tokens with `pending_cluster` status (have embeddings, need assignment).
 * Used by [3] ASSIGN stage.
 */
export async function getTokensPendingCluster(): Promise<Token[]> {
	return db.select().from(tokens).where(eq(tokens.status, 'pending_cluster'));
}

/**
 * Update a token's embedding and advance its status to `pending_cluster`.
 * `embeddingJson` is a JSON-encoded float array string, e.g. "[0.1, 0.2, ...]".
 */
export async function setTokenEmbedding(id: string, embeddingJson: string): Promise<void> {
	await db
		.update(tokens)
		.set({ embedding: embeddingJson, status: 'pending_cluster' })
		.where(eq(tokens.id, id));
}

/**
 * Batch-update multiple tokens' embeddings in one query using a CASE expression.
 * More efficient than N individual updates for large batches.
 */
export async function setTokenEmbeddingsBatch(
	updates: Array<{ id: string; embeddingJson: string }>
): Promise<void> {
	if (updates.length === 0) return;

	const ids = updates.map((u) => u.id);
	const caseExpr = sql`CASE id ${sql.join(
		updates.map((u) => sql`WHEN ${u.id}::uuid THEN ${u.embeddingJson}`),
		sql` `
	)} END`;

	await db
		.update(tokens)
		.set({ embedding: caseExpr, status: 'pending_cluster' })
		.where(inArray(tokens.id, ids));
}

/**
 * Assign a token to a cluster and mark it as `clustered`.
 */
export async function assignTokenToCluster(tokenId: string, clusterId: string): Promise<void> {
	await db
		.update(tokens)
		.set({ clusterId, status: 'clustered' })
		.where(eq(tokens.id, tokenId));
}

/**
 * Bulk assign multiple tokens to their clusters.
 */
export async function assignTokensToClustersBatch(
	assignments: Array<{ tokenId: string; clusterId: string }>
): Promise<void> {
	if (assignments.length === 0) return;

	// Execute as individual updates in a transaction for consistency.
	// For large batches, consider a temp-table approach.
	await db.transaction(async (tx) => {
		for (const { tokenId, clusterId } of assignments) {
			await tx
				.update(tokens)
				.set({ clusterId, status: 'clustered' })
				.where(and(eq(tokens.id, tokenId), eq(tokens.status, 'pending_cluster')));
		}
	});
}

/**
 * Fetch all tokens belonging to a specific cluster, ordered by launch time.
 * Used by GET /api/clusters/:id/tokens.
 */
export async function getTokensByClusterId(clusterId: string): Promise<Token[]> {
	return db
		.select()
		.from(tokens)
		.where(eq(tokens.clusterId, clusterId))
		.orderBy(tokens.createdAt);
}

/**
 * Fetch the N most recently inserted tokens (for the activity log sidebar).
 * Ordered by insertedAt DESC.
 */
export async function getRecentTokens(limit = 10): Promise<Token[]> {
	return db
		.select()
		.from(tokens)
		.orderBy(sql`${tokens.insertedAt} DESC`)
		.limit(limit);
}

/**
 * Update a token's status directly (for error recovery / admin use).
 */
export async function setTokenStatus(id: string, status: TokenStatus): Promise<void> {
	await db.update(tokens).set({ status }).where(eq(tokens.id, id));
}
