import re

def fix_pinned_bg():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # Make the right side of the pinned section transparent
    content = content.replace(
        '<div class="w-full md:w-1/2 h-full bg-[#05080C] border-l border-[var(--rule)] relative hidden md:flex items-center justify-center overflow-hidden">',
        '<div class="w-full md:w-1/2 h-full bg-transparent border-l border-[var(--rule)] relative hidden md:flex items-center justify-center overflow-hidden">'
    )

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

fix_pinned_bg()
