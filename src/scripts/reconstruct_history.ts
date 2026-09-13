import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function run() {
    const allClusters = await sql`SELECT id FROM clusters`;
    for(const c of allClusters) {
        const tokens = await sql`SELECT created_at FROM tokens WHERE cluster_id = ${c.id} ORDER BY created_at ASC`;
        if (tokens.length === 0) continue;
        
        const firstTime = tokens[0].created_at.getTime();
        const lastTime = tokens[tokens.length-1].created_at.getTime();
        const now = Date.now();
        
        let points = [];
        let currentTime = firstTime;
        let peakGrowth = 0;
        let prevCount = 0;
        
        while (currentTime <= now) {
            let currentCount = 0;
            for (const t of tokens) {
                if (t.created_at.getTime() <= currentTime) currentCount++;
            }
            points.push(currentCount);
            
            if (prevCount > 0) {
                const growth = currentCount - prevCount;
                if (growth > peakGrowth) peakGrowth = growth;
            } else if (currentCount > 0) {
                peakGrowth = currentCount;
            }
            prevCount = currentCount;
            currentTime += 6 * 60 * 60 * 1000;
        }
        
        // Final bucket for NOW
        let currentCount = tokens.length;
        points.push(currentCount);
        if (prevCount > 0) {
            const growth = currentCount - prevCount;
            if (growth > peakGrowth) peakGrowth = growth;
        } else if (currentCount > 0 && peakGrowth === 0) {
            peakGrowth = currentCount;
        }

        let currentGrowth = 0;
        if (points.length >= 2) {
            const last = points[points.length - 1];
            const prev = points[points.length - 2];
            currentGrowth = last - prev;
        } else {
            currentGrowth = points.length > 0 ? points[0] : 0;
        }

        const sparkline = points.slice(-12);
        
        const ageHoursLastToken = (now - lastTime) / (1000 * 60 * 60);
        let status = 'active';
        if (ageHoursLastToken > 24) status = 'archived';
        else if (ageHoursLastToken > 6) status = 'cooling';
        
        const everReachedBreakout = peakGrowth >= 5 && tokens.length >= 5;
        
        await sql`UPDATE clusters SET 
            sparkline_points = ${JSON.stringify(sparkline)},
            growth_rate = ${currentGrowth},
            peak_growth_rate = ${peakGrowth},
            peak_member_count = ${tokens.length},
            status = ${status},
            ever_reached_breakout = ${everReachedBreakout}
            WHERE id = ${c.id}`;
    }
    console.log("History reconstructed successfully.");
    process.exit(0);
}
run();
