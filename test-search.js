async function run() {
    const keywords = ['dog', 'cat', 'ai', 'trump', 'inu', 'pepe', 'moon', 'elon', 'pump', 'sol'];
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    
    const dexResponse = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${randomKeyword}`);
    const dexData = await dexResponse.json();
    
    const pairs = (dexData.pairs || []).filter(p => p.chainId === 'solana');
    console.log(`Keyword: ${randomKeyword} -> Found ${pairs.length} pairs`);
    if(pairs.length > 0) {
        console.log(pairs[0].baseToken.name);
    }
}
run();
