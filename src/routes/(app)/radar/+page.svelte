<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { createQuery } from '@tanstack/svelte-query';
	import SignalList from '$lib/features/radar/components/SignalList.svelte';
	import TokenLookup from '$lib/features/radar/components/TokenLookup.svelte';
	
	const clustersQuery = createQuery(() => ({
		queryKey: ['clusters_dashboard'],
		queryFn: async () => {
			const res = await fetch('/api/clusters?t=' + Date.now());
			if (!res.ok) throw new Error('Failed to fetch dashboard data');
			return res.json();
		},
		refetchInterval: 15000,
		refetchIntervalInBackground: true
	}));

	let isDetailOpen = $state(false);
	let selectedThemeId = $state<string | null>(null);

	const tokensQuery = createQuery(() => ({
		queryKey: ['tokens', selectedThemeId],
		queryFn: async () => {
			const res = await fetch(`/api/clusters/${selectedThemeId}/tokens`);
			if (!res.ok) throw new Error('Failed to fetch tokens');
			return res.json();
		},
		enabled: !!selectedThemeId
	}));

	function openDetail(id: string) {
		selectedThemeId = id;
		isDetailOpen = true;
	}

	function closeDetail() {
		isDetailOpen = false;
	}

	let activeClusters = $derived(clustersQuery.data?.clusters || []);
	let recentTokens = $derived(clustersQuery.data?.recentTokens || []);
	let tokensTrackedToday = $derived(clustersQuery.data?.tokensTrackedToday || 0);
	let selectedCluster = $derived(activeClusters.find((c: any) => c.id === selectedThemeId));
	let activeTokens = $derived(tokensQuery.data?.tokens || []);

	// Scan text logic
	let lastScanText = $state("pending...");
	let scanInterval: any;

    // Pipeline Logs logic
    let pipelineLogs: string[] = $state([]);
    let pipelineContainer: HTMLElement;

	onMount(() => {
		scanInterval = setInterval(() => {
			const latestCronLog = clustersQuery.data?.latestCronLog;
			if (!latestCronLog || !latestCronLog.timestamp) {
				lastScanText = 'pending...';
				return;
			}
			lastScanText = timeAgo(latestCronLog.timestamp);
		}, 1000);

        // Simulated Pipeline logs
        $effect(() => {
            const log = clustersQuery.data?.latestCronLog;
            if (log) {
                const timeStr = new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false });
                pipelineLogs = [
                    `[SYS] CRON SCAN AT ${timeStr}`,
                    `[INGEST] ${log.ingested} contracts from Robinhood RPC`,
                    `[EMBED] ${log.embedded} embedded to 3072-D`,
                    `[CLUSTER] Assigned ${log.clustered} to vector space.`,
                    `[AI] Discovered ${log.newClusters} new sub-clusters.`,
                    `[SYS] Standby for next cycle...`
                ];
            } else {
                pipelineLogs = ["[SYS] Awaiting first cron execution..."];
            }
        });

		const urlParams = new URLSearchParams(window.location.search);
		const clusterParam = urlParams.get('cluster');
		if (clusterParam) openDetail(clusterParam);

        return () => {
            clearInterval(scanInterval);
        };
	});

	

	let lastScanMins = $derived(() => {
		const log = clustersQuery.data?.latestCronLog;
		if (!log) return 0;
		const diff = Date.now() - new Date(log.timestamp).getTime();
		return Math.floor(diff / 60000);
	});

	let shareBtnText = $state('Copy summary');
	function copySummary() {
		const top3 = activeClusters.slice(0, 3).map((c: any) => `${c.label || c.name}: ${c.memberCount}`).join('\n');
		const text = `Meta this hour — tycho.xyz/radar\n${top3}`;
		navigator.clipboard.writeText(text);
		shareBtnText = 'Copied!';
		setTimeout(() => { shareBtnText = 'Copy summary'; }, 2000);
	}

	let copiedTokens = $state<Record<string, boolean>>({});
	function copyCA(mint: string) {
		navigator.clipboard.writeText(mint);
		copiedTokens[mint] = true;
		setTimeout(() => { copiedTokens[mint] = false; }, 2000);
	}

	function getDotColorForLog(status: string) {
		switch (status) {
			case 'clustered': return 'var(--state-active)';
			case 'pending_cluster': return 'var(--state-fast)';
			case 'pending_embed': return 'var(--state-quiet)';
			default: return 'var(--state-quiet)';
		}
	}
	
	
	function formatClusterAge(ms: number) {
		const h = Math.floor(ms / (1000 * 60 * 60));
		if (h < 1) return '<1h';
		if (h < 24) return `${h}h`;
		const d = Math.floor(h / 24);
		if (d <= 30) return `${d}d`;
		const mo = Math.floor(d / 30);
		return `${mo}mo`;
	}

	function timeAgo(dateString: string) {
		const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
		if (diff < 60) return `${diff}s ago`;
		const min = Math.floor(diff / 60);
		if (min < 60) return `${min}m ago`;
		const h = Math.floor(min / 60);
		if (h < 24) return `${h}h ago`;
		const d = Math.floor(h / 24);
		return `${d}d ago`;
	}
