<script lang="ts">
	import { onMount, tick } from 'svelte';
	import BookOpenTextIcon from '@lucide/svelte/icons/book-open-text';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import SearchIcon from '@lucide/svelte/icons/search';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Empty from '$lib/components/ui/empty';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import * as InputGroup from '$lib/components/ui/input-group';
	import { Separator } from '$lib/components/ui/separator';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { cn } from '$lib/utils';
	import type {
		ArchiveIndex,
		DialogueLine,
		RenderEntry,
		Story,
		StoryMeta,
		StoryType
	} from '$lib/types';

	let { data }: { data: { archive: ArchiveIndex } } = $props();

	const archive = $derived(data.archive);
	const sourceUrl = $derived(archive.sourceUrl ?? 'https://latale.wiki/scenario-script');
	const filters: Array<{ key: 'all' | StoryType; label: string }> = [
		{ key: 'all', label: 'All' },
		{ key: 'main', label: 'Main' },
		{ key: 'sub', label: 'Side' }
	];
	const storyTypes: StoryType[] = ['main', 'sub'];

	let selectedId = $state(0);
	let openChapter = $state(0);
	let activeFilter = $state<'all' | StoryType>('all');
	let query = $state('');
	let playerName = $state('');
	let story = $state.raw<Story | null>(null);
	let loading = $state(true);
	let loadError = $state(false);
	let readerPanel = $state<HTMLElement | null>(null);
	let requestController: AbortController | undefined;

	const displayName = $derived(playerName.trim() || 'Adventurer');
	const mainCount = $derived(archive.index.filter((item) => item.type === 'main').length);
	const sideCount = $derived(archive.index.filter((item) => item.type === 'sub').length);
	const lineCount = $derived(archive.index.reduce((total, item) => total + item.lineCount, 0));
	const selectedMeta = $derived(archive.index.find((item) => item.id === selectedId));
	const filteredStories = $derived(
		archive.index.filter((item) => {
			const matchesType = activeFilter === 'all' || item.type === activeFilter;
			const matchesQuery = item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
			return matchesType && matchesQuery;
		})
	);
	const groupedStories = $derived.by(() => {
		const grouped: Record<number, Record<StoryType, StoryMeta[]>> = {};

		for (const item of filteredStories) {
			const chapter = grouped[item.chapter] ?? { main: [], sub: [] };
			chapter[item.type].push(item);
			grouped[item.chapter] = chapter;
		}

		return Object.entries(grouped)
			.map(([chapter, groups]) => [Number(chapter), groups] as const)
			.sort(([a], [b]) => a - b);
	});

	function substitute(value: string): string {
		return value.replaceAll('%s', displayName);
	}

	function storyTypeLabel(type: StoryType): string {
		return type === 'main' ? 'Main' : 'Side';
	}

	function formatNumber(value: number): string {
		return new Intl.NumberFormat('en-US').format(value);
	}

	function flattenLines(lines: DialogueLine[], prefix = 'line'): RenderEntry[] {
		const entries: RenderEntry[] = [];

		lines.forEach((line, lineIndex) => {
			const lineId = `${prefix}-line-${line.id}-${lineIndex}`;
			entries.push({ kind: 'line', line, id: lineId });

			line.choices?.forEach((choice, choiceIndex) => {
				const choiceId = `${lineId}-choice-${choice.goto}-${choiceIndex}`;
				entries.push({ kind: 'choice', text: choice.text, id: choiceId });
				if (choice.lines?.length) {
					entries.push(...flattenLines(choice.lines, choiceId));
				} else {
					entries.push({ kind: 'repeated', id: `${choiceId}-repeated` });
				}
			});
		});

		return entries;
	}

	function cleanChoice(value: string): string {
		const replaced = substitute(value);
		return replaced.replace(/^\s*\d+\s*[.)]?\s*/, '').trim() || replaced.trim();
	}

	function portraitFor(speaker: string): number | undefined {
		return archive.speakers[speaker];
	}

	function setFilter(value: string): void {
		if (value === 'all' || value === 'main' || value === 'sub') activeFilter = value;
	}

	async function selectStory(id: number): Promise<void> {
		if (!id) return;

		requestController?.abort();
		const controller = new AbortController();
		requestController = controller;
		selectedId = id;
		story = null;
		loadError = false;
		loading = true;

		try {
			const response = await fetch(`/data/stories/${id}.json`, { signal: controller.signal });
			if (!response.ok) throw new Error(`Story request failed: ${response.status}`);
			const nextStory = (await response.json()) as Story;
			if (requestController !== controller) return;
			story = nextStory;
			await tick();
			readerPanel?.scrollTo({ top: 0, behavior: 'auto' });
		} catch (error) {
			if (controller.signal.aborted) return;
			loadError = true;
		} finally {
			if (requestController === controller) loading = false;
		}
	}

	onMount(() => {
		const firstStory = archive.index[0];
		if (firstStory) {
			openChapter = firstStory.chapter;
			void selectStory(firstStory.id);
		} else {
			loading = false;
		}

		return () => requestController?.abort();
	});
