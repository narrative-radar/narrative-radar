import re

def patch_scroll_logo():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # 1. Add overflow-x-hidden to the main container or body
    # At the top of the file, we have:
    # <div class="site-bg">
    # Let's change it to <div class="site-bg overflow-x-hidden relative">
    if '<div class="site-bg">' in content:
        content = content.replace('<div class="site-bg">', '<div class="site-bg overflow-x-hidden relative">')

    # 2. Add the logo parallax
    # Find the glow div:
    # <!-- Parallax Glow -->
    # <div class="absolute right-[-120px] top-[-60px] w-[820px] h-[640px] pointer-events-none -z-10 transition-opacity duration-300" style="background: radial-gradient(ellipse at 60% 40%, rgba(52,211,153,0.16), rgba(52,211,153,0.04) 45%, transparent 68%); opacity: {Math.max(0.12, 1 - (scrollY || 0) / 520)};"></div>
    
    old_glow = """<!-- Parallax Glow -->
    <div class="absolute right-[-120px] top-[-60px] w-[820px] h-[640px] pointer-events-none -z-10 transition-opacity duration-300" style="background: radial-gradient(ellipse at 60% 40%, rgba(52,211,153,0.16), rgba(52,211,153,0.04) 45%, transparent 68%); opacity: {Math.max(0.12, 1 - (scrollY || 0) / 520)};"></div>"""
    
    new_glow = """<!-- Parallax Background & Logo -->
    <div class="absolute right-[-120px] top-[-60px] w-[820px] h-[820px] pointer-events-none -z-10 flex items-center justify-center overflow-visible" style="opacity: {Math.max(0.10, 1 - (scrollY || 0) / 400)}; transform: translateY({(scrollY || 0) * 0.4}px);">
      <!-- Glow -->
      <div class="absolute inset-0" style="background: radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.25), transparent 70%);"></div>
      <!-- Logo -->
      <img src="/images/logo.png" alt="Tycho Logo" class="absolute w-[600px] h-[600px] opacity-[0.08] object-contain rotate-[-15deg]" />
    </div>"""

    if old_glow in content:
        content = content.replace(old_glow, new_glow)
    else:
        # If it wasn't matched exactly, fallback to regex
        pattern = re.compile(r'<!-- Parallax Glow -->\n\s*<div class="absolute right-\[-120px\].*?</div>', re.DOTALL)
        content = pattern.sub(new_glow, content)

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

patch_scroll_logo()
