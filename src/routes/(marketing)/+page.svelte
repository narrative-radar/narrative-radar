<script>
  import { onMount } from 'svelte';
  import { createQuery } from '@tanstack/svelte-query';
  import { fade } from 'svelte/transition';
  
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
      src: `from tycho.nlp import TFIDF_Vectorizer\n\ndef process_metadata(token):\n    # Extract semantic features from token lore\n    vector = TFIDF_Vectorizer.embed(\n        name=token.name,\n        ticker=token.ticker,\n        social_graph=token.twitter_url\n    )\n    return vector`
    },
    {
      stage: 'clustering',
      src: `from sklearn.cluster import DBSCAN\n\n# Group tokens autonomously via spatial density\nclusters = DBSCAN(eps=0.15, min_samples=3).fit(vectors)\n\nfor c_id in set(clusters.labels_):\n    if c_id == -1: continue\n    log(f"New meta detected: Cluster {c_id}")\n    radar.signal(cluster_id=c_id)`
    },
    {
      stage: 'validation',
      src: `def validate_narrative(cluster):\n    # Ensure meta has sustained growth\n    velocity = cluster.calculate_growth_rate()\n    if velocity > 0.05 and cluster.size >= 5:\n        cluster.status = 'breakout'\n        database.commit(cluster)\n        notify_terminal(cluster)`
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
  
  const dashboardQuery = createQuery(() => ({
    queryKey: ['marketing_dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/clusters?t=' + Date.now());
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    },
    refetchInterval: 15000 // real time
  }));

  let liveClusters = $derived(dashboardQuery.data?.clusters || []);
  let liveTokensTracked = $derived(dashboardQuery.data?.tokensTrackedToday || 0);
  let liveRecentTokens = $derived(dashboardQuery.data?.recentTokens || []);

  
  let howWorksRef = $state();
  let activeStep = $state(0);

  $effect(() => {
    if (howWorksRef && scrollY !== undefined && innerHeight !== undefined) {
      const rect = howWorksRef.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - innerHeight)));
      activeStep = Math.min(2, Math.floor(progress * 3));
    }
  });

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
        charIdx += 1;
      } else {
        setTimeout(() => {
          blockIdx = (blockIdx + 1) % BLOCKS.length;
          charIdx = 0;
        }, 2000);
      }
    }, 25);

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
        TYCHO<span class="hidden md:block text-[var(--live)]">_NARRATIVE RADAR</span>
      </a>
      
      <!-- TABS -->
      <nav class="hidden md:flex items-center gap-8 font-mono text-[11px] uppercase tracking-widest mt-1">
        <a href="/" class="relative pb-2 transition-colors text-white font-bold">
          Overview
          
          <!-- Active Wave -->
          <div class="absolute -bottom-[1px] left-0 w-full flex items-end justify-between gap-[1px] h-[3px]">
            <div class="flex-1 bg-[var(--live)] animate-[wave_1s_ease-in-out_infinite_alternate] h-[40%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.2s_ease-in-out_infinite_alternate_0.2s] h-[100%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_0.8s_ease-in-out_infinite_alternate_0.4s] h-[60%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.4s_ease-in-out_infinite_alternate_0.6s] h-[80%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1s_ease-in-out_infinite_alternate_0.3s] h-[50%]"></div>
            <div class="flex-1 bg-[var(--live)] animate-[wave_1.1s_ease-in-out_infinite_alternate_0.1s] h-[90%]"></div>
          </div>

        </a>
        <a href="/radar" class="relative pb-2 transition-colors text-[var(--dim)] hover:text-white">
          Radar
        </a>
        <a href="/track-record" class="relative pb-2 transition-colors text-[var(--dim)] hover:text-white">
          Track Record
        </a>
      </nav>
    </div>

    <div class="text-[8px] md:text-[11px] font-mono text-[var(--faint)] uppercase tracking-widest px-4 py-1.5 bg-[#090D13] border-l-2 border-[var(--live)]" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);">
      system status: <span class="text-[var(--live)] font-bold animate-pulse">autonomous</span>
    </div>
  </header>

  <!-- Hero Grid -->
  <div class="hero-stacked flex flex-col items-center text-center border-b border-[var(--rule)] max-w-[1380px] mx-auto pt-16 md:pt-24 bg-[var(--ink)]">
    
    <!-- Top Center Scene -->
    <div class="px-6 md:px-14 flex flex-col items-center w-full max-w-4xl">
      <div class="mb-6">
        <span class="inline-flex items-center gap-2 px-3 py-1 bg-[var(--banana-glow)] border border-[var(--banana-lo)] text-[var(--banana-hi)] font-mono text-[10px] uppercase tracking-widest" style="clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%);">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--banana)] animate-pulse shadow-[0_0_8px_var(--banana)]"></span>
          Live Robinhood Radar
        </span>
      </div>
      
      <h1 class="wordmark text-5xl md:text-[80px] mb-6 min-h-[120px] md:min-h-[100px] leading-[1.1]" use:scrambleText={"See the meta before it's the meta."}>
        See the meta before it's the meta.
      </h1>
      
      <p class="text-[var(--dim)] text-lg md:text-xl max-w-2xl leading-relaxed mb-10 font-mono">
        A completely autonomous pipeline that turns raw blockchain noise into readable narrative signals. Grouped by AI, not by hand.
      </p>

      <div class="flex flex-wrap justify-center gap-4 md:gap-12 mb-12">
        <div class="flex flex-col items-center">
          <div class="text-[10px] text-[var(--dim)] font-mono uppercase tracking-widest mb-1">Processing Delay</div>
          <div class="text-white font-mono text-sm border-b border-[var(--rule)] pb-1">~1.2 seconds</div>
        </div>
        <div class="flex flex-col items-center">
          <div class="text-[10px] text-[var(--dim)] font-mono uppercase tracking-widest mb-1">Embedding Matrix</div>
          <div class="text-white font-mono text-sm border-b border-[var(--rule)] pb-1">768 Dimensions</div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-6 mb-16">
        <a href="/radar" class="glass-panel px-8 py-4 font-mono text-sm text-white hover:text-[var(--live)] hover:border-[var(--live)] transition-colors cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(52,211,153,0.15)]" style="clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);">
          Launch Dashboard →
        </a>
      </div>
    </div>

    <!-- Stacked Windows Scrollytelling -->
    <div class="w-full max-w-5xl mx-auto relative h-[150vh]">
      
      <!-- Window 1: Code Stream (Sticky) -->
      <div class="sticky top-[15vh] pt-10">
        <div class="w-full bg-[var(--panel)] min-h-[300px] rounded-xl border border-[var(--rule)] shadow-2xl overflow-hidden relative transition-transform duration-500">
          <!-- Top Bar -->
          <div class="flex items-center gap-3 px-4 py-2.5 bg-[var(--panel2)] border-b border-[var(--rule)] text-xs">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
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
              <div class="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]"></div>
              <div class="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]"></div>
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
  </div>

  <!-- Stats Strip (Real Data) -->
  <div class="grid grid-cols-2 md:grid-cols-4 border-b border-[var(--rule)] bg-[var(--panel2)]">
    <div class="p-8 border-r border-[var(--rule)]">
      <div class="text-[var(--dim)] text-[11px] uppercase tracking-widest font-mono mb-2">Live Narratives</div>
      <div class="text-4xl font-bold text-white glow-cyan">{liveClusters.length > 0 ? liveClusters.length : 24}</div>
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
        <div class="absolute inset-0  opacity-10 mix-blend-overlay"></div>
        
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
  <section class="border-t border-[var(--rule)] bg-[var(--ink)] p-6 md:p-12 relative overflow-hidden">
    <!-- Subtle Grid Background -->
    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGVsbGlwc2UgY3g9IjIwIiBjeT0iMjAiIHJ4PSIwLjUiIHJ5PSIwLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNykiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] opacity-50 pointer-events-none"></div>
    
    <div class="max-w-6xl mx-auto relative z-10">
      <div class="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 border-b border-[var(--rule)] pb-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-[var(--live)]/10 border border-[var(--live)]/30 rounded text-[var(--live)] font-mono text-[10px] tracking-widest uppercase mb-4">
            <span class="w-2 h-2 rounded-full bg-[var(--live)] animate-pulse"></span>
            System Telemetry
          </div>
          <h2 class="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">Real-Time Aggregation</h2>
          <p class="text-[var(--dim)] font-mono text-sm mt-3 max-w-xl">Live diagnostic feed from the DBSCAN clustering engine on the Robinhood chain.</p>
        </div>
        
        <div class="mt-6 md:mt-0 flex gap-4 text-right">
          <div>
            <div class="text-[10px] font-mono text-[var(--dim)] uppercase tracking-widest mb-1">Status</div>
            <div class="text-[var(--banana)] font-mono font-bold glow-banana">AUTONOMOUS</div>
          </div>
          <div class="w-[1px] bg-[var(--rule)] h-8 self-center mx-2"></div>
          <div>
            <div class="text-[10px] font-mono text-[var(--dim)] uppercase tracking-widest mb-1">Saturation</div>
            <div class="text-white font-mono font-bold">80.0%</div>
          </div>
        </div>
      </div>
      
      <!-- Radar-themed Server Racks -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Rack 1: Ingestion -->
        <div class="bg-[var(--panel)] border border-[var(--rule)] rounded-xl overflow-hidden flex flex-col hover:border-[var(--banana)]/50 transition-colors">
          <div class="p-3 bg-[var(--panel2)] border-b border-[var(--rule)] flex justify-between items-center">
            <span class="text-[10px] font-mono text-[var(--dim)] uppercase tracking-widest">Stage 1: Ingestion</span>
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--banana)] shadow-[0_0_8px_var(--banana)]"></span>
          </div>
          <div class="p-6 flex-1 flex flex-col justify-center">
            <div class="text-4xl font-serif text-white mb-1">{liveTokensTracked > 0 ? liveTokensTracked.toLocaleString() : '14,029'}</div>
            <div class="text-xs font-mono text-[var(--dim)]">Total Tokens Scanned Today</div>
            
            <div class="mt-6 pt-4 border-t border-[var(--rule)] flex justify-between items-center text-xs font-mono">
              <span class="text-[var(--dim)]">Velocity:</span>
              <span class="text-white">~18 tokens/min</span>
            </div>
          </div>
        </div>

        <!-- Rack 2: Embedding -->
        <div class="bg-[var(--panel)] border border-[var(--rule)] rounded-xl overflow-hidden flex flex-col hover:border-[var(--violet)]/50 transition-colors">
          <div class="p-3 bg-[var(--panel2)] border-b border-[var(--rule)] flex justify-between items-center">
            <span class="text-[10px] font-mono text-[var(--dim)] uppercase tracking-widest">Stage 2: Embedding</span>
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--violet)] shadow-[0_0_8px_var(--violet)]"></span>
          </div>
          <div class="p-6 flex-1 flex flex-col justify-center">
            <div class="text-4xl font-serif text-white mb-1">768-Dim</div>
            <div class="text-xs font-mono text-[var(--dim)]">Gemini Feature Matrix</div>
            
            <div class="mt-6 pt-4 border-t border-[var(--rule)] flex justify-between items-center text-xs font-mono">
              <span class="text-[var(--dim)]">Queue Sync:</span>
              <span class="text-[var(--violet)] glow-violet">100% SUCCESS</span>
            </div>
          </div>
        </div>

        <!-- Rack 3: Clustering -->
        <div class="bg-[var(--panel)] border border-[var(--rule)] rounded-xl overflow-hidden flex flex-col hover:border-[var(--live)]/50 transition-colors">
          <div class="p-3 bg-[var(--panel2)] border-b border-[var(--rule)] flex justify-between items-center">
            <span class="text-[10px] font-mono text-[var(--dim)] uppercase tracking-widest">Stage 3: Clustering</span>
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--live)] shadow-[0_0_8px_var(--live)] animate-pulse"></span>
          </div>
          <div class="p-6 flex-1 flex flex-col justify-center">
            <div class="text-4xl font-serif text-[var(--live)] glow-live mb-1">{liveClusters.length > 0 ? liveClusters.length : 24}</div>
            <div class="text-xs font-mono text-[var(--dim)]">Active Narrative Metas</div>
            
            <div class="mt-6 pt-4 border-t border-[var(--rule)] flex justify-between items-center text-xs font-mono">
              <span class="text-[var(--dim)]">DBSCAN ε (Epsilon):</span>
              <span class="text-white">0.75</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </section>

  <!-- CTA / System Access -->
  <div class="p-8 md:p-14 md:m-8 m-4 bg-[#0A1017] border border-[var(--rule)] rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
    <div class="absolute inset-0  opacity-10 mix-blend-overlay"></div>
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
        An autonomous narrative radar designed to detect emerging crypto metas on the Robinhood Chain using semantic vector embeddings and DBSCAN clustering.
      </p>
    </div>
    <div>
      <h4 class="text-white font-mono text-[10px] uppercase tracking-widest mb-4">Navigation</h4>
      <div class="flex flex-col gap-3 text-xs font-mono">
        <a href="/radar" class="text-[var(--dim)] hover:text-[var(--live)] transition-colors">Access Terminal</a>
        <a href="/track-record" class="text-[var(--dim)] hover:text-white transition-colors">Track Record</a>
        <!-- <a href="#" class="text-[var(--dim)] hover:text-white transition-colors">Documentation</a> -->
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

  :global(.k) { color: var(--cyan); font-weight: bold; }
  :global(.s) { color: var(--banana); }
  :global(.n) { color: #E2E8F0; }
  :global(.c) { color: #64748B; font-style: italic; }

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
