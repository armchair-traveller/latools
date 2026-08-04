<script lang="ts">
	import { browser } from '$app/environment';
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import ActivityIcon from '@lucide/svelte/icons/activity';
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right';
	import ChartNoAxesCombinedIcon from '@lucide/svelte/icons/chart-no-axes-combined';
	import DownloadIcon from '@lucide/svelte/icons/download';
	import FlaskConicalIcon from '@lucide/svelte/icons/flask-conical';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import GaugeIcon from '@lucide/svelte/icons/gauge';
	import GitCompareArrowsIcon from '@lucide/svelte/icons/git-compare-arrows';
	import Maximize2Icon from '@lucide/svelte/icons/maximize-2';
	import Minimize2Icon from '@lucide/svelte/icons/minimize-2';
	import PrinterIcon from '@lucide/svelte/icons/printer';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import SaveIcon from '@lucide/svelte/icons/save';
	import ScanSearchIcon from '@lucide/svelte/icons/scan-search';
	import SearchIcon from '@lucide/svelte/icons/search';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import SwordsIcon from '@lucide/svelte/icons/swords';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Separator } from '$lib/components/ui/separator';
	import * as Table from '$lib/components/ui/table';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { cn } from '$lib/utils';
	import {
		DEFAULT_ENCHANT_OPTION,
		DEFAULT_SPEC_CALCULATION_SETTINGS,
		DEFAULT_SPEC_INPUTS,
		DEFAULT_SPEC_SELECTIONS,
		DIRECT_SKILLS,
		DUNGEONS,
		JOBS,
		PLACEMENT_SKILLS,
		SPEC_ANALYZER_DATA_META,
		SUMMONS,
		aggregateStats,
		calculateBuildEfficiency,
		calculateConversionSummary,
		calculateDamageEfficiency,
		calculateHitIndicator,
		calculateSummonReflection,
		compareEnchants,
		inferPlacementMultiplier,
		parseNumericInput,
		placementCoefficients,
		placementCoreCoefficients,
		resolveDungeon
	} from '$lib/spec-analyzer.js';

	const storageKey = 'latale-spec-analyzer-v2';
	const inputClass = 'tabular-nums';
	const tabs = [
		{ id: 'base', label: 'Base / Conversion', icon: GaugeIcon },
		{ id: 'damage', label: 'Damage efficiency', icon: ChartNoAxesCombinedIcon },
		{ id: 'enchant', label: 'Enchant', icon: GitCompareArrowsIcon },
		{ id: 'build', label: 'Build', icon: FlaskConicalIcon },
		{ id: 'indicators', label: 'Indicators', icon: ActivityIcon },
		{ id: 'coefficients', label: 'Coefficients', icon: SwordsIcon }
	] as const;
	type TabId = (typeof tabs)[number]['id'];
	const tabUrlIds: Record<TabId, string> = {
		base: 'base',
		damage: 'efficiency',
		enchant: 'enchant',
		build: 'setting',
		indicators: 'indicators',
		coefficients: 'skills'
	};
	const tabUrlAliases = Object.fromEntries(
		Object.entries(tabUrlIds).map(([tab, token]) => [token, tab])
	) as Record<string, TabId>;

	const pairedInputs = [
		{ label: 'Strength / magic', flat: 'strMagFlat', percent: 'strMagPercent', stat: 'strMag' },
		{ label: 'Weapon / attribute', flat: 'weaponAttrFlat', percent: 'weaponAttrPercent', stat: 'weaponAttr' },
		{ label: 'Critical damage', flat: 'critDmgFlat', percent: 'critDmgPercent', stat: 'criticalDamage' },
		{ label: 'Minimum damage', flat: 'minDmgFlat', percent: 'minDmgPercent', stat: 'minimumDamage' },
		{ label: 'Maximum damage', flat: 'maxDmgFlat', percent: 'maxDmgPercent', stat: 'maximumDamage' },
		{ label: 'Fixed damage', flat: 'fixedDmgFlat', percent: 'fixedDmgPercent', stat: 'fixedDamage' },
		{ label: 'Normal extra damage', flat: 'normalExtraDmgFlat', percent: 'normalExtraDmgPercent', stat: 'normalExtraDamage' },
		{ label: 'Boss extra damage', flat: 'bossExtraDmgFlat', percent: 'bossExtraDmgPercent', stat: 'bossExtraDamage' }
	] as const;
	const advancedInputs = [
		{ label: 'Normal domination', key: 'normalDomination', suffix: '%' },
		{ label: 'Boss domination', key: 'bossDomination', suffix: '%' },
		{ label: 'Defense penetration', key: 'penetration', suffix: '%' },
		{ label: 'Back-attack damage', key: 'backAttackDmg', suffix: '%' },
		{ label: 'Strength / magic efficiency', key: 'strMagEfficiency', suffix: '%' },
		{ label: 'Placement core level', key: 'placementCoreLevel', suffix: 'Lv' }
	] as const;
	const aggregateRows = [
		['strMag', 'Strength / magic'],
		['weaponAttr', 'Weapon / attribute'],
		['criticalDamage', 'Critical damage'],
		['minimumDamage', 'Minimum damage'],
		['maximumDamage', 'Maximum damage'],
		['fixedDamage', 'Fixed damage'],
		['normalExtraDamage', 'Normal extra damage'],
		['bossExtraDamage', 'Boss extra damage']
	] as const;
	const damageShareRows = [
		['domination', 'Domination'],
		['critical', 'Critical'],
		['maximum', 'Maximum'],
		['minimum', 'Minimum']
	] as const;
	const baseShareRows = [
		['strMag', 'Strength / magic'],
		['weaponAttr', 'Weapon / attribute'],
		['fixedDamage', 'Fixed damage'],
		['extraDamage', 'Extra damage']
	] as const;
	const enchantInputs = [
		{ key: 'minDmg', label: 'Minimum damage', suffix: '' },
		{ key: 'maxDmg', label: 'Maximum damage', suffix: '' },
		{ key: 'critDmg', label: 'Critical damage', suffix: '' },
		{ key: 'finalMinDmg', label: 'Final minimum damage', suffix: '%' },
		{ key: 'finalMaxDmg', label: 'Final maximum damage', suffix: '%' },
		{ key: 'finalCritDmg', label: 'Final critical damage', suffix: '%' },
		{ key: 'strMagAll', label: 'All stats', suffix: '' },
		{ key: 'strMagAllPercent', label: 'All stats', suffix: '%' },
		{ key: 'strMagEfficiency', label: 'Strength / magic efficiency', suffix: '%' },
		{ key: 'weaponAttr', label: 'Weapon / attribute', suffix: '' },
		{ key: 'weaponAttrPercent', label: 'Weapon / attribute', suffix: '%' },
		{ key: 'fixedDmg', label: 'Fixed damage', suffix: '' },
		{ key: 'fixedDmgPercent', label: 'Fixed damage', suffix: '%' },
		{ key: 'normalDmgPercent', label: 'Normal extra damage', suffix: '%' },
		{ key: 'bossDmgPercent', label: 'Boss extra damage', suffix: '%' },
		{ key: 'normalDomination', label: 'Normal domination', suffix: '%' },
		{ key: 'bossDomination', label: 'Boss domination', suffix: '%' },
		{ key: 'backAttackDmg', label: 'Back-attack damage', suffix: '%' },
		{ key: 'directHitSkillLevel', label: 'Direct-hit skill level', suffix: 'Lv' },
		{ key: 'placementSkillLevel', label: 'Placement skill level', suffix: 'Lv' },
		{ key: 'hpPercent', label: 'Maximum HP', suffix: '%' },
		{ key: 'stamina', label: 'Stamina', suffix: '' }
	] as const;
	const hpFields = [
		{ key: 'stamina', label: 'Current stamina' },
		{ key: 'staminaMinus10', label: 'Stamina after removing 10 all-stat' },
		{ key: 'maxHp', label: 'Current maximum HP' },
		{ key: 'maxHpMinus10', label: 'Maximum HP after removing 10 all-stat' }
	] as const;
	const customDungeonFields = [
		['customNormalDefense', 'Normal defense'],
		['customBossDefense', 'Boss defense'],
		['customNormalDmgReduction', 'Normal damage reduction'],
		['customBossDmgReduction', 'Boss damage reduction']
	] as const;
	const scenarioRows = [
		{ key: 'theory', label: 'Theory · normal', kind: 'direct', kindLabel: 'Direct hit' },
		{ key: 'boss-theory', label: 'Theory · boss', kind: 'direct', kindLabel: 'Direct hit' },
		{ key: 'normal', label: 'Dungeon · normal', kind: 'direct', kindLabel: 'Direct hit' },
		{ key: 'boss', label: 'Dungeon · boss', kind: 'direct', kindLabel: 'Direct hit' },
		{ key: 'theory', label: 'Theory · normal', kind: 'placement', kindLabel: 'Placement' },
		{ key: 'boss-theory', label: 'Theory · boss', kind: 'placement', kindLabel: 'Placement' },
		{ key: 'normal', label: 'Dungeon · normal', kind: 'placement', kindLabel: 'Placement' },
		{ key: 'boss', label: 'Dungeon · boss', kind: 'placement', kindLabel: 'Placement' }
	] as const;
	const conversionRows = [
		['criticalToMinimum', '1% critical → minimum'],
		['criticalToMaximum', '1% critical → maximum'],
		['dominationToCritical', '1% domination → critical'],
		['dominationToMinimum', '1% domination → minimum'],
		['dominationToMaximum', '1% domination → maximum']
	] as const;
	const practicalRows = [
		['normalDirect', 'Normal direct'],
		['bossDirect', 'Boss direct'],
		['normalPlacement', 'Normal placement'],
		['bossPlacement', 'Boss placement']
	] as const;
	const enchantStatRows = [
		['strMag', 'Strength / magic'],
		['weaponAttr', 'Weapon / attribute'],
		['fixedDamage', 'Fixed damage'],
		['criticalDamage', 'Critical damage'],
		['minimumDamage', 'Minimum damage'],
		['maximumDamage', 'Maximum damage'],
		['normalExtraDamage', 'Normal extra damage'],
		['bossExtraDamage', 'Boss extra damage'],
		['normalDomination', 'Normal domination'],
		['bossDomination', 'Boss domination']
	] as const;

	const defaultInputs = () => ({ ...DEFAULT_SPEC_INPUTS });
	const defaultSettings = () => ({ ...DEFAULT_SPEC_CALCULATION_SETTINGS });
	const defaultSelections = () => ({ ...DEFAULT_SPEC_SELECTIONS });
	const defaultEnchant = () => ({ ...DEFAULT_ENCHANT_OPTION });
	const defaultHp = () => ({ stamina: 0, staminaMinus10: 0, maxHp: 0, maxHpMinus10: 0 });

	let inputs = $state(defaultInputs());
	let settings = $state(defaultSettings());
	let selections = $state(defaultSelections());
	let oldEnchant = $state(defaultEnchant());
	let newEnchant = $state(defaultEnchant());
	let hpCalibration = $state(defaultHp());
	let activeTab = $state<TabId>('base');
	let conversionCriterion = $state<'normal' | 'boss'>('boss');
	let coefficientJobId = $state('sword-saint');
	let indicatorCoefficient = $state('17000');
	let reflectionPercent = $state('148');
	let measuredBossDamage = $state('0');
	let directSearch = $state('');
	let placementSearch = $state('');
	let saveName = $state('');
	let selectedSavedId = $state('');
	let savedSpecs = $state<any[]>([]);
	let wideView = $state(false);
	let statusMessage = $state('');
	let hydrated = $state(false);

	let selectedJob = $derived(JOBS.find((item) => item.id === selections.jobId) ?? JOBS[0]);
	let jobDirectSkills = $derived(DIRECT_SKILLS.filter((item) => item.job === selectedJob.name));
	let jobPlacementSkills = $derived(PLACEMENT_SKILLS.filter((item) => item.job === selectedJob.name));
	let selectedDirect = $derived(
		DIRECT_SKILLS.find((item) => item.id === selections.directSkillId) ?? jobDirectSkills[0] ?? DIRECT_SKILLS[0]
	);
	let selectedPlacement = $derived(
		PLACEMENT_SKILLS.find((item) => item.id === selections.placementSkillId) ??
			jobPlacementSkills[0] ??
			PLACEMENT_SKILLS[0]
	);
	let selectedDungeon = $derived(DUNGEONS.find((item) => item.id === selections.dungeonId) ?? DUNGEONS[0]);
	let coefficientJob = $derived(JOBS.find((item) => item.id === coefficientJobId) ?? JOBS[0]);
	let coefficientDirectSkills = $derived(DIRECT_SKILLS.filter((item) => item.job === coefficientJob.name));
	let coefficientPlacementSkills = $derived(PLACEMENT_SKILLS.filter((item) => item.job === coefficientJob.name));
	let resolvedDungeon = $derived(resolveDungeon(selectedDungeon, settings));
	let directCoefficient = $derived(
		parseNumericInput(selectedDirect.baseCoefficient) +
			parseNumericInput(selectedDirect.perLevel) * parseNumericInput(selections.directSkillLevel)
	);
	let placement = $derived(placementCoefficients(selectedPlacement, selections.placementSkillLevel));
	let placementCore = $derived(placementCoreCoefficients(inputs.placementCoreLevel));
	let stats = $derived(aggregateStats(inputs, { summonId: selections.summonId }));
	let conversion = $derived(calculateConversionSummary(stats, { criterion: conversionCriterion }));
	let bossConversion = $derived(calculateConversionSummary(stats, { criterion: 'boss' }));
	let efficiency = $derived(
		calculateDamageEfficiency({
			stats,
			directCoefficient,
			placementSkill: selectedPlacement,
			placementSkillLevel: selections.placementSkillLevel,
			dungeon: resolvedDungeon,
			backAttackRate: settings.backAttackRate,
			damageMode: settings.damageMode,
			referenceStat: settings.referenceStat,
			settings
		})
	);
	let enchantComparison = $derived(
		compareEnchants({
			inputs: { ...inputs, summonId: selections.summonId },
			oldEnchant,
			newEnchant,
			directCoefficient,
			placementSkill: selectedPlacement,
			placementSkillLevel: selections.placementSkillLevel,
			dungeon: resolvedDungeon,
			backAttackRate: settings.backAttackRate,
			damageMode: settings.damageMode,
			referenceStat: settings.referenceStat,
			hpCalibration
		})
	);
	let backAttackEnchantComparison = $derived(
		compareEnchants({
			inputs: { ...inputs, summonId: selections.summonId },
			oldEnchant,
			newEnchant,
			directCoefficient,
			placementSkill: selectedPlacement,
			placementSkillLevel: selections.placementSkillLevel,
			dungeon: resolvedDungeon,
			backAttackRate: 100,
			damageMode: settings.damageMode,
			referenceStat: settings.referenceStat,
			hpCalibration
		})
	);
	let build = $derived(
		calculateBuildEfficiency({
			stats,
			directCoefficient,
			placementSkill: selectedPlacement,
			placementSkillLevel: selections.placementSkillLevel,
			dungeon: resolvedDungeon,
			backAttackRate: settings.backAttackRate,
			damageMode: settings.damageMode
		})
	);
	let nearestBuildProfile = $derived(
		build.profiles.find((profile) => profile.id === build.nearestProfileId)
	);
	let hitIndicator = $derived(calculateHitIndicator(stats, indicatorCoefficient));
	let summonReflection = $derived(calculateSummonReflection(stats, reflectionPercent));
	let placementInference = $derived(
		inferPlacementMultiplier({
			stats,
			skill: selectedPlacement,
			skillLevel: selections.placementSkillLevel,
			dungeon: resolvedDungeon,
			measuredBossDamage,
			mode: settings.damageMode
		})
	);
	let visibleDirectSkills = $derived.by(() => {
		const query = directSearch.trim().toLocaleLowerCase();
		if (!query) return coefficientDirectSkills;
		return coefficientDirectSkills.filter((skill) =>
			[skill.name, skill.sourceName, skill.job, String(skill.skillId ?? '')]
				.join(' ')
				.toLocaleLowerCase()
				.includes(query)
		);
	});
	let visiblePlacementSkills = $derived.by(() => {
		const query = placementSearch.trim().toLocaleLowerCase();
		if (!query) return coefficientPlacementSkills;
		return coefficientPlacementSkills.filter((skill) =>
			[skill.name, skill.sourceName, skill.job, String(skill.skillId ?? '')]
				.join(' ')
				.toLocaleLowerCase()
				.includes(query)
		);
	});
	let persistencePayload = $derived.by(() =>
		JSON.stringify({
			state: {
				inputs,
				settings,
				selections,
				oldEnchant,
				newEnchant,
				hpCalibration,
				activeTab,
				conversionCriterion,
				coefficientJobId,
				indicatorCoefficient,
				reflectionPercent,
				measuredBossDamage,
				wideView
			},
			savedSpecs
		})
	);

	const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
	const decimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
	const percentChange = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
	const precise = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 });
	const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 3 });

	function formatNumber(value: unknown, digits = 0) {
		const parsed = Number(value) || 0;
		if (digits >= 4) return precise.format(parsed);
		return digits === 0 ? integer.format(parsed) : decimal.format(parsed);
	}

	function formatDamage(value: unknown) {
		return compact.format(Number(value) || 0);
	}

	function formatPractical(value: unknown) {
		const parsed = Number(value) || 0;
		if (Math.abs(parsed) < 1) return integer.format(parsed * 10000) + ' 만';
		return (Math.abs(parsed) >= 100 ? integer : decimal).format(parsed) + ' 억';
	}

	function formatPercent(value: unknown) {
		return decimal.format(Number(value) || 0) + '%';
	}

	function formatChangePercent(value: unknown) {
		const parsed = Number(value) || 0;
		return (parsed > 0 ? '+' : '') + percentChange.format(parsed) + '%';
	}

	function buildPositionPercent(value: unknown) {
		const ratio = Number(value) || 0;
		return Math.min(100, Math.max(0, ((ratio - 35.5) / 25) * 100));
	}

	function setTab(value: string | undefined) {
		if (value && tabs.some((tab) => tab.id === value)) {
			activeTab = value as TabId;
			syncTabUrl();
		}
	}

	function syncTabUrl() {
		if (!browser || !hydrated) return;
		replaceState(resolve(`/spec-analyzer?tab=${tabUrlIds[activeTab]}`), {});
	}

	function setJob(value: string | undefined) {
		if (!value) return;
		const job = JOBS.find((item) => item.id === value);
		if (!job) return;
		selections.jobId = value;
		const direct = DIRECT_SKILLS.find((item) => item.job === job.name);
		const placementSkill = PLACEMENT_SKILLS.find((item) => item.job === job.name);
		if (direct) selections.directSkillId = direct.id;
		if (placementSkill) selections.placementSkillId = placementSkill.id;
		directSearch = '';
		placementSearch = '';
	}

	function setCoefficientJob(value: string | undefined) {
		if (!value || !JOBS.some((item) => item.id === value)) return;
		coefficientJobId = value;
		directSearch = '';
		placementSearch = '';
	}

	function fillCustomDungeonFromPreset() {
		settings.customNormalDefense = selectedDungeon.normalDefense;
		settings.customBossDefense = selectedDungeon.bossDefense;
		settings.customNormalDmgReduction = selectedDungeon.normalDmgReduction;
		settings.customBossDmgReduction = selectedDungeon.bossDmgReduction;
		statusMessage = selectedDungeon.name + ' defenses copied into the custom fields.';
	}

	function enchantStatValue(source: any, key: (typeof enchantStatRows)[number][0]) {
		const value = source?.[key];
		return typeof value === 'number' ? value : Number(value?.total) || 0;
	}

	function fullConversionComparisonRows(sourceStats: any, sourceConversion: any) {
		return [
			['Strength / magic 1%', sourceStats.strMag.per1Pct],
			['Weapon / attribute 1%', sourceStats.weaponAttr.per1Pct],
			['Fixed damage 1%', sourceStats.fixedDamage.per1Pct],
			['Normal extra damage 1%', sourceStats.normalExtraDamage.per1Pct],
			['Boss extra damage 1%', sourceStats.bossExtraDamage.per1Pct],
			['1% critical → minimum', sourceConversion.criticalToMinimum],
			['1% critical → maximum', sourceConversion.criticalToMaximum],
			['Final critical damage 1%', sourceConversion.finalCriticalPer1],
			['Final maximum damage 1%', sourceConversion.finalMaximumPer1],
			['Final minimum damage 1%', sourceConversion.finalMinimumPer1],
			['1% boss domination → critical', sourceConversion.dominationToCritical],
			['1% boss domination → maximum', sourceConversion.dominationToMaximum],
			['1% boss domination → minimum', sourceConversion.dominationToMinimum]
		] as const;
	}

	function clearInputs() {
		const cleared: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(DEFAULT_SPEC_INPUTS)) {
			cleared[key] = typeof value === 'boolean' ? true : typeof value === 'string' ? 'none' : '0';
		}
		inputs = cleared as ReturnType<typeof defaultInputs>;
	}

	function loadDefaults() {
		inputs = defaultInputs();
		statusMessage = 'Reference test stats loaded. Setup and calculation settings were preserved.';
	}

	function clearEnchants() {
		oldEnchant = defaultEnchant();
		newEnchant = defaultEnchant();
		hpCalibration = defaultHp();
		statusMessage = 'Enchant and HP fields cleared.';
	}

	function stateSnapshot() {
		return JSON.parse(
			JSON.stringify({
				inputs,
				settings,
				selections,
				oldEnchant,
				newEnchant,
				hpCalibration,
				activeTab,
				conversionCriterion,
				coefficientJobId,
				indicatorCoefficient,
				reflectionPercent,
				measuredBossDamage,
				wideView
			})
		);
	}

	function applySnapshot(snapshot: any) {
		if (!snapshot) return;
		inputs = { ...defaultInputs(), ...(snapshot.inputs ?? {}) };
		settings = { ...defaultSettings(), ...(snapshot.settings ?? {}) };
		settings.backAttackRate = Math.min(100, Math.max(0, parseNumericInput(settings.backAttackRate)));
		selections = { ...defaultSelections(), ...(snapshot.selections ?? {}) };
		oldEnchant = { ...defaultEnchant(), ...(snapshot.oldEnchant ?? {}) };
		newEnchant = { ...defaultEnchant(), ...(snapshot.newEnchant ?? {}) };
		hpCalibration = { ...defaultHp(), ...(snapshot.hpCalibration ?? {}) };
		if (tabs.some((tab) => tab.id === snapshot.activeTab)) activeTab = snapshot.activeTab;
		conversionCriterion = snapshot.conversionCriterion === 'normal' ? 'normal' : 'boss';
		coefficientJobId = JOBS.some((item) => item.id === snapshot.coefficientJobId)
			? snapshot.coefficientJobId
			: 'sword-saint';
		indicatorCoefficient = String(snapshot.indicatorCoefficient ?? '17000');
		reflectionPercent = String(snapshot.reflectionPercent ?? '148');
		measuredBossDamage = String(snapshot.measuredBossDamage ?? '0');
		wideView = Boolean(snapshot.wideView);
	}

	function saveCurrentSpec() {
		const name = saveName.trim();
		if (!name) {
			statusMessage = 'Enter a name before saving.';
			return;
		}
		const existing = savedSpecs.find((item) => item.name.toLocaleLowerCase() === name.toLocaleLowerCase());
		const saved = {
			id: existing?.id ?? crypto.randomUUID(),
			name,
			savedAt: new Date().toISOString(),
			state: stateSnapshot()
		};
		savedSpecs = existing
			? savedSpecs.map((item) => (item.id === existing.id ? saved : item))
			: [...savedSpecs, saved];
		selectedSavedId = saved.id;
		statusMessage = existing ? 'Saved specification updated.' : 'Specification saved.';
	}

	function loadSavedSpec() {
		const saved = savedSpecs.find((item) => item.id === selectedSavedId);
		if (!saved) {
			statusMessage = 'Choose a saved specification first.';
			return;
		}
		applySnapshot(saved.state);
		syncTabUrl();
		saveName = saved.name;
		statusMessage = 'Loaded ' + saved.name + '.';
	}

	function deleteSavedSpec() {
		const saved = savedSpecs.find((item) => item.id === selectedSavedId);
		if (!saved) {
			statusMessage = 'Choose a saved specification first.';
			return;
		}
		savedSpecs = savedSpecs.filter((item) => item.id !== selectedSavedId);
		selectedSavedId = '';
		statusMessage = 'Deleted ' + saved.name + '.';
	}

	type ReportTableOptions = {
		widths?: number[];
		aligns?: CanvasTextAlign[];
		fontSize?: number;
		rowHeight?: number;
	};

	function renderReportCanvas() {
		const draft = document.createElement('canvas');
		draft.width = 1600;
		draft.height = 7200;
		const reportContext = draft.getContext('2d');
		if (!reportContext) return draft;
		const context = reportContext;

		const margin = 64;
		const contentWidth = draft.width - margin * 2;
		const gap = 24;
		const halfWidth = (contentWidth - gap) / 2;
		let y = 64;

		context.fillStyle = '#ffffff';
		context.fillRect(0, 0, draft.width, draft.height);
		context.textBaseline = 'middle';

		function font(size: number, weight = 400) {
			context.font = `${weight} ${size}px system-ui, sans-serif`;
		}

		function fitText(value: unknown, maxWidth: number) {
			const text = String(value ?? '—');
			if (context.measureText(text).width <= maxWidth) return text;
			let shortened = text;
			while (shortened.length > 1 && context.measureText(shortened + '…').width > maxWidth) {
				shortened = shortened.slice(0, -1);
			}
			return shortened + '…';
		}

		function section(title: string) {
			y += 28;
			context.fillStyle = '#9a3412';
			context.fillRect(margin, y, 8, 34);
			context.fillStyle = '#171717';
			font(30, 700);
			context.textAlign = 'left';
			context.fillText(title, margin + 22, y + 17);
			y += 54;
			context.strokeStyle = '#d6d3d1';
			context.beginPath();
			context.moveTo(margin, y);
			context.lineTo(margin + contentWidth, y);
			context.stroke();
			y += 26;
		}

		function drawTableAt(
			x: number,
			top: number,
			width: number,
			headers: Array<string | number>,
			rows: Array<Array<string | number>>,
			options: ReportTableOptions = {}
		) {
			const rowHeight = options.rowHeight ?? 42;
			const fontSize = options.fontSize ?? 18;
			const fractions = options.widths ?? headers.map(() => 1 / headers.length);
			const fractionTotal = fractions.reduce((total, value) => total + value, 0) || 1;
			const widths = fractions.map((value) => (value / fractionTotal) * width);
			const allRows = [headers, ...rows];

			allRows.forEach((row, rowIndex) => {
				let cellX = x;
				row.forEach((value, columnIndex) => {
					const cellWidth = widths[columnIndex] ?? widths.at(-1) ?? width;
					context.fillStyle = rowIndex === 0 ? '#e7e5e4' : rowIndex % 2 === 0 ? '#fafaf9' : '#ffffff';
					context.fillRect(cellX, top + rowIndex * rowHeight, cellWidth, rowHeight);
					context.strokeStyle = '#d6d3d1';
					context.strokeRect(cellX, top + rowIndex * rowHeight, cellWidth, rowHeight);
					font(rowIndex === 0 ? fontSize - 1 : fontSize, rowIndex === 0 ? 700 : 400);
					context.fillStyle = '#292524';
					const align = options.aligns?.[columnIndex] ?? (columnIndex === 0 ? 'left' : 'right');
					context.textAlign = align;
					const padding = 12;
					const textX = align === 'right' ? cellX + cellWidth - padding : align === 'center' ? cellX + cellWidth / 2 : cellX + padding;
					context.fillText(
						fitText(value, cellWidth - padding * 2),
						textX,
						top + rowIndex * rowHeight + rowHeight / 2
					);
					cellX += cellWidth;
				});
			});
			return allRows.length * rowHeight;
		}

		function titledTableAt(
			title: string,
			x: number,
			top: number,
			width: number,
			headers: Array<string | number>,
			rows: Array<Array<string | number>>,
			options: ReportTableOptions = {}
		) {
			context.fillStyle = '#57534e';
			font(20, 700);
			context.textAlign = 'left';
			context.fillText(title, x, top + 12);
			return 38 + drawTableAt(x, top + 38, width, headers, rows, options);
		}

		function reportDamage(value: unknown) {
			return formatNumber((Number(value) || 0) / 100000000, 2) + ' 억';
		}

		context.fillStyle = '#171717';
		font(42, 800);
		context.textAlign = 'center';
		context.fillText('LaTale Specification Analysis Report', draft.width / 2, y + 18);
		y += 66;
		context.fillStyle = '#78716c';
		font(18, 400);
		context.fillText(
			`${new Date().toLocaleDateString()} · ${selectedJob.name} · ${selectedDirect.name} Lv.${formatNumber(selections.directSkillLevel)} · ${selectedPlacement.name} Lv.${formatNumber(selections.placementSkillLevel)} · ${selectedDungeon.name}`,
			draft.width / 2,
			y
		);
		y += 32;

		section('1. Base specification');
		const baseRows = [
			['Strength / magic', formatNumber(stats.strMag.total)],
			['Weapon / attribute', formatNumber(stats.weaponAttr.total)],
			['Critical damage', formatNumber(stats.criticalDamage.total)],
			['Minimum damage', formatNumber(stats.minimumDamage.total)],
			['Maximum damage', formatNumber(stats.maximumDamage.total)],
			['Fixed damage', formatNumber(stats.fixedDamage.total)],
			['Normal extra damage', formatNumber(stats.normalExtraDamage.total)],
			['Boss extra damage', formatNumber(stats.bossExtraDamage.total)],
			['Normal domination', formatPercent(stats.normalDomination)],
			['Boss domination', formatPercent(stats.bossDomination)],
			['Strength / magic efficiency', formatPercent(stats.strMagEfficiency)],
			['Penetration', formatPercent(stats.penetration)]
		];
		const conversionSummaryRows = [
			['Strength / magic 1%', formatNumber(stats.strMag.per1Pct, 2)],
			['Weapon / attribute 1%', formatNumber(stats.weaponAttr.per1Pct, 2)],
			['Fixed damage 1%', formatNumber(stats.fixedDamage.per1Pct, 2)],
			['Normal extra damage 1%', formatNumber(stats.normalExtraDamage.per1Pct, 2)],
			['Boss extra damage 1%', formatNumber(stats.bossExtraDamage.per1Pct, 2)],
			['Critical → minimum', formatNumber(bossConversion.criticalToMinimum, 2)],
			['Critical → maximum', formatNumber(bossConversion.criticalToMaximum, 2)],
			['Final critical 1%', formatNumber(bossConversion.finalCriticalPer1, 2)],
			['Final maximum 1%', formatNumber(bossConversion.finalMaximumPer1, 2)],
			['Final minimum 1%', formatNumber(bossConversion.finalMinimumPer1, 2)],
			['Boss domination → critical', formatNumber(bossConversion.dominationToCritical, 2)],
			['Boss domination → maximum', formatNumber(bossConversion.dominationToMaximum, 2)],
			['Boss domination → minimum', formatNumber(bossConversion.dominationToMinimum, 2)]
		];
		const baseLeftHeight = titledTableAt('Main stats (boss criterion)', margin, y, halfWidth, ['Stat', 'Value'], baseRows, { widths: [0.64, 0.36] });
		const baseRightHeight = titledTableAt('Conversion summary', margin + halfWidth + gap, y, halfWidth, ['Conversion', 'Value'], conversionSummaryRows, { widths: [0.7, 0.3] });
		y += Math.max(baseLeftHeight, baseRightHeight) + 28;
		const damageShareHeight = titledTableAt(
			'Multiplicative damage shares',
			margin,
			y,
			halfWidth,
			['Stat', 'Share'],
			damageShareRows.map(([key, label]) => [label, formatPercent(bossConversion.damageShares[key] * 100)]),
			{ widths: [0.64, 0.36] }
		);
		const baseShareHeight = titledTableAt(
			'Base-stat damage shares',
			margin + halfWidth + gap,
			y,
			halfWidth,
			['Stat', 'Share'],
			baseShareRows.map(([key, label]) => [label, formatPercent(bossConversion.baseShares[key] * 100)]),
			{ widths: [0.64, 0.36] }
		);
		y += Math.max(damageShareHeight, baseShareHeight) + 28;

		section('2. Damage efficiency');
		y += titledTableAt(
			'Defense and damage-reduction bypass',
			margin,
			y,
			halfWidth,
			['Scenario', 'Bypass'],
			[
				['Direct · normal', formatPercent(efficiency.bypass.normal.direct)],
				['Direct · boss', formatPercent(efficiency.bypass.boss.direct)],
				['Placement · normal', formatPercent(efficiency.bypass.normal.placement)],
				['Placement · boss', formatPercent(efficiency.bypass.boss.placement)]
			],
			{ widths: [0.64, 0.36] }
		) + 28;
		y += titledTableAt(
			'Skill coefficient summary',
			margin,
			y,
			contentWidth,
			['Coefficient', 'Value'],
			[
				['Direct-hit coefficient', formatNumber(directCoefficient, 4)],
				['Placement weapon coefficient', formatNumber(placement.weaponCoefficient, 2)],
				['Placement strength / magic multiplier', formatNumber(placement.strengthMultiplier, 2)]
			],
			{ widths: [0.68, 0.32] }
		) + 28;
		const reportPanels = [
			['Direct · theory', efficiency.direct.theory],
			['Direct · dungeon normal', efficiency.direct.normal],
			['Direct · dungeon boss', efficiency.direct.boss],
			['Placement · theory', efficiency.placement.theory],
			['Placement · dungeon normal', efficiency.placement.normal],
			['Placement · dungeon boss', efficiency.placement.boss]
		] as const;
		for (let index = 0; index < reportPanels.length; index += 2) {
			const [leftTitle, leftPanel] = reportPanels[index];
			const [rightTitle, rightPanel] = reportPanels[index + 1];
			const panelRows = (panel: any) =>
				panel.equivalents.map((item: any) => [item.label, formatNumber(item.value, 2), formatNumber(item.reverse, 2)]);
			const leftHeight = titledTableAt(leftTitle, margin, y, halfWidth, ['Equivalent', 'Value', 'Reverse'], panelRows(leftPanel), { widths: [0.56, 0.22, 0.22], fontSize: 17 });
			const rightHeight = titledTableAt(rightTitle, margin + halfWidth + gap, y, halfWidth, ['Equivalent', 'Value', 'Reverse'], panelRows(rightPanel), { widths: [0.56, 0.22, 0.22], fontSize: 17 });
			y += Math.max(leftHeight, rightHeight) + 28;
		}

		section('3. Enchant comparison');
		const scenarioReportRows = (comparison: any) =>
			scenarioRows.map((row) => {
				const result = comparison.scenarios[row.key]?.[row.kind];
				return [
					`${row.label} · ${row.kindLabel}`,
					reportDamage(result?.old),
					reportDamage(result?.new),
					formatChangePercent(result?.percentChange)
				];
			});
		y += titledTableAt('Damage change', margin, y, contentWidth, ['Scenario', 'Before', 'After', 'Change'], scenarioReportRows(enchantComparison), { widths: [0.43, 0.19, 0.19, 0.19], fontSize: 17 }) + 28;
		y += titledTableAt('Full back-attack projection', margin, y, contentWidth, ['Scenario', 'Before', 'After', 'Change'], scenarioReportRows(backAttackEnchantComparison), { widths: [0.43, 0.19, 0.19, 0.19], fontSize: 17 }) + 28;
		y += titledTableAt(
			'Stat changes',
			margin,
			y,
			contentWidth,
			['Stat', 'Before', 'After', 'Difference'],
			enchantStatRows.map(([key, label]) => {
				const before = enchantStatValue(enchantComparison.oldStats, key);
				const after = enchantStatValue(enchantComparison.newStats, key);
				return [label, formatNumber(before, 2), formatNumber(after, 2), formatNumber(after - before, 2)];
			}),
			{ widths: [0.43, 0.19, 0.19, 0.19], fontSize: 17 }
		) + 28;
		const oldFullConversions = fullConversionComparisonRows(
			enchantComparison.oldStats,
			enchantComparison.conversion.old
		);
		const newFullConversions = fullConversionComparisonRows(
			enchantComparison.newStats,
			enchantComparison.conversion.new
		);
		const enchantConversionHeight = titledTableAt(
			'Conversion changes',
			margin,
			y,
			halfWidth,
			['Conversion', 'Before', 'After'],
			oldFullConversions.map(([label, before], index) => [
				label,
				formatNumber(before, 2),
				formatNumber(newFullConversions[index][1], 2)
			]),
			{ widths: [0.56, 0.22, 0.22], fontSize: 16 }
		);
		const oldTheory = enchantComparison.efficiency.old.direct.theory;
		const newTheory = enchantComparison.efficiency.new.direct.theory;
		const enchantEfficiencyHeight = titledTableAt(
			'Direct theory efficiency changes',
			margin + halfWidth + gap,
			y,
			halfWidth,
			['Equivalent', 'Before', 'Reverse', 'After', 'Reverse'],
			oldTheory.equivalents.map((item: any) => {
				const after = newTheory.equivalents.find((candidate: any) => candidate.key === item.key);
				return [
					item.label,
					formatNumber(item.value, 2),
					formatNumber(item.reverse, 2),
					formatNumber(after?.value, 2),
					formatNumber(after?.reverse, 2)
				];
			}),
			{ widths: [0.42, 0.145, 0.145, 0.145, 0.145], fontSize: 13 }
		);
		y += Math.max(enchantConversionHeight, enchantEfficiencyHeight) + 28;

		section('4. Build efficiency');
		context.fillStyle = '#57534e';
		font(20, 400);
		context.textAlign = 'left';
		context.fillText(
			`Combined stat budget: ${formatNumber(build.budget, 2)} | Current strength share: ${formatNumber(Math.round(build.currentRatio * 10) / 10, 1)}%`,
			margin,
			y + 12
		);
		y += 48;

		const positionCardTop = y;
		const positionCardHeight = 176;
		const positionTrackX = margin + 28;
		const positionTrackY = positionCardTop + 62;
		const positionTrackWidth = contentWidth - 56;
		const positionTrackHeight = 28;
		context.fillStyle = '#ffffff';
		context.strokeStyle = '#d6d3d1';
		context.lineWidth = 2;
		context.beginPath();
		context.roundRect(margin, positionCardTop, contentWidth, positionCardHeight, 12);
		context.fill();
		context.stroke();
		context.fillStyle = '#57534e';
		font(20, 700);
		context.textAlign = 'left';
		context.fillText(
			`Current build position — strength share: ${formatNumber(Math.round(build.currentRatio * 10) / 10, 1)}% (≈ ${nearestBuildProfile?.name ?? '—'})`,
			margin + 24,
			positionCardTop + 28
		);
		context.fillStyle = '#f5f5f4';
		context.strokeStyle = '#e7e5e4';
		context.beginPath();
		context.roundRect(
			positionTrackX,
			positionTrackY,
			positionTrackWidth,
			positionTrackHeight,
			positionTrackHeight / 2
		);
		context.fill();
		context.stroke();

		for (const profile of build.profiles) {
			const x =
				positionTrackX +
				(buildPositionPercent(profile.strengthRatio) / 100) * positionTrackWidth;
			const isNearest = profile.id === build.nearestProfileId;
			context.fillStyle = isNearest ? '#c2410c' : '#a8a29e';
			context.beginPath();
			context.arc(x, positionTrackY + positionTrackHeight / 2, isNearest ? 8 : 6, 0, Math.PI * 2);
			context.fill();
			context.fillStyle = isNearest ? '#c2410c' : '#78716c';
			font(15, isNearest ? 700 : 400);
			context.textAlign = 'center';
			context.fillText(profile.name, x, positionCardTop + 132);
		}

		const currentX =
			positionTrackX + (buildPositionPercent(build.currentRatio) / 100) * positionTrackWidth;
		context.fillStyle = '#0f172a';
		context.strokeStyle = '#ffffff';
		context.lineWidth = 4;
		context.beginPath();
		context.arc(currentX, positionTrackY + positionTrackHeight / 2, 11, 0, Math.PI * 2);
		context.fill();
		context.stroke();
		y += positionCardHeight + 28;

		const currentBuildRow = [
			'Current',
			formatPercent(build.currentRatio),
			formatNumber(build.current.strMag),
			formatNumber(build.current.weaponAttr)
		];
		const allocationRows = [
			currentBuildRow,
			...build.profiles.map((profile: any) => [profile.name, formatPercent(profile.strengthRatio), formatNumber(profile.strMag), formatNumber(profile.weaponAttr)])
		];
		y += titledTableAt('Strength versus weapon allocation', margin, y, contentWidth, ['Profile', 'Strength share', 'Strength / magic', 'Weapon / attribute'], allocationRows, { widths: [0.34, 0.18, 0.25, 0.23], fontSize: 17 }) + 28;
		const currentDamageRow = [
			'Current',
			...practicalRows.map(([key]) => formatPractical(build.current.practicalEok[key]))
		];
		const buildDamageRows = [
			currentDamageRow,
			...build.profiles.map((profile: any) => [
				profile.name,
				...practicalRows.map(([key]) =>
					`${formatPractical(profile.practicalEok[key])} (${build.current.practicalEok[key] === 0 ? '—' : formatChangePercent(profile.change[key])})`
				)
			])
		];
		y += titledTableAt('Practical damage by allocation', margin, y, contentWidth, ['Profile', 'Normal direct', 'Boss direct', 'Normal placement', 'Boss placement'], buildDamageRows, { widths: [0.28, 0.18, 0.18, 0.18, 0.18], fontSize: 16 }) + 28;

		context.fillStyle = '#78716c';
		font(16, 400);
		context.textAlign = 'center';
		context.fillText('Generated locally by LaTale Tools · estimates are unaffiliated with Actoz Soft', draft.width / 2, y + 24);
		y += 64;

		const canvas = document.createElement('canvas');
		canvas.width = draft.width;
		canvas.height = Math.ceil(y);
		const finalContext = canvas.getContext('2d');
		finalContext?.drawImage(draft, 0, 0);
		return canvas;
	}

	function exportPng() {
		if (!browser) return;
		const canvas = renderReportCanvas();
		canvas.toBlob((blob) => {
			if (!blob) return;
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement('a');
			anchor.href = url;
			anchor.download = 'latale-specification-' + new Date().toISOString().slice(0, 10) + '.png';
			anchor.click();
			URL.revokeObjectURL(url);
			statusMessage = 'Full PNG report exported.';
		}, 'image/png');
	}

	function printReport() {
		if (!browser) return;
		const reportWindow = window.open('', '_blank');
		if (!reportWindow) {
			statusMessage = 'Allow pop-ups to print or save the report as PDF.';
			return;
		}
		const imageUrl = renderReportCanvas().toDataURL('image/png');
		reportWindow.document.head.innerHTML =
			'<title>LaTale Specification Analysis Report</title><style>@page{margin:0}html,body{margin:0;background:#fff}img{display:block;width:100%;height:auto}</style>';
		const image = reportWindow.document.createElement('img');
		image.alt = 'LaTale Specification Analysis Report';
		image.onload = () => {
			reportWindow.focus();
			reportWindow.print();
		};
		image.src = imageUrl;
		reportWindow.document.body.append(image);
		statusMessage = 'Print report opened. Choose Save as PDF in the print dialog.';
	}

	onMount(() => {
		try {
			const stored = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
			if (stored?.state) applySnapshot(stored.state);
			if (Array.isArray(stored?.savedSpecs)) savedSpecs = stored.savedSpecs;
		} catch {
			localStorage.removeItem(storageKey);
		}
		const urlToken = new URL(window.location.href).searchParams.get('tab');
		const urlTab = urlToken ? (tabUrlAliases[urlToken] ?? tabs.find((tab) => tab.id === urlToken)?.id) : undefined;
		if (urlTab) activeTab = urlTab;
		hydrated = true;
	});

	$effect(() => {
		const payload = persistencePayload;
		if (browser && hydrated) {
			localStorage.setItem(storageKey, payload);
		}
	});
