<script lang="ts">
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import RouteIcon from '@lucide/svelte/icons/route';
	import SwordsIcon from '@lucide/svelte/icons/swords';
	import DoorOpenIcon from '@lucide/svelte/icons/door-open';
	import InfoIcon from '@lucide/svelte/icons/info';
	import * as Alert from '$lib/components/ui/alert';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import type { ScenarioItem, ScenarioStep } from '$lib/types';

	let {
		step,
		number,
		anchorId,
		language = 'en'
	}: {
		step: ScenarioStep;
		number: number;
		anchorId: string;
		language?: 'en' | 'ko';
	} = $props();

	// The reference stores some line breaks as literal escape sequences.
	function displayText(text: string): string {
		return text.replace(/\\+r\\+n|\\+n|\\+r/g, '\n');
	}
</script>

{#snippet items(title: string, entries: ScenarioItem[])}
	{#if entries.length}
		<section class="flex min-w-0 flex-col gap-2" aria-label={title}>
			<h4 class="text-sm font-medium">{title}</h4>
			<ul class="flex flex-col gap-2">
				{#each entries as item (item)}
					<li class="min-w-0 rounded-lg border border-border px-3 py-2.5">
						{#if item.description}
							<details class="group/item">
								<summary
									class="flex cursor-pointer list-none items-start gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [&::-webkit-details-marker]:hidden"
								>
									<ChevronRightIcon
										class="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-open/item:rotate-90 motion-reduce:transition-none"
										aria-hidden="true"
									/>
									<span lang={language} class="min-w-0 flex-1 break-words">{displayText(item.name)}</span>
									{#if item.count > 0}
										<Badge variant="outline">× {item.count.toLocaleString()}</Badge>
									{/if}
									<span class="sr-only"> — item description</span>
								</summary>
								<p lang={language} class="mt-3 whitespace-pre-line break-words text-muted-foreground">
									{displayText(item.description)}
								</p>
							</details>
						{:else}
							<div class="flex items-start gap-2">
								<span lang={language} class="min-w-0 flex-1 break-words">{displayText(item.name)}</span>
								{#if item.count > 0}
									<Badge variant="outline">× {item.count.toLocaleString()}</Badge>
								{/if}
							</div>
						{/if}
						{#if item.npc || item.place}
							<p class="mt-2 text-xs text-muted-foreground">
								Given by <span lang={language}>{item.npc || '—'}</span>
								{#if item.place} · <span lang={language}>{item.place}</span>{/if}
							</p>
						{/if}
						{#if item.obtainedFrom}
							<div class="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
								<p>Obtained in <span lang={language}>{item.obtainedFrom.stepName}</span></p>
								{#if item.obtainedFrom.npc || item.obtainedFrom.place}
									<p lang={language}>
										{[item.obtainedFrom.npc, item.obtainedFrom.place].filter(Boolean).join(' · ')}
									</p>
								{/if}
								{#if item.obtainedFrom.method}
									<p lang={language}>{displayText(item.obtainedFrom.method)}</p>
								{/if}
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/if}
{/snippet}

<article id={anchorId} aria-labelledby={`${anchorId}-title`} class="scroll-mt-24">
	<Card.Root>
		<Card.Header>
			<Card.Description>Step {number}</Card.Description>
			<Card.Title>
				<h3 id={`${anchorId}-title`} lang={language}>{displayText(step.name)}</h3>
			</Card.Title>
		</Card.Header>
		<Card.Content class="flex flex-col gap-5">
			{#if step.startNpc || step.startPlace || step.endNpc || step.endPlace}
				<dl class="grid gap-3 rounded-lg bg-muted/50 p-3 sm:grid-cols-2">
					{#if step.startNpc || step.startPlace}
						<div class="flex items-start gap-2">
							<MapPinIcon class="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
							<div class="min-w-0">
								<dt class="text-xs text-muted-foreground">Start</dt>
								<dd class="mt-1 flex flex-col gap-0.5 break-words" lang={language}>
									{#if step.startNpc}<span class="font-medium">{step.startNpc}</span>{/if}
									{#if step.startPlace}<span>{step.startPlace}</span>{/if}
								</dd>
							</div>
						</div>
					{/if}
					{#if step.endNpc || step.endPlace}
						<div class="flex items-start gap-2">
							<MapPinIcon class="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
							<div class="min-w-0">
								<dt class="text-xs text-muted-foreground">Turn in</dt>
								<dd class="mt-1 flex flex-col gap-0.5 break-words" lang={language}>
									{#if step.endNpc}<span class="font-medium">{step.endNpc}</span>{/if}
									{#if step.endPlace}<span>{step.endPlace}</span>{/if}
								</dd>
							</div>
						</div>
					{/if}
				</dl>
			{/if}

			{#if step.objective}
				<section class="flex flex-col gap-2" aria-label="Objective">
					<h4 class="text-sm font-medium">Objective</h4>
					<p lang={language} class="whitespace-pre-line break-words leading-7">{displayText(step.objective)}</p>
				</section>
			{/if}

			{#if step.targets.monsters.length || step.targets.dungeons.length}
				<div class="grid gap-4 sm:grid-cols-2">
					{#if step.targets.monsters.length}
						<section class="flex min-w-0 flex-col gap-2" aria-label="Monsters">
							<h4 class="flex items-center gap-2 text-sm font-medium">
								<SwordsIcon class="size-4 text-muted-foreground" aria-hidden="true" /> Monsters
							</h4>
							<ul class="flex flex-col gap-1.5" lang={language}>
								{#each step.targets.monsters as monster, index (`${step.id}-monster-${index}-${monster}`)}
									<li class="break-words">{monster}</li>
								{/each}
							</ul>
						</section>
					{/if}
					{#if step.targets.dungeons.length}
						<section class="flex min-w-0 flex-col gap-2" aria-label="Dungeons">
							<h4 class="flex items-center gap-2 text-sm font-medium">
								<DoorOpenIcon class="size-4 text-muted-foreground" aria-hidden="true" /> Dungeons
							</h4>
							<ul class="flex flex-col gap-3">
								{#each step.targets.dungeons as dungeon (dungeon)}
									<li class="flex flex-col gap-1">
										<p lang={language} class="break-words">{dungeon.name}</p>
										{#if dungeon.entrance}
											<p class="text-xs text-muted-foreground">Entrance: <span lang={language}>{dungeon.entrance}</span></p>
										{/if}
										{#if dungeon.partySize > 0}
											<p class="text-xs text-muted-foreground">Party size: {dungeon.partySize}</p>
										{/if}
									</li>
								{/each}
							</ul>
						</section>
					{/if}
				</div>
			{/if}

			{#if step.travel.length}
				<section class="flex flex-col gap-3" aria-label="Travel">
					<h4 class="flex items-center gap-2 text-sm font-medium">
						<RouteIcon class="size-4 text-muted-foreground" aria-hidden="true" /> Travel
					</h4>
					<ul class="flex flex-col gap-3">
						{#each step.travel as travel (travel)}
							<li class="flex min-w-0 flex-col gap-1.5 border-l-2 border-border pl-3">
								<p lang={language} class="break-words font-medium">{travel.destination}</p>
								<ol class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-muted-foreground" lang={language}>
									{#each travel.steps as instruction, index (`${travel.destination}-${index}-${instruction}`)}
										<li class="flex min-w-0 items-center gap-1.5">
											{#if index > 0}<ChevronRightIcon class="size-3 shrink-0" aria-hidden="true" />{/if}
											<span class="whitespace-pre-line break-words">{displayText(instruction)}</span>
										</li>
									{/each}
								</ol>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			{@render items('Quest items', step.targets.items)}
			{@render items('Given during this step', step.grantedItems)}
			{@render items('Consumed items', step.consumedItems)}
			{@render items('Rewards', step.rewardItems)}

			{#if step.notes.length}
				<Alert.Root>
					<InfoIcon aria-hidden="true" />
					<Alert.Title>Notes</Alert.Title>
					<Alert.Description>
						<ul class="flex flex-col gap-2" lang={language}>
							{#each step.notes as note, index (`${step.id}-note-${index}-${note}`)}
								<li class="whitespace-pre-line break-words">{displayText(note)}</li>
							{/each}
						</ul>
					</Alert.Description>
				</Alert.Root>
			{/if}
		</Card.Content>
	</Card.Root>
</article>
