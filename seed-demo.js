import postgres from 'postgres';

async function seed() {
    const sql = postgres(process.env.DATABASE_URL);

    const histId = crypto.randomUUID();
    const breakoutId = crypto.randomUUID();
    const mockVector = JSON.stringify(new Array(3072).fill(0.01));

    // 1. Historical Cluster
    await sql`
        INSERT INTO clusters (id, label, status, member_count, growth_rate, peak_member_count, peak_growth_rate, sparkline_points, centroid, ever_reached_breakout, created_at, last_updated)
        VALUES (
            ${histId}, 
            'TRUMP ELECTION DEBATE', 
            'archived', 
            12, 
            0, 
            12, 
            1250.50, 
            '[10,20,50,100,300,800,1250]'::jsonb, 
            ${mockVector}, 
            true, 
            NOW() - INTERVAL '2 days', 
            NOW() - INTERVAL '1 day'
        )
    `;

    // 2. Breakout Cluster
    await sql`
        INSERT INTO clusters (id, label, status, member_count, growth_rate, peak_member_count, peak_growth_rate, sparkline_points, centroid, ever_reached_breakout, created_at, last_updated)
        VALUES (
            ${breakoutId}, 
            'AI AGENTS & BOTS', 
            'active', 
            8, 
            450.25, 
            8, 
            450.25, 
            '[0,5,20,100,250,450]'::jsonb, 
            ${mockVector}, 
            true, 
            NOW() - INTERVAL '1 hour', 
            NOW()
        )
    `;

    // 3. Insert some tokens for the active cluster so they show up when clicked
    await sql`
        INSERT INTO tokens (id, mint, ticker, name, cluster_id, status, created_at)
        VALUES 
            (${crypto.randomUUID()}, 'AiBot1111111111111111111111111111111111111', '$AIDEV', 'AI Developer Bot', ${breakoutId}, 'clustered', NOW()),
            (${crypto.randomUUID()}, 'AiBot2222222222222222222222222222222222222', '$GPTTRADER', 'GPT On-Chain Trader', ${breakoutId}, 'clustered', NOW())
    `;

    console.log("✅ Demo data seeded successfully!");
    process.exit(0);
}
seed();
