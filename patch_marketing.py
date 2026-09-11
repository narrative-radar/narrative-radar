import re

def patch_marketing():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()
        
    # Replace the hero layout
    hero_old = """<div class="hero-grid grid grid-cols-1 lg:grid-cols-[1.22fr_1.1fr] border-b border-[var(--rule)] max-w-[1380px] mx-auto">
    
    <!-- Left Scene -->
    <div class="p-8 md:p-14 relative flex flex-col justify-center min-h-[60vh] bg-[var(--ink)]">
      <div class="mb-6">
        <span class="inline-flex items-center gap-2 px-3 py-1 bg-[var(--banana-glow)] border border-[var(--banana-lo)] text-[var(--banana-hi)] font-mono text-[10px] uppercase tracking-widest" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--banana)] animate-pulse shadow-[0_0_8px_var(--banana)]"></span>
          Live Robinhood Radar
        </span>
      </div>
      
      <h1 class="wordmark text-5xl md:text-7xl mb-8 min-h-[140px] md:min-h-[160px]" use:scrambleText={"See the meta before it's the meta."}>
        See the meta before it's the meta.
      </h1>
      
      <p class="text-[var(--dim)] text-lg max-w-lg leading-relaxed mb-6 font-mono">
        A completely autonomous pipeline that turns raw blockchain noise into readable narrative signals. Grouped by AI, not by hand.
      </p>

      <div class="grid grid-cols-2 gap-4 mt-6 mb-10">
        <div class="border-l border-[var(--rule)] pl-4">
          <div class="text-[10px] text-[var(--dim)] font-mono uppercase tracking-widest mb-1">Processing Delay</div>
          <div class="text-white font-mono text-sm">~1.2 seconds</div>
        </div>
        <div class="border-l border-[var(--rule)] pl-4">
          <div class="text-[10px] text-[var(--dim)] font-mono uppercase tracking-widest mb-1">Embedding Matrix</div>
          <div class="text-white font-mono text-sm">768 Dimensions</div>
        </div>
      </div>

      <div class="flex items-center gap-6 mt-auto">
        <a href="/radar" class="glass-panel px-6 py-3 font-mono text-sm text-[var(--fg)] hover:text-white hover:border-[var(--live)] transition-colors cursor-pointer" style="clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);">
          Launch Dashboard →
        </a>
      </div>
    </div>

    <!-- Right CRT Terminal -->
    <div class="screen bg-[var(--crt)] min-h-[520px] rounded-br-none rounded-bl-none lg:rounded-bl-none relative" id="crt-terminal">"""

    hero_new = """<div class="hero-stacked flex flex-col items-center text-center border-b border-[var(--rule)] max-w-[1380px] mx-auto pt-16 md:pt-24 bg-[var(--ink)]">
    
    <!-- Top Center Scene -->
    <div class="px-6 md:px-14 flex flex-col items-center w-full max-w-4xl">
      <div class="mb-6">
        <span class="inline-flex items-center gap-2 px-3 py-1 bg-[var(--banana-glow)] border border-[var(--banana-lo)] text-[var(--banana-hi)] font-mono text-[10px] uppercase tracking-widest" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--banana)] animate-pulse shadow-[0_0_8px_var(--banana)]"></span>
          Live Robinhood Radar
        </span>
      </div>
      
      <h1 class="wordmark text-5xl md:text-[80px] mb-6 min-h-[120px] md:min-h-[100px] leading-[1.1]" use:scrambleText={"See the meta before it's the meta."}>
        See the meta before it's the meta.
      </h1>
      
      <p class="text-[var(--dim)] text-lg md:text-xl max-w-2xl leading-relaxed mb-10 font-mono">
        A completely autonomous pipeline that turns raw blockchain noise into readable narrative signals. Grouped by AI, not by hand.
      </p>

      <div class="flex flex-wrap justify-center gap-4 md:gap-12 mb-12">
        <div class="flex flex-col items-center">
          <div class="text-[10px] text-[var(--dim)] font-mono uppercase tracking-widest mb-1">Processing Delay</div>
          <div class="text-white font-mono text-sm border-b border-[var(--rule)] pb-1">~1.2 seconds</div>
        </div>
        <div class="flex flex-col items-center">
          <div class="text-[10px] text-[var(--dim)] font-mono uppercase tracking-widest mb-1">Embedding Matrix</div>
          <div class="text-white font-mono text-sm border-b border-[var(--rule)] pb-1">768 Dimensions</div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-6 mb-16">
        <a href="/radar" class="glass-panel px-8 py-4 font-mono text-sm text-white hover:text-[var(--live)] hover:border-[var(--live)] transition-colors cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(52,211,153,0.15)]" style="clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);">
          Launch Dashboard →
        </a>
      </div>
    </div>

    <!-- Bottom CRT Terminal (Centered Wide) -->
    <div class="w-full max-w-5xl screen bg-[var(--crt)] min-h-[400px] rounded-t-xl rounded-b-none border-t border-l border-r border-[#14261C] relative shadow-[0_-20px_50px_rgba(0,0,0,0.5)]" id="crt-terminal">"""

    content = content.replace(hero_old, hero_new)

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

patch_marketing()
