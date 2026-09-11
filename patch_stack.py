import re

def patch_stack():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # The current terminal is one big block. Let's isolate it.
    start_str = '<!-- Bottom CRT Terminal (Centered Wide) -->'
    end_str = '</section>'
    
    # We want to replace the CRT Terminal part up until the pipeline section
    # Wait, the pipeline section is right after the CRT terminal (since I removed the Emile scrollytelling).
    # Let's find exactly the crt-terminal div.
    
    old_terminal = re.search(r'<!-- Bottom CRT Terminal \(Centered Wide\) -->.*?</div>\n    </div>\n  </div>', content, re.DOTALL)
    if not old_terminal:
        print("Could not find CRT terminal block")
        return
        
    terminal_html = old_terminal.group(0)
    
    # Split the terminal_html into two windows for the scrollytelling
    new_hero_scrolly = """<!-- Stacked Windows Scrollytelling -->
    <div class="w-full max-w-5xl mx-auto relative h-[150vh]">
      
      <!-- Window 1: Code Stream (Sticky) -->
      <div class="sticky top-[15vh] pt-10">
        <div class="w-full bg-[var(--panel)] min-h-[300px] rounded-xl border border-[var(--rule)] shadow-2xl overflow-hidden relative transition-transform duration-500">
          <!-- Top Bar -->
          <div class="flex items-center gap-3 px-4 py-2.5 bg-[var(--panel2)] border-b border-[var(--rule)] text-xs">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-[var(--rule)]"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-[var(--rule)]"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-[var(--rule)]"></div>
            </div>
            <span class="text-[var(--dim)] font-mono ml-2">pipeline.py</span>
            <span class="ml-auto text-[var(--dim)] font-mono text-[10px] bg-[var(--panel)] px-2 py-0.5 rounded border border-[var(--rule)]">{stage}</span>
          </div>
          
          <!-- Code Content -->
          <div class="p-6 font-mono text-sm leading-relaxed text-white text-left whitespace-pre-wrap">
            {@html formattedCode}<span class="cur"></span>
          </div>
        </div>
      </div>
      
      <!-- Window 2: Results Table (Sticky, stacks on top) -->
      <div class="sticky top-[22vh] mt-[40vh] pb-10">
        <div class="w-full bg-[var(--panel)] min-h-[400px] rounded-xl border border-[var(--rule)] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
          <!-- Top Bar -->
          <div class="flex items-center gap-3 px-4 py-2.5 bg-[var(--panel2)] border-b border-[var(--rule)] text-xs">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-[var(--rule)]"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-[var(--rule)]"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-[var(--rule)]"></div>
            </div>
            <span class="text-white font-mono ml-2">dbscan_results.csv</span>
            <div class="ml-auto flex gap-4 text-[11px] text-[var(--dim)] font-mono">
              <span>stream <b class="text-white ml-1">connected</b></span>
              <span>embedded <b class="text-white ml-1">{tokensAnalyzed}</b></span>
            </div>
          </div>
          
          <!-- Table Content -->
          <div class="overflow-hidden bg-[var(--ink)]">
            <div class="max-h-[400px] overflow-y-auto">
              {#each feed as t}
                <div class="grid grid-cols-[22px_1.35fr_62px_74px] sm:grid-cols-[22px_1.35fr_62px_62px_74px] gap-2.5 items-center px-4.5 py-3 border-b border-[var(--rule)] text-[11.5px] font-mono hover:bg-[var(--panel2)] transition-colors">
                  <div class="w-5 h-5 rounded-full grid place-items-center text-[8.5px] font-bold text-[#060D09]" style="background-color: hsl({t.hue} 65% 58%)">TH</div>
                  <div class="min-w-0 text-left">
                    <span class="text-white font-medium">{t.name}</span>
                    <span class="text-[var(--banana)] text-[10.5px] ml-1.5 font-medium">· 1m ago</span>
                    <div class="text-[var(--dim)] text-[10px] truncate mt-0.5">{t.lore}</div>
                  </div>
                  <div class="text-right text-white">{t.holders.toLocaleString()}</div>
                  <div class="text-right text-white hidden sm:block">${(t.peak_mc / 1000).toFixed(0)}K</div>
                  <div class="text-right">
                    <span class={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'passed' 
                        ? 'bg-[var(--live)]/10 text-[var(--live)] border border-[var(--live)]/30 glow-live' 
                        : 'bg-[var(--stall)]/10 text-[var(--stall)] border border-[var(--stall)]/20'
                    }`}>
                      {t.status === 'passed' ? '● META' : '· forming'}
                    </span>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>"""

    content = content.replace(terminal_html, new_hero_scrolly)

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

patch_stack()
