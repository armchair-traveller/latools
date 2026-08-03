<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import BookOpenTextIcon from '@lucide/svelte/icons/book-open-text';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import HouseIcon from '@lucide/svelte/icons/house';
	import ShoppingBasketIcon from '@lucide/svelte/icons/shopping-basket';
	import * as Sidebar from '$lib/components/ui/sidebar';

	const sidebar = Sidebar.useSidebar();

	const navigation = [
		{ label: 'Home', href: '/', icon: HouseIcon },
		{ label: 'Scenario scripts', href: '/scenario-script', icon: BookOpenTextIcon },
		{ label: 'Event exchange', href: '/event-exchange', icon: ShoppingBasketIcon }
	] as const;

	function isActive(href: string): boolean {
		return href === '/' ? page.url.pathname === href : page.url.pathname.startsWith(href);
	}

	function closeMobile(): void {
		sidebar.setOpenMobile(false);
	}
</script>

<Sidebar.Root collapsible="offcanvas">
	<Sidebar.Header class="border-b border-sidebar-border p-4">
		<div class="flex items-center gap-3">
			<div class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
				<BookOpenTextIcon class="size-5" aria-hidden="true" />
			</div>
			<div class="min-w-0 flex-1">
				<p class="truncate font-semibold tracking-tight">LaTale Tools</p>
				<p class="truncate text-xs text-muted-foreground">English fan utilities</p>
			</div>
		</div>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Tools</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each navigation as item (item.href)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={isActive(item.href)} tooltipContent={item.label}>
								{#snippet child({ props })}
									<a href={resolve(item.href)} {...props} onclick={closeMobile}>
										<item.icon aria-hidden="true" />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<Sidebar.Group>
			<Sidebar.GroupLabel>Source</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton tooltipContent="Korean fan wiki">
							{#snippet child({ props })}
								<a
									href="https://latale.wiki/scenario-script"
									target="_blank"
									rel="noreferrer"
									{...props}
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
	</Sidebar.Content>

	<Sidebar.Footer class="border-t border-sidebar-border p-4">
		<p class="text-xs leading-relaxed text-muted-foreground">
			Unofficial fan project. LaTale and its assets belong to Actoz Soft and their respective
			owners.
		</p>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
