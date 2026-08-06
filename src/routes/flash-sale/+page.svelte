<script lang="ts">
	import CalendarDaysIcon from '@lucide/svelte/icons/calendar-days';
	import Clock3Icon from '@lucide/svelte/icons/clock-3';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import GaugeIcon from '@lucide/svelte/icons/gauge';
	import PackageSearchIcon from '@lucide/svelte/icons/package-search';
	import PercentIcon from '@lucide/svelte/icons/percent';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import TrophyIcon from '@lucide/svelte/icons/trophy';
	import UserRoundIcon from '@lucide/svelte/icons/user-round';
	import {
		calculatePersonalFlashSaleValue,
		evaluateFlashSaleCycle,
		rankPersonalFlashSaleOffers
	} from '$lib/flash-sale.js';
	import { Badge, type BadgeVariant } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Empty from '$lib/components/ui/empty';
	import * as Field from '$lib/components/ui/field';
	import * as InputGroup from '$lib/components/ui/input-group';
	import { Separator } from '$lib/components/ui/separator';
	import * as Table from '$lib/components/ui/table';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type ViewMode = 'objective' | 'personal';
	type OfferView = PageData['cycleViews'][number]['offers'][number];
	type ComponentView = OfferView['components'][number];
	type PersonalValue = ReturnType<typeof calculatePersonalFlashSaleValue>;

	const integerFormatter = new Intl.NumberFormat('en-US');
	const compactFormatter = new Intl.NumberFormat('en-US', {
		notation: 'compact',
		maximumFractionDigits: 2
	});
	const ratioFormatter = new Intl.NumberFormat('en-US', {
		maximumFractionDigits: 0
	});
	let dateFormatter = $derived(createDateFormatter(data.meta.timeZone));
	let dateTimeFormatter = $derived(createDateTimeFormatter(data.meta.timeZone));

	let selectedCycleId = $derived<string>(data.currentCycleId);
	let viewMode = $state<ViewMode>('objective');
	let utilityPercentByOfferId = $state<Record<string, number | undefined>>({});
	let directElyByOfferId = $state<Record<string, number | undefined>>({});

	let selectedCycle = $derived(
		data.cycleViews.find((cycle) => cycle.id === selectedCycleId) ?? data.cycleViews[0]
	);
	let rawSelectedCycle = $derived(
		data.calculation.cycles.find((cycle) => cycle.id === selectedCycle?.id) ??
			data.calculation.cycles[0]
	);
	let evaluatedSelectedOffers = $derived.by(() => {
		if (!rawSelectedCycle) return [];
		return evaluateFlashSaleCycle(data.calculation.sale, data.calculation.catalog, rawSelectedCycle.id);
	});
	let personalValueById = $derived.by(() => {
		return new Map(
			evaluatedSelectedOffers.map((offer) => [
				offer.id,
				calculatePersonalFlashSaleValue(offer, {
					utilityPercent: utilityPercentByOfferId[offer.id] ?? 100,
					personalValueEly: directElyByOfferId[offer.id]
				})
			])
		);
	});
	let personalRankById = $derived.by(() => {
		const inputs = Object.fromEntries(
			evaluatedSelectedOffers.map((offer) => [
				offer.id,
				{
					utilityPercent: utilityPercentByOfferId[offer.id] ?? 100,
					personalValueEly: directElyByOfferId[offer.id]
				}
			])
		);
		return new Map(
			rankPersonalFlashSaleOffers(evaluatedSelectedOffers, inputs).map((entry) => [
				entry.offer.id,
				entry.rank
			])
		);
	});

	function createDateFormatter(timeZone: string): Intl.DateTimeFormat {
		try {
			return new Intl.DateTimeFormat('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				timeZone
			});
		} catch {
			return new Intl.DateTimeFormat('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				timeZone: 'UTC'
			});
		}
	}

	function createDateTimeFormatter(timeZone: string): Intl.DateTimeFormat {
		try {
			return new Intl.DateTimeFormat('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
				timeZone,
				timeZoneName: 'short'
			});
		} catch {
			return new Intl.DateTimeFormat('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
				timeZone: 'UTC',
				timeZoneName: 'short'
			});
		}
	}

	function formatDate(value: string | null): string {
		if (!value) return 'Pending';
		const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value)
			? new Date(`${value}T12:00:00Z`)
			: new Date(value);
		return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed);
	}

	function formatDateTime(value: string | null): string {
		if (!value) return 'Pending';
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? value : dateTimeFormatter.format(parsed);
	}

	function formatEly(value: number | null): string {
		return value === null ? 'Not valued' : `${compactFormatter.format(value)} Ely`;
	}

	function formatRatio(value: number | null): string {
		return value === null ? 'Not ranked' : `${ratioFormatter.format(value)} Ely/LTC`;
	}

	function formatLimit(limit: number | null, scope: string | null): string {
		if (limit === null) return 'Not stated';
		return `${integerFormatter.format(limit)}${scope ? ` / ${scope}` : ''}`;
	}

	function saleStatusLabel(status: PageData['meta']['status']): string {
		if (status === 'upcoming') return 'Upcoming sale';
		if (status === 'ended') return 'Past sale';
		return 'Current sale';
	}

	function cycleStatusLabel(status: PageData['cycleViews'][number]['status']): string {
		if (status === 'upcoming') return 'Upcoming';
		if (status === 'ended') return 'Ended';
		return 'Current';
	}

	function valuationLabel(valuation: OfferView['valuation']): string {
		if (valuation === 'exact') return 'Exact';
		if (valuation === 'partial') return 'Partial lower bound';
		if (valuation === 'unique') return 'Unique';
		if (valuation === 'unverified') return 'Unverified';
		return 'Pending';
	}

	function valuationVariant(valuation: OfferView['valuation']): BadgeVariant {
		if (valuation === 'exact') return 'default';
		if (valuation === 'partial') return 'secondary';
		return 'outline';
	}

	function componentValuationLabel(valuation: ComponentView['valuation']): string {
		if (valuation === 'priced') return 'Priced';
		if (valuation === 'estimated') return 'Estimated';
		if (valuation === 'unique') return 'Unique';
		return 'Pending';
	}

	function objectiveBundle(offer: OfferView): string {
		if (offer.valuation === 'exact') return formatEly(offer.bundleEly);
		if (offer.valuation === 'partial') return `≥ ${formatEly(offer.lowerBoundEly)}`;
		if (offer.valuation === 'unique') return 'No Ely equivalent';
		return 'Awaiting valuation';
	}

	function objectiveRatio(offer: OfferView): string {
		if (offer.valuation === 'exact') return formatRatio(offer.elyPerLtc);
		if (offer.valuation === 'partial') return `≥ ${formatRatio(offer.lowerBoundElyPerLtc)}`;
		return 'Not ranked';
	}

	function componentValue(component: ComponentView): string {
		if (component.valuation === 'priced' || component.valuation === 'estimated') {
			return formatEly(component.bundleEly);
		}
		if (component.valuation === 'unique') return 'No Ely equivalent';
		return 'Pending';
	}

	function evidenceAge(component: ComponentView): string {
		if (component.evidenceAgeDays === null) return 'Age unavailable';
		if (component.evidenceAgeDays === 0) return 'Reviewed same day';
		return `${integerFormatter.format(component.evidenceAgeDays)} days old at review`;
	}

	function setUtilityPercentage(offerId: string, event: Event): void {
		const input = event.currentTarget as HTMLInputElement;
		utilityPercentByOfferId[offerId] = input.value === '' ? undefined : input.valueAsNumber;
	}

	function setDirectEly(offerId: string, event: Event): void {
		const input = event.currentTarget as HTMLInputElement;
		directElyByOfferId[offerId] = input.value === '' ? undefined : input.valueAsNumber;
	}

	function resetPersonalInputs(): void {
		utilityPercentByOfferId = {};
		directElyByOfferId = {};
	}

	function personalBundle(value: PersonalValue | undefined): number | null {
		return value?.personalEly ?? null;
	}

	function personalRatio(value: PersonalValue | undefined): number | null {
		return value?.personalElyPerLtc ?? null;
	}
