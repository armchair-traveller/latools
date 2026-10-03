<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import SaveIcon from '@lucide/svelte/icons/save';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import SlidersIcon from '@lucide/svelte/icons/sliders-horizontal';
	import SwordsIcon from '@lucide/svelte/icons/swords';
	import GitCompareIcon from '@lucide/svelte/icons/git-compare-arrows';
	import ChartIcon from '@lucide/svelte/icons/chart-no-axes-combined';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import PrinterIcon from '@lucide/svelte/icons/printer';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Switch } from '$lib/components/ui/switch';
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import * as Select from '$lib/components/ui/select';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import * as Table from '$lib/components/ui/table';
	import * as Alert from '$lib/components/ui/alert';
	import * as Empty from '$lib/components/ui/empty';
	import * as Sheet from '$lib/components/ui/sheet';
	import StatEditor from '$lib/components/spec-analyzer/stat-editor.svelte';
	import {
		JOBS,
		DIRECT_SKILLS,
		PLACEMENT_SKILLS,
		DUNGEONS,
		SUMMONS,
		SPEC_ANALYZER_DATA_META,
		DEFAULT_ENCHANT_OPTION,
		aggregateStats,
		calculateConversionSummary,
		calculateDamageEfficiency,
		calculateBuildEfficiency,
		compareEnchants,
		calculateHitIndicator,
		calculateSummonReflection,
		inferPlacementMultiplier,
		placementCoefficients,
		parseNumericInput,
		directSkillCoefficient,
		calcDirectHitDamage,
		calcPlacementDamage,
		inspectNumericInput,
		resolveDungeon,
		type EnchantOptionKey,
		type NumericExpression,
		type Scenario,
		type DirectSkill,
		type PlacementSkill
	} from '$lib/spec-analyzer.js';
	import {
		WORKSPACE_KEY,
		createSpecification,
		readSpecification,
		readSavedSpecifications,
		formatNumber as num,
		formatDamage as damage,
		formatChange as change,
		type SavedSpecification,
		type Specification
	} from '$lib/spec-analyzer-workspace';

	const tabs = [
		{ id: 'character', label: 'Character', icon: SlidersIcon },
		{ id: 'damage', label: 'Damage', icon: SwordsIcon },
		{ id: 'compare', label: 'Compare', icon: GitCompareIcon },
		{ id: 'builds', label: 'Builds', icon: ChartIcon },
		{ id: 'reference', label: 'Reference', icon: BookOpenIcon }
	] as const;
	type Tab = (typeof tabs)[number]['id'];
	const aliases: Record<string, Tab> = {
		base: 'character',
		efficiency: 'damage',
		enchant: 'compare',
		setting: 'builds',
		skills: 'reference',
		indicators: 'reference',
		coefficients: 'reference'
	};
	function getTab(value: string | null): Tab {
		return (
			tabs.find((t) => t.id === value)?.id ??
			aliases[value ?? ''] ??
			'character'
		);
	}
	let activeTab = $derived(getTab(page.url.searchParams.get('tab')));
	let spec = $state<Specification>(createSpecification());
	let saved = $state<SavedSpecification[]>([]);
	let ready = $state(false);
	let storageAvailable = $state(true);
	let status = $state('');
	let libraryOpen = $state(false);
	let name = $state('My specification');
	let loadedId = $state('');
	let importInput: HTMLInputElement;
	let target = $state<'normal' | 'boss'>('boss');
	let skillQuery = $state('');
	let skillKind = $state<'direct' | 'placement'>('direct');
	let filterJob = $state('all');
	let indicatorCoefficient = $state<NumericExpression>(17000);
	let reflection = $state<NumericExpression>(148);
	let measuredDamage = $state<NumericExpression>(0);
	let fileError = $state('');

	const enchantFields: {
		key: EnchantOptionKey;
		label: string;
		group: string;
	}[] = [
		{ key: 'strMagAll', label: 'All stats +', group: 'Core stats' },
		{ key: 'strMagAllPercent', label: 'All stats %', group: 'Core stats' },
		{ key: 'weaponAttr', label: 'Attack / intensity +', group: 'Core stats' },
		{
			key: 'weaponAttrPercent',
			label: 'Attack / intensity %',
			group: 'Core stats'
		},
		{
			key: 'strMagEfficiency',
			label: 'Strength / magic efficiency %',
			group: 'Core stats'
		},
		{ key: 'fixedDmg', label: 'Static damage +', group: 'Core stats' },
		{ key: 'fixedDmgPercent', label: 'Static damage %', group: 'Core stats' },
		{ key: 'minDmg', label: 'Minimum damage +', group: 'Damage' },
		{ key: 'maxDmg', label: 'Maximum damage +', group: 'Damage' },
		{ key: 'critDmg', label: 'Critical damage +', group: 'Damage' },
		{ key: 'finalMinDmg', label: 'Final minimum damage %', group: 'Damage' },
		{ key: 'finalMaxDmg', label: 'Final maximum damage %', group: 'Damage' },
		{ key: 'finalCritDmg', label: 'Final critical damage %', group: 'Damage' },
		{
			key: 'normalDmgPercent',
			label: 'Normal extra damage %',
			group: 'Damage'
		},
		{ key: 'bossDmgPercent', label: 'Boss extra damage %', group: 'Damage' },
		{
			key: 'normalDomination',
			label: 'Normal amplification %',
			group: 'Other bonuses'
		},
		{
			key: 'bossDomination',
			label: 'Boss amplification %',
			group: 'Other bonuses'
		},
		{
			key: 'backAttackDmg',
			label: 'Back-attack damage %',
			group: 'Other bonuses'
		},
		{
			key: 'directHitSkillLevel',
			label: 'Direct skill levels',
			group: 'Other bonuses'
		},
		{
			key: 'placementSkillLevel',
			label: 'Placed skill levels',
			group: 'Other bonuses'
		},
		{ key: 'hpPercent', label: 'Maximum HP %', group: 'Other bonuses' },
		{ key: 'stamina', label: 'Stamina +', group: 'Other bonuses' }
	];
	const scenarios: { id: Scenario; label: string }[] = [
		{ id: 'normal', label: 'Dungeon · normal' },
		{ id: 'boss', label: 'Dungeon · boss' },
		{ id: 'theory', label: 'No defense · normal' },
		{ id: 'boss-theory', label: 'No defense · boss' }
	];
	const hpFields = [
		{ key: 'stamina', label: 'Current stamina' },
		{ key: 'maxHp', label: 'Current maximum HP' },
		{ key: 'staminaMinus10', label: 'Stamina after −10% basic stats' },
		{ key: 'maxHpMinus10', label: 'HP after −10% basic stats' }
	] as const;

	let job = $derived(
		JOBS.find((x) => x.id === spec.selections.jobId) ?? JOBS[0]
	);
	let directSkills = $derived(
		DIRECT_SKILLS.filter((x) => x.job === job.name || x.job === 'All Classes')
	);
	let placedSkills = $derived(
		PLACEMENT_SKILLS.filter(
			(x) => x.job === job.name || x.job === 'All Classes'
		)
	);
	let direct = $derived(
		DIRECT_SKILLS.find((x) => x.id === spec.selections.directSkillId) ??
			directSkills[0]
	);
	let placed = $derived(
		PLACEMENT_SKILLS.find((x) => x.id === spec.selections.placementSkillId) ??
			placedSkills[0]
	);
	let dungeon = $derived(
		DUNGEONS.find((x) => x.id === spec.selections.dungeonId) ?? DUNGEONS[0]
	);
	let resolvedDungeon = $derived(resolveDungeon(dungeon, spec.settings));
	let stats = $derived(aggregateStats(spec.inputs));
	let coefficient = $derived(
		spec.overrides.enabled
			? parseNumericInput(spec.overrides.direct)
			: directSkillCoefficient(direct, spec.selections.directSkillLevel)
	);
	let calculationPlaced = $derived(
		spec.overrides.enabled
			? {
					...placed,
					weaponCoefficient: parseNumericInput(spec.overrides.placedWeapon),
					strengthBase:
						parseNumericInput(spec.overrides.placedReflection) / 100,
					strengthPerLevel: 0
				}
			: placed
	);
	let placedCoefficients = $derived(
		placementCoefficients(
			calculationPlaced,
			spec.selections.placementSkillLevel
		)
	);
	let calculation = $derived({
		stats,
		directCoefficient: coefficient,
		placementSkill: calculationPlaced,
		placementSkillLevel: spec.selections.placementSkillLevel,
		dungeon: resolvedDungeon,
		backAttackRate: spec.settings.backAttackRate,
		damageMode: spec.settings.damageMode,
		referenceStat: spec.settings.referenceStat,
		settings: spec.settings
	});
	let efficiency = $derived(calculateDamageEfficiency(calculation));
	let hitRanges = $derived(
		[true, false].flatMap((critical) => {
			const options = {
				stats,
				scenario: target,
				dungeon: resolvedDungeon,
				backAttackRate: spec.settings.backAttackRate,
				critical
			};
			return [
				{
					id: `direct-${critical}`,
					label: 'Direct hit',
					critical,
					result: calcDirectHitDamage({ ...options, coefficient })
				},
				{
					id: `placed-${critical}`,
					label: 'Placed skill',
					critical,
					result: calcPlacementDamage({
						...options,
						skill: calculationPlaced,
						skillLevel: spec.selections.placementSkillLevel
					})
				}
			];
		})
	);
	let validCharacter = $derived(
		Object.entries(spec.inputs).every(
			([key, value]) =>
				typeof value === 'boolean' ||
				key === 'summonId' ||
				inspectNumericInput(value).valid
		)
	);

	let conversion = $derived(
		calculateConversionSummary(stats, { criterion: target })
	);
	let comparison = $derived(
		compareEnchants({
			...calculation,
			inputs: spec.inputs,
			directSkill: spec.overrides.enabled ? { ...direct, perLevel: 0 } : direct,
			oldEnchant: spec.oldEnchant,
			newEnchant: spec.newEnchant,
			hpCalibration: spec.hpCalibration
		})
	);
	let build = $derived(calculateBuildEfficiency(calculation));
	let isSample = $derived(
		JSON.stringify(spec.inputs) === JSON.stringify(createSpecification().inputs)
	);
	let hasUpgrade = $derived(
		enchantFields.some(
			(x) =>
				parseNumericInput(spec.oldEnchant[x.key]) !==
				parseNumericInput(spec.newEnchant[x.key])
		)
	);
	let validComparison = $derived(
		validCharacter &&
			enchantFields.every(
				(field) =>
					inspectNumericInput(spec.oldEnchant[field.key]).valid &&
					inspectNumericInput(spec.newEnchant[field.key]).valid
			)
	);
	let referenceName = $derived(
		{
			crit: 'critical damage',
			minimum: 'minimum damage',
			maximum: 'maximum damage',
			minmax: 'min. + max. damage'
		}[spec.settings.referenceStat]
	);
	let catalog = $derived(
		(skillKind === 'direct' ? DIRECT_SKILLS : PLACEMENT_SKILLS).filter(
			(skill) =>
				(filterJob === 'all' ||
					skill.job === JOBS.find((x) => x.id === filterJob)?.name) &&
				`${skill.name} ${skill.sourceName} ${skill.job}`
					.toLocaleLowerCase()
					.includes(skillQuery.trim().toLocaleLowerCase())
		)
	);
	let indicator = $derived(calculateHitIndicator(stats, indicatorCoefficient));
	let reflected = $derived(calculateSummonReflection(stats, reflection));
	let inferred = $derived(
		inferPlacementMultiplier({
			stats,
			skill: calculationPlaced,
			skillLevel: spec.selections.placementSkillLevel,
			dungeon: resolvedDungeon,
			measuredBossDamage: measuredDamage,
			mode: spec.settings.damageMode
		})
	);

	function switchTab(tab: Tab) {
		void goto(resolve(`/spec-analyzer?tab=${tab}`), {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}
	function setJob(id: string) {
		if (!id) return;
		if (id === 'custom') {
			spec.selections.jobId = 'custom';
			spec.overrides.enabled = true;
			return;
		}
		const next = JOBS.find((x) => x.id === id);
		if (!next) return;
		spec.selections.jobId = id;
		spec.overrides.enabled = false;
		spec.selections.directSkillId = (
			DIRECT_SKILLS.find((x) => x.job === next.name) ??
			DIRECT_SKILLS.find((x) => x.job === 'All Classes') ??
			DIRECT_SKILLS[0]
		).id;
		spec.selections.placementSkillId = (
			PLACEMENT_SKILLS.find((x) => x.job === next.name) ??
			PLACEMENT_SKILLS.find((x) => x.job === 'All Classes') ??
			PLACEMENT_SKILLS[0]
		).id;
		spec.selections.directSkillLevel = 0;
		spec.selections.placementSkillLevel = 0;
	}
	function useSkill(skill: DirectSkill | PlacementSkill) {
		const selectedJob = JOBS.find((x) => x.name === skill.job);
		if (selectedJob && skill.job !== 'All Classes') setJob(selectedJob.id);
		spec.overrides.enabled = false;
		if ('baseCoefficient' in skill) spec.selections.directSkillId = skill.id;
		else spec.selections.placementSkillId = skill.id;
		status = `${skill.name} selected.`;
		switchTab('damage');
	}
	function saveSpec() {
		const trimmed = name.trim();
		if (!trimmed) {
			status = 'Enter a name for this specification.';
			return;
		}
		const id = loadedId || crypto.randomUUID();
		const item = {
			id,
			name: trimmed.slice(0, 80),
			savedAt: new Date().toISOString(),
			specification: $state.snapshot(spec)
		};
		saved = [item, ...saved.filter((x) => x.id !== id)].slice(0, 100);
		loadedId = id;
		status = `Saved “${item.name}” in this browser.`;
	}
	function loadSpec(item: SavedSpecification) {
		spec = structuredClone($state.snapshot(item.specification));
		name = item.name;
		loadedId = item.id;
		status = `Loaded “${item.name}”.`;
		libraryOpen = false;
	}
	function reset(sample: boolean) {
		spec = createSpecification();
		loadedId = '';
		name = sample ? 'Sample character' : 'My specification';
		if (!sample) {
			for (const key of Object.keys(
				spec.inputs
			) as (keyof typeof spec.inputs)[]) {
				if (typeof spec.inputs[key] === 'number' && key !== 'characterLevel')
					(spec.inputs as unknown as Record<string, unknown>)[key] = 0;
			}
			spec.inputs.summonId = 'none';
		}
		status = sample
			? 'Sample character loaded.'
			: 'Started a blank specification.';
	}
	function exportSpec() {
		const blob = new Blob(
			[
				JSON.stringify(
					{
						format: 'latale-specification',
						version: 3,
						name,
						specification: $state.snapshot(spec)
					},
					null,
					2
				)
			],
			{ type: 'application/json' }
		);
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'latale-specification.json';
		link.click();
		URL.revokeObjectURL(url);
		status = 'Specification exported.';
	}
	async function importSpec(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		try {
			if (file.size > 1_000_000)
				throw new Error('Choose a specification JSON file smaller than 1 MB.');
			const payload = JSON.parse(await file.text());
			const imported = readSpecification(
				payload.specification ?? payload.state ?? payload,
				{ legacy: !!payload.state }
			);
			if (!imported)
				throw new Error('This file does not contain a valid specification.');
			spec = imported;
			loadedId = '';
			name =
				typeof payload.name === 'string'
					? payload.name.slice(0, 80)
					: 'Imported specification';
			status = 'Specification imported. Save it to add it to your library.';
			fileError = '';
			libraryOpen = false;
		} catch (error) {
			fileError =
				error instanceof Error ? error.message : 'Could not read that file.';
		}
		input.value = '';
	}
	onMount(() => {
		try {
			const raw = localStorage.getItem(WORKSPACE_KEY);
			if (raw) {
				const data = JSON.parse(raw);
				const restored = readSpecification(data.specification);
				if (restored) spec = restored;
				saved = readSavedSpecifications(data.saved);
				if (typeof data.name === 'string') name = data.name.slice(0, 80);
				if (
					typeof data.loadedId === 'string' &&
					saved.some((x) => x.id === data.loadedId)
				)
					loadedId = data.loadedId;
			} else {
				const legacy = localStorage.getItem('latale-spec-analyzer-v2');
				if (legacy) {
					const data = JSON.parse(legacy);
					saved = readSavedSpecifications(data.savedSpecs);
					const previous = readSpecification(data.state, { legacy: true });
					if (previous) spec = previous;
					status =
						'Previous saved specifications are available in Saved builds. Calculations now use the updated model.';
				}
			}
		} catch {
			status =
				'Browser storage could not be read. You can still import and export specifications.';
		}
		ready = true;
	});
	$effect(() => {
		const payload = JSON.stringify({
			specification: spec,
			saved,
			name,
			loadedId
		});
		if (ready) {
			try {
				localStorage.setItem(WORKSPACE_KEY, payload);
				storageAvailable = true;
			} catch {
				storageAvailable = false;
			}
		}
	});
</script>

<svelte:head>
	<title>Specification Analyzer · LaTale Tools</title>
	<meta
		name="description"
		content="Understand your LaTale character. Calculate damage, compare equipment upgrades, explore stat efficiency, and save your builds."
	/>
</svelte:head>

{#snippet selectTrigger(id: string, label: string)}
	<Select.Trigger {id} class="w-full min-w-0">
		<span class="truncate">{label}</span>
	</Select.Trigger>
{/snippet}
{#snippet deltaBadge(value: number)}
	<Badge
		variant={value < 0 ? 'destructive' : value > 0 ? 'default' : 'outline'}
	>
		{change(value)}
	</Badge>
{/snippet}
{#snippet damageSummary()}
	<section class="damage-summary" aria-label="Damage preview">
		{#if !validCharacter}<p class="small-note">
				Correct the highlighted stat expressions to see your damage preview.
			</p>{:else}
			<div class="summary-heading">
				<span class="eyebrow">DAMAGE PREVIEW</span>
				<Badge variant="outline">
					{spec.settings.damageMode === 'average'
						? 'Average roll'
						: 'Maximum roll'} · critical hit
				</Badge>
			</div>
			<div class="summary-values">
				<div>
					<span>Direct hit · {target}</span>
					<strong data-testid="direct-damage">
						{damage(efficiency.direct[target].damage)}
					</strong>
					<small>{num(efficiency.direct[target].damage)} damage</small>
				</div>
				<div>
					<span>Placed skill · {target}</span>
					<strong data-testid="placed-damage">
						{damage(efficiency.placement[target].damage)}
					</strong>
					<small>{num(efficiency.placement[target].damage)} damage</small>
				</div>
			</div>
			<div class="summary-footer">
				<span>
					{dungeon.name}{spec.settings.useCustomDungeonStats
						? ' · custom defenses'
						: ''}
				</span>
				<span>Per hit, before skill hit count</span>
			</div>{/if}
	</section>
{/snippet}
{#snippet targetToggle()}
	<ToggleGroup.Root
		type="single"
		value={target}
		onValueChange={(v) => {
			if (v === 'normal' || v === 'boss') target = v;
		}}
		variant="outline"
		size="sm"
		aria-label="Target type"
	>
		<ToggleGroup.Item value="normal">Normal</ToggleGroup.Item><ToggleGroup.Item
			value="boss"
		>
			Boss
		</ToggleGroup.Item>
	</ToggleGroup.Root>
{/snippet}

<div class="analyzer">
	<header class="page-heading">
		<div>
			<p class="eyebrow">THE CHARACTER WORKBENCH</p>
			<h1>
				Specification Analyzer
				<span>.</span>
			</h1>
			<p class="intro">Know your stats. Find your next upgrade.</p>
		</div>
		<div class="heading-actions print:hidden">
			<Button variant="outline" onclick={() => (libraryOpen = true)}>
				<FolderOpenIcon data-icon="inline-start" />Saved builds{#if saved.length}<span
					>
						({saved.length})
					</span>{/if}
			</Button>
			<Button
				onclick={() => {
					libraryOpen = true;
				}}
			>
				<SaveIcon data-icon="inline-start" />Save build
			</Button>
		</div>
	</header>
	<div class="workspace-status">
		<span>
			{storageAvailable
				? 'Changes saved in this browser'
				: 'Browser storage unavailable · export to keep your work'}
		</span>
		<span class="status-message" role="status">{status}</span>
	</div>
	{#if fileError}<Alert.Root variant="destructive">
			<Alert.Title>Import failed</Alert.Title><Alert.Description>
				{fileError}
			</Alert.Description>
		</Alert.Root>{/if}

	<div
		class="workspace-nav print:hidden"
		role="navigation"
		aria-label="Analyzer sections"
	>
		{#each tabs as tab (tab.id)}<a
				href={resolve(`/spec-analyzer?tab=${tab.id}`)}
				aria-current={activeTab === tab.id ? 'page' : undefined}
				data-sveltekit-noscroll
				data-sveltekit-replacestate
			>
				<tab.icon aria-hidden="true" />
				<span>{tab.label}</span>
			</a>{/each}
	</div>

	<section class="setup" aria-label="Skill and dungeon selection">
		<Field.Group class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<Field.Field>
				<Field.Label for="job">Class</Field.Label><Select.Root
					type="single"
					value={spec.selections.jobId}
					onValueChange={setJob}
				>
					{@render selectTrigger(
						'job',
						spec.selections.jobId === 'custom' ? 'Custom / Idol' : job.name
					)}<Select.Content>
						<Select.Group>
							{#each JOBS as item (item.id)}<Select.Item value={item.id}>
									{item.name}
								</Select.Item>{/each}<Select.Item value="custom">
								Custom / Idol
							</Select.Item>
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</Field.Field>
			<Field.Field>
				<Field.Label for="dungeon">Dungeon</Field.Label><Select.Root
					type="single"
					bind:value={spec.selections.dungeonId}
				>
					{@render selectTrigger('dungeon', dungeon.name)}<Select.Content>
						<Select.Group>
							{#each DUNGEONS as item (item.id)}<Select.Item value={item.id}>
									{item.name}
								</Select.Item>{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</Field.Field>
			<Field.Field>
				<Field.Label for="direct-skill">Direct-hit skill</Field.Label>
				<div class="skill-control">
					<Select.Root
						type="single"
						bind:value={spec.selections.directSkillId}
						disabled={spec.overrides.enabled}
					>
						{@render selectTrigger('direct-skill', direct.name)}<Select.Content>
							<Select.Group>
								{#each directSkills as item (item.id)}<Select.Item
										value={item.id}
									>
										{item.name}
									</Select.Item>{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root><Input
						aria-label="Additional direct skill levels"
						title="Additional direct skill levels"
						type="number"
						min="0"
						bind:value={spec.selections.directSkillLevel}
						disabled={spec.overrides.enabled}
					/>
				</div>
			</Field.Field>
			<Field.Field>
				<Field.Label for="placed-skill">Placed skill</Field.Label>
				<div class="skill-control">
					<Select.Root
						type="single"
						bind:value={spec.selections.placementSkillId}
						disabled={spec.overrides.enabled}
					>
						{@render selectTrigger('placed-skill', placed.name)}<Select.Content>
							<Select.Group>
								{#each placedSkills as item (item.id)}<Select.Item
										value={item.id}
									>
										{item.name}
									</Select.Item>{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root><Input
						aria-label="Additional placed skill levels"
						title="Additional placed skill levels"
						type="number"
						min="0"
						bind:value={spec.selections.placementSkillLevel}
						disabled={spec.overrides.enabled}
					/>
				</div>
			</Field.Field>
		</Field.Group>
		<p class="setup-note">
			Skill levels are additional levels above the catalog base. Common skills
			are available for every class.
		</p>
		<details class="manual-settings" open={spec.selections.jobId === 'custom'}>
			<summary>Manual skill coefficients</summary>
			<Field.Group class="mt-3 gap-3">
				<Field.Field orientation="horizontal">
					<Switch
						id="manual-coefficients"
						bind:checked={spec.overrides.enabled}
						disabled={spec.selections.jobId === 'custom'}
					/><Field.Label for="manual-coefficients">
						Use my own coefficients
					</Field.Label>
				</Field.Field>
				{#if spec.overrides.enabled}<Field.Group
						class="grid gap-3 sm:grid-cols-3"
					>
						<Field.Field>
							<Field.Label for="manual-direct">
								Direct coefficient
							</Field.Label><Input
								id="manual-direct"
								bind:value={spec.overrides.direct}
							/>
						</Field.Field><Field.Field>
							<Field.Label for="manual-weapon">
								Placed weapon coefficient
							</Field.Label><Input
								id="manual-weapon"
								bind:value={spec.overrides.placedWeapon}
							/>
						</Field.Field><Field.Field>
							<Field.Label for="manual-reflection">
								Placed reflection %
							</Field.Label><Input
								id="manual-reflection"
								bind:value={spec.overrides.placedReflection}
							/>
						</Field.Field>
					</Field.Group>
					<p class="small-note">
						Use this for classes or skills missing from the catalog. Enter full
						coefficients including skill levels; skill-level bonuses in Compare
						have no effect in manual mode.
					</p>{/if}
			</Field.Group>
		</details>
	</section>

	{#if activeTab === 'character'}
		<div class="section-heading">
			<div>
				<p class="eyebrow">01 / YOUR STARTING POINT</p>
				<h2>Build your character sheet</h2>
			</div>
			{#if isSample}<Badge variant="secondary">Example stats loaded</Badge>{/if}
		</div>
		<div class="character-grid">
			<Card.Root>
				<Card.Header>
					<Card.Title>Character stats</Card.Title><Card.Description>
						Enter your buffed values from the detailed Status Window.
					</Card.Description>
				</Card.Header><Card.Content>
					<StatEditor bind:inputs={spec.inputs} />
				</Card.Content>
			</Card.Root>
			<aside class="results-column">
				<div class="flex justify-between items-center">
					<h3>At a glance</h3>
					{@render targetToggle()}
				</div>
				{@render damageSummary()}
				<Card.Root>
					<Card.Header>
						<Card.Title>Summon bonus</Card.Title><Card.Description>
							Add only a summon that is not already included in your entered
							stats.
						</Card.Description>
					</Card.Header><Card.Content>
						<Field.Group>
							<Field.Field>
								<Field.Label for="summon">
									Additional summon
								</Field.Label><Select.Root
									type="single"
									bind:value={spec.inputs.summonId}
								>
									{@render selectTrigger(
										'summon',
										SUMMONS.find((x) => x.id === spec.inputs.summonId)?.name ??
											'None'
									)}<Select.Content>
										<Select.Group>
											{#each SUMMONS as item (item.id)}<Select.Item
													value={item.id}
												>
													{item.name}
												</Select.Item>{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root><Field.Description>
									Select None if you entered stats with your summon active.
									Bonuses use the reference’s maximum summon level.
								</Field.Description>
							</Field.Field>
						</Field.Group>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header>
						<Card.Title>What is 1% worth?</Card.Title><Card.Description>
							Flat stat equivalent of one additional percentage point.
						</Card.Description>
					</Card.Header><Card.Content>
						<dl class="conversion-list">
							{#each [{ key: 'strMag', label: 'Strength / magic' }, { key: 'weaponAttr', label: 'Attack / intensity' }, { key: 'criticalDamage', label: 'Critical damage' }, { key: 'fixedDamage', label: 'Static damage' }] as row (row.key)}<div
								>
									<dt>{row.label}</dt>
									<dd>{num(stats[row.key as 'strMag'].per1Pct, 2)}</dd>
								</div>{/each}
						</dl>
					</Card.Content><Card.Footer>
						<Button variant="ghost" onclick={() => switchTab('damage')}>
							Explore damage efficiency<ArrowRightIcon data-icon="inline-end" />
						</Button>
					</Card.Footer>
				</Card.Root>
				<p class="small-note">
					These are estimates from the community model. Placed-skill reflection
					coefficients are estimates, and balance can differ between regions.
				</p>
			</aside>
		</div>
	{:else if activeTab === 'damage'}
		<div class="section-heading">
			<div>
				<p class="eyebrow">02 / MAKE EVERY STAT COUNT</p>
				<h2>Damage & efficiency</h2>
			</div>
			{@render targetToggle()}
		</div>
		{@render damageSummary()}
		<Card.Root class="mt-5">
			<Card.Header>
				<Card.Title>Calculation settings</Card.Title><Card.Description>
					Use the same conditions when comparing two builds.
				</Card.Description>
			</Card.Header><Card.Content>
				<Field.Group class="grid gap-4 sm:grid-cols-3">
					<Field.Field>
						<Field.Label for="damage-mode">Damage roll</Field.Label><Select.Root
							type="single"
							bind:value={spec.settings.damageMode}
						>
							{@render selectTrigger(
								'damage-mode',
								spec.settings.damageMode === 'average' ? 'Average' : 'Maximum'
							)}<Select.Content>
								<Select.Group>
									<Select.Item value="average">Average</Select.Item><Select.Item
										value="maximum"
									>
										Maximum
									</Select.Item>
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</Field.Field>
					<Field.Field>
						<Field.Label for="back-attack-rate">
							Back-attack rate %
						</Field.Label><Input
							id="back-attack-rate"
							type="number"
							min="0"
							max="100"
							bind:value={spec.settings.backAttackRate}
						/>
					</Field.Field>
					<Field.Field>
						<Field.Label for="reference-stat">
							Compare with 1% of
						</Field.Label><Select.Root
							type="single"
							bind:value={spec.settings.referenceStat}
						>
							{@render selectTrigger(
								'reference-stat',
								referenceName
							)}<Select.Content>
								<Select.Group>
									<Select.Item value="crit">
										Critical damage
									</Select.Item><Select.Item value="minimum">
										Minimum damage
									</Select.Item><Select.Item value="maximum">
										Maximum damage
									</Select.Item><Select.Item value="minmax">
										Min. + max. damage
									</Select.Item>
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</Field.Field>
				</Field.Group>
				<details class="details-block">
					<summary>Target defenses & custom values</summary>
					<dl class="target-stats">
						<div>
							<dt>Normal defense</dt>
							<dd>{num(resolvedDungeon.normalDefense)}</dd>
						</div>
						<div>
							<dt>Boss defense</dt>
							<dd>{num(resolvedDungeon.bossDefense)}</dd>
						</div>
						<div>
							<dt>Normal flat reduction</dt>
							<dd>{num(resolvedDungeon.normalDmgReduction)}</dd>
						</div>
						<div>
							<dt>Boss flat reduction</dt>
							<dd>{num(resolvedDungeon.bossDmgReduction)}</dd>
						</div>
					</dl>
					<Field.Group>
						<Field.Field orientation="horizontal">
							<Switch
								id="custom-target"
								bind:checked={spec.settings.useCustomDungeonStats}
							/><Field.Label for="custom-target">
								Use custom target values
							</Field.Label>
						</Field.Field>
						{#if spec.settings.useCustomDungeonStats}<Field.Group
								class="grid gap-3 sm:grid-cols-2"
							>
								{#each [{ key: 'customNormalDefense', label: 'Normal defense' }, { key: 'customBossDefense', label: 'Boss defense' }, { key: 'customNormalDmgReduction', label: 'Normal flat damage reduction' }, { key: 'customBossDmgReduction', label: 'Boss flat damage reduction' }, { key: 'customNormalGuard', label: 'Normal guard %' }, { key: 'customBossGuard', label: 'Boss guard %' }, { key: 'customNormalElasticity', label: 'Normal critical resistance ‰' }, { key: 'customBossElasticity', label: 'Boss critical resistance ‰' }] as field (field.key)}<Field.Field
									>
										<Field.Label for={field.key}>
											{field.label}
										</Field.Label><Input
											id={field.key}
											type="number"
											min="0"
											bind:value={
												spec.settings[field.key as 'customNormalDefense']
											}
										/>
									</Field.Field>{/each}
							</Field.Group>{/if}
					</Field.Group>
				</details>
			</Card.Content>
		</Card.Root>
		<div class="two-column mt-5">
			{#each [{ key: 'direct', label: 'Direct-hit efficiency' }, { key: 'placement', label: 'Placed-skill efficiency' }] as kind (kind.key)}{@const panel =
					efficiency[kind.key as 'direct'][target]}<Card.Root>
					<Card.Header>
						<Card.Title>{kind.label}</Card.Title><Card.Description>
							Estimated flat stat needed to match +1% {referenceName} against this
							{target}.
						</Card.Description>
					</Card.Header><Card.Content>
						<dl class="conversion-list">
							{#each panel.equivalents as item (item.key)}<div>
									<dt>{item.label}</dt>
									<dd>{num(item.value, 2)}</dd>
								</div>{/each}
						</dl>
						<p class="small-note mt-4">
							Damage retained after target defenses: {num(
								efficiency.bypass[target][kind.key as 'direct'],
								2
							)}%
						</p>
					</Card.Content>
				</Card.Root>{/each}
		</div>
		<Card.Root class="mt-5">
			<Card.Header>
				<Card.Title>Per-hit damage range</Card.Title><Card.Description>
					{dungeon.name} · {target}. The mean averages the reference’s damage
					rolls.
				</Card.Description>
			</Card.Header><Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Hit type</Table.Head><Table.Head>
								Minimum
							</Table.Head><Table.Head>Mean</Table.Head><Table.Head>
								Maximum
							</Table.Head>
						</Table.Row>
					</Table.Header><Table.Body>
						{#each hitRanges as hit (hit.id)}<Table.Row>
								<Table.Cell>
									{hit.label} · {hit.critical ? 'critical' : 'noncritical'}
								</Table.Cell><Table.Cell>
									{num(hit.result.minimum)}
								</Table.Cell><Table.Cell>
									{num(hit.result.damage)}
								</Table.Cell><Table.Cell>{num(hit.result.maximum)}</Table.Cell>
							</Table.Row>{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
		<Card.Root class="mt-5">
			<Card.Header>
				<Card.Title>All damage scenarios</Card.Title><Card.Description>
					Unmitigated results keep the corresponding normal or boss bonuses.
				</Card.Description>
			</Card.Header><Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Target</Table.Head><Table.Head>
								Direct hit
							</Table.Head><Table.Head>Placed skill</Table.Head>
						</Table.Row>
					</Table.Header><Table.Body>
						{#each scenarios as row (row.id)}{@const key =
								row.id === 'boss-theory' ? 'bossTheory' : row.id}<Table.Row>
								<Table.Cell>{row.label}</Table.Cell><Table.Cell>
									{num(efficiency.direct[key].damage)}
								</Table.Cell><Table.Cell>
									{num(efficiency.placement[key].damage)}
								</Table.Cell>
							</Table.Row>{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
		<Card.Root class="mt-5">
			<Card.Header>
				<Card.Title>Damage-stat conversions</Card.Title><Card.Description>
					Theory ratios before target defenses and rounding, using {target} amplification.
				</Card.Description>
			</Card.Header><Card.Content>
				<dl class="target-stats">
					<div>
						<dt>1% critical → minimum</dt>
						<dd>{num(conversion.criticalToMinimum, 3)}%</dd>
					</div>
					<div>
						<dt>1% critical → maximum</dt>
						<dd>{num(conversion.criticalToMaximum, 3)}%</dd>
					</div>
					<div>
						<dt>1% amplification → critical</dt>
						<dd>{num(conversion.dominationToCritical, 3)}%</dd>
					</div>
					<div>
						<dt>1% amplification → maximum</dt>
						<dd>{num(conversion.dominationToMaximum, 3)}%</dd>
					</div>
				</dl>
			</Card.Content>
		</Card.Root>
	{:else if activeTab === 'compare'}
		<div class="section-heading">
			<div>
				<p class="eyebrow">03 / BEFORE YOU COMMIT</p>
				<h2>Compare an upgrade</h2>
			</div>
			{@render targetToggle()}
		</div>
		<Alert.Root>
			<Alert.Title>
				Your character stats already include the current item.
			</Alert.Title><Alert.Description>
				Enter the bonuses on the item you are replacing, then the new item’s
				bonuses. To add a completely new bonus, leave Current at zero.
			</Alert.Description>
		</Alert.Root>
		<div class="character-grid mt-5">
			<Card.Root>
				<Card.Header>
					<Card.Title>Item bonuses</Card.Title><Card.Description>
						Only fill in stats that change.
					</Card.Description><Card.Action>
						<Button
							variant="ghost"
							size="sm"
							onclick={() => {
								spec.oldEnchant = { ...DEFAULT_ENCHANT_OPTION };
								spec.newEnchant = { ...DEFAULT_ENCHANT_OPTION };
							}}
						>
							Clear
						</Button>
					</Card.Action>
				</Card.Header><Card.Content>
					<div class="enchant-head">
						<span>Stat</span>
						<span>Current</span>
						<span>Replacement</span>
					</div>
					{#each ['Core stats', 'Damage', 'Other bonuses'] as group (group)}<Field.Set
							class="mt-5"
						>
							<Field.Legend variant="label">{group}</Field.Legend><Field.Group
								class="gap-2"
							>
								{#each enchantFields.filter((x) => x.group === group) as field (field.key)}<Field.Field
										class="enchant-row"
										data-invalid={!inspectNumericInput(
											spec.oldEnchant[field.key]
										).valid ||
											!inspectNumericInput(spec.newEnchant[field.key]).valid}
									>
										<Field.Label for={`new-${field.key}`}>
											{field.label}
										</Field.Label><Input
											aria-label={`Current ${field.label}`}
											aria-invalid={!inspectNumericInput(
												spec.oldEnchant[field.key]
											).valid}
											bind:value={spec.oldEnchant[field.key]}
											inputmode="decimal"
										/><Input
											id={`new-${field.key}`}
											aria-label={`Replacement ${field.label}`}
											aria-invalid={!inspectNumericInput(
												spec.newEnchant[field.key]
											).valid}
											bind:value={spec.newEnchant[field.key]}
											inputmode="decimal"
										/>
									</Field.Field>{/each}
							</Field.Group>
						</Field.Set>{/each}
				</Card.Content>
			</Card.Root>
			<aside class="results-column">
				<Card.Root>
					<Card.Header>
						<Card.Title>Expected change</Card.Title><Card.Description>
							{dungeon.name} · {target} · {spec.settings.damageMode} critical hit
						</Card.Description>
					</Card.Header><Card.Content>
						{#if !validComparison}<p role="alert" class="small-note">
								Correct the highlighted expressions in your character stats or
								item bonuses to calculate this upgrade.
							</p>{:else if !hasUpgrade}<Empty.Root>
								<Empty.Header>
									<Empty.Media variant="icon">
										<GitCompareIcon />
									</Empty.Media><Empty.Title>
										What are you upgrading?
									</Empty.Title><Empty.Description>
										Enter a replacement bonus to see the difference in damage.
									</Empty.Description>
								</Empty.Header>
							</Empty.Root>{:else}<div class="upgrade-results">
								{#each [{ key: 'direct', label: 'Direct hit' }, { key: 'placement', label: 'Placed skill' }] as kind (kind.key)}{@const result =
										comparison.scenarios[target][kind.key as 'direct']}
									<div>
										<span>{kind.label}</span>
										{@render deltaBadge(result.percentChange)}
										<p>
											{damage(result.old)}
											<span aria-hidden="true">→</span>
											<strong>{damage(result.new)}</strong>
										</p>
									</div>{/each}
							</div>{/if}
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header>
						<Card.Title>Across every target</Card.Title><Card.Description>
							Percentage change from your current setup.
						</Card.Description>
					</Card.Header><Card.Content>
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Target</Table.Head><Table.Head>
										Direct
									</Table.Head><Table.Head>Placed</Table.Head>
								</Table.Row>
							</Table.Header><Table.Body>
								{#each scenarios as row (row.id)}<Table.Row>
										<Table.Cell>{row.label}</Table.Cell><Table.Cell>
											{validComparison
												? change(
														comparison.scenarios[row.id].direct.percentChange
													)
												: '—'}
										</Table.Cell><Table.Cell>
											{validComparison
												? change(
														comparison.scenarios[row.id].placement.percentChange
													)
												: '—'}
										</Table.Cell>
									</Table.Row>{/each}
							</Table.Body>
						</Table.Root>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header>
						<Card.Title>HP comparison</Card.Title><Card.Description>
							Calibrate once to estimate HP changes from all stats, stamina, and
							HP bonuses.
						</Card.Description>
					</Card.Header><Card.Content>
						<details>
							<summary>Set up HP calibration</summary>
							<p class="small-note my-3">
								Record your current values, then temporarily remove 10
								percentage points of Basic Stats in Ascension and record them
								again.
							</p>
							<Field.Group class="gap-3">
								{#each hpFields as field (field.key)}<Field.Field>
										<Field.Label for={`hp-${field.key}`}>
											{field.label}
										</Field.Label><Input
											id={`hp-${field.key}`}
											type="number"
											min="0"
											bind:value={spec.hpCalibration[field.key]}
										/>
									</Field.Field>{/each}
							</Field.Group>
						</details>
						{#if comparison.hp && validComparison}<dl
								class="conversion-list mt-4"
							>
								<div>
									<dt>Expected maximum HP</dt>
									<dd>{num(comparison.hp.expected)}</dd>
								</div>
								<div>
									<dt>HP change</dt>
									<dd>{change(comparison.hp.changeRate)}</dd>
								</div>
							</dl>{:else}<p class="small-note mt-4">
								Enter all four calibration readings to calculate HP.
							</p>{/if}
					</Card.Content>
				</Card.Root>
			</aside>
		</div>
	{:else if activeTab === 'builds'}
		<div class="section-heading">
			<div>
				<p class="eyebrow">04 / FIND YOUR BALANCE</p>
				<h2>Explore stat distribution</h2>
			</div>
			{@render targetToggle()}
		</div>
		<Alert.Root>
			<Alert.Title>
				A fixed budget, five different builds.
			</Alert.Title><Alert.Description>
				This comparison redistributes strength / magic and attack / intensity
				while keeping their combined budget constant. It does not represent an
				obtainable equipment set.
			</Alert.Description>
		</Alert.Root>
		<div class="build-current">
			<div>
				<span class="eyebrow">YOUR CURRENT BALANCE</span>
				<strong>
					{num(build.currentRatio, 1)}%
					<small>strength / magic</small>
				</strong>
			</div>
			<div>
				<span>Strength / magic</span>
				<b>{num(stats.strMag.total)}</b>
			</div>
			<div>
				<span>Attack / intensity</span>
				<b>{num(stats.weaponAttr.total)}</b>
			</div>
		</div>
		<div class="build-grid">
			{#each build.profiles as profile (profile.id)}{@const directKey =
					target === 'boss' ? 'bossDirect' : 'normalDirect'}{@const placedKey =
					target === 'boss' ? 'bossPlacement' : 'normalPlacement'}<Card.Root>
					<Card.Header>
						<Card.Title>{profile.name}</Card.Title><Card.Description>
							{num(profile.strengthRatio ?? 0)}% strength allocation
						</Card.Description>
					</Card.Header><Card.Content>
						<div class="allocation-track" aria-hidden="true">
							<span style:width={`${profile.strengthRatio ?? 0}%`}></span>
						</div>
						<dl class="conversion-list mt-4">
							<div>
								<dt>Strength / magic</dt>
								<dd>{num(profile.strMag)}</dd>
							</div>
							<div>
								<dt>Attack / intensity</dt>
								<dd>{num(profile.weaponAttr)}</dd>
							</div>
							<div>
								<dt>Direct hit</dt>
								<dd>{damage(profile.direct[target])}</dd>
							</div>
							<div>
								<dt>Placed skill</dt>
								<dd>{damage(profile.placement[target])}</dd>
							</div>
						</dl>
					</Card.Content><Card.Footer>
						<div class="flex flex-wrap gap-2">
							<span class="small-note">Direct</span>
							{@render deltaBadge(profile.change[directKey])}
							<span class="small-note">Placed</span>
							{@render deltaBadge(profile.change[placedKey])}
						</div>
					</Card.Footer>
				</Card.Root>{/each}
		</div>
	{:else}
		<div class="section-heading">
			<div>
				<p class="eyebrow">05 / UNDER THE NUMBERS</p>
				<h2>Skills & reference</h2>
			</div>
			<Badge variant="outline">
				{DIRECT_SKILLS.length + PLACEMENT_SKILLS.length} skills
			</Badge>
		</div>
		<Card.Root>
			<Card.Header>
				<Card.Title>Skill coefficient library</Card.Title><Card.Description>
					Search by English or Korean name. Select a row’s skill to use it in
					your analysis.
				</Card.Description>
			</Card.Header><Card.Content>
				<Field.Group class="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
					<Field.Field>
						<Field.Label for="skill-search">Search skills</Field.Label><Input
							id="skill-search"
							bind:value={skillQuery}
							placeholder="Name or class…"
						/>
					</Field.Field><Field.Field>
						<Field.Label for="catalog-job">
							Class filter
						</Field.Label><Select.Root type="single" bind:value={filterJob}>
							{@render selectTrigger(
								'catalog-job',
								JOBS.find((x) => x.id === filterJob)?.name ?? 'All classes'
							)}<Select.Content>
								<Select.Group>
									<Select.Item value="all">
										All classes
									</Select.Item>{#each JOBS as item (item.id)}<Select.Item
											value={item.id}
										>
											{item.name}
										</Select.Item>{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
					</Field.Field><Field.Field>
						<Field.Label id="skill-kind-label">
							Skill type
						</Field.Label><ToggleGroup.Root
							type="single"
							value={skillKind}
							onValueChange={(v) => {
								if (v === 'direct' || v === 'placement') skillKind = v;
							}}
							variant="outline"
							aria-labelledby="skill-kind-label"
						>
							<ToggleGroup.Item value="direct">
								Direct
							</ToggleGroup.Item><ToggleGroup.Item value="placement">
								Placed
							</ToggleGroup.Item>
						</ToggleGroup.Root>
					</Field.Field>
				</Field.Group>
				<div class="catalog-table mt-5">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Skill</Table.Head><Table.Head>
									Class
								</Table.Head><Table.Head>
									{skillKind === 'direct'
										? 'Base coefficient'
										: 'Weapon / reflection'}
								</Table.Head><Table.Head>
									<span class="sr-only">Action</span>
								</Table.Head>
							</Table.Row>
						</Table.Header><Table.Body>
							{#each catalog as skill (skill.id)}<Table.Row>
									<Table.Cell>
										<span class="skill-name">{skill.name}</span>
										<span class="skill-original">{skill.sourceName}</span>
									</Table.Cell><Table.Cell>{skill.job}</Table.Cell><Table.Cell>
										{#if 'baseCoefficient' in skill}{num(skill.baseCoefficient)}
											<span class="small-note">
												+ {num(skill.perLevel)} / level
											</span>{:else}{num(skill.weaponCoefficient)} / {num(
												skill.strengthBase * 100,
												2
											)}%{/if}
									</Table.Cell><Table.Cell>
										<Button
											variant="outline"
											size="sm"
											onclick={() => useSkill(skill)}
											aria-label={`Use ${skill.name}`}
										>
											Use<ArrowUpRightIcon data-icon="inline-end" />
										</Button>
									</Table.Cell>
								</Table.Row>{/each}
						</Table.Body>
					</Table.Root>
				</div>
				{#if !catalog.length}<Empty.Root>
						<Empty.Header>
							<Empty.Title>No matching skills</Empty.Title><Empty.Description>
								Try another name or select All classes.
							</Empty.Description>
						</Empty.Header>
					</Empty.Root>{/if}
			</Card.Content><Card.Footer>
				<p class="small-note">
					{catalog.length} matching skills. Placed reflection coefficients are community
					estimates.
				</p>
			</Card.Footer>
		</Card.Root>
		<div class="two-column mt-5">
			<Card.Root>
				<Card.Header>
					<Card.Title>Character indicators</Card.Title><Card.Description>
						Compare stat-based indicators under matching assumptions.
					</Card.Description>
				</Card.Header><Card.Content>
					<Field.Group class="grid gap-4 sm:grid-cols-2">
						<Field.Field>
							<Field.Label for="indicator">
								Direct coefficient
							</Field.Label><Input
								id="indicator"
								bind:value={indicatorCoefficient}
							/>
						</Field.Field><Field.Field>
							<Field.Label for="reflection">
								Summon reflection %
							</Field.Label><Input id="reflection" bind:value={reflection} />
						</Field.Field>
					</Field.Group>
					<dl class="conversion-list mt-4">
						<div>
							<dt>Direct indicator · {indicator.side}</dt>
							<dd>{num(indicator.value, 2)}</dd>
						</div>
						<div>
							<dt>Summon indicator · {reflected.side}</dt>
							<dd>{num(reflected.value, 2)}</dd>
						</div>
					</dl>
				</Card.Content>
			</Card.Root><Card.Root>
				<Card.Header>
					<Card.Title>Check a measured placed hit</Card.Title><Card.Description>
						{placed.name} · {dungeon.name} boss
					</Card.Description>
				</Card.Header><Card.Content>
					<Field.Group>
						<Field.Field>
							<Field.Label for="measured-damage">
								Measured boss damage
							</Field.Label><Input
								id="measured-damage"
								bind:value={measuredDamage}
								placeholder="Damage from a single hit"
							/>
						</Field.Field>
					</Field.Group>
					<dl class="conversion-list mt-4">
						<div>
							<dt>Predicted hit</dt>
							<dd>{num(inferred.expected)}</dd>
						</div>
						{#if parseNumericInput(measuredDamage) > 0}<div>
								<dt>Measured / predicted</dt>
								<dd>
									{num(
										inferred.expected
											? parseNumericInput(measuredDamage) / inferred.expected
											: 0,
										3
									)}×
								</dd>
							</div>{/if}
						<div>
							<dt>Selected reflection</dt>
							<dd>{num(placedCoefficients.strengthMultiplier * 100, 2)}%</dd>
						</div>
					</dl>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	<footer class="sources">
		<div>
			<BookOpenIcon aria-hidden="true" />
			<span>
				Based on community research · data snapshot {SPEC_ANALYZER_DATA_META.capturedAt}
			</span>
		</div>
		<nav aria-label="Source references">
			<a
				href="https://latale.wiki/tools/spec-analyzer"
				target="_blank"
				rel="noreferrer"
			>
				Wiki analyzer ↗
			</a>
			<a
				href="https://docs.google.com/spreadsheets/d/1ytrf0W-j_FUBsj071Fbuhz6Tx7Qv2EdsoZEmxyvlwaM"
				target="_blank"
				rel="noreferrer"
			>
				English workbook ↗
			</a>
			<a
				href="https://docs.google.com/spreadsheets/d/19LMNB8_6JddY-srP4BB2Grxc52KodG75oebjMtK-taM"
				target="_blank"
				rel="noreferrer"
			>
				Korean workbook ↗
			</a>
		</nav>
		<p>
			The current wiki damage model is used for calculations; the v3.4.1
			workbooks provide input guidance and terminology. Results are per critical
			hit and do not include attack speed or skill hit count.
		</p>
	</footer>
</div>

<Sheet.Root bind:open={libraryOpen}>
	<Sheet.Content class="overflow-y-auto">
		<Sheet.Header>
			<Sheet.Title>Saved builds</Sheet.Title><Sheet.Description>
				Keep different equipment setups, or export a copy to another device.
			</Sheet.Description>
		</Sheet.Header>
		<div class="flex flex-col gap-5 px-4 pb-6">
			<Field.Group>
				<Field.Field>
					<Field.Label for="build-name">Build name</Field.Label><Input
						id="build-name"
						bind:value={name}
						maxlength={80}
					/>
				</Field.Field>
			</Field.Group><Button onclick={saveSpec}>
				<SaveIcon data-icon="inline-start" />{loadedId
					? 'Update saved build'
					: 'Save current build'}
			</Button>
			<p class="small-note" role="status">{status}</p>
			{#each saved as item (item.id)}<div class="saved-build">
					<div>
						<strong>{item.name}</strong>
						<small>
							{item.savedAt
								? new Date(item.savedAt).toLocaleDateString()
								: 'Imported from previous analyzer'}
						</small>
					</div>
					<Button variant="outline" size="sm" onclick={() => loadSpec(item)}>
						Load
					</Button><Button
						variant="ghost"
						size="icon-sm"
						aria-label={`Delete ${item.name}`}
						onclick={() => {
							saved = saved.filter((x) => x.id !== item.id);
							if (loadedId === item.id) loadedId = '';
							status = `Deleted “${item.name}”.`;
						}}
					>
						<TrashIcon />
					</Button>
				</div>{:else}<Empty.Root>
					<Empty.Header>
						<Empty.Title>
							Your build library starts here
						</Empty.Title><Empty.Description>
							Give your character a name and save your first setup.
						</Empty.Description>
					</Empty.Header>
				</Empty.Root>{/each}
			<div class="flex flex-wrap gap-2">
				<Button variant="outline" onclick={exportSpec}>
					<DownloadIcon data-icon="inline-start" />Export JSON
				</Button><Button variant="outline" onclick={() => importInput.click()}>
					<UploadIcon data-icon="inline-start" />Import JSON
				</Button><Button
					variant="outline"
					onclick={() => {
						libraryOpen = false;
						window.setTimeout(() => window.print(), 150);
					}}
				>
					<PrinterIcon data-icon="inline-start" />Print view
				</Button>
			</div>
			<input
				class="sr-only"
				tabindex="-1"
				aria-label="Import specification file"
				type="file"
				accept=".json,application/json"
				bind:this={importInput}
				onchange={importSpec}
			/>
			<div class="flex flex-wrap gap-2">
				<Button variant="ghost" onclick={() => reset(false)}>
					Start blank
				</Button><Button variant="ghost" onclick={() => reset(true)}>
					Load sample
				</Button><Button
					variant="ghost"
					onclick={() => {
						loadedId = '';
						name = `${name} copy`.slice(0, 80);
					}}
				>
					Save as a copy
				</Button>
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>

<style>
	.analyzer {
		width: 100%;
		max-width: 1580px;
		margin: 0 auto;
		padding: 32px clamp(16px, 3vw, 40px) 28px;
	}
	.page-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
	}
	.eyebrow {
		font: 600 10px/1.5 var(--font-sans);
		letter-spacing: 0.16em;
		color: var(--route-deep);
	}
	h1 {
		font: 500 clamp(30px, 3.2vw, 46px)/1.15 var(--font-serif);
		letter-spacing: -0.04em;
		margin-top: 7px;
	}
	h1 span {
		color: var(--route-accent);
	}
	.intro {
		color: var(--muted-foreground);
		font-size: 14px;
		margin-top: 9px;
	}
	.heading-actions {
		display: flex;
		gap: 8px;
		flex-shrink: 0;
	}
	.workspace-status {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 20px;
		font-size: 11px;
		color: var(--muted-foreground);
		margin: 20px 0;
	}
	.status-message:empty {
		display: none;
	}
	.workspace-nav {
		display: flex;
		border-bottom: 1px solid var(--border);
		gap: 28px;
		overflow-x: auto;
	}
	.workspace-nav a {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 13px 0;
		border-bottom: 3px solid transparent;
		font-size: 13px;
		color: var(--muted-foreground);
		white-space: nowrap;
	}
	.workspace-nav a[aria-current] {
		border-color: var(--route-accent);
		color: var(--route-deep);
		font-weight: 600;
	}
	.workspace-nav a:hover {
		color: var(--foreground);
	}
	.workspace-nav :global(svg) {
		width: 16px;
		height: 16px;
	}
	.setup {
		padding: 20px 0 16px;
		border-bottom: 1px solid var(--border);
	}
	.manual-settings {
		margin-top: 12px;
	}
	.setup-note {
		font-size: 10px;
		color: var(--muted-foreground);
		margin-top: 10px;
	}
	.skill-control {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 58px;
		gap: 6px;
	}
	.section-heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 14px;
		margin: 28px 0 18px;
	}
	h2 {
		font: 500 27px/1.25 var(--font-serif);
		letter-spacing: -0.025em;
		margin-top: 4px;
	}
	h3 {
		font-size: 13px;
		font-weight: 600;
	}
	.character-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.35fr) minmax(300px, 1fr);
		gap: 22px;
		align-items: start;
	}
	.results-column {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 18px;
	}
	.damage-summary {
		border: 1px solid color-mix(in srgb, var(--route-accent) 24%, var(--border));
		border-radius: 12px;
		background: linear-gradient(120deg, var(--route-soft), var(--card));
		overflow: hidden;
		padding: 22px;
	}
	.summary-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}
	.summary-values {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 22px;
		margin: 22px 0;
	}
	.summary-values > div {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-width: 0;
	}
	.summary-values span {
		font-size: 12px;
		color: var(--muted-foreground);
	}
	.summary-values strong {
		font: 500 clamp(25px, 3vw, 42px)/1.2 var(--font-serif);
		color: var(--route-deep);
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.03em;
	}
	.summary-values small {
		font-size: 10px;
		color: var(--muted-foreground);
		overflow-wrap: anywhere;
	}
	.summary-footer {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 6px;
		font-size: 10px;
		color: var(--muted-foreground);
		padding-top: 12px;
		border-top: 1px solid
			color-mix(in srgb, var(--route-accent) 15%, transparent);
	}
	.conversion-list {
		display: flex;
		flex-direction: column;
	}
	.conversion-list > div {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		padding: 10px 0;
		border-bottom: 1px solid var(--border);
	}
	.conversion-list > div:last-child {
		border: 0;
		padding-bottom: 0;
	}
	.conversion-list dt {
		font-size: 12px;
		color: var(--muted-foreground);
	}
	.conversion-list dd {
		font-size: 13px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		text-align: right;
	}
	.small-note {
		font-size: 11px;
		line-height: 1.7;
		color: var(--muted-foreground);
	}
	.two-column {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 20px;
	}
	.details-block {
		margin-top: 20px;
		border-top: 1px solid var(--border);
		padding-top: 15px;
	}
	summary {
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
	}
	.target-stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;
		padding: 16px 0;
	}
	.target-stats dt {
		font-size: 11px;
		color: var(--muted-foreground);
	}
	.target-stats dd {
		margin-top: 5px;
		font-size: 15px;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
	.enchant-head {
		display: grid;
		grid-template-columns: minmax(110px, 1.25fr) repeat(2, minmax(70px, 1fr));
		gap: 10px;
		color: var(--muted-foreground);
		font-size: 10px;
		border-bottom: 1px solid var(--border);
		padding-bottom: 12px;
	}
	:global(.enchant-row) {
		display: grid;
		grid-template-columns: minmax(110px, 1.25fr) repeat(2, minmax(70px, 1fr));
		align-items: center;
		gap: 10px;
	}
	.upgrade-results {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.upgrade-results > div {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 12px;
	}
	.upgrade-results > div > span {
		font-size: 12px;
	}
	.upgrade-results p {
		grid-column: 1/-1;
		font: 400 28px/1.2 var(--font-serif);
		color: var(--muted-foreground);
	}
	.upgrade-results p strong {
		color: var(--route-deep);
		font-weight: 500;
	}
	.upgrade-results p span {
		font-size: 20px;
		margin: 0 8px;
	}
	.build-current {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 25px 40px;
		padding: 25px 0;
	}
	.build-current > div {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	.build-current strong {
		font: 400 30px/1.3 var(--font-serif);
	}
	.build-current small {
		font: 400 12px/1.5 var(--font-sans);
		color: var(--muted-foreground);
	}
	.build-current span:not(.eyebrow) {
		font-size: 11px;
		color: var(--muted-foreground);
	}
	.build-current b {
		font-size: 18px;
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}
	.build-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 18px;
	}
	.allocation-track {
		height: 6px;
		background: var(--muted);
		border-radius: 4px;
		overflow: hidden;
	}
	.allocation-track span {
		display: block;
		height: 100%;
		background: var(--route-accent);
	}
	.catalog-table {
		max-height: 540px;
		overflow-y: auto;
	}
	.skill-name {
		display: block;
		font-weight: 500;
	}
	.skill-original {
		display: block;
		font-size: 10px;
		color: var(--muted-foreground);
		margin-top: 3px;
	}
	.sources {
		border-top: 1px solid var(--border);
		margin-top: 35px;
		padding-top: 20px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		font-size: 10px;
		color: var(--muted-foreground);
		line-height: 1.6;
	}
	.sources > div {
		display: flex;
		gap: 7px;
		align-items: center;
	}
	.sources :global(svg) {
		width: 13px;
		height: 13px;
	}
	.sources nav {
		display: flex;
		gap: 18px;
		flex-wrap: wrap;
	}
	.sources a {
		color: var(--route-deep);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.saved-build {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 12px 0;
		border-bottom: 1px solid var(--border);
	}
	.saved-build > div {
		display: flex;
		flex-direction: column;
		gap: 5px;
		flex: 1;
		min-width: 0;
	}
	.saved-build strong {
		font-size: 13px;
		overflow-wrap: anywhere;
	}
	.saved-build small {
		font-size: 10px;
		color: var(--muted-foreground);
	}
	@media (max-width: 1100px) {
		.character-grid {
			grid-template-columns: minmax(0, 1fr);
		}
		.results-column {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			align-items: start;
		}
		.results-column > :first-child,
		.results-column > .damage-summary,
		.results-column > .small-note {
			grid-column: 1/-1;
		}
		.page-heading {
			align-items: flex-start;
		}
		.heading-actions {
			flex-direction: column;
		}
	}
	@media (max-width: 600px) {
		.analyzer {
			padding-top: 22px;
		}
		.page-heading {
			flex-direction: column;
			gap: 18px;
		}
		.heading-actions {
			flex-direction: row;
		}
		.workspace-status {
			margin: 15px 0 10px;
		}
		.workspace-nav {
			gap: 22px;
		}
		.workspace-nav a {
			gap: 6px;
			font-size: 12px;
		}
		.section-heading {
			align-items: flex-start;
			flex-wrap: wrap;
		}
		.section-heading h2 {
			font-size: 25px;
		}
		.two-column,
		.results-column {
			display: flex;
			flex-direction: column;
		}
		.results-column > :global(*) {
			width: 100%;
		}
		.damage-summary {
			padding: 16px;
		}
		.summary-values {
			gap: 12px;
		}
		.target-stats {
			gap: 14px 10px;
		}
		.enchant-head,
		:global(.enchant-row) {
			grid-template-columns: minmax(96px, 1.2fr) repeat(2, minmax(58px, 1fr));
			gap: 6px;
		}
	}
	@media print {
		.analyzer {
			max-width: none;
			padding: 0;
		}
		.workspace-nav,
		.workspace-status,
		.sources nav {
			display: none;
		}
		.character-grid {
			grid-template-columns: 1fr;
		}
		.catalog-table {
			max-height: none;
		}
		:global(.shell-topbar),
		:global([data-slot='sidebar']) {
			display: none;
		}
		.damage-summary {
			break-inside: avoid;
		}
	}
</style>
