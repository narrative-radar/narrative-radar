import re

def fix():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    old_status = """    <div class="text-[8px] md:text-[11px] font-mono text-[var(--faint)] uppercase tracking-widest px-4 py-1.5 bg-[#090D13] border-l-2 border-[var(--live)]" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);">
      system status: <span class="text-[var(--live)] font-bold animate-pulse">autonomous</span>
    </div>
  </header>"""
  
    new_status = """    <div class="flex items-center gap-4">
      <a href="https://x.com/TychoRadar" target="_blank" rel="noopener noreferrer" class="text-[var(--dim)] hover:text-white transition-colors">
        <svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      <div class="hidden sm:block text-[8px] md:text-[11px] font-mono text-[var(--faint)] uppercase tracking-widest px-4 py-1.5 bg-[#090D13] border-l-2 border-[var(--live)]" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);">
        system status: <span class="text-[var(--live)] font-bold animate-pulse">autonomous</span>
      </div>
    </div>
  </header>"""

    if old_status in content:
        content = content.replace(old_status, new_status)
        with open('src/routes/(marketing)/+page.svelte', 'w') as f:
            f.write(content)

fix()
