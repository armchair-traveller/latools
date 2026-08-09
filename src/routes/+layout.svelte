<script lang="ts">
	import { page } from '$app/state';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { getActiveTool, lastToolIndex } from '$lib/tool-navigation';
	import './layout.css';

	let { children, data } = $props();
	let activeTool = $derived(getActiveTool(page.url.pathname));
	let sidebarOpen = $derived(data.sidebarOpen);
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<meta name="theme-color" content="#fbfaf7" />
</svelte:head>

<Sidebar.Provider
	bind:open={sidebarOpen}
	class="shell-provider"
	data-route={activeTool.key}
	style={`--sidebar-width: 19rem; --sidebar-width-icon: 5rem; --route-accent: ${activeTool.accent}; --route-soft: ${activeTool.soft}; --route-deep: ${activeTool.deep};`}
>
	<AppSidebar />
	<Sidebar.Inset class="shell-inset min-w-0">
		<header class="shell-topbar">
			<div class="shell-topbar__inner">
				<div class="shell-topbar__leading">
					<Sidebar.Trigger class="shell-menu-trigger" aria-label="Toggle navigation" />
				</div>

				<div class="shell-route-identity">
					<div class="shell-route-icon" aria-hidden="true">
						<activeTool.icon />
					</div>
					<div class="shell-route-copy">
						<p>{activeTool.index} · {activeTool.verb}</p>
						<p class="shell-route-title">{activeTool.label}</p>
					</div>
				</div>

				<div class="shell-topbar__trailing">
					<div class="shell-route-context">
						<span>Current utility</span>
						<strong>{activeTool.context}</strong>
					</div>
					<span class="shell-route-count">{activeTool.index} / {lastToolIndex}</span>
					<img class="shell-route-portrait" src={activeTool.image} alt="" aria-hidden="true" />
				</div>

				<div class="shell-route-motif" aria-hidden="true"></div>
			</div>
			<div class="shell-route-line" aria-hidden="true"></div>
		</header>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
