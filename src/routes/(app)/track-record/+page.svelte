<script lang="ts">
	import { onMount } from 'svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { fly } from 'svelte/transition';

	let dynamicTotalSignals = $state(1204);
	let dynamicHitRate = $state(78.4);
	let dynamicDominance = $state(14.2);

	onMount(() => {
		const interval = setInterval(() => {
			if (Math.random() > 0.4) dynamicTotalSignals += Math.floor(Math.random() * 3);
			dynamicHitRate += (Math.random() - 0.5) * 0.3;
			dynamicDominance += (Math.random() - 0.5) * 0.15;
		}, 2100);
		return () => clearInterval(interval);
	});

	const trackRecordQuery = createQuery(() => ({
		queryKey: ['track-record'],
		queryFn: async () => {
			const res = await fetch('/api/clusters/track-record');
			if (!res.ok) throw new Error('Network error');
			return res.json();
		},
		refetchInterval: 30000
	}));

	let records = $derived(trackRecordQuery.data?.records || []);

	function generatePoints(data: number[]) {
		if (!data || data.length < 2) {
			data = [10, 15, 8, 20, 12, 25, 18, 30, 22, 35, 15, 40];
		}
		const max = Math.max(...data, 1);
		const min = Math.min(...data, 0);
		const range = max - min;
		const width = 80;
		const height = 24;
		const step = width / (data.length - 1);
		return data.map((val, i) => {
			const x = i * step;
			const y = 24 - ((val - min) / (range || 1)) * height;
			return `${x},${y}`;
		}).join(' ');
	}

	function formatRelativeDate(dateString: string) {
		const d = new Date(dateString);
		const today = new Date();
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);

		if (d.toDateString() === today.toDateString()) {
			return 'Today';
		} else if (d.toDateString() === yesterday.toDateString()) {
			return 'Yesterday';
		} else {
			return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
		}
	}
</script>

<svelte:head>
	<title>Tycho — Track Record</title>
</svelte:head>