</script>

<svelte:head>
	<title>Scenario Scripts · LaTale Tools</title>
	<meta
		name="description"
		content="Read LaTale's main and side scenario dialogue in English, organized by chapter."
	/>
	<meta property="og:title" content="LaTale Scenario Scripts" />
	<meta
		property="og:description"
		content="A searchable English archive of LaTale's main and side scenario scripts."
	/>
</svelte:head>

<main class="scenario-folio">
	<header class="scenario-hero">
		<div class="hero-copy">
			<p class="concept-kicker"><span>01</span>The Archivist’s Folio</p>
			<h1>Every journey, bound in one place.</h1>
			<p class="hero-description">
				Revisit LaTale’s main and side stories in a warm reading room made for slow discovery.
			</p>
		</div>

		<div class="hero-art">
			<div class="hero-frame" aria-hidden="true"></div>
			<Avatar.Root class="hero-portrait">
				<Avatar.Image
					src="/npc/741.png"
					alt="Iris Livier"
					class="object-contain [image-rendering:pixelated]"
				/>
				<Avatar.Fallback>IL</Avatar.Fallback>
			</Avatar.Root>
			<div class="hero-mark">
				<BookOpenTextIcon aria-hidden="true" />
				<span>Community edition</span>
			</div>
		</div>
	</header>

	<ul class="archive-stats" aria-label="Archive statistics">
		<li><strong>{formatNumber(archive.index.length)}</strong><span>Stories</span></li>
		<li><strong>{mainCount} / {sideCount}</strong><span>Main · side</span></li>
		<li><strong>{formatNumber(lineCount)}</strong><span>Dialogue lines</span></li>
		<li>
			<strong>{formatNumber(Object.keys(archive.speakers).length)}</strong><span>Characters</span>
		</li>
	</ul>

	<section class="archive-controls" aria-label="Archive controls">
		<div class="controls-heading">
			<p>Browse the archive</p>
			<span>Filter the collection or make the script your own.</span>
		</div>
		<Field.Group class="control-grid">
			<Field.Field>
				<Field.Label>Story path</Field.Label>
				<ToggleGroup.Root
					type="single"
					variant="outline"
					value={activeFilter}
					onValueChange={setFilter}
					aria-label="Story type"
				>
					{#each filters as filter (filter.key)}
						<ToggleGroup.Item value={filter.key} aria-label={`Show ${filter.label} stories`}>
							{filter.label}
						</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</Field.Field>

			<Field.Field>
				<Field.Label for="story-search">Find a story</Field.Label>
				<InputGroup.Root>
					<InputGroup.Addon>
						<SearchIcon aria-hidden="true" />
					</InputGroup.Addon>
					<InputGroup.Input
						id="story-search"
						bind:value={query}
						placeholder="Search titles"
					/>
				</InputGroup.Root>
			</Field.Field>

			<Field.Field>
				<Field.Label for="player-name">Reader name</Field.Label>
				<Input
					id="player-name"
					bind:value={playerName}
					maxlength={20}
					placeholder="Adventurer"
				/>
			</Field.Field>
		</Field.Group>
	</section>

	<div class="story-workspace">
		<Card.Root class="story-browser">
			<Card.Header class="panel-heading story-browser-heading">
				<div class="panel-label">Archive index</div>
				<Card.Title><h2>Choose a story</h2></Card.Title>
				<Card.Description>
					{filteredStories.length === archive.index.length
						? `${archive.index.length} in the archive`
						: `${filteredStories.length} matching ${filteredStories.length === 1 ? 'story' : 'stories'}`}
				</Card.Description>
			</Card.Header>
			<Card.Content
				class="fine-scrollbar story-browser-content"
				tabindex={0}
				role="region"
				aria-label="Story index"
			>
				{#if groupedStories.length === 0}
					<Empty.Root class="min-h-64 border-0">
						<Empty.Header>
							<Empty.Media variant="icon"><SearchIcon aria-hidden="true" /></Empty.Media>
							<Empty.Title>No stories found</Empty.Title>
							<Empty.Description>Try another title or story type.</Empty.Description>
						</Empty.Header>
					</Empty.Root>
				{/if}

				{#each groupedStories as [chapterNumber, groups] (chapterNumber)}
					{@const chapterCount = groups.main.length + groups.sub.length}
					<div class="chapter-group">
						<Button
							variant="ghost"
							size="lg"
							class="chapter-toggle"
							aria-expanded={openChapter === chapterNumber}
							aria-controls={`chapter-${chapterNumber}-stories`}
							onclick={() => (openChapter = openChapter === chapterNumber ? 0 : chapterNumber)}
						>
							<span class="chapter-number">{String(chapterNumber).padStart(2, '0')}</span>
							<span class="chapter-name">
								{archive.chapters[String(chapterNumber)]}
							</span>
							<span class="chapter-count">{chapterCount}</span>
							<ChevronDownIcon
								data-icon="inline-end"
								class={cn('transition-transform', openChapter === chapterNumber && 'rotate-180')}
								aria-hidden="true"
							/>
						</Button>

						{#if openChapter === chapterNumber}
							<div class="chapter-stories" id={`chapter-${chapterNumber}-stories`}>
								{#each storyTypes as type (type)}
									{#if groups[type].length}
										<div class="story-type-group">
											<p class="story-type-label">
												{storyTypeLabel(type)} scenarios
											</p>
											<div class="story-list">
												{#each groups[type] as item (item.id)}
													<Button
														variant={item.id === selectedId ? 'default' : 'ghost'}
														size="lg"
														class="story-row"
														aria-current={item.id === selectedId ? 'true' : undefined}
														title={item.name}
														onclick={() => void selectStory(item.id)}
													>
														<Badge variant="secondary" class="story-type-badge">
															{storyTypeLabel(item.type)}
														</Badge>
														<span class="story-name">{item.name}</span>
														<span class="story-level">Lv{item.level}</span>
													</Button>
												{/each}
											</div>
										</div>
									{/if}
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</Card.Content>
		</Card.Root>

		<p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
			{loading
				? 'Loading story.'
				: loadError
					? 'The selected story could not be loaded.'
					: story
						? `${story.name} loaded.`
						: 'No story selected.'}
		</p>

		<Card.Root class="reader-card" aria-busy={loading}>
			{#if story && !loading}
				<Card.Header class="panel-heading reader-heading">
					<div class="reader-eyebrow">
						<Badge variant="secondary">{storyTypeLabel(story.type)} route</Badge>
						<span>Chapter {String(story.chapter).padStart(2, '0')}</span>
						{#if selectedMeta}<span>Level {selectedMeta.level}</span>{/if}
					</div>
					<Card.Title><h2>{story.name}</h2></Card.Title>
					<Card.Description>
						{archive.chapters[String(story.chapter)]} · {story.steps.length}
						{story.steps.length === 1 ? 'story beat' : 'story beats'}
					</Card.Description>
				</Card.Header>
			{/if}

			<Card.Content
				bind:ref={readerPanel}
				class="fine-scrollbar reader-content"
				tabindex={0}
				role="region"
				aria-label="Story dialogue"
			>
				{#if loading}
					<div class="reader-loading" aria-label="Loading story">
						<Skeleton class="h-6 w-52" />
						<Skeleton class="mt-3 h-4 w-36" />
						<div class="loading-lines">
							{#each Array(5) as _, index (index)}
								<div class="loading-line">
									<Skeleton class="size-10 shrink-0 rounded-full" />
									<div class="loading-copy">
										<Skeleton class="h-3 w-20" />
										<Skeleton class="h-4 w-full max-w-xl" />
									</div>
								</div>
							{/each}
						</div>
					</div>
				{:else if loadError}
					<Empty.Root class="min-h-full border-0">
						<Empty.Header>
							<Empty.Media variant="icon"><CircleAlertIcon aria-hidden="true" /></Empty.Media>
							<Empty.Title>This story could not be loaded</Empty.Title>
							<Empty.Description>The archive data may be temporarily unavailable.</Empty.Description>
						</Empty.Header>
						<Empty.Content>
							<Button onclick={() => void selectStory(selectedId)}>
								<RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
								Try again
							</Button>
						</Empty.Content>
					</Empty.Root>
				{:else if story}
					<article class="story-article">
						{#each story.steps as step, stepIndex (step.id)}
							{#if stepIndex > 0}<Separator class="step-separator" />{/if}
							<section class="story-step">
								<p class="step-index">
									{String(stepIndex + 1).padStart(2, '0')}
								</p>
								<h3 class="step-title">{step.name}</h3>
								{#if step.objective}
									<div class="objective-note">
										<span>Objective</span>
										<p>{substitute(step.objective)}</p>
									</div>
								{/if}

								{#if step.scenes.length === 0}
									<p class="empty-dialogue">This step has no dialogue.</p>
								{:else}
									{#each step.scenes as scene (scene.id)}
										<div class="story-scene">
											{#each flattenLines(scene.lines, `${story.id}-${scene.id}`) as entry (entry.id)}
												{#if entry.kind === 'line'}
													{@const speaker = entry.line.speaker ? substitute(entry.line.speakerName ?? entry.line.speaker) : ''}
													{@const portraitId = entry.line.speaker ? portraitFor(entry.line.speaker) : undefined}
													{#if entry.line.speaker}
														<div class="dialogue-line">
															<Avatar.Root size="lg" class="speaker-avatar">
																{#if portraitId}
																	<Avatar.Image
																		src={`/npc/${portraitId}.png`}
																		alt=""
																		class="[image-rendering:pixelated]"
																	/>
																{/if}
																<Avatar.Fallback>{speaker.slice(0, 2).toUpperCase()}</Avatar.Fallback>
															</Avatar.Root>
															<div class="dialogue-copy">
																<p class="speaker-name">{speaker}</p>
																<p class="dialogue-text">
																	{substitute(entry.line.text)}
																</p>
															</div>
														</div>
													{:else}
														<p class="narration-line">
															{substitute(entry.line.text)}
														</p>
													{/if}
												{:else if entry.kind === 'choice'}
													<div class="dialogue-line player-line">
														<Avatar.Root size="lg" class="speaker-avatar player-avatar">
															<Avatar.Fallback>YOU</Avatar.Fallback>
														</Avatar.Root>
														<div class="dialogue-copy">
															<p class="speaker-name">{displayName}</p>
															<p class="dialogue-text">{cleanChoice(entry.text)}</p>
														</div>
													</div>
												{:else}
													<p class="repeated-line">
														The dialogue after this choice already appeared above.
													</p>
												{/if}
											{/each}
										</div>
									{/each}
								{/if}
							</section>
						{/each}
					</article>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<Separator class="page-separator" />
	<footer class="scenario-footer">
		<p>
			English community archive · Source data updated
			{archive.generatedAt
				? new Date(archive.generatedAt).toLocaleDateString('en-US', { timeZone: 'UTC' })
				: 'from the Korean fan site'}
		</p>
		<Button href={sourceUrl} target="_blank" rel="noreferrer" variant="link" size="sm">
			View original source ↗
		</Button>
	</footer>
</main>

<style>
	.scenario-folio {
		--background: #f1f3f1;
		--foreground: #203027;
		--card: #ffffff;
		--card-foreground: #203027;
		--popover: #ffffff;
		--popover-foreground: #203027;
		--primary: #214d3a;
		--primary-foreground: #fffaf0;
		--secondary: #eee0b8;
		--secondary-foreground: #7b4d18;
		--muted: #e8ece9;
		--muted-foreground: #66716c;
		--accent: #dce8dc;
		--accent-foreground: #214d3a;
		--border: #ccd5d0;
		--input: #c5d0ca;
		--ring: #9b6228;
		--surface-radius: 0.35rem;
		--surface-shadow: 0 18px 45px rgb(30 55 47 / 0.08);
		position: relative;
		min-height: calc(100vh - var(--app-topbar-height, 3.5rem));
		overflow: hidden;
		font-kerning: normal;
		font-variant-ligatures: common-ligatures;
		padding: clamp(1.5rem, 3vw, 2.5rem);
		background-color: var(--background);
		background-image:
			linear-gradient(rgb(255 255 255 / 0.34), rgb(255 255 255 / 0.34)),
			repeating-linear-gradient(0deg, transparent 0 31px, rgb(69 78 56 / 0.035) 31px 32px);
		color: var(--foreground);
	}

	.scenario-folio > * {
		width: min(100%, 82rem);
		margin-inline: auto;
	}

	.scenario-hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 12rem;
		align-items: center;
		gap: clamp(1.5rem, 4vw, 4rem);
		min-height: 9.5rem;
		border-bottom: 1px solid var(--border);
	}

	.hero-copy {
		max-width: 47rem;
	}

	.concept-kicker {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 0 0 0.75rem;
		font-size: 0.72rem;
		font-weight: 750;
		letter-spacing: 0.16em;
		line-height: 1;
		text-transform: uppercase;
		color: var(--secondary-foreground);
	}

	.concept-kicker span {
		display: grid;
		place-items: center;
		min-width: 2.15rem;
		height: 2.15rem;
		border: 1px solid currentColor;
		border-radius: 999px;
		font-variant-numeric: tabular-nums;
	}

	.scenario-hero h1 {
		max-width: 41rem;
		margin: 0;
		font-family: var(--font-serif);
		font-size: clamp(3rem, 4.75vw, 5.2rem);
		font-weight: 500;
		letter-spacing: -0.02em;
		line-height: 0.96;
		text-wrap: balance;
	}

	.hero-description {
		max-width: 42rem;
		margin: 1.125rem 0 0;
		font-size: clamp(0.98rem, 1.35vw, 1.12rem);
		line-height: 1.65;
		color: var(--muted-foreground);
		text-wrap: pretty;
	}

	.hero-art {
		position: relative;
		display: grid;
		place-items: center;
		justify-self: end;
		min-height: 9rem;
	}

	.hero-frame {
		position: absolute;
		inset: 0.15rem 1.3rem;
		border: 1px solid var(--border);
		box-shadow: inset 0 0 0 4px var(--background);
		transform: rotate(3deg);
	}

	.scenario-folio :global(.hero-portrait) {
		position: relative;
		z-index: 1;
		width: 7.75rem;
		height: 7.75rem;
		border-radius: 0;
		background: var(--secondary);
		box-shadow: 0 0 0 6px var(--card), 0 0 0 7px var(--border), 0 16px 30px rgb(76 56 28 / 0.14);
	}

	.hero-mark {
		position: absolute;
		right: -0.5rem;
		bottom: 0;
		z-index: 2;
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.45rem 0.65rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--card);
		box-shadow: 0 8px 20px rgb(0 0 0 / 0.1);
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		line-height: 1;
		text-transform: uppercase;
	}

	.hero-mark :global(svg) {
		width: 0.9rem;
		height: 0.9rem;
	}

	.archive-stats {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0;
		margin-block: 1.25rem 0;
		padding: 0;
		border-bottom: 1px solid var(--border);
		list-style: none;
	}

	.archive-stats li {
		display: flex;
		min-width: 0;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.85rem 1rem;
		border-right: 1px solid var(--border);
	}

	.archive-stats li:last-child {
		border-right: 0;
	}

	.archive-stats strong {
		font-size: 1rem;
		font-weight: 760;
		letter-spacing: -0.025em;
		font-variant-numeric: tabular-nums;
	}

	.archive-stats span {
		min-width: 0;
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.09em;
		text-align: right;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.archive-controls {
		display: grid;
		grid-template-columns: minmax(9rem, 0.55fr) minmax(0, 2fr);
		align-items: end;
		gap: 1.5rem;
		margin-top: 0.9rem;
		padding: 1rem 1.1rem;
		border-bottom: 1px solid var(--border);
	}

	.controls-heading p {
		margin: 0;
		font-size: 0.88rem;
		font-weight: 760;
		letter-spacing: -0.02em;
	}

	.controls-heading span {
		display: block;
		max-width: 15rem;
		margin-top: 0.2rem;
		font-size: 0.7rem;
		line-height: 1.45;
		color: var(--muted-foreground);
	}

	.scenario-folio :global(.control-grid) {
		display: grid;
		grid-template-columns: auto minmax(10rem, 1fr) minmax(10rem, 0.8fr);
		align-items: end;
		gap: 0.85rem;
	}

	.archive-controls :global([data-slot='field-label']) {
		font-size: 0.66rem;
		font-weight: 720;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.archive-controls :global([data-slot='toggle-group']) {
		width: 100%;
	}

	.archive-controls :global([data-slot='toggle-group-item']) {
		flex: 1;
	}

	.story-workspace {
		display: grid;
		grid-template-columns: minmax(18rem, 20rem) minmax(0, 1fr);
		align-items: start;
		gap: 1rem;
		margin-top: 1rem;
	}

	.scenario-folio :global(.story-browser),
	.scenario-folio :global(.reader-card) {
		height: min(68vh, 43rem);
		min-height: 35rem;
		gap: 0;
		overflow: hidden;
		padding-block: 0;
		border-radius: var(--surface-radius);
		background: var(--card);
		box-shadow: var(--surface-shadow);
	}

	.scenario-folio :global(.story-browser) {
		background: color-mix(in oklab, var(--card) 90%, var(--muted));
	}

	.scenario-folio :global(.reader-card) {
		box-shadow: 0 22px 55px rgb(30 55 47 / 0.1), inset 0 0 0 7px #ffffff;
	}

	.scenario-folio :global(.panel-heading) {
		flex: none;
		gap: 0.3rem;
		padding: 1rem 1.15rem;
		border-bottom: 1px solid var(--border);
		background: color-mix(in oklab, var(--card) 92%, var(--muted));
	}

	.panel-label {
		font-size: 0.62rem;
		font-weight: 760;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--secondary-foreground);
	}

	.scenario-folio :global(.panel-heading [data-slot='card-title']) {
		font-size: 1.05rem;
		letter-spacing: -0.025em;
	}

	.scenario-folio :global(.panel-heading [data-slot='card-description']) {
		font-size: 0.72rem;
		line-height: 1.45;
	}

	.scenario-folio :global(.story-browser-content) {
		min-height: 0;
		flex: 1;
		overflow-y: auto;
		padding: 0.6rem;
	}

	.chapter-group + .chapter-group {
		margin-top: 0.25rem;
	}

	.scenario-folio :global(.chapter-toggle) {
		display: grid;
		width: 100%;
		height: auto;
		grid-template-columns: 2rem minmax(0, 1fr) auto auto;
		justify-content: stretch;
		gap: 0.55rem;
		padding: 0.7rem;
	}

	.chapter-number {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.7rem;
		font-weight: 760;
		font-variant-numeric: tabular-nums;
		color: var(--secondary-foreground);
	}

	.chapter-name {
		min-width: 0;
		overflow: hidden;
		font-weight: 680;
		letter-spacing: -0.015em;
		text-align: left;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chapter-count,
	.story-level {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.65rem;
		font-variant-numeric: tabular-nums;
		color: var(--muted-foreground);
	}

	.chapter-stories,
	.story-type-group,
	.story-list {
		display: flex;
		flex-direction: column;
	}

	.chapter-stories {
		gap: 0.85rem;
		padding: 0.35rem 0.15rem 0.7rem;
	}

	.story-type-group {
		gap: 0.2rem;
	}

	.story-list {
		gap: 0.15rem;
	}

	.story-type-label {
		margin: 0;
		padding: 0.35rem 0.65rem;
		font-size: 0.59rem;
		font-weight: 760;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.scenario-folio :global(.story-row) {
		display: grid;
		width: 100%;
		height: auto;
		grid-template-columns: auto minmax(0, 1fr) auto;
		justify-content: stretch;
		gap: 0.55rem;
		padding: 0.52rem 0.62rem;
	}

	.scenario-folio :global(.story-type-badge) {
		min-width: 2.75rem;
		justify-content: center;
		font-size: 0.58rem;
	}

	.story-name {
		min-width: 0;
		overflow: hidden;
		font-size: 0.76rem;
		font-weight: 620;
		letter-spacing: -0.01em;
		text-align: left;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.scenario-folio :global(.story-row[aria-current='true'] .story-level) {
		color: var(--primary-foreground);
	}

	.scenario-folio :global(.reader-heading) {
		padding: 1.1rem 2rem;
		background: color-mix(in oklab, var(--card) 90%, var(--muted));
	}

	.reader-eyebrow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.65rem;
		margin-bottom: 0.1rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.scenario-folio :global(.reader-heading [data-slot='card-title']) {
		font-family: var(--font-serif);
		font-size: clamp(1.75rem, 2.6vw, 2.375rem);
		font-weight: 500;
		letter-spacing: -0.012em;
		line-height: 1.08;
		text-wrap: pretty;
	}

	.scenario-folio :global(.reader-content) {
		min-height: 0;
		flex: 1;
		overflow-y: auto;
		padding: 1.35rem clamp(1.75rem, 4vw, 3.5rem) 2rem;
		outline: none;
	}

	.scenario-folio :global(.reader-content:focus-visible) {
		box-shadow: inset 0 0 0 2px var(--ring);
	}

	.loading-lines,
	.loading-line,
	.loading-copy {
		display: flex;
	}

	.loading-lines {
		flex-direction: column;
		gap: 1.25rem;
		margin-top: 2.25rem;
	}

	.loading-line {
		gap: 0.75rem;
	}

	.loading-copy {
		flex: 1;
		flex-direction: column;
		gap: 0.5rem;
		padding-top: 0.25rem;
	}

	.story-article {
		max-width: 48rem;
		margin-inline: auto;
	}

	.story-step {
		position: relative;
	}

	.step-index {
		margin: 0;
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.66rem;
		font-weight: 760;
		letter-spacing: 0.14em;
		color: var(--secondary-foreground);
	}

	.step-title {
		max-width: 36rem;
		margin: 0.2rem 0 0;
		font-family: var(--font-serif);
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		line-height: 1.15;
		text-wrap: pretty;
	}

	.objective-note {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: start;
		gap: 0.9rem;
		margin-top: 1rem;
		padding: 0.8rem 0.9rem;
		border-left: 3px solid var(--border);
	}

	.objective-note span {
		font-size: 0.59rem;
		font-weight: 780;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--secondary-foreground);
	}

	.objective-note p {
		margin: 0;
		white-space: pre-line;
		font-size: 0.78rem;
		line-height: 1.55;
		color: var(--muted-foreground);
	}

	.story-scene {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		margin-top: 1rem;
	}

	.dialogue-line {
		display: grid;
		grid-template-columns: 2.75rem minmax(0, 1fr);
		align-items: start;
		gap: 0.85rem;
		padding: 0.6rem 0;
		border-bottom: 1px solid color-mix(in oklab, var(--border) 48%, transparent);
	}

	.player-line {
		margin-block: 0.2rem;
		padding-inline: 0.8rem;
		border-left: 3px solid var(--secondary-foreground);
		background: color-mix(in oklab, var(--secondary) 28%, transparent);
	}

	.scenario-folio :global(.speaker-avatar) {
		width: 2.75rem;
		height: 2.75rem;
		box-shadow: 0 0 0 1px var(--border);
	}

	.dialogue-copy {
		min-width: 0;
	}

	.speaker-name {
		margin: 0;
		font-size: 0.72rem;
		font-weight: 760;
		letter-spacing: 0.025em;
		color: var(--secondary-foreground);
	}

	.dialogue-text {
		margin: 0.15rem 0 0;
		white-space: pre-line;
		font-size: 0.94rem;
		line-height: 1.65;
	}

	.narration-line,
	.repeated-line,
	.empty-dialogue {
		margin: 0;
		padding: 0.6rem 0 0.6rem 3.6rem;
		font-size: 0.8rem;
		font-style: italic;
		line-height: 1.55;
		color: var(--muted-foreground);
	}

	.repeated-line {
		font-style: normal;
	}

	.scenario-folio :global(.step-separator) {
		margin-block: 2.25rem;
	}

	.scenario-folio :global(.page-separator) {
		margin-top: 1.6rem;
	}

	.scenario-footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.9rem 0 0;
		font-size: 0.68rem;
		line-height: 1.5;
		color: var(--muted-foreground);
	}

	.scenario-footer p {
		margin: 0;
	}

	@media (max-width: 62rem) {
		.scenario-folio {
			padding: 1.5rem;
		}

		.scenario-hero {
			grid-template-columns: minmax(0, 1fr) 9rem;
		}

		.scenario-folio :global(.hero-portrait) {
			width: 6.5rem;
			height: 6.5rem;
		}

		.hero-mark {
			display: none;
		}

		.archive-controls {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}

		.controls-heading {
			display: none;
		}

		.story-workspace {
			grid-template-columns: 1fr;
		}

		.scenario-folio :global(.reader-card) {
			order: -1;
		}

		.scenario-folio :global(.story-browser),
		.scenario-folio :global(.reader-card) {
			height: 38rem;
			min-height: 0;
		}
	}

	@media (max-width: 42rem) {
		.scenario-folio {
			padding: 1.1rem 0.9rem 1.5rem;
		}

		.scenario-hero {
			grid-template-columns: minmax(0, 1fr) 5.25rem;
			gap: 0.75rem;
			min-height: 7.5rem;
		}

		.scenario-hero h1 {
			font-size: clamp(2.125rem, 10vw, 3.35rem);
			letter-spacing: -0.015em;
			line-height: 0.98;
		}

		.hero-description {
			margin-top: 0.75rem;
			font-size: 0.85rem;
			line-height: 1.5;
		}

		.concept-kicker {
			margin-bottom: 0.5rem;
			font-size: 0.58rem;
		}

		.concept-kicker span {
			min-width: 1.65rem;
			height: 1.65rem;
		}

		.scenario-folio :global(.hero-portrait) {
			width: 4.75rem;
			height: 4.75rem;
		}

		.hero-frame {
			display: none;
		}

		.archive-stats {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 0.4rem;
			border-bottom: 0;
		}

		.archive-stats li {
			align-items: flex-start;
			flex-direction: column;
			gap: 0.15rem;
			border: 1px solid var(--border);
		}

		.archive-stats span {
			text-align: left;
		}

		.scenario-folio :global(.control-grid) {
			grid-template-columns: 1fr;
		}

		.scenario-folio :global(.reader-heading),
		.scenario-folio :global(.reader-content) {
			padding-inline: 1rem;
		}

		.scenario-folio :global(.reader-heading [data-slot='card-title']) {
			font-size: 1.75rem;
			line-height: 1.1;
		}

		.step-title {
			max-width: none;
			font-size: 1.1875rem;
			line-height: 1.18;
		}

		.dialogue-line {
			grid-template-columns: 2.4rem minmax(0, 1fr);
			gap: 0.65rem;
		}

		.scenario-folio :global(.speaker-avatar) {
			width: 2.4rem;
			height: 2.4rem;
		}

		.narration-line,
		.repeated-line,
		.empty-dialogue {
			padding-left: 3.05rem;
		}
	}
</style>
