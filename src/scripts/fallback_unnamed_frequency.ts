import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

const STOP_WORDS = new Set(['coin', 'token', 'inu', 'the', 'of', '2.0', '1.0', '3.0', 'and', 'a', 'in', 'on', 'for', 'to']);

function extractWords(text: string) {
    return text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1 && !STOP_WORDS.has(w) && isNaN(Number(w)));
}

async function run() {
    const unnamedClusters = await sql`SELECT id, label FROM clusters WHERE label = 'unnamed cluster'`;
    
    for (const cluster of unnamedClusters) {
        const tokens = await sql`SELECT name, ticker FROM tokens WHERE cluster_id = ${cluster.id}`;
        
        const counts = new Map<string, number>();
        for (const t of tokens) {
            const words = extractWords(t.name);
            // Count unique words per token to avoid a token like "Floki Floki" counting twice
            const uniqueWords = new Set(words);
            for (const w of uniqueWords) {
                counts.set(w, (counts.get(w) || 0) + 1);
            }
        }
        
        let bestWord = null;
        let maxCount = 0;
        
        for (const [word, count] of counts.entries()) {
            if (count >= 2 && count > maxCount) {
                maxCount = count;
                bestWord = word;
            }
        }
        
        if (bestWord) {
            console.log(`Recovered label for ${cluster.id}: "${bestWord}" (appeared ${maxCount} times)`);
            await sql`UPDATE clusters SET label = ${bestWord} WHERE id = ${cluster.id}`;
        } else {
            console.log(`Could not recover label for ${cluster.id} (no word appeared >= 2 times)`);
        }
    }
    
    process.exit(0);
}

run();
