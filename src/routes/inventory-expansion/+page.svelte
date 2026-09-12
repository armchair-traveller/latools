<script lang="ts">
	import { onMount } from 'svelte';
	import BackpackIcon from '@lucide/svelte/icons/backpack';
	import CheckCheckIcon from '@lucide/svelte/icons/check-check';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import InfoIcon from '@lucide/svelte/icons/info';
	import SearchIcon from '@lucide/svelte/icons/search';
	import Undo2Icon from '@lucide/svelte/icons/undo-2';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import * as Alert from '$lib/components/ui/alert';
	import * as Card from '$lib/components/ui/card';
	import * as Empty from '$lib/components/ui/empty';
	import * as Field from '$lib/components/ui/field';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import snapshot from '$lib/data/inventory-expansion.json';
	import {
		bagLabels, filterInventoryEntries, inventorySources, inventoryStorageKey,
		inventoryTypes, readInventoryProgress, totalInventorySlots,
		type BagType, type InventoryEntry, type InventorySource
	} from '$lib/inventory-expansion.js';

	const entries = snapshot.entries as InventoryEntry[];
	const bagOrder: BagType[] = ['all', 'equipment', 'consumables', 'etc', 'event', 'storage'];
	let source = $state<InventorySource>('guide');
	let query = $state('');
	let hideCompleted = $state(false);
	let completed = $state<string[]>([]);
	let previous = $state<string[] | null>(null);
	let storageReady = $state(false);
	let storageError = $state(false);
	let announcement = $state('');
	let activeSource = $derived(inventorySources.find((entry) => entry.id === source)!);
	let sourceEntries = $derived(entries.filter((entry) => entry.source === source));
	let completedSet = $derived(new Set(completed));
	let checkedEntries = $derived(sourceEntries.filter((entry) => completedSet.has(entry.id)));
	let availableSlots = $derived(totalInventorySlots(sourceEntries));
	let checkedSlots = $derived(totalInventorySlots(checkedEntries));
	let visibleEntries = $derived(filterInventoryEntries(entries, { source, query, hideCompleted, completed }));
	let groups = $derived(source === 'guide'
		? bagOrder.map((type) => ({ id: type, title: `${bagLabels[type]} bags`, entries: visibleEntries.filter((entry) => entry.rewards[type]) })).filter((group) => group.entries.length)
		: [{ id: source, title: activeSource.label, entries: visibleEntries }]);
	let progress = $derived(Math.round(checkedEntries.length / sourceEntries.length * 100));

	onMount(() => {
		try {
			completed = readInventoryProgress(localStorage.getItem(inventoryStorageKey), entries);
		} catch {
			storageError = true;
		}
		storageReady = true;
	});

	function persist(next: string[]) {
		completed = next;
		try {
			localStorage.setItem(inventoryStorageKey, JSON.stringify({ version: 1, completed: next }));
			storageError = false;
		} catch {
			storageError = true;
		}
	}

	function setCompleted(ids: string[], checked: boolean) {
		previous = [...completed];
		const changed = new Set(ids);
		persist(checked ? [...new Set([...completed, ...ids])] : completed.filter((id) => !changed.has(id)));
		announcement = `${ids.length} ${ids.length === 1 ? 'source' : 'sources'} marked ${checked ? 'complete' : 'incomplete'}.`;
	}

	function undo() {
		if (!previous) return;
		persist(previous);
		previous = null;
		announcement = 'Last checklist change undone.';
	}

	function selectSource(value: string) {
		if (inventorySources.some((entry) => entry.id === value)) source = value as InventorySource;
	}

	function rewardList(entry: InventoryEntry) {
		return bagOrder.filter((type) => entry.rewards[type]).map((type) => ({ type, count: entry.rewards[type]! }));
	}
</script>

<svelte:head>
	<title>Inventory Expansion · LaTale Tools</title>
	<meta name="description" content="Find LaTale inventory expansion bags in English. Track guidebook, story, dungeon, Burning 4000, and event rewards with a saved checklist." />
	<meta property="og:title" content="Inventory Expansion · LaTale Tools" />
	<meta property="og:description" content="Make room for your next adventure. An English inventory bag guide with search, slot totals, and saved progress." />
