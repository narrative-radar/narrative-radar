# Tycho Narrative Radar

Tycho is an autonomous macro-narrative radar designed to track, cluster, and label emerging themes in the Solana token ecosystem (specifically focusing on platforms like Pump.fun). Instead of looking at individual tokens in isolation, Tycho identifies spatial density among newly launched tokens to detect narrative breakouts and metas as they form.

## How It Works

The system operates continuously in the background without user intervention:

1. **Ingest**: A cron job fetches newly launched tokens from the blockchain.
2. **Embed**: Token metadata (names, tickers, lore) is transformed into vector embeddings using Large Language Models (LLMs).
3. **Cluster**: The vectors are plotted in high-dimensional space. An algorithm (DBSCAN) identifies spatial density, grouping mathematically similar tokens into anonymous clusters.
4. **Label**: Once a cluster reaches a critical mass, a fallback chain of LLMs (Claude & Gemini) analyzes the cluster's members and autonomously assigns a human-readable theme label (e.g., "AI Pets", "Tokenized Stocks").

## Tech Stack

- **Frontend & Backend**: SvelteKit
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM
- **AI / Embeddings**: Google Gemini API (`text-embedding-004`)
- **AI / Labeling**: Anthropic Claude Haiku (primary), Gemini Flash (fallback)
- **Styling**: Tailwind CSS & GSAP for animations

## Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/mark-readme/Radar.git tycho-radar
cd tycho-radar
bun install
```

### 2. Environment Variables
Create a `.env` file in the root directory based on `.env.example`:
```bash
cp .env.example .env
```

You will need to provide the following variables:
- `DATABASE_URL`: Transaction-mode connection string for your PostgreSQL database (e.g., Supabase IPv4 pooler).
- `GEMINI_API_KEY`: Your Google AI Studio API key (used for embeddings).
- `ANTHROPIC_API_KEY`: Your Anthropic API key (used for primary cluster labeling).
- `CRON_SECRET`: A custom, long random string used to secure the `/api/cron/cluster` endpoint from unauthorized triggers.
- `PUBLIC_APP_URL`: The URL where the app is hosted (e.g., `http://localhost:5173` for local testing).

### 3. Database Setup
Push the schema to your PostgreSQL database:
```bash
bun run db:push
```

### 4. Seed Initial Data (Optional)
To test the application with real historical data without waiting for the cron job, you can use the provided backfill scripts:
```bash
bun src/scripts/gecko_backfill.ts
bun src/scripts/recluster.ts
bun src/scripts/reconstruct_history.ts
```

### 5. Run the Application
```bash
bun run dev
```

## Production Cron Setup

Tycho relies on a background cron job to ingest and process tokens. 
- The endpoint to trigger is `POST /api/cron/cluster`
- You must include the header: `Authorization: Bearer <YOUR_CRON_SECRET>`

**Important Note on Scheduling**: 
For optimal results, the recommended interval is every 5 to 15 minutes. It is highly advised to use a dedicated external cron service (such as **cron-job.org** or **Upstash QStash**). Native GitHub Actions scheduled workflows have proven to be highly unreliable for short intervals, often skipping executions for hours during peak platform loads.

## License

This project is licensed under the MIT License.
