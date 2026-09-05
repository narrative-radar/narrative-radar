import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const apiKey = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY')).split('=')[1].replace(/"/g, '');
const genAI = new GoogleGenerativeAI(apiKey);

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0; let normA = 0; let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function run() {
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });
    const res = await model.batchEmbedContents({
        requests: [
            { content: { role: 'user', parts: [{ text: "Doge Coin (DOGE)" }] } },
            { content: { role: 'user', parts: [{ text: "Shiba Inu (SHIB)" }] } },
            { content: { role: 'user', parts: [{ text: "AI trading bot (AIBOT)" }] } }
        ]
    });
    
    const v1 = res.embeddings[0].values;
    const v2 = res.embeddings[1].values;
    const v3 = res.embeddings[2].values;
    
    console.log("Doge vs Shiba:", cosineSimilarity(v1, v2));
    console.log("Doge vs AI Bot:", cosineSimilarity(v1, v3));
}
run();
