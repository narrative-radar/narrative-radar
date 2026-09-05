<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { createQuery } from '@tanstack/svelte-query';
	import SignalList from '$lib/features/radar/components/SignalList.svelte';

	// 1. Fetch data dari API (Step 6) - akan ter-refresh otomatis setiap 5 detik
	const clustersQuery = createQuery(() => ({
		queryKey: ['clusters'],
		queryFn: async () => {
			const res = await fetch('/api/clusters');
			if (!res.ok) throw new Error('Failed to fetch clusters');
			return res.json();
		},
		refetchInterval: 5000
	}));

	let isDetailOpen = $state(false);
	let selectedThemeId = $state<string | null>(null);

	// 2. Fetch data detail koin (hanya aktif kalau panel dibuka)
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
	let activeTokens = $derived(tokensQuery.data?.tokens || []);
	let selectedCluster = $derived(activeClusters.find((c: any) => c.id === selectedThemeId));

	// State & fungsi untuk Langkah 8 (Share & Copy)
	let shareBtnText = $state('Copy 📋');
	let copiedTokens = $state<Record<string, boolean>>({});
	
	// Toast Notification State
	let toastMessage = $state('');
	let toastVisible = $state(false);
	let toastTimeout: ReturnType<typeof setTimeout>;

	function showToast(msg: string) {
		toastMessage = msg;
		toastVisible = true;
		clearTimeout(toastTimeout);
		toastTimeout = setTimeout(() => { toastVisible = false; }, 2500);
	}

	async function handleShareClick() {
		const top3 = activeClusters.slice(0, 3);
		let text = "Meta this hour — tycho.xyz/radar\n";
		if (top3.length === 0) text += "No active breakouts right now.";
		top3.forEach((c: any) => { text += `${c.name || 'Pending Theme'}: ${c.memberCount}\n`; });
		
		try {
			await navigator.clipboard.writeText(text.trim());
			shareBtnText = 'Copied! ✓';
			showToast('Top themes summary copied to clipboard!');
			setTimeout(() => shareBtnText = 'Copy 📋', 1500);
		} catch (err) { console.error('Failed to copy', err); showToast('Failed to copy. Please try again.'); }
	}

	async function copyCA(mint: string) {
		try {
			await navigator.clipboard.writeText(mint);
			copiedTokens[mint] = true;
			showToast(`CA Copied: ${mint.slice(0, 4)}...${mint.slice(-4)}`);
			setTimeout(() => { copiedTokens[mint] = false; }, 1500);
		} catch (err) { console.error('Failed to copy', err); showToast('Failed to copy CA.'); }
	}
</script>

