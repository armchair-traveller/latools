<script lang="ts">
	import { tick } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import { resolve } from '$app/paths';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BookOpenTextIcon from '@lucide/svelte/icons/book-open-text';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import LinkIcon from '@lucide/svelte/icons/link';
	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';
	import ScenarioDialogue from '$lib/components/scenario-dialogue.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Empty from '$lib/components/ui/empty';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Select from '$lib/components/ui/select';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { filterScriptStories, scenarioScriptText, scriptLevel } from '$lib/scenario-script.js';
	import type { ArchiveIndex, Story, StoryMeta, StoryType } from '$lib/scenario-script-types';

	let { data }: { data: { archive: ArchiveIndex; story: Story; language: 'en' | 'ko'; stepId: number; translationPending: boolean } } = $props();
	const archive = $derived(data.archive);
	const story = $derived(data.story);
	const language = $derived(data.language);
	const selectedMeta = $derived(archive.index.find((entry) => entry.id === story.id));
	const stepIndex = $derived(Math.max(0, story.steps.findIndex((step) => step.id === data.stepId)));
	const step = $derived(story.steps[stepIndex]);
	const mainCount = $derived(archive.index.filter((entry) => entry.type === 'main').length);
	const sideCount = $derived(archive.index.length - mainCount);
	const lineCount = $derived(archive.index.reduce((total, entry) => total + entry.lineCount, 0));
	const sourceUrl = $derived(archive.sourceUrl ?? 'https://latale.wiki/scenario-script');
	const chapters = $derived([...new Set(archive.index.map((entry) => entry.chapter))].sort((a, b) => a - b));
	const busy = $derived(navigating.to?.route.id === '/scenario-script');

	let query = $state('');
	let type = $state<'all' | StoryType>('all');
	let chapter = $state('all');
	let playerName = $state('');
	let shareMessage = $state('');
	const filtered = $derived(filterScriptStories(archive.index, { query, type, chapter }));
	const storyPosition = $derived(filtered.findIndex((entry) => entry.id === story.id));
	const groupedStories = $derived(chapters.map((number) => ({ chapter: number, stories: filtered.filter((entry) => entry.chapter === number) })).filter((group) => group.stories.length));

	function titleFor(meta: StoryMeta) {
		return language === 'ko' ? meta.originalName ?? meta.name : meta.name;
	}

	function storyUrl(id: number, stepId?: number, textLanguage = language) {
		const params = new URLSearchParams({ story: String(id) });
		if (stepId !== undefined) params.set('step', String(stepId));
		if (textLanguage === 'ko') params.set('lang', 'ko');
		return resolve(`/scenario-script?${params.toString()}`);
	}

	async function navigateStory(id: number, stepId?: number, textLanguage = language, scroll = false) {
		shareMessage = '';
		await goto(storyUrl(id, stepId, textLanguage), { noScroll: true, keepFocus: true });
		if (scroll) {
			await tick();
			document.getElementById('story-reader')?.scrollIntoView({ block: 'start', behavior: 'instant' });
		}
	}

	function changeLanguage(value: string) {
		if (value === 'en' || value === 'ko') void navigateStory(story.id, step?.id, value);
	}

	function setType(value: string) {
		if (value === 'all' || value === 'main' || value === 'sub') type = value;
	}

	function resetFilters() {
		query = '';
		type = 'all';
		chapter = 'all';
	}

	async function copyLink() {
		const url = new URL(storyUrl(story.id, step?.id), page.url.origin);
		try {
			await navigator.clipboard.writeText(url.href);
			shareMessage = step ? 'Link copied to this step.' : 'Story link copied.';
		} catch {
			await goto(url, { noScroll: true, keepFocus: true, replaceState: true });
			shareMessage = 'Copy the link from your browser’s address bar.';
		}
	}

	afterNavigate(() => {
		if (!filtered.some((entry) => entry.id === story.id)) resetFilters();
		shareMessage = '';
	});
</script>

<svelte:head>
	<title>Scenario Scripts · LaTale Tools</title>
	<meta name="description" content="Read LaTale’s main and side scenario scripts in English, with character portraits, dialogue choices, and the original Korean text." />
	<meta property="og:title" content="LaTale Scenario Scripts" />
	<meta property="og:description" content="Explore LaTale’s story, one conversation at a time. Search the English dialogue archive by story and chapter." />
