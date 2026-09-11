import re

def restore_hero():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # Find where the Hero Section starts and where the Demo Box starts
    start_hero = content.find('<!-- Pare-style Hero Section -->')
    end_hero = content.find('<!-- Technical Process Panel (Pinned Scrollytelling) -->')
    
    if start_hero == -1 or end_hero == -1:
        print("Could not find hero boundaries!")
        return
        
    full_hero = """<!-- Pare-style Hero Section -->
  <div class="max-w-[1344px] mx-auto px-6 pt-16 md:pt-24 pb-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
    
    <!-- Left Copy -->
    <div class="flex flex-col">
      <div class="mb-4">
        <span class="inline-flex items-center gap-2 px-3 py-1 bg-[var(--live)]/10 border border-[var(--live)]/30 text-[var(--live)] font-mono text-[11px] font-medium tracking-wider uppercase rounded-md">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--live)] animate-pulse shadow-[0_0_8px_var(--live)]"></span>
          Live Robinhood Radar
        </span>
      </div>
      
      <h1 class="text-[44px] md:text-[64px] font-medium leading-[1.12] tracking-tight mb-5" use:scrambleText={"See the meta before it's the meta."}>
        See the meta before it's the meta.
      </h1>
      
      <p class="text-[var(--dim)] text-[18px] max-w-[520px] leading-[1.5] mb-8">
        A completely autonomous pipeline that turns raw blockchain noise into readable narrative signals. Grouped by AI, not by hand.
      </p>
      
      <div class="flex gap-3 mb-10 flex-wrap">
        <a href="/radar" class="inline-flex items-center justify-center h-[44px] px-6 rounded-xl bg-[var(--live)] text-[#06130D] font-semibold hover:bg-[#56ECB6] transition-colors">
          Launch Dashboard
        </a>
        <a href="/track-record" class="inline-flex items-center justify-center h-[44px] px-6 rounded-xl bg-[var(--panel2)] text-white font-medium hover:bg-[var(--panel)] transition-colors">
          Track Record
        </a>
      </div>
      
      <!-- Pare-style Stats (Bottom Aligned) -->
      <div class="grid grid-cols-3 gap-3 pt-4">
        <div class="bg-[var(--panel)] rounded-xl p-4 relative overflow-hidden">
          <div class="font-mono text-2xl font-medium text-white mb-1">{liveTokensTracked > 0 ? liveTokensTracked.toLocaleString() : '14,029'}</div>
          <div class="text-[11px] text-[var(--dim)]">Tokens ingested today</div>
          <div class="absolute left-4 bottom-0 w-7 h-[2px] bg-[var(--live)] rounded-full"></div>
        </div>
        <div class="bg-[var(--panel)] rounded-xl p-4 relative overflow-hidden">
          <div class="font-mono text-2xl font-medium text-white mb-1">{liveClusters.length > 0 ? liveClusters.length : 24}</div>
          <div class="text-[11px] text-[var(--dim)]">Active narrative metas</div>
          <div class="absolute left-4 bottom-0 w-7 h-[2px] bg-[var(--banana)] rounded-full"></div>
        </div>
        <div class="bg-[var(--panel)] rounded-xl p-4 relative overflow-hidden">
          <div class="font-mono text-2xl font-medium text-white mb-1">&lt;2s</div>
          <div class="text-[11px] text-[var(--dim)]">Processing delay</div>
          <div class="absolute left-4 bottom-0 w-7 h-[2px] bg-[var(--cyan)] rounded-full"></div>
        </div>
      </div>
    </div>
    
    <!-- Right Demo (Compact Pare-style) -->
    <div class="relative flex flex-col bg-[var(--panel)] rounded-[16px] p-6 shadow-[0_30px_80px_rgba(0,0,0,.45),0_0_0_1px_rgba(60,227,167,.10)] border border-white/5">
      
      <div class="absolute right-4 top-4 flex items-center gap-2 text-[11px] text-[var(--dim)]">
        <span class="w-1.5 h-1.5 rounded-full bg-[var(--live)] shadow-[0_0_10px_var(--live)]"></span>
        reading stream...
      </div>
      
      <!-- Top Input Field (Code Stream) -->
      <div class="bg-[var(--panel2)] rounded-xl p-4 pb-5 flex justify-between items-center gap-3 mt-6">
        <div class="flex-1 min-w-0">
          <div class="text-[11px] text-[var(--dim)] mb-1.5">Incoming Signal</div>
          <div class="font-mono text-xl text-white truncate">{@html formattedCode}<span class="cur"></span></div>
        </div>
        <span class="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[var(--ink)] text-sm font-medium whitespace-nowrap shrink-0 border border-white/5">
          <span class="w-5 h-5 rounded-full bg-gradient-to-br from-[#CFCFCF] to-[#8E8E8E]"></span>RAW
        </span>
      </div>
      
      <!-- Cleave / Split divider -->
      <div class="h-7 flex items-center justify-center gap-2.5 text-[11px] text-[var(--dim)] my-1">
        <i class="block w-[120px] h-px bg-gradient-to-r from-transparent via-[var(--live)]/70 to-transparent"></i>
        radar
        <i class="block w-[120px] h-px bg-gradient-to-r from-transparent via-[var(--live)]/70 to-transparent"></i>
      </div>
      
      <!-- Leg 1 -->
      <div class="grid grid-cols-[auto_1fr_auto] gap-3.5 items-center p-3.5 bg-[var(--panel2)] rounded-t-xl border-b border-white/5">
        <span class="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[var(--ink)] text-sm font-medium whitespace-nowrap border border-white/5">
          <span class="w-5 h-5 rounded-full bg-gradient-to-br from-[#8FB3D4] to-[#4F7EA8]"></span>VEC
        </span>
        <div>
          <div class="font-medium text-white text-sm">768-D Spatial Vectors</div>
          <div class="text-[11px] text-[var(--dim)] mt-0.5">Semantic lore mapped</div>
        </div>
        <div class="font-mono text-right">
          <b class="block text-white text-[15px]">1.000</b>
          <small class="text-[11px] text-[var(--dim)]">cosine</small>
        </div>
      </div>
      
      <!-- Leg 2 -->
      <div class="grid grid-cols-[auto_1fr_auto] gap-3.5 items-center p-3.5 bg-[var(--panel2)] rounded-b-xl mb-4 border border-white/5 border-t-0">
        <span class="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[var(--ink)] text-sm font-medium whitespace-nowrap border border-white/5">
          <span class="w-5 h-5 rounded-full bg-gradient-to-br from-[#3CE3A7] to-[#1E9E73]"></span>META
        </span>
        <div>
          <div class="font-medium text-white text-sm">Actionable Narrative</div>
          <div class="text-[11px] text-[var(--dim)] mt-0.5">DBSCAN group formed</div>
        </div>
        <div class="font-mono text-right">
          <b class="block text-white text-[15px]">14</b>
          <small class="text-[11px] text-[var(--dim)]">members</small>
        </div>
      </div>
      
      <a href="/radar" class="mt-6 h-[44px] rounded-xl bg-[var(--live)] hover:bg-[#56ECB6] text-[#06130D] font-semibold flex items-center justify-center transition-colors">
        View Full Terminal
      </a>
    </div>
  </div>\n\n  """
        
    content = content[:start_hero] + full_hero + content[end_hero:]

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

restore_hero()
