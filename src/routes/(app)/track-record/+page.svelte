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
</script>

<svelte:head>
	<title>Tycho - Track Record</title>
</svelte:head>

<main class="max-w-[860px] mx-auto px-[32px] pt-[48px] pb-[80px]">
	<p class="font-[var(--font-mono)] text-[13px] text-[var(--text-tertiary)] m-0 mb-[14px]">no login · public record</p>
	<h1 class="font-serif font-normal text-[clamp(34px,5vw,52px)] m-0 mb-[16px]">Track record</h1>
	<p class="text-[16px] text-[var(--text-secondary)] max-w-[56ch] m-0 mb-[32px]">
		Every narrative Tycho flagged as breaking out, kept on record after the fact — not just what's forming now, but whether it was right.
	</p>

	<!-- Model Validation Block -->
	<div class="mb-[40px] border border-[var(--divider)] rounded-[12px] bg-[var(--surface)] overflow-hidden">
		<div class="px-5 py-4 border-b border-[var(--divider)] flex items-center justify-between">
			<div class="flex items-center gap-2">
				<svg class="w-4 h-4 text-[var(--state-breakout)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
				<h2 class="font-serif font-bold text-[15px] m-0">Model Validation</h2>
			</div>
			<span class="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] bg-[var(--background)] px-2 py-0.5 rounded border border-[var(--divider)]">V1.0.0 DBSCAN</span>
		</div>
		
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-0">
			<!-- Stat 1 -->
			<div class="p-5 sm:border-r border-b sm:border-b-0 border-[var(--divider)] flex flex-col justify-center">
				<div class="text-[10.5px] font-[var(--font-mono)] text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Total Signals</div>
				<div class="flex items-baseline gap-2">
					<div class="text-3xl font-bold font-serif text-[var(--text-primary)]">1,204</div>
				</div>
				<div class="text-[11px] text-[var(--text-secondary)] mt-1 font-[var(--font-mono)]">Metas identified</div>
			</div>
			
			<!-- Stat 2 -->
			<div class="p-5 sm:border-r border-b sm:border-b-0 border-[var(--divider)] flex flex-col justify-center bg-[rgba(52,211,153,0.02)]">
				<div class="text-[10.5px] font-[var(--font-mono)] text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Quality Hit Rate</div>
				<div class="flex items-baseline gap-2">
					<div class="text-3xl font-bold font-[var(--font-mono)] text-[var(--state-breakout)]" style="text-shadow: 0 0 12px rgba(52,211,153,0.2)">78.4%</div>
				</div>
				<div class="text-[11px] text-[var(--state-breakout)] opacity-80 mt-1 font-[var(--font-mono)]">Sustained > 24H</div>
			</div>
			
			<!-- Stat 3 -->
			<div class="p-5 flex flex-col justify-center relative overflow-hidden">
				<div class="absolute right-0 bottom-0 w-24 h-24 bg-[#38BDF8] rounded-full mix-blend-screen filter blur-[40px] opacity-10"></div>
				<div class="text-[10.5px] font-[var(--font-mono)] text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Avg Network Dominance</div>
				<div class="flex items-baseline gap-2">
					<div class="text-3xl font-bold font-[var(--font-mono)] text-[#38BDF8]" style="text-shadow: 0 0 12px rgba(56,189,248,0.2)">14.2%</div>
				</div>
				<div class="text-[11px] text-[#38BDF8] opacity-80 mt-1 font-[var(--font-mono)]">Peak saturation</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-[12px_1fr_110px_90px_130px] gap-[16px] px-[6px] pb-[10px] text-[11px] text-[var(--text-tertiary)] font-[var(--font-mono)]">
		<span></span>
		<span>theme</span>
		<span class="text-right">peak size</span>
		<span class="text-right">peak growth</span>
		<span class="text-right">first flagged</span>
	</div>

	<div class="flex flex-col border-t border-[var(--divider)]">
		{#if trackRecordQuery.isLoading}
			<p class="py-12 text-center text-[var(--text-tertiary)] text-[13px] italic">Fetching historical ledger...</p>
		{:else if records.length === 0}
			<div in:fly={{ y: 5, duration: 400 }} class="border border-[var(--divider)] rounded-[6px] p-[22px] mt-[24px] text-[13.5px] text-[var(--text-secondary)] bg-[var(--surface)]">
				No breakouts recorded yet. The ledger awaits.
			</div>
		{:else}
			{#each records as r, index}
				<div 
					in:fly={{ y: 10, duration: 400, delay: index * 40 }}
					class="grid grid-cols-[12px_1fr_110px_90px_130px] items-center gap-[16px] py-[18px] px-[6px] border-b border-[var(--divider)] hover:bg-[var(--row-hover)] transition-colors"
				>
					<span class="w-[7px] h-[7px] rounded-full {r.status === 'archived' ? 'bg-[var(--state-quiet)]' : 'bg-[var(--state-breakout)]'}"></span>
					<div class="text-[14.5px]">
						{r.label || r.name || 'Unknown Theme'}
						<span class="block text-[11.5px] text-[var(--text-tertiary)] mt-[3px]">
							{#if r.status === 'archived'}
								archived — cooled down
							{:else}
								still active — currently breaking out
							{/if}
						</span>
					</div>
					<span class="font-[var(--font-mono)] text-[12.5px] text-[var(--text-secondary)] text-right">
						{r.peakMemberCount} tokens
					</span>
					<span class="font-[var(--font-mono)] text-[12.5px] font-semibold text-[var(--state-breakout)] text-right">
						{#if r.peakGrowthRate}
							{Number(r.peakGrowthRate) > 0 ? '+' : ''}{(Number(r.peakGrowthRate) * 100).toFixed(0)}%
						{:else}
							-
						{/if}
					</span>
					<span class="font-[var(--font-mono)] text-[11.5px] text-[var(--text-tertiary)] text-right">
						{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date(r.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
					</span>
				</div>
			{/each}
		{/if}
	</div>

	<p class="text-[11.5px] text-[var(--text-tertiary)] mt-[20px] mx-[6px]">
		a theme stays listed here once it's ever crossed the breakout threshold, even after it cools — illustrative data, not live
	</p>
</main>
