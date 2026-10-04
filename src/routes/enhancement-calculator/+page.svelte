<script lang="ts">
	import { asset } from '$app/paths';
	import HammerIcon from '@lucide/svelte/icons/hammer';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import XIcon from '@lucide/svelte/icons/x';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import InfoIcon from '@lucide/svelte/icons/info';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Alert from '$lib/components/ui/alert';
	import * as Card from '$lib/components/ui/card';
	import * as Empty from '$lib/components/ui/empty';
	import * as Field from '$lib/components/ui/field';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { formatCompactEly } from '$lib/ely.js';
	import {
		enhancementEquipment as equipment,
		enhancementDungeons as dungeons,
		enhancementSource as source,
		defaultEnhancementSelections,
		calculateEnhancement
	} from '$lib/enhancement-calculator.js';

	const categories = [...new Set(equipment.map((item) => item.category))];
	const equipmentById = Object.fromEntries(equipment.map((item) => [item.id, item]));
	let equipmentId = $state(equipment[0].id);
	let selections = $state(defaultEnhancementSelections.map((item) => ({ ...item })));
	let difficultyByDungeon = $state<Record<string, 4 | 5>>({});
	let pointRewardsByDungeon = $state<Record<string, boolean>>({});
	let announcement = $state('');
	let nextSelectionId = Math.max(...defaultEnhancementSelections.map((item) => item.selectionId), 0) + 1;
	let selectedEquipment = $derived(equipmentById[equipmentId]);
	let result = $derived(calculateEnhancement(selections, difficultyByDungeon, pointRewardsByDungeon));
	const format = (value: number, decimals = 0) => value.toLocaleString('en-US', {
		minimumFractionDigits: decimals, maximumFractionDigits: decimals
	});

	function addEquipment() {
		if (!selectedEquipment) return;
		selections.push({ selectionId: nextSelectionId++, equipmentId, currentStage: 0 });
		announcement = `${selectedEquipment.name} added to the enhancement plan.`;
	}

	function removeEquipment(selectionId: number) {
		const item = selections.find((selection) => selection.selectionId === selectionId);
		selections = selections.filter((selection) => selection.selectionId !== selectionId);
		announcement = item ? `${equipmentById[item.equipmentId].name} removed.` : '';
	}

	function clearEquipment() {
		selections = [];
		difficultyByDungeon = {};
		pointRewardsByDungeon = {};
		announcement = 'All equipment cleared from the enhancement plan.';
	}

	function setStage(selectionId: number, value: string) {
		const selection = selections.find((item) => item.selectionId === selectionId);
		const stage = Number(value);
		if (selection && Number.isInteger(stage) && stage >= 0 && stage <= equipmentById[selection.equipmentId].stages.length) {
			selection.currentStage = stage;
		}
	}

	function setDifficulty(dungeonId: string, value: string) {
		if (value === '4' || value === '5') difficultyByDungeon[dungeonId] = Number(value) as 4 | 5;
	}
</script>

<svelte:head>
	<title>Enhancement Calculator · LaTale Tools</title>
	<meta name="description" content="Plan LaTale equipment enhancements with RamuWiki’s material costs, dungeon drops, difficulty settings, and point reward calculations." />
	<meta property="og:title" content="Enhancement Calculator · LaTale Tools" />
	<meta property="og:description" content="Calculate the materials, dungeon runs, days, and Ely needed to finish your equipment enhancements." />
</svelte:head>

