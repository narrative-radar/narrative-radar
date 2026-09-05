<script lang="ts">
	import { page } from '$app/stores';
	// @ts-ignore Svelte 5 snippets
	let { children } = $props();
</script>

<header class="flex items-center px-[32px] py-[24px] text-[13px] border-b border-[var(--divider)]">
	<a href="/" class="text-[var(--text-secondary)] hover:text-white font-[var(--font-mono)] mr-4">← tycho</a>
	<span class="font-[var(--font-mono)] text-[var(--text-tertiary)] flex-1">
		{$page.url.pathname === '/track-record' ? '/track-record' : '/radar'}
	</span>
	<div class="flex items-center gap-[20px]">
		<a href="/track-record" class="text-[var(--text-secondary)] hover:text-white font-[var(--font-mono)] transition-colors" class:text-white={$page.url.pathname === '/track-record'}>track record</a>
		<span class="flex items-center gap-[8px] font-[var(--font-mono)] text-[var(--text-primary)]">
			<i class="w-[8px] h-[8px] rounded-full bg-[var(--state-breakout)] animate-pulse shadow-[0_0_0_2px_rgba(232,93,74,0.2)]"></i>
			live · no login
		</span>
	</div>
</header>

{@render children()}
