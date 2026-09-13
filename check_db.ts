import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL!);
async function run() {
    const res = await sql`SELECT label FROM clusters WHERE label IS NOT NULL AND label != ''`;
    console.log(res.map(r => r.label));
    process.exit(0);
}
run();