<main class="enhancement-page">
	<header class="page-heading">
		<div class="heading-copy">
			<div class="enhancement-emblem" aria-hidden="true"><HammerIcon /></div>
			<div>
				<p class="eyebrow">Plan your next upgrade</p>
				<h1>Enhancement calculator</h1>
				<p class="intro">Choose your equipment and current enhancement. See the materials, dungeon runs, and Ely needed to reach its final stage.</p>
				<div class="source-line">
					<span>{equipment.length} equipment presets</span>
					<Button href={source.url} target="_blank" rel="noreferrer" variant="link" size="sm">
						RamuWiki reference <ExternalLinkIcon data-icon="inline-end" />
					</Button>
				</div>
			</div>
		</div>
	</header>

	<section class="equipment-picker" aria-label="Add equipment to your plan">
		<Field.FieldGroup class="picker-fields">
			<Field.Field class="min-w-0">
				<Field.FieldLabel for="add-equipment">Equipment to enhance</Field.FieldLabel>
				<Select.Root type="single" bind:value={equipmentId}>
					<Select.Trigger id="add-equipment" class="w-full">
						<span class="picker-value">
							{#if selectedEquipment.icon}<img src={asset(selectedEquipment.icon)} alt="" width="24" height="24" />{/if}
							<span class="truncate">{selectedEquipment.name} · {selectedEquipment.subName}</span>
						</span>
					</Select.Trigger>
					<Select.Content class="max-h-[min(24rem,var(--bits-select-content-available-height))] max-w-[calc(100vw-2rem)]">
						{#each categories as category (category)}
							<Select.Group>
								<Select.Label>{category}</Select.Label>
								{#each equipment.filter((item) => item.category === category) as item (item.id)}
									<Select.Item value={item.id} label={`${item.name} · ${item.subName}`}>
										<span class="picker-option" title={`${item.originalName} · ${item.originalSubName}`}>
											{#if item.icon}<img src={asset(item.icon)} alt="" width="24" height="24" loading="lazy" />{/if}
											<span>{item.name} · {item.subName}</span>
										</span>
									</Select.Item>
								{/each}
							</Select.Group>
						{/each}
					</Select.Content>
				</Select.Root>
			</Field.Field>
			<Field.Field class="picker-action">
				<Button onclick={addEquipment}><PlusIcon data-icon="inline-start" /> Add equipment</Button>
			</Field.Field>
		</Field.FieldGroup>
		<p class="settings-note">Add multiple items, including duplicates. Each item is calculated from its current stage to its maximum.</p>
	</section>

	<section class="summary-grid" aria-label="Enhancement plan totals" aria-live="polite" aria-atomic="true">
		<Card.Root class="gap-3">
			<Card.Header><Card.Title>Total dungeon runs</Card.Title><Card.Description>Across {result.dungeons.length} {result.dungeons.length === 1 ? 'dungeon' : 'dungeons'}</Card.Description></Card.Header>
			<Card.Content><output class="summary-value" data-testid="enhancement-total-runs" aria-label="Total dungeon runs">{format(result.totalRuns)}</output></Card.Content>
		</Card.Root>
		<Card.Root class="gap-3">
			<Card.Header><Card.Title>Expected days</Card.Title><Card.Description>One run per dungeon, per day</Card.Description></Card.Header>
			<Card.Content><output class="summary-value" data-testid="enhancement-days" aria-label="Expected days">{format(result.expectedDays)}</output></Card.Content>
		</Card.Root>
		<Card.Root class="gap-3">
			<Card.Header><Card.Title>Enhancement cost</Card.Title><Card.Description>Ely for all remaining stages</Card.Description></Card.Header>
			<Card.Content>
				<output class="summary-value ely-value" data-testid="enhancement-ely" aria-label="Total enhancement Ely" title={`${format(result.totalEly)} Ely`}>{formatCompactEly(result.totalEly)}</output>
				<p class="exact-ely">{format(result.totalEly)} Ely</p>
			</Card.Content>
		</Card.Root>
	</section>

	<div class="workspace">
		<section class="equipment-plan" aria-labelledby="equipment-plan-title">
			<div class="section-heading">
				<div><h2 id="equipment-plan-title">Your equipment</h2><p>{selections.length} {selections.length === 1 ? 'item' : 'items'} in your plan</p></div>
				<Button variant="ghost" size="sm" onclick={clearEquipment} disabled={!selections.length}>Clear all</Button>
			</div>
			{#each selections as selection (selection.selectionId)}
				{@const item = equipmentById[selection.equipmentId]}
				{@const calculated = result.items.find((row) => row.selectionId === selection.selectionId)!}
				<Card.Root class="gap-4" data-testid="enhancement-equipment">
					<Card.Header>
						<div class="item-heading">
							{#if item.icon}<div class="item-icon"><img src={asset(item.icon)} alt="" width="36" height="36" /></div>{/if}
							<div class="item-heading-copy">
								<Card.Title><h3 title={item.originalName}>{item.name}</h3></Card.Title>
								<Card.Description><span title={item.originalSubName}>{item.subName}</span></Card.Description>
							</div>
							<Button variant="ghost" size="icon-sm" onclick={() => removeEquipment(selection.selectionId)} aria-label={`Remove ${item.name}`}><XIcon /></Button>
						</div>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4">
						<Field.FieldGroup>
							<Field.Field>
								<Field.FieldLabel for={`stage-${selection.selectionId}`}>Current enhancement</Field.FieldLabel>
								<Select.Root type="single" value={String(selection.currentStage)} onValueChange={(value) => setStage(selection.selectionId, value)}>
									<Select.Trigger id={`stage-${selection.selectionId}`} class="w-full">{calculated.currentLabel}</Select.Trigger>
									<Select.Content class="max-h-[min(24rem,var(--bits-select-content-available-height))] max-w-[calc(100vw-2rem)]">
										<Select.Group>
											<Select.Item value="0" label={item.baseLabel}>{item.baseLabel}</Select.Item>
											{#each item.stages as stage, index (stage.label)}
												<Select.Item value={String(index + 1)} label={stage.label}><span title={stage.originalLabel}>{stage.label}</span></Select.Item>
											{/each}
										</Select.Group>
									</Select.Content>
									</Select.Root>
								<Field.FieldDescription>Target: {calculated.targetLabel}</Field.FieldDescription>
							</Field.Field>
						</Field.FieldGroup>
						{#if calculated.materialCosts.length}
							<dl class="item-materials" aria-label={`Materials needed for ${item.name}`}>
								{#each calculated.materialCosts as material (material.materialId)}
									<div>
										<dt title={material.originalMaterialName}>
											{#if material.icon}<img src={asset(material.icon)} alt="" width="22" height="22" loading="lazy" />{/if}
											<span>{material.materialName}</span>
										</dt>
										<dd class="number">{format(material.amount)}</dd>
									</div>
								{/each}
							</dl>
						{:else}
							<p class="complete-message"><CheckIcon aria-hidden="true" /> This item is fully enhanced.</p>
						{/if}
					</Card.Content>
					<Card.Footer class="justify-between gap-3">
						<span class="muted-label">Remaining Ely</span><strong class="number">{format(calculated.ely)}</strong>
					</Card.Footer>
				</Card.Root>
			{:else}
				<Empty.Root class="border">
					<Empty.Header>
						<Empty.Media variant="icon"><HammerIcon /></Empty.Media>
						<Empty.Title>No equipment yet</Empty.Title>
						<Empty.Description>Choose an item above to start your enhancement plan.</Empty.Description>
					</Empty.Header>
					<Empty.Content><Button onclick={addEquipment}><PlusIcon data-icon="inline-start" /> Add equipment</Button></Empty.Content>
				</Empty.Root>
			{/each}
		</section>

		<section class="dungeon-plan" aria-labelledby="dungeon-plan-title">
			<div class="section-heading">
				<div><h2 id="dungeon-plan-title">Dungeon plan</h2><p>Shared materials are combined across your equipment.</p></div>
			</div>
			{#each result.dungeons as dungeon (dungeon.baseDungeonId)}
				{@const hasDifficultyOptions = dungeons.some((option) => option.baseDungeonId === dungeon.baseDungeonId && option.difficulty === 5)}
				<Card.Root class="min-w-0 gap-4 overflow-hidden" data-testid="enhancement-dungeon">
					<Card.Header>
						<div class="dungeon-heading">
							<div class="dungeon-heading-copy">
								<Card.Title><h3 title={dungeon.originalName}>{dungeon.name}</h3></Card.Title>
								<Card.Description>{dungeon.basis}</Card.Description>
							</div>
							<div class="dungeon-total"><strong class="number">{format(dungeon.runs)}</strong><span>runs</span></div>
						</div>
					</Card.Header>
					<Card.Content class="flex flex-col gap-4 px-0">
						{#if hasDifficultyOptions || dungeon.pointReward}
							<div class="dungeon-settings">
								<Field.FieldGroup class="gap-3">
									{#if hasDifficultyOptions}
										<Field.Field orientation="horizontal" data-disabled={dungeon.forcedDifficulty || undefined}>
											<Field.FieldContent>
												<Field.FieldLabel id={`difficulty-${dungeon.baseDungeonId}`}>Difficulty</Field.FieldLabel>
												{#if dungeon.forcedDifficulty}<Field.FieldDescription>Transcended or combined equipment requires D5.</Field.FieldDescription>{/if}
											</Field.FieldContent>
											<ToggleGroup.Root type="single" variant="outline" size="sm" value={String(dungeon.difficulty)} onValueChange={(value) => setDifficulty(dungeon.baseDungeonId, value)} disabled={dungeon.forcedDifficulty} aria-labelledby={`difficulty-${dungeon.baseDungeonId}`}>
												<ToggleGroup.Item value="4" aria-label={`${dungeon.name} difficulty 4`}>D4</ToggleGroup.Item>
												<ToggleGroup.Item value="5" aria-label={`${dungeon.name} difficulty 5`}>D5</ToggleGroup.Item>
											</ToggleGroup.Root>
										</Field.Field>
									{/if}
									{#if dungeon.pointReward}
										<Field.Field orientation="horizontal">
											<Checkbox id={`points-${dungeon.baseDungeonId}`} checked={dungeon.pointRewardEnabled} onCheckedChange={(checked) => { pointRewardsByDungeon[dungeon.baseDungeonId] = checked; }} />
											<Field.FieldContent>
												<Field.FieldLabel for={`points-${dungeon.baseDungeonId}`}>Include point reward boxes</Field.FieldLabel>
												<Field.FieldDescription>{dungeon.pointReward.label} · {format(dungeon.pointReward.pointCost)} points</Field.FieldDescription>
											</Field.FieldContent>
										</Field.Field>
									{/if}
									</Field.FieldGroup>
							</div>
						{/if}
						<Table.Root>
							<Table.Header>
								<Table.Row><Table.Head class="pl-5">Material</Table.Head><Table.Head class="text-right">Needed</Table.Head><Table.Head class="text-right">Per run</Table.Head><Table.Head class="pr-5 text-right">Runs</Table.Head></Table.Row>
							</Table.Header>
							<Table.Body>
								{#each dungeon.materials as material (material.materialId)}
									<Table.Row>
										<Table.Cell class="pl-5"><span class="material-name" title={material.originalMaterialName}>{material.materialName}</span></Table.Cell>
										<Table.Cell class="text-right"><span class="number">{format(material.required)}</span></Table.Cell>
										<Table.Cell class="text-right"><span class="number" title={material.basis}>{format(material.expectedPerRun, 2)}</span></Table.Cell>
										<Table.Cell class="pr-5 text-right"><span class="number">{format(material.rawRuns, 1)}</span></Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</Card.Content>
					<Card.Footer class="flex-wrap gap-2">
						<Badge variant="secondary">{format(dungeon.runs)} {dungeon.runs === 1 ? 'day' : 'days'}</Badge>
						<span class="table-note">One run daily · largest material requirement, rounded up</span>
					</Card.Footer>
				</Card.Root>
			{:else}
				<Empty.Root class="border">
					<Empty.Header>
						<Empty.Media variant="icon">{#if selections.length}<CheckIcon />{:else}<HammerIcon />{/if}</Empty.Media>
						<Empty.Title>{selections.length ? 'Enhancements complete' : 'Your dungeon plan starts here'}</Empty.Title>
						<Empty.Description>{selections.length ? 'Your selected equipment is already at its final stage. No more materials or dungeon runs are needed.' : 'Add equipment to see its materials, expected drops, and required dungeon runs.'}</Empty.Description>
					</Empty.Header>
				</Empty.Root>
			{/each}
		</section>
	</div>

	{#if result.totalMaterials.length}
		<section class="total-materials" aria-labelledby="total-materials-title">
			<Card.Root>
				<Card.Header>
					<Card.Title><h2 id="total-materials-title">Total required materials</h2></Card.Title>
					<Card.Description>Combined quantities for all {selections.length} selected {selections.length === 1 ? 'item' : 'items'}.</Card.Description>
				</Card.Header>
				<Card.Content>
					<dl class="item-materials aggregate-materials">
						{#each result.totalMaterials as material (material.materialId)}
							<div>
								<dt title={material.originalMaterialName}>
									{#if material.icon}<img src={asset(material.icon)} alt="" width="24" height="24" loading="lazy" />{/if}
									<span>{material.materialName}</span>
								</dt>
								<dd class="number">{format(material.amount)}</dd>
							</div>
						{/each}
					</dl>
				</Card.Content>
			</Card.Root>
		</section>
	{/if}

	<section class="methodology" aria-labelledby="methodology-title">
		<h2 id="methodology-title">How the estimate works</h2>
		<div class="method-grid">
			<div><h3>Only the stages still ahead</h3><p>Material and Ely costs are added from the stage after your current enhancement through the final stage. Normal, Transcendence, and combined presets cover separate upgrade paths. Add each path you still need.</p></div>
			<div><h3>Materials collected together</h3><p>Materials from the same dungeon are collected in parallel. Its run count uses the material that takes the longest, rounded up. Total days use your longest dungeon plan.</p></div>
			<div><h3>The wiki’s drop assumptions</h3><p>Per-run amounts use the wiki’s published drop rates and reward-box averages. Dungeon difficulty and optional point rewards change those averages where supported.</p></div>
		</div>
		<Alert.Root>
			<InfoIcon />
			<Alert.Title>Expected values, not guaranteed drops</Alert.Title>
			<Alert.Description>Actual runs may vary. This calculation follows the Korean wiki’s equipment and drop tables; equipment names are translated, with the original names available on hover.</Alert.Description>
		</Alert.Root>
		<div class="provenance"><span>Wiki data snapshot · {source.retrievedOn}</span><Button href={source.url} target="_blank" rel="noreferrer" variant="link" size="sm">View source and reference tables</Button></div>
	</section>
	<p class="sr-only" role="status">{announcement}</p>
</main>

<style>
	.enhancement-page { max-width: 1500px; margin: 0 auto; padding: 36px 28px 28px; }
	.page-heading { padding-bottom: 26px; }
	.heading-copy { display: flex; align-items: flex-start; gap: 18px; min-width: 0; }
	.enhancement-emblem { display: grid; flex: 0 0 76px; width: 76px; height: 76px; place-items: center; border: 1px solid var(--border); border-radius: 20px; background: var(--card); color: var(--route-deep); }
	.enhancement-emblem :global(svg) { width: 32px; height: 32px; stroke-width: 1.5; }
	.eyebrow { margin: 0 0 6px; color: var(--route-deep); font: 700 10px ui-monospace, monospace; letter-spacing: .13em; text-transform: uppercase; }
	h1 { margin: 0; font-family: var(--font-serif); font-size: clamp(2rem, 3.2vw, 2.75rem); font-weight: 600; letter-spacing: -.035em; line-height: 1.13; }
	.intro { max-width: 690px; margin-top: 12px; color: var(--muted-foreground); font-size: 14px; line-height: 1.7; }
	.source-line { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 10px; color: var(--muted-foreground); font-size: 12px; }
	.equipment-picker { padding: 22px 0 18px; border-block: 1px solid var(--border); }
	:global(.picker-fields) { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; max-width: 800px; gap: 12px; }
	:global(.picker-action) { width: auto; }
	.picker-value, .picker-option { display: flex; align-items: center; gap: 8px; min-width: 0; }
	.picker-value img, .picker-option img, .item-icon img, .item-materials img { flex-shrink: 0; object-fit: contain; image-rendering: pixelated; }
	.picker-option { white-space: normal; }
	.settings-note { margin: 13px 0 0; color: var(--muted-foreground); font-size: 11px; line-height: 1.7; }
	.summary-grid { display: grid; grid-template-columns: 1fr 1fr 1.3fr; gap: 16px; margin-top: 24px; }
	.summary-value { display: flex; align-items: baseline; gap: 10px; color: var(--route-deep); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 36px; font-weight: 650; font-variant-numeric: tabular-nums; letter-spacing: -.065em; line-height: 1.15; }
	.ely-value { color: var(--foreground); font-size: clamp(24px, 2.6vw, 34px); }
	.exact-ely { margin-top: 6px; color: var(--muted-foreground); font-size: 11px; font-variant-numeric: tabular-nums; }
	.workspace { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); align-items: start; gap: 24px; margin-top: 30px; }
	.equipment-plan, .dungeon-plan { display: flex; flex-direction: column; min-width: 0; gap: 16px; }
	.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 47px; }
	.section-heading h2, .methodology > h2 { font-family: var(--font-serif); font-size: 25px; font-weight: 500; letter-spacing: -.02em; }
	.section-heading p { margin-top: 4px; color: var(--muted-foreground); font-size: 11px; line-height: 1.6; }
	.item-heading, .dungeon-heading { display: flex; align-items: flex-start; gap: 12px; }
	.item-heading-copy, .dungeon-heading-copy { display: flex; flex: 1; flex-direction: column; min-width: 0; gap: 5px; }
	.item-icon { display: grid; flex: 0 0 42px; width: 42px; height: 42px; place-items: center; border-radius: 8px; background: var(--muted); }
	.item-materials { display: flex; flex-direction: column; gap: 10px; }
	.item-materials > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
	.item-materials dt { display: flex; align-items: center; gap: 8px; font-size: 12px; line-height: 1.55; }
	.item-materials dd { flex-shrink: 0; font-weight: 600; }
	.total-materials { margin-top: 24px; }
	.aggregate-materials { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px 30px; }
	.number { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; font-variant-numeric: tabular-nums; }
	.muted-label { color: var(--muted-foreground); font-size: 11px; }
	.complete-message { display: flex; align-items: center; gap: 7px; color: var(--route-deep); font-size: 12px; }
	.complete-message :global(svg) { width: 16px; height: 16px; }
	.dungeon-total { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; gap: 4px; padding-left: 8px; }
	.dungeon-total strong { color: var(--route-deep); font-size: 26px; font-weight: 600; line-height: 1; letter-spacing: -.04em; }
	.dungeon-total span { color: var(--muted-foreground); font-size: 11px; }
	.dungeon-settings { padding-inline: 20px; }
	.material-name { display: block; min-width: 115px; max-width: 240px; padding-block: 3px; font-size: 12px; line-height: 1.6; white-space: normal; }
	.table-note { color: var(--muted-foreground); font-size: 11px; line-height: 1.6; }
	.methodology { display: flex; flex-direction: column; gap: 22px; margin-top: 34px; padding-top: 28px; border-top: 1px solid var(--border); }
	.method-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px 30px; }
	.method-grid h3 { margin-bottom: 7px; font-size: 13px; font-weight: 650; }
	.method-grid p { color: var(--muted-foreground); font-size: 12px; line-height: 1.8; }
	.provenance { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; color: var(--muted-foreground); font-size: 11px; line-height: 1.7; }
	@media (max-width: 1150px) {
		.workspace { grid-template-columns: minmax(0, 1fr); gap: 26px; }
		.summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		.summary-grid > :global(:last-child) { grid-column: 1 / -1; }
		.ely-value { font-size: 32px; }
		.method-grid { grid-template-columns: minmax(0, 1fr); gap: 20px; }
		.aggregate-materials { grid-template-columns: repeat(2, minmax(0, 1fr)); }
	}
	@media (max-width: 600px) {
		.enhancement-page { padding: 26px 16px; }
		.heading-copy { gap: 12px; }
		.enhancement-emblem { flex-basis: 48px; width: 48px; height: 48px; border-radius: 12px; }
		.enhancement-emblem :global(svg) { width: 24px; height: 24px; }
		.intro { font-size: 13px; }
		.source-line { margin-left: -60px; margin-top: 15px; }
		:global(.picker-fields) { grid-template-columns: minmax(0, 1fr); gap: 12px; }
		:global(.picker-action) { width: 100%; }
		.summary-grid { gap: 12px; margin-top: 20px; }
		.summary-value { font-size: 32px; }
		.ely-value { font-size: 29px; }
		.workspace { margin-top: 24px; }
		.methodology { gap: 20px; }
		.aggregate-materials { grid-template-columns: minmax(0, 1fr); gap: 14px; }
	}
</style>