<main class="max-w-[1400px] mx-auto px-[32px] py-[32px] pb-[70px] grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-[28px] items-start overflow-hidden">
	
	<!-- LEFT COLUMN: Feed -->
	<div>
		<h1 in:fly={{ y: -10, duration: 500 }} class="text-[22px] font-bold m-0 mb-[6px] leading-[1.2]">Narrative Radar</h1>
		<p in:fly={{ y: -5, duration: 500, delay: 100 }} class="text-[13.5px] text-[var(--text-tertiary)] m-0 mb-[28px]">
			Clusters update automatically. No account needed to view.
		</p>

		<!-- Legend -->
		<div in:fly={{ opacity: 0, duration: 500, delay: 200 }} class="flex flex-wrap gap-[16px] text-[12px] text-[var(--text-secondary)] mb-[18px]">
			<span class="flex items-center gap-[6px]">
				<i class="w-[7px] h-[7px] rounded-full bg-[var(--state-quiet)]"></i> quiet
			</span>
			<span class="flex items-center gap-[6px]">
				<i class="w-[7px] h-[7px] rounded-full bg-[var(--state-active)]"></i> active
			</span>
			<span class="flex items-center gap-[6px]">
				<i class="w-[7px] h-[7px] rounded-full bg-[var(--state-fast)]"></i> fast
			</span>
			<span class="flex items-center gap-[6px]">
				<i class="w-[7px] h-[7px] rounded-full bg-[var(--state-breakout)]"></i> breakout
			</span>
		</div>

		{#if clustersQuery.isLoading}
			<p class="text-[var(--text-tertiary)] text-[13px] italic p-4">Scanning real-time signals...</p>
		{:else if activeClusters.length === 0}
			<div in:fly={{ y: 5, duration: 400 }} class="py-14 flex flex-col items-center justify-center text-center border-t border-b border-[var(--divider)]">
				<i class="w-2 h-2 rounded-full bg-[var(--state-quiet)] animate-pulse mb-4"></i>
				<p class="font-[var(--font-mono)] text-[13px] text-[var(--text-secondary)] m-0 mb-1">Radar is quiet.</p>
				<p class="text-[12px] text-[var(--text-tertiary)] m-0">Awaiting the next anomaly on the chain...</p>
			</div>
		{:else}
			<SignalList clusters={activeClusters} onRowClick={openDetail} />
		{/if}

		<p in:fly={{ opacity: 0, duration: 500, delay: 600 }} class="text-[11.5px] text-[var(--text-tertiary)] mt-[16px] mx-[6px]">
			Showing active clusters with >= 2 members. Automatically groups related tokens via embeddings.
		</p>
	</div>

	<!-- RIGHT COLUMN: Side Panel -->
	<aside in:fly={{ x: 14, duration: 600, delay: 400, easing: cubicOut }} class="flex flex-col gap-[20px]">
		
		<div class="border border-[var(--divider)] rounded-[6px] p-[18px_20px] bg-[var(--surface)]">
			<h3 class="text-[11px] tracking-[0.08em] text-[var(--text-tertiary)] uppercase m-0 mb-[14px]">System Status</h3>
			<div class="flex items-baseline justify-between py-[11px] border-t border-[var(--divider)]">
				<span class="font-[var(--font-mono)] text-[19px] font-semibold text-[var(--text-primary)]">Live</span>
				<span class="text-[12px] text-[var(--text-secondary)] text-right">connection</span>
			</div>
			<div class="flex items-baseline justify-between py-[11px] border-t border-[var(--divider)]">
				<span class="font-[var(--font-mono)] text-[19px] font-semibold text-[var(--text-primary)]">{activeClusters.length}</span>
				<span class="text-[12px] text-[var(--text-secondary)] text-right">active clusters</span>
			</div>
		</div>

		<div class="border border-[var(--divider)] rounded-[6px] p-[18px_20px] bg-[var(--surface)] mt-[20px]">
			<p class="text-[11px] text-[var(--text-tertiary)] m-0 mb-[4px]">Trending Right Now</p>
			<h4 class="text-[14.5px] font-bold m-0 mb-[12px]">Top 3 Breakouts</h4>
			
			{#if activeClusters.length > 0}
				<ul class="list-none p-0 m-0 mb-[12px] flex flex-col gap-[7px] text-[12.5px]">
					{#each activeClusters.slice(0, 3) as c}
						<li class="flex justify-between items-center">
							<span>
								<i class="w-[7px] h-[7px] rounded-full inline-block mr-[8px]" style="background: var(--state-{c.status === 'breakout' ? 'breakout' : c.status === 'fast' ? 'fast' : 'active'})"></i>
								{c.name || 'Theme: Pending...'}
							</span>
							<span class="font-[var(--font-mono)] text-[var(--text-secondary)]">{c.memberCount}</span>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="text-[12px] text-[var(--text-secondary)] mb-[12px]">Awaiting signals...</p>
			{/if}
			
			<div class="text-[10.5px] text-[var(--text-tertiary)] font-[var(--font-mono)] border-t border-[var(--divider)] pt-[9px] flex justify-between">
				<span>tycho.xyz/radar</span>
				<button 
					onclick={handleShareClick}
					class="hover:text-[var(--text-primary)] cursor-pointer bg-transparent border-none p-0 transition-colors"
					class:text-[var(--state-active)]={shareBtnText === 'Copied! ✓'}
				>
					{shareBtnText}
				</button>
			</div>
		</div>
	</aside>

	<!-- DETAIL PANEL OVERLAY -->
	{#if isDetailOpen}
		<!-- Background overlay to prevent clicking behind -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 z-40 bg-black/20" onclick={closeDetail} transition:fly={{ opacity: 0, duration: 200 }}></div>
		
		<div 
			transition:fly={{ x: 380, duration: 300, easing: cubicOut }}
			data-lenis-prevent="true"
			class="fixed top-0 right-0 h-full w-[380px] max-w-[92vw] bg-[var(--surface)] border-l border-[var(--divider)] p-[26px] overflow-y-auto z-50 shadow-2xl"
		>
			<button class="bg-transparent border border-[var(--divider)] text-[var(--text-secondary)] rounded-[4px] w-[28px] h-[28px] cursor-pointer text-[13px] mb-[18px] hover:text-white" onclick={closeDetail}>
				✕
			</button>
			<h3 class="text-[17px] m-0 mb-[4px] capitalize">{selectedCluster?.label || selectedCluster?.name || 'Theme Detail'}</h3>
			<p class="text-[12px] text-[var(--text-secondary)] font-[var(--font-mono)] mb-[18px]">
				{selectedCluster?.memberCount} tokens · {selectedCluster?.status}
			</p>

			{#if tokensQuery.isLoading}
				<p class="text-[12px] text-[var(--text-secondary)]">Fetching tokens...</p>
			{:else if activeTokens.length === 0}
				<p class="text-[12px] text-[var(--text-secondary)]">No tokens found.</p>
			{:else}
				<ul class="list-none p-0 flex flex-col">
					{#each activeTokens as t, index}
						<li 
							in:fly={{ y: 10, duration: 300, delay: index * 40 }}
							class="flex flex-col gap-[4px] py-[10px] border-b border-[var(--divider)] text-[12.5px]"
						>
							<div class="flex justify-between gap-[10px]">
								<span class="text-[var(--accent)] font-semibold font-[var(--font-mono)]">{t.ticker}</span>
								<span class="text-[var(--text-secondary)] flex-1 px-[8px] truncate">{t.name}</span>
								<span class="text-[var(--text-tertiary)] font-[var(--font-mono)] truncate max-w-[60px]" title={new Date(t.createdAt).toLocaleString()}>
									{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
								</span>
							</div>
							<div class="flex items-center gap-[12px] mt-[4px]">
								<button 
									onclick={() => copyCA(t.mint)}
									class="text-left bg-[var(--surface-hover)] border border-[var(--divider)] px-[6px] py-[3px] rounded-[4px] cursor-pointer font-[var(--font-mono)] text-[10px] transition-colors flex items-center gap-[4px]"
									class:text-[var(--state-active)]={copiedTokens[t.mint]}
									class:text-[var(--text-tertiary)]={!copiedTokens[t.mint]}
									class:hover:text-[var(--text-primary)]={!copiedTokens[t.mint]}
								>
									{copiedTokens[t.mint] ? 'Copied ✓' : `📋 ${t.mint.slice(0, 4)}...${t.mint.slice(-4)}`}
								</button>
								<a 
									href={`https://bullx.io/terminal?chainId=1399811149&address=${t.mint}`}
									target="_blank" rel="noreferrer"
									class="text-[10px] font-semibold text-[var(--accent)] hover:text-white transition-colors flex items-center gap-[2px] no-underline"
								>
									⚡️ BullX
								</a>
								<a 
									href={`https://dexscreener.com/solana/${t.mint}`}
									target="_blank" rel="noreferrer"
									class="text-[10px] font-semibold text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-[2px] no-underline"
								>
									🦅 DexScreener
								</a>
							</div>
						</li>
					{/each}
				</ul>
			{/if}

			</div>
		{/if}

	<!-- TOAST NOTIFICATION -->
	{#if toastVisible}
		<div 
			transition:fly={{ y: 20, duration: 300, easing: cubicOut }}
			class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[var(--surface)] border border-[var(--divider)] px-5 py-3 rounded-full text-[13px] font-medium text-[var(--text-primary)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] z-[9999] flex items-center gap-3 whitespace-nowrap"
		>
			<i class="w-2 h-2 rounded-full bg-[var(--state-active)] shadow-[0_0_8px_var(--state-active)]"></i>
			{toastMessage}
		</div>
	{/if}
</main>
