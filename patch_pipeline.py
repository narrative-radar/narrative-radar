import re

def patch_pipeline():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # The existing pipeline section:
    # <section class="learning-progress border-t border-[var(--rule)] bg-[var(--panel2)] p-6 md:p-8 rounded-b-[24px]">
    # We will replace the entire <section class="learning-progress ..."> block up to </section>

    # I'll use regex to find this block.
    # It starts with <section class="learning-progress
    # and ends with </section>
    
    new_pipeline = """<section class="border-t border-[var(--rule)] bg-[var(--ink)] p-6 md:p-12 relative overflow-hidden">
    <!-- Subtle Grid Background -->
    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGVsbGlwc2UgY3g9IjIwIiBjeT0iMjAiIHJ4PSIwLjUiIHJ5PSIwLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] opacity-50 pointer-events-none"></div>
    
    <div class="max-w-6xl mx-auto relative z-10">
      <div class="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 border-b border-[var(--rule)] pb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-[var(--live)]/10 border border-[var(--live)]/30 rounded text-[var(--live)] font-mono text-[10px] tracking-widest uppercase mb-4">
            <span class="w-2 h-2 rounded-full bg-[var(--live)] animate-pulse"></span>
            System Telemetry
          </div>
          <h2 class="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">Real-Time Aggregation</h2>
          <p class="text-[var(--dim)] font-mono text-sm mt-3 max-w-xl">Live diagnostic feed from the DBSCAN clustering engine on the Robinhood chain.</p>
        </div>
        
        <div class="mt-6 md:mt-0 flex gap-4 text-right">
          <div>
            <div class="text-[10px] font-mono text-[var(--dim)] uppercase tracking-widest mb-1">Status</div>
            <div class="text-[var(--banana)] font-mono font-bold glow-banana">AUTONOMOUS</div>
          </div>
          <div class="w-[1px] bg-[var(--rule)] h-8 self-center mx-2"></div>
          <div>
            <div class="text-[10px] font-mono text-[var(--dim)] uppercase tracking-widest mb-1">Saturation</div>
            <div class="text-white font-mono font-bold">80.0%</div>
          </div>
        </div>
      </div>
      
      <!-- Radar-themed Server Racks -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Rack 1: Ingestion -->
        <div class="bg-[var(--panel)] border border-[var(--rule)] rounded-xl overflow-hidden flex flex-col hover:border-[var(--banana)]/50 transition-colors">
          <div class="p-3 bg-[var(--panel2)] border-b border-[var(--rule)] flex justify-between items-center">
            <span class="text-[10px] font-mono text-[var(--dim)] uppercase tracking-widest">Stage 1: Ingestion</span>
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--banana)] shadow-[0_0_8px_var(--banana)]"></span>
          </div>
          <div class="p-6 flex-1 flex flex-col justify-center">
            <div class="text-4xl font-serif text-white mb-1">{liveTokensTracked.toLocaleString()}</div>
            <div class="text-xs font-mono text-[var(--dim)]">Total Tokens Scanned Today</div>
            
            <div class="mt-6 pt-4 border-t border-[var(--rule)] flex justify-between items-center text-xs font-mono">
              <span class="text-[var(--dim)]">Velocity:</span>
              <span class="text-white">~18 tokens/min</span>
            </div>
          </div>
        </div>

        <!-- Rack 2: Embedding -->
        <div class="bg-[var(--panel)] border border-[var(--rule)] rounded-xl overflow-hidden flex flex-col hover:border-[var(--violet)]/50 transition-colors">
          <div class="p-3 bg-[var(--panel2)] border-b border-[var(--rule)] flex justify-between items-center">
            <span class="text-[10px] font-mono text-[var(--dim)] uppercase tracking-widest">Stage 2: Embedding</span>
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--violet)] shadow-[0_0_8px_var(--violet)]"></span>
          </div>
          <div class="p-6 flex-1 flex flex-col justify-center">
            <div class="text-4xl font-serif text-white mb-1">768-Dim</div>
            <div class="text-xs font-mono text-[var(--dim)]">Gemini Feature Matrix</div>
            
            <div class="mt-6 pt-4 border-t border-[var(--rule)] flex justify-between items-center text-xs font-mono">
              <span class="text-[var(--dim)]">Queue Sync:</span>
              <span class="text-[var(--violet)] glow-violet">100% SUCCESS</span>
            </div>
          </div>
        </div>

        <!-- Rack 3: Clustering -->
        <div class="bg-[var(--panel)] border border-[var(--rule)] rounded-xl overflow-hidden flex flex-col hover:border-[var(--live)]/50 transition-colors">
          <div class="p-3 bg-[var(--panel2)] border-b border-[var(--rule)] flex justify-between items-center">
            <span class="text-[10px] font-mono text-[var(--dim)] uppercase tracking-widest">Stage 3: Clustering</span>
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--live)] shadow-[0_0_8px_var(--live)] animate-pulse"></span>
          </div>
          <div class="p-6 flex-1 flex flex-col justify-center">
            <div class="text-4xl font-serif text-[var(--live)] glow-live mb-1">{liveClusters.length}</div>
            <div class="text-xs font-mono text-[var(--dim)]">Active Narrative Metas</div>
            
            <div class="mt-6 pt-4 border-t border-[var(--rule)] flex justify-between items-center text-xs font-mono">
              <span class="text-[var(--dim)]">DBSCAN ε (Epsilon):</span>
              <span class="text-white">0.75</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </section>"""

    # Replace everything from <section class="learning-progress to the next </section>
    pattern = re.compile(r'<section class="learning-progress.*?</section>', re.DOTALL)
    content = pattern.sub(new_pipeline, content)

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

patch_pipeline()
