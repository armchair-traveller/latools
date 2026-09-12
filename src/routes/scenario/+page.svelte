<script lang="ts">
	import { tick } from 'svelte';
	import { afterNavigate, pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import LinkIcon from '@lucide/svelte/icons/link';
	import MapIcon from '@lucide/svelte/icons/map';
	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';
	import ScenarioStep from '$lib/components/scenario-step.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Empty from '$lib/components/ui/empty';
	import * as Field from '$lib/components/ui/field';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Select from '$lib/components/ui/select';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { createScenarioSearch, filterScenarios, scenarioLevel, scenarioSelection, scenarioText } from '$lib/scenario-guide.js';
	import type { ScenarioGuide, ScenarioQuest, ScenarioType } from '$lib/types';

	let { data }: { data: { guide: ScenarioGuide; englishQuests: ScenarioQuest[] } } = $props();
	const language = $derived(page.state.scenarioLanguage ?? (page.url.searchParams.get('lang') === 'ko' ? 'ko' : 'en'));
	const guide = $derived({ ...data.guide, quests: language === 'ko' ? data.guide.quests : data.englishQuests });
	const searchIndex = $derived(createScenarioSearch(data.englishQuests, data.guide.quests));
	const chapters = $derived([...new Set(guide.quests.map((quest) => quest.chapter))].sort((a, b) => a - b));
	const stepCount = $derived(guide.quests.reduce((total, quest) => total + quest.steps.length, 0));
	const mainCount = $derived(guide.quests.filter((quest) => quest.type === 'main').length);
	const sideCount = $derived(guide.quests.length - mainCount);

	let query = $state('');
	let type = $state<ScenarioType | 'all'>('main');
	let chapter = $state('all');
	let selectedId = $state<number | null>(null);
	let shareMessage = $state('');
	const filtered = $derived(filterScenarios(guide.quests, searchIndex, { query, type, chapter }));
	const selected = $derived(filtered.find((quest) => quest.id === selectedId) ?? filtered[0]);
	const selectedPosition = $derived(selected ? filtered.findIndex((quest) => quest.id === selected.id) : -1);
	const sourceLink = $derived(`${guide.sourceUrl}${selected ? `#quest-${selected.id}` : ''}`);

	function writeSelection(id: number | undefined, replace = false) {
		const state = { ...page.state, scenarioLanguage: language };
		if (replace) replaceState(resolve(`/scenario?lang=${language}#${id ? `quest-${id}` : ''}`), state);
		else if (window.location.hash !== `#quest-${id}`) pushState(resolve(`/scenario?lang=${language}#quest-${id}`), state);
	}

	function setLanguage(value: string) {
		if (value !== 'en' && value !== 'ko') return;
		replaceState(resolve(`/scenario?lang=${value}${window.location.hash}`), { ...page.state, scenarioLanguage: value });
		shareMessage = '';
	}

	function updateFilters(next: { query?: string; type?: string; chapter?: string }) {
		const previousId = selected?.id;
		if (next.query !== undefined) query = next.query;
		if (next.type === 'all' || next.type === 'main' || next.type === 'sub') type = next.type;
		if (next.chapter) chapter = next.chapter;
		selectedId = filtered.find((quest) => quest.id === previousId)?.id ?? filtered[0]?.id ?? null;
		shareMessage = '';
		writeSelection(selectedId ?? undefined, true);
	}

	async function selectQuest(value: string, scroll = false) {
		const quest = filtered.find((entry) => entry.id === Number(value));
		if (!quest) return;
		selectedId = quest.id;
		shareMessage = '';
		writeSelection(quest.id);
		if (scroll) {
			await tick();
			document.getElementById(`quest-${quest.id}`)?.scrollIntoView({ block: 'start' });
		}
	}

	async function restoreSelection() {
		const selection = scenarioSelection(window.location.hash, guide.quests);
		if (!selection) {
			if (!window.location.hash) {
				query = '';
				type = 'main';
				chapter = 'all';
				selectedId = null;
			}
			return;
		}
		const quest = guide.quests.find((entry) => entry.id === selection.questId)!;
		if (!filtered.some((entry) => entry.id === quest.id)) {
			query = '';
			type = quest.type;
			chapter = 'all';
		}
		selectedId = quest.id;
		shareMessage = '';
		await tick();
		if (selection.stepId) document.getElementById(`step-${selection.stepId}`)?.scrollIntoView({ block: 'start' });
	}

	async function copyLink() {
		if (!selected) return;
		const url = new URL(resolve('/scenario'), window.location.origin);
		url.hash = `quest-${selected.id}`;
		if (language === 'ko') url.searchParams.set('lang', 'ko');
		try {
			await navigator.clipboard.writeText(url.href);
			shareMessage = 'Scenario link copied.';
		} catch {
			writeSelection(selected.id, true);
			shareMessage = 'Copy the scenario link from your browser’s address bar.';
		}
	}

	afterNavigate(() => { void restoreSelection(); });
</script>

<svelte:window onhashchange={() => void restoreSelection()} onpopstate={() => void restoreSelection()} />

<svelte:head>
	<title>Scenario Guide · LaTale Tools</title>
	<meta name="description" content="Find LaTale scenario quests and follow every step, NPC, dungeon, travel route, and item requirement in English, translated from the original Korean guide." />
	<meta property="og:title" content="LaTale Scenario Guide" />
	<meta property="og:description" content="A searchable walkthrough of 143 main and side scenarios, with locations, objectives, travel directions, and rewards." />
</svelte:head>

<main class="scenario-guide">
	<header class="guide-header">
		<div>
			<p class="eyebrow"><MapIcon aria-hidden="true" /> Quest walkthrough</p>
			<h1>Scenario guide</h1>
			<p class="intro">Find your quest. Follow the route, from the first conversation to the final reward.</p>
		</div>
		<div class="archive-meta">
			<p><strong>{guide.quests.length}</strong> scenarios <span aria-hidden="true">·</span> <strong>{stepCount.toLocaleString('en-US')}</strong> steps</p>
			<p>Source updated <time datetime={guide.updated}>{guide.updated}</time></p>
			<Badge variant="outline">{language === 'en' ? 'English translation' : 'Original Korean'}</Badge>
		</div>
	</header>

	<section aria-label="Find a scenario" class="filters">
		<Field.FieldGroup>
			<div class="search-row">
				<Field.Field>
					<Field.FieldLabel for="scenario-search">Search the guide</Field.FieldLabel>
					<InputGroup.Root>
						<InputGroup.Input id="scenario-search" type="search" placeholder="Quest, map, NPC, dungeon, monster, or item…" value={query} oninput={(event) => updateFilters({ query: event.currentTarget.value })} />
						<InputGroup.Addon><SearchIcon aria-hidden="true" /></InputGroup.Addon>
						{#if query}
							<InputGroup.Addon align="inline-end"><InputGroup.Button aria-label="Clear search" onclick={() => updateFilters({ query: '' })}><XIcon aria-hidden="true" /></InputGroup.Button></InputGroup.Addon>
						{/if}
					</InputGroup.Root>
					<Field.FieldDescription>Search in English or Korean, in either language view.</Field.FieldDescription>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel id="scenario-type-label">Scenario type</Field.FieldLabel>
					<ToggleGroup.Root type="single" variant="outline" value={type} onValueChange={(value) => updateFilters({ type: value })} aria-labelledby="scenario-type-label">
						<ToggleGroup.Item value="all">All</ToggleGroup.Item>
						<ToggleGroup.Item value="main">Main · {mainCount}</ToggleGroup.Item>
						<ToggleGroup.Item value="sub">Side · {sideCount}</ToggleGroup.Item>
					</ToggleGroup.Root>
				</Field.Field>
			</div>
			<Field.Field orientation="responsive">
				<Field.FieldLabel id="chapter-label">Chapter</Field.FieldLabel>
				<ToggleGroup.Root type="single" variant="outline" value={chapter} onValueChange={(value) => updateFilters({ chapter: value })} aria-labelledby="chapter-label" class="flex-wrap">
					<ToggleGroup.Item value="all">All chapters</ToggleGroup.Item>
					{#each chapters as number (number)}
						<ToggleGroup.Item value={String(number)}>Chapter {number}</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</Field.Field>
			<Field.Field orientation="responsive">
				<Field.FieldLabel id="scenario-language-label">Text language</Field.FieldLabel>
				<ToggleGroup.Root type="single" variant="outline" value={language} onValueChange={setLanguage} aria-labelledby="scenario-language-label">
					<ToggleGroup.Item value="en">English</ToggleGroup.Item>
					<ToggleGroup.Item value="ko">Korean</ToggleGroup.Item>
				</ToggleGroup.Root>
			</Field.Field>
		</Field.FieldGroup>
	</section>

	<p class="results-count" role="status">{filtered.length} {filtered.length === 1 ? 'scenario' : 'scenarios'} found{query ? ` for “${query}”` : ''}</p>

	{#if selected}
		<div class="quest-picker">
			<Field.Field>
				<Field.FieldLabel for="scenario-picker">Choose a scenario</Field.FieldLabel>
				<Select.Root type="single" value={String(selected.id)} onValueChange={(value) => void selectQuest(value)}>
					<Select.Trigger id="scenario-picker" class="w-full"><span class="truncate">Chapter {selected.chapter} · <span lang={language}>{selected.name}</span> · {scenarioLevel(selected)}</span></Select.Trigger>
					<Select.Content>
						{#each chapters as number (number)}
							{@const chapterQuests = filtered.filter((quest) => quest.chapter === number)}
							{#if chapterQuests.length}
								<Select.Group>
									<Select.Label>Chapter {number}</Select.Label>
									{#each chapterQuests as quest (quest.id)}
										<Select.Item value={String(quest.id)} label={quest.name}><span lang={language}>{quest.name}</span> · {scenarioLevel(quest)}{type === 'all' ? ` · ${quest.type === 'main' ? 'Main' : 'Side'}` : ''}</Select.Item>
									{/each}
								</Select.Group>
							{/if}
						{/each}
					</Select.Content>
				</Select.Root>
			</Field.Field>
			<div class="quest-arrows">
				<Button variant="outline" size="icon" aria-label="Previous scenario" disabled={selectedPosition <= 0} onclick={() => void selectQuest(String(filtered[selectedPosition - 1].id))}><ArrowLeftIcon /></Button>
				<Button variant="outline" size="icon" aria-label="Next scenario" disabled={selectedPosition >= filtered.length - 1} onclick={() => void selectQuest(String(filtered[selectedPosition + 1].id))}><ArrowRightIcon /></Button>
			</div>
		</div>

		{#key selected.id}
			<section id={`quest-${selected.id}`} class="quest-section" aria-labelledby="quest-title">
				<Card.Root>
					<Card.Header>
						<div class="quest-meta"><Badge variant="secondary">{selected.type === 'main' ? 'Main' : 'Side'} scenario</Badge><span>Chapter {selected.chapter}</span><span>{scenarioLevel(selected)}</span></div>
						<Card.Title><h2 id="quest-title" lang={language}>{selected.name}</h2></Card.Title>
						<Card.Description>{selected.steps.length} steps · Follow in the order below</Card.Description>
					</Card.Header>
					<Card.Content>
						{#if selected.requirements.length}
							<div class="requirements"><h3>Before you start</h3><ul lang={language}>{#each selected.requirements as requirement, index (`${selected.id}-requirement-${index}`)}<li>{scenarioText(requirement)}</li>{/each}</ul></div>
						{/if}
						<details class="step-index">
							<summary>Jump to a step <span>({selected.steps.length})</span></summary>
							<ol>{#each selected.steps as step (step.id)}<li><a href={resolve(`/scenario?lang=${language}#step-${step.id}`)} lang={language}>{step.name}</a></li>{/each}</ol>
						</details>
					</Card.Content>
					<Card.Footer class="flex-wrap gap-2">
						<Button variant="outline" size="sm" onclick={() => void copyLink()}><LinkIcon data-icon="inline-start" /> Copy scenario link</Button>
						<Button variant="ghost" size="sm" href={sourceLink} target="_blank" rel="noreferrer">View original <ExternalLinkIcon data-icon="inline-end" /></Button>
						<p class="share-status" role="status">{shareMessage}</p>
					</Card.Footer>
				</Card.Root>

				<div class="walkthrough" aria-label="Scenario steps">
					{#each selected.steps as step, index (step.id)}
						<ScenarioStep {step} {language} number={index + 1} anchorId={`step-${step.id}`} />
					{/each}
				</div>
			</section>
		{/key}

		<nav class="bottom-navigation" aria-label="Scenario navigation">
			<Button variant="outline" disabled={selectedPosition <= 0} onclick={() => void selectQuest(String(filtered[selectedPosition - 1].id), true)}><ArrowLeftIcon data-icon="inline-start" /> Previous scenario</Button>
			<span>{selectedPosition + 1} / {filtered.length}</span>
			<Button variant="outline" disabled={selectedPosition >= filtered.length - 1} onclick={() => void selectQuest(String(filtered[selectedPosition + 1].id), true)}>Next scenario <ArrowRightIcon data-icon="inline-end" /></Button>
		</nav>
	{:else}
		<Empty.Root class="min-h-72 border">
			<Empty.Header><Empty.Media variant="icon"><SearchIcon /></Empty.Media><Empty.Title>No scenarios found</Empty.Title><Empty.Description>Try a quest, location, or NPC name in English or Korean, or broaden your filters.</Empty.Description></Empty.Header>
			<Empty.Content><Button variant="outline" onclick={() => updateFilters({ query: '', type: 'all', chapter: 'all' })}>Reset filters</Button></Empty.Content>
		</Empty.Root>
	{/if}

	<footer class="guide-footer">
		<p>Walkthrough content from <a href="https://latale.wiki/progression/scenario" target="_blank" rel="noreferrer">RamuWiki</a>. English community translation. The original Korean text is available through the language selector.</p>
		<p>Source refreshed <time datetime={guide.generatedAt}>{guide.generatedAt.slice(0, 10)}</time>. LaTale content belongs to Actoz Soft and its respective rights holders.</p>
	</footer>
</main>

<style>
	.scenario-guide { width: min(100%, 1120px); margin-inline: auto; padding: 2.5rem 2rem; color: var(--foreground); }
	.guide-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 2rem; padding-bottom: 1.8rem; border-bottom: 1px solid var(--border); }
	.eyebrow { display: flex; align-items: center; gap: .5rem; margin-bottom: .7rem; color: var(--muted-foreground); font-size: .8rem; font-weight: 600; }
	.eyebrow :global(svg) { width: 1rem; height: 1rem; }
	h1 { font-size: clamp(1.8rem, 3vw, 2.5rem); font-weight: 700; letter-spacing: -.04em; line-height: 1.15; }
	.intro { max-width: 35rem; margin-top: .8rem; color: var(--muted-foreground); line-height: 1.7; }
	.archive-meta { display: flex; flex-direction: column; align-items: flex-end; gap: .5rem; flex-shrink: 0; font-size: .75rem; color: var(--muted-foreground); }
	.archive-meta strong { color: var(--foreground); font-weight: 600; }
	.filters { padding: 1.6rem 0 1rem; }
	.search-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 1.5rem; align-items: start; }
	.results-count { margin: .3rem 0 1rem; font-size: .8rem; color: var(--muted-foreground); overflow-wrap: anywhere; }
	.quest-picker { display: flex; align-items: flex-end; gap: .75rem; margin-bottom: 1.5rem; }
	.quest-arrows { display: flex; gap: .4rem; padding-bottom: 1px; }
	.quest-section { scroll-margin-top: 5rem; }
	.quest-meta { display: flex; align-items: center; flex-wrap: wrap; gap: .7rem; color: var(--muted-foreground); font-size: .75rem; margin-bottom: .5rem; }
	h2 { font-size: 1.5rem; line-height: 1.5; overflow-wrap: anywhere; }
	.requirements { display: flex; flex-direction: column; gap: .5rem; }
	.requirements h3 { font-size: .8rem; font-weight: 600; }
	.requirements ul { list-style: disc; padding-left: 1.25rem; font-size: .875rem; line-height: 1.8; white-space: pre-line; }
	.step-index { margin-top: 1.25rem; font-size: .8rem; }
	.step-index summary { cursor: pointer; width: fit-content; font-weight: 600; }
	.step-index summary span { color: var(--muted-foreground); font-weight: 400; }
	.step-index ol { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .55rem 2rem; list-style: decimal; padding: 1rem 0 0 1.5rem; }
	.step-index a { text-underline-offset: 3px; }
	.step-index a:hover { text-decoration: underline; }
	.share-status { color: var(--muted-foreground); font-size: .75rem; }
	.walkthrough { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
	.bottom-navigation { display: flex; justify-content: space-between; align-items: center; gap: .75rem; margin-block: 1.5rem; }
	.bottom-navigation > span { font-size: .75rem; color: var(--muted-foreground); }
	.guide-footer { margin-top: 2rem; padding-top: 1.25rem; border-top: 1px solid var(--border); font-size: .75rem; line-height: 1.8; color: var(--muted-foreground); }
	.guide-footer a { text-decoration: underline; text-underline-offset: 3px; }
	@media (max-width: 680px) {
		.scenario-guide { padding: 1.5rem 1rem; }
		.guide-header { flex-direction: column; gap: 1rem; }
		.archive-meta { align-items: flex-start; }
		.search-row { grid-template-columns: 1fr; gap: 1rem; }
		.quest-picker { flex-wrap: wrap; }
		.quest-picker > :global([data-slot='field']) { flex-basis: 100%; }
		.quest-arrows { margin-left: auto; }
		.step-index ol { grid-template-columns: 1fr; }
		.bottom-navigation { flex-wrap: wrap; }
		.bottom-navigation > span { display: none; }
	}
</style>
