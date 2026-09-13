import os

filepath = "src/lib/server/services/labeling.service.ts"
with open(filepath, 'r') as f: content = f.read()

content = content.replace('} catch (error) { console.error("Error generating cluster label:", error); return getFrequencyFallback(tokenNames); }`;\n\t}\n}', 
                          '} catch (error) {\n\t\tconsole.error("Error generating cluster label:", error);\n\t\treturn getFrequencyFallback(tokenNames);\n\t}\n}')

with open(filepath, 'w') as f: f.write(content)
