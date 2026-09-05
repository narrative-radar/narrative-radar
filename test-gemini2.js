import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const apiKey = envFile.split('\n').find(line => line.startsWith('GEMINI_API_KEY')).split('=')[1].replace(/"/g, '');

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

async function run() {
  try {
    const res = await model.embedContent("Hello world");
    console.log(res);
  } catch(e){
    console.log("Failed 004");
  }

  try {
    const model2 = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    console.log("Got model", model2.model);
    console.log(await model2.embedContent("Hello world"));
  } catch(e) {
    console.log("Failed 001", e);
  }
}
run();
