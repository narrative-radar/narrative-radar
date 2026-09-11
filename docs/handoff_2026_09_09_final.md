# Project Tycho — Final Technical Handoff
**Date**: September 9, 2026
**Status**: Ready for Production Deployment (Autonomous Mode)

## 1. Project Overview
Tycho is a continuous background processing radar for the Solana ecosystem (Pump.fun tokens). It automatically ingests new tokens via a cron job, generates vector embeddings using Google's Gemini API, and clusters them into narrative themes using mathematical similarity.

## 2. Latest Updates (Sept 9, 2026)
* **UI Enhancements**: 
  * Replaced the header and hero logos with the new asset from `public/images/logo.png`.
  * Added the subtitle **"NARRATIVE RADAR"** beneath the large "TYCHO" text in the final footer section.
* **Demo Mode / Graceful Testing**: 
  * Added a hardcoded demo handler in `/api/tokens/[mint]/cluster/+server.ts`. 
  * If a user inputs the CA `"example"`, the system will bypass the database and instantly return a "Found" state (Theme: Retro Game Villains, +340%). This solves the issue of visitors not knowing what CA to test with.
* **Similarity Threshold Alert**: 
  * Currently, the `SIMILARITY_THRESHOLD` in `clustering.service.ts` is set to `0.75`. For stricter clustering (as noted in earlier docs), you may want to bump this to `0.85` once live data flows in.

## 3. Core Architecture
* **100% Read-Only Public API**: The token lookup endpoint is strictly Cache-First. It does not fetch data from Pump.fun on demand. This saves API limits and prevents abuse.
* **Autonomous Cron Ingestion**: The database is populated *only* by the background cron job (`/api/cron/cluster`). If the cron job runs 24/7 on an external service, the app is 100% autonomous.

## 4. How to Deploy & Setup (Post-Reinstall)
When you are ready to put this online, follow these steps:

### A. Environment Variables
Ensure these are set in your `.env` (for local) and your Vercel Project Settings:
* `DATABASE_URL`: Transaction-mode pooler string from Supabase.
* `GEMINI_API_KEY`: Google AI Studio key (for `text-embedding-004` / `gemini-embedding-2`).
* `CRON_SECRET`: A secure, random string (e.g., `KunciRadarTycho2026`).

### B. Setting up the Cron Job (CRITICAL)
1. Deploy the site to Vercel (e.g., `https://your-domain.vercel.app`).
2. Go to [cron-job.org](https://cron-job.org).
3. Create a cron job that pings `https://your-domain.vercel.app/api/cron/cluster` every 5 minutes.
4. **IMPORTANT**: Change the HTTP Method from `GET` to **`POST`**. (The endpoint explicitly expects a POST request).
5. Add the HTTP Header: `Authorization: Bearer <YOUR_CRON_SECRET>`.

## 5. Testing Guide
* **Localhost Testing**: The cron service on the internet cannot reach your local computer. To test ingestion locally, you must manually trigger the pipeline by sending a POST request to `http://localhost:5173/api/cron/cluster` via Postman or Terminal.
* **Live (Production) Testing**: Once deployed and `cron-job.org` is running, the system will update itself. To test it, go to Pump.fun, copy a real Contract Address that launched in the last few hours, and paste it into the Tycho UI.
