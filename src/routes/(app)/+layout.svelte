<script lang="ts">
	import { page } from '$app/stores';
	// @ts-ignore Svelte 5 snippets
	let { children } = $props();
</script>

<div class="site-bg">
<div class="wrap">
  <!-- Header Bar (Tycho OS Style) -->
  <header class="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[var(--rule)] bg-[var(--ink)] relative z-20 gap-3 md:gap-0">
    <div class="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--live)] via-[var(--rule)] to-transparent opacity-50"></div>
    
    <div class="flex items-center justify-between w-full md:w-auto">
      <a href="/" class="brand-console flex items-center gap-2 shrink-0">
        <img src="/images/logo.png" alt="Logo" class="w-8 h-8 md:w-10 md:h-10 opacity-80 mix-blend-screen" />
        <span class="text-[14px] md:text-[16px]">TYCHO<span class="hidden md:inline text-[var(--live)]">_NARRATIVE RADAR</span></span>
      </a>
      
      <!-- Mobile Social Icons (visible only on mobile) -->
      <div class="flex items-center gap-4 md:hidden">
        <a href="https://github.com/narrative-radar/narrative-radar" target="_blank" rel="noopener noreferrer" class="text-[var(--dim)] hover:text-white transition-colors">
          <svg class="w-[16px] h-[16px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
        </a>
        <a href="https://x.com/tychoradarr" target="_blank" rel="noopener noreferrer" class="text-[var(--dim)] hover:text-white transition-colors">
          <svg class="w-[16px] h-[16px]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
      </div>
    </div>
    
    <div class="flex items-center gap-6 md:gap-12 w-full md:w-auto overflow-hidden">
      <!-- TABS -->
      <nav class="flex items-center gap-5 md:gap-8 font-mono text-[10px] md:text-[11px] uppercase tracking-widest mt-1 md:mt-1 overflow-x-auto scrollbar-hide whitespace-nowrap pb-1 md:pb-0 w-full">
        <a href="/" class="relative pb-2 transition-colors shrink-0 { $page.url.pathname === '/' ? 'text-white font-bold' : 'text-[var(--dim)] hover:text-white' }">
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
        <a href="/radar" class="relative pb-2 transition-colors shrink-0 { $page.url.pathname === '/radar' ? 'text-white font-bold' : 'text-[var(--dim)] hover:text-white' }">
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
        <a href="/track-record" class="relative pb-2 transition-colors shrink-0 { $page.url.pathname === '/track-record' ? 'text-white font-bold' : 'text-[var(--dim)] hover:text-white' }">
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
        <a href="/brain" class="relative pb-2 transition-colors shrink-0 { $page.url.pathname === '/brain' ? 'text-white font-bold' : 'text-[var(--dim)] hover:text-white' }">
          Brain
          {#if $page.url.pathname === '/brain'}
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
        <a href="/manifesto" class="relative pb-2 transition-colors shrink-0 { $page.url.pathname === '/manifesto' ? 'text-white font-bold' : 'text-[var(--dim)] hover:text-white' }">
          Manifesto
          {#if $page.url.pathname === '/manifesto'}
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

    <!-- Desktop only right side status -->
    <div class="hidden md:flex items-center gap-4 shrink-0">
      <a href="https://github.com/narrative-radar/narrative-radar" target="_blank" rel="noopener noreferrer" class="text-[var(--dim)] hover:text-white transition-colors">
        <svg class="w-[20px] h-[20px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
      </a>
      <a href="https://x.com/tychoradarr" target="_blank" rel="noopener noreferrer" class="text-[var(--dim)] hover:text-white transition-colors">
        <svg class="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </a>
      <div class="text-[11px] font-mono text-[var(--faint)] uppercase tracking-widest px-4 py-1.5 bg-[#090D13] border-l-2 border-[var(--live)]" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);">
        system status: <span class="text-[var(--live)] font-bold animate-pulse">autonomous</span>
      </div>
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
