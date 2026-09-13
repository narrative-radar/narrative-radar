import { GoogleGenerativeAI } from '@google/generative-ai';

async function generateClusterLabel(tokenNames: string[], tokenTickers: string[]): Promise<string> {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) return 'No API KEY';

	const prompt = `Based on these recent crypto token launches, give me a short, catchy, 2-4 word narrative theme that connects them.
	Tokens:
	${tokenNames.map((n, i) => `- ${n} (${tokenTickers[i]})`).join('\n')}
	Label:`;

	try {
		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
		const result = await model.generateContent(prompt);
		return result.response.text();
	} catch (error) {
        console.error("Error generating label:", error);
		return `Error`;
	}
}

generateClusterLabel(['NVIDIA • Robinhood Token', 'Alphabet Class A • Robinhood Token', 'SPDR Gold Shares • Robinhood Token'], ['NVDA', 'GOOGL', 'GLD']).then(console.log);
