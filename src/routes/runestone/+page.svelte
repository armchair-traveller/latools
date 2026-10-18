<script lang="ts">
	import ArrowDownToLineIcon from '@lucide/svelte/icons/arrow-down-to-line';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import GemIcon from '@lucide/svelte/icons/gem';
	import InfoIcon from '@lucide/svelte/icons/info';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import XIcon from '@lucide/svelte/icons/x';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as Alert from '$lib/components/ui/alert';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import RunestoneCapture from '$lib/components/runestone-capture.svelte';
	import { validateRunestoneImport } from '$lib/runestone-import.js';
	import { cn } from '$lib/utils.js';
	import {
		RUNESTONE_RUNES as runes,
		RUNESTONE_SOURCE as source,
		RUNESTONE_TIERS as tiers,
		MAX_RUNESTONE_SLOTS,
		MAX_RUNESTONE_SCORE,
		calculateRunestoneScore,
		getBestRunestoneSelection,
		moveRunestoneToBoostSlot,
		toggleRunestone
	} from '$lib/runestone.js';

	const groups = [
		{ id: 'basic', name: 'Basic runes', description: 'The foundation of your Runestone.', runes: runes.filter((rune) => rune.type === 'basic') },
		{ id: 'advanced', name: 'Advanced runes', description: 'Higher-level options for your build.', runes: runes.filter((rune) => rune.type === 'advanced') }
	];
	const slots = Array.from({ length: MAX_RUNESTONE_SLOTS }, (_, index) => index + 1);
	const reviewNotes = runes.filter((rune) => rune.reviewNote);
	let selectedIds = $state<number[]>([]);
	let announcement = $state('');
	let capture: { stop: () => void } | undefined;
	let result = $derived(calculateRunestoneScore(selectedIds));
	let isFull = $derived(selectedIds.length === MAX_RUNESTONE_SLOTS);

	function toggle(id: number) {
		const rune = runes.find((rune) => rune.id === id);
		if (!rune) return;
		const wasSelected = selectedIds.includes(id);
		if (!wasSelected && isFull) return;
		capture?.stop();
		selectedIds = toggleRunestone(selectedIds, id);
		announcement = `${rune.name} ${wasSelected ? 'removed' : `added to slot ${selectedIds.length}`}. ${selectedIds.length} of ${MAX_RUNESTONE_SLOTS} slots filled.`;
	}

	function moveToBoost(id: number) {
		if (!isFull) return;
		capture?.stop();
		selectedIds = moveRunestoneToBoostSlot(selectedIds, id);
		announcement = `${runes.find((rune) => rune.id === id)?.name} moved to slot 8. Its points now count twice.`;
	}

	function selectBest() {
		capture?.stop();
		selectedIds = getBestRunestoneSelection();
		announcement = 'Highest-scoring combination selected. Total score: 500.';
	}

	function reset() {
		capture?.stop();
		selectedIds = [];
		announcement = 'All runes cleared.';
	}

	function applyDetectedRunes(ids: number[], source: 'screen' | 'image') {
		const selection = validateRunestoneImport(ids);
		if (!selection) return;
		selectedIds = selection;
		const center = runes.find((rune) => rune.id === selection[7]);
		announcement = `Eight runes read from ${source === 'screen' ? 'the shared screen' : 'the screenshot'}. ${center?.name} is in slot 8 and scores twice.`;
	}
</script>

<svelte:head>
	<title>Runestone · LaTale Tools</title>
	<meta name="description" content="Build your LaTale Runestone with 30 runes. Calculate your score and tier, compare effects, and choose the rune that receives the eighth-slot bonus." />
	<meta property="og:title" content="Runestone · LaTale Tools" />
	<meta property="og:description" content="Choose eight runes, double the final slot’s points, and see your Runestone score and tier." />
</svelte:head>

