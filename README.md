# Tycho Radar (Real-Time Spatial Cognition Engine)

Tycho Radar is an elite, real-time narrative discovery engine for the Solana ecosystem, specifically targeting the Ponsfamily graph. It ingests live token deployments, maps their spatial vectors using AI, and clusters them into emerging narratives before they hit the mainstream.

## 🚀 The Machinery
- **Live Ingestion**: Connects directly to on-chain data to ingest new tokens instantly.
- **Spatial Vectors**: Calculates similarity indexes across 1536-dimensional embeddings.
- **Hourly Retraining**: The validation gate recalibrates continuously.
- **Public Dataset**: Transparent CSV export with zero aggregation layer.

## 🛠 Tech Stack
- **Framework**: SvelteKit 5 (Vite)
- **Database**: PostgreSQL (Supabase) + Drizzle ORM
- **AI Engine**: Google Gemini (Spatial Labeling)
- **Styling**: Tailwind CSS v4 (Cyberpunk/Terminal Aesthetic)
- **Deployment**: Vercel Serverless

## ⚙️ Local Setup
1. Clone the repository.
2. Install dependencies using Bun or NPM:
   ```bash
   npm install
   ```
3. Set up your `.env` file (see `.env.example`).
4. Push the database schema:
   ```bash
   npm run db:push
   ```
5. Start the engine:
   ```bash
   npm run dev
   ```

## 🧠 The Brain
The `/brain` interface provides raw, real-time access to the internal `INTERNAL_STATE.LOG` and the `PONSFAMILY_INGESTION_STREAM`.

> *Readiness is a boolean, computed from evidence, with no override branch.*

---
*Built for the public. Trust the math, verify the dataset.*
