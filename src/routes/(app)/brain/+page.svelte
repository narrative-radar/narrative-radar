<script lang="ts">
	import { onMount } from 'svelte';
	// @ts-ignore
	let { data } = $props();

	let brainLogs: string[] = $state([]);
	let terminalContainer: HTMLElement;

	const thoughts = [
		"[SYS] Hourly retraining sequence initiated.",
		"[AI] Re-calculating Vapnik-Chervonenkis penalty across 450 nodes.",
		"[AI] Measured AUC: 0.5192. Variance: 0.0738 against a 0.02 bound.",
		"[SYS] Sample volume: 445 of 1,000 validation gate.",
		"[AI] Positive class: 107 of 300.",
		"[SYS] Gate function evaluates to FALSE. 6 conditions unmet.",
		"[AI] Executing idea generator (100 candidates/hr).",
		"[SYS] Commitment log timestamped.",
		"[AI] Mapping semantic similarities (dim=1536)...",
		"[SYS] Ingesting new Ponsfamily contract deployments.",
		"[AI] Inferred narrative generation active. Awaiting threshold.",
		"[SYS] Proven floor holding at +0.0782."
	];

	onMount(() => {
		// Initialize with some logs
		for(let i=0; i<8; i++) {
			brainLogs.push(`> ${thoughts[Math.floor(Math.random() * thoughts.length)]}`);
		}
		
		const interval = setInterval(() => {
			const time = new Date().toISOString().split('T')[1].substring(0,8);
			const msg = thoughts[Math.floor(Math.random() * thoughts.length)];
			brainLogs = [...brainLogs, `[${time}] ${msg}`];
			
			// Auto scroll
			if (brainLogs.length > 50) {
				brainLogs.shift();
			}
			
			setTimeout(() => {
				if (terminalContainer) {
					terminalContainer.scrollTop = terminalContainer.scrollHeight;
				}
			}, 50);
		}, 1500);

		return () => clearInterval(interval);
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
		
		<div class="flex flex-wrap gap-4 sm:gap-6 text-[9px] sm:text-[10px] font-[var(--font-mono)] bg-[#0A0D14] p-3 border border-[var(--divider)] rounded-[4px] w-full xl:w-auto">
			<div class="flex flex-col gap-1">
				<span class="text-[var(--text-tertiary)]">MEASURED AUC</span>
				<span class="text-[var(--fg)]">0.5192</span>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-[var(--text-tertiary)]">VC PENALTY</span>
				<span class="text-[var(--fg)]">0.4410</span>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-[var(--text-tertiary)]">PROVEN FLOOR</span>
				<span class="text-[#4ade80]">+0.0782</span>
			</div>
			<div class="flex flex-col gap-1 border-l border-[var(--divider)] pl-4 ml-2">
				<span class="text-[var(--text-tertiary)]">GATE FUNCTION</span>
				<span class="text-[#f87171]">FALSE (6 BLOCKING)</span>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full h-[600px] max-h-[75vh]">
		<!-- Left: Brain Internal Logs -->
		<div class="flex flex-col bg-[#030508] border border-[var(--rule)] h-full overflow-hidden relative">
			<div class="absolute top-0 left-0 w-full h-[1px] bg-[var(--live)] opacity-20"></div>
			<div class="bg-[#0A0D14] border-b border-[var(--rule)] px-4 py-2 flex justify-between items-center z-10">
				<span class="text-[10px] font-[var(--font-mono)] text-[var(--text-secondary)] tracking-widest uppercase">INTERNAL_STATE.LOG</span>
				<span class="text-[9px] font-[var(--font-mono)] text-[var(--live)] animate-pulse">STREAMING</span>
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
				<span class="text-[9px] font-[var(--font-mono)] text-[var(--text-tertiary)]">{data.recentTokens.length} NODES</span>
			</div>
			<div class="flex-1 p-0 overflow-y-auto scrollbar-hide">
				<ul class="list-none m-0 p-0 flex flex-col">
					{#each data.recentTokens as t, i}
						<li class="flex items-center gap-4 px-4 py-3 border-b border-[var(--divider)] hover:bg-[#0A0D14] transition-colors cursor-default group">
							<span class="text-[10px] text-[var(--text-tertiary)] font-[var(--font-mono)] min-w-[60px]">
								{t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : 'LIVE'}
							</span>
							{#if t.imageUrl}
								<img src={t.imageUrl} alt="" class="w-[24px] h-[24px] rounded-full object-cover shrink-0 grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100" />
							{:else}
								<div class="w-[24px] h-[24px] rounded-full bg-[var(--rule)] shrink-0 flex items-center justify-center text-[8px] text-[var(--text-tertiary)]">?</div>
							{/if}
							<div class="flex flex-col flex-1 min-w-0">
								<div class="flex items-center gap-2">
									<span class="text-[13px] text-[var(--fg)] truncate font-medium">{t.name}</span>
									<span class="text-[10px] text-[var(--live)] font-[var(--font-mono)] px-1.5 py-0.5 bg-[var(--live)]/10 rounded">${t.ticker}</span>
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
	
	<!-- Lore Footer -->
	<div class="mt-8 pt-6 border-t border-[var(--divider)] flex flex-col md:flex-row justify-between items-center gap-4">
		<div class="flex items-center gap-3">
			<span class="w-[6px] h-[6px] bg-[#f87171] rounded-full animate-pulse shadow-[0_0_10px_#f87171]"></span>
			<p class="text-[11px] font-[var(--font-mono)] text-[var(--text-tertiary)] m-0">
				VALIDATION GATES: <span class="text-[#f87171]">LOCKED</span>. AWAITING 24-HOUR CONTINUOUS SPATIAL CALIBRATION.
			</p>
		</div>
		<div class="text-[11px] font-[var(--font-mono)] text-[var(--text-tertiary)] flex gap-6">
			<a href="/api/dataset.csv" target="_blank" class="hover:text-[var(--fg)] cursor-crosshair transition-colors underline underline-offset-4">PUBLIC_DATASET.CSV</a>
			<span class="hover:text-[var(--fg)] cursor-crosshair transition-colors">LAUNCH_SPEC.PDF</span>
			<span class="hover:text-[var(--fg)] cursor-crosshair transition-colors">WALLET: 0 SOL</span>
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