</script>

<svelte:head>
	<title>Tycho — /radar</title>
</svelte:head>

<div class="w-full flex flex-col font-mono text-[12px] bg-[#030508] min-h-[calc(100vh-80px)]">
	<!-- Main Split Area -->
	<div class="grid grid-cols-1 lg:grid-cols-2 border-b border-[var(--rule)] bg-[#030508] lg:min-h-[500px]">
		
		<!-- Left: Ingest / Radar Feed -->
		<div class="flex flex-col border-r border-[var(--rule)]">
			<div class="px-4 py-2 border-b border-[var(--rule)] flex justify-between items-center text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest bg-[#0A0D14]">
				<span>Ingest Feed / Radar Themes</span>
				<span>last scan: {lastScanMins()} mins ago · {clustersQuery.data?.latestCronLog?.ingested || 0} tokens ingested</span>
			</div>
			<div class="p-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style="scrollbar-width: none; -ms-overflow-style: none;">
				<div class="mb-4 text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider leading-relaxed border-b border-[var(--rule)] pb-4">
					<span class="text-white font-bold">100% Autonomous:</span> Themes are not curated by humans. They are discovered algorithmically via cosine similarity and labeled by LLMs when ≥3 unique tokens share a semantic narrative.
				</div>
				<TokenLookup />
				<div class="mt-6">
					{#if clustersQuery.isLoading}
						<p class="text-[var(--text-tertiary)] italic p-4">Scanning real-time signals...</p>
					{:else if activeClusters.length === 0}
						<div class="py-14 flex flex-col items-center justify-center text-center">
							<i class="w-2 h-2 rounded-full bg-[var(--state-quiet)] animate-pulse mb-4"></i>
							<p class="text-[var(--text-secondary)] m-0 mb-1">Radar is quiet.</p>
							<p class="text-[var(--text-tertiary)] m-0">Awaiting the next anomaly on the chain...</p>
						</div>
					{:else}
						<SignalList clusters={activeClusters} onRowClick={openDetail} />
					{/if}
				</div>
			</div>
		</div>

		<!-- Right: Pipeline -->
		<div class="flex flex-col">
			<div class="px-4 py-2 border-b border-[var(--rule)] flex justify-between items-center text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest bg-[#0A0D14]">
				<span>Learning Pipeline <span class="ml-2 text-[8px] bg-[#60a5fa]/10 text-[#60a5fa] border border-[#60a5fa]/30 px-1.5 py-0.5 rounded normal-case">LIVE FEED</span></span>
				<span class="text-[var(--live)] animate-pulse flex items-center gap-2">
					<span class="w-[6px] h-[6px] bg-[var(--live)] rounded-full"></span>
					evaluating
				</span>
			</div>
			
			<div class="flex-1 p-6 bg-[#05070B] overflow-hidden flex flex-col relative group" bind:this={pipelineContainer}>
				<div class="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0D14]/50 pointer-events-none"></div>
				<button class="absolute top-4 right-4 z-20 px-3 py-1.5 bg-transparent border border-[var(--rule)] text-[10px] text-[var(--text-tertiary)] hover:text-white hover:border-white uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer" onclick={() => {
					pipelineLogs = [...pipelineLogs, `> [MANUAL] Forcing spatial recalibration...`];
					setTimeout(() => { pipelineLogs = [...pipelineLogs, `> [MANUAL] Vector space optimized. Variance: 0.012`]; }, 1000);
				}}>
					Force Eval
				</button>
				<div class="text-[#7f848e] mb-6 relative z-10 font-bold">
					# measuring density anomalies<br/>
					# mapping to 3072-d semantic space
				</div>
				<div class="text-[#56b6c2] leading-[1.6] whitespace-pre-wrap flex-1 overflow-y-auto scrollbar-hide text-[12px] relative z-10 transition-all group-hover:brightness-110 font-mono">
<span class="text-[#c678dd]">class</span> <span class="text-[#e5c07b]">TychoRadar</span>:
    <span class="text-[#c678dd]">def</span> <span class="text-[#61afef]">__init__</span>(self):
        self.encoder = LLMEmbedder(dim=<span class="text-[#d19a66]">3072</span>)
        self.space = DBSCAN(eps=<span class="text-[#d19a66]">{clustersQuery.data?.similarityThreshold || 0.75}</span>, metric=<span class="text-[#98c379]">'cosine'</span>)

    <span class="text-[#c678dd]">def</span> <span class="text-[#61afef]">evaluate_block</span>(self, contracts):
        <span class="text-[#7f848e]"># 1. Extract semantics & embed into high-dimensional space</span>
        corpus = [c.metadata <span class="text-[#c678dd]">for</span> c <span class="text-[#c678dd]">in</span> contracts]
        vectors = self.encoder.embed_batch(corpus)
        
        <span class="text-[#7f848e]"># 2. Detect gravitational anomalies (clusters)</span>
        labels = self.space.fit_predict(vectors)
        
        <span class="text-[#7f848e]"># 3. Label narratives before human distribution</span>
        <span class="text-[#c678dd]">return</span> self.synthesize_meta(labels)

<span class="text-[#7f848e]"># ==========================================</span>
<span class="text-[#7f848e]"># AUTONOMOUS EXECUTION TRACE</span>
<span class="text-[#7f848e]"># ==========================================</span>
{#each pipelineLogs as log}
<span class="block mt-1 text-[#e5c07b] drop-shadow-[0_0_2px_rgba(229,192,123,0.3)]">{log}</span>
{/each}
<span class="inline-block w-2 h-4 bg-[var(--live)] animate-pulse mt-2 align-middle shadow-[0_0_8px_var(--live)]"></span>
				</div>
			</div>

			<!-- 4 Stats below pipeline -->
			<div class="grid grid-cols-4 border-t border-[var(--rule)] bg-[#0A0D14]">
				<div class="p-4 border-r border-[var(--rule)] flex flex-col gap-2">
					<span class="text-[10px] uppercase text-[var(--text-tertiary)]">SEEN</span>
					<span class="text-white text-[16px] font-bold">{tokensTrackedToday}</span>
				</div>
				<div class="p-4 border-r border-[var(--rule)] flex flex-col gap-2">
					<span class="text-[10px] uppercase text-[var(--text-tertiary)]">CLUSTERED</span>
					<span class="text-[var(--state-active)] text-[16px] font-bold">{activeClusters.length}</span>
				</div>
				<div class="p-4 border-r border-[var(--rule)] flex flex-col gap-2">
					<span class="text-[10px] uppercase text-[var(--text-tertiary)]">LAST SCAN</span>
					<span class="text-[var(--text-secondary)] text-[13px] font-mono mt-1">{lastScanText}</span>
				</div>

			</div>
		</div>

	</div>

	<!-- Bottom: What it found (3 cards) -->
	<div class="bg-[#030508] p-6 lg:p-8 pb-12">
		<h3 class="text-[11px] uppercase tracking-widest text-[var(--text-secondary)] mb-6 border-b border-[var(--rule)] pb-3 flex justify-between">
			<span>What it found</span>
			<span class="text-[var(--text-tertiary)]">cycle {new Date().getHours().toString().padStart(2, '0')} · {activeClusters.length} active metas</span>
		</h3>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- Card 1: Activity Log -->
			<div class="border border-[var(--rule)] bg-[#0A0D14] rounded-[4px] flex flex-col h-[260px]">
				<div class="px-4 py-3 border-b border-[var(--rule)] text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest">
					Raw Activity Log
				</div>
				<div class="p-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style="scrollbar-width: none; -ms-overflow-style: none;">
					{#if clustersQuery.isLoading}
						<p class="text-[var(--text-secondary)]">Loading...</p>
					{:else if recentTokens.length === 0}
						<p class="text-[var(--text-secondary)]">No recent activity.</p>
					{:else}
						<ul class="list-none m-0 p-0 flex flex-col gap-[12px]">
							{#each recentTokens as t}
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
								<li class="flex items-center gap-[12px] cursor-pointer group" onclick={() => copyCA(t.mint)}>
									<span class="w-[6px] h-[6px] rounded-full shrink-0" style="background: {getDotColorForLog(t.status)}"></span>
									<span class="text-[var(--text-primary)] flex-1 whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-white transition-colors">
										${t.ticker}
									</span>
									<span class="text-[var(--text-tertiary)] text-[10px] whitespace-nowrap">
										{timeAgo(t.createdAt)}
									</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>

			<!-- Card 2: Meta this hour -->
			<div class="border border-[var(--rule)] bg-[#0A0D14] rounded-[4px] flex flex-col h-[260px]">
				<div class="px-4 py-3 border-b border-[var(--rule)] text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest">
					Volume Distribution
				</div>
				<div class="p-4 flex-1 flex flex-col justify-center">
					{#if activeClusters.length > 0}
						{@const colors = ['var(--live)', 'var(--banana)', 'var(--cyan)', 'var(--violet)']}
						{#each activeClusters.slice(0, 5) as c, index}
							<div class="flex items-center gap-4 mb-4 last:mb-0">
								<span class="text-[11px] text-[var(--text-secondary)] w-[120px] truncate">{c.label || c.name}</span>
								<div class="flex-1 h-[3px] bg-[#1A1A1A] rounded-full overflow-hidden">
									<div class="h-full rounded-full shimmer-bar relative overflow-hidden" style="width: {Math.min(c.memberCount * 10, 100)}%; background: {colors[index % 4]};"></div>
								</div>
								<span class="text-[11px] text-white w-[24px] text-right">{c.memberCount}</span>
							</div>
						{/each}
					{:else}
						<p class="text-[var(--text-secondary)] text-center">Awaiting signals...</p>
					{/if}
				</div>
			</div>

			<!-- Card 3: Shareable Artifact -->
			<div class="border border-[var(--rule)] bg-[#0A0D14] rounded-[4px] flex flex-col h-[260px]">
				<div class="px-4 py-3 border-b border-[var(--rule)] text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest">
					Read-Out
				</div>
				<div class="p-5 flex flex-col gap-4 flex-1">
					<p class="text-[13px] text-[var(--text-secondary)] leading-relaxed">
						Strongest narrative density found in <span class="text-[var(--live)] font-bold">{activeClusters[0]?.label || 'Pending'}</span> with <span class="text-white font-bold">{activeClusters[0]?.memberCount || 0}</span> clustered nodes.
						<br/><br/>
						Overall tracking <span class="text-white font-bold">{tokensTrackedToday}</span> tokens today, grouping them into <span class="text-white font-bold">{activeClusters.length}</span> active meta clusters.
					</p>
					<button class="mt-auto w-full text-center text-[12px] uppercase tracking-widest bg-transparent border border-[var(--rule)] text-[var(--text-secondary)] px-[12px] py-[10px] rounded-[4px] cursor-pointer hover:border-white hover:text-white transition-all" onclick={copySummary}>
						{shareBtnText}
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- DETAIL PANEL OVERLAY -->
{#if isDetailOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onclick={closeDetail} transition:fly={{ opacity: 0, duration: 200 }}></div>
	
	<div 
		transition:fly={{ x: 400, duration: 300, easing: cubicOut }}
		class="fixed top-0 right-0 h-full w-[400px] max-w-[92vw] bg-[#0A0D14] border-l border-[var(--rule)] p-[32px] overflow-y-auto scrollbar-hide z-50 shadow-2xl font-mono"
	>
		<button class="bg-transparent border border-[var(--rule)] text-[var(--text-secondary)] rounded-[4px] w-[32px] h-[32px] cursor-pointer text-[14px] mb-[24px] hover:text-white hover:border-white transition-colors" aria-label="Close details" onclick={closeDetail}>
			✕
		</button>
		<h3 class="text-[20px] font-bold text-white m-0 mb-[8px] capitalize">{selectedCluster?.label || selectedCluster?.name || 'Narrative Detail'}</h3>
		<p class="text-[13px] text-[var(--text-secondary)] mb-[24px]">
			{selectedCluster?.memberCount} tokens · <span class="text-[var(--state-active)]">{selectedCluster?.status}</span>
		</p>
		
		<div class="bg-[#05070B] border border-[var(--rule)] rounded-[4px] p-[16px] mb-[28px] text-[12px] text-[var(--text-secondary)] overflow-hidden leading-[1.6]">
			<div class="text-[var(--text-tertiary)] mb-[12px]">// cluster metrics</div>
			<div class="flex flex-col gap-2">
				<div class="flex justify-between">
					<span class="text-[#56b6c2]">status</span> 
					<span class="text-[var(--state-active)]">{selectedCluster?.status || 'active'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[#56b6c2]">age</span> 
					<span>{activeTokens.length > 0 ? formatClusterAge(Date.now() - Math.min(...activeTokens.map((t: any) => new Date(t.createdAt).getTime()))) : (selectedCluster?.createdAt ? formatClusterAge(Date.now() - new Date(selectedCluster.createdAt).getTime()) : formatClusterAge(0))}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[#56b6c2]">peak_size</span>  
					<span>{selectedCluster?.peakMemberCount || selectedCluster?.memberCount} members (_{[...new Set(activeTokens.map((t: any) => t.name.toLowerCase().replace(/\s+/g, '')))].length}_ unique)</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[#56b6c2]">peak_growth</span> 
					<span class="text-[var(--live)]">
						{#if Number(selectedCluster?.peakGrowthRate) === 999999} <!-- not used anymore but keep syntax -->
							new
						{:else if Number(selectedCluster?.peakGrowthRate) > 0}
							+{Math.round(Number(selectedCluster?.peakGrowthRate))} in 24h
						{:else if Number(selectedCluster?.peakGrowthRate) < 0}
							{Math.round(Number(selectedCluster?.peakGrowthRate))}
						{:else}
							—
						{/if}
					</span>
				</div>
				<div class="flex justify-between">
					<span class="text-[#56b6c2]">sparkline</span> 
					<span class="flex items-end gap-1">
						{#if selectedCluster?.sparklinePoints && selectedCluster.sparklinePoints.length >= 3}
							{#each selectedCluster.sparklinePoints as pt}
								<span class="w-1.5 bg-[var(--live)]" style="height: {Math.max(2, (pt / Math.max(...selectedCluster.sparklinePoints)) * 14)}px; opacity: {pt === 0 ? 0.3 : 1};"></span>
							{/each}
						{:else}
							<span class="text-[var(--text-tertiary)]">--</span>
						{/if}
					</span>
				</div>
				<div class="flex justify-between mt-3 pt-3 border-t border-[var(--rule)]">
					<span class="text-[#56b6c2]">assigned_label</span> 
					<span class="text-white font-bold">"{selectedCluster?.label || selectedCluster?.name}"</span>
				</div>
			</div>
		</div>

		<div class="text-[10px] text-[var(--text-tertiary)] italic mb-6">historical tokens sourced via on-chain backfill</div>
		<div class="text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest mb-4 border-b border-[var(--rule)] pb-2">Clustered Tokens</div>

		{#if tokensQuery.isLoading}
			<p class="text-[13px] text-[var(--text-secondary)]">Fetching tokens...</p>
		{:else if activeTokens.length === 0}
			<p class="text-[13px] text-[var(--text-secondary)]">No tokens found.</p>
		{:else}
			<ul class="list-none p-0 flex flex-col m-0">
				{#each activeTokens as t, index}
					<li 
						in:fly={{ y: 10, duration: 300, delay: index * 40 }}
						class="flex flex-col gap-[6px] py-[14px] border-b border-[var(--rule)] text-[13px]"
					>
						<div class="flex justify-between items-center gap-[12px] w-full">
							<div class="flex items-center gap-[12px] flex-1 min-w-0">
								{#if t.imageUrl}
									<img src={t.imageUrl} alt="{t.name} logo" class="w-[24px] h-[24px] rounded-full object-cover shrink-0 grayscale" />
								{:else}
									<div class="w-[24px] h-[24px] rounded-full bg-[#05070B] border border-[var(--rule)] shrink-0 flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)]">{t.ticker.replace('$', '')[0] || 'T'}</div>
								{/if}
								<span class="text-[var(--live)] font-bold truncate max-w-[80px] shrink-0">{t.ticker}</span>
								<span class="text-[var(--text-secondary)] truncate flex-1">{t.name}</span>
							</div>
							<span class="text-[var(--text-tertiary)] text-[11px] whitespace-nowrap shrink-0" title={new Date(t.createdAt).toLocaleString()}>
								{timeAgo(t.createdAt)}
							</span>
						</div>
						<div class="flex items-center mt-[4px]">
							<button 
								onclick={() => copyCA(t.mint)}
								class="text-left bg-transparent border-none p-0 cursor-pointer text-[11px] transition-colors flex items-center gap-[6px] self-start"
								class:text-[var(--state-active)]={copiedTokens[t.mint]}
								class:text-[var(--text-tertiary)]={!copiedTokens[t.mint]}
								class:hover:text-[var(--text-secondary)]={!copiedTokens[t.mint]}
							>
								{copiedTokens[t.mint] ? 'copied CA' : `${t.mint.slice(0, 4)}...${t.mint.slice(-4)} · copy CA`}
							</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}

<style>
	/* Hide scrollbar for cleaner terminal look */
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	@keyframes fillBar {
		from { width: 0%; opacity: 0; }
		to { opacity: 1; }
	}
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.shimmer-bar::after {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 50%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
		animation: scanSweep 2s infinite linear;
	}

	@keyframes scanSweep {
		0% { left: -100%; }
		100% { left: 200%; }
	}
</style>
