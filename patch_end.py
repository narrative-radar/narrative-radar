import re

def patch_end():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    start_idx = content.find('  <!-- Telemetry & Pipeline Status Dashboard -->')
    end_idx = content.find('<style>')
    
    pare_sections = """  <!-- PARE-STYLE SECTIONS -->
  <section class="max-w-[1344px] mx-auto px-6 pt-20 relative z-10">
    <h2 class="text-[34px] font-medium tracking-tight mb-2 text-white">Active Narratives</h2>
    <p class="text-[var(--dim)] mb-7 max-w-[640px] text-[15px]">Live clusters detected on the Robinhood chain, mapped by spatial density.</p>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each liveClusters.slice(0, 4) as cluster, i}
        <a href="/radar?cluster={cluster.id}" class="block bg-[var(--panel)] hover:bg-[var(--panel2)] border border-[var(--rule)] rounded-[14px] p-5 transition-colors">
          <div class="flex justify-between items-center gap-3 mb-4">
            <div class="flex items-center gap-2 font-medium">
              <div class="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#8FB3D4] to-[#4F7EA8]"></div>
              {cluster.label || 'New Meta'}
            </div>
            <div class="font-mono text-right">
              <div class="font-medium text-white">{cluster.memberCount}</div>
              <div class="text-[11px] text-[var(--live)]">tokens</div>
            </div>
          </div>
          <div class="flex justify-between pt-3 border-t border-[var(--rule)] text-[11px] text-[var(--dim)]">
            <span class="inline-flex items-center gap-1.5"><i class="w-1.5 h-1.5 rounded-full bg-[var(--live)]"></i> {cluster.status}</span>
            <span>{(cluster.cohesionScore * 100).toFixed(0)}% cohesion</span>
          </div>
        </a>
      {/each}
      
      {#if liveClusters.length === 0}
        <!-- Fallback Cards if DB is empty -->
        {#each ['AI Agents', 'Retro Games', 'Cat Derivatives', 'Politics'] as label, i}
          <div class="block bg-[var(--panel)] border border-[var(--rule)] rounded-[14px] p-5">
            <div class="flex justify-between items-center gap-3 mb-4">
              <div class="flex items-center gap-2 font-medium text-white">
                <div class="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#CFCFCF] to-[#8E8E8E]"></div>
                {label}
              </div>
              <div class="font-mono text-right">
                <div class="font-medium text-white">{(4 - i) * 3}</div>
                <div class="text-[11px] text-[var(--live)]">tokens</div>
              </div>
            </div>
            <div class="flex justify-between pt-3 border-t border-[var(--rule)] text-[11px] text-[var(--dim)]">
              <span class="inline-flex items-center gap-1.5"><i class="w-1.5 h-1.5 rounded-full bg-[var(--live)]"></i> breakout</span>
              <span>8{i}.% cohesion</span>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </section>

  <section class="max-w-[1344px] mx-auto px-6 pt-20 relative z-10">
    <h2 class="text-[34px] font-medium tracking-tight mb-2 text-white">One stream, pure signal.</h2>
    <p class="text-[var(--dim)] mb-7 max-w-[640px] text-[15px]">The pipeline strips the noise and groups the remaining vectors into actionable metas.</p>
    
    <div class="flex h-16 rounded-[14px] overflow-hidden bg-[var(--panel)]">
      <div class="flex-1 flex items-center justify-between px-5 gap-3 min-w-0" style="background: linear-gradient(90deg, rgba(143,179,212,.15), rgba(143,179,212,.05));">
        <span class="text-sm text-white truncate">RAW STREAM · 14,000+ daily launches</span>
        <b class="font-mono font-medium text-[#8FB3D4] whitespace-nowrap">NOISE</b>
      </div>
      <div class="flex-none min-w-[96px] flex items-center justify-center px-4" style="background: linear-gradient(90deg, rgba(60,227,167,.20), rgba(60,227,167,.08));">
        <b class="font-mono font-medium text-[var(--live)] whitespace-nowrap">SIGNAL</b>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
      <div class="pt-4 border-t border-[var(--rule)]">
        <div class="font-mono text-[11px] text-[#8FB3D4] mb-2">THE NOISE</div>
        <h3 class="text-xl font-medium mb-2 text-white">Every token deployed.</h3>
        <p class="text-[var(--dim)] text-[14px] mb-3">Raw blockchain events contain thousands of duplicate or dead-on-arrival contracts.</p>
        
        <div class="mt-4 pt-3 border-t border-[var(--rule)] flex justify-between text-sm">
          <span class="text-[var(--dim)]">Ingestion</span>
          <span class="font-mono text-white text-right">DexScreener API</span>
        </div>
        <div class="pt-3 flex justify-between text-sm">
          <span class="text-[var(--dim)]">Filter Level</span>
          <span class="font-mono text-white text-right">None</span>
        </div>
      </div>
      <div class="pt-4 border-t border-[var(--rule)]">
        <div class="font-mono text-[11px] text-[var(--live)] mb-2">THE SIGNAL</div>
        <h3 class="text-xl font-medium mb-2 text-white">Clustered narrative metas.</h3>
        <p class="text-[var(--dim)] text-[14px] mb-3">Only the tokens that share semantic vectors with high velocity are flagged.</p>
        
        <div class="mt-4 pt-3 border-t border-[var(--rule)] flex justify-between text-sm">
          <span class="text-[var(--dim)]">Output</span>
          <span class="font-mono text-[var(--live)] text-right">DBSCAN Clusters</span>
        </div>
        <div class="pt-3 flex justify-between text-sm">
          <span class="text-[var(--dim)]">Precision</span>
          <span class="font-mono text-white text-right">0.75 Cosine</span>
        </div>
      </div>
    </div>
  </section>

  <section class="max-w-[1344px] mx-auto px-6 pt-20 relative z-10">
    <h2 class="text-[34px] font-medium tracking-tight mb-2 text-white">Old way. New AI.</h2>
    <p class="text-[var(--dim)] mb-7 max-w-[640px] text-[15px]">Finding metas used to mean staring at Telegram bots. Now it's fully autonomous.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 relative">
      <div class="hidden md:block absolute left-0 right-0 top-[34px] h-[1px] bg-[var(--rule)]"></div>
      
      <div class="relative pl-6 md:pl-0">
        <div class="w-[15px] h-[15px] rounded-full bg-[var(--panel)] ring-4 ring-[var(--bg)] absolute left-0 md:left-auto md:-top-[41px] top-1"></div>
        <div class="font-mono text-[11px] text-[var(--dim)] mb-2">2021 · Manual</div>
        <h3 class="text-[20px] font-medium mb-2 text-white">Telegram Alpha</h3>
        <p class="text-[var(--dim)] text-[14px]">Scrolling through endless groups hoping to catch a narrative early.</p>
      </div>
      
      <div class="relative pl-6 md:pl-0">
        <div class="w-[15px] h-[15px] rounded-full bg-[var(--panel)] ring-4 ring-[var(--bg)] absolute left-0 md:left-auto md:-top-[41px] top-1"></div>
        <div class="font-mono text-[11px] text-[var(--dim)] mb-2">2023 · Filters</div>
        <h3 class="text-[20px] font-medium mb-2 text-white">DEX Screener</h3>
        <p class="text-[var(--dim)] text-[14px]">Setting volume filters and staring at new pairs for hours.</p>
      </div>
      
      <div class="relative pl-6 md:pl-0">
        <div class="w-[15px] h-[15px] rounded-full bg-[var(--panel)] ring-4 ring-[var(--bg)] absolute left-0 md:left-auto md:-top-[41px] top-1"></div>
        <div class="font-mono text-[11px] text-[var(--dim)] mb-2">Today · AI Agents</div>
        <h3 class="text-[20px] font-medium mb-2 text-white">LLM Twitter Bots</h3>
        <p class="text-[var(--dim)] text-[14px]">Following specific influencers to trade based on their tweets.</p>
      </div>
      
      <div class="relative pl-6 md:pl-0">
        <div class="w-[15px] h-[15px] rounded-full bg-[var(--live)] ring-4 ring-[var(--bg)] shadow-[0_0_18px_rgba(60,227,167,.6)] absolute left-0 md:left-auto md:-top-[41px] top-1"></div>
        <div class="font-mono text-[11px] text-[var(--live)] mb-2">Now · Tycho</div>
        <h3 class="text-[20px] font-medium mb-2 text-white">Autonomous Radar</h3>
        <p class="text-[var(--dim)] text-[14px]">Vectors and clustering find the metas mathematically.</p>
      </div>
    </div>
  </section>

  <section class="max-w-[1344px] mx-auto px-6 pt-20 pb-32 relative z-10">
    <h2 class="text-[34px] font-medium tracking-tight mb-2 text-white">The pipeline compounds.</h2>
    <p class="text-[var(--dim)] mb-7 max-w-[640px] text-[15px]">Every 5 minutes, the cron job executes the complete pipeline end-to-end.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
      <div class="bg-[var(--panel)] rounded-[14px] p-5 relative">
        <div class="font-mono text-[24px] font-medium text-white">Ingest</div>
        <div class="font-medium mt-2 text-[15px] text-white">Listen to chain</div>
        <div class="text-[var(--dim)] text-[13px] mt-1">Read all new pairs on Robinhood.</div>
      </div>
      
      <div class="bg-[var(--panel)] rounded-[14px] p-5 relative">
        <div class="hidden md:block absolute -left-[14px] top-1/2 -translate-y-1/2 text-[var(--dim)] text-sm">→</div>
        <div class="font-mono text-[24px] font-medium text-white">Embed</div>
        <div class="font-medium mt-2 text-[15px] text-white">768-D Vectors</div>
        <div class="text-[var(--dim)] text-[13px] mt-1">Gemini maps meaning to space.</div>
      </div>
      
      <div class="bg-[var(--panel)] rounded-[14px] p-5 relative">
        <div class="hidden md:block absolute -left-[14px] top-1/2 -translate-y-1/2 text-[var(--dim)] text-sm">→</div>
        <div class="font-mono text-[24px] font-medium text-[var(--live)]">Cluster</div>
        <div class="font-medium mt-2 text-[15px] text-white">DBSCAN Engine</div>
        <div class="text-[var(--dim)] text-[13px] mt-1">Groups tokens into metas.</div>
      </div>
      
      <div class="bg-[var(--panel)] rounded-[14px] p-5 relative">
        <div class="hidden md:block absolute -left-[14px] top-1/2 -translate-y-1/2 text-[var(--dim)] text-sm">→</div>
        <div class="font-mono text-[24px] font-medium text-[var(--live)]">Signal</div>
        <div class="font-medium mt-2 text-[15px] text-white">Dashboard</div>
        <div class="text-[var(--dim)] text-[13px] mt-1">Displayed instantly to the terminal.</div>
        <div class="text-[11px] text-[var(--dim)] mt-3">↻ repeats every 5m</div>
      </div>
    </div>
  </section>\n\n"""

    content = content[:start_idx] + pare_sections + "\n" + content[end_idx:]

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

patch_end()
