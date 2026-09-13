import postgres from 'postgres';
import { env } from 'process';

async function run() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("No DATABASE_URL found");
        return;
    }
    const sql = postgres(dbUrl, { prepare: false });
    console.log("Wiping all mock tokens and clusters from database...");
    
    // Clear tokens first (foreign key dependency)
    const tokensResult = await sql`DELETE FROM tokens;`;
    console.log(`Deleted ${tokensResult.count} tokens.`);
    
    // Clear clusters
    const clustersResult = await sql`DELETE FROM clusters;`;
    console.log(`Deleted ${clustersResult.count} clusters.`);
    
    process.exit(0);
}
run();
