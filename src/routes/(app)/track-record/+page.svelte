<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import { fly } from 'svelte/transition';

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
		if (!data || data.length < 3) {
			return "";
		}
		const max = Math.max(...data, 1);
		const min = Math.min(...data, 0);
		const range = max - min || 1;
		const width = 80;
		const height = 24;
		const step = width / (data.length - 1);
		return data.map((val, i) => {
			const x = i * step;
			const y = height - ((val - min) / range) * height;
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
	
	<!-- Header Section -->
	<div class="border-b border-[var(--rule)] bg-[#05070B] p-6 md:p-8">
		<div class="flex items-center gap-2 mb-4">
			<div class="w-2 h-2 rounded-full bg-[var(--state-breakout)] animate-pulse shadow-[0_0_8px_var(--state-breakout)]"></div>
			<h1 class="text-[11px] uppercase tracking-widest text-white m-0">Historical Ledger</h1>
		</div>
		<p class="text-[11px] text-[var(--text-tertiary)] leading-relaxed m-0 max-w-[600px]">
			Archive of past breakouts. When an active narrative cools down, it is permanently memorialized here. 
			This page fills autonomously as live clusters prove out.
		</p>
		<div class="mt-4 inline-block text-[10px] uppercase text-[var(--text-tertiary)] tracking-widest border border-[var(--rule)] px-2 py-1 rounded bg-[#0A0D14] w-max">
			V1.0.0 DBSCAN
		</div>
	</div>


	<!-- Data Table -->
	<div class="flex-1 p-6 lg:p-8 pb-12">
		<div class="border border-[var(--rule)] bg-[#0A0D14] rounded-[4px] flex flex-col">
			
			<div class="px-6 py-8 border-b border-[var(--rule)]">
				<h1 class="text-[24px] font-[var(--font-mono)] uppercase tracking-tight mb-2">Track Record</h1>
				<p class="text-[var(--text-secondary)]">Historical log of narrative sub-clusters detected by Tycho before breakout.</p>
				<p class="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mt-4 border border-[var(--rule)] w-fit px-2 py-1 bg-[#0A0D14]">History reconstructed from on-chain launch timestamps</p>
			</div>

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
						No verified breakouts yet — this page fills as clusters prove out.
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
								{#if r.sparklinePoints && r.sparklinePoints.length >= 3}
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
								{:else}
									<div class="w-[80px] text-center text-[var(--text-tertiary)] font-[var(--font-mono)]">--</div>
								{/if}
							</div>

							<span class="text-[12px] text-white text-right">
								{r.peakMemberCount} <span class="text-[10px] text-[var(--text-tertiary)]">TKNS</span>
							</span>
							
							<span class="text-[12px] font-bold text-right" style="color: {rowColor}; text-shadow: {glow}">
								{#if Number(r.peakGrowthRate) === 999999} <!-- not used anymore but keep syntax -->
									new
								{:else if Number(r.peakGrowthRate) > 0}
									+{Math.round(Number(r.peakGrowthRate))} new
								{:else if Number(r.peakGrowthRate) < 0}
									{Math.round(Number(r.peakGrowthRate))}
								{:else}
									—
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