</svelte:head>

<main class="inventory-page">
	<header class="inventory-hero">
		<div>
			<p class="eyebrow">The adventurer’s checklist</p>
			<h1>Inventory expansion</h1>
			<p class="intro">Make room for your next adventure. Find free expansion bags and keep track of the rewards you’ve collected.</p>
			<div class="hero-details">
				<Badge variant="secondary">English guide</Badge>
				<span>{entries.length} reward sources</span>
				<Button href={snapshot.sourceUrl} target="_blank" rel="noreferrer" variant="link" size="sm">
					RamuWiki source <ExternalLinkIcon data-icon="inline-end" />
				</Button>
			</div>
		</div>
		<div class="bag-emblem" aria-hidden="true">
			<BackpackIcon />
			<span>+4</span>
		</div>
	</header>

	<section class="checklist" aria-labelledby="checklist-title">
		<div class="section-heading">
			<div>
				<p class="eyebrow">01 / Find your rewards</p>
				<h2 id="checklist-title">A little more space, one quest at a time.</h2>
			</div>
			<p class="save-status" role="status">
				{storageError ? 'Browser saving unavailable. Changes last until you leave this page.' : storageReady ? 'Progress saved in this browser · one checklist' : 'Loading saved progress…'}
			</p>
		</div>

		<div class="source-picker">
			<ToggleGroup.Root type="single" bind:value={() => source, selectSource} variant="outline" spacing={2} class="flex-wrap" aria-label="Reward source">
				{#each inventorySources as option (option.id)}
					<ToggleGroup.Item value={option.id}>{option.label}</ToggleGroup.Item>
				{/each}
			</ToggleGroup.Root>
		</div>

		<div class="progress-panel">
			<div class="progress-heading">
				<div>
					<h3>{activeSource.label}</h3>
					<p>{activeSource.description}</p>
				</div>
				<p class="progress-count"><strong>{checkedEntries.length}</strong> / {sourceEntries.length}<span>sources completed</span></p>
			</div>
			<progress value={checkedEntries.length} max={sourceEntries.length} aria-label={`${activeSource.label} completion`}>{progress}%</progress>
			<div class="slot-totals" aria-label="Slots from checked rewards in this source">
				{#each inventoryTypes as inventory (inventory.id)}
					<div>
						<p>{inventory.label}</p>
						<strong>+{checkedSlots[inventory.id]} <span>/ {availableSlots[inventory.id]}</span></strong>
						<small>slots collected / available</small>
					</div>
				{/each}
			</div>
			<p class="totals-note">Totals are for {activeSource.label.toLowerCase()} rewards, before inventory limits. Check a source after collecting all its listed bags.</p>
		</div>

		{#if source === 'limited' || source === 'burning'}
			<Alert.Root>
				<InfoIcon />
				<Alert.Title>{source === 'limited' ? 'Check the event dates' : 'Burning 4000 rewards'}</Alert.Title>
				<Alert.Description>
					{#if source === 'limited'}
						These rewards are event-dependent and may no longer be obtainable. They are not part of the permanent guidebook or quest totals.
					{:else}
						All 18 stages give four bags of each inventory type and two all-in-one bags: +24 slots per character inventory, +96 slots in total. Availability depends on your server’s Burning program.
					{/if}
				</Alert.Description>
			</Alert.Root>
		{/if}

		<Field.FieldGroup class="filter-fields">
			<Field.Field>
				<Field.FieldLabel for="inventory-search">Search this source</Field.FieldLabel>
				<Input id="inventory-search" type="search" placeholder="Quest, area, NPC, or bag type…" bind:value={query} />
			</Field.Field>
			<Field.Field orientation="horizontal" class="hide-field">
				<Switch id="hide-completed" bind:checked={hideCompleted} />
				<Field.FieldLabel for="hide-completed">Hide completed</Field.FieldLabel>
			</Field.Field>
		</Field.FieldGroup>

		<div class="list-toolbar">
			<p aria-live="polite">{visibleEntries.length} {visibleEntries.length === 1 ? 'source' : 'sources'} shown</p>
			<div class="list-actions">
				<Button variant="outline" size="sm" disabled={!storageReady || !visibleEntries.some((entry) => !completedSet.has(entry.id))} onclick={() => setCompleted(visibleEntries.map((entry) => entry.id), true)}>
					<CheckCheckIcon data-icon="inline-start" /> Complete shown
				</Button>
				<Button variant="ghost" size="sm" disabled={!storageReady || !visibleEntries.some((entry) => completedSet.has(entry.id))} onclick={() => setCompleted(visibleEntries.map((entry) => entry.id), false)}>Clear shown</Button>
				<Button variant="ghost" size="sm" disabled={!previous} onclick={undo}><Undo2Icon data-icon="inline-start" /> Undo</Button>
			</div>
		</div>
		<p class="sr-only" role="status">{announcement}</p>

		{#if visibleEntries.length === 0}
			<Empty.Root class="border">
				<Empty.Header>
					<Empty.Media variant="icon"><SearchIcon /></Empty.Media>
					<Empty.Title>{hideCompleted && checkedEntries.length === sourceEntries.length ? 'All done in this section' : 'No matching rewards'}</Empty.Title>
					<Empty.Description>Try another search or show completed sources.</Empty.Description>
				</Empty.Header>
				<Empty.Content><Button variant="outline" onclick={() => { query = ''; hideCompleted = false; }}>Reset filters</Button></Empty.Content>
			</Empty.Root>
		{:else}
			<div class="reward-groups" data-guide={source === 'guide'}>
				{#each groups as group (group.id)}
					<Card.Root class="reward-card">
						<Card.Header>
							<Card.Title><h3>{group.title}</h3></Card.Title>
							<Card.Description>{group.entries.length} {group.entries.length === 1 ? 'source' : 'sources'} shown</Card.Description>
						</Card.Header>
						<Card.Content>
							<Field.FieldSet>
								<Field.FieldLegend class="sr-only">{group.title}</Field.FieldLegend>
								<Field.FieldGroup class="reward-list">
									{#each group.entries as entry (entry.id)}
										<div class="reward-row" data-complete={completedSet.has(entry.id)}>
											<Field.Field orientation="horizontal">
												<Checkbox id={entry.id} disabled={!storageReady} checked={completedSet.has(entry.id)} onCheckedChange={(checked) => setCompleted([entry.id], checked)} aria-describedby={`${entry.id}-rewards`} />
												<Field.FieldContent>
													<Field.FieldLabel for={entry.id}>{entry.title}</Field.FieldLabel>
													{#if entry.level || entry.location || entry.note}
														<Field.FieldDescription>{[entry.level, entry.location, entry.note].filter(Boolean).join(' · ')}</Field.FieldDescription>
													{/if}
													<div id={`${entry.id}-rewards`} class="reward-badges">
														{#each rewardList(entry) as reward (reward.type)}
															<Badge variant="outline">{bagLabels[reward.type]} ×{reward.count}</Badge>
														{/each}
													</div>
												</Field.FieldContent>
											</Field.Field>
										</div>
									{/each}
									</Field.FieldGroup>
							</Field.FieldSet>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		{/if}
	</section>

	<section class="bag-guide" aria-labelledby="bag-guide-title">
		<div class="section-heading">
			<div><p class="eyebrow">02 / Know your bags</p><h2 id="bag-guide-title">How expansion works</h2></div>
		</div>
		<div class="bag-rules">
			{#each [
				{ title: 'Individual bag', amount: '+4 slots', detail: 'Adds space to the named inventory. Maximum 240 slots per category.' },
				{ title: 'All-in-one bag', amount: '+4 to each', detail: 'Expands Equipment, Consumables, Etc., and Event together.' },
				{ title: 'Storage bag', amount: '+4 slots', detail: 'Expands regular storage, up to 480 slots. Shared across the server.' },
				{ title: 'Memorial storage', amount: '+4 slots', detail: 'Expands Memorial storage, up to 400 slots.' }
			] as rule (rule.title)}
				<div><h3>{rule.title}</h3><strong>{rule.amount}</strong><p>{rule.detail}</p></div>
			{/each}
		</div>
		<Alert.Root>
			<InfoIcon />
			<Alert.Title>Use all-in-one bags before a category is full</Alert.Title>
			<Alert.Description>If any of the four inventories is at its limit, you cannot use an all-in-one bag. Exchange it for individual bags with Toma on the GM Event Map. Storage and pet inventory expansions apply across the server, rather than to one character.</Alert.Description>
		</Alert.Root>
	</section>

	<footer class="source-note">
		<p>Translated from <a href="https://latale.wiki/inventory-expansion" target="_blank" rel="noreferrer">RamuWiki’s inventory expansion guide</a> · Source reviewed July 27, 2026.</p>
		<p>This is a translation of the Korean guide. Quest names and reward availability may differ on the Global service. Search also accepts the original Korean names.</p>
	</footer>
</main>

<style>
	.inventory-page { max-width: 1240px; margin: 0 auto; padding: 36px 36px 28px; color: var(--foreground); }
	.inventory-hero { display: flex; align-items: center; justify-content: space-between; gap: 36px; padding: 12px 0 34px; border-bottom: 1px solid var(--border); }
	.eyebrow { margin: 0 0 10px; color: var(--route-deep); font-size: 10px; font-weight: 750; letter-spacing: .15em; text-transform: uppercase; }
	h1 { margin: 0; font-family: SerifDisplayPro, Georgia, serif; font-size: clamp(2.5rem, 4.5vw, 4.25rem); font-weight: 500; letter-spacing: -.04em; line-height: 1.08; }
	.intro { max-width: 610px; margin: 18px 0 12px; color: var(--muted-foreground); font-size: 15px; line-height: 1.7; }
	.hero-details { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; font-size: 12px; color: var(--muted-foreground); }
	.bag-emblem { position: relative; display: grid; place-items: center; flex-shrink: 0; width: 140px; aspect-ratio: 1; border: 1px solid var(--border); border-radius: 28px; background: var(--route-soft); color: var(--route-deep); transform: rotate(6deg); }
	.bag-emblem :global(svg) { width: 70px; height: 70px; stroke-width: 1.1; }
	.bag-emblem span { position: absolute; right: -10px; bottom: 12px; padding: 5px 14px; border: 1px solid var(--border); border-radius: 7px; background: var(--card); font-size: 22px; font-weight: 700; transform: rotate(-6deg); }
	.checklist, .bag-guide { display: flex; flex-direction: column; gap: 22px; margin-top: 30px; }
	.section-heading { display: flex; justify-content: space-between; align-items: end; gap: 24px; }
	h2 { margin: 0; font-family: SerifDisplayPro, Georgia, serif; font-size: 25px; font-weight: 500; line-height: 1.3; }
	.save-status { max-width: 200px; margin: 0; color: var(--muted-foreground); font-size: 11px; line-height: 1.6; text-align: right; }
	.progress-panel { overflow: hidden; padding: 22px; border: 1px solid var(--border); border-radius: 14px; background: var(--card); }
	.progress-heading { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
	.progress-heading h3 { margin: 0 0 6px; font-size: 16px; font-weight: 650; }
	.progress-heading p { margin: 0; color: var(--muted-foreground); font-size: 12px; line-height: 1.6; }
	.progress-heading .progress-count { min-width: 140px; text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
	.progress-count strong { color: var(--foreground); font-size: 28px; line-height: 1; font-weight: 650; }
	.progress-count span { display: block; font-size: 10px; }
	progress { display: block; width: 100%; height: 5px; margin: 16px 0 22px; border: none; border-radius: 4px; overflow: hidden; background: var(--muted); color: var(--route-accent); accent-color: var(--route-accent); }
	progress::-webkit-progress-bar { background: var(--muted); }
	progress::-webkit-progress-value { background: var(--route-accent); }
	progress::-moz-progress-bar { background: var(--route-accent); }
	.slot-totals { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 16px; }
	.slot-totals > div { padding-left: 16px; border-left: 1px solid var(--border); }
	.slot-totals > div:first-child { padding-left: 0; border-left: 0; }
	.slot-totals p { margin: 0 0 6px; font-size: 12px; color: var(--muted-foreground); }
	.slot-totals strong { font-size: 27px; font-weight: 600; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
	.slot-totals strong span { font-size: 15px; color: var(--muted-foreground); font-weight: 400; }
	.slot-totals small { display: block; margin-top: 3px; font-size: 9px; color: var(--muted-foreground); }
	.totals-note { margin: 18px 0 0; font-size: 11px; line-height: 1.6; color: var(--muted-foreground); }
	:global(.filter-fields) { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 24px; align-items: end; }
	:global(.hide-field) { width: auto; min-height: 36px; padding-bottom: 4px; }
	.list-toolbar, .list-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
	.list-toolbar { justify-content: space-between; margin-top: -8px; }
	.list-toolbar p { margin: 0; font-size: 12px; color: var(--muted-foreground); }
	.reward-groups { display: grid; grid-template-columns: 1fr; gap: 20px; align-items: start; }
	.reward-groups[data-guide='true'] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
	:global(.reward-card) { min-width: 0; }
	:global(.reward-list) { gap: 0; }
	.reward-row { padding: 15px 0; border-bottom: 1px solid var(--border); }
	.reward-row:first-child { padding-top: 0; }
	.reward-row:last-child { padding-bottom: 0; border-bottom: 0; }
	.reward-row[data-complete='true'] :global([data-slot='field-label']) { color: var(--muted-foreground); text-decoration: line-through; }
	.reward-badges { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
	.bag-guide { margin-top: 42px; padding-top: 28px; border-top: 1px solid var(--border); }
	.bag-rules { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
	.bag-rules h3 { margin: 0 0 8px; font-size: 12px; font-weight: 550; }
	.bag-rules strong { font-family: SerifDisplayPro, Georgia, serif; font-size: 24px; color: var(--route-deep); font-weight: 500; }
	.bag-rules p { margin: 8px 0 0; color: var(--muted-foreground); font-size: 12px; line-height: 1.7; }
	.source-note { margin-top: 28px; padding-top: 18px; border-top: 1px solid var(--border); color: var(--muted-foreground); font-size: 11px; line-height: 1.8; }
	.source-note p { margin: 0 0 4px; }
	.source-note a { color: var(--foreground); text-decoration: underline; text-underline-offset: 3px; }
	@media (max-width: 1050px) {
		.inventory-page { padding: 28px 24px; }
		.bag-emblem { width: 105px; }
		.bag-emblem :global(svg) { width: 54px; height: 54px; }
		.slot-totals { gap: 10px; }
		.slot-totals > div { padding-left: 10px; }
		.slot-totals strong { font-size: 24px; }
		.slot-totals small { font-size: 8px; }
	}
	@media (max-width: 700px) {
		.inventory-page { padding: 22px 16px; }
		.inventory-hero { gap: 12px; padding-top: 0; }
		.bag-emblem { display: none; }
		.section-heading { align-items: start; flex-direction: column; gap: 10px; }
		.save-status { text-align: left; max-width: none; }
		.progress-panel { padding: 18px; }
		.progress-heading { align-items: start; gap: 12px; }
		.progress-heading .progress-count { min-width: 88px; }
		.slot-totals { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px 10px; }
		.slot-totals > div:nth-child(4) { border-left: 0; padding-left: 0; }
		.slot-totals small { font-size: 9px; }
		:global(.filter-fields) { grid-template-columns: 1fr; gap: 14px; }
		.reward-groups[data-guide='true'] { grid-template-columns: 1fr; }
		.bag-rules { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		.list-toolbar { gap: 14px; }
	}
</style>
