<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import BookOpenTextIcon from '@lucide/svelte/icons/book-open-text';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { getActiveTool, toolCount, toolNavigation } from '$lib/tool-navigation';

	const sidebar = Sidebar.useSidebar();
	let activeTool = $derived(getActiveTool(page.url.pathname));

	function isActive(href: string): boolean {
		return href === '/'
			? page.url.pathname === href
			: page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}

	function closeMobile(): void {
		sidebar.setOpenMobile(false);
	}
</script>

<Sidebar.Root class="app-sidebar-root" collapsible="icon">
	<Sidebar.Header
		class="app-sidebar-header"
		style={`--route-accent: ${activeTool.accent}; --route-soft: ${activeTool.soft}; --route-deep: ${activeTool.deep};`}
	>
		<a href={resolve('/')} class="app-brand" aria-label="LaTale Tools home">
			<span class="app-brand__mark" aria-hidden="true">
				<BookOpenTextIcon />
				<i></i>
			</span>
			<span class="app-brand__copy">
				<small>Community field kit</small>
				<strong>LaTale Tools</strong>
			</span>
		</a>
		<div class="app-brand-spectrum" aria-hidden="true">
			{#each toolNavigation as tool (tool.href)}
				<span style={`--spectrum-color: ${tool.accent}`}></span>
			{/each}
		</div>
	</Sidebar.Header>

	<Sidebar.Content class="app-sidebar-content">
		<nav class="app-sidebar-nav" aria-label="Tool navigation">
			<Sidebar.Group class="app-navigation-group">
			<Sidebar.GroupLabel class="app-navigation-label">
				<span>Index</span>
				<span>{String(toolCount).padStart(2, '0')} utilities</span>
			</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu class="app-navigation">
					{#each toolNavigation as tool (tool.href)}
						<Sidebar.MenuItem
							class="tool-nav-item"
							style={`--item-accent: ${tool.accent}; --item-soft: ${tool.soft}; --item-deep: ${tool.deep};`}
						>
							<Sidebar.MenuButton
								class="tool-nav-button"
								size="lg"
								isActive={isActive(tool.href)}
								tooltipContent={`${tool.index} · ${tool.label}`}
							>
								{#snippet child({ props })}
									<a
										href={resolve(tool.href)}
										aria-current={isActive(tool.href) ? 'page' : undefined}
										aria-label={`${tool.label}: ${tool.description}`}
										{...props}
										class={['tool-nav-button', props.class]}
										onclick={closeMobile}
									>
										<span class="tool-nav-code">{tool.index}</span>
										<span class="tool-nav-icon"><tool.icon aria-hidden="true" /></span>
										<span class="tool-nav-copy">
											<strong>{tool.label}</strong>
											<small>{tool.description}</small>
										</span>
										<span class="tool-nav-verb">{tool.verb}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
			</Sidebar.Group>

			<Sidebar.Group class="app-reference-group">
			<Sidebar.GroupLabel class="app-reference-label">Reference</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton class="app-reference-button" tooltipContent="Korean fan wiki">
							{#snippet child({ props })}
								<a
									href="https://latale.wiki/scenario-script"
									target="_blank"
									rel="noreferrer"
									aria-label="Open Korean fan wiki in a new tab"
									{...props}
									onclick={closeMobile}
								>
									<ExternalLinkIcon aria-hidden="true" />
									<span>Korean fan wiki</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
			</Sidebar.Group>
		</nav>
	</Sidebar.Content>

	<Sidebar.Footer
		class="app-sidebar-footer"
		style={`--route-accent: ${activeTool.accent}; --route-soft: ${activeTool.soft}; --route-deep: ${activeTool.deep};`}
	>
		<div class="active-tool-card">
			<div class="active-tool-card__portrait">
				<img src={activeTool.image} alt="" aria-hidden="true" />
			</div>
			<div class="active-tool-card__copy">
				<small>Now in focus · {activeTool.index}</small>
				<strong>{activeTool.label}</strong>
				<span>{activeTool.verb} with confidence</span>
			</div>
		</div>
		<p class="app-disclaimer">
			Unofficial fan project. LaTale and its assets belong to Actoz Soft and their respective owners.
		</p>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
