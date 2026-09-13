<script lang="ts">
	import { onMount } from 'svelte';
	import { createQuery } from '@tanstack/svelte-query';
	// @ts-ignore
	let { data } = $props();

	let brainLogs: string[] = $state([]);
	let terminalContainer: HTMLElement;

	const clusterQuery = createQuery(() => ({
		queryKey: ['clusters-brain'],
		queryFn: async () => {
			const res = await fetch('/api/clusters');
			return res.json();
		},
		refetchInterval: 10000
	}));

	$effect(() => {
		const log = clusterQuery.data?.latestCronLog;
		if (log) {
			const d = new Date(log.timestamp);
			const timeStr = d.toLocaleTimeString('en-US', { hour12: false });
			
			brainLogs = [
				`[SYS] CRON SCAN EXECUTED AT ${timeStr}`,
				`[INGEST] Retrieved ${log.ingested} raw contracts from Robinhood RPC/Gecko`,
				`[EMBED] Processed ${log.embedded} tokens via gemini-embedding-2 (3072-D)`,
				`[CLUSTER] Assigned tokens to vector space. ${log.clustered} processed.`,
				`[AI] Discovered ${log.newClusters} new emerging sub-clusters.`,
				`[SYS] Standby for next cycle...`
			];
		} else {
			brainLogs = [
				"[SYS] Awaiting first cron execution..."
			];
		}
	});
</script>

<svelte:head>
	<title>Brain | Tycho Radar</title>
</svelte:head>

