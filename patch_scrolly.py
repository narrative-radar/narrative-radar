import re

def patch_scrolly():
    with open('src/routes/(marketing)/+page.svelte', 'r') as f:
        content = f.read()

    # Add the fade import
    if "import { fade } from 'svelte/transition';" not in content:
        content = content.replace(
            "import { createQuery } from '@tanstack/svelte-query';",
            "import { createQuery } from '@tanstack/svelte-query';\n  import { fade } from 'svelte/transition';"
        )

    # Add the effect for scrollytelling
    effect_code = """
  let howWorksRef = $state();
  let activeStep = $state(0);

  $effect(() => {
    if (howWorksRef && scrollY !== undefined && innerHeight !== undefined) {
      const rect = howWorksRef.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - innerHeight)));
      activeStep = Math.min(2, Math.floor(progress * 3));
    }
  });"""
  
    content = content.replace("let howWorksRef = $state();\n  let activeStep = $state(0);", effect_code)

    # Re-insert the scrollytelling block before the "Track Record Preview"
    # Find <!-- Track Record Preview -->
    
    scrolly_html = """  <!-- Technical Process Panel (Pinned Scrollytelling) -->
  <div bind:this={howWorksRef} class="h-auto md:h-[150vh] bg-[var(--ink)] relative border-b border-[var(--rule)]">
    <div class="relative md:sticky top-0 h-auto md:h-screen flex flex-col md:flex-row overflow-hidden">
      
      <!-- Left: Narrative Text -->
      <div class="w-full md:w-1/2 p-8 md:p-14 lg:p-20 flex flex-col justify-center h-full">
        <h2 class="wordmark text-4xl mb-12">How Tycho Reads The Chain</h2>
        
        <div class="flex flex-col gap-10 relative">
          <!-- Connecting Line -->
          <div class="absolute left-4 top-4 bottom-4 w-[1px] bg-[var(--rule)] -z-10"></div>
          
          <div class="flex gap-6 relative transition-opacity duration-500 {activeStep >= 0 ? 'opacity-100' : 'opacity-30'}">
            <div class="w-8 h-8 rounded-full bg-[var(--ink)] border-2 {activeStep >= 0 ? 'border-[var(--live)]' : 'border-[var(--soft)]'} flex items-center justify-center shrink-0 z-10 transition-colors">
              <div class="w-2 h-2 rounded-full {activeStep >= 0 ? 'bg-[var(--live)]' : 'bg-transparent'}"></div>
            </div>
            <div>
              <h3 class="font-mono text-xs uppercase tracking-widest text-[#DCE6F0] mb-2 {activeStep >= 0 ? 'text-[var(--live)]' : ''}">1. Ingestion</h3>
              <p class="text-[var(--dim)] text-sm leading-relaxed max-w-sm">Listens to every new contract deployed. Metadata is stripped, cleaned, and queued for semantic processing.</p>
            </div>
          </div>
          
          <div class="flex gap-6 relative transition-opacity duration-500 {activeStep >= 1 ? 'opacity-100' : 'opacity-30'}">
            <div class="w-8 h-8 rounded-full bg-[var(--ink)] border-2 {activeStep >= 1 ? 'border-[var(--cyan)]' : 'border-[var(--soft)]'} flex items-center justify-center shrink-0 z-10 transition-colors">
              <div class="w-2 h-2 rounded-full {activeStep >= 1 ? 'bg-[var(--cyan)]' : 'bg-transparent'}"></div>
            </div>
            <div>
              <h3 class="font-mono text-xs uppercase tracking-widest text-[#DCE6F0] mb-2 {activeStep >= 1 ? 'text-[var(--cyan)]' : ''}">2. Vectorization</h3>
              <p class="text-[var(--dim)] text-sm leading-relaxed max-w-sm">Tickers and lore are mapped into 768-dimensional space by LLM embeddings to find semantic meaning.</p>
            </div>
          </div>
          
          <div class="flex gap-6 relative transition-opacity duration-500 {activeStep >= 2 ? 'opacity-100' : 'opacity-30'}">
            <div class="w-8 h-8 rounded-full bg-[var(--ink)] border-2 {activeStep >= 2 ? 'border-[var(--banana)]' : 'border-[var(--soft)]'} flex items-center justify-center shrink-0 z-10 transition-colors">
              <div class="w-2 h-2 rounded-full {activeStep >= 2 ? 'bg-[var(--banana)]' : 'bg-transparent'}"></div>
            </div>
            <div>
              <h3 class="font-mono text-xs uppercase tracking-widest text-[#DCE6F0] mb-2 {activeStep >= 2 ? 'text-[var(--banana)]' : ''}">3. Spatial Clustering</h3>
              <p class="text-[var(--dim)] text-sm leading-relaxed max-w-sm">DBSCAN automatically groups tokens that land too close to each other, surfacing coordinated metas.</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right: Technical Visualization -->
      <div class="w-full md:w-1/2 bg-[var(--panel2)] border-l border-[var(--rule)] h-[50vh] md:h-full p-8 md:p-14 flex flex-col justify-center relative overflow-hidden">
        
        {#key activeStep}
          <div class="absolute inset-0 p-8 md:p-14 flex flex-col justify-center" transition:fade={{duration: 400}}>
            <div class="text-[10px] font-mono text-[var(--dim)] uppercase tracking-widest mb-4">Internal Telemetry</div>
            <div class="bg-[var(--panel)] border border-[var(--rule)] rounded-xl p-6 font-mono text-sm leading-relaxed text-white text-left shadow-2xl relative">
              <!-- Window dots -->
              <div class="absolute top-4 left-4 flex gap-1.5">
                <div class="w-2 h-2 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
                <div class="w-2 h-2 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
                <div class="w-2 h-2 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
              </div>
              <div class="pt-6">
                {@html hl(BLOCKS[activeStep].src)}
              </div>
            </div>
          </div>
        {/key}
        
      </div>
    </div>
  </div>\n\n"""
  
    content = content.replace("  <!-- Track Record Preview -->", scrolly_html + "  <!-- Track Record Preview -->")

    with open('src/routes/(marketing)/+page.svelte', 'w') as f:
        f.write(content)

patch_scrolly()
