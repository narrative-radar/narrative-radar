import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/client.js';
import { tokens } from '$lib/server/db/schema/index.js';

const keywords = [
    'cat', 'dog', 'ai', 'inu', 'pepe', 'coin', 'moon', 'trump', 'harris', 'btc', 'eth', 'sol', 'base', 'elon', 'ceo', 'wif', 'meme', 'shib', 'frog', 'boy', 'girl', 'baby', 'floki', 'ape', 'chad', 'dex', 'swap', 'fi', 'dexscreener',
    'nvidia', 'apple', 'tesla', 'meta', 'goog', 'gold', 'silver', 'oil', 'stock', 'bond', 'yield',
    'kamala', 'biden', 'maga', 'wojak', 'pork', 'ponzi', 'safe', 'cum', 'dick', 'ass',
    'game', 'tech', 'dao', 'nft', 'web3', 'x', 'twitter', 'metaverse', 'capital', 'finance'
];

export async function GET() {
    let inserted = 0;
    const seenAddresses = new Set();
    
    // First, seed seenAddresses from DB
    const existingTokens = await db.select({ mint: tokens.mint }).from(tokens);
    for (const t of existingTokens) seenAddresses.add(t.mint.toLowerCase());

    console.log(`Starting DexScreener backfill for Robinhood L2 with ${keywords.length} keywords...`);

    for (const kw of keywords) {
        try {
            const res = await fetch(`https://api.dexscreener.com/latest/dex/search/?q=${kw}`);
            const data = await res.json();
            if (!data.pairs) continue;
            
            const rhPairs = data.pairs.filter((p: any) => p.chainId === 'robinhood');
            if (rhPairs.length === 0) continue;
            
            const batch = [];
            for (const p of rhPairs) {
                const addr = p.baseToken.address.toLowerCase();
                if (!seenAddresses.has(addr)) {
                    seenAddresses.add(addr);
                    batch.push({
                        mint: addr,
                        ticker: p.baseToken.symbol || 'UNKNOWN',
                        name: p.baseToken.name || 'Unknown Token',
                        imageUrl: p.info?.imageUrl || null,
                        createdAt: new Date(p.pairCreatedAt || Date.now())
                    });
                }
            }
            
            if (batch.length > 0) {
                await db.insert(tokens).values(batch).onConflictDoNothing({ target: tokens.mint });
                inserted += batch.length;
            }
        } catch(e) {
            console.error(`Error fetching keyword '${kw}':`, e);
        }
        
        await new Promise(r => setTimeout(r, 200));
    }
    
    console.log(`DexScreener Backfill Complete! Total new tokens inserted: ${inserted}`);
    return json({ inserted });
}
