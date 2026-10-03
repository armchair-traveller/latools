<script lang="ts">
	import { asset } from '$app/paths';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import FlaskConicalIcon from '@lucide/svelte/icons/flask-conical';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import InfoIcon from '@lucide/svelte/icons/info';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Alert from '$lib/components/ui/alert';
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import {
		EQUIPMENT_SCORE_KIND_CONFIGS as configs,
		EQUIPMENT_SCORE_KIND_GROUPS as groups,
		EQUIPMENT_SCORE_EXAMPLES as examples,
		EQUIPMENT_SCORE_GRADE_LABELS as gradeLabels,
		EQUIPMENT_SCORE_PROFILE_LABELS as profileLabels,
		EQUIPMENT_SCORE_SOURCE as source,
		EQUIPMENT_SCORE_SOURCE_NOTE as sourceNote,
		calculateEquipmentScore, getEquipmentScoreRating, parseEquipmentScoreInput,
		type EquipmentScoreKind, type EquipmentScoreGrade, type EquipmentScoreProfile
	} from '$lib/equipment-score.js';

	const profiles: EquipmentScoreProfile[] = ['strMag', 'weapon', 'balance'];
	let kind = $state<EquipmentScoreKind>('weapon');
	let grade = $state<EquipmentScoreGrade>('base');
	let profile = $state<EquipmentScoreProfile>('strMag');
	let inputs = $state<Record<string, string>>({});
	let announcement = $state('');
	let config = $derived(configs[kind]);
	let values = $derived(Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, parseEquipmentScoreInput(value)])));
	let result = $derived(calculateEquipmentScore(kind, grade, profile, values));
	let rating = $derived(getEquipmentScoreRating(result.score));
	let transcendenceRating = $derived(getEquipmentScoreRating(result.transcendenceScore));
	let hasExample = $derived(Object.keys(examples[kind]).length > 0);
	let hasReferenceRows = $derived(result.rows.some((row) => !row.includeInTotal));
	let hasOverMax = $derived(result.rows.some((row) => row.current > row.max));
	const format = (value: number, decimals = 0) => value.toLocaleString('en-US', {
		minimumFractionDigits: decimals, maximumFractionDigits: decimals
	});

	function selectKind(value: string) {
		if (!Object.hasOwn(configs, value) || value === kind) return;
		kind = value as EquipmentScoreKind;
		grade = configs[kind].grades[0];
		inputs = {};
		announcement = `${configs[kind].label} selected. Option values cleared.`;
	}

	function selectGrade(value: string) {
		if (config.grades.includes(value as EquipmentScoreGrade)) grade = value as EquipmentScoreGrade;
	}

	function selectProfile(value: string) {
		if (profiles.includes(value as EquipmentScoreProfile)) profile = value as EquipmentScoreProfile;
	}

	function loadExample() {
		inputs = Object.fromEntries(Object.entries(examples[kind]).map(([key, value]) => [key, String(value)]));
		announcement = `Wiki example loaded for ${config.label}.`;
	}

	function reset() {
		inputs = {};
		announcement = 'Option values cleared.';
	}
</script>

<svelte:head>
	<title>Equipment Score · LaTale Tools</title>
	<meta name="description" content="Score your LaTale equipment with RamuWiki’s option weights, upgrade values, accuracy penalties, and comparison formulas. Supports 16 equipment types." />
	<meta property="og:title" content="Equipment Score · LaTale Tools" />
	<meta property="og:description" content="Compare your equipment’s options with the community wiki’s weighted scoring model." />
</svelte:head>

