import { pgTable, uuid, text, pgEnum, integer, numeric, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** Lifecycle state of a single token as it moves through the pipeline. */
export const tokenStatusEnum = pgEnum('token_status', [
	'pending_embed',   // [1] INGEST done, waiting for [2] EMBED
	'pending_cluster', // [2] EMBED done, waiting for [3] ASSIGN
	'clustered'        // [3] ASSIGN done
]);

/** Lifecycle state of a cluster. Active → cooling → archived. */
export const clusterStatusEnum = pgEnum('cluster_status', [
	'active',   // receiving new members
	'cooling',  // no new members for a few hours
	'archived'  // removed from live feed, kept in history
]);

// ---------------------------------------------------------------------------
// tokens
// ---------------------------------------------------------------------------

/**
 * One row per Pump.fun token launch.
 *
 * The `embedding` column stores a vector as a Postgres float array (real[]).
 * To use pgvector operators, run: CREATE EXTENSION IF NOT EXISTS vector;
 * and change the column type to vector(N) in a migration.
 * For V1 we store as real[] and do similarity in the service layer.
 */
export const tokens = pgTable(
	'tokens',
	{
		id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),

		/** Contract address — globally unique identifier on Solana. */
		mint: text('mint').notNull().unique(),

		/** Short ticker symbol, e.g. "$PEPE". */
		ticker: text('ticker').notNull(),

		/** Full token name as given at launch. */
		name: text('name').notNull(),

		/**
		 * URL to token image from Pump.fun.
		 * Nullable in case Pump.fun doesn't provide one.
		 * DISPLAY as thumbnail in V1 — similarity use deferred to phase 2.
		 */
		imageUrl: text('image_url'),

		/** UTC timestamp when this token launched on Pump.fun. */
		createdAt: timestamp('created_at', { withTimezone: true }).notNull(),

		/**
		 * Embedding vector stored as real[].
		 * null until stage [2] EMBED completes.
		 */
		embedding: text('embedding'), // stored as JSON-encoded float array string

		/** FK to clusters. null until stage [3] ASSIGN completes. */
		clusterId: uuid('cluster_id').references(() => clusters.id, { onDelete: 'set null' }),

		/** Pipeline stage tracker. */
		status: tokenStatusEnum('status').notNull().default('pending_embed'),

		/** When this row was inserted (server time). */
		insertedAt: timestamp('inserted_at', { withTimezone: true }).notNull().defaultNow()
	},
	(table) => [
		index('tokens_cluster_id_idx').on(table.clusterId),
		index('tokens_status_idx').on(table.status),
		index('tokens_created_at_idx').on(table.createdAt)
	]
);

// ---------------------------------------------------------------------------
// clusters
// ---------------------------------------------------------------------------

/**
 * One row per narrative cluster.
 *
 * Key invariants (enforced in service layer, not DB constraints):
 * - peak_member_count: only ever increases (GREATEST update)
 * - peak_growth_rate:  only ever increases (GREATEST update)
 * - ever_reached_breakout: once true, never set back to false
 * - sparkline_points: rolling window of ~12 most recent member_count snapshots
 */
export const clusters = pgTable(
	'clusters',
	{
		id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),

		/**
		 * Human-readable theme label (e.g. "retro game villains").
		 * Generated once via LLM when cluster reaches 2nd/3rd member.
		 * Never regenerated — see brief §4a.
		 */
		label: text('label'),

		/**
		 * Centroid embedding vector stored as JSON-encoded float array string.
		 * Recomputed at each [4] RECOMPUTE as the mean of all member embeddings.
		 */
		centroid: text('centroid'),

		/** Current number of members. Updated at each [4] RECOMPUTE. */
		memberCount: integer('member_count').notNull().default(0),

		/**
		 * Growth rate: % increase in member_count vs the previous hour.
		 * Decays toward 0 when no new members arrive.
		 * NOT the peak value — see peak_growth_rate.
		 */
		growthRate: numeric('growth_rate', { precision: 10, scale: 4 }).notNull().default('0'),

		/**
		 * Peak member count ever reached — NEVER decreases.
		 * Updated with GREATEST(current, new) at each [4] RECOMPUTE.
		 * Used by the track record page.
		 */
		peakMemberCount: integer('peak_member_count').notNull().default(0),

		/**
		 * Peak growth rate ever reached — NEVER decreases.
		 * Updated with GREATEST(current, new) at each [4] RECOMPUTE.
		 * growth_rate decays to ~0 when archived, so this is the only
		 * reliable source for "what was the peak momentum?" on track record.
		 */
		peakGrowthRate: numeric('peak_growth_rate', { precision: 10, scale: 4 }).notNull().default('0'),

		/**
		 * Rolling window sparkline: last ~12 member_count snapshots, ordered by time.
		 * Format: number[]  e.g. [2, 3, 5, 9, 14, 18, 22]
		 * APPEND at each [4] RECOMPUTE, slice to last 12.
		 * Served directly by GET /api/clusters — never computed at request time.
		 */
		sparklinePoints: jsonb('sparkline_points').notNull().default(sql`'[]'::jsonb`),

		/** Current lifecycle status. */
		status: clusterStatusEnum('status').notNull().default('active'),

		/**
		 * Once true, NEVER set back to false — even if the cluster cools/archives.
		 * This is how the track record stays honest.
		 */
		everReachedBreakout: boolean('ever_reached_breakout').notNull().default(false),

		/** When the first token was assigned to this cluster. */
		firstSeen: timestamp('first_seen', { withTimezone: true }).notNull().defaultNow(),

		/** When this cluster was last recomputed. */
		/** When this cluster was first formed. */
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),

		lastUpdated: timestamp('last_updated', { withTimezone: true }).notNull().defaultNow(),

		/** Set when status transitions to 'archived'. Null while active/cooling. */
		/** When this cluster was tweeted about. */
		tweetedAt: timestamp('tweeted_at', { withTimezone: true }),

		archivedAt: timestamp('archived_at', { withTimezone: true })
	},
	(table) => [
		index('clusters_status_idx').on(table.status),
		index('clusters_ever_reached_breakout_idx').on(table.everReachedBreakout),
		index('clusters_archived_at_idx').on(table.archivedAt)
	]
);

// ---------------------------------------------------------------------------
// Type exports — used by repositories and services
// ---------------------------------------------------------------------------

export type Token = typeof tokens.$inferSelect;
export type NewToken = typeof tokens.$inferInsert;

export type Cluster = typeof clusters.$inferSelect;
export type NewCluster = typeof clusters.$inferInsert;

export type TokenStatus = (typeof tokenStatusEnum.enumValues)[number];
export type ClusterStatus = (typeof clusterStatusEnum.enumValues)[number];