</svelte:head>

<main class="scenario-archive">
	<header class="archive-header">
		<div class="header-copy">
			<p class="eyebrow"><BookOpenTextIcon aria-hidden="true" /> The story archive</p>
			<h1>Scenario scripts</h1>
			<p class="intro">Return to a favorite chapter. Follow every conversation, and every choice along the way.</p>
		</div>
		<div class="archive-meta">
			<div class="archive-numbers"><p><strong>{archive.index.length}</strong><span>stories</span></p><p><strong>{lineCount.toLocaleString('en-US')}</strong><span>dialogue lines</span></p></div>
			<Badge variant="outline">Community English translation</Badge>
			{#if archive.translation && !archive.translation.complete}<p class="translation-progress">{archive.translation.completeStoryIds.length} of {archive.index.length} stories translated</p>{/if}
		</div>
	</header>

	<section class="archive-filters" aria-label="Find a story">
		<Field.FieldGroup class="filter-grid">
			<Field.Field>
				<Field.FieldLabel for="story-search">Find a story</Field.FieldLabel>
				<InputGroup.Root>
					<InputGroup.Input id="story-search" type="search" placeholder="Search English or Korean titles…" bind:value={query} />
					<InputGroup.Addon><SearchIcon aria-hidden="true" /></InputGroup.Addon>
					{#if query}<InputGroup.Addon align="inline-end"><InputGroup.Button aria-label="Clear search" onclick={() => query = ''}><XIcon aria-hidden="true" /></InputGroup.Button></InputGroup.Addon>{/if}
				</InputGroup.Root>
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel id="story-type-label">Story type</Field.FieldLabel>
				<ToggleGroup.Root type="single" variant="outline" value={type} onValueChange={setType} aria-labelledby="story-type-label">
					<ToggleGroup.Item value="all">All</ToggleGroup.Item>
					<ToggleGroup.Item value="main">Main · {mainCount}</ToggleGroup.Item>
					<ToggleGroup.Item value="sub">Side · {sideCount}</ToggleGroup.Item>
				</ToggleGroup.Root>
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="chapter-filter">Chapter</Field.FieldLabel>
				<Select.Root type="single" bind:value={chapter}>
					<Select.Trigger id="chapter-filter" class="w-full"><span class="truncate">{chapter === 'all' ? 'All chapters' : `Chapter ${chapter}`}</span></Select.Trigger>
					<Select.Content><Select.Group><Select.Item value="all">All chapters</Select.Item>{#each chapters as number (number)}<Select.Item value={String(number)}>Chapter {number}</Select.Item>{/each}</Select.Group></Select.Content>
				</Select.Root>
			</Field.Field>
		</Field.FieldGroup>
	</section>

	<div class="results-row"><p role="status">{filtered.length} {filtered.length === 1 ? 'story' : 'stories'}{query ? ` matching “${query}”` : ' in the archive'}</p><span>Read in English, or explore the original Korean text.</span></div>

	{#if filtered.length}
		<div class="mobile-story-picker">
			<Field.Field>
				<Field.FieldLabel for="story-picker">Choose a story</Field.FieldLabel>
				<Select.Root type="single" value={String(story.id)} onValueChange={(value) => { if (value) void navigateStory(Number(value)); }}>
					<Select.Trigger id="story-picker" class="w-full"><span class="truncate" lang={language}>{story.name}</span></Select.Trigger>
					<Select.Content>
						{#each groupedStories as group (group.chapter)}<Select.Group><Select.Label>Chapter {group.chapter}</Select.Label>{#each group.stories as entry (entry.id)}<Select.Item value={String(entry.id)} label={titleFor(entry)}><span lang={language}>{titleFor(entry)}</span></Select.Item>{/each}</Select.Group>{/each}
					</Select.Content>
				</Select.Root>
			</Field.Field>
		</div>

		<div class="archive-layout">
			<aside class="story-library" aria-label="Story library">
				<Card.Root>
					<Card.Header><Card.Title>Chapters & stories</Card.Title><Card.Description>Choose where your journey begins.</Card.Description></Card.Header>
					<Card.Content class="px-2">
						<nav class="story-groups" aria-label="Stories by chapter">
							{#each groupedStories as group (group.chapter)}
								<details class="chapter-group" open={!!query || group.chapter === story.chapter}>
									<summary><span><strong>Chapter {group.chapter}</strong><span>{archive.chapters[String(group.chapter)] ?? ''}</span></span><span class="chapter-count">{group.stories.length}<ChevronDownIcon aria-hidden="true" /></span></summary>
									<ul class="story-list">
										{#each group.stories as entry (entry.id)}
											<li><Button variant={entry.id === story.id ? 'secondary' : 'ghost'} class="h-auto min-h-14 w-full justify-start px-3 py-2" aria-current={entry.id === story.id ? 'page' : undefined} onclick={() => void navigateStory(entry.id)}><span class="story-item"><span class="story-title" lang={language}>{titleFor(entry)}</span><span class="story-info">{entry.type === 'main' ? 'Main' : 'Side'} <span aria-hidden="true">·</span> {scriptLevel(entry)} <span aria-hidden="true">·</span> {entry.stepCount} {entry.stepCount === 1 ? 'step' : 'steps'}</span></span></Button></li>
										{/each}
									</ul>
								</details>
							{/each}
						</nav>
					</Card.Content>
					<Card.Footer><p class="library-note">Browse titles in either language.</p></Card.Footer>
				</Card.Root>
			</aside>

			<section id="story-reader" class="story-reader" aria-labelledby="story-title" aria-busy={busy}>
				<Card.Root>
					<Card.Header>
						<div class="story-meta"><Badge variant="secondary">{story.type === 'main' ? 'Main' : 'Side'} scenario</Badge><span>Chapter {story.chapter}</span>{#if selectedMeta}<span>{scriptLevel(selectedMeta)}</span>{/if}</div>
						<Card.Title><h2 id="story-title" lang={language}>{story.name}</h2></Card.Title>
						<Card.Description>{selectedMeta?.stepCount ?? story.steps.length} {(selectedMeta?.stepCount ?? story.steps.length) === 1 ? 'step' : 'steps'}{selectedMeta ? ` · ${selectedMeta.lineCount.toLocaleString('en-US')} dialogue lines` : ''}</Card.Description>
					</Card.Header>
					<Card.Content>
						<Field.FieldGroup class="reader-settings">
							<Field.Field>
								<Field.FieldLabel id="script-language-label">Text language</Field.FieldLabel>
								<ToggleGroup.Root type="single" variant="outline" value={language} onValueChange={changeLanguage} aria-labelledby="script-language-label" disabled={busy}><ToggleGroup.Item value="en">English</ToggleGroup.Item><ToggleGroup.Item value="ko">Korean</ToggleGroup.Item></ToggleGroup.Root>
							</Field.Field>
							<Field.Field>
								<Field.FieldLabel for="player-name">Your character’s name</Field.FieldLabel>
								<Input id="player-name" placeholder="Adventurer" maxlength={40} autocomplete="off" bind:value={playerName} />
							</Field.Field>
						</Field.FieldGroup>
						{#if step}
							<div class="step-picker">
								<Field.Field>
									<Field.FieldLabel for="step-picker">Jump to a step</Field.FieldLabel>
									<Select.Root type="single" value={String(step.id)} onValueChange={(value) => { if (value) void navigateStory(story.id, Number(value)); }} disabled={busy}>
										<Select.Trigger id="step-picker" class="w-full"><span class="truncate" lang={language}>{stepIndex + 1}. {step.name}</span></Select.Trigger>
										<Select.Content><Select.Group>{#each story.steps as entry, index (entry.id)}<Select.Item value={String(entry.id)} label={entry.name}><span lang={language}>{index + 1}. {entry.name}</span></Select.Item>{/each}</Select.Group></Select.Content>
									</Select.Root>
								</Field.Field>
								<div class="step-arrows"><Button variant="outline" size="icon" aria-label="Previous step" disabled={busy || stepIndex <= 0} onclick={() => void navigateStory(story.id, story.steps[stepIndex - 1].id)}><ArrowLeftIcon /></Button><Button variant="outline" size="icon" aria-label="Next step" disabled={busy || stepIndex >= story.steps.length - 1} onclick={() => void navigateStory(story.id, story.steps[stepIndex + 1].id)}><ArrowRightIcon /></Button></div>
							</div>
						{/if}
					</Card.Content>
					<Card.Footer class="flex-wrap gap-2"><Button variant="outline" size="sm" onclick={() => void copyLink()}><LinkIcon data-icon="inline-start" /> {step ? 'Copy step link' : 'Copy story link'}</Button><Button href={sourceUrl} variant="ghost" size="sm" target="_blank" rel="noreferrer">View original <ExternalLinkIcon data-icon="inline-end" /></Button><p class="share-message" role="status">{shareMessage}</p></Card.Footer>
				</Card.Root>

				<p class="sr-only" role="status">{busy ? 'Loading story.' : step ? `${story.name}, step ${stepIndex + 1} of ${story.steps.length}.` : `${story.name}. English translation in progress.`}</p>
				{#if data.translationPending}
					<Empty.Root class="min-h-64 border"><Empty.Header><Empty.Media variant="icon"><BookOpenTextIcon /></Empty.Media><Empty.Title>English translation in progress</Empty.Title><Empty.Description>This story is being translated afresh from Korean. Its original dialogue is available now.</Empty.Description></Empty.Header><Empty.Content><Button variant="outline" onclick={() => changeLanguage('ko')}>Read the Korean original</Button></Empty.Content></Empty.Root>
				{/if}
				{#if step}
					{#key `${story.id}-${step.id}-${language}`}
						<article class="script-step" aria-labelledby="step-title">
							<header class="step-heading"><p>Step {String(stepIndex + 1).padStart(2, '0')} <span>of {String(story.steps.length).padStart(2, '0')}</span></p><h3 id="step-title" lang={language}>{step.name}</h3>{#if step.objective}<p class="step-objective" lang={language}>{scenarioScriptText(step.objective, playerName)}</p>{/if}</header>
							{#if step.scenes.length}
								<div class="scenes">{#each step.scenes as scene, sceneIndex (`${step.id}-${scene.id}-${sceneIndex}`)}<section class="scene" aria-label={`Scene ${sceneIndex + 1}`}><p class="scene-number">Scene {String(sceneIndex + 1).padStart(2, '0')}</p><ScenarioDialogue lines={scene.lines} speakers={archive.speakers} {playerName} {language} sceneId={`${story.id}-${step.id}-${scene.id}-${sceneIndex}`} /></section>{/each}</div>
							{:else}
								<Empty.Root><Empty.Header><Empty.Media variant="icon"><BookOpenTextIcon /></Empty.Media><Empty.Title>No dialogue in this step</Empty.Title><Empty.Description>This part of the story contains an objective only. Continue to the next step to keep reading.</Empty.Description></Empty.Header></Empty.Root>
							{/if}
						</article>
					{/key}
					<nav class="step-navigation" aria-label="Step navigation"><Button variant="outline" disabled={busy || stepIndex <= 0} onclick={() => void navigateStory(story.id, story.steps[stepIndex - 1].id, language, true)}><ArrowLeftIcon data-icon="inline-start" /> Previous step</Button><span>{stepIndex + 1} / {story.steps.length}</span><Button variant="outline" disabled={busy || stepIndex >= story.steps.length - 1} onclick={() => void navigateStory(story.id, story.steps[stepIndex + 1].id, language, true)}>Next step <ArrowRightIcon data-icon="inline-end" /></Button></nav>
				{/if}
				<nav class="story-navigation" aria-label="Story navigation"><Button variant="ghost" size="sm" disabled={busy || storyPosition <= 0} onclick={() => void navigateStory(filtered[storyPosition - 1].id, undefined, language, true)}><ArrowLeftIcon data-icon="inline-start" /> Previous story</Button><span>{storyPosition >= 0 ? `${storyPosition + 1} / ${filtered.length} stories` : 'Current story'}</span><Button variant="ghost" size="sm" disabled={busy || storyPosition < 0 || storyPosition >= filtered.length - 1} onclick={() => void navigateStory(filtered[storyPosition + 1].id, undefined, language, true)}>Next story <ArrowRightIcon data-icon="inline-end" /></Button></nav>
			</section>
		</div>
	{:else}
		<Empty.Root class="min-h-80 border"><Empty.Header><Empty.Media variant="icon"><SearchIcon /></Empty.Media><Empty.Title>No stories found</Empty.Title><Empty.Description>Try a different English or Korean title, or include more chapters and story types.</Empty.Description></Empty.Header><Empty.Content><Button variant="outline" onclick={resetFilters}>Reset filters</Button></Empty.Content></Empty.Root>
	{/if}

	<footer class="archive-footer"><p>Scenario dialogue from <a href={sourceUrl} target="_blank" rel="noreferrer">RamuWiki</a>. Read the original text with the Korean language option.</p>{#if archive.generatedAt}<p>Archive refreshed <time datetime={archive.generatedAt}>{archive.generatedAt.slice(0, 10)}</time>. LaTale content belongs to Actoz Soft and its respective rights holders.</p>{/if}</footer>
</main>

<style>
	.scenario-archive { width: min(100%, 1280px); margin-inline: auto; padding: 2.5rem 2rem; }
	.archive-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 2rem; padding-bottom: 1.75rem; border-bottom: 1px solid var(--border); }
	.header-copy { min-width: 0; }
	.eyebrow { display: flex; align-items: center; gap: .5rem; margin-bottom: .7rem; color: var(--muted-foreground); font-size: .75rem; font-weight: 600; }
	.eyebrow :global(svg) { width: 1rem; height: 1rem; }
	h1 { font-size: clamp(1.8rem, 3vw, 2.5rem); letter-spacing: -.04em; font-weight: 700; line-height: 1.15; }
	.intro { max-width: 35rem; margin-top: .8rem; color: var(--muted-foreground); font-size: .9rem; line-height: 1.7; }
	.archive-meta { display: flex; flex-shrink: 0; flex-direction: column; align-items: flex-end; gap: 1rem; padding-top: .3rem; }
	.archive-numbers { display: flex; gap: 1.6rem; }
	.archive-numbers p { display: flex; flex-direction: column; gap: .2rem; text-align: right; }
	.archive-numbers strong { font-size: 1.45rem; letter-spacing: -.035em; line-height: 1.1; font-weight: 650; }
	.archive-numbers span { font-size: .7rem; color: var(--muted-foreground); }
	.translation-progress { max-width: 16rem; text-align: right; color: var(--muted-foreground); font-size: .72rem; }
	.archive-filters { padding-block: 1.5rem 1rem; }
	.archive-filters :global(input[type='search']::-webkit-search-cancel-button) { -webkit-appearance: none; }
	.archive-filters :global(.filter-grid) { display: grid; grid-template-columns: minmax(0, 1fr) auto 10rem; gap: 1.2rem; }
	.results-row { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .35rem 1rem; margin-bottom: 1.5rem; color: var(--muted-foreground); font-size: .72rem; line-height: 1.6; overflow-wrap: anywhere; }
	.results-row > span { font-size: .67rem; }
	.archive-layout { display: grid; grid-template-columns: 16.5rem minmax(0, 1fr); gap: 1.5rem; align-items: start; }
	.story-library { position: sticky; top: 6.5rem; min-width: 0; }
	.story-groups { max-height: min(65vh, 52rem); overflow-y: auto; scrollbar-width: thin; }
	.chapter-group + .chapter-group { margin-top: .25rem; }
	.chapter-group summary { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .75rem .65rem; cursor: pointer; list-style: none; border-radius: .5rem; }
	.chapter-group summary::-webkit-details-marker { display: none; }
	.chapter-group summary:hover { background: var(--muted); }
	.chapter-group summary > span:first-child { display: flex; flex-direction: column; gap: .2rem; min-width: 0; }
	.chapter-group summary strong { font-size: .8rem; font-weight: 600; }
	.chapter-group summary > span:first-child > span { font-size: .67rem; color: var(--muted-foreground); overflow-wrap: anywhere; }
	.chapter-count { display: flex; align-items: center; gap: .5rem; color: var(--muted-foreground); font-size: .7rem; }
	.chapter-count :global(svg) { width: .9rem; height: .9rem; transform: rotate(-90deg); transition: transform .15s; }
	.chapter-group[open] .chapter-count :global(svg) { transform: rotate(0); }
	.story-list { display: flex; flex-direction: column; gap: .2rem; padding-bottom: .75rem; }
	.story-list li { min-width: 0; }
	.story-item { display: flex; flex-direction: column; gap: .4rem; min-width: 0; text-align: left; }
	.story-title { white-space: normal; overflow-wrap: anywhere; line-height: 1.45; }
	.story-info { display: flex; flex-wrap: wrap; gap: .35rem; font-size: .64rem; font-weight: 400; opacity: .68; }
	.library-note { color: var(--muted-foreground); font-size: .67rem; }
	.story-reader { min-width: 0; scroll-margin-top: 6rem; }
	.story-meta { display: flex; flex-wrap: wrap; align-items: center; gap: .6rem; margin-bottom: .35rem; color: var(--muted-foreground); font-size: .7rem; }
	h2 { font-size: clamp(1.3rem, 2vw, 1.75rem); line-height: 1.4; letter-spacing: -.025em; overflow-wrap: anywhere; }
	.story-reader :global(.reader-settings) { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
	.step-picker { display: flex; align-items: flex-end; gap: .65rem; margin-top: 1.2rem; }
	.step-arrows { display: flex; gap: .35rem; }
	.share-message { color: var(--muted-foreground); font-size: .7rem; }
	.script-step { margin-top: 1.5rem; padding: 1.75rem 1.5rem; border: 1px solid var(--border); border-radius: .75rem; background: var(--card); }
	.step-heading { padding-bottom: 1.5rem; }
	.step-heading > p:first-child { color: var(--foreground); font-size: .7rem; font-weight: 600; text-transform: uppercase; letter-spacing: .09em; }
	.step-heading > p:first-child span { margin-left: .35rem; color: var(--muted-foreground); font-weight: 400; }
	h3 { margin-top: .55rem; font-size: 1.2rem; font-weight: 600; letter-spacing: -.02em; line-height: 1.5; overflow-wrap: anywhere; }
	.step-objective { margin-top: .65rem; color: var(--muted-foreground); font-size: .8rem; line-height: 1.7; white-space: pre-line; overflow-wrap: anywhere; }
	.scenes { display: flex; flex-direction: column; gap: 2rem; }
	.scene { min-width: 0; }
	.scene + .scene { border-top: 1px solid var(--border); padding-top: 1.5rem; }
	.scene-number { margin-bottom: 1.25rem; color: var(--muted-foreground); font-size: .63rem; text-transform: uppercase; letter-spacing: .11em; }
	.step-navigation, .story-navigation { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
	.step-navigation { margin-top: 1rem; }
	.story-navigation { margin-top: 1.5rem; border-top: 1px solid var(--border); padding-top: 1rem; }
	.step-navigation > span, .story-navigation > span { color: var(--muted-foreground); font-size: .7rem; text-align: center; }
	.archive-footer { display: flex; flex-direction: column; gap: .35rem; margin-top: 2.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border); color: var(--muted-foreground); font-size: .68rem; line-height: 1.7; }
	.archive-footer a { text-decoration: underline; text-underline-offset: 3px; }
	.mobile-story-picker { display: none; }
	@media (max-width: 1200px) {
		.scenario-archive { padding-inline: 1.5rem; }
		.archive-layout { grid-template-columns: 14rem minmax(0, 1fr); gap: 1rem; }
		.archive-filters :global(.filter-grid) { grid-template-columns: minmax(0, 1fr) auto; }
		.archive-filters :global(.filter-grid > :last-child) { grid-column: 1 / -1; max-width: 14rem; }
		.archive-numbers { gap: 1rem; }
	}
	@media (max-width: 1050px) {
		.archive-layout { grid-template-columns: minmax(0, 1fr); }
		.story-library { display: none; }
		.mobile-story-picker { display: block; margin-bottom: 1.2rem; }
		.archive-header { gap: 1rem; }
	}
	@media (max-width: 700px) {
		.scenario-archive { padding: 1.75rem 1rem; }
		.archive-header { flex-direction: column; }
		.archive-meta { flex-direction: row; flex-wrap: wrap; width: 100%; align-items: center; justify-content: space-between; margin-top: .3rem; }
		.translation-progress { flex-basis: 100%; max-width: none; text-align: left; }
		.archive-numbers p { text-align: left; }
		.archive-numbers strong { font-size: 1.25rem; }
		.archive-filters :global(.filter-grid) { grid-template-columns: minmax(0, 1fr); gap: 1rem; }
		.archive-filters :global(.filter-grid > :last-child) { max-width: none; }
		.results-row { margin-bottom: 1rem; }
		.script-step { padding: 1.3rem 1rem; }
		.story-navigation > span { display: none; }
	}
	@media (max-width: 400px) {
		.story-reader :global(.reader-settings) { grid-template-columns: minmax(0, 1fr); }
		.step-navigation > span { display: none; }
		.step-arrows { gap: .2rem; }
	}
</style>
