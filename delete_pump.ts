import postgres from 'postgres';
import { env } from 'process';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("No DATABASE_URL found");
        return;
    }
    const sql = postgres(dbUrl, { prepare: false });
    console.log("Deleting tokens ending in 'pump'...");
    const result = await sql`DELETE FROM tokens WHERE mint ILIKE '%pump' OR mint ILIKE '%pump%';`;
    console.log(`Deleted ${result.count} tokens.`);
    process.exit(0);
}
run();
