import os

filepath = "src/lib/server/services/labeling.service.ts"
with open(filepath, 'r') as f: content = f.read()

gemini_block = """	// 1. Try Gemini
	if (env.GEMINI_API_KEY) {
		try {
			const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
			const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
			const result = await model.generateContent(prompt);
			let label = result.response.text().trim().toLowerCase();
			label = label.replace(/^\\"|\\"$/g, '').replace(/\\*/g, '').trim(); 
			label = label.replace(/^narrative:\\s*/i, '').replace(/^tema:\\s*/i, '').trim();
			return label;
		} catch (error) { 
			console.error("[Labeling] Gemini failed:", error); 
		}
	}"""

claude_block = """	// 2. Try Claude
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
				label = label.replace(/^\\"|\\"$/g, '').replace(/\\*/g, '').trim(); 
				label = label.replace(/^narrative:\\s*/i, '').replace(/^tema:\\s*/i, '').trim();
				return label;
			}
		} catch(error) {
			console.error("[Labeling] Claude failed:", error); 
		}
	}"""

new_claude = claude_block.replace("// 2. Try Claude", "// 1. Try Claude (Primary)")
new_gemini = gemini_block.replace("// 1. Try Gemini", "// 2. Try Gemini (Fallback 1)")

old_combined = gemini_block + "\n\n" + claude_block
new_combined = new_claude + "\n\n" + new_gemini

content = content.replace(old_combined, new_combined)

with open(filepath, 'w') as f: f.write(content)