</script>

<svelte:head>
	<title>{data.meta.title} · Flash Sale Ranking · LaTale Tools</title>
	<meta
		name="description"
		content="Compare LaTale flash sale offers by reviewed Ely value per LTC, with exact ranks, partial lower bounds, and transparent evidence."
	/>
	<meta property="og:title" content={`${data.meta.title} · Flash Sale Ranking`} />
	<meta
		property="og:description"
		content="A cycle-by-cycle LaTale flash sale comparison using frozen, reviewed Ely valuations."
	/>
</svelte:head>

<main class="mx-auto w-full max-w-[84rem] px-4 py-8 sm:px-6 md:px-8 md:py-12">
	<header class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
		<div class="flex items-start gap-4">
			<div class="grid size-14 shrink-0 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
				<PercentIcon class="size-7" aria-hidden="true" />
			</div>
			<div>
				<div class="flex flex-wrap gap-2">
					<Badge variant="secondary">{saleStatusLabel(data.meta.status)}</Badge>
					<Badge variant={data.completeness.exactOffers > 0 ? 'default' : 'outline'}>
						{data.completeness.exactOffers > 0 ? 'Exact ranks available' : 'Valuation review pending'}
					</Badge>
				</div>
				<h1 class="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
					{data.meta.title}
				</h1>
				<p class="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
					Compare bundles inside each sale cycle by reviewed Ely returned per LTC. Exact offers are
					ranked only against their own cycle; incomplete bundles show honest lower bounds instead.
				</p>
			</div>
		</div>

		<div
			class="flex flex-wrap gap-2 lg:max-w-md lg:justify-end"
			role="group"
			aria-label="Sale details"
		>
			<Badge variant="outline">
				<CalendarDaysIcon data-icon="inline-start" aria-hidden="true" />
				{formatDate(data.meta.startsAt)} – {formatDate(data.meta.endsAt)}
			</Badge>
			<Badge variant="outline">{data.meta.region}</Badge>
			<Badge variant="outline">{data.meta.currency}</Badge>
			<Badge variant="outline">
				{data.completeness.capturedOffers}/{data.completeness.expectedOffers} offers captured
			</Badge>
		</div>
	</header>

	<Card.Root class="mt-8">
		<Card.Header>
			<Card.Title><h2>Cycle and comparison view</h2></Card.Title>
			<Card.Description>
				Choose a cycle, then keep the reviewed objective ranking or add an optional personal estimate.
			</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-6 lg:grid-cols-2">
			<Field.Set>
				<Field.Legend variant="label">Sale cycle</Field.Legend>
				<Field.Description>Each cycle has its own exact ranking; cycles are never mixed.</Field.Description>
				{#if data.cycleViews.length > 1}
					<ToggleGroup.Root
						type="single"
						variant="outline"
						spacing={2}
						bind:value={selectedCycleId}
						aria-label="Select sale cycle"
						class="mt-3 flex-wrap"
					>
						{#each data.cycleViews as cycle (cycle.id)}
							<ToggleGroup.Item value={cycle.id} aria-label={`Show ${cycle.label}`}>
								{cycle.label}
								{#if cycle.status === 'current'}
									<span class="sr-only">(current)</span>
								{/if}
							</ToggleGroup.Item>
						{/each}
					</ToggleGroup.Root>
				{:else if selectedCycle}
					<div class="mt-3"><Badge variant="secondary">{selectedCycle.label}</Badge></div>
				{/if}
			</Field.Set>

			<Field.Set>
				<Field.Legend variant="label">Comparison view</Field.Legend>
				<Field.Description>
					Personal inputs stay in this browser tab and never change objective ranks.
				</Field.Description>
				<ToggleGroup.Root
					type="single"
					variant="outline"
					spacing={2}
					bind:value={viewMode}
					aria-label="Select comparison view"
					class="mt-3 flex-wrap"
				>
					<ToggleGroup.Item value="objective">
						<ShieldCheckIcon data-icon="inline-start" aria-hidden="true" />
						Objective
					</ToggleGroup.Item>
					<ToggleGroup.Item value="personal">
						<UserRoundIcon data-icon="inline-start" aria-hidden="true" />
						Personal
					</ToggleGroup.Item>
				</ToggleGroup.Root>
			</Field.Set>
		</Card.Content>
		{#if selectedCycle}
			<Card.Footer class="flex-wrap justify-between gap-3">
				<p class="text-xs text-foreground/75">
					{formatDateTime(selectedCycle.startsAt)} – {formatDateTime(selectedCycle.endsAt)}
				</p>
				<Badge variant={selectedCycle.status === 'current' ? 'secondary' : 'outline'}>
					{cycleStatusLabel(selectedCycle.status)}
				</Badge>
			</Card.Footer>
		{/if}
	</Card.Root>

	{#if viewMode === 'personal'}
		<Card.Root class="mt-5" size="sm">
			<Card.Header>
				<Card.Title><h2>Personal estimate is optional and local</h2></Card.Title>
				<Card.Description>
					Set how much of an offer's known value is useful to you, or enter your own total Ely value.
					A direct offer value overrides its utility percentage. Nothing is saved or sent.
				</Card.Description>
			</Card.Header>
			<Card.Footer>
				<Button variant="outline" size="sm" onclick={resetPersonalInputs}>
					<RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
					Reset personal inputs
				</Button>
			</Card.Footer>
		</Card.Root>
	{/if}

	{#if selectedCycle}
		<section class="mt-10" aria-labelledby="selected-cycle-heading">
			<div class="flex flex-wrap items-end justify-between gap-4">
				<div>
					<div class="flex items-center gap-2 text-secondary-foreground">
						<TrophyIcon class="size-5" aria-hidden="true" />
						<p class="text-sm font-medium">Per-cycle comparison</p>
					</div>
					<h2 id="selected-cycle-heading" class="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
						{selectedCycle.label} offers
					</h2>
					<p class="mt-2 max-w-3xl text-sm text-muted-foreground">
						Exact offers appear in rank order. Partial, unique, pending, and unverified offers follow
						without receiving a misleading numeric rank.
					</p>
				</div>
				<div
					class="flex flex-wrap gap-2"
					role="group"
					aria-label={`${selectedCycle.label} completeness`}
				>
					<Badge variant="secondary">
						{selectedCycle.capturedOffers}/{selectedCycle.expectedOffers} captured
					</Badge>
					<Badge variant="outline">{selectedCycle.exactOffers} exact</Badge>
					{#if selectedCycle.partialOffers > 0}
						<Badge variant="outline">{selectedCycle.partialOffers} partial</Badge>
					{/if}
					{#if selectedCycle.uniqueOffers > 0}
						<Badge variant="outline">{selectedCycle.uniqueOffers} unique</Badge>
					{/if}
					{#if selectedCycle.pendingOffers + selectedCycle.unverifiedOffers > 0}
						<Badge variant="outline">
							{selectedCycle.pendingOffers + selectedCycle.unverifiedOffers} need review
						</Badge>
					{/if}
				</div>
			</div>

			{#if selectedCycle.offers.length > 0}
				<ol class="mt-6 grid gap-5 xl:grid-cols-2">
					{#each selectedCycle.offers as offer (offer.id)}
						<li class="min-w-0">
							<Card.Root class="h-full">
								<Card.Header>
								<Card.Action>
									<div class="flex flex-col items-end gap-1">
										{#if offer.rank !== null}
											<Badge>#{offer.rank} exact</Badge>
										{:else}
											<Badge variant={valuationVariant(offer.valuation)}>
												{valuationLabel(offer.valuation)}
											</Badge>
										{/if}
										{#if viewMode === 'personal' && personalRankById.has(offer.id)}
											<Badge variant="secondary">
												Personal #{personalRankById.get(offer.id)}
											</Badge>
										{/if}
									</div>
								</Card.Action>
									<div class="flex min-w-0 items-start gap-3 pr-20">
										<div class="grid size-11 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
											<PackageSearchIcon class="size-5" aria-hidden="true" />
										</div>
										<div class="min-w-0">
											<Card.Title><h3 class="break-words">{offer.name}</h3></Card.Title>
											<Card.Description>
												Offer {offer.slot} · {integerFormatter.format(offer.priceLtc)} LTC
											</Card.Description>
										</div>
									</div>
								</Card.Header>

								<Card.Content class="flex flex-col gap-6">
									<dl class="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
										<div>
											<dt class="text-xs text-muted-foreground">Price</dt>
											<dd class="mt-1 font-medium">{integerFormatter.format(offer.priceLtc)} LTC</dd>
										</div>
										<div>
											<dt class="text-xs text-muted-foreground">Objective bundle</dt>
											<dd class="mt-1 font-medium">{objectiveBundle(offer)}</dd>
										</div>
										<div>
											<dt class="text-xs text-muted-foreground">Objective efficiency</dt>
											<dd class="mt-1 font-medium">{objectiveRatio(offer)}</dd>
										</div>
										<div>
											<dt class="text-xs text-muted-foreground">Purchase limit</dt>
											<dd class="mt-1 font-medium">
												{formatLimit(offer.purchaseLimit, offer.purchaseLimitScope)}
											</dd>
										</div>
									</dl>

									<Separator />

									<div class="min-w-0">
										<h4 class="text-sm font-medium">Bundle contents and evidence</h4>
										<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
										<div
											class="mt-3 overflow-x-auto rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&>[data-slot=table-container]]:overflow-visible"
											role="region"
											aria-label={`Scrollable contents and reviewed valuations for ${offer.name}`}
											tabindex="0"
										>
											<Table.Root class="min-w-[42rem]">
												<Table.Caption class="sr-only">
													Contents and reviewed valuations for {offer.name}
												</Table.Caption>
												<Table.Header>
													<Table.Row>
														<Table.Head>Component</Table.Head>
														<Table.Head class="text-end">Unit Ely</Table.Head>
														<Table.Head class="text-end">Component Ely</Table.Head>
														<Table.Head>Evidence</Table.Head>
													</Table.Row>
												</Table.Header>
												<Table.Body>
													{#each offer.components as component (component.id)}
														<Table.Row>
															<Table.Cell>
																<p class="font-medium">{component.name} ×{component.quantity}</p>
																<Badge variant="outline" class="mt-1">
																	{componentValuationLabel(component.valuation)}
																</Badge>
															</Table.Cell>
															<Table.Cell class="text-end">
														{component.valuation === 'priced' || component.valuation === 'estimated'
															? formatEly(component.unitEly)
															: '—'}
															</Table.Cell>
															<Table.Cell class="text-end">{componentValue(component)}</Table.Cell>
															<Table.Cell>
																<div class="flex flex-wrap gap-1">
																	<Badge variant="secondary">{component.confidence}</Badge>
																	<Badge variant="outline">{evidenceAge(component)}</Badge>
																</div>
																<p class="mt-2 max-w-xs text-xs text-muted-foreground">
																	{component.evidence}
																</p>
																<p class="mt-1 text-xs text-muted-foreground">
																	{component.source} · {formatDate(component.priceUpdatedAt)}
																</p>
															</Table.Cell>
														</Table.Row>
													{/each}
												</Table.Body>
											</Table.Root>
										</div>
									</div>

									<div class="grid gap-4 sm:grid-cols-3">
										<div>
											<h4 class="text-sm font-medium">Best for</h4>
											{#if offer.bestFor.length > 0}
												<ul class="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
													{#each offer.bestFor as item (`${offer.id}-best-${item}`)}
														<li>{item}</li>
													{/each}
												</ul>
											{:else}
												<p class="mt-2 text-sm text-muted-foreground">No specific use case claimed.</p>
											{/if}
										</div>
										<div>
											<h4 class="text-sm font-medium">Skip if</h4>
											{#if offer.skipIf.length > 0}
												<ul class="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
													{#each offer.skipIf as item (`${offer.id}-skip-${item}`)}
														<li>{item}</li>
													{/each}
												</ul>
											{:else}
												<p class="mt-2 text-sm text-muted-foreground">No specific skip condition claimed.</p>
											{/if}
										</div>
										<div>
											<h4 class="text-sm font-medium">Caveats</h4>
											{#if offer.caveats.length > 0 || offer.note}
												<ul class="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
													{#if offer.note}<li>{offer.note}</li>{/if}
													{#each offer.caveats as item (`${offer.id}-caveat-${item}`)}
														<li>{item}</li>
													{/each}
												</ul>
											{:else}
												<p class="mt-2 text-sm text-muted-foreground">No additional caveats.</p>
											{/if}
										</div>
									</div>

									{#if viewMode === 'personal'}
										<Separator />
										<Card.Root size="sm">
											<Card.Header>
												<div class="flex items-center gap-2 text-secondary-foreground">
													<UserRoundIcon class="size-4" aria-hidden="true" />
													<p class="text-sm font-medium">Your estimate</p>
												</div>
												<Card.Title><h4>Personal utility for {offer.name}</h4></Card.Title>
												<Card.Description>
													The percentage scales its known objective value. A direct total overrides that estimate.
												</Card.Description>
											</Card.Header>
											<Card.Content>
												<Field.Group class="grid gap-4 sm:grid-cols-2">
													<Field.Field data-disabled={offer.knownEly <= 0}>
														<Field.Label for={`utility-${offer.id}`}>Useful to you</Field.Label>
														<InputGroup.Root>
															<InputGroup.Input
																id={`utility-${offer.id}`}
																type="number"
																min="0"
																max="100"
																step="1"
																disabled={offer.knownEly <= 0}
																value={utilityPercentByOfferId[offer.id] ?? 100}
																oninput={(event) => setUtilityPercentage(offer.id, event)}
															/>
															<InputGroup.Addon align="inline-end">
																<InputGroup.Text>%</InputGroup.Text>
															</InputGroup.Addon>
														</InputGroup.Root>
														<Field.Description>
															{offer.knownEly > 0
																? "Scales the offer's known objective Ely value."
																: 'No known Ely base; use a direct value instead.'}
														</Field.Description>
													</Field.Field>

													<Field.Field>
														<Field.Label for={`direct-${offer.id}`}>Direct offer value</Field.Label>
														<InputGroup.Root>
															<InputGroup.Input
																id={`direct-${offer.id}`}
																type="number"
																min="0"
																step="1"
																placeholder="Optional"
																value={directElyByOfferId[offer.id] ?? ''}
																oninput={(event) => setDirectEly(offer.id, event)}
															/>
															<InputGroup.Addon align="inline-end">
																<InputGroup.Text>Ely</InputGroup.Text>
															</InputGroup.Addon>
														</InputGroup.Root>
														<Field.Description>Overrides component percentages for this bundle.</Field.Description>
													</Field.Field>
												</Field.Group>
											</Card.Content>
											<Card.Footer class="flex-wrap gap-x-6 gap-y-2">
												<p class="text-sm">
													<span class="text-muted-foreground">Personal bundle:</span>
													<strong>{formatEly(personalBundle(personalValueById.get(offer.id)))}</strong>
												</p>
												<p class="text-sm">
													<span class="text-muted-foreground">Personal efficiency:</span>
													<strong>{formatRatio(personalRatio(personalValueById.get(offer.id)))}</strong>
												</p>
											</Card.Footer>
										</Card.Root>
									{/if}
								</Card.Content>

								<Card.Footer>
									<p class="text-xs leading-relaxed text-foreground/75">
										{offer.valuation === 'exact'
											? `Objective rank #${offer.rank} uses only the frozen, reviewed valuation snapshot.`
											: offer.valuation === 'partial'
												? 'The known components form a lower bound; this offer is excluded from exact ranks.'
												: 'This offer remains visible but is excluded from exact numeric ranks.'}
									</p>
								</Card.Footer>
							</Card.Root>
						</li>
					{/each}
				</ol>
			{:else}
				<Empty.Root class="mt-6 min-h-56 border">
					<Empty.Header>
						<Empty.Media variant="icon"><PackageSearchIcon aria-hidden="true" /></Empty.Media>
						<Empty.Title>No captured offers in this cycle</Empty.Title>
						<Empty.Description>
							The cycle is listed, but no reviewed offer rows are available yet.
						</Empty.Description>
					</Empty.Header>
				</Empty.Root>
			{/if}
		</section>
	{/if}

	<Separator class="my-10" />

	<section class="grid gap-5 lg:grid-cols-2 xl:grid-cols-3" aria-label="Flash sale data notes">
		<Card.Root>
			<Card.Header>
				<div class="flex items-center gap-2 text-secondary-foreground">
					<GaugeIcon class="size-5" aria-hidden="true" />
					<p class="text-sm font-medium">Coverage</p>
				</div>
				<Card.Title><h2>Data completeness</h2></Card.Title>
				<Card.Description>What is captured, rankable, and still awaiting a decision.</Card.Description>
			</Card.Header>
			<Card.Content>
				<dl class="grid grid-cols-2 gap-4 sm:grid-cols-3">
					<div>
						<dt class="text-xs text-muted-foreground">Captured offers</dt>
						<dd class="mt-1 text-xl font-semibold">
							{data.completeness.capturedOffers}/{data.completeness.expectedOffers}
						</dd>
					</div>
					<div>
						<dt class="text-xs text-muted-foreground">Exact offers</dt>
						<dd class="mt-1 text-xl font-semibold">{data.completeness.exactOffers}</dd>
					</div>
					<div>
						<dt class="text-xs text-muted-foreground">Partial bounds</dt>
						<dd class="mt-1 text-xl font-semibold">{data.completeness.partialOffers}</dd>
					</div>
					<div>
						<dt class="text-xs text-muted-foreground">Unique offers</dt>
						<dd class="mt-1 text-xl font-semibold">{data.completeness.uniqueOffers}</dd>
					</div>
					<div>
						<dt class="text-xs text-muted-foreground">Pending values</dt>
						<dd class="mt-1 text-xl font-semibold">{data.completeness.pendingOffers}</dd>
					</div>
					<div>
						<dt class="text-xs text-muted-foreground">Unverified offers</dt>
						<dd class="mt-1 text-xl font-semibold">{data.completeness.unverifiedOffers}</dd>
					</div>
				</dl>
				{#if data.completeness.notes.length > 0}
					<ul class="mt-6 flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
						{#each data.completeness.notes as note (`completeness-${note}`)}
							<li>{note}</li>
						{/each}
					</ul>
				{/if}
			</Card.Content>
			<Card.Footer>
				<p class="text-xs text-foreground/75">{data.completeness.percent}% of expected offers captured.</p>
			</Card.Footer>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<div class="flex items-center gap-2 text-secondary-foreground">
					<Clock3Icon class="size-5" aria-hidden="true" />
					<p class="text-sm font-medium">Evidence</p>
				</div>
				<Card.Title><h2>Source and review</h2></Card.Title>
				<Card.Description>Frozen evidence makes each published comparison reproducible.</Card.Description>
			</Card.Header>
			<Card.Content>
				<dl class="grid gap-4 sm:grid-cols-2">
					<div>
						<dt class="text-xs text-muted-foreground">Sale reviewed</dt>
						<dd class="mt-1 font-medium">{formatDate(data.review.reviewedAt)}</dd>
					</div>
					<div>
						<dt class="text-xs text-muted-foreground">Valuations as of</dt>
						<dd class="mt-1 font-medium">{formatDate(data.review.valuationAsOf)}</dd>
					</div>
					<div>
						<dt class="text-xs text-muted-foreground">Capture status</dt>
						<dd class="mt-1 font-medium">{data.review.captureStatus}</dd>
					</div>
					<div>
						<dt class="text-xs text-muted-foreground">Source post</dt>
						<dd class="mt-1 font-medium">{data.meta.sourcePostId}</dd>
					</div>
				</dl>

				{#if data.review.sourceFingerprint}
					<div class="mt-5">
						<p class="text-xs text-muted-foreground">Source fingerprint</p>
						<code class="mt-1 block break-all text-xs">{data.review.sourceFingerprint}</code>
					</div>
				{/if}
			</Card.Content>
			<Card.Footer class="flex-wrap gap-2">
				{#each data.sources as source (source.id)}
					<Button href={source.url} target="_blank" rel="noreferrer" variant="outline" size="sm">
						{source.label}
						<ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
					</Button>
				{/each}
			</Card.Footer>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<div class="flex items-center gap-2 text-secondary-foreground">
					<SparklesIcon class="size-5" aria-hidden="true" />
					<p class="text-sm font-medium">Method</p>
				</div>
				<Card.Title><h2>How ranks work</h2></Card.Title>
				<Card.Description>{data.methodSummary}</Card.Description>
			</Card.Header>
			<Card.Content>
				<ol class="flex list-decimal flex-col gap-3 pl-5 text-sm leading-relaxed text-muted-foreground">
					{#each data.methodSteps as step (`method-${step}`)}
						<li>{step}</li>
					{/each}
				</ol>
			</Card.Content>
			<Card.Footer>
				<p class="text-xs text-foreground/75">
					Objective results use the sale's frozen valuation snapshot, not mutable current catalog prices.
				</p>
			</Card.Footer>
		</Card.Root>
	</section>
</main>
