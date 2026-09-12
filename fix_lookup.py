import re

def fix_lookup():
    with open('src/lib/features/radar/components/TokenLookup.svelte', 'r') as f:
        content = f.read()

    # Change button text
    content = content.replace("Access Terminal View", "View Cluster")

    with open('src/lib/features/radar/components/TokenLookup.svelte', 'w') as f:
        f.write(content)

fix_lookup()
