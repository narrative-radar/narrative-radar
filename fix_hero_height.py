import re

def fix_hero():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # Change items-stretch to items-center in the hero grid
    content = content.replace(
        'grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch relative z-10',
        'grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10'
    )
    
    # Remove mt-auto from the demo CTA to let the box shrink to fit
    content = content.replace(
        '<a href="/radar" class="mt-auto h-[44px] rounded-xl bg-[var(--live)]',
        '<a href="/radar" class="mt-6 h-[44px] rounded-xl bg-[var(--live)]'
    )
    
    # Also remove mt-auto from the stats on the left just in case
    content = content.replace(
        'class="grid grid-cols-3 gap-3 mt-auto pt-6"',
        'class="grid grid-cols-3 gap-3 pt-4"'
    )

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

fix_hero()
