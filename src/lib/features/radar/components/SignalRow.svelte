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
		isBreakout: boolean;
		index?: number;
		onclick: () => void;
	}>();

	// Generate SVG points based on a 64x20 grid
	function generatePoints(data: number[]) {
		if (!data || data.length === 0) return '0,10 64,10'; // Garis datar kalau kosong
		if (data.length === 1) return `0,10 64,10`;
		
		const max = Math.max(...data, 1); // Hindari bagi nol
		const min = Math.min(...data, 0);
		const range = max - min;
		
		const width = 64;
		const height = 18; // Margin dikit biar ngga kepotong border
		const step = width / (data.length - 1);
		
		return data.map((val, i) => {
			const x = i * step;
			// Y dibalik karena koordinat SVG 0 di atas, 20 di bawah
			const y = 19 - ((val - min) / (range || 1)) * height;
			return `${x},${y}`;
		}).join(' ');
	}
</script>

<button 
	class="grid grid-cols-[12px_1fr_100px_46px_66px] items-center gap-[14px] w-full p-[14px_6px] border-b border-[var(--divider)] bg-transparent cursor-pointer text-left transition-colors duration-150 hover:bg-[var(--row-hover)] focus-visible:bg-[var(--row-hover)]"
	data-theme={themeId}
	aria-label="{name}, {memberCount} tokens"
	{onclick}
	in:fly={{ x: -16, duration: 500, delay: 350 + index * 80, easing: cubicOut }}
>
	<span class="w-[7px] h-[7px] rounded-full" style="background: {statusColor}"></span>
	<span class="text-[14px] font-medium truncate">{name}</span>
	
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
	
	<span class="font-[var(--font-mono)] text-[12.5px] text-[var(--text-secondary)] text-right">
		{memberCount}
	</span>
	
	<span class="font-[var(--font-mono)] text-[12.5px] font-semibold text-right" style="color: {statusColor}">
		+{Math.round(growthRate)}%
	</span>
</button>
