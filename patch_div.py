import re

def patch_div():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()
        
    content = content.replace("<style>", "</div>\n</div>\n\n<style>")
    
    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

patch_div()
