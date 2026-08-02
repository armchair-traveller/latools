<script lang="ts">
	import { resolve } from '$app/paths';
	import BookOpenTextIcon from '@lucide/svelte/icons/book-open-text';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Separator } from '$lib/components/ui/separator';
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<meta name="theme-color" content="#fbfaf7" />
</svelte:head>

<Sidebar.Provider style="--sidebar-width: 17.5rem; --sidebar-width-mobile: 18rem;">
	<AppSidebar />
	<Sidebar.Inset class="min-w-0">
		<header class="sticky top-0 z-30 flex h-14 items-center border-b bg-background/95 px-4 backdrop-blur">
			<Sidebar.Trigger aria-label="Toggle navigation" />
			<Separator orientation="vertical" class="mx-3 h-4!" />
			<a href={resolve('/')} class="flex items-center gap-2 text-sm font-semibold tracking-tight">
				<BookOpenTextIcon class="size-4 text-secondary-foreground" aria-hidden="true" />
				LaTale Tools
			</a>
		</header>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
