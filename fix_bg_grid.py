import re

def fix_bg_grid():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # 1. FIX HERO GRID (Make it 2 columns earlier to prevent stacking)
    content = content.replace(
        'grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10',
        'grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10'
    )

    # 2. FIX PARALLAX BACKGROUND (Make it fixed and always visible)
    old_bg = """<div class="absolute top-0 left-0 w-full h-[1200px] overflow-hidden pointer-events-none z-0">
      <div class="absolute right-[-120px] top-[-60px] w-[820px] h-[820px] flex items-center justify-center" style="opacity: {Math.max(0.10, 1 - (scrollY || 0) / 400)}; transform: translateY({(scrollY || 0) * 0.4}px);">
        <!-- Glow -->
        <div class="absolute inset-0" style="background: radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.25), transparent 70%);"></div>
        <!-- Logo -->
        <img src="/images/logo.png" alt="Tycho Logo" class="absolute w-[600px] h-[600px] opacity-[0.08] object-contain rotate-[-15deg]" />
      </div>
    </div>"""
    
    new_bg = """<div class="fixed top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
      <div class="absolute right-[-120px] top-[10vh] w-[820px] h-[820px] flex items-center justify-center" style="transform: translateY({(scrollY || 0) * -0.15}px);">
        <!-- Glow -->
        <div class="absolute inset-0" style="background: radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.18), transparent 70%);"></div>
        <!-- Logo -->
        <img src="/images/logo.png" alt="Tycho Logo" class="absolute w-[600px] h-[600px] opacity-[0.08] object-contain rotate-[-15deg]" />
      </div>
    </div>"""
    
    content = content.replace(old_bg, new_bg)

    # 3. MAKE BACKGROUNDS TRANSPARENT SO LOGO SHOWS THROUGH
    # Sticky section: bg-[var(--ink)] -> bg-[#06130D]/80 backdrop-blur-md
    content = content.replace(
        'class="h-auto md:h-[150vh] bg-[var(--ink)] relative border-b border-[var(--rule)]"',
        'class="h-auto md:h-[150vh] bg-[#06130D]/70 backdrop-blur-sm relative border-b border-[var(--rule)]"'
    )
    # The sticky section left panel has bg-[var(--ink)] in some places? No, it's just the parent.
    
    # 4. Give the Pare-style sections a semi-transparent backdrop too if needed
    # Actually, they just don't have backgrounds, so they already let the fixed background show through!
    
    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

fix_bg_grid()
