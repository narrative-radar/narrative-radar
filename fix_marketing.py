import re

def fix():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # Add Manifesto tab
    old_nav = """        <a href="/track-record" class="relative pb-2 transition-colors text-[var(--dim)] hover:text-white">
          Track Record
        </a>
      </nav>"""
      
    new_nav = """        <a href="/track-record" class="relative pb-2 transition-colors text-[var(--dim)] hover:text-white">
          Track Record
        </a>
        <a href="/manifesto" class="relative pb-2 transition-colors text-[var(--dim)] hover:text-white">
          Manifesto
        </a>
      </nav>"""
    content = content.replace(old_nav, new_nav)

    # Add X icon
    old_status = """    <div class="flex items-center gap-6">
      <a href="/radar" class="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold text-xs tracking-wider uppercase rounded-md hover:bg-gray-200 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        Launch Dashboard
      </a>
    </div>
  </header>"""
    
    new_status = """    <div class="flex items-center gap-6">
      <a href="https://x.com/TychoRadar" target="_blank" rel="noopener noreferrer" class="text-[var(--dim)] hover:text-white transition-colors hidden sm:block">
        <svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      <a href="/radar" class="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold text-xs tracking-wider uppercase rounded-md hover:bg-gray-200 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        Launch Dashboard
      </a>
    </div>
  </header>"""
    
    # Wait, the marketing header right side has a "Launch Dashboard" button, not the system status block! Let's check if the replacement matches.
    # If not, let's just do a simpler replace.
    if old_status in content:
        content = content.replace(old_status, new_status)
    else:
        # Check what the actual right side is
        pass

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

fix()
