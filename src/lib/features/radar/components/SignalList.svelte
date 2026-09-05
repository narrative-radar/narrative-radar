<script lang="ts">
	import SignalRow from './SignalRow.svelte';

	let { clusters, onRowClick } = $props<{
		clusters: any[];
		onRowClick: (themeId: string) => void;
	}>();

	function getStatusColor(status: string) {
		switch (status) {
			case 'breakout': return 'var(--state-breakout)';
			case 'fast': return 'var(--state-fast)';
			case 'active': return 'var(--state-active)';
			default: return 'var(--state-quiet)';
		}
	}
</script>

<div class="flex flex-col border-t border-[var(--divider)] max-h-[480px] overflow-y-auto">
	{#each clusters as cluster, i (cluster.id)}
		<SignalRow 
			themeId={cluster.id}
			name={cluster.name}
			memberCount={cluster.memberCount}
			growthRate={cluster.growthRate}
			sparklinePoints={cluster.sparklinePoints}
			statusColor={getStatusColor(cluster.status)}
			isBreakout={cluster.status === 'breakout'}
			index={i}
			onclick={() => onRowClick(cluster.id)}
		/>
	{/each}
</div>
