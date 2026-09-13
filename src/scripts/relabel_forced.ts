import postgres from 'postgres';
import { GoogleGenerativeAI } from '@google/generative-ai';

const sql = postgres(process.env.DATABASE_URL!);

async function run() {
    const allClusters = await sql`SELECT id, label FROM clusters`;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    for (const cluster of allClusters) {
        if (!cluster.label) continue;
        
        const words = cluster.label.trim().split(/\s+/);
        if (words.length > 1) continue; 
        
        console.log(`Forced Relabeling: "${cluster.label}"`);
        const tokens = await sql`SELECT name, ticker FROM tokens WHERE cluster_id = ${cluster.id}`;
        const namesList = tokens.map((t: any) => `- ${t.name} (${t.ticker})`).join('\n');
        
        const prompt = `Berikut nama-nama token dalam satu kelompok:\n${namesList}\n\nBeri nama tema 2-4 kata yang menggambarkan kesamaan mereka (Gunakan bahasa inggris, lowercase, plural). Contoh: "cat memecoins", "tokenized AI", "chinese characters".\nJANGAN berikan output satu kata. JANGAN hanya mengulang nama token.\n\nTema:`;
        
        try {
            const result = await model.generateContent(prompt);
            let newLabel = result.response.text().replace(/^\"|\"$/g, '').replace(/\*/g, '').trim().toLowerCase();
            newLabel = newLabel.replace(/^narrative:\s*/i, '').replace(/^tema:\s*/i, '').trim();
            
            if (newLabel.split(/\s+/).length === 1) {
                newLabel = "unnamed cluster";
            }
            
            await sql`UPDATE clusters SET label = ${newLabel} WHERE id = ${cluster.id}`;
            console.log(` -> New label: "${newLabel}"`);
        } catch(e) {
            console.error(` -> Error:`, e);
        }
        
        await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log("Done forced relabeling.");
    process.exit(0);
}
run();
