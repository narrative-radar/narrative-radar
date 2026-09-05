import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const apiKey = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY')).split('=')[1].replace(/"/g, '');

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'embedding-001' });

async function run() {
  try {
    const res = await model.embedContent("Hello world");
    console.log("embedding-001 length:", res.embedding.values.length);
  } catch(e) {
    console.log("embedding-001 failed", e.message);
  }
}
run();
