import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    let page = 1;
    let totalInserted = 0;
    const maxPages = 20; 
    const seenTokens = new Set();
    
    while (page <= maxPages) {
        console.log(`Fetching page ${page}...`);
        try {
            const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/robinhood/pools?include=base_token&page=${page}`);
            if (!res.ok) {
                console.log(`GeckoTerminal returned ${res.status}. Stopping.`);
                break;
            }
            const data = await res.json();
            
            if (!data.data || data.data.length === 0) {
                console.log('No more pools found.');
                break;
            }
            
            const pools = data.data;
            const included = data.included || [];
            
            let insertedInPage = 0;
            
            for (const pool of pools) {
                const baseTokenId = pool.relationships.base_token.data.id;
                const poolCreatedAt = pool.attributes.pool_created_at;
                
                if (seenTokens.has(baseTokenId)) continue;
                seenTokens.add(baseTokenId);
                
                const tokenObj = included.find((t: any) => t.id === baseTokenId);
                if (!tokenObj) continue;
                
                const mint = tokenObj.attributes.address;
                const ticker = tokenObj.attributes.symbol || '???';
                const name = tokenObj.attributes.name || 'Unknown';
                const imageUrl = tokenObj.attributes.image_url || null;
                const createdAt = new Date(poolCreatedAt);
                
                try {
                    await sql`INSERT INTO tokens (id, mint, ticker, name, image_url, created_at, status)
                              VALUES (gen_random_uuid(), ${mint}, ${ticker}, ${name}, ${imageUrl}, ${createdAt}, 'pending_embed')
                              ON CONFLICT (mint) DO NOTHING`;
                    insertedInPage++;
                } catch(e) { }
            }
            totalInserted += insertedInPage;
            console.log(`Inserted ${insertedInPage} tokens. (Total: ${totalInserted})`);
        } catch (e) {
            console.error('Error fetching page', page, e);
        }
        
        page++;
        await delay(2500);
    }
    
    console.log(`Finished. Inserted ${totalInserted} unique tokens from pools.`);
    process.exit(0);
}

run();
