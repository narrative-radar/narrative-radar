<script lang="ts">
	import SignalRow from './SignalRow.svelte';

	let { clusters, onRowClick } = $props<{
		clusters: any[];
		onRowClick: (themeId: string) => void;
	}>();

	const colors = ['var(--live)', 'var(--banana)', 'var(--cyan)', 'var(--violet)'];
	const glowColors = ['var(--live-glow)', 'var(--banana-glow)', 'rgba(56,189,248,0.3)', 'rgba(167,139,250,0.3)'];
</script>

<div class="flex flex-col max-h-[480px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden" style="scrollbar-width: none; -ms-overflow-style: none;">
	{#each clusters as cluster, i (cluster.id)}
		{@const rowColor = cluster.status === 'cooling' ? 'var(--state-quiet)' : colors[i % 4]}
		{@const rowGlow = cluster.status === 'cooling' ? 'none' : `0 0 12px ${glowColors[i % 4]}`}
		<SignalRow 
			themeId={cluster.id}
			name={cluster.label || 'Unnamed Theme'}
			memberCount={cluster.memberCount}
			growthRate={cluster.growthRate}
			sparklinePoints={cluster.sparklinePoints}
			statusColor={rowColor}
			statusGlow={rowGlow}
			isBreakout={cluster.status === 'breakout'}
			index={i}
			onclick={() => onRowClick(cluster.id)}
		/>
	{/each}
</div>
