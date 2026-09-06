const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    try {
        console.log("Seeding test data...");
        // Insert a cluster
        const res = await client.query(`
            INSERT INTO clusters (name, label, member_count, growth_rate, status) 
            VALUES ('test_meta', 'Test Meta', 5, 25.5, 'active') RETURNING id
        `);
        const clusterId = res.rows[0].id;

        // Token 1: Clustered
        await client.query(`
            INSERT INTO tokens (mint, ticker, name, status, cluster_id, created_at)
            VALUES ('TOKEN11111111111111111111111111111111111111', '$TOK1', 'Token One', 'clustered', $1, NOW())
            ON CONFLICT (mint) DO NOTHING
        `, [clusterId]);

        // Token 2: Pending Embed
        await client.query(`
            INSERT INTO tokens (mint, ticker, name, status, created_at)
            VALUES ('TOKEN22222222222222222222222222222222222222', '$TOK2', 'Token Two', 'pending_embed', NOW())
            ON CONFLICT (mint) DO NOTHING
        `);

        console.log("Done seeding!");
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
