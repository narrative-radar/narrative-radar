async function run() {
    const profilesRes = await fetch('https://api.dexscreener.com/token-profiles/latest/v1');
    const profilesData = await profilesRes.json();
    const addresses = profilesData.filter(p => p.chainId === 'solana').slice(0, 30).map(p => p.tokenAddress);
    
    const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addresses.join(',')}`);
    const dexData = await dexResponse.json();
    
    const seenMints = new Set();
    const result = [];
    
    for (const pair of dexData.pairs || []) {
        // Find which token in the pair matches one of our queried addresses
        const token = addresses.includes(pair.baseToken.address) ? pair.baseToken : (addresses.includes(pair.quoteToken.address) ? pair.quoteToken : pair.baseToken);
        
        if (!seenMints.has(token.address)) {
            seenMints.add(token.address);
            result.push({
                mint: token.address,
                ticker: token.symbol,
                name: token.name
            });
        }
    }
    console.log(result.slice(0, 5));
}
run();
