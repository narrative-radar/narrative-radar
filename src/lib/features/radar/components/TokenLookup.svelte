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

<div class="lookup-bar">
  <p class="lookup-label mono">check a token — is it already part of a forming narrative?</p>
  <div class="lookup-row">
    <input 
      type="text" 
      placeholder="paste a Robinhood contract address" 
      bind:value={mint}
      onkeydown={handleKeydown}
      autocomplete="off"
      class="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[8px] p-[16px_20px] text-[14px] text-white font-[var(--font-mono)] outline-none transition-all focus:bg-[rgba(255,255,255,0.06)] focus:border-[rgba(255,255,255,0.2)] placeholder:text-[var(--text-tertiary)]"
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
  {:else if status === 'processing'}
    <div class="lookup-result show processing">
      <span class="inline-flex items-center gap-[6px] mb-1">
        <i class="w-[7px] h-[7px] rounded-full bg-[var(--state-fast)] animate-pulse"></i>
        <strong>On Radar Queue</strong>
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
  .lookup-bar { width: 100%; margin-bottom: 28px; }
  .lookup-row { display: flex; gap: 8px; max-width: 520px; }
  .lookup-row button {
    background: white; color: black; border: none; border-radius: 8px;
    padding: 0 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s;
  }
  .lookup-row button:disabled { opacity: 0.7; cursor: not-allowed; }
  .lookup-label { font-size: 11px; color: var(--text-tertiary, #565d6b); margin: 0 0 10px; font-family: var(--font-mono, monospace); text-transform: uppercase; letter-spacing: 0.05em; }
  
  .lookup-result { margin-top: 12px; max-width: 520px; padding: 14px 18px; border-radius: 8px; border: 1px solid var(--divider, rgba(255, 255, 255, 0.08)); background: rgba(255,255,255,0.02); font-size: 13px; display: none; line-height: 1.5; color: var(--text-secondary); }
  .lookup-result.show { display: block; animation: fadeIn 0.3s ease; }
  .lookup-result.found { border-color: rgba(62,191,176, 0.3); background: rgba(62,191,176, 0.05); color: #fff;}
  .lookup-result.processing { border-color: rgba(224,168,62, 0.3); background: rgba(224,168,62, 0.05); color: #fff;}
  .lookup-result .lr-link { color: white; background: none; border: none; padding: 0; font: inherit; text-decoration: underline; cursor: pointer; opacity: 0.8; }
  .lookup-result .lr-link:hover { opacity: 1; }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
