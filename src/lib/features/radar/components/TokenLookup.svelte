<script lang="ts">
  let mint = $state('');
  let status = $state<'idle' | 'loading' | 'found' | 'processing' | 'not_found'>('idle');
  let resultMsg = $state('');
  let clusterInfo = $state<any>(null);

  async function checkToken() {
    const query = mint.trim();
    if (!query) return;

    status = 'loading';
    try {
      const res = await fetch(`/api/tokens/${query}/cluster`);
      const data = await res.json();

      if (data.status === 'found') {
        status = 'found';
        clusterInfo = data.cluster;
      } else if (data.status === 'processing') {
        status = 'processing';
        resultMsg = data.message;
      } else {
        status = 'not_found';
        resultMsg = data.message || "Not detected on radar yet. If this just launched, please check back in a few minutes.";
      }
    } catch (e) {
      status = 'not_found';
      resultMsg = "Failed to process search. Please try again.";
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') checkToken();
  }
</script>

<div class="w-full max-w-[640px] mb-8">
  <div class="flex items-center gap-2 mb-3">
    <svg class="w-4 h-4 text-[var(--live)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
    <p class="text-[11px] font-mono text-[var(--dim)] uppercase tracking-widest m-0">Manual Override: Target Audit</p>
  </div>
  
  <div class="flex flex-col sm:flex-row gap-3">
    <div class="relative flex-1">
      <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <span class="text-[var(--live)] font-mono text-sm opacity-60">❯</span>
      </div>
      <input 
        type="text" 
        placeholder="Input contract address..." 
        bind:value={mint}
        onkeydown={handleKeydown}
        autocomplete="off"
        class="w-full bg-[var(--panel)] border border-[var(--rule)] rounded-lg pl-10 pr-4 py-3 text-sm text-[var(--fg)] font-mono outline-none transition-all focus:bg-[#090D14] focus:border-[var(--live)] focus:shadow-[0_0_12px_rgba(52,211,153,0.1)] placeholder:text-[var(--dim)]/50"
      >
    </div>
    <button 
      onclick={checkToken} 
      disabled={status === 'loading'}
      class="bg-white text-black font-semibold text-sm px-6 py-3 rounded-lg border border-transparent hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    >
      {#if status === 'loading'}
        <span class="flex items-center gap-2">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Scanning...
        </span>
      {:else}
        Execute Audit
      {/if}
    </button>
  </div>
  
  {#if status === 'found' && clusterInfo}
    <div class="mt-4 p-5 border border-[var(--cyan)] bg-[rgba(56,189,248,0.05)] rounded-lg flex flex-col gap-3 animate-[fadeIn_0.3s_ease] shadow-[0_0_15px_rgba(56,189,248,0.1)]">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[var(--cyan)] shadow-[0_0_8px_rgba(56,189,248,0.5)]"></span>
        <span class="text-[11px] font-mono text-[var(--cyan)] uppercase tracking-widest font-bold">MATCH CONFIRMED</span>
      </div>
      <p class="text-[13px] text-[var(--fg)] leading-relaxed m-0 border-l-2 border-[var(--cyan)]/30 pl-3">
        Target <strong class="font-mono text-white">{mint.length > 12 ? mint.slice(0,6) + '...' + mint.slice(-4) : mint}</strong> is actively mapped to cluster 
        <strong class="text-[var(--cyan)] font-bold">"{clusterInfo.label || 'Unknown Theme'}"</strong>.
      </p>
      <div class="mt-1">
        <button class="bg-[var(--cyan)] text-[#090D14] text-[11px] font-mono uppercase tracking-wider font-bold px-4 py-2 rounded-[4px] hover:bg-white transition-colors flex items-center gap-2" onclick={() => window.location.href = `/radar?cluster=${clusterInfo.id}`}>
          Access Terminal View
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </div>
    </div>
  {:else if status === 'processing'}
    <div class="mt-4 p-4 border border-[var(--banana)]/30 bg-[rgba(250,204,21,0.05)] rounded-lg flex flex-col gap-2 animate-[fadeIn_0.3s_ease]">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[var(--banana)] animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.5)]"></span>
        <span class="text-xs font-mono text-[var(--banana)] uppercase tracking-wider font-bold">IN QUEUE</span>
      </div>
      <p class="text-[13px] text-[var(--fg)] leading-relaxed m-0">
        {resultMsg}
      </p>
    </div>
  {:else if status === 'not_found'}
    <div class="mt-4 p-4 border border-[var(--rule)] bg-[var(--panel)] rounded-lg flex flex-col gap-2 animate-[fadeIn_0.3s_ease]">
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono text-[var(--dim)] uppercase tracking-wider font-bold">NEGATIVE RETURN</span>
      </div>
      <p class="text-[13px] text-[var(--dim)] leading-relaxed m-0">
        {resultMsg}
      </p>
    </div>
  {/if}
</div>

<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
