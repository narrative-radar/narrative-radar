import os

filepath = "src/routes/(marketing)/+page.svelte"
with open(filepath, 'r') as f: content = f.read()

# Replace "</div>\n</div>\n<style>" with "</div>\n<style>"
content = content.replace("</div>\n</div>\n<style>", "</div>\n<style>")

with open(filepath, 'w') as f: f.write(content)
