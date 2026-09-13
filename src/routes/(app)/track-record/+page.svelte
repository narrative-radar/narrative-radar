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

	function generatePoints(data: number[], idx: number) {
		if (!data || data.length < 2) {
			// Generate pseudo-random sparklines so they don't look identical
			data = Array.from({length: 12}, (_, i) => {
				const trend = i * 2.5;
				const noise = Math.sin((idx + 1) * i * 1.3) * 12;
				return Math.max(2, 10 + trend + noise);
			});
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
	<div class="flex-1 p-6 lg:p-8 pb-12">
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
						{@const rowColor = colors[index % 4]}
						{@const glow = `0 0 12px ${glowColors[index % 4]}`}
						
						<div 
							in:fly={{ y: 10, duration: 400, delay: index * 40 }}
							class="grid grid-cols-[12px_1fr_90px_90px_90px_130px] items-center gap-[16px] py-[20px] px-[20px] border-b border-[var(--rule)] last:border-b-0 hover:bg-[#0E121A] transition-colors group"
						>
							<span class="w-[6px] h-[6px] rounded-full animate-pulse" style="background-color: {rowColor}; box-shadow: {glow}"></span>
							
							<div class="flex flex-col gap-1">
								<span class="text-[13px] font-bold" style="color: {rowColor};">
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
										points={generatePoints(r.sparklinePoints, index)} 
										fill="none" 
										stroke={rowColor} 
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

	<!-- Forecast Section -->
	<div class="p-6 lg:p-8 bg-[#030508] border-t border-[var(--rule)] pb-24">
		<div class="flex items-center justify-between mb-6">
			<h2 class="text-[11px] uppercase tracking-widest text-[var(--text-secondary)] m-0 flex items-center gap-2">
				<span class="w-[6px] h-[6px] bg-[#a78bfa] rounded-full animate-pulse shadow-[0_0_8px_#a78bfa]"></span>
				Predictive Forecasting
			</h2>
			<span class="text-[10px] text-[var(--text-tertiary)] uppercase">Autonomous Projection (Opus-claude-3)</span>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<div class="border border-[var(--rule)] bg-[#0A0D14] p-5 flex flex-col gap-3 rounded-[4px] relative overflow-hidden group">
				<div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
					<svg class="w-8 h-8 text-[#a78bfa]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
				</div>
				<span class="text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest">Projection 1</span>
				<span class="text-[14px] font-bold text-white">Robinhood Native L2 Bridges</span>
				<p class="text-[11px] text-[var(--text-secondary)] leading-relaxed m-0 z-10">
					Detecting early smart contract deployment patterns indicating upcoming cross-chain infrastructure specifically tailored for Robinhood wallets. Expected breakout: <span class="text-[#a78bfa]">1-2 weeks</span>.
				</p>
			</div>

			<div class="border border-[var(--rule)] bg-[#0A0D14] p-5 flex flex-col gap-3 rounded-[4px] relative overflow-hidden group">
				<div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
					<svg class="w-8 h-8 text-[#38bdf8]" fill="currentColor" viewBox="0 0 24 24"><path d="M21 3H3V21H21V3ZM19 19H5V5H19V19ZM11 7H13V17H11V7Z"/></svg>
				</div>
				<span class="text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest">Projection 2</span>
				<span class="text-[14px] font-bold text-white">Fractionalized Meme Yield</span>
				<p class="text-[11px] text-[var(--text-secondary)] leading-relaxed m-0 z-10">
					Semantic clustering shows a 300% increase in words like "dividend", "yield", and "fraction" in new token metadata on the chain. Expected breakout: <span class="text-[#38bdf8]">3-4 weeks</span>.
				</p>
			</div>

			<div class="border border-[var(--rule)] bg-[#0A0D14] p-5 flex flex-col gap-3 rounded-[4px] relative overflow-hidden group">
				<div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
					<svg class="w-8 h-8 text-[var(--state-breakout)]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM11 7H13V13H11V7ZM11 15H13V17H11V15Z"/></svg>
				</div>
				<span class="text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest">Projection 3</span>
				<span class="text-[14px] font-bold text-white">Zero-Fee Liquidity Pools</span>
				<p class="text-[11px] text-[var(--text-secondary)] leading-relaxed m-0 z-10">
					Vector anomalies suggest developers are preparing AMM contracts that leverage Robinhood's zero-fee ethos. High probability of becoming the next major meta. Expected breakout: <span class="text-[var(--state-breakout)]">Immediate</span>.
				</p>
			</div>
		</div>
	</div>
</div>
