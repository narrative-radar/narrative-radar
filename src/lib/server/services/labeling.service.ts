import { env } from '$env/dynamic/private';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Service to call LLM for generating a short, catchy theme label.
 * (e.g. "retro game villains", "ai poker bots")
 * Switched to Gemini 1.5 Flash.
 */
export async function generateClusterLabel(tokenNames: string[], tokenTickers: string[]): Promise<string> {
	const apiKey = env.GEMINI_API_KEY;
	
	if (!apiKey) {
		console.warn('[Labeling] GEMINI_API_KEY is not set. Using fallback label.');
		return `Narrative: ${tokenNames[0].split(' ')[0]} & Co`;
	}

	const prompt = `
	Based on these recent crypto token launches, give me a short, catchy, 2-4 word narrative theme that connects them. 
	Make it plural. Use lowercase. Examples: "retro game villains", "cat cults", "ai poker bots".
	
	Tokens:
	${tokenNames.map((n, i) => `- ${n} (${tokenTickers[i]})`).join('\n')}
	
	Label (just the text, no quotes):`;

	try {
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
		
		const result = await model.generateContent(prompt);
		const responseText = result.response.text();
		
		let label = responseText.trim().toLowerCase();
		// Remove any quotes if the LLM included them
		label = label.replace(/^"|"$/g, ''); 
		return label;
	} catch (error) {
		console.error('[Labeling] Error generating label with Gemini:', error);
		return `Narrative: ${tokenNames[0].split(' ')[0]}...`;
	}
}