<div class="runestone-page">
	<header class="page-heading">
		<div class="heading-copy">
			<div class="runestone-emblem" aria-hidden="true"><GemIcon /></div>
			<div>
				<p class="eyebrow">Make every slot count</p>
				<h1>Runestone</h1>
				<p class="intro">Choose up to eight runes and compare their effects. Fill every slot to double the points of your final rune.</p>
				<div class="source-line">
					<span>{runes.length} runes · {MAX_RUNESTONE_SCORE} maximum points</span>
					<Button href={source.url} target="_blank" rel="noreferrer" variant="link" size="sm">RamuWiki reference <ExternalLinkIcon data-icon="inline-end" /></Button>
				</div>
			</div>
		</div>
		<div class="page-actions">
			<Button onclick={selectBest}><SparklesIcon data-icon="inline-start" /> Auto-select best</Button>
			<Button variant="ghost" size="sm" onclick={reset} disabled={!selectedIds.length}><RotateCcwIcon data-icon="inline-start" /> Reset</Button>
		</div>
	</header>
	<div class="capture-section">
		<RunestoneCapture bind:this={capture} ondetect={applyDetectedRunes} />
	</div>
	{#each reviewNotes as rune (rune.id)}
		<div class="review-alert">
			<Alert.Root><InfoIcon /><Alert.Title>{rune.name} score under review</Alert.Title><Alert.Description>The wiki’s current {rune.score} points are retained while its score is under review.</Alert.Description></Alert.Root>
		</div>
	{/each}

	<div class="workspace">
		<section class="rune-library" aria-labelledby="runes-title">
			<div class="section-heading">
				<div><h2 id="runes-title">Choose your runes</h2><p>Five runes per row, matching the game. Click to add or remove; scroll sideways if needed.</p></div>
				<Badge variant={isFull ? 'secondary' : 'outline'}>{selectedIds.length} / {MAX_RUNESTONE_SLOTS} selected</Badge>
			</div>
			<p class="selection-guidance" role="status">{isFull ? 'All slots are filled. Remove a rune to choose another.' : `${MAX_RUNESTONE_SLOTS - selectedIds.length} ${MAX_RUNESTONE_SLOTS - selectedIds.length === 1 ? 'slot' : 'slots'} available. Runes fill slots in the order you select them.`}</p>
			<!-- Keyboard focus lets users scroll all five columns with arrow keys. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div class="rune-grid-scroll" role="region" aria-label="Rune picker, five runes per row" tabindex={0}>
				<div class="rune-groups">
					{#each groups as group (group.id)}
						<section class="rune-group" aria-labelledby={`${group.id}-title`}>
							<div class="group-heading"><h3 id={`${group.id}-title`}>{group.name}</h3><span>{group.runes.length} runes</span></div>
							<p class="group-description">{group.description}</p>
							<div class="rune-grid">
								{#each group.runes as rune (rune.id)}
									<Button
										variant={selectedIds.includes(rune.id) ? 'secondary' : 'outline'}
										class="h-full w-full flex-col items-stretch justify-start gap-3 p-3"
										aria-pressed={selectedIds.includes(rune.id)}
										aria-label={`${rune.name}, ${rune.score} points${rune.reviewNote ? ', score under review' : ''}, ${rune.level}. ${rune.effects.join('. ')}${selectedIds.includes(rune.id) ? `. Selected in slot ${selectedIds.indexOf(rune.id) + 1}` : ''}`}
										disabled={isFull && !selectedIds.includes(rune.id)}
										data-testid={`rune-${rune.id}`}
										onclick={() => toggle(rune.id)}
									>
										<span class="rune-topline"><span class="rune-name" title={rune.originalName}>{rune.name}</span><span class="rune-score">{rune.score}<span>pts</span></span></span>
										<span class="rune-effects">{#each rune.effects as effect (effect)}<span>{effect}</span>{/each}</span>
										{#if rune.reviewNote}<Badge variant="outline">Under review</Badge>{/if}
										<span class="rune-bottomline"><span>{rune.level}</span>{#if selectedIds.includes(rune.id)}<Badge variant="outline"><CheckIcon data-icon="inline-start" /> Slot {selectedIds.indexOf(rune.id) + 1}</Badge>{/if}</span>
									</Button>
								{/each}
							</div>
						</section>
					{/each}
				</div>
			</div>
		</section>

		<aside class="result-sidebar" aria-label="Runestone results and selected slots">
			<Card.Root>
				<Card.Header><Card.Title><h2>Runestone score</h2></Card.Title><Card.Description>Base points + eighth-slot bonus</Card.Description></Card.Header>
				<Card.Content class="flex flex-col gap-4">
					<div class="score-result" aria-live="polite" aria-atomic="true">
						<div><output class="score-number" aria-label="Runestone score" data-testid="runestone-score">{result.totalScore}</output><span class="score-maximum"> / {MAX_RUNESTONE_SCORE}</span></div>
						<Badge variant={result.totalScore >= 400 ? 'secondary' : 'outline'}>{result.tier.name}</Badge>
					</div>
					<progress value={result.totalScore} max={MAX_RUNESTONE_SCORE} aria-label="Runestone score out of 500">{result.totalScore}</progress>
					<dl class="score-breakdown">
						<div><dt>Base points</dt><dd data-testid="runestone-base">{result.baseScore}</dd></div>
						<div><dt>Slot 8 bonus</dt><dd data-testid="runestone-bonus">+{result.eighthSlotBonus}</dd></div>
					</dl>
					<p class="score-note">{#if result.nextTier}<strong>{result.pointsToNextTier} points</strong> to {result.nextTier.name}.{:else}<strong>Maximum score reached.</strong> Your Runestone is in the highest tier.{/if}</p>
					<Separator />
					<dl class="tier-guide" aria-label="Score tier thresholds">
						{#each tiers as tier (tier.name)}
							<div class={cn(result.tier.name === tier.name && 'current-tier')} aria-current={result.tier.name === tier.name ? 'true' : undefined}><dt>{tier.name}</dt><dd>{tier.minScore}{tier.minScore < MAX_RUNESTONE_SCORE ? '+' : ''}</dd></div>
						{/each}
					</dl>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header><Card.Title><h2>Your eight slots</h2></Card.Title><Card.Description>The rune in slot 8 scores twice when all slots are filled.</Card.Description></Card.Header>
				<Card.Content>
					<ol class="selected-slots" aria-label="Selected runes in slot order">
						{#each slots as slot (slot)}
							<li class={cn('selected-slot', slot === MAX_RUNESTONE_SLOTS && 'boost-slot', !result.selectedRunes[slot - 1] && 'vacant-slot')} data-testid={`runestone-slot-${slot}`}>
								<div class="slot-topline"><span class="slot-number">{slot === MAX_RUNESTONE_SLOTS ? '08 · ×2' : String(slot).padStart(2, '0')}</span>{#if result.selectedRunes[slot - 1]}<Button variant="ghost" size="icon-xs" aria-label={`Remove ${result.selectedRunes[slot - 1].name} from slot ${slot}`} onclick={() => toggle(result.selectedRunes[slot - 1].id)}><XIcon /></Button>{/if}</div>
								{#if result.selectedRunes[slot - 1]}
									<strong class="slot-rune-name">{result.selectedRunes[slot - 1].name}</strong>
									<span class="slot-points">{result.selectedRunes[slot - 1].score}{slot === MAX_RUNESTONE_SLOTS ? ` × 2 = ${result.selectedRunes[slot - 1].score * 2}` : ''} pts</span>
									{#if slot !== MAX_RUNESTONE_SLOTS}<Button variant="ghost" size="xs" class="mt-auto self-start" disabled={!isFull} aria-label={`Move ${result.selectedRunes[slot - 1].name} to slot 8`} title={isFull ? 'Move this rune to slot 8' : 'Fill all eight slots to change the bonus rune'} onclick={() => moveToBoost(result.selectedRunes[slot - 1].id)}><ArrowDownToLineIcon data-icon="inline-start" /> To slot 8</Button>{:else}<span class="boost-label">Bonus active</span>{/if}
								{:else}
									<span class="empty-slot-label">{slot === MAX_RUNESTONE_SLOTS ? 'Double points' : 'Empty slot'}</span>
								{/if}
							</li>
						{/each}
					</ol>
				</Card.Content>
				<Card.Footer><p class="table-note">Fill all eight slots, then use “To slot 8” to choose your bonus rune. Other runes keep their relative order.</p></Card.Footer>
			</Card.Root>
		</aside>
	</div>

	<section class="reference-section" aria-labelledby="reference-title">
		<div class="section-heading"><div><p class="eyebrow">Every rune at a glance</p><h2 id="reference-title">Rune effects reference</h2></div><Badge variant="outline">{runes.length} runes</Badge></div>
		<Card.Root class="gap-0">
			<Card.Header class="pb-4"><Card.Title>Unlock levels, effects, and points</Card.Title><Card.Description>Use the effects to choose a combination for your build. The score ranks the rune selection; it does not calculate your character’s damage.</Card.Description></Card.Header>
			<Card.Content class="px-0">
				<Table.Root tabindex={0} aria-label="Rune effects reference; use arrow keys to scroll horizontally">
					<Table.Header><Table.Row><Table.Head class="pl-4">Rune</Table.Head><Table.Head>Type</Table.Head><Table.Head>Unlock</Table.Head><Table.Head>Effects</Table.Head><Table.Head class="pr-4 text-right">Points</Table.Head></Table.Row></Table.Header>
					<Table.Body>
						{#each runes as rune (rune.id)}
							<Table.Row data-state={selectedIds.includes(rune.id) ? 'selected' : undefined}>
								<Table.Cell class="pl-4"><span class="reference-name" title={rune.originalName}>{rune.name}</span></Table.Cell>
								<Table.Cell><Badge variant="outline">{rune.type === 'basic' ? 'Basic' : 'Advanced'}</Badge></Table.Cell>
								<Table.Cell><span class="number">{rune.level}</span></Table.Cell>
								<Table.Cell><div class="reference-effects">{#each rune.effects as effect (effect)}<span>{effect}</span>{/each}</div></Table.Cell>
								<Table.Cell class="pr-4 text-right"><div class="reference-score"><strong class="number">{rune.score}</strong>{#if rune.reviewNote}<Badge variant="outline">Under review</Badge>{/if}</div></Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
			<Card.Footer><p class="table-note">Scroll horizontally to see all columns on smaller screens.</p></Card.Footer>
		</Card.Root>
		{#each reviewNotes as rune (rune.id)}
			<Alert.Root><InfoIcon /><Alert.Title>{rune.name} score note</Alert.Title><Alert.Description>{rune.reviewNote}</Alert.Description></Alert.Root>
		{/each}
		<p class="provenance">Wiki data snapshot · {source.retrievedAt} · {source.note}</p>
	</section>
	<p class="sr-only" role="status">{announcement}</p>
</div>

<style>
	.runestone-page { width: 100%; min-width: 0; max-width: 1500px; margin: 0 auto; padding: 36px 28px 28px; }
	.page-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding-bottom: 28px; border-bottom: 1px solid var(--border); }
	.heading-copy { display: flex; gap: 18px; min-width: 0; }
	.runestone-emblem { display: grid; flex: 0 0 68px; width: 68px; height: 68px; place-items: center; border: 1px solid var(--border); border-radius: 18px; background: var(--route-soft); color: var(--route-deep); }
	.runestone-emblem :global(svg) { width: 30px; height: 30px; stroke-width: 1.5; }
	.eyebrow { margin: 0 0 6px; color: var(--route-deep); font: 700 10px ui-monospace, monospace; letter-spacing: .13em; text-transform: uppercase; }
	h1 { margin: 0; font-family: var(--font-serif); font-size: clamp(2rem, 3.2vw, 2.75rem); font-weight: 600; letter-spacing: -.035em; line-height: 1.13; }
	.intro { max-width: 590px; margin-top: 12px; color: var(--muted-foreground); font-size: 14px; line-height: 1.7; }
	.source-line { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 10px; color: var(--muted-foreground); font-size: 12px; }
	.page-actions { display: flex; flex-shrink: 0; flex-direction: column; align-items: flex-end; gap: 6px; padding-top: 7px; }
	.review-alert { margin-top: 20px; }
	.capture-section { min-width: 0; margin-top: 24px; }
	.workspace { display: grid; grid-template-columns: minmax(0, 1fr) 310px; align-items: start; gap: 24px; margin-top: 26px; }
	.rune-library, .reference-section { min-width: 0; }
	.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
	.section-heading h2 { font-family: var(--font-serif); font-size: 25px; font-weight: 500; letter-spacing: -.02em; }
	.section-heading p:not(.eyebrow) { margin-top: 5px; color: var(--muted-foreground); font-size: 12px; line-height: 1.6; }
	.selection-guidance { min-height: 38px; margin-top: 12px; color: var(--route-deep); font-size: 11px; line-height: 1.65; }
	.rune-group + .rune-group { margin-top: 28px; }
	.group-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
	.group-heading h3 { font-size: 14px; font-weight: 650; }
	.group-heading > span { color: var(--muted-foreground); font: 11px ui-monospace, monospace; }
	.group-description { margin-top: 4px; color: var(--muted-foreground); font-size: 11px; }
	.rune-grid-scroll { overflow-x: auto; margin-top: 13px; padding: 3px; margin-inline: -3px; }
	.rune-grid-scroll:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; border-radius: 8px; }
	.rune-groups { min-width: 640px; }
	.rune-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin-top: 13px; }
	.rune-topline { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 8px; text-align: left; }
	.rune-name { flex: 1 1 90px; min-width: 0; overflow-wrap: anywhere; white-space: normal; font-size: 13px; font-weight: 650; line-height: 1.45; }
	.rune-score { display: flex; flex-shrink: 0; align-items: baseline; gap: 3px; font: 600 17px ui-monospace, monospace; }
	.rune-score > span { font-size: 9px; font-weight: 400; }
	.rune-effects { display: flex; flex: 1; flex-direction: column; gap: 3px; text-align: left; white-space: normal; font-size: 11px; font-weight: 400; line-height: 1.6; }
	.rune-bottomline { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 5px; min-height: 20px; text-align: left; font-size: 10px; font-weight: 400; }
	.result-sidebar { display: flex; flex-direction: column; gap: 16px; }
	.score-result { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
	.score-number { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 44px; font-weight: 650; letter-spacing: -.06em; line-height: 1; font-variant-numeric: tabular-nums; }
	.score-maximum { color: var(--muted-foreground); font: 12px ui-monospace, monospace; }
	progress { display: block; appearance: none; width: 100%; height: 7px; overflow: hidden; border: 0; border-radius: 99px; background: var(--muted); color: var(--route-accent); }
	progress::-webkit-progress-bar { border-radius: 99px; background: var(--muted); }
	progress::-webkit-progress-value { border-radius: 99px; background: var(--route-accent); }
	progress::-moz-progress-bar { border-radius: 99px; background: var(--route-accent); }
	.score-breakdown { display: flex; flex-direction: column; gap: 9px; font-size: 12px; }
	.score-breakdown > div { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
	.score-breakdown dt { color: var(--muted-foreground); }
	.score-breakdown dd { font-family: ui-monospace, monospace; font-weight: 600; }
	.score-note { color: var(--muted-foreground); font-size: 11px; line-height: 1.7; }
	.score-note strong { color: var(--foreground); font-weight: 550; }
	.tier-guide { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 5px; }
	.tier-guide > div { display: flex; flex-direction: column; gap: 4px; padding: 7px; border-radius: 7px; text-align: center; color: var(--muted-foreground); font-size: 10px; }
	.tier-guide dd { font: 11px ui-monospace, monospace; }
	.tier-guide > .current-tier { background: var(--route-soft); color: var(--route-deep); font-weight: 650; }
	.selected-slots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; list-style: none; padding: 0; margin: 0; }
	.selected-slot { display: flex; flex-direction: column; min-width: 0; min-height: 90px; gap: 5px; padding: 9px; border: 1px solid var(--border); border-radius: 9px; }
	.slot-topline { display: flex; align-items: center; justify-content: space-between; min-height: 21px; gap: 4px; }
	.slot-number { color: var(--muted-foreground); font: 10px ui-monospace, monospace; }
	.slot-rune-name { font-size: 12px; font-weight: 600; line-height: 1.45; overflow-wrap: anywhere; }
	.slot-points { color: var(--muted-foreground); font: 10px ui-monospace, monospace; line-height: 1.6; }
	.boost-slot { border-color: var(--route-accent); background: var(--route-soft); }
	.boost-slot .slot-number, .boost-label { color: var(--route-deep); }
	.boost-slot .empty-slot-label, .boost-slot .slot-points { color: var(--route-deep); }
	.boost-label { margin-top: auto; padding-top: 5px; font-size: 10px; }
	.vacant-slot:not(.boost-slot) { border-style: dashed; }
	.empty-slot-label { margin-block: 6px; color: var(--muted-foreground); font-size: 11px; }
	.table-note { color: var(--muted-foreground); font-size: 11px; line-height: 1.7; }
	.reference-section { display: flex; flex-direction: column; gap: 20px; margin-top: 32px; padding-top: 28px; border-top: 1px solid var(--border); }
	.reference-name { display: block; min-width: 100px; max-width: 170px; white-space: normal; font-size: 12px; font-weight: 550; line-height: 1.6; }
	.reference-effects { display: flex; flex-direction: column; min-width: 230px; gap: 3px; padding-block: 3px; font-size: 12px; line-height: 1.6; white-space: normal; }
	.reference-score { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
	.number { font: 12px ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric: tabular-nums; }
	.provenance { color: var(--muted-foreground); font-size: 11px; line-height: 1.7; }
	@media (max-width: 1300px) {
		.page-heading { flex-wrap: wrap; gap: 15px; }
		.page-actions { flex-direction: row; align-items: center; padding-top: 0; }
		.workspace { display: flex; flex-direction: column; gap: 26px; }
		.result-sidebar { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); align-items: start; order: -1; width: 100%; }
		.rune-library { width: 100%; }
	}
	@media (max-width: 650px) {
		.runestone-page { padding: 26px 16px; }
		.heading-copy { gap: 12px; }
		.runestone-emblem { flex-basis: 48px; width: 48px; height: 48px; border-radius: 12px; }
		.runestone-emblem :global(svg) { width: 24px; height: 24px; }
		.intro { font-size: 13px; }
		.source-line { margin-left: -60px; margin-top: 15px; }
		.result-sidebar { grid-template-columns: minmax(0, 1fr); }
		.selected-slots { grid-template-columns: repeat(4, minmax(0, 1fr)); }
		.selected-slot { padding: 7px; }
		.tier-guide { grid-template-columns: repeat(6, minmax(0, 1fr)); }
		.section-heading h2 { font-size: 23px; }
		.reference-section { gap: 16px; }
	}
	@media (max-width: 460px) { .selected-slots { grid-template-columns: repeat(2, minmax(0, 1fr)); } .tier-guide { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
	@media (max-width: 360px) { .section-heading { flex-wrap: wrap; } }
</style>
