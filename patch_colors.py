import re

def patch_colors():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # Change terminal text colors to grayscale/white theme
    content = content.replace(":global(.k) { color: var(--violet); text-shadow: 0 0 8px rgba(167, 139, 250, 0.3); }", ":global(.k) { color: #E2E8F0; font-weight: bold; }")
    content = content.replace(":global(.s) { color: var(--live); text-shadow: 0 0 8px rgba(52, 211, 153, 0.3); }", ":global(.s) { color: #94A3B8; }")
    content = content.replace(":global(.n) { color: var(--cyan); text-shadow: 0 0 8px rgba(56, 189, 248, 0.3); }", ":global(.n) { color: #CBD5E1; }")
    content = content.replace(":global(.c) { color: #486351; font-style: italic; }", ":global(.c) { color: #64748B; font-style: italic; }")

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

patch_colors()
