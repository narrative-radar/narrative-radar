import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function run() {
    const clusters = await sql`SELECT id FROM clusters`;
    for(const c of clusters) {
        const tokens = await sql`SELECT created_at FROM tokens WHERE cluster_id = ${c.id} ORDER BY created_at ASC`;
        if (tokens.length === 0) continue;
        
        const now = Date.now();
        const firstTime = new Date(tokens[0].created_at).getTime();
        const lastTime = new Date(tokens[tokens.length-1].created_at).getTime();
        
        // Generate up to 12 points, per 6 hours (21600000 ms)
        // We will start from firstTime and step by 6 hours.
        const points = [];
        let currentCount = 0;
        let peakGrowth = 0;
        let prevCount = 0;
        
        let currentTime = firstTime;
        while (currentTime <= now) {
            currentCount = tokens.filter(t => new Date(t.created_at).getTime() <= currentTime).length;
            points.push(currentCount);
            
            if (prevCount > 0) {
                const growth = ((currentCount - prevCount) / prevCount) * 100;
                if (growth > peakGrowth) peakGrowth = growth;
            } else if (currentCount > 0) {
                peakGrowth = 100; // Initial burst
            }
            prevCount = currentCount;
            currentTime += 6 * 60 * 60 * 1000;
        }
        
        // Final bucket for NOW
        currentCount = tokens.length;
        points.push(currentCount);
        if (prevCount > 0) {
            const growth = ((currentCount - prevCount) / prevCount) * 100;
            if (growth > peakGrowth) peakGrowth = growth;
        }

        const sparkline = points.slice(-12);
        
        const ageHoursLastToken = (now - lastTime) / (1000 * 60 * 60);
        let status = 'active';
        if (ageHoursLastToken > 24) status = 'archived';
        else if (ageHoursLastToken > 6) status = 'cooling';
        
        const everReachedBreakout = peakGrowth > 50 && tokens.length >= 5;
        
        let currentGrowth = 0;
        const nonZeroPoints = points.filter(p => p > 0);
        if (nonZeroPoints.length > 1) {
            const firstP = nonZeroPoints[0];
            const lastP = nonZeroPoints[nonZeroPoints.length - 1];
            if (firstP > 0) {
                currentGrowth = ((lastP - firstP) / firstP) * 100;
            } else {
                currentGrowth = 999999; // Special flag for "new"
            }
        } else if (nonZeroPoints.length === 1) {
            currentGrowth = 999999;
        }
        
        await sql`UPDATE clusters SET 
            sparkline_points = ${JSON.stringify(sparkline)},
            growth_rate = ${currentGrowth.toFixed(4)},
            peak_growth_rate = ${peakGrowth.toFixed(4)},
            peak_member_count = ${tokens.length},
            status = ${status},
            ever_reached_breakout = ${everReachedBreakout}
            WHERE id = ${c.id}`;
    }
    console.log("History reconstructed successfully.");
    process.exit(0);
}
run();
