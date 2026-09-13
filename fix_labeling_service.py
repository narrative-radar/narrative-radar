import os

filepath = "src/lib/server/services/labeling.service.ts"
with open(filepath, 'r') as f: content = f.read()

fallback_code = """
function getFrequencyFallback(tokenNames: string[]) {
	const STOP_WORDS = new Set(['coin', 'token', 'inu', 'the', 'of', '2.0', '1.0', '3.0', 'and', 'a', 'in', 'on', 'for', 'to']);
	const counts = new Map<string, number>();
	for (const name of tokenNames) {
		const words = name.toLowerCase().replace(/[^a-z0-9\\s]/g, ' ').split(/\\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w) && isNaN(Number(w)));
		const uniqueWords = new Set(words);
		for (const w of uniqueWords) {
			counts.set(w, (counts.get(w) || 0) + 1);
		}
	}
	let bestWord = null;
	let maxCount = 0;
	for (const [word, count] of counts.entries()) {
		if (count >= 2 && count > maxCount) {
			maxCount = count;
			bestWord = word;
		}
	}
	return bestWord || "unnamed cluster";
}

"""

if "function getFrequencyFallback" not in content:
    content = content.replace("export async function generateClusterLabel(", fallback_code + "export async function generateClusterLabel(")

# Now find the catch block to use it.
# catch (error) {
#    console.error('Error generating cluster label:', error);
#    // Fallback if LLM fails
#    return `${tokenNames[0].split(' ')[0].toLowerCase()}`;
# }

old_catch = """	} catch (error) {
		console.error('Error generating cluster label:', error);
		// Fallback if LLM fails
		return `${tokenNames[0].split(' ')[0].toLowerCase()}`;
	}"""
	
new_catch = """	} catch (error) {
		console.error('Error generating cluster label:', error);
		// Fallback to frequency if LLM fails
		return getFrequencyFallback(tokenNames);
	}"""

if old_catch in content:
    content = content.replace(old_catch, new_catch)
else:
    # Just in case formatting is different
    import re
    content = re.sub(r'catch\s*\([^)]*\)\s*\{\s*console.error[^}]+return[^}]+\}', 
                     r'catch (error) { console.error("Error generating cluster label:", error); return getFrequencyFallback(tokenNames); }', 
                     content, flags=re.MULTILINE)

with open(filepath, 'w') as f: f.write(content)
