import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL!);
async function run() {
    const allClusters = await sql`SELECT id, label FROM clusters`;
    for(const c of allClusters) {
        if (!c.label) continue;
        const words = c.label.trim().split(/\s+/);
        if (words.length === 1) {
            await sql`UPDATE clusters SET label = 'unnamed cluster' WHERE id = ${c.id}`;
            console.log(`Renamed "${c.label}" -> "unnamed cluster"`);
        }
    }
    process.exit(0);
}
run();
