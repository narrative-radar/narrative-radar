<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { createQuery } from '@tanstack/svelte-query';
	import SignalList from '$lib/features/radar/components/SignalList.svelte';
	import TokenLookup from '$lib/features/radar/components/TokenLookup.svelte';
	import gsap from 'gsap';
	
	
	const clustersQuery = createQuery(() => ({
		queryKey: ['clusters_dashboard'],
		queryFn: async () => {
			const res = await fetch('/api/clusters?t=' + Date.now());
			if (!res.ok) throw new Error('Failed to fetch dashboard data');
			return res.json();
		},
		refetchInterval: 15000 // 15s instead of 5s to be safe
	}));

	
	function scrambleText(element, finalString, durationMs = 1100, delayMs = 150) {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const totalFrames = Math.round((durationMs / 1000) * 60);
		let frame = 0;
		setTimeout(() => {
			const animate = () => {
				let output = "";
				const progress = frame / totalFrames;
				for (let i = 0; i < finalString.length; i++) {
					if (finalString[i] === " " || finalString[i] === ".") { output += finalString[i]; continue; }
					if (i < finalString.length * progress) { output += finalString[i]; } 
					else { output += chars[Math.floor(Math.random() * chars.length)]; }
				}
				element.textContent = output;
				if (frame < totalFrames) { frame++; requestAnimationFrame(animate); }
			};
			animate();
		}, delayMs);
	}

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

	// Countdown logic
	let scanSeconds = $state(300); // 5 minutes
	let scanInterval: any;

	onMount(() => {
		scanInterval = setInterval(() => {
			scanSeconds--;
			if (scanSeconds < 0) scanSeconds = 300;
		}, 1000);

		// Scramble title
		const titleEl = document.getElementById("dashTitle");
		if (titleEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			const text = titleEl.innerText;
			scrambleText(titleEl, text, 1100, 100);
		}
		
		// Auto-open detail panel if ?cluster= query parameter is present
		const urlParams = new URLSearchParams(window.location.search);
		const clusterParam = urlParams.get('cluster');
		if (clusterParam) {
			openDetail(clusterParam);
		}
	});

	onDestroy(() => {
		if (scanInterval) clearInterval(scanInterval);
	});

	let formattedCountdown = $derived(() => {
		const m = Math.floor(scanSeconds / 60);
		const s = scanSeconds % 60;
		return `${m}:${s < 10 ? '0' : ''}${s}`;
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



<div class="max-w-[1400px] mx-auto pt-[18px] px-[32px] 0">
	<TokenLookup />
</div>

<main class="max-w-[1400px] mx-auto px-[32px] pb-[70px] grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-[28px] items-start">
	<div>
		<h1 class="text-[22px] font-bold m-0 mb-[6px] min-h-[1.2em]" id="dashTitle">Narrative Radar</h1>
		<p class="text-[13.5px] text-[var(--text-tertiary)] m-0 mb-[28px]">Clusters update automatically. No account needed to view.</p>

		<div class="flex flex-wrap gap-[16px] text-[12px] text-[var(--text-secondary)] mb-[18px]">
			<span class="inline-flex items-center gap-[6px]"><i class="w-[7px] h-[7px] rounded-full inline-block bg-[var(--state-quiet)]"></i>quiet</span>
			<span class="inline-flex items-center gap-[6px]"><i class="w-[7px] h-[7px] rounded-full inline-block bg-[var(--state-active)]"></i>active</span>
			<span class="inline-flex items-center gap-[6px]"><i class="w-[7px] h-[7px] rounded-full inline-block bg-[var(--state-fast)]"></i>fast</span>
			<span class="inline-flex items-center gap-[6px]"><i class="w-[7px] h-[7px] rounded-full inline-block bg-[var(--state-breakout)]"></i>breakout</span>
		</div>

		{#if clustersQuery.isLoading}
			<p class="text-[var(--text-tertiary)] text-[13px] italic p-4">Scanning real-time signals...</p>
		{:else if activeClusters.length === 0}
			<div class="py-14 flex flex-col items-center justify-center text-center border-t border-b border-[var(--divider)]">
				<i class="w-2 h-2 rounded-full bg-[var(--state-quiet)] animate-pulse mb-4"></i>
				<p class="font-[var(--font-mono)] text-[13px] text-[var(--text-secondary)] m-0 mb-1">Radar is quiet.</p>
				<p class="text-[12px] text-[var(--text-tertiary)] m-0">Awaiting the next anomaly on the chain...</p>
			</div>
		{:else}
			<SignalList clusters={activeClusters} onRowClick={openDetail} />
		{/if}

		<p class="text-[11.5px] text-[var(--text-tertiary)] mt-[16px] mx-[6px]">click a row to see its tokens · line = member count over the last hour</p>
		{#if activeClusters.length > 8}
			<p class="text-[11.5px] text-[var(--text-tertiary)] mt-[4px] mx-[6px]">{activeClusters.length} clusters active right now — list scrolls past 8</p>
		{/if}
	</div>

	<!-- Sidebar -->
	<aside class="flex flex-col gap-[40px] pl-[10px] lg:border-l lg:border-[var(--divider)] lg:pl-[30px]">
		
		<!-- At a glance -->
		<div class="flex flex-col gap-[12px]">
			<p class="text-[10.5px] uppercase tracking-[0.1em] text-[var(--text-tertiary)] font-[var(--font-mono)] m-0">at a glance</p>
			<div class="flex items-baseline justify-between">
				<span class="font-[var(--font-mono)] text-[22px] text-[var(--text-primary)] whitespace-nowrap">{activeClusters.length}</span>
				<span class="text-[12px] text-[var(--text-secondary)] text-right">active clusters</span>
			</div>
			<div class="flex items-baseline justify-between border-t border-[var(--divider)] pt-[12px]">
				<span class="font-[var(--font-mono)] text-[22px] text-[var(--text-primary)] whitespace-nowrap">{tokensTrackedToday}</span>
				<span class="text-[12px] text-[var(--text-secondary)] text-right">tokens tracked today</span>
			</div>
			<div class="flex items-baseline justify-between border-t border-[var(--divider)] pt-[12px]">
				<span class="font-[var(--font-mono)] text-[22px] text-[var(--text-primary)] whitespace-nowrap" id="scanCountdown">{formattedCountdown()}</span>
				<span class="text-[12px] text-[var(--text-secondary)] text-right">until next scan</span>
			</div>
		</div>

		<!-- Activity log -->
		<div class="flex flex-col gap-[12px]">
			<p class="text-[10.5px] uppercase tracking-[0.1em] text-[var(--text-tertiary)] font-[var(--font-mono)] m-0">activity log</p>
			{#if clustersQuery.isLoading}
				<p class="text-[12px] text-[var(--text-secondary)]">Loading...</p>
			{:else if recentTokens.length === 0}
				<p class="text-[12px] text-[var(--text-secondary)]">No recent activity.</p>
			{:else}
				<ul class="list-none m-0 p-0 max-h-[280px] overflow-y-auto flex flex-col gap-[10px]">
					{#each recentTokens as t}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<li 
							class="flex items-center gap-[10px] text-[12.5px] cursor-pointer hover:bg-[rgba(255,255,255,0.05)] p-1 -mx-1 rounded"
							ondblclick={() => copyCA(t.mint)}
							onclick={() => copyCA(t.mint)}
							title="Click to copy CA"
						>
							<span class="w-[5px] h-[5px] rounded-full shrink-0" style="background: {getDotColorForLog(t.status)}"></span>
							<span class="text-[var(--text-primary)] flex-1 whitespace-nowrap overflow-hidden text-ellipsis font-[var(--font-mono)]">
								${t.ticker}
							</span>
							<span class="text-[var(--text-tertiary)] text-[10px] whitespace-nowrap font-[var(--font-mono)]">
								{timeAgo(t.createdAt)}
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Shareable artifact -->
		<div class="flex flex-col gap-[12px]">
			<p class="text-[10.5px] uppercase tracking-[0.1em] text-[var(--text-tertiary)] font-[var(--font-mono)] m-0">shareable artifact</p>
			
			<div class="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[8px] p-[16px]">
				<p class="text-[14px] font-medium m-0 mb-[16px] text-white">Meta this hour</p>
				{#if activeClusters.length > 0}
					<ul class="list-none p-0 m-0 mb-[16px] flex flex-col gap-[10px] text-[12.5px]">
						{#each activeClusters.slice(0, 3) as c}
							<li class="flex justify-between items-center text-[var(--text-secondary)]">
								<span class="flex items-center gap-[8px]">
									<span class="w-[6px] h-[6px] rounded-full shrink-0" style="background: var(--state-{c.status === 'breakout' ? 'breakout' : c.status === 'fast' ? 'fast' : 'active'})"></span>
									{c.label || c.name || 'Theme: Pending...'}
								</span>
								<span class="font-[var(--font-mono)] text-white">{c.memberCount}</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="text-[12px] text-[var(--text-secondary)] mb-[16px]">Awaiting signals...</p>
				{/if}
				
				<p class="text-[10px] text-[var(--text-tertiary)] font-[var(--font-mono)] border-t border-[rgba(255,255,255,0.05)] pt-[12px] m-0">
					tycho.xyz/radar · {new Date().toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
				</p>
			</div>
			
			<button class="w-full text-center mt-[4px] text-[11.5px] font-[var(--font-mono)] bg-[var(--surface)] text-[var(--text-secondary)] px-[12px] py-[10px] rounded-[6px] cursor-pointer hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-all" class:text-[var(--state-active)]={shareBtnText === 'Copied!'} onclick={copySummary}>
				{shareBtnText}
			</button>
		</div>

	</aside>
</main>

<!-- DETAIL PANEL OVERLAY -->
{#if isDetailOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-40 bg-black/20" onclick={closeDetail} transition:fly={{ opacity: 0, duration: 200 }}></div>
	
	<div 
		transition:fly={{ x: 380, duration: 300, easing: cubicOut }}
		class="fixed top-0 right-0 h-full w-[380px] max-w-[92vw] bg-[var(--surface)] border-l border-[var(--divider)] p-[26px] overflow-y-auto z-50 shadow-2xl"
	>
		<button class="bg-transparent border border-[var(--divider)] text-[var(--text-secondary)] rounded-[4px] w-[28px] h-[28px] cursor-pointer text-[13px] mb-[18px] hover:text-white" aria-label="Close details" onclick={closeDetail}>
			✕
		</button>
		<h3 class="text-[17px] m-0 mb-[4px] capitalize">{selectedCluster?.label || selectedCluster?.name || 'Theme Detail'}</h3>
		<p class="text-[12px] text-[var(--text-secondary)] font-[var(--font-mono)] mb-[18px]">
			{selectedCluster?.memberCount} tokens · {selectedCluster?.status}
		</p>
		<div class="bg-[#0A0A0A] border border-[var(--divider)] rounded-[6px] p-[12px] mb-[20px] font-[var(--font-mono)] text-[11px] text-[var(--text-secondary)] overflow-hidden leading-[1.6] break-words">
			<div class="text-[var(--text-tertiary)] mb-[6px]">// lib/server/services/labeling.service.ts</div>
			<div class="whitespace-pre-wrap">
<span class="text-[#c678dd]">const</span> <span class="text-[#e5c07b]">prompt</span> <span class="text-[#56b6c2]">=</span> <span class="text-[#98c379]">`Based on these recent crypto token launches, give me a short, catchy, 2-4 word narrative theme that connects them.
Tokens: {activeTokens ? activeTokens.map((t: any) => t.name).join(', ') : 'loading...'}`</span>;

<span class="text-[#c678dd]">const</span> <span class="text-[#e5c07b]">model</span> <span class="text-[#56b6c2]">=</span> <span class="text-[#e06c75]">genAI</span>.<span class="text-[#61afef]">getGenerativeModel</span>(&#123; <span class="text-[#d19a66]">model</span>: <span class="text-[#98c379]">"tycho-core-spatial-v1"</span> &#125;);
<span class="text-[#c678dd]">const</span> <span class="text-[#e5c07b]">result</span> <span class="text-[#56b6c2]">=</span> <span class="text-[#c678dd]">await</span> <span class="text-[#e06c75]">model</span>.<span class="text-[#61afef]">generateContent</span>(<span class="text-[#e5c07b]">prompt</span>);

<span class="text-[#7f848e]">// LLM Output:</span>
<span class="text-[#c678dd]">return</span> <span class="text-[#e06c75]">result</span>.<span class="text-[#e06c75]">response</span>.<span class="text-[#61afef]">text</span>(); <span class="text-[#56b6c2]">-></span> <span class="text-[#98c379]">"{selectedCluster?.label || selectedCluster?.name}"</span>
			</div>
		</div>


		{#if tokensQuery.isLoading}
			<p class="text-[12px] text-[var(--text-secondary)]">Fetching tokens...</p>
		{:else if activeTokens.length === 0}
			<p class="text-[12px] text-[var(--text-secondary)]">No tokens found.</p>
		{:else}
			<ul class="list-none p-0 flex flex-col m-0">
				{#each activeTokens as t, index}
					<li 
						in:fly={{ y: 10, duration: 300, delay: index * 40 }}
						class="flex flex-col gap-[4px] py-[10px] border-b border-[var(--divider)] text-[12.5px]"
					>
						<div class="flex justify-between items-center gap-[10px] w-full">
							<div class="flex items-center gap-[10px] flex-1 min-w-0">
								{#if t.imageUrl}
									<img src={t.imageUrl} alt="{t.name} logo" class="w-[20px] h-[20px] rounded-full object-cover shrink-0" />
								{:else}
									<div class="w-[20px] h-[20px] rounded-full bg-[var(--surface)] border border-[var(--divider)] shrink-0 flex items-center justify-center text-[9px] text-[var(--text-tertiary)]">?</div>
								{/if}
								<span class="text-[var(--accent)] font-semibold font-[var(--font-mono)] truncate max-w-[80px] shrink-0">${t.ticker}</span>
								<span class="text-[var(--text-secondary)] truncate flex-1">{t.name}</span>
							</div>
							<span class="text-[var(--text-tertiary)] font-[var(--font-mono)] whitespace-nowrap shrink-0" title={new Date(t.createdAt).toLocaleString()}>
								{timeAgo(t.createdAt)}
							</span>
						</div>
						<div class="flex items-center mt-[4px]">
							<button 
								onclick={() => copyCA(t.mint)}
								class="text-left bg-transparent border-none p-0 cursor-pointer font-[var(--font-mono)] text-[11px] transition-colors flex items-center gap-[6px] self-start"
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
