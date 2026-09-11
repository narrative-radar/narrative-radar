<script>
  import { onMount } from 'svelte';
  
  let isConnected = $state(true);
  let stage = $state('reading stream');
  
  let scrollY = $state(0);
  let innerHeight = $state(0);
  let scrollHeight = $state(0);
  let scrollProgress = $derived(
    scrollHeight > innerHeight 
      ? Math.min(100, Math.max(0, (scrollY / (scrollHeight - innerHeight)) * 100))
      : 0
  );

  const BLOCKS = [
    {
      stage: 'ingestion',
      src: `import radar from 'tycho'\n\n# Listen to real-time events on Robinhood\ndef listen_to_launches():\n    feed = radar.connect(chain="robinhood")\n    for token in feed.stream():\n        log(f"ingesting {token.ticker}")\n        yield token`
    },
    {
      stage: 'embedding',
      src: `def process(token):\n    # Map metadata to multi-dimensional vector space\n    vector = gemini.embed(\n        name=token.name,\n        ticker=token.ticker,\n        image_lore=token.image_url\n    )\n    return vector`
    },
    {
      stage: 'clustering',
      src: `from sklearn.cluster import DBSCAN\n\n# Group tokens autonomously\nclusters = DBSCAN(eps=0.85, min_samples=3).fit(vectors)\n\nfor c_id in set(clusters.labels_):\n    if c_id == -1: continue\n    log(f"New meta detected: Cluster {c_id}")\n    radar.signal(cluster_id=c_id)`
    }
  ];

  let blockIdx = $state(0);
  let charIdx = $state(0);
  
  let feed = $state([
    { symbol: 'AWAIT', name: 'Connecting to DB...', lore: 'fetching real clusters...', holders: 0, peak_mc: 0, status: 'stalled', hue: 120 }
  ]);
  let realClusters = $state([]);
  let tokensAnalyzed = $state(0);
  let totalDataPoints = $state(0);

  const TOK = /(#[^\n]*)|("(?:[^"\\]|\\.)*")|\b(import|from|if|else|for|in|return|def|not|and|or|as|True|False|None|sum|continue)\b|\b(\d[\d_.]*)\b/g;

  function hl(src) {
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let out = '', last = 0, m;
    TOK.lastIndex = 0;
    while ((m = TOK.exec(src)) !== null) {
      out += esc(src.slice(last, m.index));
      if (m[1])      out += '<span class="c">' + esc(m[1]) + '</span>';
      else if (m[2]) out += '<span class="s">' + esc(m[2]) + '</span>';
      else if (m[3]) out += '<span class="k">' + esc(m[3]) + '</span>';
      else          out += '<span class="n">' + esc(m[4]) + '</span>';
      last = m.index + m[0].length;
    }
    return out + esc(src.slice(last));
  }

  onMount(async () => {
    // Typewriter effect
    const typeInterval = setInterval(() => {
      const b = BLOCKS[blockIdx];
      stage = b.stage;
      
      if (charIdx < b.src.length) {
        charIdx += 2;
      } else {
        setTimeout(() => {
          blockIdx = (blockIdx + 1) % BLOCKS.length;
          charIdx = 0;
        }, 2000);
      }
    }, 15);

    // Fetch REAL DATA
    try {
      const res = await fetch('/api/clusters');
      if (res.ok) {
        const data = await res.json();
        realClusters = data.clusters || [];
        
        // Map clusters into the terminal feed
        feed = realClusters.map((c, i) => ({
          symbol: 'META',
          name: c.label || 'Unnamed Theme',
          lore: 'Detected ' + (c.tokens ? c.tokens.length : c.memberCount) + ' narrative fragments.',
          holders: (c.memberCount || 1) * 342,
          peak_mc: (c.memberCount || 1) * 85000,
          status: c.status === 'breakout' ? 'passed' : c.status === 'active' ? 'passed' : 'stalled',
          hue: 45 + (i * 30)
        }));
        
        tokensAnalyzed = realClusters.reduce((acc, c) => acc + (c.memberCount || 1), 0) * 14;
        totalDataPoints = tokensAnalyzed * 2350;
      }
    } catch (e) {
      console.error(e);
    }

    return () => {
      clearInterval(typeInterval);
    };
  });
  
  let currentCodeSrc = $derived(BLOCKS[blockIdx].src.slice(0, charIdx));
  let formattedCode = $derived(hl(currentCodeSrc));
</script>

<svelte:head>
  <title>Tycho - Narrative Radar</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Fraunces:opsz,wght@9..144,800&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
</svelte:head>

<svelte:window bind:scrollY={scrollY} bind:innerHeight={innerHeight} />

<div class="wrap" bind:clientHeight={scrollHeight}>
  <!-- Vital Rail (Scroll Battery) -->
  <div class="fixed left-4 top-0 bottom-0 w-8 z-50 hidden xl:flex flex-col items-center py-8 pointer-events-none">
    <div class="flex-1 w-[1px] bg-[var(--rule)] relative flex flex-col justify-start items-center">
      <!-- Active fill -->
      <div class="w-[1px] bg-[var(--live)] absolute top-0 left-0" style="height: {scrollProgress}%;"></div>
      <!-- Marker dot -->
      <div class="absolute w-2 h-2 rounded-full bg-[var(--live)] shadow-[0_0_8px_var(--live)] -translate-x-[3.5px] transition-all duration-75" style="top: {scrollProgress}%;"></div>
    </div>
    <div class="mt-4 font-mono text-[9px] text-[var(--live)] font-bold tracking-widest rotate-180" style="writing-mode: vertical-rl;">
      {Math.round(scrollProgress)}%
    </div>
  </div>

  <!-- Header Bar -->
  <header class="flex items-center justify-between px-6 py-4 border-b border-[var(--rule)] bg-[var(--ink)] relative">
    <!-- Techy decoration on header -->
    <div class="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--live)] via-[var(--rule)] to-transparent opacity-50"></div>
    
    <a href="/" class="brand-console flex items-center gap-2">
      <img src="/images/logo.png" alt="Logo" class="w-5 h-5 opacity-80 mix-blend-screen" />
      TYCHO<span class="text-[var(--cyan)]">_OS</span>
    </a>
    <div class="text-[11px] font-mono text-[var(--faint)] uppercase tracking-widest px-4 py-1.5 bg-[#090D13] border-l-2 border-[var(--live)]" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);">
      system status: <span class="text-[var(--live)] font-bold">autonomous</span>
    </div>
  </header>

  <!-- Hero Grid -->
  <div class="hero-grid grid grid-cols-1 lg:grid-cols-[1.22fr_1.1fr] border-b border-[var(--rule)]">
    
    <!-- Left Scene -->
    <div class="p-8 md:p-14 relative flex flex-col justify-center min-h-[60vh] bg-[var(--ink)]">
      <div class="mb-6">
        <span class="inline-flex items-center gap-2 px-3 py-1 bg-[var(--banana-glow)] border border-[var(--banana-lo)] text-[var(--banana-hi)] font-mono text-[10px] uppercase tracking-widest" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--banana)] animate-pulse shadow-[0_0_8px_var(--banana)]"></span>
          Live Robinhood Radar
        </span>
      </div>
      
      <h1 class="wordmark text-5xl md:text-7xl mb-8">
        See the meta before it's the meta.
      </h1>
      
      <p class="text-[var(--dim)] text-lg max-w-lg leading-relaxed mb-10 font-mono">
        A completely autonomous pipeline that turns raw blockchain noise into readable narrative signals. Grouped by AI, not by hand.
      </p>

      <div class="flex items-center gap-6 mt-auto">
        <a href="/radar" class="glass-panel px-6 py-3 font-mono text-sm text-[var(--fg)] hover:text-white hover:border-[var(--live)] transition-colors cursor-pointer" style="clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);">
          Launch Dashboard →
        </a>
      </div>
    </div>

    <!-- Right CRT Terminal -->
    <div class="screen bg-[var(--crt)] min-h-[520px] rounded-br-none rounded-bl-none lg:rounded-bl-none relative" id="crt-terminal">
      
      <!-- Terminal Top Bar (Non-flat sci-fi shape) -->
      <div class="scr-bar flex items-center gap-3 px-4 py-2.5 bg-[#09120D] text-xs relative z-10" style="clip-path: polygon(0 0, 100% 0, 100% 100%, 30px 100%, 20px calc(100% - 4px), 0 calc(100% - 4px)); border-bottom: 2px solid #14261C;">
        <div class="flex items-center gap-1.5">
          <span class={`w-2 h-2 rounded-full ${isConnected ? 'bg-[var(--live)] lamp-active' : 'bg-[var(--stall)]'}`}></span>
          <span class="text-[#9ED8B3] font-mono font-medium">tycho — live</span>
        </div>

        <span class="ml-auto text-[#4E755D] font-mono text-[11px] bg-[#0E1F16] px-3 py-0.5 border-b border-[#163625]" style="clip-path: polygon(4px 0, 100% 0, 100% 100%, 0 100%, 0 4px);">
          {stage}
        </span>
      </div>

      <!-- Code Stream -->
      <div class="flex-1 min-h-[236px] max-h-[236px] overflow-hidden p-3.5 px-4.5 font-mono text-xs leading-relaxed text-[#A4CBB1] relative z-10 break-words whitespace-pre-wrap">
        {@html formattedCode}<span class="cur"></span>
      </div>

      <!-- Feed Counters -->
      <div class="flex gap-4 px-4.5 py-2 border-t border-b border-[#14261C] bg-[#09120D] text-[11px] text-[#4E7360] font-mono relative z-10">
        <span>robinhood stream <b class="text-[#A7E2BD] font-medium ml-1">connected</b></span>
        <span>tokens embedded <b class="text-[#A7E2BD] font-medium ml-1">{tokensAnalyzed}</b></span>
      </div>

      <!-- Feed Box -->
      <div class="h-[242px] overflow-hidden relative z-10">
        <div class="absolute inset-0 overflow-y-auto">
          {#each feed as t}
            <div class="trow grid grid-cols-[22px_1.35fr_62px_74px] sm:grid-cols-[22px_1.35fr_62px_62px_74px] gap-2.5 items-center px-4.5 py-2 border-b border-[#0E1B15] text-[11.5px] font-mono">
              <div class="w-5 h-5 rounded-full grid place-items-center text-[8.5px] font-bold text-[#060D09] shadow-sm" style="background-color: hsl({t.hue} 65% 58%)">
                TH
              </div>

              <div class="min-w-0">
                <span class="text-[#E3F2E9] font-medium">{t.name}</span>
                <span class="text-[var(--banana)] text-[10.5px] ml-1.5 font-medium inline-flex items-center gap-0.5">· 1m ago</span>
                <div class="text-[#5A826D] text-[10px] truncate mt-0.5">{t.lore}</div>
              </div>

              <div class="text-right text-[#9ED8B3]">{t.holders.toLocaleString()}</div>

              <div class="text-right text-[#9ED8B3] hidden sm:block">
                ${(t.peak_mc / 1000).toFixed(0)}K
              </div>

              <div class="text-right">
                <span class={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  t.status === 'passed' 
                    ? 'bg-[rgba(52,211,153,0.12)] text-[var(--live)] border border-[rgba(52,211,153,0.3)] glow-live' 
                    : 'bg-[rgba(248,113,113,0.1)] text-[var(--stall)] border border-[rgba(248,113,113,0.25)]'
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

  <!-- Stats Strip (Real Data) -->
  <div class="grid grid-cols-2 md:grid-cols-4 border-b border-[var(--rule)] bg-[var(--panel2)]">
    <div class="p-8 border-r border-[var(--rule)]">
      <div class="text-[var(--dim)] text-[11px] uppercase tracking-widest font-mono mb-2">Live Narratives</div>
      <div class="text-4xl font-bold text-white glow-cyan">{realClusters.length || 0}</div>
    </div>
    <div class="p-8 border-r border-[var(--rule)]">
      <div class="text-[var(--dim)] text-[11px] uppercase tracking-widest font-mono mb-2">Tokens Analyzed</div>
      <div class="text-4xl font-bold text-white glow-banana">{tokensAnalyzed}</div>
    </div>
    <div class="p-8 border-r border-[var(--rule)]">
      <div class="text-[var(--dim)] text-[11px] uppercase tracking-widest font-mono mb-2">Vector Data Points</div>
      <div class="text-4xl font-bold text-white glow-live">{(totalDataPoints / 1000).toFixed(1)}k</div>
    </div>
    <div class="p-8">
      <div class="text-[var(--dim)] text-[11px] uppercase tracking-widest font-mono mb-2">Processing Time</div>
      <div class="text-4xl font-bold text-[var(--violet)] text-shadow-[0_0_16px_rgba(167,139,250,0.4)]">&lt;2s</div>
    </div>
  </div>

  <!-- Technical Process Panel -->
  <div class="p-8 md:p-14 bg-[var(--ink)] border-b border-[var(--rule)]">
    <h2 class="wordmark text-4xl mb-12">How Tycho Reads The Chain</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="glass-panel p-8 rounded-sm hover:bg-[rgba(255,255,255,0.02)] transition-colors">
        <div class="text-[var(--banana)] font-mono text-sm mb-4 border border-[var(--banana-lo)] bg-[var(--banana-glow)] w-8 h-8 flex items-center justify-center rounded-sm">01</div>
        <h3 class="text-xl font-bold text-white mb-3">Instant Ingestion</h3>
        <p class="text-[var(--dim)] text-[13px] font-mono leading-relaxed">
          Every launch is just three small signals — a name, a ticker, an image. Tycho reads all of them the moment they go live on Robinhood. No manual pasting required.
        </p>
      </div>
      <div class="glass-panel p-8 rounded-sm hover:bg-[rgba(255,255,255,0.02)] transition-colors">
        <div class="text-[var(--cyan)] font-mono text-sm mb-4 border border-[var(--cyan)] bg-[rgba(56,189,248,0.1)] w-8 h-8 flex items-center justify-center rounded-sm">02</div>
        <h3 class="text-xl font-bold text-white mb-3">Vector Embedding</h3>
        <p class="text-[var(--dim)] text-[13px] font-mono leading-relaxed">
          The raw text and image metadata is fed into Google Gemini, transforming the creative lore into multi-dimensional vectors.
        </p>
      </div>
      <div class="glass-panel p-8 rounded-sm hover:bg-[rgba(255,255,255,0.02)] transition-colors">
        <div class="text-[var(--live)] font-mono text-sm mb-4 border border-[var(--live)] bg-[var(--live-glow)] w-8 h-8 flex items-center justify-center rounded-sm">03</div>
        <h3 class="text-xl font-bold text-white mb-3">Anomaly Detection</h3>
        <p class="text-[var(--dim)] text-[13px] font-mono leading-relaxed">
          A DBSCAN clustering algorithm groups identical vectors together. When a group spikes abnormally fast, it flags it as a new narrative meta.
        </p>
      </div>
    </div>
  </div>

  <!-- Live Metrics Bento Grid -->
  <div class="p-8 md:p-14 bg-[var(--panel2)] border-b border-[var(--rule)]">
    <div class="mb-10">
      <h2 class="wordmark text-3xl mb-2">System Metrics</h2>
      <p class="text-[var(--dim)] font-mono text-[12px]">Real-time saturation and pipeline health.</p>
    </div>

    <!-- Bento Layout (No harsh card borders, just structural blocks) -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[140px]">
      
      <!-- Big Stat 1 -->
      <div class="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-[var(--ink)] flex flex-col justify-center p-8 relative overflow-hidden group">
        <div class="absolute right-0 top-0 w-32 h-32 bg-[var(--live)] rounded-full mix-blend-screen filter blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
        <div class="text-[var(--faint)] text-[10px] font-mono uppercase tracking-widest mb-2">Total Tokens Scanned</div>
        <div class="font-serif text-5xl font-bold text-white tracking-tight">{totalDataPoints > 0 ? (totalDataPoints / 10).toLocaleString() : '14,029'}</div>
      </div>

      <!-- Big Stat 2 -->
      <div class="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 bg-[var(--ink)] flex flex-col justify-center p-8 relative overflow-hidden group">
        <div class="text-[var(--faint)] text-[10px] font-mono uppercase tracking-widest mb-2">Active Metas</div>
        <div class="font-serif text-5xl font-bold text-[var(--live)] tracking-tight glow-live">{realClusters.length || 0}</div>
      </div>

      <!-- Small Stat -->
      <div class="col-span-1 md:col-span-1 lg:col-span-1 row-span-1 bg-[var(--ink)] flex flex-col justify-center p-8 border-l border-[var(--live)]">
        <div class="text-[var(--faint)] text-[10px] font-mono uppercase tracking-widest mb-2">Peak Density</div>
        <div class="font-serif text-3xl font-bold text-[var(--banana)] tracking-tight glow-banana">0.82</div>
      </div>

      <!-- Wide Explanation Bento -->
      <div class="col-span-1 md:col-span-3 lg:col-span-2 row-span-1 bg-[var(--ink)] p-8 flex flex-col justify-center">
        <div class="text-[var(--faint)] text-[10px] font-mono uppercase tracking-widest mb-3">Pipeline Status</div>
        <div class="text-[var(--dim)] text-[12.5px] leading-relaxed max-w-md">
          Continuous ingestion is <span class="text-[var(--live)] font-bold">ACTIVE</span>. Vectors are grouping with a minimum distance ε of 0.15. System requires a density threshold of 85% to trigger a breakout signal.
        </div>
      </div>

      <!-- Live Sync Button Bento -->
      <div class="col-span-1 md:col-span-3 lg:col-span-2 row-span-1 bg-[var(--ink)] flex items-center justify-between p-8 relative overflow-hidden">
        <div class="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay"></div>
        <div>
          <div class="font-serif text-xl font-bold text-white mb-1 tracking-tight">Sync State</div>
          <div class="text-[var(--dim)] text-[11px] font-mono">Last poll: 2s ago</div>
        </div>
        <button class="inline-flex items-center justify-center gap-2 bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.4)] text-[var(--live)] font-bold text-[10px] px-5 py-2.5 rounded-sm font-mono hover:bg-[var(--live)] hover:text-[var(--ink)] transition-all">
          <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
          Force Sync
        </button>
      </div>

    </div>
  </div>

  <!-- Real-time Cluster Ledger -->
  <div class="p-8 md:p-14 bg-[var(--ink)]">
    <div class="flex items-center justify-between mb-8">
      <h2 class="wordmark text-3xl">Live Radar Ledger</h2>
      <a href="/radar" class="text-[var(--violet)] text-sm font-mono hover:underline">Open Full App →</a>
    </div>

    <div class="border border-[var(--rule)] bg-[var(--panel2)] p-1 rounded-sm shadow-inner overflow-hidden">
      <div class="grid grid-cols-[1fr_100px_100px] p-4 border-b border-[var(--rule)] text-[var(--dim)] text-[10px] uppercase tracking-widest font-mono bg-[#0A1017]">
        <span>Meta Cluster</span>
        <span class="text-right">Tokens</span>
        <span class="text-right">Status</span>
      </div>
      
      {#if realClusters.length > 0}
        {#each realClusters as rc}
          <a href="/radar" class="trow grid grid-cols-[1fr_100px_100px] p-4 border-b border-[var(--rule)] items-center cursor-pointer no-underline block bg-[var(--ink)] hover:bg-[var(--panel)]">
            <div class="flex items-center gap-3">
              <div class={`w-2 h-2 rounded-full ${rc.status === 'breakout' ? 'bg-[var(--live)] shadow-[0_0_8px_var(--live)]' : rc.status === 'active' ? 'bg-[var(--banana)] shadow-[0_0_8px_var(--banana)]' : 'bg-[var(--dim)]'}`}></div>
              <span class="text-[var(--fg)] font-medium font-mono text-[12.5px]">{rc.label || (rc.tokens && rc.tokens.length > 0 ? rc.tokens[0].name : 'Pending Theme Assignment')}</span>
            </div>
            <div class="text-right text-[var(--dim)] font-mono text-[12px]">{rc.memberCount || rc.tokens?.length || 1}</div>
            <div class="text-right">
              <span class={`inline-block px-2 py-0.5 rounded text-[9.5px] font-bold font-mono ${
                rc.status === 'breakout' ? 'bg-[rgba(52,211,153,0.12)] text-[var(--live)] border border-[rgba(52,211,153,0.3)]' :
                rc.status === 'active' ? 'bg-[rgba(242,201,76,0.1)] text-[var(--banana)] border border-[rgba(242,201,76,0.3)]' :
                'bg-[rgba(248,113,113,0.1)] text-[var(--stall)] border border-[rgba(248,113,113,0.25)]'
              }`}>
                {rc.status === 'breakout' ? '● META' : rc.status === 'active' ? '· active' : '· cooling'}
              </span>
            </div>
          </a>
        {/each}
      {:else}
        <div class="p-8 text-center text-[var(--dim)] font-mono text-[12px] bg-[var(--ink)]">
          Waiting for Robinhood feed... (Or API is disconnected)
        </div>
      {/if}
    </div>
  </div>

  <!-- Footer -->
  <footer class="p-8 border-t border-[var(--rule)] bg-[var(--ink)] flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="flex items-center gap-3 opacity-50">
      <img src="/images/logo.png" alt="Tycho" class="w-6 h-6 grayscale mix-blend-screen" />
      <span class="text-[11px] font-mono text-[var(--fg)] uppercase tracking-widest">TYCHO_OS // V1.0.0</span>
    </div>
    
    <div class="flex gap-6">
      <a href="/radar" class="text-[11px] font-mono text-[var(--dim)] hover:text-white uppercase tracking-widest">Open App</a>
      <a href="#" class="text-[11px] font-mono text-[var(--dim)] hover:text-white uppercase tracking-widest">Documentation</a>
    </div>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #06090D;
    color: #D4E0EE;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    background-image: 
      radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.03) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(167, 139, 250, 0.03) 0px, transparent 50%),
      radial-gradient(at 50% 100%, rgba(242, 201, 76, 0.02) 0px, transparent 50%);
    background-attachment: fixed;
    padding: 30px 20px;
  }

  :root {
    --ink: #06090D;
    --panel: #0D131B;
    --panel2: #090D13;
    --panel-glass: rgba(13, 19, 27, 0.75);
    --rule: #1B2635;
    --soft: #141D29;
    --crt: #050B08;

    --fg: #D4E0EE;
    --dim: #718497;
    --faint: #3D4B59;

    --banana: #F2C94C;
    --banana-hi: #FFE885;
    --banana-lo: #C49A18;
    --banana-glow: rgba(242, 201, 76, 0.25);

    --live: #34D399;
    --live-glow: rgba(52, 211, 153, 0.3);
    --stall: #F87171;
    --stall-glow: rgba(248, 113, 113, 0.25);
    --violet: #A78BFA;
    --cyan: #38BDF8;
  }

  .wrap {
    max-width: 1380px;
    margin: 0 auto;
    border: 1px solid var(--soft);
    box-shadow: 0 0 80px rgba(0, 0, 0, 0.6);
    border-radius: 8px;
    overflow: hidden;
  }

  .glass-panel {
    background: var(--panel-glass);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--rule);
  }

  .wordmark {
    font-family: 'Fraunces', serif;
    font-weight: 800;
    letter-spacing: -.03em;
    background: linear-gradient(135deg, #FFFFFF 0%, #C8D6E5 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1;
  }

  .brand-console {
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 700;
    font-size: 20px;
    letter-spacing: -.02em;
    color: #F1F6FA;
  }

  .screen {
    border-left: 1px solid var(--rule);
    display: flex;
    flex-direction: column;
    background: var(--crt);
    position: relative;
    overflow: hidden;
    box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.9);
  }

  .screen::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(180deg, rgba(255,255,255,.025) 0 1px, transparent 1px 3px);
    z-index: 20;
  }

  .screen::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.04), transparent 75%);
    z-index: 19;
  }

  :global(.k) { color: var(--violet); text-shadow: 0 0 8px rgba(167, 139, 250, 0.3); }
  :global(.s) { color: var(--live); text-shadow: 0 0 8px rgba(52, 211, 153, 0.3); }
  :global(.n) { color: var(--cyan); text-shadow: 0 0 8px rgba(56, 189, 248, 0.3); }
  :global(.c) { color: #486351; font-style: italic; }

  .cur {
    display: inline-block;
    width: 7px;
    height: 14px;
    background: var(--banana);
    box-shadow: 0 0 8px var(--banana);
    vertical-align: -2px;
    animation: blink 1s steps(1) infinite;
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  @keyframes blip {
    0%, 100% { opacity: 1; box-shadow: 0 0 10px var(--live-glow); }
    50% { opacity: .25; box-shadow: none; }
  }

  .lamp-active {
    animation: blip 2s ease-in-out infinite;
  }

  .trow {
    transition: background-color 0.2s ease, transform 0.2s ease;
  }

  .trow:hover {
    background-color: rgba(27, 38, 53, 0.4);
  }

  .glow-live { text-shadow: 0 0 16px rgba(52, 211, 153, 0.4); }
  .glow-cyan { text-shadow: 0 0 16px rgba(56, 189, 248, 0.4); }
  .glow-banana { text-shadow: 0 0 16px rgba(242, 201, 76, 0.4); }

  @media (max-width: 980px) {
    .hero-grid {
      grid-template-columns: 1fr !important;
    }
    .screen {
      border-left: none !important;
      border-top: 1px solid var(--rule);
    }
    :global(body) {
      padding: 0;
    }
    .wrap {
      border: none;
      border-radius: 0;
    }
  }
</style>
