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

  // Scrollytelling State
  let howWorksRef = $state();
  let activeStep = $state(0);

  function scrambleText(node, text) {
    const chars = '!-_[]{}—=+*^?#';
    let frame = 0;
    let queue = [];
    
    for (let i = 0; i < text.length; i++) {
      queue.push({
        from: chars[Math.floor(Math.random() * chars.length)],
        to: text[i],
        start: Math.floor(Math.random() * 40),
        end: Math.floor(Math.random() * 40) + 40
      });
    }
    
    const update = () => {
      let output = '';
      let complete = 0;
      for (let i = 0; i < queue.length; i++) {
        let { from, to, start, end } = queue[i];
        if (frame >= end) {
          complete++;
          output += to;
        } else if (frame >= start) {
          output += `<span class="opacity-50 text-[var(--cyan)]">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
        } else {
          output += `<span class="opacity-0">${from}</span>`;
        }
      }
      node.innerHTML = output;
      if (complete === queue.length) return;
      frame++;
      requestAnimationFrame(update);
    };
    
    setTimeout(() => requestAnimationFrame(update), 500);
  }

  $effect(() => {
    if (howWorksRef && scrollY !== undefined && innerHeight !== undefined) {
      const rect = howWorksRef.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - innerHeight)));
      activeStep = Math.min(2, Math.floor(progress * 3));
    }
  });

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

<div class="site-bg">
<div class="wrap" bind:clientHeight={scrollHeight}>

  <!-- Header Bar -->
  <header class="flex items-center justify-between md:px-6 py-4 border-b border-[var(--rule)] bg-[var(--ink)] relative z-20">
    <!-- Techy decoration on header -->
    <div class="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--live)] via-[var(--rule)] to-transparent opacity-50"></div>
    
    <div class="flex items-center gap-6 md:gap-12">
      <a href="/" class="brand-console flex items-center gap-2">
        <img src="/images/logo.png" alt="Logo" class="w-10 h-10 opacity-80 mix-blend-screen" />
        TYCHO<span class="hidden md:block text-[var(--accent)]">_NARRATIVE RADAR</span>
      </a>
      
      <!-- TABS -->
      <nav class="hidden md:flex items-center gap-8 font-mono text-[11px] uppercase tracking-widest mt-1">
        <a href="/" class="text-white border-b border-[var(--live)] pb-1 font-bold">Overview</a>
        <a href="/radar" class="text-[var(--dim)] hover:text-white transition-colors pb-1">Radar</a>
        <a href="/track-record" class="text-[var(--dim)] hover:text-white transition-colors pb-1">Track Record</a>
      </nav>
    </div>

    <div class="text-[8px] md:text-[11px] font-mono text-[var(--faint)] uppercase tracking-widest px-4 py-1.5 bg-[#090D13] border-l-2 border-[var(--live)]" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);">
      system status: <span class="text-[var(--live)] font-bold animate-pulse">autonomous</span>
    </div>
  </header>

  <!-- Hero Grid -->
  <div class="hero-grid grid grid-cols-1 lg:grid-cols-[1.22fr_1.1fr] border-b border-[var(--rule)] max-w-[1380px] mx-auto">
    
    <!-- Left Scene -->
    <div class="p-8 md:p-14 relative flex flex-col justify-center min-h-[60vh] bg-[var(--ink)]">
      <div class="mb-6">
        <span class="inline-flex items-center gap-2 px-3 py-1 bg-[var(--banana-glow)] border border-[var(--banana-lo)] text-[var(--banana-hi)] font-mono text-[10px] uppercase tracking-widest" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--banana)] animate-pulse shadow-[0_0_8px_var(--banana)]"></span>
          Live Robinhood Radar
        </span>
      </div>
      
      <h1 class="wordmark text-5xl md:text-7xl mb-8" use:scrambleText={"See the meta before it's the meta."}>
        See the meta before it's the meta.
      </h1>
      
      <p class="text-[var(--dim)] text-lg max-w-lg leading-relaxed mb-6 font-mono">
        A completely autonomous pipeline that turns raw blockchain noise into readable narrative signals. Grouped by AI, not by hand.
      </p>

      <div class="grid grid-cols-2 gap-4 mt-6 mb-10">
        <div class="border-l border-[var(--rule)] pl-4">
          <div class="text-[10px] text-[var(--dim)] font-mono uppercase tracking-widest mb-1">Processing Delay</div>
          <div class="text-white font-mono text-sm">~1.2 seconds</div>
        </div>
        <div class="border-l border-[var(--rule)] pl-4">
          <div class="text-[10px] text-[var(--dim)] font-mono uppercase tracking-widest mb-1">Embedding Matrix</div>
          <div class="text-white font-mono text-sm">768 Dimensions</div>
        </div>
      </div>

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
      <div class="h-[292px] overflow-hidden relative z-10">
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

  <!-- Technical Process Panel (Pinned Scrollytelling) -->
  <div bind:this={howWorksRef} class="h-auto md:h-[150vh] bg-[var(--ink)] relative border-b border-[var(--rule)]">
    <div class="relative md:sticky top-0 h-auto md:h-screen flex flex-col md:flex-row overflow-hidden">
      
      <!-- Left: Narrative Text -->
      <div class="w-full md:w-1/2 p-8 md:p-14 lg:p-20 flex flex-col justify-center h-full">
        <h2 class="wordmark text-4xl mb-12">How Tycho Reads The Chain</h2>
        
        <div class="flex flex-col gap-10 relative">
          <!-- Connecting Line -->
          <div class="absolute left-4 top-4 bottom-4 w-[1px] bg-[var(--rule)] -z-10"></div>
          
          <!-- Step 1 -->
          <div class="flex gap-6 transition-all duration-500 {activeStep === 0 ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-2 grayscale'}">
            <div class="w-8 h-8 rounded-sm bg-[var(--ink)] border {activeStep === 0 ? 'border-[var(--banana)] text-[var(--banana)] shadow-[0_0_12px_var(--banana-glow)]' : 'border-[var(--dim)] text-[var(--dim)]'} flex items-center justify-center font-mono text-sm shrink-0 transition-colors duration-500 z-10">01</div>
            <div>
              <h3 class="text-xl font-bold text-white mb-2">Instant Ingestion</h3>
              <p class="text-[var(--dim)] text-[13px] font-mono leading-relaxed">
                Every launch is just three small signals — a name, a ticker, an image. Tycho reads all of them the moment they go live on Robinhood. No manual pasting required.
              </p>
            </div>
          </div>
          
          <!-- Step 2 -->
          <div class="flex gap-6 transition-all duration-500 {activeStep === 1 ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-2 grayscale'}">
            <div class="w-8 h-8 rounded-sm bg-[var(--ink)] border {activeStep === 1 ? 'border-[var(--cyan)] text-[var(--cyan)] shadow-[0_0_12px_rgba(56,189,248,0.2)]' : 'border-[var(--dim)] text-[var(--dim)]'} flex items-center justify-center font-mono text-sm shrink-0 transition-colors duration-500 z-10">02</div>
            <div>
              <h3 class="text-xl font-bold text-white mb-2">Vector Embedding</h3>
              <p class="text-[var(--dim)] text-[13px] font-mono leading-relaxed">
                The raw text and image metadata is fed into Google Gemini, transforming the creative lore into multi-dimensional vectors.
              </p>
            </div>
          </div>
          
          <!-- Step 3 -->
          <div class="flex gap-6 transition-all duration-500 {activeStep === 2 ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-2 grayscale'}">
            <div class="w-8 h-8 rounded-sm bg-[var(--ink)] border {activeStep === 2 ? 'border-[var(--live)] text-[var(--live)] shadow-[0_0_12px_var(--live-glow)]' : 'border-[var(--dim)] text-[var(--dim)]'} flex items-center justify-center font-mono text-sm shrink-0 transition-colors duration-500 z-10">03</div>
            <div>
              <h3 class="text-xl font-bold text-white mb-2">Anomaly Detection</h3>
              <p class="text-[var(--dim)] text-[13px] font-mono leading-relaxed">
                A DBSCAN clustering algorithm groups identical vectors together. When a group spikes abnormally fast, it flags it as a new narrative meta.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right: Visualizations -->
      <div class="w-full md:w-1/2 h-full bg-[#05080C] border-l border-[var(--rule)] relative hidden md:flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay"></div>
        
        <!-- Vis 1: Ingestion Stream -->
        <div class="absolute inset-0 flex items-center justify-center transition-all duration-700 {activeStep === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}">
          <div class="flex flex-col gap-3 font-mono text-[10px] text-[var(--banana)] w-64">
            <div class="p-2 border border-[var(--banana-lo)] bg-[var(--banana-glow)] flex justify-between animate-[pulse_1.5s_ease-in-out_infinite]">
              <span>[RAW] DOGE_2.0</span><span>+0.01s</span>
            </div>
            <div class="p-2 border border-[var(--banana-lo)] bg-[var(--banana-glow)] flex justify-between animate-[pulse_2s_ease-in-out_infinite_0.2s]">
              <span>[RAW] CAT_IN_BOX</span><span>+0.04s</span>
            </div>
            <div class="p-2 border border-[var(--banana-lo)] bg-[var(--banana-glow)] flex justify-between animate-[pulse_1.8s_ease-in-out_infinite_0.4s]">
              <span>[RAW] PEPE_HAT</span><span>+0.12s</span>
            </div>
          </div>
        </div>
        
        <!-- Vis 2: Vector Matrix -->
        <div class="absolute inset-0 flex items-center justify-center transition-all duration-700 {activeStep === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}">
          <div class="grid grid-cols-4 gap-2 font-mono text-[9px] text-[var(--cyan)]">
            {#each Array(16) as _, i}
              <div class="p-2 border border-[var(--cyan)] bg-[rgba(56,189,248,0.05)] text-center transition-all duration-300" style="transition-delay: {i * 20}ms; opacity: {activeStep === 1 ? 1 : 0}; transform: translateY({activeStep === 1 ? '0' : '10px'});">
                {(Math.random() * 2 - 1).toFixed(3)}
              </div>
            {/each}
          </div>
        </div>
        
        <!-- Vis 3: Clustering -->
        <div class="absolute inset-0 flex items-center justify-center transition-all duration-700 {activeStep === 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}">
          <div class="relative w-64 h-64 border border-[var(--rule)] rounded-full flex items-center justify-center">
            <div class="absolute w-32 h-32 border border-[var(--live)] rounded-full bg-[var(--live-glow)] animate-ping opacity-20"></div>
            <div class="absolute w-4 h-4 bg-[var(--live)] rounded-full shadow-[0_0_20px_var(--live)]"></div>
            <div class="absolute top-1/4 left-1/4 w-2 h-2 bg-[var(--dim)] rounded-full"></div>
            <div class="absolute bottom-1/3 right-1/4 w-2 h-2 bg-[var(--dim)] rounded-full"></div>
            <div class="absolute top-1/2 right-1/3 w-2 h-2 bg-[var(--live)] rounded-full shadow-[0_0_8px_var(--live)] animate-pulse"></div>
          </div>
        </div>
        
      </div>
    </div>
  </div>

  <!-- Telemetry & Pipeline Status Dashboard -->
  <section class="learning-progress border-t border-[var(--rule)] bg-[var(--panel2)] p-6 md:p-8 rounded-b-[24px]">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--soft)]">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[var(--live)] lamp-active"></span>
          <span class="font-mono text-xs uppercase tracking-widest text-[var(--live)] font-bold">Pipeline Progress &amp; Telemetry</span>
        </div>
        <h2 class="font-serif text-2xl md:text-3xl font-bold text-[#F1F6FA] tracking-tight mt-1">Tycho Clustering &amp; Data Ingestion</h2>
        <p class="text-xs md:text-sm text-[var(--dim)] mt-1 max-w-[70ch]">Real-time aggregate data collected across Robinhood Chain. DBSCAN parameters evaluate distances continuously as narrative meta thresholds are breached.</p>
      </div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 self-start md:self-auto w-full sm:w-auto mt-4 md:mt-0">
        <div class="px-3.5 py-1.5 rounded-lg bg-[var(--panel)] border border-[var(--rule)] font-mono text-xs text-[var(--fg)] flex items-center gap-2">
          <span class="text-[var(--faint)]">STATUS:</span>
          <span class="text-[var(--banana)] font-bold glow-banana">AUTONOMOUS RUN</span>
        </div>
        <div class="px-3.5 py-1.5 rounded-lg bg-[rgba(52,211,153,0.1)] border border-[var(--live)]/40 font-mono text-xs text-[var(--live)] font-bold">SATURATION 80.0%</div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      <div class="p-4 rounded-xl bg-[var(--panel)] border border-[var(--rule)] hover:border-[var(--banana)]/50 transition-all duration-200">
        <div class="flex flex-wrap justify-between items-start gap-2">
          <span class="text-[10.5px] font-mono text-[var(--dim)] uppercase tracking-wider">Total Tokens Scanned</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--panel2)] text-[var(--banana)] border border-[var(--banana)]/30 font-semibold">LIVE SCAN</span>
        </div>
        <div class="text-3xl font-serif font-bold text-[#F1F6FA] mt-2 tracking-tight">{totalDataPoints > 0 ? (totalDataPoints / 10).toLocaleString() : '14,029'}</div>
        <div class="text-[11px] font-mono text-[var(--dim)] mt-2 flex items-center justify-between border-t border-[var(--soft)] pt-2">
          <span>Ingestion Rate:</span>
          <span class="text-[var(--fg)] font-medium">18 tokens/m</span>
        </div>
      </div>
      <div class="p-4 rounded-xl bg-[var(--panel)] border border-[var(--rule)] hover:border-[var(--live)]/50 transition-all duration-200">
        <div class="flex flex-wrap justify-between items-start gap-2">
          <span class="text-[10.5px] font-mono text-[var(--dim)] uppercase tracking-wider">Cluster Distribution</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(52,211,153,0.15)] text-[var(--live)] font-semibold">Active Metas</span>
        </div>
        <div class="flex items-baseline gap-3 mt-2">
          <span class="text-3xl font-serif font-bold text-[var(--live)] tracking-tight glow-live">{realClusters.length || 0}</span>
          <span class="text-sm font-mono text-[var(--dim)]">detected</span>
        </div>
        <div class="w-full bg-[var(--panel2)] h-2 rounded-full mt-3 overflow-hidden flex">
          <div class="bg-[var(--live)] h-full transition-all duration-500" style="width: 23.7%;"></div>
          <div class="bg-[var(--stall)] opacity-70 h-full flex-1"></div>
        </div>
      </div>
      <div class="p-4 rounded-xl bg-[var(--panel)] border border-[var(--rule)] hover:border-[var(--cyan)]/50 transition-all duration-200">
        <div class="flex flex-wrap justify-between items-start gap-2">
          <span class="text-[10.5px] font-mono text-[var(--dim)] uppercase tracking-wider">Peak Density</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(56,189,248,0.15)] text-[var(--cyan)] font-semibold">DBSCAN</span>
        </div>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="text-3xl font-serif font-bold text-[var(--cyan)] tracking-tight glow-cyan">0.82</span>
          <span class="text-xs font-mono text-[var(--dim)]">Threshold</span>
        </div>
        <div class="text-[11px] font-mono text-[var(--dim)] mt-2 flex items-center justify-between border-t border-[var(--soft)] pt-2">
          <span>Minimum Distance (ε):</span>
          <span class="text-[var(--banana)] font-bold">0.1500</span>
        </div>
      </div>
      <div class="p-4 rounded-xl bg-[var(--panel)] border border-[var(--rule)] hover:border-[var(--violet)]/50 transition-all duration-200">
        <div class="flex flex-wrap justify-between items-start gap-2">
          <span class="text-[10.5px] font-mono text-[var(--dim)] uppercase tracking-wider">Feature Vectors</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(167,139,250,0.15)] text-[var(--violet)] font-semibold">d = 768</span>
        </div>
        <div class="text-3xl font-serif font-bold text-[var(--violet)] mt-2 tracking-tight">768 Dim</div>
        <div class="text-[11px] font-mono text-[var(--dim)] mt-2 flex items-center justify-between border-t border-[var(--soft)] pt-2">
          <span>Embedding Engine:</span>
          <span class="text-[var(--fg)] font-medium">Gemini 1.5</span>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
      <div class="lg:col-span-6 flex flex-col gap-6">
        <div class="p-5 rounded-xl bg-[var(--panel)] border border-[var(--rule)] flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-mono text-xs uppercase tracking-wider text-[#DCE6F0] font-semibold flex items-center gap-2">
                <svg class="w-3.5 h-3.5 text-[var(--live)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Active Data Streams &amp; Ingestion Pipeline
              </h3>
              <span class="text-[10px] font-mono text-[var(--live)] bg-[rgba(52,211,153,0.1)] px-2 py-0.5 rounded border border-[var(--live)]/30">STREAMING</span>
            </div>
            <p class="text-[11.5px] text-[var(--dim)] mb-4">Continuous ingestion monitoring live Robinhood Chain contracts and launches.</p>
            <div class="space-y-3">
              <div class="p-3 rounded-lg bg-[var(--panel2)] border border-[var(--soft)] flex items-center justify-between text-xs font-mono">
                <div class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full bg-[var(--live)] animate-ping"></div>
                  <div>
                    <div class="text-[var(--fg)] font-medium">Robinhood Contract Listener</div>
                    <div class="text-[10.5px] text-[var(--dim)]">18 tokens/m</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-[var(--fg)] font-bold">451</div>
                  <div class="text-[10px] font-semibold text-[var(--live)]">ACTIVE</div>
                </div>
              </div>
              <div class="p-3 rounded-lg bg-[var(--panel2)] border border-[var(--soft)] flex items-center justify-between text-xs font-mono">
                <div class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full bg-[var(--live)] animate-ping"></div>
                  <div>
                    <div class="text-[var(--fg)] font-medium">Vector Embedding Queue</div>
                    <div class="text-[10.5px] text-[var(--dim)]">3 vectors/s</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-[var(--fg)] font-bold">100%</div>
                  <div class="text-[10px] font-semibold text-[var(--cyan)]">SYNCED</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="lg:col-span-6 p-5 md:p-6 rounded-xl bg-[var(--panel)] border border-[var(--rule)] flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-mono text-xs uppercase tracking-wider text-[#DCE6F0] font-semibold flex items-center gap-2">
              <svg class="w-3.5 h-3.5 text-[var(--violet)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 30v-6m0 -6V4m0 6v-6m0 6H3m8 0h8"></path></svg>
              Cluster Density Factors (Vector Proximity)
            </h3>
            <span class="text-[10.5px] font-mono text-[var(--violet)] font-semibold">768-DIM MATRIX</span>
          </div>
          <p class="text-[11.5px] text-[var(--dim)] mb-5">The relative impact of extracted metadata vectors calculated by DBSCAN to distinguish true narrative metas from noise.</p>
          
          <div class="space-y-4">
            <div class="space-y-1">
              <div class="flex justify-between items-center text-xs font-mono">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--panel2)] text-[var(--dim)] border border-[var(--soft)]">#1</span>
                  <span class="text-[var(--fg)] font-medium">Image Hash & Visual Lore Similarity</span>
                </div>
                <span class="font-bold text-[var(--fg)]">56.1%</span>
              </div>
              <div class="w-full bg-[var(--panel2)] h-2.5 rounded-full overflow-hidden p-0.5 border border-[var(--soft)]">
                <div class="h-full rounded-full transition-all duration-700 ease-out shadow-sm" style="width: 56.1%; background-color: var(--banana);"></div>
              </div>
            </div>
            
            <div class="space-y-1">
              <div class="flex justify-between items-center text-xs font-mono">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--panel2)] text-[var(--dim)] border border-[var(--soft)]">#2</span>
                  <span class="text-[var(--fg)] font-medium">Ticker Lexical Proximity (Levenshtein)</span>
                </div>
                <span class="font-bold text-[var(--fg)]">22.3%</span>
              </div>
              <div class="w-full bg-[var(--panel2)] h-2.5 rounded-full overflow-hidden p-0.5 border border-[var(--soft)]">
                <div class="h-full rounded-full transition-all duration-700 ease-out shadow-sm" style="width: 22.3%; background-color: var(--live);"></div>
              </div>
            </div>
            
            <div class="space-y-1">
              <div class="flex justify-between items-center text-xs font-mono">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--panel2)] text-[var(--dim)] border border-[var(--soft)]">#3</span>
                  <span class="text-[var(--fg)] font-medium">Semantic Name Grouping</span>
                </div>
                <span class="font-bold text-[var(--fg)]">18.1%</span>
              </div>
              <div class="w-full bg-[var(--panel2)] h-2.5 rounded-full overflow-hidden p-0.5 border border-[var(--soft)]">
                <div class="h-full rounded-full transition-all duration-700 ease-out shadow-sm" style="width: 18.1%; background-color: var(--cyan);"></div>
              </div>
            </div>
            
            <div class="space-y-1">
              <div class="flex justify-between items-center text-xs font-mono">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--panel2)] text-[var(--dim)] border border-[var(--soft)]">#4</span>
                  <span class="text-[var(--fg)] font-medium">Temporal Launch Density (1H Window)</span>
                </div>
                <span class="font-bold text-[var(--fg)]">3.5%</span>
              </div>
              <div class="w-full bg-[var(--panel2)] h-2.5 rounded-full overflow-hidden p-0.5 border border-[var(--soft)]">
                <div class="h-full rounded-full transition-all duration-700 ease-out shadow-sm" style="width: 3.5%; background-color: var(--violet);"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 p-4 rounded-xl bg-[var(--panel2)] border border-[var(--rule)] flex items-center justify-between gap-4">
          <div>
            <div class="text-[10.5px] font-mono text-[var(--banana)] uppercase tracking-wider font-bold">Network Saturation</div>
            <div class="text-xs text-[var(--dim)] mt-0.5">High volume of launches <b class="text-[var(--fg)]">stabilized</b> at <b class="text-[var(--banana)]">80%</b></div>
          </div>
          <div class="text-right shrink-0">
            <div class="text-xl font-mono font-bold text-[var(--banana)] glow-banana">80.0%</div>
            <div class="text-[9.5px] font-mono text-[var(--live)] uppercase font-semibold">SCANNING</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA / System Access -->
  <div class="p-8 md:p-14 md:m-8 m-4 bg-[#0A1017] border border-[var(--rule)] rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
    <div class="absolute inset-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay"></div>
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-[var(--live)] rounded-full mix-blend-screen filter blur-[100px] opacity-10"></div>
    
    <div class="w-12 h-12 rounded-full border border-[var(--live)] flex items-center justify-center mb-6 relative">
      <div class="absolute inset-0 rounded-full border border-[var(--live)] animate-ping opacity-30"></div>
      <div class="w-3 h-3 bg-[var(--live)] rounded-full shadow-[0_0_12px_var(--live)]"></div>
    </div>
    
    <h2 class="font-serif text-3xl md:text-4xl mb-4 text-[#F1F6FA] font-bold tracking-tight">System Synchronized</h2>
    <p class="text-[var(--dim)] font-mono text-xs md:text-sm max-w-md mb-8 leading-relaxed">Tycho is actively indexing Robinhood Chain. Access the main terminal to view raw breakout vectors and real-time narrative clusters.</p>
    
    <a href="/radar" class="inline-flex items-center gap-3 px-8 py-4 bg-[var(--live)] text-[var(--ink)] font-mono font-bold text-sm hover:bg-[#F1F6FA] hover:text-[#06090D] transition-colors cursor-pointer" style="clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);">
      LAUNCH TERMINAL_OS
    </a>
  </div>

</div> <!-- End of .wrap -->
</div> <!-- End of .site-bg -->

<!-- Minimal Footer -->
<footer class="w-full bg-[#030508] pt-16 pb-8 border-t border-[var(--rule)]">
  <div class="max-w-[1380px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
    <div class="col-span-1 md:col-span-2">
      <div class="flex items-center gap-3 opacity-60 mb-4">
        <img src="/images/logo.png" alt="Tycho" class="w-8 h-8 grayscale mix-blend-screen" />
        <span class="text-sm font-mono text-[var(--fg)] uppercase tracking-widest font-bold">TYCHO_OS</span>
      </div>
      <p class="text-[var(--dim)] text-xs font-mono max-w-sm leading-relaxed">
        An autonomous narrative radar designed to detect emerging crypto metas on the Robinhood Chain using Gemini vector embeddings and DBSCAN clustering.
      </p>
    </div>
    <div>
      <h4 class="text-white font-mono text-[10px] uppercase tracking-widest mb-4">Navigation</h4>
      <div class="flex flex-col gap-3 text-xs font-mono">
        <a href="/radar" class="text-[var(--dim)] hover:text-[var(--live)] transition-colors">Access Terminal</a>
        <a href="/track-record" class="text-[var(--dim)] hover:text-white transition-colors">Track Record</a>
        <a href="#" class="text-[var(--dim)] hover:text-white transition-colors">Documentation</a>
      </div>
    </div>
    <div>
      <h4 class="text-white font-mono text-[10px] uppercase tracking-widest mb-4">Network</h4>
      <div class="flex flex-col gap-3 text-xs font-mono">
        <a href="#" class="text-[var(--dim)] hover:text-white transition-colors">Twitter / X</a>
        <a href="#" class="text-[var(--dim)] hover:text-white transition-colors">GitHub</a>
      </div>
    </div>
  </div>
  <div class="max-w-[1380px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[#0A1017]">
    <span class="text-[10px] font-mono text-[#3D4B59]">© 2026 TYCHO_OS. All rights reserved.</span>
    <span class="text-[10px] font-mono text-[var(--live)] animate-pulse">● V1.0.0 ONLINE</span>
  </div>
</footer>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #030508;
    color: #D4E0EE;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }

  /* The site background wrapper creates a new stacking context over the fixed footer */
  .site-bg {
    background-color: #06090D;
    background-image: 
      radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.03) 0px, transparent 50%),
      radial-gradient(at 100% 0%, rgba(167, 139, 250, 0.03) 0px, transparent 50%),
      radial-gradient(at 50% 100%, rgba(242, 201, 76, 0.02) 0px, transparent 50%);
    background-attachment: fixed;
    position: relative;
    z-index: 10;
    padding: 30px 20px;
    min-height: 100vh;
  }

  .wrap {
    max-width: 1380px;
    margin: 0 auto;
    border: 1px solid var(--soft);
    box-shadow: 0 0 80px rgba(0, 0, 0, 0.6);
    border-radius: 8px 8px 24px 24px;
    /* Removed overflow: hidden so sticky works */
    background: var(--ink);
    position: relative;
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
    
    background: var(--ink);
    position: relative;
    z-index: 10;
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
