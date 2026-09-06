<script lang="ts">
  let mint = $state('');
  let status = $state<'idle' | 'loading' | 'found' | 'queued' | 'not_found'>('idle');
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
      } else if (data.status === 'queued') {
        status = 'queued';
        resultMsg = data.message;
      } else {
        status = 'not_found';
        resultMsg = data.message || "Not clustered yet — this token may be too new, or hasn't been grouped into a theme.";
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

<div class="lookup-bar">
  <p class="lookup-label mono">check a token — is it already part of a forming narrative?</p>
  <div class="lookup-row">
    <input 
      type="text" 
      placeholder="paste a Pump.fun contract address" 
      bind:value={mint}
      onkeydown={handleKeydown}
      autocomplete="off"
    >
    <button onclick={checkToken} disabled={status === 'loading'}>
      {status === 'loading' ? '...' : 'Check'}
    </button>
  </div>
  
  {#if status === 'found' && clusterInfo}
    <div class="lookup-result show found">
      <strong>{mint.slice(0,6)}...{mint.slice(-4)}</strong> is part of <strong>{clusterInfo.label || 'Unknown Theme'}</strong> — {Number(clusterInfo.growthRate) > 0 ? '+' : ''}{clusterInfo.growthRate}%. 
      <button class="lr-link" onclick={() => window.location.href = `/radar?cluster=${clusterInfo.id}`}>view the cluster →</button>
    </div>
  {:else if status === 'queued'}
    <div class="lookup-result show queued">
      <span class="inline-flex items-center gap-[6px] mb-1">
        <i class="w-[7px] h-[7px] rounded-full bg-[var(--state-fast)] animate-pulse"></i>
        <strong>Added to Priority Queue</strong>
      </span>
      <br />
      {resultMsg}
    </div>
  {:else if status === 'not_found'}
    <div class="lookup-result show">
      {resultMsg}
    </div>
  {/if}
</div>

<style>
  .lookup-bar { width: 100%; margin-bottom: 24px; }
  .lookup-row { display: flex; gap: 8px; max-width: 480px; }
  .lookup-row input {
    flex: 1; background: var(--surface, #0a0d12); border: 1px solid var(--divider, rgba(255, 255, 255, 0.08)); border-radius: 4px;
    padding: 9px 12px; color: var(--text-primary, #e8ebef); font-family: var(--font-mono, monospace); font-size: 12.5px;
  }
  .lookup-row input::placeholder { color: var(--text-tertiary, #565d6b); }
  .lookup-row input:focus-visible { outline: 2px solid var(--accent, #e0a83e); outline-offset: 1px; }
  .lookup-row button {
    background: var(--accent, #e0a83e); color: var(--bg, #05070a); border: none; border-radius: 4px;
    padding: 9px 16px; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;
  }
  .lookup-row button:disabled { opacity: 0.7; cursor: not-allowed; }
  .lookup-label { font-size: 11px; color: var(--text-tertiary, #565d6b); margin: 0 0 8px; font-family: var(--font-mono, monospace); }
  .lookup-result { margin-top: 10px; max-width: 480px; padding: 11px 14px; border-radius: 4px; border: 1px solid var(--divider, rgba(255, 255, 255, 0.08)); background: var(--surface, #0a0d12); font-size: 12.5px; display: none; line-height: 1.5; }
  .lookup-result.show { display: block; animation: fadeIn 0.3s ease; }
  .lookup-result.found { border-color: var(--state-active, #3ebfb0); }
  .lookup-result.queued { border-color: var(--state-fast, #e0a83e); }
  .lookup-result .lr-link { color: var(--accent, #e0a83e); background: none; border: none; padding: 0; font: inherit; text-decoration: underline; cursor: pointer; }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
