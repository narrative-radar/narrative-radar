import postgres from 'postgres';

async function run() {
    const sql = postgres(process.env.DATABASE_URL);
    
    try {
        console.log("Seeding test data...");
        const res = await sql`
            INSERT INTO clusters (label, member_count, growth_rate, status) 
            VALUES ('AI Agents (MOCK)', 5, 25.5, 'active') RETURNING id
        `;
        const clusterId = res[0].id;

        await sql`
            INSERT INTO tokens (mint, ticker, name, status, cluster_id, created_at)
            VALUES ('CA11111111111111111111111111111111111111', '$AI1', 'Clustered AI Token', 'clustered', ${clusterId}, NOW())
            ON CONFLICT (mint) DO NOTHING
        `;

        await sql`
            INSERT INTO tokens (mint, ticker, name, status, created_at)
            VALUES ('CA22222222222222222222222222222222222222', '$PND2', 'Pending Token', 'pending_embed', NOW())
            ON CONFLICT (mint) DO NOTHING
        `;

        console.log("Done seeding!");
    } catch (e) {
        console.error(e);
    } finally {
        await sql.end();
    }
}
run();
