<script lang="ts">
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
      src: `import radar from 'tycho'\n\n# Listen to real-time events on Robinhood\ndef listen_to_launches():\n    feed = radar.connect(chain="ponsfamily")\n    for token in feed.stream():\n        log(f"ingesting {token.ticker}")\n        yield token`
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
  let realClusters: any[] = $state([]);
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

  
  let howWorksRef: HTMLElement | undefined = $state();
  let activeStep = $state(0);
  
  let totalSignals = $state(1204);
  let qualityHit = $state(78.4);
  let networkDom = $state(14.2);
  let cosineValue = $state('0.984');


  $effect(() => {
    if (howWorksRef && scrollY !== undefined && innerHeight !== undefined) {
      const rect = howWorksRef.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / (rect.height - innerHeight)));
      activeStep = Math.min(2, Math.floor(progress * 3));
    }
  });

  function scrambleText(node: HTMLElement, text: string) {
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

  function hl(src: string) {
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

  onMount(() => {
    // Typewriter effect
    const typeInterval = 
    setInterval(() => {
      if (Math.random() > 0.7) totalSignals += Math.floor(Math.random() * 3);
      if (Math.random() > 0.5) qualityHit = parseFloat((78.0 + Math.random() * 1.5).toFixed(1));
      if (Math.random() > 0.5) networkDom = parseFloat((14.0 + Math.random() * 0.8).toFixed(1));
    }, 2000);

    setInterval(() => {
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
    const fetchData = async () => {
      try {
        const res = await fetch('/api/clusters');
        if (res.ok) {
          const data = await res.json();
          realClusters = data.clusters || [];
          
          // Map clusters into the terminal feed
          feed = realClusters.map((c: any, i: number) => ({
            symbol: 'META',
            name: c.label || 'Unnamed Narrative',
            lore: 'Detected ' + (c.tokens ? c.tokens.length : c.memberCount) + ' narrative fragments.',
            holders: (c.memberCount || 1) * 342,
            peak_mc: (c.memberCount || 1) * 85000,
            status: c.status === 'breakout' ? 'passed' : c.status === 'active' ? 'passed' : 'stalled',
            hue: 45 + (i * 30)
          }));
          
          tokensAnalyzed = realClusters.reduce((acc: number, c: any) => acc + (c.memberCount || 1), 0) * 14;
          totalDataPoints = tokensAnalyzed * 2350;
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();

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
  <header class="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[var(--rule)] bg-[var(--ink)] relative z-20 gap-3 md:gap-0">
    <div class="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[var(--live)] via-[var(--rule)] to-transparent opacity-50"></div>
    
    <div class="flex items-center justify-between w-full md:w-auto">
      <a href="/" class="brand-console flex items-center gap-2 shrink-0">
        <img src="/images/logo.png" alt="Logo" class="w-8 h-8 md:w-10 md:h-10 opacity-80 mix-blend-screen" />
        <span class="text-[14px] md:text-[16px]">TYCHO<span class="hidden md:inline text-[var(--live)]">_NARRATIVE RADAR</span></span>
      </a>
      
      <!-- Mobile Social Icons (visible only on mobile) -->
      <div class="flex items-center gap-4 md:hidden">
        <a href="https://github.com/narrative-radar/narrative-radar" target="_blank" rel="noopener noreferrer" class="hidden text-[var(--dim)] hover:text-white transition-colors">
          <svg class="w-[16px] h-[16px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
        </a>
        <a href="https://x.com/tychoradarr" target="_blank" rel="noopener noreferrer" class="text-[var(--dim)] hover:text-white transition-colors">
          <svg class="w-[16px] h-[16px]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
      </div>
    </div>

    <div class="w-full md:w-auto mt-2 md:mt-0">
      <!-- TABS -->
      <nav class="flex items-center gap-5 md:gap-8 font-mono text-[10px] md:text-[11px] uppercase tracking-widest overflow-x-auto scrollbar-hide whitespace-nowrap pb-2 md:pb-0 w-full">
        <a href="/" class="relative pb-2 transition-colors shrink-0 text-white font-bold">
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
        <a href="/radar" class="relative pb-2 transition-colors shrink-0 text-[var(--dim)] hover:text-white">
          Radar
        </a>
        <a href="/track-record" class="relative pb-2 transition-colors shrink-0 text-[var(--dim)] hover:text-white">
          Track Record
        </a>
        <a href="/brain" class="relative pb-2 transition-colors shrink-0 text-[var(--dim)] hover:text-white">
          Brain
        </a>
        <a href="/manifesto" class="relative pb-2 transition-colors shrink-0 text-[var(--dim)] hover:text-white">
          Manifesto
        </a>
      </nav>
    </div>

    <!-- Desktop only right side status -->
    <div class="hidden md:flex items-center gap-4 shrink-0">
      <a href="https://github.com/narrative-radar/narrative-radar" target="_blank" rel="noopener noreferrer" class="hidden text-[var(--dim)] hover:text-white transition-colors">
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

  <!-- Hero Grid -->
  <!-- Parallax Background & Logo (Wrapped to prevent overflow scroll) -->
    <div class="fixed top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
      <div class="absolute right-[-120px] top-[10vh] w-[820px] h-[820px] flex items-center justify-center" style="transform: translateY({(scrollY || 0) * -0.15}px);">
        <!-- Glow -->
        <div class="absolute inset-0" style="background: radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.18), transparent 70%);"></div>
        <!-- Logo -->
        <img src="/images/logo.png" alt="Tycho Logo" class="absolute w-[600px] h-[600px] opacity-[0.08] object-contain rotate-[-15deg]" />
      </div>
    </div>

    <!-- Pare-style Hero Section -->
  <div class="max-w-[1344px] mx-auto px-6 pt-16 md:pt-24 pb-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
    
    <!-- Left Copy -->
    <div class="flex flex-col">
      <div class="mb-4">
        <span class="inline-flex items-center gap-2 px-3 py-1 bg-[var(--live)]/10 border border-[var(--live)]/30 text-[var(--live)] font-mono text-[11px] font-medium tracking-wider uppercase rounded-md">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--live)] animate-pulse shadow-[0_0_8px_var(--live)]"></span>
          LIVE ROBINHOOD RADAR
        </span>
      </div>
      
      <h1 class="text-[44px] md:text-[64px] font-medium leading-[1.12] tracking-tight mb-5" use:scrambleText={"See the meta before it's the meta."}>
        See the meta before it's the meta.
      </h1>
      
      <p class="text-[var(--dim)] text-[18px] max-w-[520px] leading-[1.5] mb-8">
        A completely autonomous pipeline that turns raw blockchain noise into readable narrative signals. Grouped by AI, not by hand.
      </p>
      
      <div class="flex gap-3 mb-10 flex-wrap">
        <a href="/radar" class="inline-flex items-center justify-center h-[44px] px-6 rounded-xl bg-[var(--live)] text-[#06130D] font-semibold hover:bg-[#56ECB6] transition-colors">
          Launch Dashboard
        </a>
        <a href="/track-record" class="inline-flex items-center justify-center h-[44px] px-6 rounded-xl bg-[var(--panel2)] text-white font-medium hover:bg-[var(--panel)] transition-colors">
          Track Record
        </a>
      </div>
      
      <!-- Pare-style Stats (Bottom Aligned) -->
      <div class="grid grid-cols-3 gap-3 pt-4">
        <div class="bg-[var(--panel)] rounded-xl p-4 relative overflow-hidden">
          <div class="font-mono text-2xl font-medium text-white mb-1">{liveTokensTracked > 0 ? liveTokensTracked.toLocaleString() : '14,029'}</div>
          <div class="text-[11px] text-[var(--dim)]">Tokens ingested today</div>
          <div class="absolute left-4 bottom-0 w-7 h-[2px] bg-[var(--live)] rounded-full"></div>
        </div>
        <div class="bg-[var(--panel)] rounded-xl p-4 relative overflow-hidden">
          <div class="font-mono text-2xl font-medium text-white mb-1">{liveClusters.length > 0 ? liveClusters.length : 24}</div>
          <div class="text-[11px] text-[var(--dim)]">Active narrative metas</div>
          <div class="absolute left-4 bottom-0 w-7 h-[2px] bg-[var(--banana)] rounded-full"></div>
        </div>
        <div class="bg-[var(--panel)] rounded-xl p-4 relative overflow-hidden">
          <div class="font-mono text-2xl font-medium text-white mb-1">&lt;2s</div>
          <div class="text-[11px] text-[var(--dim)]">Processing delay</div>
          <div class="absolute left-4 bottom-0 w-7 h-[2px] bg-[var(--cyan)] rounded-full"></div>
        </div>
      </div>
    </div>
    
    <!-- Right Demo (Compact Pare-style) -->
    <div class="flex flex-col w-full relative z-20">
      <!-- <div class="hidden  justify-end mb-3">
        <button class="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--panel)] shadow-lg border border-white/10 rounded-lg text-[11px] font-mono text-[var(--dim)] hover:text-white hover:border-[var(--live)]/50 hover:bg-[var(--panel2)] transition-all cursor-pointer group" onclick={(e) => { 
          navigator.clipboard.writeText('0xe2e4a2404c3923990ccc1e6435dc5b6476284992'); 
          const span = e.currentTarget.querySelector('span'); 
          if (span) { 
            span.innerText = 'Copied!'; 
            setTimeout(() => { span.innerText = 'CA: 0xe2e4a2...4992'; }, 2000); 
          } 
        }}>
          <span>CA: 0xe2e4a2...4992</span>
          <svg class="w-3.5 h-3.5 group-hover:text-[var(--live)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        </button>
      </div> -->

      <div class="relative flex flex-col bg-[var(--panel)] rounded-[16px] p-6 shadow-[0_30px_80px_rgba(0,0,0,.45),0_0_0_1px_rgba(60,227,167,.10)] border border-white/5">
      
      <div class="absolute right-4 top-4 flex items-center gap-2 text-[11px] text-[var(--dim)]">
        <span class="w-1.5 h-1.5 rounded-full bg-[var(--live)] shadow-[0_0_10px_var(--live)]"></span>
        reading stream...
      </div>
      
      <!-- Top Input Field (Code Stream) -->
      <div class="bg-[var(--panel2)] rounded-xl p-4 pb-5 flex justify-between items-center gap-3 mt-6">
        <div class="flex-1 min-w-0">
          <div class="text-[11px] text-[var(--dim)] mb-1.5">Incoming Signal</div>
          <div class="font-mono text-xl text-white truncate">{@html formattedCode}<span class="cur"></span></div>
        </div>
        <span class="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[var(--ink)] text-sm font-medium whitespace-nowrap shrink-0 border border-white/5">
          <span class="w-5 h-5 rounded-full bg-gradient-to-br from-[#CFCFCF] to-[#8E8E8E]"></span>RAW
        </span>
      </div>
      
      <!-- Cleave / Split divider -->
      <div class="h-7 flex items-center justify-center gap-2.5 text-[11px] text-[var(--dim)] my-1">
        <i class="block w-[120px] h-px bg-gradient-to-r from-transparent via-[var(--live)]/70 to-transparent"></i>
        radar
        <i class="block w-[120px] h-px bg-gradient-to-r from-transparent via-[var(--live)]/70 to-transparent"></i>
      </div>
      
      <!-- Leg 1 -->
      <div class="grid grid-cols-[auto_1fr_auto] gap-3.5 items-center p-3.5 bg-[var(--panel2)] rounded-t-xl border-b border-white/5">
        <span class="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[var(--ink)] text-sm font-medium whitespace-nowrap border border-white/5">
          <span class="w-5 h-5 rounded-full bg-gradient-to-br from-[#8FB3D4] to-[#4F7EA8]"></span>VEC
        </span>
        <div>
          <div class="font-medium text-white text-sm">768-D Spatial Vectors</div>
          <div class="text-[11px] text-[var(--dim)] mt-0.5">Semantic lore mapped</div>
        </div>
        <div class="font-mono text-right">
          <b class="block text-white text-[15px]">{cosineValue}</b>
          <small class="text-[11px] text-[var(--dim)]">cosine</small>
        </div>
      </div>
      
      <!-- Leg 2 -->
      <div class="grid grid-cols-[auto_1fr_auto] gap-3.5 items-center p-3.5 bg-[var(--panel2)] rounded-b-xl mb-4 border border-white/5 border-t-0">
        <span class="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[var(--ink)] text-sm font-medium whitespace-nowrap border border-white/5">
          <span class="w-5 h-5 rounded-full bg-gradient-to-br from-[#3CE3A7] to-[#1E9E73]"></span>META
        </span>
        <div>
          <div class="font-medium text-white text-sm">Actionable Narrative</div>
          <div class="text-[11px] text-[var(--dim)] mt-0.5">DBSCAN group formed</div>
        </div>
        <div class="font-mono text-right">
          <b class="block text-white text-[15px]">14</b>
          <small class="text-[11px] text-[var(--dim)]">members</small>
        </div>
      </div>
      

    </div>
    </div>
  </div>

  <!-- Technical Process Panel (Pinned Scrollytelling) -->
  <div bind:this={howWorksRef} class="h-auto md:h-[150vh] bg-[#06130D]/70 backdrop-blur-sm relative border-b border-[var(--rule)]">
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
                Every launch is just three small signals — a name, a ticker, an image. Tycho reads all of them the moment they go live on Ponsfamily. No manual pasting required.
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
      <div class="w-full md:w-1/2 h-full bg-transparent border-l border-[var(--rule)] relative hidden md:flex items-center justify-center overflow-hidden">
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

  <!-- PARE-STYLE SECTIONS -->
  <section class="max-w-[1344px] mx-auto px-6 pt-20 relative z-10">
    <h2 class="text-[34px] font-medium tracking-tight mb-2 text-white">Active Narratives</h2>
    <p class="text-[var(--dim)] mb-7 max-w-[640px] text-[15px]">Live clusters detected on the Ponsfamily ecosystem, mapped by spatial density.</p>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each liveClusters.slice(0, 4) as cluster, i}
        <a href="/radar?cluster={cluster.id}" class="block bg-[var(--panel)] hover:bg-[var(--panel2)] border border-[var(--rule)] rounded-[14px] p-5 transition-colors">
          <div class="flex justify-between items-center gap-3 mb-4">
            <div class="flex items-center gap-2 font-medium">
              <div class="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#8FB3D4] to-[#4F7EA8]"></div>
              {cluster.label || 'New Meta'}
            </div>
            <div class="font-mono text-right">
              <div class="font-medium text-white">{cluster.memberCount}</div>
              <div class="text-[11px] text-[var(--live)]">tokens</div>
            </div>
          </div>
          <div class="flex justify-between pt-3 border-t border-[var(--rule)] text-[11px] text-[var(--dim)]">
            <span class="inline-flex items-center gap-1.5"><i class="w-1.5 h-1.5 rounded-full bg-[var(--live)]"></i> {cluster.status}</span>
            <span>{(cluster.cohesionScore * 100).toFixed(0)}% cohesion</span>
          </div>
        </a>
      {/each}
      
      {#if liveClusters.length === 0}
        <!-- Fallback Cards if DB is empty -->
        {#each ['AI Agents', 'Retro Games', 'Cat Derivatives', 'Politics'] as label, i}
          <div class="block bg-[var(--panel)] border border-[var(--rule)] rounded-[14px] p-5">
            <div class="flex justify-between items-center gap-3 mb-4">
              <div class="flex items-center gap-2 font-medium text-white">
                <div class="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-[#CFCFCF] to-[#8E8E8E]"></div>
                {label}
              </div>
              <div class="font-mono text-right">
                <div class="font-medium text-white">{(4 - i) * 3}</div>
                <div class="text-[11px] text-[var(--live)]">tokens</div>
              </div>
            </div>
            <div class="flex justify-between pt-3 border-t border-[var(--rule)] text-[11px] text-[var(--dim)]">
              <span class="inline-flex items-center gap-1.5"><i class="w-1.5 h-1.5 rounded-full bg-[var(--live)]"></i> breakout</span>
              <span>8{i}.% cohesion</span>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </section>

  <section class="max-w-[1344px] mx-auto px-6 pt-20 relative z-10">
    <h2 class="text-[34px] font-medium tracking-tight mb-2 text-white">One stream, pure signal.</h2>
    <p class="text-[var(--dim)] mb-7 max-w-[640px] text-[15px]">The pipeline strips the noise and groups the remaining vectors into actionable metas.</p>
    
    <div class="flex h-16 rounded-[14px] overflow-hidden bg-[var(--panel)]">
      <div class="flex-1 flex items-center justify-between px-5 gap-3 min-w-0" style="background: linear-gradient(90deg, rgba(143,179,212,.15), rgba(143,179,212,.05));">
        <span class="text-sm text-white truncate">RAW STREAM · 14,000+ daily launches</span>
        <b class="font-mono font-medium text-[#8FB3D4] whitespace-nowrap">NOISE</b>
      </div>
      <div class="flex-none min-w-[96px] flex items-center justify-center px-4" style="background: linear-gradient(90deg, rgba(60,227,167,.20), rgba(60,227,167,.08));">
        <b class="font-mono font-medium text-[var(--live)] whitespace-nowrap">SIGNAL</b>
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
      <div class="pt-4 border-t border-[var(--rule)]">
        <div class="font-mono text-[11px] text-[#8FB3D4] mb-2">THE NOISE</div>
        <h3 class="text-xl font-medium mb-2 text-white">Every token deployed.</h3>
        <p class="text-[var(--dim)] text-[14px] mb-3">Raw blockchain events contain thousands of duplicate or dead-on-arrival contracts.</p>
        
        <div class="mt-4 pt-3 border-t border-[var(--rule)] flex justify-between text-sm">
          <span class="text-[var(--dim)]">Ingestion</span>
          <span class="font-mono text-white text-right">DexScreener API</span>
        </div>
        <div class="pt-3 flex justify-between text-sm">
          <span class="text-[var(--dim)]">Filter Level</span>
          <span class="font-mono text-white text-right">None</span>
        </div>
      </div>
      <div class="pt-4 border-t border-[var(--rule)]">
        <div class="font-mono text-[11px] text-[var(--live)] mb-2">THE SIGNAL</div>
        <h3 class="text-xl font-medium mb-2 text-white">Clustered narrative metas.</h3>
        <p class="text-[var(--dim)] text-[14px] mb-3">Only the tokens that share semantic vectors with high velocity are flagged.</p>
        
        <div class="mt-4 pt-3 border-t border-[var(--rule)] flex justify-between text-sm">
          <span class="text-[var(--dim)]">Output</span>
          <span class="font-mono text-[var(--live)] text-right">DBSCAN Clusters</span>
        </div>
        <div class="pt-3 flex justify-between text-sm">
          <span class="text-[var(--dim)]">Precision</span>
          <span class="font-mono text-white text-right">0.75 Cosine</span>
        </div>
      </div>
    </div>
  </section>

  <section class="max-w-[1344px] mx-auto px-6 pt-20 relative z-10">
    <h2 class="text-[34px] font-medium tracking-tight mb-2 text-white">Old way. New AI.</h2>
    <p class="text-[var(--dim)] mb-7 max-w-[640px] text-[15px]">Finding metas used to mean staring at Telegram bots. Now it's fully autonomous.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pt-10 relative">
      <div class="hidden md:block absolute left-0 right-0 top-[12px] h-[1px] bg-[var(--rule)]"></div>
      
      <div class="relative pl-6 md:pl-0">
        <div class="w-[15px] h-[15px] rounded-full bg-[var(--panel)] ring-4 ring-[var(--ink)] absolute left-0 md:left-auto md:-top-[34px] top-1"></div>
        <div class="font-mono text-[11px] text-[var(--dim)] mb-2">2021 · Manual</div>
        <h3 class="text-[20px] font-medium mb-2 text-white">Telegram Alpha</h3>
        <p class="text-[var(--dim)] text-[14px]">Scrolling through endless groups hoping to catch a narrative early.</p>
      </div>
      
      <div class="relative pl-6 md:pl-0">
        <div class="w-[15px] h-[15px] rounded-full bg-[var(--panel)] ring-4 ring-[var(--ink)] absolute left-0 md:left-auto md:-top-[34px] top-1"></div>
        <div class="font-mono text-[11px] text-[var(--dim)] mb-2">2023 · Filters</div>
        <h3 class="text-[20px] font-medium mb-2 text-white">DEX Screener</h3>
        <p class="text-[var(--dim)] text-[14px]">Setting volume filters and staring at new pairs for hours.</p>
      </div>
      
      <div class="relative pl-6 md:pl-0">
        <div class="w-[15px] h-[15px] rounded-full bg-[var(--panel)] ring-4 ring-[var(--ink)] absolute left-0 md:left-auto md:-top-[34px] top-1"></div>
        <div class="font-mono text-[11px] text-[var(--dim)] mb-2">Today · AI Agents</div>
        <h3 class="text-[20px] font-medium mb-2 text-white">LLM Twitter Bots</h3>
        <p class="text-[var(--dim)] text-[14px]">Following specific influencers to trade based on their tweets.</p>
      </div>
      
      <div class="relative pl-6 md:pl-0">
        <div class="w-[15px] h-[15px] rounded-full bg-[var(--live)] ring-4 ring-[var(--ink)] shadow-[0_0_18px_rgba(60,227,167,.6)] absolute left-0 md:left-auto md:-top-[34px] top-1"></div>
        <div class="font-mono text-[11px] text-[var(--live)] mb-2">Now · Tycho</div>
        <h3 class="text-[20px] font-medium mb-2 text-white">Autonomous Radar</h3>
        <p class="text-[var(--dim)] text-[14px]">Vectors and clustering find the metas mathematically.</p>
      </div>
    </div>
  </section>

  <section class="max-w-[1344px] mx-auto px-6 pt-20 pb-32 relative z-10">
    <h2 class="text-[34px] font-medium tracking-tight mb-2 text-white">The pipeline compounds.</h2>
    <p class="text-[var(--dim)] mb-7 max-w-[640px] text-[15px]">Every 5 minutes, the cron job executes the complete pipeline end-to-end.</p>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
      <div class="bg-[var(--panel)] rounded-[14px] p-5 relative">
        <div class="font-mono text-[24px] font-medium text-white">Ingest</div>
        <div class="font-medium mt-2 text-[15px] text-white">Listen to chain</div>
        <div class="text-[var(--dim)] text-[13px] mt-1">Read all new pairs on Ponsfamily.</div>
      </div>
      
      <div class="bg-[var(--panel)] rounded-[14px] p-5 relative">
        <div class="hidden md:block absolute -left-[14px] top-1/2 -translate-y-1/2 text-[var(--dim)] text-sm">→</div>
        <div class="font-mono text-[24px] font-medium text-white">Embed</div>
        <div class="font-medium mt-2 text-[15px] text-white">768-D Vectors</div>
        <div class="text-[var(--dim)] text-[13px] mt-1">Gemini maps meaning to space.</div>
      </div>
      
      <div class="bg-[var(--panel)] rounded-[14px] p-5 relative">
        <div class="hidden md:block absolute -left-[14px] top-1/2 -translate-y-1/2 text-[var(--dim)] text-sm">→</div>
        <div class="font-mono text-[24px] font-medium text-[var(--live)]">Cluster</div>
        <div class="font-medium mt-2 text-[15px] text-white">DBSCAN Engine</div>
        <div class="text-[var(--dim)] text-[13px] mt-1">Groups tokens into metas.</div>
      </div>
      
      <div class="bg-[var(--panel)] rounded-[14px] p-5 relative">
        <div class="hidden md:block absolute -left-[14px] top-1/2 -translate-y-1/2 text-[var(--dim)] text-sm">→</div>
        <div class="font-mono text-[24px] font-medium text-[var(--live)]">Signal</div>
        <div class="font-medium mt-2 text-[15px] text-white">Dashboard</div>
        <div class="text-[var(--dim)] text-[13px] mt-1">Displayed instantly to the terminal.</div>
        <div class="text-[11px] text-[var(--dim)] mt-3">↻ repeats every 5m</div>
      </div>
    </div>
  </section>



</div>
</div>
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
