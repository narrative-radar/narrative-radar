<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import '../app.css';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 5000,
			}
		}
	});
</script>

<svelte:head>
	<title>Tycho — Narrative Radar</title>
	<meta name="description" content="See the meta before it's the meta." />
</svelte:head>

<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
