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

<main class="mx-auto w-full max-w-[76rem] px-4 py-8 sm:px-6 md:px-8 md:py-12">
	<header class="flex items-center gap-4">
		<Avatar.Root class="size-14 rounded-2xl bg-secondary">
			<Avatar.Image
				src="/npc/741.png"
				alt="Iris Livier"
				class="rounded-2xl object-contain [image-rendering:pixelated]"
			/>
			<Avatar.Fallback class="rounded-2xl">IL</Avatar.Fallback>
		</Avatar.Root>
		<div>
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Scenario scripts</h1>
			<p class="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
				Main and side-story dialogue, organized by chapter. Pick a story to read each step in
				order.
			</p>
		</div>
	</header>

	<div class="mt-6 flex flex-wrap gap-2" aria-label="Archive statistics">
		<Badge variant="secondary">{formatNumber(archive.index.length)} stories</Badge>
		<Badge variant="secondary">{mainCount} main · {sideCount} side</Badge>
		<Badge variant="secondary">{formatNumber(lineCount)} dialogue lines</Badge>
		<Badge variant="secondary">{formatNumber(Object.keys(archive.speakers).length)} characters</Badge>
	</div>

	<Field.Group class="mt-5 grid gap-3 md:grid-cols-[auto_minmax(12rem,1fr)_minmax(14rem,1fr)]">
		<Field.Field>
			<Field.Label class="sr-only">Story type</Field.Label>
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
			<Field.Label for="story-search" class="sr-only">Search story titles</Field.Label>
			<InputGroup.Root>
				<InputGroup.Addon>
					<SearchIcon aria-hidden="true" />
				</InputGroup.Addon>
				<InputGroup.Input
					id="story-search"
					bind:value={query}
					placeholder="Search stories"
				/>
			</InputGroup.Root>
		</Field.Field>

		<Field.Field>
			<Field.Label for="player-name" class="sr-only">Your character name</Field.Label>
			<Input
				id="player-name"
				bind:value={playerName}
				maxlength={20}
				placeholder="Your character name (Adventurer)"
			/>
		</Field.Field>
	</Field.Group>

	<div class="mt-4 grid items-start gap-4 lg:grid-cols-[19rem_minmax(0,1fr)]">
		<Card.Root class="h-[72vh] max-h-[44rem] gap-0 py-0">
			<Card.Header class="border-b py-4">
				<Card.Title><h2>Stories</h2></Card.Title>
				<Card.Description>
					{filteredStories.length === archive.index.length
						? `${archive.index.length} in the archive`
						: `${filteredStories.length} matching ${filteredStories.length === 1 ? 'story' : 'stories'}`}
				</Card.Description>
			</Card.Header>
			<Card.Content class="fine-scrollbar min-h-0 flex-1 overflow-y-auto px-2 py-2">
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
					<div class="mb-1">
						<Button
							variant="ghost"
							size="lg"
							class="h-auto w-full justify-start px-3 py-2.5"
							aria-expanded={openChapter === chapterNumber}
							onclick={() => (openChapter = openChapter === chapterNumber ? 0 : chapterNumber)}
						>
							<span class="shrink-0 font-semibold">Chapter {chapterNumber}</span>
							<span class="min-w-0 flex-1 truncate text-muted-foreground">
								{archive.chapters[String(chapterNumber)]}
							</span>
							<span class="text-xs text-muted-foreground">{chapterCount}</span>
							<ChevronDownIcon
								class={cn('size-4 transition-transform', openChapter === chapterNumber && 'rotate-180')}
								aria-hidden="true"
							/>
						</Button>

						{#if openChapter === chapterNumber}
							<div class="mt-1 space-y-3 pl-1">
								{#each storyTypes as type (type)}
									{#if groups[type].length}
										<div>
											<p class="px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
												{storyTypeLabel(type)} scenarios
											</p>
											<div class="space-y-0.5">
												{#each groups[type] as item (item.id)}
													<Button
														variant={item.id === selectedId ? 'default' : 'ghost'}
														size="lg"
														class="h-auto w-full justify-start px-2.5 py-2"
														aria-current={item.id === selectedId ? 'true' : undefined}
														title={item.name}
														onclick={() => void selectStory(item.id)}
													>
														<Badge variant="secondary">{storyTypeLabel(item.type)}</Badge>
														<span class="min-w-0 flex-1 truncate">{item.name}</span>
														<span class="shrink-0 text-xs opacity-70">Lv{item.level}</span>
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

		<Card.Root
			class="h-[72vh] max-h-[44rem] gap-0 py-0"
			aria-busy={loading}
		>
			{#if story && !loading}
				<Card.Header class="border-b py-4">
					<div class="flex flex-wrap items-center gap-2">
						<Badge variant="secondary">{storyTypeLabel(story.type)}</Badge>
						<Card.Title><h2>{story.name}</h2></Card.Title>
					</div>
					<Card.Description>
						Chapter {story.chapter} · {archive.chapters[String(story.chapter)]} · {story.steps.length}
						{story.steps.length === 1 ? 'step' : 'steps'}
					</Card.Description>
				</Card.Header>
			{/if}

			<Card.Content
				bind:ref={readerPanel}
				class="fine-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6"
			>
				{#if loading}
					<div aria-label="Loading story">
						<Skeleton class="h-6 w-52" />
						<Skeleton class="mt-3 h-4 w-36" />
						<div class="mt-9 space-y-5">
							{#each Array(5) as _, index (index)}
								<div class="flex gap-3">
									<Skeleton class="size-10 shrink-0 rounded-full" />
									<div class="flex-1 space-y-2 pt-1">
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
					<article>
						{#each story.steps as step, stepIndex (step.id)}
							{#if stepIndex > 0}<Separator class="my-7" />{/if}
							<section>
								<p class="text-xs font-medium tracking-wider text-muted-foreground">
									{String(stepIndex + 1).padStart(2, '0')}
								</p>
								<h3 class="mt-1 font-semibold">{step.name}</h3>
								{#if step.objective}
									<p class="mt-3 whitespace-pre-line rounded-lg bg-muted px-3.5 py-2.5 text-sm leading-relaxed text-muted-foreground">
										{substitute(step.objective)}
									</p>
								{/if}

								{#if step.scenes.length === 0}
									<p class="mt-4 text-sm italic text-muted-foreground">This step has no dialogue.</p>
								{:else}
									{#each step.scenes as scene (scene.id)}
										<div class="mt-4">
											{#each flattenLines(scene.lines, `${story.id}-${scene.id}`) as entry (entry.id)}
												{#if entry.kind === 'line'}
													{@const speaker = entry.line.speaker ? substitute(entry.line.speakerName ?? entry.line.speaker) : ''}
													{@const portraitId = entry.line.speaker ? portraitFor(entry.line.speaker) : undefined}
													{#if entry.line.speaker}
														<div class="flex gap-3 py-2">
															<Avatar.Root size="lg">
																{#if portraitId}
																	<Avatar.Image
																		src={`/npc/${portraitId}.png`}
																		alt=""
																		class="[image-rendering:pixelated]"
																	/>
																{/if}
																<Avatar.Fallback>{speaker.slice(0, 2).toUpperCase()}</Avatar.Fallback>
															</Avatar.Root>
															<div class="min-w-0 flex-1">
																<p class="text-sm font-medium text-secondary-foreground">{speaker}</p>
																<p class="mt-0.5 whitespace-pre-line text-[0.94rem] leading-relaxed">
																	{substitute(entry.line.text)}
																</p>
															</div>
														</div>
													{:else}
														<p class="py-2 pl-[3.25rem] text-sm italic leading-relaxed text-muted-foreground">
															{substitute(entry.line.text)}
														</p>
													{/if}
												{:else if entry.kind === 'choice'}
													<div class="flex gap-3 py-2">
														<Avatar.Root size="lg"><Avatar.Fallback>YOU</Avatar.Fallback></Avatar.Root>
														<div class="min-w-0 flex-1">
															<p class="text-sm font-medium text-secondary-foreground">{displayName}</p>
															<p class="mt-0.5 text-[0.94rem] leading-relaxed">{cleanChoice(entry.text)}</p>
														</div>
													</div>
												{:else}
													<p class="py-2 pl-[3.25rem] text-sm text-muted-foreground">
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

	<Separator class="mt-8" />
	<footer class="flex flex-wrap items-center justify-between gap-3 py-5 text-xs leading-relaxed text-muted-foreground">
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
