import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const apiKey = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY')).split('=')[1].replace(/"/g, '');

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-embedding-1.5' });

async function run() {
  try {
    const model2 = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const res = await model2.batchEmbedContents({
        requests: [{ content: { role: 'user', parts: [{ text: "Hello" }] } }]
    });
    console.log(res);
  } catch(e) {
    console.log(e.message);
  }
}
run();
