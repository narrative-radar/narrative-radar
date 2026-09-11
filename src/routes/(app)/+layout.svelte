<script lang="ts">
	import { page } from '$app/stores';
	// @ts-ignore Svelte 5 snippets
	let { children } = $props();
</script>

<div class="site-bg">
<div class="wrap">
  <!-- Header Bar (Tycho OS Style) -->
  <header class="flex items-center justify-between md:px-6 py-4 border-b border-[var(--rule)] bg-[var(--ink)] relative z-20">
    <div class="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--live)] via-[var(--rule)] to-transparent opacity-50"></div>
    
    <div class="flex items-center gap-6 md:gap-12">
      <a href="/" class="brand-console flex items-center gap-2">
        <img src="/images/logo.png" alt="Logo" class="w-10 h-10 opacity-80 mix-blend-screen" />
        TYCHO<span class="hidden md:block text-[var(--live)]">_NARRATIVE RADAR</span>
      </a>
      
      <!-- TABS -->
      <nav class="hidden md:flex items-center gap-8 font-mono text-[11px] uppercase tracking-widest mt-1">
        <a href="/" class="relative pb-2 transition-colors { $page.url.pathname === '/' ? 'text-white font-bold' : 'text-[var(--dim)] hover:text-white' }">
          Overview
          {#if $page.url.pathname === '/'}
          <!-- Active Wave -->
          <div class="absolute -bottom-[1px] left-0 w-full flex items-end justify-between gap-[1px] h-[3px]">
            <div class="flex-1 bg-[var(--live)] animate-[wave_1s_ease-in-out_infinite_alternate] h-[40%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.2s_ease-in-out_infinite_alternate_0.2s] h-[100%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_0.8s_ease-in-out_infinite_alternate_0.4s] h-[60%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.4s_ease-in-out_infinite_alternate_0.6s] h-[80%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1s_ease-in-out_infinite_alternate_0.3s] h-[50%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.1s_ease-in-out_infinite_alternate_0.1s] h-[90%]"></div>
          </div>
{/if}
        </a>
        <a href="/radar" class="relative pb-2 transition-colors { $page.url.pathname === '/radar' ? 'text-white font-bold' : 'text-[var(--dim)] hover:text-white' }">
          Radar
          {#if $page.url.pathname === '/radar'}
          <!-- Active Wave -->
          <div class="absolute -bottom-[1px] left-0 w-full flex items-end justify-between gap-[1px] h-[3px]">
            <div class="flex-1 bg-[var(--live)] animate-[wave_1s_ease-in-out_infinite_alternate] h-[40%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.2s_ease-in-out_infinite_alternate_0.2s] h-[100%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_0.8s_ease-in-out_infinite_alternate_0.4s] h-[60%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.4s_ease-in-out_infinite_alternate_0.6s] h-[80%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1s_ease-in-out_infinite_alternate_0.3s] h-[50%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.1s_ease-in-out_infinite_alternate_0.1s] h-[90%]"></div>
          </div>
{/if}
        </a>
        <a href="/track-record" class="relative pb-2 transition-colors { $page.url.pathname === '/track-record' ? 'text-white font-bold' : 'text-[var(--dim)] hover:text-white' }">
          Track Record
          {#if $page.url.pathname === '/track-record'}
          <!-- Active Wave -->
          <div class="absolute -bottom-[1px] left-0 w-full flex items-end justify-between gap-[1px] h-[3px]">
            <div class="flex-1 bg-[var(--live)] animate-[wave_1s_ease-in-out_infinite_alternate] h-[40%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.2s_ease-in-out_infinite_alternate_0.2s] h-[100%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_0.8s_ease-in-out_infinite_alternate_0.4s] h-[60%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.4s_ease-in-out_infinite_alternate_0.6s] h-[80%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1s_ease-in-out_infinite_alternate_0.3s] h-[50%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.1s_ease-in-out_infinite_alternate_0.1s] h-[90%]"></div>
          </div>
{/if}
        </a>
      </nav>
    </div>

    <div class="text-[8px] md:text-[11px] font-mono text-[var(--faint)] uppercase tracking-widest px-4 py-1.5 bg-[#090D13] border-l-2 border-[var(--live)]" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);">
      system status: <span class="text-[var(--live)] font-bold animate-pulse">autonomous</span>
    </div>
  </header>

	{@render children()}
</div>
</div>

<!-- Minimal Footer -->
<footer class="w-full bg-[#030508] py-8 border-t border-[var(--rule)]">
  <div class="max-w-[1380px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
      <img src="/images/logo.png" alt="Tycho" class="w-6 h-6 grayscale mix-blend-screen" />
      <span class="text-[11px] font-mono text-[var(--fg)] uppercase tracking-widest">TYCHO_OS // V1.0.0</span>
    </div>
    <div class="flex gap-6">
      <a href="/radar" class="text-[11px] font-mono text-[var(--dim)] hover:text-[var(--fg)] uppercase tracking-widest transition-colors">Radar</a>
      <a href="/track-record" class="text-[11px] font-mono text-[var(--dim)] hover:text-[var(--fg)] uppercase tracking-widest transition-colors">Track Record</a>
    </div>
  </div>
</footer>
