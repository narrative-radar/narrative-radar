import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
	const apiKey = process.env.GEMINI_API_KEY;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        console.log(data);
    } catch(e) { console.error(e) }
}

listModels();
