import re

def fix_gemini():
    with open('src/lib/server/services/labeling.service.ts', 'r') as f:
        content = f.read()

    # Change gemini-1.5-flash to gemini-1.5-flash-latest
    content = content.replace("model: 'gemini-1.5-flash'", "model: 'gemini-1.5-flash-latest'")

    with open('src/lib/server/services/labeling.service.ts', 'w') as f:
        f.write(content)

fix_gemini()
