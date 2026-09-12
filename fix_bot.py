import re

def fix_bot():
    with open('src/routes/api/cron/post-update/+server.ts', 'r') as f:
        content = f.read()

    # Prevent duplicate tweets by adding a unique identifier (cluster ID suffix)
    old_text = 'const text = `⚠️ NARRATIVE BREAKOUT: ${label} (${memberCount} tokens) - tycho.xyz/radar`;'
    new_text = 'const text = `⚠️ NARRATIVE BREAKOUT: ${label} (${memberCount} tokens)\\n\\n[ID: ${cluster.id.slice(-6)}] - tycho.xyz/radar`;'
    
    content = content.replace(old_text, new_text)

    with open('src/routes/api/cron/post-update/+server.ts', 'w') as f:
        f.write(content)

fix_bot()