<main class="equipment-page">
	<header class="page-heading">
		<div class="heading-copy">
			<div class="equipment-emblem" aria-hidden="true">
				<img src={asset(`/equipment-score/${kind}.png`)} alt="" width="64" height="64" />
			</div>
			<div>
				<p class="eyebrow">Know your equipment</p>
				<h1>Equipment score</h1>
				<p class="intro">Turn your option values into a weighted score. Compare weapons, spirit stones, armor, and accessories using the wiki’s reference tables.</p>
				<div class="source-line">
					<span>Data by <strong lang="ko">{source.contributor}</strong></span>
					<Button href={source.url} target="_blank" rel="noreferrer" variant="link" size="sm">
						RamuWiki reference <ExternalLinkIcon data-icon="inline-end" />
					</Button>
				</div>
			</div>
		</div>
		<div class="page-actions">
			<Button variant="outline" onclick={loadExample} disabled={!hasExample}>
				<FlaskConicalIcon data-icon="inline-start" />
				{hasExample ? 'Load wiki example' : 'No wiki example'}
			</Button>
			<Button variant="ghost" size="sm" onclick={reset} disabled={!Object.keys(inputs).length}>
				<RotateCcwIcon data-icon="inline-start" /> Clear values
			</Button>
		</div>
	</header>

	<section class="configuration" aria-label="Equipment settings">
		<Field.FieldGroup class="grid gap-5 md:grid-cols-3">
			<Field.Field>
				<Field.FieldLabel for="equipment-kind">Equipment</Field.FieldLabel>
				<Select.Root type="single" bind:value={() => kind, selectKind}>
					<Select.Trigger id="equipment-kind" class="w-full">{config.label}</Select.Trigger>
					<Select.Content>
						{#each groups as group (group.label)}
							<Select.Group>
								<Select.Label>{group.label}</Select.Label>
								{#each group.kinds as option (option)}
									<Select.Item value={option} label={configs[option].label}>{configs[option].label}</Select.Item>
								{/each}
							</Select.Group>
						{/each}
					</Select.Content>
				</Select.Root>
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel id="equipment-grade-label">Upgrade stage</Field.FieldLabel>
				<ToggleGroup.Root type="single" bind:value={() => grade, selectGrade} variant="outline" class="w-full" aria-labelledby="equipment-grade-label">
					{#each config.grades as option (option)}
						<ToggleGroup.Item value={option} class="flex-1">{gradeLabels[option]}</ToggleGroup.Item>
					{/each}
				</ToggleGroup.Root>
			</Field.Field>
			<Field.Field>
				<Field.FieldLabel for="equipment-profile">Scoring profile</Field.FieldLabel>
				<Select.Root type="single" bind:value={() => profile, selectProfile}>
					<Select.Trigger id="equipment-profile" class="w-full">{profileLabels[profile]}</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each profiles as option (option)}
								<Select.Item value={option} label={profileLabels[option]}>{profileLabels[option]}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</Field.Field>
		</Field.FieldGroup>
		<p class="settings-note">Changing equipment clears the inputs. Changing the stage or profile keeps your values.</p>
	</section>

	<div class="workspace">
		<section class="option-panel" aria-labelledby="options-title">
			<Card.Root class="min-w-0 gap-0 overflow-hidden">
				<Card.Header class="pb-5">
					<Card.Title><h2 id="options-title">{config.label} options</h2></Card.Title>
					<Card.Description>Enter your current values. Scores update as you type.</Card.Description>
					<div class="option-context"><Badge variant="secondary">{gradeLabels[grade]}</Badge><span>{profileLabels[profile]}</span></div>
					{#if config.note}<p class="equipment-note">{config.note}</p>{/if}
				</Card.Header>
				<Card.Content class="px-0">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="pl-5">Option</Table.Head>
								<Table.Head class="text-right">Current</Table.Head>
								<Table.Head class="text-right">Maximum</Table.Head>
								<Table.Head class="text-right">Attainment</Table.Head>
								{#if grade === 'base'}<Table.Head class="text-right">Transcended</Table.Head>{/if}
								<Table.Head class="text-right">Weight</Table.Head>
								<Table.Head class="pr-5 text-right">Points</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each result.rows as row (`${kind}-${row.key}`)}
								<Table.Row>
									<Table.Cell class="pl-5">
										<label for={`option-${row.key}`} class="option-label" title={row.originalLabel}>{row.label}</label>
										{#if !row.includeInTotal}<Badge variant="outline">Reference only</Badge>{/if}
									</Table.Cell>
									<Table.Cell>
										<Input id={`option-${row.key}`} type="text" inputmode="decimal" autocomplete="off" class="ml-auto w-24" aria-label={`${row.label} current value`} placeholder="0" bind:value={inputs[row.key]} onblur={() => { if (inputs[row.key]) inputs[row.key] = String(parseEquipmentScoreInput(inputs[row.key])); }} />
									</Table.Cell>
									<Table.Cell class="text-right"><span class="number muted">{format(row.max, row.max % 1 ? 1 : 0)}</span></Table.Cell>
									<Table.Cell class="text-right"><span class="number">{format(row.attainment, 1)}%</span></Table.Cell>
									{#if grade === 'base'}<Table.Cell class="text-right"><span class="number muted">{format(row.transcendenceAttainment, 1)}%</span></Table.Cell>{/if}
									<Table.Cell class="text-right"><span class="number muted">{format(row.weight, 4)}</span></Table.Cell>
									<Table.Cell class="pr-5 text-right"><strong class={['number', row.contribution >= 10 && 'high-contribution']}>{format(row.contribution, 2)}</strong></Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
				<Card.Footer class="flex-col items-start gap-2 pt-4">
					<p class="table-note">Attainment = current ÷ maximum, capped at 100%. Points = attainment × weight. Scroll the table to see all columns on smaller screens.</p>
					{#if hasReferenceRows}<p class="table-note">“Reference only” rows show their points but are excluded from both score totals, matching the wiki.</p>{/if}
					{#if hasOverMax}<p class="table-note">Some values exceed this stage’s maximum. Their attainment is capped at 100%.</p>{/if}
				</Card.Footer>
			</Card.Root>
		</section>

		<aside class="score-sidebar" aria-label="Equipment score results">
			<Card.Root>
				<Card.Header>
					<Card.Title><h2>Final item score</h2></Card.Title>
					<Card.Description>Weighted option total{config.penalty ? ', after accuracy penalty' : ''}</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-4">
					<div class="score-result" aria-live="polite" aria-atomic="true">
						<output class="score-number" data-testid="equipment-score" aria-label="Final item score">{format(result.score, 2)}</output>
						<Badge variant={result.score >= 84 ? 'secondary' : 'outline'}>{rating.label}</Badge>
					</div>
					<progress value={Math.min(100, result.score)} max="100" aria-label="Final score out of 100">{format(result.score, 2)}</progress>
					<p class="score-description">{rating.description}</p>
					{#if result.penalty > 0}
						<div class="penalty-line"><span>Accuracy penalty</span><strong class="number">−{format(result.penalty, 2)}</strong></div>
					{/if}
					{#if grade === 'base'}
						<div class="comparison-result">
							<h3>Transcended score</h3>
							<div class="score-result">
								<output class="comparison-number" data-testid="transcendence-score" aria-label="Transcended score">{format(result.transcendenceScore, 2)}</output>
								<span class="rating-label">{transcendenceRating.label}</span>
							</div>
							<p class="score-description">Projected score after transcending your options. Use this score to compare items.</p>
						</div>
					{/if}
					{#if result.comparisonScore !== null}
						<div class="comparison-result">
							<h3>{config.comparisonLabel}</h3>
							<output class="comparison-number" data-testid="comparison-score" aria-label={config.comparisonLabel}>{format(result.comparisonScore, 2)}</output>
							<p class="score-description">Converted with the wiki’s reference formula.</p>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header><Card.Title><h2>Score guide</h2></Card.Title></Card.Header>
				<Card.Content>
					<dl class="score-guide">
						<div><dt>90 and above</dt><dd>Mythic</dd></div>
						<div><dt>84 to &lt;90</dt><dd>Near-mythic</dd></div>
						<div><dt>70 to &lt;84</dt><dd>Transcendent</dd></div>
						<div><dt>Below 70</dt><dd>Developing</dd></div>
					</dl>
				</Card.Content>
			</Card.Root>
		</aside>
	</div>

	<section class="methodology" aria-labelledby="methodology-title">
		<div class="method-heading"><p class="eyebrow">Behind the score</p><h2 id="methodology-title">How the wiki scores equipment</h2></div>
		<div class="method-grid">
			<div><h3>Each option has its own weight</h3><p>Equal average percentages across five options can produce different scores. Maximum and minimum damage are weighted relative to critical damage; All Stats and Strength/Magic account for their HP benefit.</p></div>
			<div><h3>Use the correct reference</h3><p>Back Attack Damage is treated as a useful option; penetration is excluded from ordinary weapon options. Hat scores subtract the reference table’s accuracy shortfall penalty.</p></div>
			<div><h3>Compare across equipment sets</h3><p>Garden combined armor uses the wiki’s Icarus/Grendel conversion. Tears accessories use its Belial conversion. These formulas are applied as published, including results that fall to zero.</p></div>
			<div><h3>Read grades in context</h3><p>Icarus/Grendel tables set a higher bar. The wiki suggests interpreting their grade thresholds about 10 points lower; the displayed grade uses the same thresholds as the original tool.</p></div>
		</div>
		<Alert.Root>
			<InfoIcon />
			<Alert.Title>Reference model</Alert.Title>
			<Alert.Description><p>{sourceNote}</p><p>Use these scores alongside your class, dungeon, build, and budget when choosing equipment.</p></Alert.Description>
		</Alert.Root>
		<p class="provenance">Wiki data snapshot · {source.retrievedAt} · 16 equipment types · 3 scoring profiles</p>
	</section>
	<p class="sr-only" role="status">{announcement}</p>
</main>

<style>
	.equipment-page { max-width: 1500px; margin: 0 auto; padding: 36px 28px 28px; }
	.page-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; padding-bottom: 26px; }
	.heading-copy { display: flex; gap: 18px; min-width: 0; }
	.equipment-emblem { display: grid; flex: 0 0 76px; width: 76px; height: 76px; place-items: center; border: 1px solid var(--border); border-radius: 20px; background: var(--card); }
	.equipment-emblem img { object-fit: contain; image-rendering: pixelated; }
	.eyebrow { margin: 0 0 6px; color: var(--route-deep); font: 700 10px ui-monospace, monospace; letter-spacing: .13em; text-transform: uppercase; }
	h1 { margin: 0; font-family: var(--font-serif); font-size: clamp(2rem, 3.2vw, 2.75rem); font-weight: 600; letter-spacing: -.035em; line-height: 1.13; }
	.intro { max-width: 650px; margin-top: 12px; color: var(--muted-foreground); font-size: 14px; line-height: 1.7; }
	.source-line { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 10px; color: var(--muted-foreground); font-size: 12px; }
	.page-actions { display: flex; flex-shrink: 0; flex-direction: column; align-items: flex-end; gap: 6px; padding-top: 7px; }
	.configuration { padding: 23px 0 18px; border-block: 1px solid var(--border); }
	.settings-note { margin: 13px 0 0; color: var(--muted-foreground); font-size: 11px; }
	.workspace { display: grid; grid-template-columns: minmax(0, 1fr) 280px; align-items: start; gap: 20px; margin-top: 24px; }
	.option-panel { min-width: 0; }
	.option-context { display: flex; align-items: center; gap: 10px; margin-top: 6px; color: var(--muted-foreground); font-size: 12px; }
	.equipment-note { margin-top: 6px; color: var(--route-deep); font-size: 12px; line-height: 1.6; }
	.option-label { display: block; min-width: 132px; max-width: 170px; padding-block: 6px; white-space: normal; font-size: 12px; font-weight: 550; line-height: 1.5; }
	.number { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; font-variant-numeric: tabular-nums; }
	.muted { color: var(--muted-foreground); }
	.high-contribution { color: var(--route-deep); }
	.table-note { color: var(--muted-foreground); font-size: 11px; line-height: 1.6; }
	.score-sidebar { display: flex; flex-direction: column; gap: 16px; }
	.score-result { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
	.score-number, .comparison-number { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric: tabular-nums; font-weight: 650; letter-spacing: -.06em; line-height: 1; }
	.score-number { font-size: 43px; }
	.comparison-number { display: block; margin: 10px 0; font-size: 29px; }
	progress { display: block; appearance: none; width: 100%; height: 7px; overflow: hidden; border: 0; border-radius: 99px; background: var(--muted); color: var(--route-accent); }
	progress::-webkit-progress-bar { border-radius: 99px; background: var(--muted); }
	progress::-webkit-progress-value { border-radius: 99px; background: var(--route-accent); }
	progress::-moz-progress-bar { border-radius: 99px; background: var(--route-accent); }
	.score-description { color: var(--muted-foreground); font-size: 12px; line-height: 1.7; }
	.penalty-line { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 14px; border-top: 1px solid var(--border); font-size: 12px; }
	.comparison-result { border-top: 1px solid var(--border); padding-top: 16px; }
	.comparison-result h3 { font-size: 12px; font-weight: 650; }
	.rating-label { color: var(--muted-foreground); font-size: 11px; }
	.score-guide { display: flex; flex-direction: column; gap: 12px; font-size: 12px; }
	.score-guide div { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
	.score-guide dt { font-weight: 550; font-variant-numeric: tabular-nums; }
	.score-guide dd { color: var(--muted-foreground); }
	.methodology { display: flex; flex-direction: column; gap: 24px; margin-top: 32px; padding-top: 28px; border-top: 1px solid var(--border); }
	.method-heading h2 { font-family: var(--font-serif); font-size: 25px; font-weight: 500; letter-spacing: -.02em; }
	.method-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px 40px; }
	.method-grid h3 { margin-bottom: 7px; font-size: 13px; font-weight: 650; }
	.method-grid p { color: var(--muted-foreground); font-size: 12px; line-height: 1.8; }
	.provenance { color: var(--muted-foreground); font-size: 11px; }
	@media (max-width: 1400px) {
		.workspace { grid-template-columns: minmax(0, 1fr); }
		.score-sidebar { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
		.page-heading { flex-direction: column; gap: 12px; }
		.page-actions { flex-direction: row; align-items: center; padding: 0; }
	}
	@media (max-width: 600px) {
		.equipment-page { padding: 26px 16px; }
		.heading-copy { gap: 12px; }
		.equipment-emblem { flex-basis: 48px; width: 48px; height: 48px; border-radius: 12px; }
		.equipment-emblem img { width: 40px; height: 40px; }
		.intro { font-size: 13px; }
		.source-line { margin-left: -60px; margin-top: 15px; }
		.score-sidebar, .method-grid { grid-template-columns: 1fr; }
		.workspace { gap: 16px; }
		.methodology { gap: 20px; }
	}
</style>
