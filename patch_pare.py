import re

def patch_pare():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # 1. We need to replace the entire Hero up to the howWorksRef with a Pare-style split hero
    
    # Pare-style hero structure
    pare_hero = """<!-- Pare-style Hero Section -->
  <div class="max-w-[1344px] mx-auto px-6 pt-16 md:pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
    
    <!-- Left Copy -->
    <div class="flex flex-col">
      <div class="mb-4">
        <span class="inline-flex items-center gap-2 px-3 py-1 bg-[var(--live)]/10 border border-[var(--live)]/30 text-[var(--live)] font-mono text-[11px] font-medium tracking-wider uppercase rounded-full">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--live)] animate-pulse shadow-[0_0_8px_var(--live)]"></span>
          Live Robinhood Radar
        </span>
      </div>
      
      <h1 class="text-[44px] md:text-[64px] font-medium leading-[1.1] tracking-tight mb-6" use:scrambleText={"See the meta before it's the meta."}>
        See the meta before it's the meta.
      </h1>
      
      <p class="text-[var(--dim)] text-[18px] max-w-[520px] leading-relaxed mb-8">
        A completely autonomous pipeline that turns raw blockchain noise into readable narrative signals. Grouped by AI, not by hand.
      </p>
      
      <div class="flex gap-4 mb-12">
        <a href="/radar" class="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-[var(--live)] text-[#06130D] font-semibold hover:bg-[#56ECB6] transition-colors">
          Launch Dashboard
        </a>
        <a href="/track-record" class="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-[var(--panel2)] text-white font-medium hover:bg-[var(--panel)] transition-colors">
          Track Record
        </a>
      </div>
      
      <!-- Pare-style Stats -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-[var(--panel)] rounded-xl p-4 relative overflow-hidden">
          <div class="font-mono text-2xl font-medium text-white mb-1">{liveTokensTracked > 0 ? liveTokensTracked.toLocaleString() : '14,029'}</div>
          <div class="text-[11px] color-[var(--dim)] text-[#666D67]">Tokens ingested today</div>
          <div class="absolute left-4 bottom-0 w-7 h-0.5 bg-[var(--live)] rounded-full"></div>
        </div>
        <div class="bg-[var(--panel)] rounded-xl p-4 relative overflow-hidden">
          <div class="font-mono text-2xl font-medium text-white mb-1">{liveClusters.length > 0 ? liveClusters.length : 24}</div>
          <div class="text-[11px] color-[var(--dim)] text-[#666D67]">Active narrative metas</div>
          <div class="absolute left-4 bottom-0 w-7 h-0.5 bg-[var(--banana)] rounded-full"></div>
        </div>
        <div class="bg-[var(--panel)] rounded-xl p-4 relative overflow-hidden">
          <div class="font-mono text-2xl font-medium text-white mb-1">&lt;2s</div>
          <div class="text-[11px] color-[var(--dim)] text-[#666D67]">Processing delay</div>
          <div class="absolute left-4 bottom-0 w-7 h-0.5 bg-[var(--cyan)] rounded-full"></div>
        </div>
      </div>
    </div>
    
    <!-- Right Demo (Terminal) -->
    <div class="relative bg-[var(--panel)] rounded-[16px] p-6 shadow-[0_30px_80px_rgba(0,0,0,.45),0_0_0_1px_rgba(60,227,167,.10)] border border-white/5">
      <div class="absolute right-4 top-4 flex items-center gap-2 text-[11px] text-[var(--dim)]">
        <span class="w-1.5 h-1.5 rounded-full bg-[var(--live)] shadow-[0_0_10px_var(--live)]"></span>
        reading stream...
      </div>
      
      <div class="flex items-center gap-1.5 mb-6">
        <div class="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
        <div class="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
        <div class="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
      </div>
      
      <div class="bg-[var(--panel2)] rounded-xl p-4 flex justify-between items-center mb-6 border border-white/5 focus-within:border-[var(--live)]/50 transition-colors">
        <div class="w-full">
          <div class="text-[11px] text-[var(--dim)] mb-1">Incoming Signal</div>
          <div class="font-mono text-2xl text-white">{@html formattedCode}<span class="cur"></span></div>
        </div>
      </div>
      
      <!-- Feed Data -->
      <div class="flex flex-col bg-[var(--panel2)] rounded-xl overflow-hidden border border-white/5">
        {#each feed as t}
          <div class="grid grid-cols-[20px_1fr_auto] gap-3 items-center p-3.5 border-b border-white/5 last:border-0 hover:bg-[var(--panel)] transition-colors">
            <div class="w-5 h-5 rounded-full flex items-center justify-center text-[8.5px] font-bold text-black" style="background-color: hsl({t.hue} 65% 58%)">TH</div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-white">{t.name}</span>
              </div>
              <div class="text-[11px] text-[var(--dim)] truncate">{t.lore}</div>
            </div>
            <div class="text-right">
              <div class="font-mono text-sm font-medium text-white">{t.holders.toLocaleString()}</div>
              <div class="text-[10px] text-[var(--dim)]">holders</div>
            </div>
          </div>
        {/each}
      </div>
      
      <a href="/radar" class="mt-6 w-full h-11 rounded-xl bg-[var(--panel2)] hover:bg-[var(--panel)] border border-white/5 text-white font-medium flex items-center justify-center transition-colors">
        View Full Terminal
      </a>
    </div>
  </div>"""

    # We need to cut out everything between `<header class="site-header` or whatever starts the hero, down to `<!-- Technical Process Panel`
    # Let's search for `<!-- Stacked Windows Scrollytelling -->` or `hero-stacked`
    start_cut = content.find('<div class="hero-stacked')
    if start_cut == -1:
        start_cut = content.find('<!-- Stacked Windows Scrollytelling -->')
        
    end_cut = content.find('<!-- Technical Process Panel (Pinned Scrollytelling) -->')
    
    if start_cut != -1 and end_cut != -1:
        content = content[:start_cut] + pare_hero + "\n  " + content[end_cut:]
        
    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

patch_pare()
