import re

wave_html = """
          <!-- Active Wave -->
          <div class="absolute -bottom-[1px] left-0 w-full flex items-end justify-between gap-[1px] h-[3px]">
            <div class="flex-1 bg-[var(--live)] animate-[wave_1s_ease-in-out_infinite_alternate] h-[40%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.2s_ease-in-out_infinite_alternate_0.2s] h-[100%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_0.8s_ease-in-out_infinite_alternate_0.4s] h-[60%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.4s_ease-in-out_infinite_alternate_0.6s] h-[80%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1s_ease-in-out_infinite_alternate_0.3s] h-[50%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.1s_ease-in-out_infinite_alternate_0.1s] h-[90%]"></div>
          </div>
"""

def patch_tabs(file_path, is_marketing):
    with open(file_path, 'r') as f:
        content = f.read()
        
    old_nav_regex = re.compile(r'<nav class="hidden md:flex items-center gap-8 font-mono text-\[11px\] uppercase tracking-widest mt-1">.*?</nav>', re.DOTALL)
    
    if is_marketing:
        new_nav = f"""<nav class="hidden md:flex items-center gap-8 font-mono text-[11px] uppercase tracking-widest mt-1">
        <a href="/" class="relative pb-2 transition-colors text-white font-bold">
          Overview
          {wave_html}
        </a>
        <a href="/radar" class="relative pb-2 transition-colors text-[var(--dim)] hover:text-white">
          Terminal_OS
        </a>
        <a href="/track-record" class="relative pb-2 transition-colors text-[var(--dim)] hover:text-white">
          Track Record
        </a>
      </nav>"""
    else:
        new_nav = f"""<nav class="hidden md:flex items-center gap-8 font-mono text-[11px] uppercase tracking-widest mt-1">
        <a href="/" class="relative pb-2 transition-colors {{ $page.url.pathname === '/' ? 'text-white font-bold' : 'text-[var(--dim)] hover:text-white' }}">
          Overview
          {{#if $page.url.pathname === '/'}}{wave_html}{{/if}}
        </a>
        <a href="/radar" class="relative pb-2 transition-colors {{ $page.url.pathname === '/radar' ? 'text-white font-bold' : 'text-[var(--dim)] hover:text-white' }}">
          Terminal_OS
          {{#if $page.url.pathname === '/radar'}}{wave_html}{{/if}}
        </a>
        <a href="/track-record" class="relative pb-2 transition-colors {{ $page.url.pathname === '/track-record' ? 'text-white font-bold' : 'text-[var(--dim)] hover:text-white' }}">
          Track Record
          {{#if $page.url.pathname === '/track-record'}}{wave_html}{{/if}}
        </a>
      </nav>"""
      
    content = old_nav_regex.sub(new_nav, content)
    
    with open(file_path, 'w') as f:
        f.write(content)

patch_tabs('src/routes/(app)/+layout.svelte', False)
patch_tabs('src/routes/(marketing)/+page.svelte', True)
