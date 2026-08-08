<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import AlertTriangleIcon from '@lucide/svelte/icons/triangle-alert';
	import CircleDollarSignIcon from '@lucide/svelte/icons/circle-dollar-sign';
	import Clock3Icon from '@lucide/svelte/icons/clock-3';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import InfoIcon from '@lucide/svelte/icons/info';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import Settings2Icon from '@lucide/svelte/icons/settings-2';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import * as Alert from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Select from '$lib/components/ui/select';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Switch } from '$lib/components/ui/switch';
	import * as Table from '$lib/components/ui/table';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import { calculateDungeonEarnings } from '$lib/dungeon-earnings.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Difficulty = 'D4' | 'D5';
	type TimeInput = { minutes: string; seconds: string };
	type PriceEntry = PageData['snapshot']['prices'][number];
	type Buff = PageData['catalog']['buffs'][number];
	type BuffSection = {
		id: string;
		title: string;
		description: string;
		exclusive: boolean;
		buffs: Buff[];
	};
	type PersistedState = {
		version: 1;
		snapshotId: string;
		selectedDungeonId: string;
		difficulty: Difficulty;
		clearTimes: Record<string, TimeInput>;
		selectedBuffIds: string[];
		overrides: Record<string, string>;
	};

	const storageKey = 'latale-dungeon-earnings-v1';
	const legacyStandardBuffIds = new Set([
		'combat-elixir',
		'guild-bulgogi-hamburger',
		'sweet-mutant-special-potion',
		'alvis-support-potion',
		'hunter-hp-recovery-kit-30',
		'mysterious-critical-damage-amplifier'
	]);
	const removedLegacyBuffIds = new Set([
		'guild-banana',
		'guild-bulgogi-hamburger',
		'guild-salad',
		'guild-tomato-sandwich',
		'guild-ham-sandwich',
		'mysterious-critical-chance-amplifier',
		'mysterious-damage-amplifier'
	]);
	const legacyBuffIdMigrations: Record<string, string> = {
		'combat-elixir': 'flasks',
		'utility-elixir': 'flasks',
		'heroes-attack-nostrum': 'heroes-set',
		'heroes-attack-nostrum-i': 'heroes-set',
		'heroes-attack-nostrum-2': 'heroes-attack-nostrum-ii'
	};
	const exclusiveGroupCopy: Record<string, { title: string; description: string }> = {
		'heroes-attack': {
			title: 'Heroes attack nostrums',
			description: 'Choose the full Heroes Set or Attack Nostrum II by itself.'
		},
		syrup: {
			title: 'Syrups',
			description: 'Choose one syrup. Advanced Premium uses the cheaper of its market price or two Premium Syrups.'
		}
	};
	const emptyTime = (): TimeInput => ({ minutes: '', seconds: '' });
	const integerFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
	const decimalFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});

	let selectedDungeonId = $state('pleroma');
	let difficulty = $state<Difficulty>('D5');
	let clearTimes = $state<Record<string, TimeInput>>({});
	let selectedBuffIds = $state<string[]>([]);
	let overrides = $state<Record<string, string>>({});
	let assumptionsOpen = $state(false);
	let hydrated = $state(false);
	let defaultDungeonId = $derived(
		data.catalog.dungeons.some((dungeon) => dungeon.id === 'pleroma')
			? 'pleroma'
			: data.catalog.dungeons[0]?.id ?? ''
	);
	let standardBuffIds = $derived(
		data.catalog.buffs.filter((buff) => buff.standardPreset).map((buff) => buff.id)
	);

	let selectedDungeon = $derived(
		data.catalog.dungeons.find((dungeon) => dungeon.id === selectedDungeonId) ??
			data.catalog.dungeons[0]
	);
	let selectedProfile = $derived(selectedDungeon?.difficulties[difficulty]);
	let profileKey = $derived(`${selectedDungeonId}:${difficulty}`);
	let selectedTime = $derived(clearTimes[profileKey] ?? emptyTime());
	let clearTime = $derived.by(() => parseClearTime(selectedTime));
	let clearTimeTouched = $derived(
		selectedTime.minutes.trim().length > 0 || selectedTime.seconds.trim().length > 0
	);
	let timeError = $derived.by(() => getTimeError(selectedTime));
	let rewardItemsById = $derived(
		new Map(data.catalog.rewardItems.map((item) => [item.id, item]))
	);
	let recipesById = $derived(
		new Map(data.catalog.serviceRecipes.map((recipe) => [recipe.id, recipe]))
	);
	let buffsById = $derived(new Map(data.catalog.buffs.map((buff) => [buff.id, buff])));
	let editablePriceEntries = $derived(data.snapshot.prices.filter((price) => isPriceEditable(price)));
	let editablePriceIds = $derived(new Set(editablePriceEntries.map((price) => price.itemId)));
	let buffSections = $derived.by(buildBuffSections);
	let hasProvisionalServicePrice = $derived(
		selectedProfile?.serviceStrategyIds.some(
			(strategyId) => recipesById.get(strategyId)?.status === 'provisional'
		) ?? false
	);
	let hasProvisionalCustomerLockAssumptions = $derived(
		selectedProfile?.serviceStrategyIds.some(
			(strategyId) => (recipesById.get(strategyId)?.customerSuppliedSealLocks ?? 0) > 0
		) ?? false
	);
	let validOverrideValues = $derived.by(() => {
		const values: Record<string, number> = {};
		for (const [itemId, value] of Object.entries(overrides)) {
			if (!editablePriceIds.has(itemId)) continue;
			const parsed = Number(value);
			if (
				value.trim() !== '' &&
				Number.isFinite(parsed) &&
				parsed >= 0 &&
				parsed <= Number.MAX_SAFE_INTEGER
			) {
				values[itemId] = parsed;
			}
		}
		return values;
	});
	let invalidOverrideIds = $derived(
		Object.entries(overrides)
			.filter(([itemId, value]) => {
				if (!editablePriceIds.has(itemId)) return false;
				const parsed = Number(value);
				return (
					value.trim() !== '' &&
					!(Number.isFinite(parsed) && parsed >= 0 && parsed <= Number.MAX_SAFE_INTEGER)
				);
			})
			.map(([itemId]) => itemId)
	);
	let overrideCount = $derived(
		Object.keys(overrides).filter((itemId) => editablePriceIds.has(itemId)).length
	);
	let mechanicsIssues = $derived.by(() => {
		if (!selectedProfile) return ['The selected difficulty has no mechanics profile.'];
		const issues: string[] = [];
		for (const reward of selectedProfile.rewards) {
			const item = rewardItemsById.get(reward.itemId);
			const name = item?.name ?? reward.itemId;
			if (reward.yield.status === 'pending' || reward.yield.expectedPerClear === null) {
				issues.push(`${name}: expected yield is pending.`);
			}
			if (difficulty === 'D5' && reward.d5BonusEligible === null) {
				issues.push(`${name}: D5 material-bonus eligibility is pending.`);
			}
		}
		for (const strategyId of selectedProfile.serviceStrategyIds) {
			if (!recipesById.has(strategyId)) issues.push(`${strategyId}: service strategy is unavailable.`);
		}
		return issues;
	});
	let selectedPriceIds = $derived.by(() => {
		const ids = new SvelteSet<string>();
		if (selectedProfile) {
			for (const reward of selectedProfile.rewards) {
				const item = rewardItemsById.get(reward.itemId);
				if (item?.route === 'market') ids.add(item.marketPriceItemId ?? item.id);
			}
			for (const strategyId of selectedProfile.serviceStrategyIds) {
				const recipe = recipesById.get(strategyId);
				if (recipe) ids.add(recipe.customerPriceItemId);
			}
		}
		for (const buffId of selectedBuffIds) {
			const buff = buffsById.get(buffId);
			if (buff?.priceItemId) ids.add(buff.priceItemId);
			if (buff?.alternativePrice) ids.add(buff.alternativePrice.priceItemId);
		}
		return ids;
	});
	let missingPriceEntries = $derived(
		data.snapshot.prices.filter((price) => isSelectedMissingPrice(price))
	);
	let selectedUnpricedBuffs = $derived(
		selectedBuffIds
			.map((buffId) => buffsById.get(buffId))
			.filter((buff): buff is Buff => Boolean(buff))
			.filter((buff) => isBuffUnpriced(buff))
	);
	let calculationAttempt = $derived.by(() => {
		if (!selectedDungeon || !selectedProfile || clearTime === null || invalidOverrideIds.length > 0) {
			return { result: null, error: null };
		}
		try {
			return {
				result: calculateDungeonEarnings({
					catalog: data.catalog,
					snapshot: data.snapshot,
					dungeonId: selectedDungeon.id,
					difficulty,
					clearTimeSeconds: clearTime,
					selectedBuffIds,
					priceOverrides: validOverrideValues
				}),
				error: null
			};
		} catch {
			return {
				result: null,
				error: 'The selected setup could not be calculated from the maintained data.'
			};
		}
	});
	let calculation = $derived(calculationAttempt.result);
	let calculationError = $derived(calculationAttempt.error);

	function isPriceEditable(price: PriceEntry): boolean {
		if (price.kind !== 'buff') return true;
		return data.catalog.buffs.some(
			(buff) =>
				(buff.priceItemId === price.itemId || buff.alternativePrice?.priceItemId === price.itemId) &&
				buff.priceEditable
		);
	}

	function hasResolvedPrice(itemId: string): boolean {
		if (Object.hasOwn(validOverrideValues, itemId)) return true;
		return data.snapshot.prices.some(
			(price) => price.itemId === itemId && price.status === 'priced'
		);
	}

	function isBuffUnpriced(buff: Buff): boolean {
		if (buff.priceMode === 'fixed-zero') return false;
		const directAvailable = buff.priceItemId ? hasResolvedPrice(buff.priceItemId) : false;
		const alternativeAvailable = buff.alternativePrice
			? hasResolvedPrice(buff.alternativePrice.priceItemId)
			: false;
		return !directAvailable && !alternativeAvailable;
	}

	function isSelectedMissingPrice(price: PriceEntry): boolean {
		if (
			!selectedPriceIds.has(price.itemId) ||
			price.status !== 'pending' ||
			Object.hasOwn(validOverrideValues, price.itemId)
		) {
			return false;
		}
		if (price.kind !== 'buff') return true;
		return selectedBuffIds
			.map((buffId) => buffsById.get(buffId))
			.filter((buff): buff is Buff => Boolean(buff))
			.filter(
				(buff) =>
					buff.priceItemId === price.itemId || buff.alternativePrice?.priceItemId === price.itemId
			)
			.some((buff) => isBuffUnpriced(buff));
	}

	function buildBuffSections(): BuffSection[] {
		const stackable = data.catalog.buffs.filter((buff) => !buff.exclusivityGroup);
		const sections: BuffSection[] = [];
		if (stackable.length > 0) {
			sections.push({
				id: 'stackable',
				title: 'Stackable buffs',
				description: 'These buffs can be used together.',
				exclusive: false,
				buffs: stackable
			});
		}

		const grouped: Record<string, Buff[]> = {};
		for (const buff of data.catalog.buffs) {
			if (!buff.exclusivityGroup) continue;
			const group = grouped[buff.exclusivityGroup] ?? [];
			group.push(buff);
			grouped[buff.exclusivityGroup] = group;
		}
		for (const [groupId, buffs] of Object.entries(grouped)) {
			const copy = exclusiveGroupCopy[groupId];
			sections.push({
				id: groupId,
				title: copy?.title ?? groupId.replaceAll('-', ' '),
				description: copy?.description ?? 'Choose one option from this exclusive group.',
				exclusive: true,
				buffs
			});
		}
		return sections;
	}

	function buffPriceLabel(catalogBuff: Buff): string {
		if (catalogBuff.priceMode === 'fixed-zero') return 'No Ely cost';
		return catalogBuff.priceEditable ? 'Market price' : 'Fixed cost';
	}

	function isLegacyStandardPreset(values: unknown[]): boolean {
		const ids = new Set(values.filter((value): value is string => typeof value === 'string'));
		return (
			ids.size === legacyStandardBuffIds.size &&
			[...legacyStandardBuffIds].every((buffId) => ids.has(buffId))
		);
	}

	function parseNonnegativeInteger(value: string): number | null {
		if (value.trim() === '') return 0;
		const parsed = Number(value);
		return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
	}

	function parseClearTime(value: TimeInput): number | null {
		const minutes = parseNonnegativeInteger(value.minutes);
		const seconds = parseNonnegativeInteger(value.seconds);
		if (minutes === null || seconds === null || seconds > 59) return null;
		const total = minutes * 60 + seconds;
		return Number.isSafeInteger(total) && total > 0 ? total : null;
	}

	function getTimeError(value: TimeInput): string | null {
		if (value.minutes.trim() === '' && value.seconds.trim() === '') return null;
		const minutes = parseNonnegativeInteger(value.minutes);
		const seconds = parseNonnegativeInteger(value.seconds);
		if (minutes === null) return 'Minutes must be a safe whole number of zero or more.';
		if (seconds === null || seconds > 59) return 'Seconds must be a whole number from 0 to 59.';
		if (minutes === 0 && seconds === 0) return 'Clear time must be greater than zero.';
		if (!Number.isSafeInteger(minutes * 60 + seconds)) return 'Clear time is too large.';
		return null;
	}

	function updateTime(part: keyof TimeInput, event: Event) {
		const value = (event.currentTarget as HTMLInputElement).value;
		clearTimes[profileKey] = { ...selectedTime, [part]: value };
	}

	function setDifficulty(value: string) {
		if (value === 'D4' || value === 'D5') difficulty = value;
	}

	function setBuff(buff: Buff, checked: boolean) {
		let next = selectedBuffIds.filter((buffId) => buffId !== buff.id);
		if (checked) {
			if (buff.exclusivityGroup) {
				next = next.filter(
					(buffId) => buffsById.get(buffId)?.exclusivityGroup !== buff.exclusivityGroup
				);
			}
			next.push(buff.id);
		}
		selectedBuffIds = next;
	}

	function normalizeBuffIds(values: unknown[]): string[] {
		const normalized: string[] = [];
		const usedGroups: string[] = [];
		for (const value of values) {
			if (typeof value !== 'string' || normalized.includes(value)) continue;
			if (removedLegacyBuffIds.has(value)) continue;
			const migratedId = legacyBuffIdMigrations[value] ?? value;
			const resolvedId = buffsById.has(migratedId) ? migratedId : value;
			if (normalized.includes(resolvedId)) continue;
			const buff = buffsById.get(resolvedId);
			if (!buff) continue;
			if (buff.exclusivityGroup && usedGroups.includes(buff.exclusivityGroup)) continue;
			normalized.push(resolvedId);
			if (buff.exclusivityGroup) usedGroups.push(buff.exclusivityGroup);
		}
		return normalized;
	}

	function updateOverride(itemId: string, event: Event) {
		const value = (event.currentTarget as HTMLInputElement).value;
		if (value === '') {
			const next = { ...overrides };
			delete next[itemId];
			overrides = next;
			return;
		}
		overrides[itemId] = value;
	}

	function resetSetup() {
		selectedDungeonId = defaultDungeonId;
		difficulty = 'D5';
		clearTimes = {};
		selectedBuffIds = [...standardBuffIds];
	}

	function resetOverrides() {
		overrides = {};
	}

	function priceLabel(price: PriceEntry): string {
		if (price.kind === 'market') {
			const pricedRewards = data.catalog.rewardItems.filter(
				(item) => (item.marketPriceItemId ?? item.id) === price.itemId
			);
			if (pricedRewards.length === 1) return pricedRewards[0].name;
			if (price.itemId === 'wings-of-icarus-main-material') {
				return 'Wings of Icarus main materials';
			}
			if (price.itemId === 'rikimo-pelke-main-material') return 'Rikimo Pelke main materials';
			return price.itemId;
		}
		if (price.kind === 'service') {
			return (
				data.catalog.serviceRecipes.find(
					(recipe) => recipe.customerPriceItemId === price.itemId
				)?.name ?? price.itemId
			);
		}
		if (price.kind === 'cost') return price.itemId;
		return (
			data.catalog.buffs.find(
				(buff) =>
					buff.priceItemId === price.itemId || buff.alternativePrice?.priceItemId === price.itemId
			)?.name ?? price.itemId
		);
	}

	function priceKindLabel(kind: PriceEntry['kind']): string {
		if (kind === 'market') return 'Market sale';
		if (kind === 'service') return 'Service price';
		if (kind === 'cost') return 'Seller cost';
		return 'Buff activation';
	}

	function routeLabel(route: 'market' | 'service' | 'pending'): string {
		if (route === 'market') return 'Market';
		if (route === 'service') return 'Service';
		return 'Pending';
	}

	function priceSourceLabel(source: 'snapshot' | 'override' | 'fixed' | 'derived' | null): string {
		if (source === 'override') return 'Custom';
		if (source === 'snapshot') return 'Snapshot';
		if (source === 'fixed') return 'Fixed';
		if (source === 'derived') return 'Best available';
		return 'Pending';
	}

	function estimateStateLabel(state: 'complete' | 'lower-bound' | 'blocked'): string {
		if (state === 'complete') return 'Complete estimate';
		if (state === 'lower-bound') return 'Known lower bound';
		return 'Price required';
	}

	function formatEly(value: number | null | undefined): string {
		return value === null || value === undefined ? 'Pending' : `${integerFormatter.format(value)} Ely`;
	}

	function formatNumber(value: number | null | undefined): string {
		return value === null || value === undefined ? '—' : decimalFormatter.format(value);
	}

	function formatDate(value: string): string {
		const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
		if (!match) return value;
		return dateFormatter.format(
			new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
		);
	}

	function isRecord(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null && !Array.isArray(value);
	}

	function hydrateSavedState(value: unknown): boolean {
		if (!isRecord(value) || value.version !== 1) return false;
		if (
			typeof value.selectedDungeonId === 'string' &&
			data.catalog.dungeons.some((dungeon) => dungeon.id === value.selectedDungeonId)
		) {
			selectedDungeonId = value.selectedDungeonId;
		}
		if (value.difficulty === 'D4' || value.difficulty === 'D5') difficulty = value.difficulty;
		if (isRecord(value.clearTimes)) {
			const restoredTimes: Record<string, TimeInput> = {};
			for (const [key, time] of Object.entries(value.clearTimes)) {
				if (
					isRecord(time) &&
					typeof time.minutes === 'string' &&
					typeof time.seconds === 'string'
				) {
					restoredTimes[key] = { minutes: time.minutes, seconds: time.seconds };
				}
			}
			clearTimes = restoredTimes;
		}
		if (Array.isArray(value.selectedBuffIds)) {
			selectedBuffIds = isLegacyStandardPreset(value.selectedBuffIds)
				? [...standardBuffIds]
				: normalizeBuffIds(value.selectedBuffIds);
		}
		if (isRecord(value.overrides)) {
			const restoredOverrides: Record<string, string> = {};
			for (const [itemId, overrideValue] of Object.entries(value.overrides)) {
				if (editablePriceIds.has(itemId) && typeof overrideValue === 'string') {
					restoredOverrides[itemId] = overrideValue;
				}
			}
			overrides = restoredOverrides;
		}
		return true;
	}

	onMount(() => {
		let restored = false;
		try {
			const saved = localStorage.getItem(storageKey);
			if (saved) restored = hydrateSavedState(JSON.parse(saved));
		} catch {
			// Ignore malformed or unavailable browser storage and keep safe defaults.
		}
		if (!restored) selectedBuffIds = [...standardBuffIds];
		hydrated = true;
	});

	$effect(() => {
		if (!hydrated) return;
		const saved: PersistedState = {
			version: 1,
			snapshotId: data.snapshot.id,
			selectedDungeonId,
			difficulty,
			clearTimes: $state.snapshot(clearTimes),
			selectedBuffIds: [...selectedBuffIds],
			overrides: $state.snapshot(overrides)
		};
		try {
			localStorage.setItem(storageKey, JSON.stringify(saved));
		} catch {
			// Storage can be disabled; the estimator remains fully usable for this visit.
		}
	});