</script>

<svelte:head>
	<title>Specification Analyzer · LaTale Tools</title>
	<meta
		name="description"
		content="Analyze LaTale stats, conversions, damage efficiency, enchants, builds, indicators, and live skill coefficients."
	/>
</svelte:head>

{#snippet selectTrigger(label: string)}
	<Select.Trigger class="w-full">
		<span class="truncate">{label}</span>
	</Select.Trigger>
{/snippet}

{#snippet changeBadge(value: unknown)}
	{@const parsed = Number(value) || 0}
	<Badge variant={parsed > 0 ? 'default' : parsed < 0 ? 'destructive' : 'outline'}>
		{formatChangePercent(parsed)}
	</Badge>
{/snippet}

{#snippet efficiencyCard(title: string, subtitle: string, panel: any)}
	<Card.Root size="sm">
		<Card.Header>
			<Card.Title><h3>{title}</h3></Card.Title>
			<Card.Description>{subtitle}</Card.Description>
			<Card.Action><Badge variant="secondary">{formatDamage(panel?.damage)}</Badge></Card.Action>
		</Card.Header>
		<Card.Content>
			<div class="flex flex-col gap-2">
				{#each panel?.equivalents ?? [] as item (item.key)}
					<div class="flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-3 py-2">
						<span class="text-sm text-muted-foreground">{item.label}</span>
						<span class="text-right text-sm font-medium tabular-nums">
							{formatNumber(item.value, 2)}
							<span class="text-xs font-normal text-muted-foreground">
								/ {formatNumber(item.reverse, 2)}× reverse
							</span>
						</span>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
{/snippet}

{#snippet metricCard(label: string, value: string, description: string = '')}
	<Card.Root size="sm">
		<Card.Header>
			<Card.Description>{label}</Card.Description>
			<Card.Title class="text-2xl tabular-nums">{value}</Card.Title>
		</Card.Header>
		{#if description}
			<Card.Content>
				<p class="text-xs text-muted-foreground">{description}</p>
			</Card.Content>
		{/if}
	</Card.Root>
{/snippet}

<main
	class={cn(
		'mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 print:max-w-none print:px-0',
		wideView ? 'max-w-[1900px]' : 'max-w-[1500px]'
	)}
>
	<header class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
		<div class="max-w-3xl">
			<Badge variant="secondary">
				<ScanSearchIcon data-icon="inline-start" aria-hidden="true" />
				Live parity · {SPEC_ANALYZER_DATA_META.counts.jobs} jobs ·
				{SPEC_ANALYZER_DATA_META.counts.directSkills} direct ·
				{SPEC_ANALYZER_DATA_META.counts.placementSkills} placement
			</Badge>
			<h1 class="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Specification Analyzer</h1>
			<p class="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
				Model displayed stats, inspect every conversion, compare replacement enchants, and test
				current live skill coefficients. Expressions such as 100+50 are accepted in numeric fields.
			</p>
		</div>
		<div class="flex flex-wrap gap-2 print:hidden">
			<Button variant="outline" onclick={() => (wideView = !wideView)}>
				{#if wideView}
					<Minimize2Icon data-icon="inline-start" aria-hidden="true" />
					Comfort view
				{:else}
					<Maximize2Icon data-icon="inline-start" aria-hidden="true" />
					Wide view
				{/if}
			</Button>
			<Button variant="outline" onclick={exportPng}>
				<DownloadIcon data-icon="inline-start" aria-hidden="true" />
				Export PNG
			</Button>
			<Button variant="outline" onclick={printReport}>
				<PrinterIcon data-icon="inline-start" aria-hidden="true" />
				Print / PDF
			</Button>
			<Button
				href="https://www.latale.com/community/knowledge/view/20372?page=1"
				target="_blank"
				rel="noopener noreferrer"
				variant="outline"
			>
				Original
				<ArrowUpRightIcon data-icon="inline-end" aria-hidden="true" />
			</Button>
		</div>
	</header>

	<Card.Root class="mt-7 print:hidden">
		<Card.Header>
			<Card.Title><h2>Saved specifications</h2></Card.Title>
			<Card.Description>
				Named saves include every input, setting, selection, enchant, HP calibration, and indicator.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<Field.Group class="grid gap-4 lg:grid-cols-[minmax(12rem,1fr)_minmax(12rem,1fr)_auto_auto_auto]">
				<Field.Field>
					<Field.Label for="save-name">Specification name</Field.Label>
					<Input id="save-name" bind:value={saveName} placeholder="Raid setup" />
				</Field.Field>
				<Field.Field>
					<Field.Label>Saved specification</Field.Label>
					<Select.Root type="single" bind:value={selectedSavedId}>
						{@render selectTrigger(
							savedSpecs.find((item) => item.id === selectedSavedId)?.name ?? 'Choose a saved spec'
						)}
						<Select.Content>
							<Select.Group>
								{#each savedSpecs as saved (saved.id)}
									<Select.Item value={saved.id} label={saved.name}>{saved.name}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</Field.Field>
				<Field.Field class="justify-end">
					<Field.Label class="sr-only">Save current specification</Field.Label>
					<Button onclick={saveCurrentSpec}>
						<SaveIcon data-icon="inline-start" aria-hidden="true" />
						Save
					</Button>
				</Field.Field>
				<Field.Field class="justify-end">
					<Field.Label class="sr-only">Load selected specification</Field.Label>
					<Button variant="outline" onclick={loadSavedSpec}>
						<FolderOpenIcon data-icon="inline-start" aria-hidden="true" />
						Load
					</Button>
				</Field.Field>
				<Field.Field class="justify-end">
					<Field.Label class="sr-only">Delete selected specification</Field.Label>
					<Button variant="destructive" onclick={deleteSavedSpec}>
						<Trash2Icon data-icon="inline-start" aria-hidden="true" />
						Delete
					</Button>
				</Field.Field>
			</Field.Group>
			<p class="mt-3 min-h-4 text-xs text-muted-foreground" aria-live="polite">{statusMessage}</p>
		</Card.Content>
	</Card.Root>

	<Card.Root class="mt-5">
		<Card.Header>
			<Card.Title><h2>Calculation setup</h2></Card.Title>
			<Card.Description>
				Job filtering exposes all live skills while damage settings are shared across comparisons.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<Field.Group class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<Field.Field>
					<Field.Label>Job filter</Field.Label>
					<Select.Root type="single" value={selections.jobId} onValueChange={setJob}>
						{@render selectTrigger(selectedJob.name)}
						<Select.Content>
							<Select.Group>
								<Select.Label>{JOBS.length} live jobs</Select.Label>
								{#each JOBS as job (job.id)}
									<Select.Item value={job.id} label={job.name}>{job.name}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</Field.Field>

				<Field.Field>
					<Field.Label>Direct-hit skill</Field.Label>
					<Select.Root type="single" bind:value={selections.directSkillId}>
						{@render selectTrigger(selectedDirect.name)}
						<Select.Content>
							<Select.Group>
								<Select.Label>{selectedJob.name} · {jobDirectSkills.length}</Select.Label>
								{#each jobDirectSkills as skill (skill.id)}
									<Select.Item value={skill.id} label={skill.name}>
										{skill.name}
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</Field.Field>

				<Field.Field>
					<Field.Label for="direct-level">Direct skill level</Field.Label>
					<Input
						id="direct-level"
						class={inputClass}
						type="text"
						inputmode="decimal"
						bind:value={selections.directSkillLevel}
					/>
					<Field.Description>{formatNumber(directCoefficient, 4)} coefficient</Field.Description>
				</Field.Field>

				<Field.Field>
					<Field.Label>Placement skill</Field.Label>
					<Select.Root type="single" bind:value={selections.placementSkillId}>
						{@render selectTrigger(selectedPlacement.name)}
						<Select.Content>
							<Select.Group>
								<Select.Label>{selectedJob.name} · {jobPlacementSkills.length}</Select.Label>
								{#each jobPlacementSkills as skill (skill.id)}
									<Select.Item value={skill.id} label={skill.name}>
										{skill.name}
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</Field.Field>

				<Field.Field>
					<Field.Label for="placement-level">Placement skill level</Field.Label>
					<Input
						id="placement-level"
						class={inputClass}
						type="text"
						inputmode="decimal"
						bind:value={selections.placementSkillLevel}
					/>
					<Field.Description>
						{formatNumber(placement.weaponCoefficient, 2)} weapon ·
						{formatNumber(placement.strengthMultiplier, 4)}× SM ·
						{formatNumber(placement.totalMultiplier, 4)}× total
					</Field.Description>
				</Field.Field>

				<Field.Field>
					<Field.Label>Reference dungeon</Field.Label>
					<Select.Root type="single" bind:value={selections.dungeonId}>
						{@render selectTrigger(selectedDungeon.name)}
						<Select.Content>
							<Select.Group>
								{#each DUNGEONS as dungeon (dungeon.id)}
									<Select.Item value={dungeon.id} label={dungeon.name}>{dungeon.name}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</Field.Field>

				<Field.Field>
					<Field.Label>Summon bonus</Field.Label>
					<Select.Root type="single" bind:value={selections.summonId}>
						{@render selectTrigger(
							SUMMONS.find((item) => item.id === selections.summonId)?.name ?? SUMMONS[0].name
						)}
						<Select.Content>
							<Select.Group>
								{#each SUMMONS as summon (summon.id)}
									<Select.Item value={summon.id} label={summon.name}>{summon.name}</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</Field.Field>

				<Field.Field>
					<Field.Title id="damage-mode-label">Damage roll</Field.Title>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						spacing={2}
						value={settings.damageMode}
						onValueChange={(value) => {
							if (value) settings.damageMode = value as 'average' | 'maximum';
						}}
						aria-labelledby="damage-mode-label"
					>
						<ToggleGroup.Item value="average">Average</ToggleGroup.Item>
						<ToggleGroup.Item value="maximum">Maximum</ToggleGroup.Item>
					</ToggleGroup.Root>
				</Field.Field>

				<Field.Field class="sm:col-span-2">
					<Field.Title id="reference-stat-label">Efficiency reference</Field.Title>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						spacing={2}
						value={settings.referenceStat}
						onValueChange={(value) => {
							if (value) settings.referenceStat = value as 'crit' | 'minimum' | 'maximum' | 'minmax';
						}}
						aria-labelledby="reference-stat-label"
						class="flex-wrap"
					>
						<ToggleGroup.Item value="crit">Critical</ToggleGroup.Item>
						<ToggleGroup.Item value="minimum">Minimum</ToggleGroup.Item>
						<ToggleGroup.Item value="maximum">Maximum</ToggleGroup.Item>
						<ToggleGroup.Item value="minmax">Min + max</ToggleGroup.Item>
					</ToggleGroup.Root>
				</Field.Field>

				<Field.Field>
					<Field.Label for="back-attack-rate">Back-attack uptime (%)</Field.Label>
					<Input
						id="back-attack-rate"
						type="range"
						min="0"
						max="100"
						step="1"
						bind:value={settings.backAttackRate}
					/>
					<Field.Description>
						{formatPercent(settings.backAttackRate)} · reference range 0–100%
					</Field.Description>
				</Field.Field>

				<Field.Field>
					<Field.Title id="custom-dungeon-label">Dungeon values</Field.Title>
					<ToggleGroup.Root
						type="single"
						variant="outline"
						spacing={2}
						value={settings.useCustomDungeonStats ? 'custom' : 'preset'}
						onValueChange={(value) => {
							if (!value) return;
							if (value === 'custom' && !settings.useCustomDungeonStats) fillCustomDungeonFromPreset();
							settings.useCustomDungeonStats = value === 'custom';
						}}
						aria-labelledby="custom-dungeon-label"
					>
						<ToggleGroup.Item value="preset">Preset</ToggleGroup.Item>
						<ToggleGroup.Item value="custom">Custom</ToggleGroup.Item>
					</ToggleGroup.Root>
				</Field.Field>
			</Field.Group>

			{#if settings.useCustomDungeonStats}
				<Separator class="my-5" />
				<Field.Set>
					<Field.Legend variant="label">Custom dungeon defenses</Field.Legend>
					<div class="flex flex-wrap items-center justify-between gap-3">
						<Field.Description>
							Custom values replace the selected preset for damage, enchant, build, and inverse calculations.
						</Field.Description>
						<Button variant="outline" size="sm" onclick={fillCustomDungeonFromPreset}>
							Use {selectedDungeon.name} values
						</Button>
					</div>
					<Field.Group class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						{#each customDungeonFields as [key, label] (key)}
							<Field.Field>
								<Field.Label for={key}>{label}</Field.Label>
								<Input
									id={key}
									class={inputClass}
									type="text"
									inputmode="decimal"
									bind:value={settings[key]}
								/>
							</Field.Field>
						{/each}
					</Field.Group>
				</Field.Set>
			{/if}
		</Card.Content>
		<Card.Footer class="flex flex-wrap gap-2">
			<Badge variant="outline">Normal DEF {formatNumber(resolvedDungeon.normalDefense)}</Badge>
			<Badge variant="outline">Boss DEF {formatNumber(resolvedDungeon.bossDefense)}</Badge>
			<Badge variant="outline">Normal DR {formatNumber(resolvedDungeon.normalDmgReduction)}</Badge>
			<Badge variant="outline">Boss DR {formatNumber(resolvedDungeon.bossDmgReduction)}</Badge>
		</Card.Footer>
	</Card.Root>

	<nav class="mt-6 overflow-x-auto pb-1 print:hidden" aria-label="Analyzer sections">
		<ToggleGroup.Root
			type="single"
			variant="outline"
			spacing={2}
			value={activeTab}
			onValueChange={setTab}
			class="min-w-max"
		>
			{#each tabs as tab (tab.id)}
				<ToggleGroup.Item value={tab.id} aria-label={tab.label}>
					<tab.icon data-icon="inline-start" aria-hidden="true" />
					{tab.label}
				</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
	</nav>

	<section class="mt-5 min-w-0" aria-live="polite">
		{#if activeTab === 'base'}
			<div class="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
				<div class="flex min-w-0 flex-col gap-5">
					<Card.Root>
						<Card.Header>
							<Card.Title><h2>Displayed stat inputs</h2></Card.Title>
							<Card.Description>
								Flat and final-percent values from the in-game ability detail. Arithmetic expressions are supported.
							</Card.Description>
							<Card.Action class="flex gap-2 print:hidden">
								<Button variant="outline" size="sm" onclick={clearInputs}>Clear</Button>
								<Button size="sm" onclick={loadDefaults}>
									<SparklesIcon data-icon="inline-start" aria-hidden="true" />
									Test data
								</Button>
							</Card.Action>
						</Card.Header>
						<Card.Content>
							<div class="overflow-x-auto">
							<Field.Group class="grid min-w-[32rem] grid-cols-[minmax(9rem,1fr)_minmax(6rem,0.7fr)_minmax(6rem,0.6fr)] items-end gap-2">
								<Field.Title>Stat</Field.Title>
								<Field.Title>Flat value</Field.Title>
								<Field.Title>Final %</Field.Title>
								{#each pairedInputs as field (field.flat)}
									<Field.Title>{field.label}</Field.Title>
									<Field.Field>
										<Field.Label for={field.flat} class="sr-only">{field.label} flat value</Field.Label>
										<Input
											id={field.flat}
											class={inputClass}
											type="text"
											inputmode="decimal"
											bind:value={inputs[field.flat]}
										/>
									</Field.Field>
									<Field.Field>
										<Field.Label for={field.percent} class="sr-only">{field.label} final percent</Field.Label>
										<Input
											id={field.percent}
											class={inputClass}
											type="text"
											inputmode="decimal"
											bind:value={inputs[field.percent]}
										/>
									</Field.Field>
								{/each}
							</Field.Group>
							</div>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Card.Title><h2>Advanced specification</h2></Card.Title>
							<Card.Description>Domination caps at 100%; penetration caps at 99%.</Card.Description>
						</Card.Header>
						<Card.Content>
							<Field.Group class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{#each advancedInputs as field (field.key)}
									<Field.Field>
										<Field.Label for={field.key}>{field.label} {field.suffix ? '(' + field.suffix + ')' : ''}</Field.Label>
										<Input
											id={field.key}
											class={inputClass}
											type="text"
											inputmode="decimal"
											bind:value={inputs[field.key]}
										/>
									</Field.Field>
								{/each}
								<Field.Field>
									<Field.Title id="job-type-label">Job damage type</Field.Title>
									<ToggleGroup.Root
										type="single"
										variant="outline"
										spacing={2}
										value={inputs.physicalJob ? 'physical' : 'magical'}
										onValueChange={(value) => {
											if (value) inputs.physicalJob = value === 'physical';
										}}
										aria-labelledby="job-type-label"
									>
										<ToggleGroup.Item value="physical">Physical</ToggleGroup.Item>
										<ToggleGroup.Item value="magical">Magical</ToggleGroup.Item>
									</ToggleGroup.Root>
								</Field.Field>
							</Field.Group>
						</Card.Content>
					</Card.Root>
				</div>

				<div class="flex min-w-0 flex-col gap-5">
					<Card.Root>
						<Card.Header>
							<Card.Title><h2>Aggregated specification</h2></Card.Title>
							<Card.Description>Summon and physical-job bonuses are included.</Card.Description>
						</Card.Header>
						<Card.Content>
							<div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
								{#each aggregateRows as [key, label] (key)}
									<div class="rounded-lg border bg-muted/30 px-3 py-2.5">
										<p class="text-xs text-muted-foreground">{label}</p>
										<p class="mt-1 font-semibold tabular-nums">{formatNumber(stats[key].total)}</p>
										<p class="mt-0.5 text-xs text-muted-foreground">
											Flat {formatNumber(stats[key].flat)} · final {formatNumber(stats[key].percent, 2)}%
											· 1% value {formatNumber(stats[key].per1Pct, 2)}
										</p>
									</div>
								{/each}
							</div>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Card.Title><h2>Conversion criterion</h2></Card.Title>
							<Card.Description>Switch between normal and boss domination in conversion math.</Card.Description>
						</Card.Header>
						<Card.Content>
							<Field.Group>
								<Field.Field>
									<Field.Title id="criterion-label">Damage target</Field.Title>
									<ToggleGroup.Root
										type="single"
										variant="outline"
										spacing={2}
										value={conversionCriterion}
										onValueChange={(value) => {
											if (value) conversionCriterion = value as 'normal' | 'boss';
										}}
										aria-labelledby="criterion-label"
									>
										<ToggleGroup.Item value="normal">Normal</ToggleGroup.Item>
										<ToggleGroup.Item value="boss">Boss</ToggleGroup.Item>
									</ToggleGroup.Root>
								</Field.Field>
							</Field.Group>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Card.Title><h2>Final 1% values</h2></Card.Title>
							<Card.Description>Flat stat equivalent of one final percentage point.</Card.Description>
						</Card.Header>
						<Card.Content>
							<div class="grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
								<div class="rounded-lg bg-muted/50 px-3 py-2">
									<p class="text-xs text-muted-foreground">Critical</p>
									<p class="font-semibold tabular-nums">{formatNumber(conversion.finalCriticalPer1, 2)}</p>
								</div>
								<div class="rounded-lg bg-muted/50 px-3 py-2">
									<p class="text-xs text-muted-foreground">Maximum</p>
									<p class="font-semibold tabular-nums">{formatNumber(conversion.finalMaximumPer1, 2)}</p>
								</div>
								<div class="rounded-lg bg-muted/50 px-3 py-2">
									<p class="text-xs text-muted-foreground">Minimum</p>
									<p class="font-semibold tabular-nums">{formatNumber(conversion.finalMinimumPer1, 2)}</p>
								</div>
							</div>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Card.Title><h2>Full conversion table</h2></Card.Title>
							<Card.Description>Forward values are percentage-point equivalents.</Card.Description>
						</Card.Header>
						<Card.Content>
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Conversion</Table.Head>
										<Table.Head class="text-right">Value</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each conversionRows as [key, label] (key)}
										<Table.Row>
											<Table.Cell>{label}</Table.Cell>
											<Table.Cell class="text-right font-medium tabular-nums">
												{formatNumber(conversion[key], 2)}%
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Card.Title><h2>Multiplier and base shares</h2></Card.Title>
							<Card.Description>Relative composition for the selected normal/boss criterion.</Card.Description>
						</Card.Header>
						<Card.Content>
							<div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
								<div class="flex flex-col gap-3">
									<p class="text-sm font-medium">Multiplier share</p>
									{#each damageShareRows as [key, label] (key)}
										<div class="flex items-center justify-between gap-4 text-sm">
											<span class="text-muted-foreground">{label}</span>
											<span class="font-medium tabular-nums">{formatPercent(conversion.damageShares[key] * 100)}</span>
										</div>
									{/each}
								</div>
								<div class="flex flex-col gap-3">
									<p class="text-sm font-medium">Base share</p>
									{#each baseShareRows as [key, label] (key)}
										<div class="flex items-center justify-between gap-4 text-sm">
											<span class="text-muted-foreground">{label}</span>
											<span class="font-medium tabular-nums">{formatPercent(conversion.baseShares[key] * 100)}</span>
										</div>
									{/each}
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			</div>
		{:else if activeTab === 'damage'}
			<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{@render metricCard(
					'Normal direct defense bypass',
					formatPercent(efficiency.bypass.normal.direct),
					'Actual normal raw base ÷ theory'
				)}
				{@render metricCard(
					'Boss direct defense bypass',
					formatPercent(efficiency.bypass.boss.direct),
					'Actual boss raw base ÷ boss theory'
				)}
				{@render metricCard(
					'Normal placement reduction bypass',
					formatPercent(efficiency.bypass.normal.placement),
					'Actual normal placement ÷ theory'
				)}
				{@render metricCard(
					'Boss placement reduction bypass',
					formatPercent(efficiency.bypass.boss.placement),
					'Actual boss placement ÷ boss theory'
				)}
			</div>

			<div class="mt-5 grid gap-5 xl:grid-cols-2">
				<div class="flex min-w-0 flex-col gap-4">
					<div>
						<h2 class="text-lg font-semibold">Direct-hit efficiency</h2>
						<p class="text-sm text-muted-foreground">
							Equivalent values use {settings.referenceStat} as the one-point reference.
						</p>
					</div>
					<div class="grid gap-4 md:grid-cols-2">
						{@render efficiencyCard('Theory · normal', 'No defense or reduction', efficiency.direct.theory)}
						{@render efficiencyCard('Theory · boss', 'Boss stats without defense', efficiency.direct.bossTheory)}
						{@render efficiencyCard('Dungeon · normal', resolvedDungeon.name, efficiency.direct.normal)}
						{@render efficiencyCard('Dungeon · boss', resolvedDungeon.name, efficiency.direct.boss)}
					</div>
				</div>
				<div class="flex min-w-0 flex-col gap-4">
					<div>
						<h2 class="text-lg font-semibold">Placement efficiency</h2>
						<p class="text-sm text-muted-foreground">
							Uses {formatNumber(placement.totalMultiplier, 4)}× total multiplier at the selected level.
						</p>
					</div>
					<div class="grid gap-4 md:grid-cols-2">
						{@render efficiencyCard('Theory · normal', 'No damage reduction', efficiency.placement.theory)}
						{@render efficiencyCard('Theory · boss', 'Boss stats without reduction', efficiency.placement.bossTheory)}
						{@render efficiencyCard('Dungeon · normal', resolvedDungeon.name, efficiency.placement.normal)}
						{@render efficiencyCard('Dungeon · boss', resolvedDungeon.name, efficiency.placement.boss)}
					</div>
				</div>
			</div>
		{:else if activeTab === 'enchant'}
			<div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(24rem,0.9fr)]">
				<div class="flex min-w-0 flex-col gap-5">
					<Card.Root>
						<Card.Header>
							<Card.Title><h2>Replacement enchant options</h2></Card.Title>
							<Card.Description>
								The base specification already includes the old item. Calculations apply new minus old.
								The shipped analyzer records back-attack and skill-level options without applying them;
								HP and stamina options affect only the HP result.
							</Card.Description>
							<Card.Action class="print:hidden">
								<Button variant="outline" size="sm" onclick={clearEnchants}>
									<RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
									Clear
								</Button>
							</Card.Action>
						</Card.Header>
						<Card.Content>
							<div class="overflow-x-auto">
							<Field.Group class="grid min-w-[34rem] grid-cols-[minmax(10rem,1fr)_minmax(6rem,0.7fr)_minmax(6rem,0.7fr)] items-end gap-2">
								<Field.Title>Option</Field.Title>
								<Field.Title>Old item</Field.Title>
								<Field.Title>New item</Field.Title>
								{#each enchantInputs as field (field.key)}
									<Field.Title>
										{field.label}
										{#if field.suffix}<span class="text-muted-foreground">({field.suffix})</span>{/if}
									</Field.Title>
									<Field.Field>
										<Field.Label for={'old-' + field.key} class="sr-only">Old {field.label}</Field.Label>
										<Input
											id={'old-' + field.key}
											class={inputClass}
											type="text"
											inputmode="decimal"
											bind:value={oldEnchant[field.key]}
										/>
									</Field.Field>
									<Field.Field>
										<Field.Label for={'new-' + field.key} class="sr-only">New {field.label}</Field.Label>
										<Input
											id={'new-' + field.key}
											class={inputClass}
											type="text"
											inputmode="decimal"
											bind:value={newEnchant[field.key]}
										/>
									</Field.Field>
								{/each}
							</Field.Group>
							</div>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Card.Title><h2>HP calibration</h2></Card.Title>
							<Card.Description>
								Record stamina and HP before and after removing exactly 10 all-stat to infer the HP formula.
							</Card.Description>
						</Card.Header>
						<Card.Content>
							<Field.Group class="grid gap-4 sm:grid-cols-2">
								{#each hpFields as field (field.key)}
									<Field.Field>
										<Field.Label for={'hp-' + field.key}>{field.label}</Field.Label>
										<Input
											id={'hp-' + field.key}
											class={inputClass}
											type="text"
											inputmode="decimal"
											bind:value={hpCalibration[field.key]}
										/>
									</Field.Field>
								{/each}
							</Field.Group>
						</Card.Content>
						<Card.Footer>
							{#if enchantComparison.hp}
								<div class="flex flex-wrap items-center gap-2">
									<Badge variant="secondary">
										Expected HP {formatNumber(enchantComparison.hp.expected)}
									</Badge>
									{@render changeBadge(enchantComparison.hp.changeRate)}
								</div>
							{:else}
								<p class="text-xs text-muted-foreground">Enter calibration values to calculate replacement HP.</p>
							{/if}
						</Card.Footer>
					</Card.Root>
				</div>

				<div class="flex min-w-0 flex-col gap-5">
					<Card.Root>
						<Card.Header>
							<Card.Title><h2>Eight damage comparisons</h2></Card.Title>
							<Card.Description>Absolute before/after damage and relative change.</Card.Description>
						</Card.Header>
						<Card.Content>
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Scenario</Table.Head>
										<Table.Head>Type</Table.Head>
										<Table.Head class="text-right">Before</Table.Head>
										<Table.Head class="text-right">After</Table.Head>
										<Table.Head class="text-right">Change</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each scenarioRows as row (row.key + row.kind)}
										{@const result = enchantComparison.scenarios[row.key]?.[row.kind]}
										<Table.Row>
											<Table.Cell>{row.label}</Table.Cell>
											<Table.Cell class="text-muted-foreground">{row.kindLabel}</Table.Cell>
											<Table.Cell class="text-right tabular-nums">{formatDamage(result?.old)}</Table.Cell>
											<Table.Cell class="text-right tabular-nums">{formatDamage(result?.new)}</Table.Cell>
											<Table.Cell class="text-right">{@render changeBadge(result?.percentChange)}</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Card.Title><h2>Full back-attack projections</h2></Card.Title>
							<Card.Description>
								The same eight scenarios at 100% back-attack uptime. Replacement back-attack options are
								recorded but intentionally not applied, matching the shipped analyzer.
							</Card.Description>
						</Card.Header>
						<Card.Content>
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Scenario</Table.Head>
										<Table.Head>Type</Table.Head>
										<Table.Head class="text-right">Before</Table.Head>
										<Table.Head class="text-right">After</Table.Head>
										<Table.Head class="text-right">Change</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each scenarioRows as row (row.key + row.kind + '-back-attack')}
										{@const result = backAttackEnchantComparison.scenarios[row.key]?.[row.kind]}
										<Table.Row>
											<Table.Cell>{row.label}</Table.Cell>
											<Table.Cell class="text-muted-foreground">{row.kindLabel}</Table.Cell>
											<Table.Cell class="text-right tabular-nums">{formatDamage(result?.old)}</Table.Cell>
											<Table.Cell class="text-right tabular-nums">{formatDamage(result?.new)}</Table.Cell>
											<Table.Cell class="text-right">{@render changeBadge(result?.percentChange)}</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Card.Title><h2>Stat change comparison</h2></Card.Title>
							<Card.Description>Aggregated values before and after replacing the old item.</Card.Description>
						</Card.Header>
						<Card.Content>
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Stat</Table.Head>
										<Table.Head class="text-right">Before</Table.Head>
										<Table.Head class="text-right">After</Table.Head>
										<Table.Head class="text-right">Difference</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each enchantStatRows as [key, label] (key)}
										{@const before = enchantStatValue(enchantComparison.oldStats, key)}
										{@const after = enchantStatValue(enchantComparison.newStats, key)}
										<Table.Row>
											<Table.Cell>{label}</Table.Cell>
											<Table.Cell class="text-right tabular-nums">{formatNumber(before, 2)}</Table.Cell>
											<Table.Cell class="text-right tabular-nums">{formatNumber(after, 2)}</Table.Cell>
											<Table.Cell class="text-right tabular-nums">{formatNumber(after - before, 2)}</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Card.Title><h2>Conversion comparison</h2></Card.Title>
							<Card.Description>Boss-criterion conversion before and after replacement.</Card.Description>
						</Card.Header>
						<Card.Content>
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Conversion</Table.Head>
										<Table.Head class="text-right">Before</Table.Head>
										<Table.Head class="text-right">After</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each fullConversionComparisonRows(enchantComparison.oldStats, enchantComparison.conversion.old) as [label, before], index (label)}
										<Table.Row>
											<Table.Cell>{label}</Table.Cell>
											<Table.Cell class="text-right tabular-nums">
												{formatNumber(before, 2)}
											</Table.Cell>
											<Table.Cell class="text-right tabular-nums">
												{formatNumber(
													fullConversionComparisonRows(
														enchantComparison.newStats,
														enchantComparison.conversion.new
													)[index][1],
													2
												)}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Card.Title><h2>Efficiency comparison</h2></Card.Title>
							<Card.Description>Direct-hit theory equivalents before and after replacement.</Card.Description>
						</Card.Header>
						<Card.Content>
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Equivalent</Table.Head>
										<Table.Head class="text-right">Before value</Table.Head>
										<Table.Head class="text-right">Before reverse</Table.Head>
										<Table.Head class="text-right">After value</Table.Head>
										<Table.Head class="text-right">After reverse</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each enchantComparison.efficiency.old.direct.theory.equivalents as item (item.key)}
										{@const after = enchantComparison.efficiency.new.direct.theory.equivalents.find(
											(candidate) => candidate.key === item.key
										)}
										<Table.Row>
											<Table.Cell>{item.label}</Table.Cell>
											<Table.Cell class="text-right tabular-nums">{formatNumber(item.value, 2)}</Table.Cell>
											<Table.Cell class="text-right tabular-nums">{formatNumber(item.reverse, 2)}</Table.Cell>
											<Table.Cell class="text-right tabular-nums">{formatNumber(after?.value, 2)}</Table.Cell>
											<Table.Cell class="text-right tabular-nums">{formatNumber(after?.reverse, 2)}</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</Card.Content>
						<Card.Footer class="flex flex-wrap gap-2">
							<Badge variant="outline">
								Normal direct bypass {formatPercent(enchantComparison.bypass.normal.direct.old)}
								→ {formatPercent(enchantComparison.bypass.normal.direct.new)}
								({formatNumber(enchantComparison.bypass.normal.direct.change, 2)} pp)
							</Badge>
							<Badge variant="outline">
								Boss direct bypass {formatPercent(enchantComparison.bypass.boss.direct.old)}
								→ {formatPercent(enchantComparison.bypass.boss.direct.new)}
								({formatNumber(enchantComparison.bypass.boss.direct.change, 2)} pp)
							</Badge>
						</Card.Footer>
					</Card.Root>
				</div>
			</div>
		{:else if activeTab === 'build'}
			<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{@render metricCard('Combined stat budget', formatNumber(build.budget, 2), 'Strength ÷ 100 + weapon')}
				{@render metricCard('Current strength share', formatPercent(build.currentRatio), 'Allocation inside the fixed budget')}
				{@render metricCard(
					'Nearest profile',
					build.profiles.find((item) => item.id === build.nearestProfileId)?.name ?? '—',
					'Closest reference allocation'
				)}
				{@render metricCard('Boss party scale', formatPercent(build.partyScale * 100), resolvedDungeon.name)}
			</div>

			<Card.Root class="mt-5">
				<Card.Header>
					<Card.Title><h2>Current build position</h2></Card.Title>
					<Card.Description>
						Strength share {formatNumber(Math.round(build.currentRatio * 10) / 10, 1)}%
						(≈ {nearestBuildProfile?.name ?? '—'})
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="overflow-x-auto pb-1">
						<div class="min-w-[44rem] px-8 pt-1" aria-label="Strength versus weapon allocation position">
							<div class="relative h-6 rounded-full border bg-muted/60">
								{#each build.profiles as profile (profile.id)}
									<div
										class={cn(
											'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
											profile.id === build.nearestProfileId
												? 'size-3 bg-primary'
												: 'size-2 bg-muted-foreground/60'
										)}
										style:left={`${buildPositionPercent(profile.strengthRatio)}%`}
										title={`${profile.name}: ${formatPercent(profile.strengthRatio)}`}
									></div>
								{/each}
								<div
									class="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-slate-900 shadow-sm dark:bg-slate-100"
									style:left={`${buildPositionPercent(build.currentRatio)}%`}
									title={`Current: ${formatPercent(build.currentRatio)}`}
								></div>
							</div>
							<div class="relative mt-3 h-7 text-xs text-muted-foreground">
								{#each build.profiles as profile (profile.id)}
									<span
										class={cn(
											'absolute -translate-x-1/2 whitespace-nowrap',
											profile.id === build.nearestProfileId && 'font-semibold text-primary'
										)}
										style:left={`${buildPositionPercent(profile.strengthRatio)}%`}
									>
										{profile.name}
									</span>
								{/each}
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mt-5">
				<Card.Header>
					<Card.Title><h2>Current practical outputs</h2></Card.Title>
					<Card.Description>Normal theory and scaled dungeon boss outputs used by the original analyzer.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						{#each practicalRows as [key, label] (key)}
							<div class="rounded-lg border bg-muted/30 px-4 py-3">
								<p class="text-xs text-muted-foreground">{label}</p>
								<p class="mt-1 text-xl font-semibold tabular-nums">
									{formatPractical(build.current.practicalEok[key])}
								</p>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="mt-5">
				<Card.Header>
					<Card.Title><h2>Strength versus weapon allocation</h2></Card.Title>
					<Card.Description>
						Every profile preserves Strength ÷ 100 + Weapon while holding other stats constant.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Profile</Table.Head>
								<Table.Head class="text-right">Strength share</Table.Head>
								<Table.Head class="text-right">Strength / magic</Table.Head>
								<Table.Head class="text-right">Weapon / attribute</Table.Head>
								<Table.Head class="text-right">Normal direct</Table.Head>
								<Table.Head class="text-right">Boss direct</Table.Head>
								<Table.Head class="text-right">Normal placement</Table.Head>
								<Table.Head class="text-right">Boss placement</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							<Table.Row data-state="selected">
								<Table.Cell class="font-medium">Current</Table.Cell>
								<Table.Cell class="text-right tabular-nums">{formatPercent(build.currentRatio)}</Table.Cell>
								<Table.Cell class="text-right tabular-nums">{formatNumber(build.current.strMag)}</Table.Cell>
								<Table.Cell class="text-right tabular-nums">{formatNumber(build.current.weaponAttr)}</Table.Cell>
								{#each practicalRows as [key] (key)}
									<Table.Cell class="text-right tabular-nums">{formatPractical(build.current.practicalEok[key])}</Table.Cell>
								{/each}
							</Table.Row>
							{#each build.profiles as profile (profile.id)}
								<Table.Row data-state={profile.id === build.nearestProfileId ? 'selected' : undefined}>
									<Table.Cell class="font-medium">
										{profile.name}
										{#if profile.id === build.nearestProfileId}
											<Badge variant="secondary">Nearest</Badge>
										{/if}
									</Table.Cell>
									<Table.Cell class="text-right tabular-nums">{formatPercent(profile.strengthRatio)}</Table.Cell>
									<Table.Cell class="text-right tabular-nums">{formatNumber(profile.strMag)}</Table.Cell>
									<Table.Cell class="text-right tabular-nums">{formatNumber(profile.weaponAttr)}</Table.Cell>
									{#each practicalRows as [key] (key)}
										<Table.Cell class="text-right tabular-nums">
											<div class="flex flex-col items-end gap-1">
												<span>{formatPractical(profile.practicalEok[key])}</span>
												{#if build.current.practicalEok[key] === 0}
													<Badge variant="outline">—</Badge>
												{:else}
													{@render changeBadge(profile.change[key])}
												{/if}
											</div>
										</Table.Cell>
									{/each}
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		{:else if activeTab === 'indicators'}
			<div class="grid gap-5 xl:grid-cols-[minmax(20rem,0.7fr)_minmax(0,1.3fr)]">
				<Card.Root>
					<Card.Header>
						<Card.Title><h2>Indicator inputs</h2></Card.Title>
						<Card.Description>
							Calibrate hit displays, summon reflection, placement cores, and measured boss damage.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<Field.Group>
							<Field.Field>
								<Field.Label for="indicator-coefficient">Hit indicator coefficient</Field.Label>
								<Input
									id="indicator-coefficient"
									class={inputClass}
									type="text"
									inputmode="decimal"
									bind:value={indicatorCoefficient}
								/>
								<Field.Description>Reference default: 17,000</Field.Description>
							</Field.Field>
							<Field.Field>
								<Field.Label for="reflection-percent">Summon reflection (%)</Field.Label>
								<Input
									id="reflection-percent"
									class={inputClass}
									type="text"
									inputmode="decimal"
									bind:value={reflectionPercent}
								/>
								<Field.Description>Reference default: 148%</Field.Description>
							</Field.Field>
							<Field.Field>
								<Field.Label for="measured-boss">Measured placement boss damage</Field.Label>
								<Input
									id="measured-boss"
									class={inputClass}
									type="text"
									inputmode="decimal"
									bind:value={measuredBossDamage}
								/>
								<Field.Description>Enter the observed hit to infer its total multiplier.</Field.Description>
							</Field.Field>
							<Field.Field>
								<Field.Label for="indicator-core-level">Placement core level</Field.Label>
								<Input
									id="indicator-core-level"
									class={inputClass}
									type="text"
									inputmode="decimal"
									bind:value={inputs.placementCoreLevel}
								/>
							</Field.Field>
						</Field.Group>
					</Card.Content>
				</Card.Root>

				<div class="flex min-w-0 flex-col gap-5">
					<div class="grid gap-4 sm:grid-cols-2">
						{@render metricCard(
							'Hit indicator',
							formatNumber(hitIndicator.value, 2),
							'Uses the lower-domination ' + hitIndicator.side + ' side'
						)}
						{@render metricCard(
							'Summon reflected indicator',
							formatNumber(summonReflection.value, 2),
							'Uses the lower-domination ' + summonReflection.side + ' side'
						)}
						{@render metricCard(
							'Expected placement boss',
							formatDamage(placementInference.expected),
							'Selected skill and dungeon'
						)}
						{@render metricCard(
							'Inferred total multiplier',
							formatNumber(placementInference.inferredTotalMultiplier, 6) + '×',
							'Observed damage ÷ pre-multiplier damage'
						)}
					</div>

					<Card.Root>
						<Card.Header>
							<Card.Title><h2>Placement core coefficients</h2></Card.Title>
							<Card.Description>Core level is converted to the reference skill level and tiered multiplier.</Card.Description>
						</Card.Header>
						<Card.Content>
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Coefficient</Table.Head>
										<Table.Head class="text-right">Value</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									<Table.Row>
										<Table.Cell>Reference skill level</Table.Cell>
										<Table.Cell class="text-right tabular-nums">{formatNumber(placementCore.skillLevel)}</Table.Cell>
									</Table.Row>
									<Table.Row>
										<Table.Cell>Weapon coefficient</Table.Cell>
										<Table.Cell class="text-right tabular-nums">{formatNumber(placementCore.weaponCoefficient, 6)}</Table.Cell>
									</Table.Row>
									<Table.Row>
										<Table.Cell>Strength / magic multiplier</Table.Cell>
										<Table.Cell class="text-right tabular-nums">{formatNumber(placementCore.strengthMultiplier, 6)}×</Table.Cell>
									</Table.Row>
									<Table.Row>
										<Table.Cell>Total multiplier</Table.Cell>
										<Table.Cell class="text-right tabular-nums">{formatNumber(placementCore.totalMultiplier, 6)}×</Table.Cell>
									</Table.Row>
								</Table.Body>
							</Table.Root>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Card.Title><h2>Measured placement inverse</h2></Card.Title>
							<Card.Description>Compare the selected skill’s configured multiplier with the inferred one.</Card.Description>
						</Card.Header>
						<Card.Content>
							<div class="grid gap-4 sm:grid-cols-3">
								<div class="rounded-lg bg-muted/50 px-3 py-3">
									<p class="text-xs text-muted-foreground">Pre-multiplier damage</p>
									<p class="mt-1 font-semibold tabular-nums">{formatDamage(placementInference.preMultiplier)}</p>
								</div>
								<div class="rounded-lg bg-muted/50 px-3 py-3">
									<p class="text-xs text-muted-foreground">Selected multiplier</p>
									<p class="mt-1 font-semibold tabular-nums">
										{formatNumber(placementInference.selectedTotalMultiplier, 6)}×
									</p>
								</div>
								<div class="rounded-lg bg-muted/50 px-3 py-3">
									<p class="text-xs text-muted-foreground">Inferred multiplier</p>
									<p class="mt-1 font-semibold tabular-nums">
										{formatNumber(placementInference.inferredTotalMultiplier, 6)}×
									</p>
								</div>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			</div>
		{:else}
			<div class="flex min-w-0 flex-col gap-5">
				<Card.Root>
					<Card.Header>
						<Card.Title><h2>Coefficient catalog job</h2></Card.Title>
						<Card.Description>
							This browser is independent from the calculation job, matching the original coefficient tab.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<Field.Group>
							<Field.Field class="max-w-sm">
								<Field.Label>Job</Field.Label>
								<Select.Root type="single" value={coefficientJobId} onValueChange={setCoefficientJob}>
									{@render selectTrigger(coefficientJob.name)}
									<Select.Content>
										<Select.Group>
											{#each JOBS as job (job.id)}
												<Select.Item value={job.id} label={job.name}>{job.name}</Select.Item>
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
							</Field.Field>
						</Field.Group>
					</Card.Content>
				</Card.Root>

				<div class="grid min-w-0 gap-5 xl:grid-cols-2">
				<Card.Root>
					<Card.Header>
						<Card.Title><h2>Direct-hit coefficients</h2></Card.Title>
						<Card.Description>
							{DIRECT_SKILLS.length} live rows. Showing {visibleDirectSkills.length} for {coefficientJob.name}.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<Field.Group>
							<Field.Field>
								<Field.Label for="direct-search">Filter direct-hit skills</Field.Label>
								<div class="flex items-center gap-2">
									<SearchIcon aria-hidden="true" />
									<Input
										id="direct-search"
										bind:value={directSearch}
										placeholder="Name, Korean name, or skill ID"
									/>
								</div>
							</Field.Field>
						</Field.Group>
						<div class="mt-4 max-h-[48rem] overflow-auto">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Skill</Table.Head>
										<Table.Head class="text-right">Base</Table.Head>
										<Table.Head class="text-right">Per level</Table.Head>
										<Table.Head class="text-right">Current</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each visibleDirectSkills as skill (skill.id)}
										<Table.Row data-state={skill.id === selectedDirect.id ? 'selected' : undefined}>
											<Table.Cell>
												<p class="font-medium">{skill.name}</p>
												<p class="text-xs text-muted-foreground">
													{skill.sourceName} · ID {skill.skillId ?? 'fallback'}
												</p>
											</Table.Cell>
											<Table.Cell class="text-right tabular-nums">{formatNumber(skill.baseCoefficient, 6)}</Table.Cell>
											<Table.Cell class="text-right tabular-nums">{formatNumber(skill.perLevel, 6)}</Table.Cell>
											<Table.Cell class="text-right tabular-nums">
												{formatNumber(
													parseNumericInput(skill.baseCoefficient) +
														parseNumericInput(skill.perLevel) *
															parseNumericInput(selections.directSkillLevel),
													6
												)}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title><h2>Placement coefficients</h2></Card.Title>
						<Card.Description>
							{PLACEMENT_SKILLS.length} live rows. Showing {visiblePlacementSkills.length} for {coefficientJob.name}.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<Field.Group>
							<Field.Field>
								<Field.Label for="placement-search">Filter placement skills</Field.Label>
								<div class="flex items-center gap-2">
									<SearchIcon aria-hidden="true" />
									<Input
										id="placement-search"
										bind:value={placementSearch}
										placeholder="Name, Korean name, or skill ID"
									/>
								</div>
							</Field.Field>
						</Field.Group>
						<div class="mt-4 max-h-[48rem] overflow-auto">
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Skill</Table.Head>
										<Table.Head class="text-right">Weapon</Table.Head>
										<Table.Head class="text-right">SM base / Lv</Table.Head>
										<Table.Head class="text-right">Total base / Lv</Table.Head>
										<Table.Head class="text-right">Current total</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each visiblePlacementSkills as skill (skill.id)}
										{@const current = placementCoefficients(skill, selections.placementSkillLevel)}
										<Table.Row data-state={skill.id === selectedPlacement.id ? 'selected' : undefined}>
											<Table.Cell>
												<p class="font-medium">{skill.name}</p>
												<p class="text-xs text-muted-foreground">
													{skill.sourceName} · ID {skill.skillId ?? 'fallback'}
												</p>
											</Table.Cell>
											<Table.Cell class="text-right tabular-nums">{formatNumber(skill.weaponCoefficient, 6)}</Table.Cell>
											<Table.Cell class="text-right tabular-nums">
												{formatNumber(skill.strengthBase, 6)} / {formatNumber(skill.strengthPerLevel, 6)}
											</Table.Cell>
											<Table.Cell class="text-right tabular-nums">
												{formatNumber(skill.totalBase, 6)} / {formatNumber(skill.totalPerLevel, 6)}
											</Table.Cell>
											<Table.Cell class="text-right tabular-nums">{formatNumber(current.totalMultiplier, 6)}</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</Card.Content>
				</Card.Root>
				</div>
			</div>
		{/if}
	</section>

	<footer class="mt-8 rounded-xl border bg-muted/30 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
		Live coefficients and presets were captured {SPEC_ANALYZER_DATA_META.capturedAt}. Calculations
		mirror the community Specification Analyzer and its v3.4.1 English/Korean workbooks; results are
		estimates and are not affiliated with Actoz Soft.
	</footer>
</main>