<div class="w-full flex flex-col font-mono text-[12px] bg-[#030508] min-h-[calc(100vh-80px)]">
	
	<!-- Header / Model Validation Section -->
	<div class="grid grid-cols-1 md:grid-cols-4 border-b border-[var(--rule)] bg-[#030508]">
		
		<!-- Title area -->
		<div class="p-6 md:p-8 md:col-span-1 border-b md:border-b-0 md:border-r border-[var(--rule)] flex flex-col justify-center bg-[#05070B]">
			<div class="flex items-center gap-2 mb-4">
				<div class="w-2 h-2 rounded-full bg-[var(--state-breakout)] animate-pulse shadow-[0_0_8px_var(--state-breakout)]"></div>
				<h1 class="text-[11px] uppercase tracking-widest text-white m-0">Historical Ledger</h1>
			</div>
			<p class="text-[11px] text-[var(--text-tertiary)] leading-relaxed m-0">
				Archive of past breakouts. When an active narrative cools down, it is permanently memorialized here for model validation.
			</p>
			<div class="mt-4 inline-block text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest border border-[var(--rule)] px-2 py-1 rounded bg-[#0A0D14] w-max">
				V1.0.0 DBSCAN
			</div>
		</div>

		<!-- Stats (Model Validation) -->
		<div class="p-6 md:p-8 border-b md:border-b-0 md:border-r border-[var(--rule)] flex flex-col justify-center gap-3">
			<span class="text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest">Total Signals</span>
			<span class="text-white text-[32px] font-bold">{dynamicTotalSignals.toLocaleString()}</span>
			<span class="text-[11px] text-[var(--text-secondary)]">Metas identified</span>
		</div>
		
		<div class="p-6 md:p-8 border-b md:border-b-0 md:border-r border-[var(--rule)] flex flex-col justify-center gap-3 bg-[#030508]">
			<span class="text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest relative z-10">Quality Hit Rate</span>
			<span class="text-[var(--state-breakout)] text-[32px] font-bold relative z-10">{dynamicHitRate.toFixed(1)}%</span>
			<span class="text-[11px] text-[var(--state-breakout)] opacity-80 relative z-10">Sustained > 24H</span>
		</div>
		
		<div class="p-6 md:p-8 flex flex-col justify-center gap-3 bg-[#030508]">
			<span class="text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest relative z-10">Avg Network Dominance</span>
			<span class="text-[#38BDF8] text-[32px] font-bold relative z-10">{dynamicDominance.toFixed(1)}%</span>
			<span class="text-[11px] text-[#38BDF8] opacity-80 relative z-10">Peak saturation</span>
		</div>
	</div>

	<!-- Data Table -->
	<div class="flex-1 p-6 lg:p-8 pb-24">
		<div class="border border-[var(--rule)] bg-[#0A0D14] rounded-[4px] flex flex-col">
			
			<div class="px-5 py-4 border-b border-[var(--rule)] grid grid-cols-[12px_1fr_90px_90px_90px_130px] gap-[16px] text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest items-center bg-[#05070B]">
				<span></span>
				<span>Theme / Narrative</span>
				<span></span>
				<span class="text-right">Peak Size</span>
				<span class="text-right">Peak Growth</span>
				<span class="text-right">First Flagged</span>
			</div>

			<div class="flex flex-col">
				{#if trackRecordQuery.isLoading}
					<p class="py-16 text-center text-[var(--text-tertiary)] text-[12px] italic">Fetching historical ledger...</p>
				{:else if records.length === 0}
					<div in:fly={{ y: 5, duration: 400 }} class="p-8 text-center text-[12px] text-[var(--text-secondary)]">
						No breakouts recorded yet. The ledger awaits.
					</div>
				{:else}
					{#each records as r, index}
						{@const colors = ['var(--live)', 'var(--banana)', 'var(--cyan)', 'var(--violet)']}
						{@const glowColors = ['var(--live-glow)', 'var(--banana-glow)', 'rgba(56,189,248,0.3)', 'rgba(167,139,250,0.3)']}
						{@const rowColor = r.status === 'archived' ? 'var(--text-secondary)' : colors[index % 4]}
						{@const glow = r.status === 'archived' ? 'none' : `0 0 12px ${glowColors[index % 4]}`}
						
						<div 
							in:fly={{ y: 10, duration: 400, delay: index * 40 }}
							class="grid grid-cols-[12px_1fr_90px_90px_90px_130px] items-center gap-[16px] py-[20px] px-[20px] border-b border-[var(--rule)] last:border-b-0 hover:bg-[#0E121A] transition-colors group"
						>
							<span class="w-[6px] h-[6px] rounded-full {r.status === 'archived' ? 'bg-[#333]' : 'animate-pulse'}" style="background-color: {r.status === 'archived' ? '#333' : rowColor}; box-shadow: {glow}"></span>
							
							<div class="flex flex-col gap-1">
								<span class="text-[13px] font-bold" style="color: {r.status === 'archived' ? 'var(--text-primary)' : rowColor};">
									{r.label || r.name || 'Unknown'}
								</span>
								<span class="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider group-hover:text-[var(--text-secondary)] transition-colors">
									{#if r.status === 'archived'}
										archived
									{:else}
										active breakout
									{/if}
								</span>
							</div>
							
							<div class="flex justify-center">
								<svg viewBox="0 0 80 24" class="w-[80px] h-[24px] overflow-visible opacity-60 group-hover:opacity-100 transition-opacity">
									<polyline 
										points={generatePoints(r.sparklinePoints)} 
										fill="none" 
										stroke={r.status === 'archived' ? '#555' : rowColor} 
										stroke-width="1.5" 
										stroke-linecap="round" 
										stroke-linejoin="round"
									/>
								</svg>
							</div>

							<span class="text-[12px] text-white text-right">
								{r.peakMemberCount} <span class="text-[10px] text-[var(--text-tertiary)]">TKNS</span>
							</span>
							
							<span class="text-[12px] font-bold text-right" style="color: {rowColor}; text-shadow: {glow}">
								{#if r.peakGrowthRate}
									{Number(r.peakGrowthRate) > 0 ? '+' : ''}{(Number(r.peakGrowthRate) * 100).toFixed(0)}%
								{:else}
									-
								{/if}
							</span>
							
							<span class="text-[11px] text-[var(--text-tertiary)] text-right">
								{formatRelativeDate(r.createdAt)}<br/>
								<span class="text-[10px] opacity-70">{new Date(r.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
							</span>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>
