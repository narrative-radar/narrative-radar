import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const apiKey = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY')).split('=')[1].replace(/"/g, '');

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    const model2 = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });
    const res = await model2.batchEmbedContents({
        requests: [{ content: { role: 'user', parts: [{ text: "Hello" }] } }]
    });
    console.log("batchEmbedContents gemini-embedding-2 length:", res.embeddings[0].values.length);
  } catch(e) {
    console.log("batch failed", e.message);
  }
}
run();