<div class="max-w-[1380px] mx-auto min-h-[calc(100vh-80px)] p-4 md:p-6 flex flex-col">
	<div class="mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-end border-b border-[var(--rule)] pb-4 gap-6">
		<div>
			<h1 class="font-[var(--font-mono)] text-[24px] uppercase tracking-widest text-[var(--fg)] m-0 flex items-center gap-3">
				Tycho_Brain
				<span class="w-[8px] h-[8px] bg-[var(--live)] rounded-full animate-pulse shadow-[0_0_10px_var(--live)]"></span>
			</h1>
			<p class="text-[12px] text-[var(--text-tertiary)] font-[var(--font-mono)] mt-2 max-w-[600px] leading-relaxed">
				Ingest, labeling, and hourly spatial retraining. The machinery is active. Readiness is a boolean, computed from evidence, with no override branch.
			</p>
		</div>
		
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full h-[600px] max-h-[75vh]">
		<!-- Left: Brain Internal Logs -->
		<div class="flex flex-col bg-[#030508] border border-[var(--rule)] h-full overflow-hidden relative">
			<div class="absolute top-0 left-0 w-full h-[1px] bg-[var(--live)] opacity-20"></div>
			<div class="bg-[#0A0D14] border-b border-[var(--rule)] px-4 py-2 flex justify-between items-center z-10">
				<span class="text-[10px] font-[var(--font-mono)] text-[var(--text-secondary)] tracking-widest uppercase">INTERNAL_STATE.LOG</span>
				<span class="flex items-center gap-2">
					<span class="text-[9px] font-[var(--font-mono)] bg-[#60a5fa]/10 text-[#60a5fa] border border-[#60a5fa]/30 px-1.5 py-0.5 rounded">LIVE SYSTEM</span>
					<span class="text-[9px] font-[var(--font-mono)] text-[var(--live)] animate-pulse">STREAMING</span>
				</span>
			</div>
			<div 
				bind:this={terminalContainer}
				class="flex-1 p-4 font-[var(--font-mono)] text-[12px] text-[var(--text-secondary)] overflow-y-auto scrollbar-hide space-y-2 leading-relaxed"
			>
				{#each brainLogs as log}
					<div class="opacity-80 hover:opacity-100 transition-opacity">
						{#if log.includes('[SYS]')}
							<span class="text-[#60a5fa]">{log}</span>
						{:else if log.includes('[AI]')}
							<span class="text-[#4ade80]">{log}</span>
						{:else}
							<span class="text-[var(--text-tertiary)]">{log}</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<!-- Right: Live Data Ingestion -->
		<div class="flex flex-col bg-[#030508] border border-[var(--rule)] h-full overflow-hidden relative">
			<div class="absolute top-0 left-0 w-full h-[1px] bg-[var(--live)] opacity-20"></div>
			<div class="bg-[#0A0D14] border-b border-[var(--rule)] px-4 py-2 flex justify-between items-center z-10">
				<span class="text-[10px] font-[var(--font-mono)] text-[var(--text-secondary)] tracking-widest uppercase">PONSFAMILY_INGESTION_STREAM</span>
				<span class="text-[9px] font-[var(--font-mono)] text-[var(--text-tertiary)]">{(data?.recentTokens || []).length} NODES</span>
			</div>
			<div class="flex-1 p-0 overflow-y-auto scrollbar-hide">
				<ul class="list-none m-0 p-0 flex flex-col">
					{#each (data?.recentTokens || []) as t, i}
						<li class="flex items-center gap-4 px-4 py-3 border-b border-[var(--divider)] hover:bg-[#0A0D14] transition-colors cursor-default group">
							<span class="text-[10px] text-[var(--text-tertiary)] font-[var(--font-mono)] min-w-[60px]">
								{t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : 'LIVE'}
							</span>
							{#if t.imageUrl}
								<img src={t.imageUrl} alt="" class="w-[24px] h-[24px] rounded-full object-cover shrink-0 grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100" />
							{:else}
								<div class="w-[24px] h-[24px] rounded-full bg-[var(--rule)] shrink-0 flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)]">{t.ticker.replace('$', '')[0] || 'T'}</div>
							{/if}
							<div class="flex flex-col flex-1 min-w-0">
								<div class="flex items-center gap-2">
									<span class="text-[13px] text-[var(--fg)] truncate font-medium">{t.name}</span>
									<span class="text-[10px] text-[var(--live)] font-[var(--font-mono)] px-1.5 py-0.5 bg-[var(--live)]/10 rounded">{t.ticker}</span>
								</div>
								<span class="text-[10px] text-[var(--text-tertiary)] font-[var(--font-mono)] truncate opacity-50">{t.mint}</span>
							</div>
							<div class="text-[10px] font-[var(--font-mono)] px-2 py-1 bg-[#1A1A1A] rounded text-[var(--text-secondary)] border border-[var(--rule)]">
								{t.status === 'clustered' ? 'MAPPED' : 'EMBEDDING'}
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
	
	<!-- Radar Architecture Breakdown -->
	<div class="mt-12 border border-[var(--rule)] bg-[#05070B] p-6 lg:p-10 relative overflow-hidden">
		<!-- Subtle background grid -->
		<div class="absolute inset-0 pointer-events-none opacity-50" style="background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px); background-size: 24px 24px;"></div>
		
		<div class="relative z-10 font-[var(--font-mono)]">
			<div class="flex items-center gap-4 mb-8">
				<div class="h-[1px] w-6 bg-[var(--live)]"></div>
				<h2 class="text-white text-[14px] font-bold uppercase tracking-widest">System Architecture</h2>
				<div class="h-[1px] flex-1 bg-gradient-to-r from-[var(--rule)] to-transparent"></div>
			</div>
			
			<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 xl:gap-8">
				<!-- Step 1 -->
				<div class="flex flex-col gap-3">
					<div class="text-[var(--live)] text-[9px] tracking-widest border border-[var(--live)]/30 inline-block px-2 py-1 rounded bg-[var(--live)]/5 w-fit">PHASE 01</div>
					<h4 class="text-white font-bold text-[12px] uppercase">Block Ingestion</h4>
					<p class="text-[11px] text-[var(--text-secondary)] leading-[1.8]">Tycho continuously monitors the Robinhood Chain, extracting smart contract deployments, metadata, and token tickers before they are ever indexed by social layers.</p>
				</div>
				<!-- Step 2 -->
				<div class="flex flex-col gap-3">
					<div class="text-[var(--live)] text-[9px] tracking-widest border border-[var(--live)]/30 inline-block px-2 py-1 rounded bg-[var(--live)]/5 w-fit">PHASE 02</div>
					<h4 class="text-white font-bold text-[12px] uppercase">Semantic Embedding</h4>
					<p class="text-[11px] text-[var(--text-secondary)] leading-[1.8]">Raw string metadata is fed into state-of-the-art LLMs, converting human-readable context into 3072-dimensional vectors suitable for mathematical spatial analysis.</p>
				</div>
				<!-- Step 3 -->
				<div class="flex flex-col gap-3">
					<div class="text-[var(--live)] text-[9px] tracking-widest border border-[var(--live)]/30 inline-block px-2 py-1 rounded bg-[var(--live)]/5 w-fit">PHASE 03</div>
					<h4 class="text-white font-bold text-[12px] uppercase">DBSCAN Clustering</h4>
					<p class="text-[11px] text-[var(--text-secondary)] leading-[1.8]">Vectors are plotted in hyper-space. We calculate cosine distance to find gravitational anomalies—dozens of tokens deploying with nearly identical semantic signatures.</p>
				</div>
				<!-- Step 4 -->
				<div class="flex flex-col gap-3">
					<div class="text-[var(--live)] text-[9px] tracking-widest border border-[var(--live)]/30 inline-block px-2 py-1 rounded bg-[var(--live)]/5 w-fit">PHASE 04</div>
					<h4 class="text-white font-bold text-[12px] uppercase">Narrative Synthesis</h4>
					<p class="text-[11px] text-[var(--text-secondary)] leading-[1.8]">When a cluster breaches the critical density threshold, an agent evaluates the centroid's semantics and autonomously synthesizes a human-readable narrative label.</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Lore Footer -->
	<div class="mt-8 pt-6 border-t border-[var(--divider)] flex flex-col md:flex-row justify-between items-center gap-4">
		<div class="flex items-center gap-3">
			<span class="w-[6px] h-[6px] bg-[#f87171] rounded-full animate-pulse shadow-[0_0_10px_#f87171]"></span>
			<p class="text-[11px] font-[var(--font-mono)] text-[var(--text-tertiary)] m-0">
				VALIDATION GATES: <span class="text-[#f87171]">LOCKED</span>. AWAITING 24-HOUR CONTINUOUS SPATIAL CALIBRATION.
			</p>
		</div>
		<div class="text-[11px] font-[var(--font-mono)] text-[var(--text-tertiary)] flex gap-6">
			<a href="/api/dataset.csv" target="_blank" class="text-[var(--fg)] hover:text-[var(--fg)] cursor-crosshair transition-colors underline underline-offset-4">PUBLIC_DATASET.CSV</a>
			<!-- <span class="hover:text-[var(--fg)] cursor-crosshair transition-colors">LAUNCH_SPEC.PDF</span>
			<span class="hover:text-[var(--fg)] cursor-crosshair transition-colors">WALLET: 0 SOL</span> -->
		</div>
	</div>
</div>

<style>
	/* Hide scrollbar for cleaner terminal look */
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
