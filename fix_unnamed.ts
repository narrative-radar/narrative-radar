import postgres from 'postgres';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

const sql = postgres(process.env.DATABASE_URL!);

function getFrequencyFallback(tokenNames: string[]) {
	const STOP_WORDS = new Set(['coin', 'token', 'inu', 'the', 'of', '2.0', '1.0', '3.0', 'and', 'a', 'in', 'on', 'for', 'to']);
	const lowerNames = tokenNames.map(n => n.toLowerCase());
	const allWordsCount = new Map<string, number>();
	const cjkCount = new Map<string, number>();
	
	for (const name of lowerNames) {
		const words = name.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 1 && isNaN(Number(w)));
		const uniqueWords = new Set(words);
		for (const w of uniqueWords) {
			allWordsCount.set(w, (allWordsCount.get(w) || 0) + 1);
		}
		const cjkChars = name.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\uFAFF\uFF66-\uFF9F]/g);
		if (cjkChars) {
			const uniqueCjk = new Set(cjkChars);
			for (const c of uniqueCjk) {
				cjkCount.set(c, (cjkCount.get(c) || 0) + 1);
			}
		}
	}
	
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
	
	if (bestNonStopword) return bestNonStopword;
	
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
			bestSubstring = sub; 
		}
	}
	if (bestSubstring) return bestSubstring;
	
	let bestCjk = null;
	let maxCjk = 0;
	for (const [char, count] of cjkCount.entries()) {
		if (count >= 2 && count > maxCjk) {
			maxCjk = count;
			bestCjk = char;
		}
	}
	if (bestCjk) return bestCjk;
	
	if (bestStopword) return bestStopword;
	
	return "unnamed cluster";
}

async function run() {
    const unnamedClusters = await sql`SELECT id, label FROM clusters WHERE label = 'unnamed cluster'`;
    
    for (const cluster of unnamedClusters) {
        const tokens = await sql`SELECT name, ticker FROM tokens WHERE cluster_id = ${cluster.id}`;
        const names = tokens.map(t => t.name);
        const tickers = tokens.map(t => t.ticker);
        
        let newLabel = getFrequencyFallback(names);
        
        await sql`UPDATE clusters SET label = ${newLabel} WHERE id = ${cluster.id}`;
        console.log(`Updated ${cluster.id} -> ${newLabel}`);
    }
    process.exit(0);
}
run();