</script>

<svelte:head>
	<title>Dungeon Earnings Estimator · LaTale Tools</title>
	<meta
		name="description"
		content="Estimate direct-market and service-inclusive LaTale dungeon earnings per hour from expected rewards, clear time, and buff costs."
	/>
</svelte:head>

<main class="mx-auto w-full max-w-[76rem] px-4 py-8 sm:px-6 md:px-8 md:py-12">
	<header class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
		<div class="flex items-start gap-4">
			<div class="grid size-14 shrink-0 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
				<CircleDollarSignIcon class="size-7" aria-hidden="true" />
			</div>
			<div>
				<div class="flex flex-wrap gap-2">
					<Badge variant="secondary">Global</Badge>
					<Badge variant="outline">Expected averages</Badge>
				</div>
				<h1 class="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
					Dungeon Earnings Estimator
				</h1>
				<p class="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
					Turn one dungeon clear time into direct-market and potential service-inclusive Ely per
					hour. Missing assumptions stay visible instead of becoming guessed values.
				</p>
			</div>
		</div>
		<div
			class="flex flex-wrap gap-2 lg:max-w-md lg:justify-end"
			role="group"
			aria-label="Estimator rules"
		>
			<Badge variant="outline">D4 + D5</Badge>
			<Badge variant="outline">{formatNumber(data.catalog.market.feeRate * 100)}% market fee</Badge>
			<Badge variant="outline">Enchanting excluded</Badge>
		</div>
	</header>

	<div class="mt-8 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.55fr)]">
		<div class="flex min-w-0 flex-col gap-5">
			<Card.Root>
				<Card.Header>
					<Card.Title><h2>Run setup</h2></Card.Title>
					<Card.Description>
						Clear time is the full repeat cycle, including entry, loading, and reset time.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<Field.Group>
						<div class="grid gap-5 sm:grid-cols-2">
							<Field.Field>
								<Field.Label for="dungeon-select">Dungeon</Field.Label>
								<Select.Root type="single" bind:value={selectedDungeonId}>
									<Select.Trigger id="dungeon-select" class="w-full">
										{selectedDungeon?.name ?? 'Select a dungeon'}
									</Select.Trigger>
									<Select.Content>
										<Select.Group>
											<Select.Label>Supported dungeons</Select.Label>
											{#each data.catalog.dungeons as dungeon (dungeon.id)}
												<Select.Item value={dungeon.id} label={dungeon.name}>
													{dungeon.name} · {dungeon.requirement.label}
												</Select.Item>
											{/each}
										</Select.Group>
									</Select.Content>
								</Select.Root>
								<Field.Description>{selectedDungeon?.requirement.label}</Field.Description>
							</Field.Field>

							<Field.Field>
								<Field.Label id="difficulty-label">Difficulty</Field.Label>
								<ToggleGroup.Root
									type="single"
									variant="outline"
									spacing={2}
									value={difficulty}
									onValueChange={setDifficulty}
									aria-labelledby="difficulty-label"
								>
									<ToggleGroup.Item value="D4">Difficulty 4</ToggleGroup.Item>
									<ToggleGroup.Item value="D5">Difficulty 5</ToggleGroup.Item>
								</ToggleGroup.Root>
								<Field.Description>
									Times and rewards are kept separately for each difficulty.
								</Field.Description>
							</Field.Field>
						</div>

						<Field.Field data-invalid={clearTimeTouched && timeError !== null}>
							<Field.Label id="clear-time-label">Clear time</Field.Label>
							<div
								class="grid w-full grid-cols-2 gap-3 sm:max-w-sm"
								role="group"
								aria-labelledby="clear-time-label"
							>
								<Field.Field>
									<Field.Label class="sr-only" for="clear-minutes">Minutes</Field.Label>
									<InputGroup.Root>
										<InputGroup.Input
											id="clear-minutes"
											type="number"
											min="0"
											step="1"
											inputmode="numeric"
											placeholder="0"
											value={selectedTime.minutes}
											oninput={(event) => updateTime('minutes', event)}
											aria-invalid={clearTimeTouched && timeError !== null}
											class="tabular-nums"
										/>
										<InputGroup.Addon align="inline-end">
											<InputGroup.Text>min</InputGroup.Text>
										</InputGroup.Addon>
									</InputGroup.Root>
								</Field.Field>
								<Field.Field>
									<Field.Label class="sr-only" for="clear-seconds">Seconds</Field.Label>
									<InputGroup.Root>
										<InputGroup.Input
											id="clear-seconds"
											type="number"
											min="0"
											max="59"
											step="1"
											inputmode="numeric"
											placeholder="00"
											value={selectedTime.seconds}
											oninput={(event) => updateTime('seconds', event)}
											aria-invalid={clearTimeTouched && timeError !== null}
											class="tabular-nums"
										/>
										<InputGroup.Addon align="inline-end">
											<InputGroup.Text>sec</InputGroup.Text>
										</InputGroup.Addon>
									</InputGroup.Root>
								</Field.Field>
							</div>
							{#if clearTimeTouched && timeError}
								<Field.Error>{timeError}</Field.Error>
							{:else}
								<Field.Description>
									This value is remembered for {selectedDungeon?.name} {difficulty}.
								</Field.Description>
							{/if}
						</Field.Field>
					</Field.Group>
				</Card.Content>
				{#if selectedDungeon}
					<Card.Footer class="flex-wrap justify-between gap-3">
						<div class="flex min-w-0 items-center gap-3">
							<img
								src={selectedDungeon.image}
								alt=""
								class="size-12 shrink-0 rounded-lg object-cover"
							/>
							<div class="min-w-0">
								<p class="truncate font-medium">{selectedDungeon.name}</p>
								<p class="text-xs text-foreground/75">{difficulty} reward profile</p>
							</div>
						</div>
						<Button variant="ghost" size="sm" onclick={resetSetup}>
							<RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
							Reset setup
						</Button>
					</Card.Footer>
				{/if}
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title><h2>Universal buffs</h2></Card.Title>
					<Card.Description>
						Material yields assume capped item drop rate. Buff toggles affect cost only; keep any
						clear-time effects in your entered time.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<Field.Set>
						<Field.Legend variant="label">Combat buffs</Field.Legend>
						<Field.Description>
							The standard preset is selected on first visit. Exclusive choices are grouped below.
						</Field.Description>
						<div class="mt-4 flex flex-col gap-4">
							{#each buffSections as section (section.id)}
								<Field.Set class="rounded-xl border p-4">
									<Field.Legend variant="label">{section.title}</Field.Legend>
									<Field.Description>{section.description}</Field.Description>
									<Field.Group class="gap-3">
										{#each section.buffs as buff (buff.id)}
											<Field.Field orientation="responsive">
												{#if buff.icon}
													<img src={buff.icon} alt="" class="size-9 shrink-0 object-contain" />
												{/if}
												<Field.Content>
													<Field.Label for={`buff-${buff.id}`}>{buff.name}</Field.Label>
													<Field.Description>
														{buff.description} · {formatNumber(buff.durationSeconds / 60)} minute duration
													</Field.Description>
												</Field.Content>
												<div class="flex shrink-0 flex-wrap items-center gap-2">
													<Badge variant="outline">{buffPriceLabel(buff)}</Badge>
													{#if buff.id === 'advanced-premium-syrup'}
														<Badge variant="secondary">Lowest effective price</Badge>
													{/if}
													{#if buff.standardPreset}
														<Badge variant="outline">Preset</Badge>
													{/if}
													<Switch
														id={`buff-${buff.id}`}
														aria-label={`Use ${buff.name}`}
														checked={selectedBuffIds.includes(buff.id)}
														onCheckedChange={(checked) => setBuff(buff, checked)}
													/>
												</div>
											</Field.Field>
										{/each}
									</Field.Group>
								</Field.Set>
							{/each}
						</div>
					</Field.Set>
				</Card.Content>
				<Card.Footer class="flex-wrap justify-between gap-3">
					<p class="text-xs text-foreground/75">
						{selectedBuffIds.length} buff{selectedBuffIds.length === 1 ? '' : 's'} selected
					</p>
					<Sheet.Root bind:open={assumptionsOpen}>
						<Sheet.Trigger>
							{#snippet child({ props })}
								<Button variant="outline" size="sm" {...props}>
									<Settings2Icon data-icon="inline-start" aria-hidden="true" />
									Price assumptions
								{#if overrideCount > 0}
									<Badge variant="secondary">{overrideCount} custom</Badge>
									{/if}
								</Button>
							{/snippet}
						</Sheet.Trigger>
						<Sheet.Content class="data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
							<Sheet.Header>
								<Sheet.Title>Price assumptions</Sheet.Title>
								<Sheet.Description>
									Override player-market values and provisional economy assumptions from the {formatDate(data.snapshot.asOf)}
									Global snapshot. Fixed and zero-cost buffs are maintained in data and are not editable.
								</Sheet.Description>
							</Sheet.Header>
							<div class="min-h-0 flex-1 overflow-y-auto px-4">
								<Field.Group>
									{#each editablePriceEntries as price (price.itemId)}
										<Field.Field data-invalid={invalidOverrideIds.includes(price.itemId)}>
											<div class="flex flex-wrap items-start justify-between gap-2">
												<Field.Label for={`price-${price.itemId}`}>{priceLabel(price)}</Field.Label>
												<div class="flex flex-wrap gap-1">
													<Badge variant="outline">{priceKindLabel(price.kind)}</Badge>
													{#if Object.hasOwn(overrides, price.itemId)}
														<Badge variant="secondary">Custom</Badge>
													{:else if price.status === 'pending'}
														<Badge variant="outline">Pending</Badge>
													{/if}
												</div>
											</div>
											<Input
												id={`price-${price.itemId}`}
												type="number"
												min="0"
												step="1"
												inputmode="numeric"
												placeholder={price.status === 'priced' ? String(price.unitEly) : 'Enter Ely value'}
												value={overrides[price.itemId] ?? ''}
												oninput={(event) => updateOverride(price.itemId, event)}
												aria-invalid={invalidOverrideIds.includes(price.itemId)}
												class="tabular-nums"
											/>
											{#if invalidOverrideIds.includes(price.itemId)}
												<Field.Error>
													Enter an Ely amount from zero to {integerFormatter.format(Number.MAX_SAFE_INTEGER)}.
												</Field.Error>
											{:else}
												<Field.Description>
													Snapshot: {price.status === 'priced' ? formatEly(price.unitEly) : 'pending'}.
													{price.note}
												</Field.Description>
											{/if}
										</Field.Field>
									{/each}
								</Field.Group>
							</div>
							<Sheet.Footer>
								<Button variant="outline" onclick={resetOverrides} disabled={overrideCount === 0}>
									<RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
									Reset price overrides
								</Button>
							</Sheet.Footer>
						</Sheet.Content>
					</Sheet.Root>
				</Card.Footer>
			</Card.Root>

			{#if mechanicsIssues.length > 0}
				<Alert.Root>
					<InfoIcon aria-hidden="true" />
					<Alert.Title>Some mechanics are still pending</Alert.Title>
					<Alert.Description>
						<p>Unknown rewards are excluded from the known lower bound, never assumed to be zero.</p>
						<ul class="mt-2 flex list-disc flex-col gap-1 pl-5">
							{#each mechanicsIssues as issue (issue)}
								<li>{issue}</li>
							{/each}
						</ul>
					</Alert.Description>
				</Alert.Root>
			{/if}

			{#if missingPriceEntries.length > 0}
				<Alert.Root>
					<AlertTriangleIcon aria-hidden="true" />
					<Alert.Title>
						{selectedUnpricedBuffs.length > 0
							? 'A selected buff needs a price'
							: 'Some selected rewards need prices'}
					</Alert.Title>
					<Alert.Description>
						{#if selectedUnpricedBuffs.length > 0}
							Net Ely/hour is unavailable until every selected buff has a price override.
						{:else}
							Unpriced income is omitted, so the estimate is a known-value lower bound.
						{/if}
						<Button variant="outline" size="sm" class="mt-3" onclick={() => (assumptionsOpen = true)}>
							<Settings2Icon data-icon="inline-start" aria-hidden="true" />
							Review prices
						</Button>
					</Alert.Description>
				</Alert.Root>
			{/if}
		</div>

		<div class="min-w-0 xl:sticky xl:top-20">
			<Card.Root>
				<Card.Header>
					<div class="flex items-center gap-2 text-secondary-foreground">
						<SparklesIcon class="size-5" aria-hidden="true" />
						<p class="text-sm font-medium">Live estimate</p>
					</div>
					<Card.Title><h2>{selectedDungeon?.name ?? 'Dungeon'} {difficulty}</h2></Card.Title>
					<Card.Description>
						{clearTime === null ? 'Enter a clear time to calculate Ely per hour.' : `${formatNumber(3600 / clearTime)} expected clears per hour.`}
					</Card.Description>
					{#if hasProvisionalServicePrice || hasProvisionalCustomerLockAssumptions}
						<div class="flex flex-wrap gap-2">
							{#if hasProvisionalServicePrice}
								<Badge variant="outline">Service price provisional</Badge>
							{/if}
							{#if hasProvisionalCustomerLockAssumptions}
								<Badge variant="outline">Customer lock count provisional</Badge>
							{/if}
						</div>
					{/if}
				</Card.Header>
				<Card.Content>
					<div aria-live="polite">
						{#if !clearTimeTouched}
							<div class="flex min-h-44 flex-col items-center justify-center gap-3 text-center">
								<Clock3Icon class="size-8 text-muted-foreground" aria-hidden="true" />
								<p class="font-medium">Add your clear time</p>
								<p class="max-w-xs text-sm text-muted-foreground">
									Your dungeon, difficulty, buffs, and custom prices are saved automatically.
								</p>
							</div>
						{:else if timeError || invalidOverrideIds.length > 0 || calculationError || calculation === null}
							<Alert.Root>
								<AlertTriangleIcon aria-hidden="true" />
								<Alert.Title>{calculationError ? 'Calculation error' : 'Estimate unavailable'}</Alert.Title>
								<Alert.Description>
									{timeError ??
										(invalidOverrideIds.length > 0
											? 'Correct the invalid price override before calculating.'
											: calculationError ?? 'The estimate could not be calculated.')}
								</Alert.Description>
							</Alert.Root>
						{:else if calculation.estimateState === 'blocked'}
							<Alert.Root>
								<AlertTriangleIcon aria-hidden="true" />
								<Alert.Title>Buff price required</Alert.Title>
								<Alert.Description>
									Add a price override for every selected unpriced buff before net Ely/hour can be
									calculated.
								</Alert.Description>
							</Alert.Root>
							<dl class="mt-5 grid grid-cols-2 gap-4">
								<div>
									<dt class="text-xs text-muted-foreground">Clears / hour</dt>
									<dd class="mt-1 font-medium tabular-nums">{formatNumber(calculation.clearsPerHour)}</dd>
								</div>
								<div>
									<dt class="text-xs text-muted-foreground">Known rewards / hour</dt>
									<dd class="mt-1 font-medium tabular-nums">
										{formatEly(calculation.perHour.rewardProceedsBeforeBuffsEly)}
									</dd>
								</div>
							</dl>
						{:else}
							<div class="flex flex-wrap items-center gap-2">
								<Badge variant={calculation.estimateState === 'complete' ? 'secondary' : 'outline'}>
									{estimateStateLabel(calculation.estimateState)}
								</Badge>
								{#if calculation.overriddenPriceIds.length > 0}
									<Badge variant="outline">Custom prices</Badge>
								{/if}
							</div>
							<dl class="mt-5 grid gap-3 sm:grid-cols-2">
								<div class="rounded-lg border p-3">
									<dt class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
										Direct-market net / hour
									</dt>
									<dd class="mt-1 break-words text-xl font-semibold tracking-tight tabular-nums">
										{formatEly(calculation.perHour.directNetEly)}
									</dd>
									<dd class="mt-2 text-xs text-muted-foreground">Sell every marketable reward.</dd>
								</div>
								<div class="rounded-lg border p-3">
									<dt class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
										Potential service-first net / hour
									</dt>
									<dd class="mt-1 break-words text-xl font-semibold tracking-tight tabular-nums">
										{formatEly(calculation.perHour.potentialNetEly)}
									</dd>
									<dd class="mt-2 text-xs text-muted-foreground">
										Allocate service inputs once, then sell only the remainder.
									</dd>
								</div>
							</dl>
							{#if calculation.isLowerBound}
								<p class="mt-2 text-xs text-muted-foreground">
									Known-value lower bound; pending mechanics and income prices are excluded.
								</p>
							{/if}

							<dl class="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">
								<div>
									<dt class="text-xs text-muted-foreground">Service strategy net / hour</dt>
									<dd class="mt-1 font-medium tabular-nums">
										{formatEly(calculation.perHour.potentialServiceContributionEly)}
									</dd>
								</div>
								<div>
									<dt class="text-xs text-muted-foreground">Clears / hour</dt>
									<dd class="mt-1 font-medium tabular-nums">{formatNumber(calculation.clearsPerHour)}</dd>
								</div>
								<div>
									<dt class="text-xs text-muted-foreground">Service-first market remainder</dt>
									<dd class="mt-1 font-medium tabular-nums">
										{formatEly(calculation.perHour.serviceFirstMarketNetBeforeBuffsEly)}
									</dd>
								</div>
								<div>
									<dt class="text-xs text-muted-foreground">Buff cost / hour</dt>
									<dd class="mt-1 font-medium tabular-nums">{formatEly(calculation.perHour.buffCostEly)}</dd>
								</div>
								<div>
									<dt class="text-xs text-muted-foreground">Direct-market fee / hour</dt>
									<dd class="mt-1 font-medium tabular-nums">{formatEly(calculation.perHour.marketFeeEly)}</dd>
								</div>
								<div>
									<dt class="text-xs text-muted-foreground">Provider upgrade costs / hour</dt>
									<dd class="mt-1 font-medium tabular-nums">
										{formatEly(calculation.perHour.serviceProviderCostEly)}
									</dd>
								</div>
							</dl>
						{/if}
					</div>
				</Card.Content>
				<Card.Footer class="flex-wrap justify-between gap-2">
					<Badge variant="outline">Snapshot {formatDate(data.snapshot.asOf)}</Badge>
					<Badge variant="outline">{data.catalog.market.currency}</Badge>
				</Card.Footer>
			</Card.Root>
		</div>
	</div>

	<section class="mt-8" aria-labelledby="breakdown-heading">
		<Card.Root>
			<Card.Header>
				<Card.Title><h2 id="breakdown-heading">Earnings breakdown</h2></Card.Title>
				<Card.Description>
					Reward and buff rows will reconcile the known per-clear and hourly estimate.
				</Card.Description>
			</Card.Header>
			<Card.Content class="flex flex-col gap-8">
				{#if calculation && clearTime}
					<div class="min-w-0">
						<div class="flex flex-wrap items-end justify-between gap-2">
							<div>
								<h3 class="font-medium">Rewards</h3>
								<p class="mt-1 text-xs text-muted-foreground">
									Expected quantities stay fractional and already include applicable D5 bonus-bag rewards;
									no extra item-drop multiplier is applied.
								</p>
							</div>
							<Badge variant="outline">{calculation.rewardRows.length} rows</Badge>
						</div>
						<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
						<div
							class="mt-3 overflow-x-auto rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&>[data-slot=table-container]]:overflow-visible"
							role="region"
							aria-label="Scrollable reward earnings breakdown"
							tabindex="0"
						>
							<Table.Root class="min-w-[68rem]">
								<Table.Caption class="sr-only">
									Expected reward values for {selectedDungeon?.name} {difficulty}
								</Table.Caption>
								<Table.Header>
									<Table.Row>
										<Table.Head>Reward</Table.Head>
										<Table.Head>Route</Table.Head>
										<Table.Head class="text-end">Expected / clear</Table.Head>
										<Table.Head class="text-end">To services / clear</Table.Head>
										<Table.Head class="text-end">Remainder / clear</Table.Head>
										<Table.Head class="text-end">Unit price</Table.Head>
										<Table.Head class="text-end">Direct net / clear</Table.Head>
										<Table.Head class="text-end">Service-first net / hour</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each calculation.rewardRows as row (row.itemId)}
										<Table.Row>
											<Table.Cell>
												<div class="flex min-w-48 items-center gap-2">
													{#if row.icon}
														<img src={row.icon} alt="" class="size-8 shrink-0 object-contain" />
													{/if}
													<div>
														<p class="font-medium">{row.name}</p>
														<div class="mt-1 flex flex-wrap gap-1">
															{#if row.bonusRate > 0}
																<Badge variant="secondary">+{formatNumber(row.bonusRate * 100)}%</Badge>
															{/if}
															{#if row.missingMechanicIds.length > 0}
																<Badge variant="outline">Mechanics pending</Badge>
															{/if}
															{#if row.missingPriceIds.length > 0}
																<Badge variant="outline">Price pending</Badge>
															{/if}
														</div>
													</div>
												</div>
											</Table.Cell>
											<Table.Cell><Badge variant="outline">{routeLabel(row.route)}</Badge></Table.Cell>
											<Table.Cell class="text-end tabular-nums">
												{#if row.effectiveExpectedPerClear === null}
													Pending
												{:else if row.bonusRate > 0}
													<span title={`Base average ${formatNumber(row.baseExpectedPerClear)}`}>
														{formatNumber(row.effectiveExpectedPerClear)}
													</span>
												{:else}
													{formatNumber(row.effectiveExpectedPerClear)}
												{/if}
											</Table.Cell>
											<Table.Cell class="text-end tabular-nums">
												{formatNumber(row.allocatedToServicesPerClear)}
											</Table.Cell>
											<Table.Cell class="text-end tabular-nums">
												{formatNumber(row.remainingAfterServicesPerClear)}
											</Table.Cell>
											{#if row.route === 'market'}
												<Table.Cell class="text-end tabular-nums">
													{formatEly(row.unitPriceEly)}
													<p class="mt-1 text-xs text-muted-foreground">{priceSourceLabel(row.priceSource)}</p>
													{#if row.conversionCostPerUnitEly > 0}
														<p class="mt-1 text-xs text-muted-foreground">
															Conversion: {formatEly(row.conversionCostPerUnitEly)} / unit
														</p>
													{/if}
												</Table.Cell>
												<Table.Cell class="text-end tabular-nums">{formatEly(row.netPerClearEly)}</Table.Cell>
												<Table.Cell class="text-end font-medium tabular-nums">
													{formatEly(row.serviceFirstNetPerHourEly)}
												</Table.Cell>
											{:else}
												<Table.Cell class="text-end">—</Table.Cell>
												<Table.Cell class="text-end">—</Table.Cell>
												<Table.Cell class="text-end">—</Table.Cell>
											{/if}
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</div>
					</div>

					<div class="min-w-0">
						<div class="flex flex-wrap items-end justify-between gap-2">
							<div>
								<h3 class="font-medium">Potential service-first strategy</h3>
								<p class="mt-1 text-xs text-muted-foreground">
									Inputs are allocated in listed order; only leftovers remain in market income.
								</p>
							</div>
							<Badge variant="outline">{calculation.serviceStrategyRows.length} paths</Badge>
						</div>
						{#if calculation.serviceStrategyRows.length > 0}
							<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
							<div
								class="mt-3 overflow-x-auto rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&>[data-slot=table-container]]:overflow-visible"
								role="region"
								aria-label="Scrollable potential service strategy breakdown"
								tabindex="0"
							>
								<Table.Root class="min-w-[68rem]">
									<Table.Caption class="sr-only">Potential service-first upgrade paths</Table.Caption>
									<Table.Header>
										<Table.Row>
											<Table.Head>Service path</Table.Head>
											<Table.Head class="text-end">Services / clear</Table.Head>
											<Table.Head>Inputs consumed / clear</Table.Head>
											<Table.Head class="text-end">Customer pays</Table.Head>
											<Table.Head class="text-end">Provider cost</Table.Head>
											<Table.Head class="text-end">Potential net / hour</Table.Head>
										</Table.Row>
									</Table.Header>
								<Table.Body>
									{#each calculation.serviceStrategyRows as row (row.strategyId)}
										<Table.Row>
											<Table.Cell>
												<div class="min-w-52">
													<p class="font-medium">{row.name}</p>
													<div class="mt-1 flex flex-wrap gap-1">
														<Badge variant={row.status === 'confirmed' ? 'secondary' : 'outline'}>
															{row.status === 'confirmed' ? 'Confirmed' : 'Provisional'}
														</Badge>
														{#if row.customerSuppliedSealLocks > 0}
															<Badge variant="outline">
																Customer: {row.customerSuppliedSealLocks} locks (provisional)
															</Badge>
														{/if}
														{#if row.customerSuppliedEquipment}
															<Badge variant="outline">Customer equipment</Badge>
														{/if}
													</div>
												</div>
											</Table.Cell>
											<Table.Cell class="text-end tabular-nums">
												{formatNumber(row.servicesPerClear)}
											</Table.Cell>
											<Table.Cell>
												<ul class="flex min-w-64 flex-col gap-1 text-xs">
													{#each row.inputs as input (input.itemId)}
														<li>
															{input.name}: {formatNumber(input.consumedPerClear)} used,
															{formatNumber(input.remainingAfterPerClear)} left
														</li>
													{/each}
												</ul>
											</Table.Cell>
											<Table.Cell class="text-end tabular-nums">
												{formatEly(row.customerPricePerServiceEly)}
												<p class="mt-1 text-xs text-muted-foreground">per service</p>
											</Table.Cell>
											<Table.Cell class="text-end tabular-nums">
												{formatEly(row.providerElyCostPerServiceEly)}
												<p class="mt-1 text-xs text-muted-foreground">per service</p>
											</Table.Cell>
											<Table.Cell class="text-end font-medium tabular-nums">
												{formatEly(row.netPerHourEly)}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
								</Table.Root>
							</div>
						{:else}
							<p class="mt-3 text-sm text-muted-foreground">No maintained service path for this profile.</p>
						{/if}
					</div>

					<div class="min-w-0">
						<div class="flex flex-wrap items-end justify-between gap-2">
							<div>
								<h3 class="font-medium">Selected buff costs</h3>
								<p class="mt-1 text-xs text-muted-foreground">
									Costs are normalized to one hour without rounding activations up.
								</p>
							</div>
							<Badge variant="outline">{calculation.buffRows.length} selected</Badge>
						</div>
						{#if calculation.buffRows.length > 0}
							<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
							<div
								class="mt-3 overflow-x-auto rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&>[data-slot=table-container]]:overflow-visible"
								role="region"
								aria-label="Scrollable selected buff cost breakdown"
								tabindex="0"
							>
								<Table.Root class="min-w-[42rem]">
									<Table.Caption class="sr-only">Selected universal buff costs</Table.Caption>
									<Table.Header>
										<Table.Row>
											<Table.Head>Buff</Table.Head>
											<Table.Head class="text-end">Duration</Table.Head>
											<Table.Head class="text-end">Consumables / use</Table.Head>
											<Table.Head class="text-end">Unit cost</Table.Head>
											<Table.Head class="text-end">Cost / hour</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#each calculation.buffRows as row (row.buffId)}
											<Table.Row>
												<Table.Cell>
													<div class="flex min-w-52 items-center gap-2">
														{#if row.icon}
															<img src={row.icon} alt="" class="size-8 shrink-0 object-contain" />
														{/if}
														<div>
															<p class="font-medium">{row.name}</p>
															<Badge variant="outline" class="mt-1">{priceSourceLabel(row.priceSource)}</Badge>
														</div>
													</div>
												</Table.Cell>
												<Table.Cell class="text-end tabular-nums">{formatNumber(row.durationSeconds / 60)} min</Table.Cell>
												<Table.Cell class="text-end tabular-nums">{formatNumber(row.consumablesPerActivation)}</Table.Cell>
												<Table.Cell class="text-end tabular-nums">{formatEly(row.unitPriceEly)}</Table.Cell>
												<Table.Cell class="text-end font-medium tabular-nums">{formatEly(row.costPerHourEly)}</Table.Cell>
											</Table.Row>
										{/each}
									</Table.Body>
								</Table.Root>
							</div>
						{:else}
							<p class="mt-3 text-sm text-muted-foreground">No buffs selected.</p>
						{/if}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">Enter a valid clear time to view the breakdown.</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</section>

	<Alert.Root class="mt-8">
		<InfoIcon aria-hidden="true" />
		<Alert.Title class="min-w-0">What this estimate includes</Alert.Title>
		<Alert.Description class="min-w-0">
			<p>
				Tradable rewards deduct the 1% marketplace fee and any required material-conversion cost.
				Service income deducts only provider-paid NPC Ely upgrade costs; the customer supplies the
				equipment and Seal Locks. Finding a buyer, enchanting profit, and sell-through time remain
				outside this estimate.
			</p>
			<div class="mt-3 flex flex-wrap gap-3">
				{#each data.catalog.sources as source (source.id)}
					{#if source.url}
						<Button
							href={source.url}
							target="_blank"
							rel="noreferrer"
							variant="link"
							size="sm"
							class="h-auto max-w-full min-w-0 justify-start whitespace-normal text-left"
						>
							{source.title}
							<ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
						</Button>
					{/if}
				{/each}
			</div>
		</Alert.Description>
	</Alert.Root>
</main>
