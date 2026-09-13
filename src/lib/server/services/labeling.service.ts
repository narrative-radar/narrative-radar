import { env } from '$env/dynamic/private';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Service to call LLM for generating a short, catchy theme label.
 * (e.g. "retro game villains", "ai poker bots")
 */

function getFrequencyFallback(tokenNames: string[]) {
	const STOP_WORDS = new Set(['coin', 'token', 'inu', 'the', 'of', '2.0', '1.0', '3.0', 'and', 'a', 'in', 'on', 'for', 'to']);
	
	// Pre-process: lowercase
	const lowerNames = tokenNames.map(n => n.toLowerCase());
	
	const allWordsCount = new Map<string, number>();
	const cjkCount = new Map<string, number>();
	const tokenWordSets: Set<string>[] = [];
	
	for (const name of lowerNames) {
		const words = name.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 1 && isNaN(Number(w)));
		const uniqueWords = new Set(words);
		tokenWordSets.push(uniqueWords);
		for (const w of uniqueWords) {
			allWordsCount.set(w, (allWordsCount.get(w) || 0) + 1);
		}
		
		// CJK characters detection (Chinese, Japanese, Korean)
		const cjkChars = name.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\uFAFF\uFF66-\uFF9F]/g);
		if (cjkChars) {
			const uniqueCjk = new Set(cjkChars);
			for (const c of uniqueCjk) {
				cjkCount.set(c, (cjkCount.get(c) || 0) + 1);
			}
		}
	}
	
	// Separate candidates
	let bestNonStopword = null;
	let maxNonStopword = 0;
	let bestStopword = null;
	let maxStopword = 0;
	
	for (const [word, count] of allWordsCount.entries()) {
		if (count >= 2) {
			if (STOP_WORDS.has(word)) {
				if (count > maxStopword) { maxStopword = count; bestStopword = word; }
			} else {
				if (count > maxNonStopword) { maxNonStopword = count; bestNonStopword = word; }
			}
		}
	}
	
	// 1. Non-stopword full word
	if (bestNonStopword) return bestNonStopword;
	
	// 2. Substrings >= 4 chars
	const allSubstrings = new Map<string, number>();
	for (const name of lowerNames) {
		const cleanName = name.replace(/[^a-z0-9]/g, '');
		const substrings = new Set<string>();
		for (let i = 0; i < cleanName.length; i++) {
			for (let j = i + 4; j <= cleanName.length; j++) {
				substrings.add(cleanName.substring(i, j));
			}
		}
		for (const sub of substrings) {
			allSubstrings.set(sub, (allSubstrings.get(sub) || 0) + 1);
		}
	}
	let bestSubstring = null;
	let maxSubstring = 0;
	for (const [sub, count] of allSubstrings.entries()) {
		if (count >= 2 && count > maxSubstring && !STOP_WORDS.has(sub)) {
			maxSubstring = count;
			bestSubstring = sub;
		} else if (count >= 2 && count === maxSubstring && !STOP_WORDS.has(sub) && sub.length > (bestSubstring?.length || 0)) {
			bestSubstring = sub; // Prefer longer substring on tie
		}
	}
	if (bestSubstring) return bestSubstring;
	
	// 3. CJK Characters
	let bestCjk = null;
	let maxCjk = 0;
	for (const [char, count] of cjkCount.entries()) {
		if (count >= 2 && count > maxCjk) {
			maxCjk = count;
			bestCjk = char;
		}
	}
	if (bestCjk) return bestCjk;
	
	// 4. Stopword full word
	if (bestStopword) return bestStopword;
	
	return "unnamed cluster";
}

export async function generateClusterLabel(tokenNames: string[], tokenTickers: string[]): Promise<string> {
	const prompt = `
	Based on these recent crypto token launches, give me a short, catchy, 2-4 word narrative theme that connects them. 
	Make it plural. Use lowercase. Examples: "dog memes", "tokenized stocks", "chinese memecoins", "ponzi jokes".
	
	CRITICAL RULES:
	- You MUST return 2-4 words.
	- DO NOT return a single word.
	- DO NOT just return the raw token name.
	
	Tokens:
	${tokenNames.map((n, i) => `- ${n} (${tokenTickers[i]})`).join('\n')}
	
	Label (just the text, no quotes):`;

	// 1. Try Gemini
	if (env.GEMINI_API_KEY) {
		try {
			const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
			const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
			const result = await model.generateContent(prompt);
			let label = result.response.text().trim().toLowerCase();
			label = label.replace(/^\"|\"$/g, '').replace(/\*/g, '').trim(); 
			label = label.replace(/^narrative:\s*/i, '').replace(/^tema:\s*/i, '').trim();
			return label;
		} catch (error) { 
			console.error("[Labeling] Gemini failed:", error); 
		}
	}

	// 2. Try Claude
	if (env.ANTHROPIC_API_KEY) {
		try {
			const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
			const msg = await anthropic.messages.create({
				model: "claude-haiku-4-5-20251001",
				max_tokens: 20,
				temperature: 0.1,
				messages: [
					{
						role: "user",
						content: prompt
					}
				]
			});
			if (msg.content[0].type === 'text') {
				let label = msg.content[0].text.trim().toLowerCase();
				label = label.replace(/^\"|\"$/g, '').replace(/\*/g, '').trim(); 
				label = label.replace(/^narrative:\s*/i, '').replace(/^tema:\s*/i, '').trim();
				return label;
			}
		} catch(error) {
			console.error("[Labeling] Claude failed:", error); 
		}
	}

	// 3-6. Fallback local frequency
	return getFrequencyFallback(tokenNames);
}
