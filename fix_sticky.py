import re

def fix_sticky():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # 1. Remove overflow-x-hidden from site-bg
    if '<div class="site-bg overflow-x-hidden relative">' in content:
        content = content.replace('<div class="site-bg overflow-x-hidden relative">', '<div class="site-bg">')

    # 2. Extract the parallax element from inside the Hero
    glow_pattern = re.compile(r'<!-- Parallax Background & Logo -->\s*<div class="absolute right-\[-120px\].*?</div>\s*</div>', re.DOTALL)
    
    # We will just remove it from the hero and place a new wrapped version right before the hero.
    content = glow_pattern.sub('', content)
    
    # Re-insert before the hero
    hero_marker = '<!-- Pare-style Hero Section -->'
    
    new_glow_wrapper = """<!-- Parallax Background & Logo (Wrapped to prevent overflow scroll) -->
    <div class="absolute top-0 left-0 w-full h-[1200px] overflow-hidden pointer-events-none z-0">
      <div class="absolute right-[-120px] top-[-60px] w-[820px] h-[820px] flex items-center justify-center" style="opacity: {Math.max(0.10, 1 - (scrollY || 0) / 400)}; transform: translateY({(scrollY || 0) * 0.4}px);">
        <!-- Glow -->
        <div class="absolute inset-0" style="background: radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.25), transparent 70%);"></div>
        <!-- Logo -->
        <img src="/images/logo.png" alt="Tycho Logo" class="absolute w-[600px] h-[600px] opacity-[0.08] object-contain rotate-[-15deg]" />
      </div>
    </div>\n\n    """
    
    content = content.replace(hero_marker, new_glow_wrapper + hero_marker)
    
    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

fix_sticky()
