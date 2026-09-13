import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL!);
async function run() {
    await sql`UPDATE clusters SET label = REGEXP_REPLACE(label, '(?i) tokens$', '') WHERE label ILIKE '% tokens'`;
    await sql`UPDATE clusters SET label = REGEXP_REPLACE(label, '(?i) cluster$', '') WHERE label ILIKE '% cluster'`;
    await sql`UPDATE clusters SET label = REPLACE(label, '...', '') WHERE label LIKE '%...%'`;
    console.log("Labels renamed.");
    process.exit(0);
}
run();
