<script lang="ts">
  import { onMount } from 'svelte';
  
  let visibleLines = $state<number>(0);
  
  onMount(() => {
    const interval = setInterval(() => {
      if (visibleLines < 8) {
        visibleLines += 1;
      } else {
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  });
</script>

<svelte:head>
  <title>Manifesto — Tycho</title>
</svelte:head>

<div class="flex flex-col items-center justify-center pt-16 pb-32 px-6">
  <div class="w-full max-w-[720px]">
    
    <!-- Header / ASCII -->
    <div class="mb-16 flex flex-col items-center justify-center animate-[fadeIn_1s_ease-out]">
      <pre class="text-[var(--live)] font-mono text-[8px] sm:text-[10px] leading-none mb-6 opacity-80 text-center tracking-tighter">
  _____ __   __  ____  _   _   ___  
 |_   _|\ \ / / / ___|| | | | / _ \ 
   | |   \ V / | |    | |_| || | | |
   | |    | |  | |___ |  _  || |_| |
   |_|    |_|   \____||_| |_| \___/ 
      </pre>
      <div class="h-[1px] w-24 bg-gradient-to-r from-transparent via-[var(--rule)] to-transparent mb-6"></div>
      <div class="text-[10px] font-mono text-[var(--dim)] uppercase tracking-[0.3em]">
        Directive 01 // Narrative Spatialization
      </div>
    </div>

    <!-- Body -->
    <div class="space-y-12 font-mono text-[13px] md:text-[14px] leading-[1.8] text-[#a0a5b0] tracking-wide text-justify md:text-left">
      
      {#if visibleLines > 0}
        <div class="animate-[fadeIn_1s_ease-out] relative pl-6 border-l border-[var(--rule)]">
          <span class="absolute left-[-23px] top-1 text-[10px] text-[var(--faint)]">01</span>
          <p>
            <strong class="text-white font-medium">THE HUMAN BOTTLENECK.</strong><br/><br/>
            In the current meta, human participants are consistently the last to know. By the time a narrative is identified, named, and shared on social layers, the deployment phase has already ended. The distribution phase has begun. You are exit liquidity.
          </p>
        </div>
      {/if}

      {#if visibleLines > 1}
        <div class="animate-[fadeIn_1s_ease-out] relative pl-6 border-l border-[var(--rule)]">
          <span class="absolute left-[-23px] top-1 text-[10px] text-[var(--faint)]">02</span>
          <p>
            <strong class="text-white font-medium">NARRATIVES ARE MATHEMATICS.</strong><br/><br/>
            Before a meta becomes a tweet, it is a vector. Every deployed smart contract, every token name, ticker, and metadata carries a semantic signature. When plotted in a high-dimensional vector space, emerging narratives form dense, gravitational clusters long before human pattern recognition catches on.
          </p>
        </div>
      {/if}

      {#if visibleLines > 2}
        <div class="animate-[fadeIn_1s_ease-out] relative pl-6 border-l border-[var(--live)]/50">
          <span class="absolute left-[-23px] top-1 text-[10px] text-[var(--live)] glow-live">03</span>
          <p>
            <strong class="text-[var(--live)] glow-live font-medium">ENTER TYCHO.</strong><br/><br/>
            Tycho is an autonomous radar system. It does not read tweets. It does not listen to influencers. It ingests raw deployment data at the block level, embeds the semantic meaning using state-of-the-art LLMs, and maps them in 1536-dimensional space.
          </p>
        </div>
      {/if}

      {#if visibleLines > 3}
        <div class="animate-[fadeIn_1s_ease-out] relative pl-6 border-l border-[var(--rule)]">
          <span class="absolute left-[-23px] top-1 text-[10px] text-[var(--faint)]">04</span>
          <p>
            When contracts begin clustering too closely, Tycho detects the anomaly. It identifies the invisible thread connecting them and generates a human-readable label autonomously.
          </p>
        </div>
      {/if}

      {#if visibleLines > 4}
        <div class="animate-[fadeIn_1s_ease-out] pt-8 text-center">
          <p class="text-[16px] md:text-[20px] text-white font-medium tracking-tight">
            See the meta <span class="text-[var(--dim)] italic">before</span> it's the meta.
          </p>
        </div>
      {/if}

    </div>

    <!-- Footer Action -->
    {#if visibleLines > 5}
      <div class="mt-16 flex flex-col items-center justify-center gap-6 animate-[fadeIn_1.5s_ease-out]">
        <div class="h-[1px] w-12 bg-[var(--rule)]"></div>
        <div class="flex gap-4">
          <a href="/radar" class="px-6 py-3 bg-white text-black font-semibold text-xs tracking-[0.1em] uppercase rounded-[4px] hover:bg-gray-200 transition-colors">
            Access Radar
          </a>
          <a href="https://x.com/TychoRadar" target="_blank" rel="noopener noreferrer" class="px-6 py-3 bg-transparent border border-[var(--rule)] text-white hover:border-white font-semibold text-xs tracking-[0.1em] uppercase rounded-[4px] transition-all flex items-center gap-2">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Follow Tycho
          </a>
        </div>
      </div>
    {/if}

  </div>
</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); filter: blur(4px); }
    to { opacity: 1; transform: translateY(0); filter: blur(0); }
  }
  .glow-live { text-shadow: 0 0 12px rgba(52, 211, 153, 0.5); }
</style>
