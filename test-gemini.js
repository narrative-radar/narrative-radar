import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const apiKey = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY')).split('=')[1].replace(/"/g, '');

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

async function run() {
  try {
    const res = await model.embedContent("Hello world");
    console.log("Single embed success, length:", res.embedding.values.length);
  } catch (e) {
    console.error("Single embed error:", e.message);
  }
}
run();
