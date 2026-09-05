CREATE TYPE "public"."cluster_status" AS ENUM('active', 'cooling', 'archived');--> statement-breakpoint
CREATE TYPE "public"."token_status" AS ENUM('pending_embed', 'pending_cluster', 'clustered');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text,
	"centroid" text,
	"member_count" integer DEFAULT 0 NOT NULL,
	"growth_rate" numeric(10, 4) DEFAULT '0' NOT NULL,
	"peak_member_count" integer DEFAULT 0 NOT NULL,
	"peak_growth_rate" numeric(10, 4) DEFAULT '0' NOT NULL,
	"sparkline_points" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "cluster_status" DEFAULT 'active' NOT NULL,
	"ever_reached_breakout" boolean DEFAULT false NOT NULL,
	"first_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mint" text NOT NULL,
	"ticker" text NOT NULL,
	"name" text NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone NOT NULL,
	"embedding" text,
	"cluster_id" uuid,
	"status" "token_status" DEFAULT 'pending_embed' NOT NULL,
	"inserted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tokens_mint_unique" UNIQUE("mint")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tokens" ADD CONSTRAINT "tokens_cluster_id_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."clusters"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clusters_status_idx" ON "clusters" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clusters_ever_reached_breakout_idx" ON "clusters" USING btree ("ever_reached_breakout");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "clusters_archived_at_idx" ON "clusters" USING btree ("archived_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tokens_cluster_id_idx" ON "tokens" USING btree ("cluster_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tokens_status_idx" ON "tokens" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tokens_created_at_idx" ON "tokens" USING btree ("created_at");