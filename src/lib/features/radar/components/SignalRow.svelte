<script lang="ts">
	import { fly, draw } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	// Svelte 5 Props (runes)
	let {
		themeId,
		name,
		memberCount,
		growthRate,
		sparklinePoints,
		statusColor,
		statusGlow,
		isBreakout,
		index = 0,
		onclick
	} = $props<{
		themeId: string;
		name: string;
		memberCount: number;
		growthRate: number;
		sparklinePoints: number[];
		statusColor: string;
		statusGlow?: string;
		isBreakout: boolean;
		index?: number;
		onclick: () => void;
	}>();

	// Generate SVG points based on a 64x20 grid
	let momentum = $derived.by(() => {
		if (!sparklinePoints || sparklinePoints.length < 3) return null;
		const len = sparklinePoints.length;
		const lastGrowth = sparklinePoints[len - 1] - sparklinePoints[len - 2];
		const prevGrowth = sparklinePoints[len - 2] - sparklinePoints[len - 3];
		if (lastGrowth > prevGrowth) return 'accelerating';
		if (lastGrowth < prevGrowth) return 'slowing';
		return null;
	});

	function generatePoints(data: number[], idx: number) {
		if (!data || data.length < 3) {
			return "";
		}
		
		const max = Math.max(...data, 1);
		const min = Math.min(...data, 0);
		const range = max - min || 1;
		
		// Map values to 0-16 range (inverted Y)
		return data.map((val, i) => {
			const x = (i / (data.length - 1)) * 48;
			const y = 16 - ((val - min) / range) * 16;
			return `${x},${y}`;
		}).join(' ');
	}
</script>

<button 
	class="grid grid-cols-[12px_1fr_100px_46px_66px] items-center gap-[14px] w-full p-[14px_6px] border-b border-[var(--divider)] bg-transparent cursor-pointer text-left transition-colors duration-150 hover:bg-[var(--row-hover)] focus-visible:bg-[var(--row-hover)] group"
	data-theme={themeId}
	aria-label="{name}, {memberCount} tokens"
	{onclick}
	in:fly={{ x: -16, duration: 500, delay: 350 + index * 80, easing: cubicOut }}
>
	<span class="w-[7px] h-[7px] rounded-full {statusColor === 'var(--state-quiet)' ? '' : 'animate-pulse'}" style="background: {statusColor}; box-shadow: {statusGlow || 'none'}"></span>
	<span class="text-[14px] font-medium truncate" style="color: {statusColor === 'var(--state-quiet)' ? 'var(--fg)' : statusColor};">{name}</span>
	
	{#if sparklinePoints && sparklinePoints.length >= 3}
		<svg viewBox="0 0 64 20" class="w-[64px] h-[20px] overflow-visible">
			<polyline 
				points={generatePoints(sparklinePoints, index)} 
				fill="none" 
				stroke={statusColor} 
				stroke-width="1.6" 
				stroke-linecap="round" 
				stroke-linejoin="round"
				in:draw={{ duration: 700, delay: 550 + index * 80, easing: cubicOut }}
			/>
		</svg>
	{:else}
		<div class="w-[64px] text-center text-[var(--text-tertiary)] font-[var(--font-mono)]">--</div>
	{/if}
	
	<div class="flex flex-col items-end justify-center">
		<span class="font-[var(--font-mono)] text-[12.5px] text-[var(--text-secondary)] group-hover:text-[var(--fg)] transition-colors">
			{memberCount}
		</span>
		{#if momentum}
			<span class="text-[9px] uppercase font-[var(--font-mono)] tracking-wider mt-0.5" style="color: {momentum === 'accelerating' ? 'var(--live)' : 'var(--text-tertiary)'}">{momentum}</span>
		{/if}
	</div>
	
	<span class="font-[var(--font-mono)] text-[12.5px] font-semibold text-right" style="color: {statusColor}; text-shadow: {statusGlow || 'none'}">
		{#if Number(growthRate) === 999999} <!-- not used anymore but keep syntax -->
			new
		{:else if Number(growthRate) > 0}
			+{Math.round(Number(growthRate))} in 24h
		{:else if Number(growthRate) < 0}
			{Math.round(Number(growthRate))}
		{:else}
			—
		{/if}
	</span>
</button>
