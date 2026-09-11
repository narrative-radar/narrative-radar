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
	function generatePoints(data: number[]) {
		if (!data || data.length < 2) {
			data = [10, 15, 8, 20, 12, 25, 18, 30, 22, 35, 15, 40];
		}
		
		const max = Math.max(...data, 1);
		const min = Math.min(...data, 0);
		const range = max - min;
		
		const width = 64;
		const height = 18; 
		const step = width / (data.length - 1);
		
		return data.map((val, i) => {
			const x = i * step;
			const y = 19 - ((val - min) / (range || 1)) * height;
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
	
	<svg viewBox="0 0 64 20" class="w-[64px] h-[20px] overflow-visible">
		<polyline 
			points={generatePoints(sparklinePoints)} 
			fill="none" 
			stroke={statusColor} 
			stroke-width="1.6" 
			stroke-linecap="round" 
			stroke-linejoin="round"
			in:draw={{ duration: 700, delay: 550 + index * 80, easing: cubicOut }}
		/>
	</svg>
	
	<span class="font-[var(--font-mono)] text-[12.5px] text-[var(--text-secondary)] text-right group-hover:text-[var(--fg)] transition-colors">
		{memberCount}
	</span>
	
	<span class="font-[var(--font-mono)] text-[12.5px] font-semibold text-right" style="color: {statusColor}; text-shadow: {statusGlow || 'none'}">
		+{Math.round(growthRate)}%
	</span>
</button>
