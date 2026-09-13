import postgres from 'postgres';
import Anthropic from '@anthropic-ai/sdk';

const sql = postgres(process.env.DATABASE_URL!);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function run() {
    const targets = ['币', '中', '罗', '富', 'just'];
    const clusters = await sql`SELECT id, label FROM clusters WHERE label = ANY(${targets})`;
    
    console.log(`Found ${clusters.length} target clusters.`);
    
    for (const cluster of clusters) {
        console.log(`\nProcessing: "${cluster.label}"`);
        const tokens = await sql`SELECT name, ticker FROM tokens WHERE cluster_id = ${cluster.id}`;
        const names = tokens.map(t => t.name);
        const tickers = tokens.map(t => t.ticker);
        
        const prompt = `Based on these recent crypto token launches, give me a short, catchy, 2-4 word narrative theme that connects them. 
Make it plural. Use lowercase. Examples: "dog memes", "tokenized stocks", "chinese memecoins", "ponzi jokes".

CRITICAL RULES:
- You MUST return 2-4 words.
- DO NOT return a single word.
- DO NOT just return the raw token name.

Tokens:\n` + names.map((n, i) => `- ${n} (${tickers[i]})`).join('\n') + `\n\nLabel (just the text, no quotes):`;

        try {
            const msg = await anthropic.messages.create({
				model: "claude-haiku-4-5-20251001",
				max_tokens: 20,
				temperature: 0.1,
				messages: [ { role: "user", content: prompt } ]
			});
            
            if (msg.content[0].type === 'text') {
				let newLabel = msg.content[0].text.trim().toLowerCase();
				newLabel = newLabel.replace(/^\"|\"$/g, '').replace(/\*/g, '').trim(); 
				newLabel = newLabel.replace(/^narrative:\s*/i, '').replace(/^tema:\s*/i, '').trim();
				
                console.log(` -> SUCCESS! New Label: "${newLabel}"`);
                await sql`UPDATE clusters SET label = ${newLabel} WHERE id = ${cluster.id}`;
			}
        } catch(e) {
            console.error(` -> ERROR from Claude:`, e.message || e);
        }
        
        await new Promise(r => setTimeout(r, 1500));
    }
    
    process.exit(0);
}
run();
