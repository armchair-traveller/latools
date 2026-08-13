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
	let dateFormatter = $derived(createDateFormatter(data.meta.timeZone));
	let dateTimeFormatter = $derived(createDateTimeFormatter(data.meta.timeZone));

	let selectedCycleId = $derived<string>(data.currentCycleId);
	let viewMode = $state<ViewMode>('objective');
	let utilityPercentByOfferId = $state<Record<string, number | undefined>>({});
	let directElyByOfferId = $state<Record<string, number | undefined>>({});

	let selectedCycle = $derived(
		data.cycleViews.find((cycle) => cycle.id === selectedCycleId) ?? data.cycleViews[0]
	);
	let featuredOffer = $derived(
		selectedCycle?.offers.find((offer) => offer.rank === 1) ?? selectedCycle?.offers[0]
	);
	let poster = $derived(selectedCycle?.poster ?? null);
	let posterUrl = $derived(poster?.url ?? null);
	let posterCycleLabel = $derived(selectedCycle?.label.split(' · ')[0] ?? 'Sale');
	let officialPostUrl = $derived(
		data.sources.find((source) => source.id.startsWith('official-post-'))?.url ?? null
	);
	let failedPosterUrl = $state<string | null>(null);
	let posterPreviewFailed = $derived(posterUrl !== null && failedPosterUrl === posterUrl);
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
		return value === null ? 'Not ranked' : `${compactFormatter.format(value)} Ely/LTC`;
	}

	function formatLimit(limit: number | null): string {
		if (limit === null) return 'Not stated';
		return integerFormatter.format(limit);
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

<div class="flash-sale-route" data-view-mode={viewMode}>
	<div class="flash-sale-page mx-auto w-full max-w-[84rem] px-4 py-8 sm:px-6 md:px-8 md:py-12">
	<div class="sale-atmosphere" aria-hidden="true">
		<span></span>
		<span></span>
		<span></span>
	</div>

	<header class="sale-hero">
		<div class="sale-hero__copy">
			<div class="sale-hero__brand">
				<Badge variant="outline">Festa value guide</Badge>
				<span>Smart picks, bright drop</span>
			</div>

			<div class="sale-hero__badges">
				<Badge variant="secondary">{saleStatusLabel(data.meta.status)}</Badge>
				<Badge variant={data.completeness.exactOffers > 0 ? 'default' : 'outline'}>
					{data.completeness.exactOffers > 0 ? 'Exact ranks available' : 'Valuation review pending'}
				</Badge>
			</div>

			<div class="sale-hero__title-row">
				<div class="sale-hero__mark" aria-hidden="true">
					<PercentIcon />
				</div>
				<div>
					<p class="sale-hero__eyebrow">Cycle-by-cycle price intelligence</p>
					<h1>{data.meta.title}</h1>
				</div>
			</div>

			<p class="sale-hero__lede">
				See how much reviewed value each LTC may return. Exact-value comparisons surface the
				highest reviewed offer in each cycle, while honest lower bounds keep uncertain bundles in
				view.
			</p>

			<dl class="sale-hero__facts" aria-label="Sale details">
				<div class="sale-hero__fact sale-hero__fact--window">
					<dt>Sale window</dt>
					<dd>
						<CalendarDaysIcon aria-hidden="true" />
						{formatDate(data.meta.startsAt)} – {formatDate(data.meta.endsAt)}
					</dd>
				</div>
				<div class="sale-hero__fact sale-hero__fact--coverage">
					<dt>Capture coverage</dt>
					<dd class="sale-hero__coverage-value">
						<span>{data.completeness.capturedOffers}/{data.completeness.expectedOffers} captured</span>
						<span class="sale-hero__fact-note">
							{data.completeness.exactOffers} exact · {data.completeness.partialOffers} partial ·
							{data.completeness.uniqueOffers} unique · {data.completeness.pendingOffers} pending
							{#if data.completeness.unverifiedOffers > 0}
								· {data.completeness.unverifiedOffers} unverified
							{/if}
						</span>
					</dd>
				</div>
				<div class="sale-hero__fact sale-hero__fact--market">
					<dt>Market</dt>
					<dd>{data.meta.region} · {data.meta.currency}</dd>
				</div>
			</dl>

			{#if posterUrl}
				<Button
					class="sale-hero__mobile-poster"
					href={posterUrl}
					target="_blank"
					rel="noreferrer"
					variant="outline"
					size="sm"
				>
					Open official poster
					<ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
				</Button>
			{/if}
		</div>

		<div
			class="sale-hero__visual"
			style={`--poster-position: ${poster?.positionPercent ?? 50}%`}
		>
			<div class="sale-hero__poster-fallback" aria-hidden="true">
				<PercentIcon />
			</div>
			{#if posterUrl}
				{#key posterUrl}
					<img
						src={posterUrl}
						alt={`Cropped preview of ${poster?.title ?? `the official ${posterCycleLabel} sale poster`}`}
						loading="eager"
						decoding="async"
						onload={() => {
							if (failedPosterUrl === posterUrl) failedPosterUrl = null;
						}}
						onerror={(event) => {
							(event.currentTarget as HTMLImageElement).hidden = true;
							failedPosterUrl = posterUrl;
						}}
					/>
				{/key}
			{/if}
			{#if posterUrl}
				<Button
					class="sale-hero__visual-label"
					href={posterUrl}
					target="_blank"
					rel="noreferrer"
					variant="outline"
					size="sm"
					aria-label={`Open ${poster?.title ?? 'official sale board'} in a new tab`}
				>
					<span class="sale-hero__visual-copy">Open official poster</span>
					<Badge>{posterCycleLabel}</Badge>
					<ExternalLinkIcon aria-hidden="true" />
				</Button>
			{/if}
			{#if posterPreviewFailed}
				<div class="sale-hero__poster-error" role="status">
					<p>Poster preview unavailable</p>
					{#if officialPostUrl}
						<Button href={officialPostUrl} target="_blank" rel="noreferrer" variant="outline" size="sm">
							Open official sale post
							<ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
						</Button>
					{/if}
				</div>
			{/if}
			{#if featuredOffer}
				<Card.Root class="sale-hero__leader" size="sm">
					<Card.Header>
						<p class="sale-hero__leader-kicker">
							<TrophyIcon aria-hidden="true" />
							{featuredOffer.rank === 1 ? 'Objective cycle leader' : 'Featured offer'}
						</p>
						<Card.Title><p>{featuredOffer.name}</p></Card.Title>
					</Card.Header>
					<Card.Content>
						<p>{objectiveRatio(featuredOffer)}</p>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	</header>

	<Card.Root class="comparison-panel mt-8">
		<Card.Header class="comparison-panel__header">
			<Card.Title><h2>Cycle and comparison view</h2></Card.Title>
			<Card.Description>
				Choose a cycle, then keep the reviewed objective ranking or add an optional personal estimate.
			</Card.Description>
		</Card.Header>
		<Card.Content class="comparison-panel__grid grid gap-6 lg:grid-cols-2">
			<Field.Set class="cycle-field">
				<Field.Legend variant="label">Sale cycle</Field.Legend>
				<Field.Description>Each cycle has its own exact ranking; cycles are never mixed.</Field.Description>
				{#if data.cycleViews.length > 1}
					<div class="cycle-toggle mt-3" role="radiogroup" aria-label="Select sale cycle">
						{#each data.cycleViews as cycle (cycle.id)}
							<label class="cycle-toggle__item">
								<input
									class="sr-only"
									type="radio"
									name="flash-sale-cycle"
									value={cycle.id}
									checked={selectedCycleId === cycle.id}
									onchange={() => (selectedCycleId = cycle.id)}
								/>
								<span>{cycle.label}</span>
								{#if cycle.status === 'current'}
									<span class="sr-only">(current)</span>
								{/if}
							</label>
						{/each}
					</div>
				{:else if selectedCycle}
					<div class="mt-3"><Badge variant="secondary">{selectedCycle.label}</Badge></div>
				{/if}
			</Field.Set>

			<Field.Set class="view-field">
				<Field.Legend variant="label">Comparison view</Field.Legend>
				<Field.Description>
					Personal inputs stay in this browser tab and never change objective ranks.
				</Field.Description>
				<div class="view-toggle mt-3" role="radiogroup" aria-label="Select comparison view">
					<label class="view-toggle__item">
						<input
							class="sr-only"
							type="radio"
							name="flash-sale-view"
							value="objective"
							checked={viewMode === 'objective'}
							onchange={() => (viewMode = 'objective')}
						/>
						<ShieldCheckIcon aria-hidden="true" />
						<span>Objective</span>
					</label>
					<label class="view-toggle__item">
						<input
							class="sr-only"
							type="radio"
							name="flash-sale-view"
							value="personal"
							checked={viewMode === 'personal'}
							onchange={() => (viewMode = 'personal')}
						/>
						<UserRoundIcon aria-hidden="true" />
						<span>Personal</span>
					</label>
				</div>
			</Field.Set>
		</Card.Content>
		{#if selectedCycle}
			<Card.Footer class="comparison-panel__footer flex-wrap justify-between gap-3">
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
		<Card.Root class="personal-panel mt-5" size="sm">
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
		<section class="offer-section mt-10" aria-labelledby="selected-cycle-heading">
			<div class="offer-section__heading flex flex-wrap items-end justify-between gap-4">
				<div>
					<div class="offer-section__kicker flex items-center gap-2 text-secondary-foreground">
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
				<ul class="offer-grid mt-6 grid gap-5 xl:grid-cols-2">
					{#each selectedCycle.offers as offer (offer.id)}
						<li class="offer-item min-w-0">
							<Card.Root
								class="offer-card h-full"
								data-rank={offer.rank ?? 'unranked'}
								data-valuation={offer.valuation}
							>
								<Card.Header class="offer-card__header">
									<Card.Action>
										<div class="offer-card__badges flex flex-col items-end gap-1">
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
									<div class="offer-card__identity flex min-w-0 items-start gap-3 pr-20">
										<div class="offer-card__icon grid size-11 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
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

								<Card.Content class="offer-card__content flex flex-col gap-6">
									<dl class="offer-card__metrics grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
										<div data-metric="price">
											<dt class="text-xs text-muted-foreground">Price</dt>
											<dd class="mt-1 font-medium">{integerFormatter.format(offer.priceLtc)} LTC</dd>
										</div>
										<div data-metric="bundle">
											<dt class="text-xs text-muted-foreground">Objective bundle</dt>
											<dd class="mt-1 font-medium">{objectiveBundle(offer)}</dd>
										</div>
										<div data-metric="efficiency">
											<dt class="text-xs text-muted-foreground">Objective efficiency</dt>
											<dd class="mt-1 font-medium">{objectiveRatio(offer)}</dd>
										</div>
										<div data-metric="limit">
											<dt class="text-xs text-muted-foreground">Limit</dt>
											<dd class="mt-1 font-medium">
												{formatLimit(offer.purchaseLimit)}
											</dd>
										</div>
									</dl>

									<Separator />

									<div class="min-w-0">
										<h4 id={`evidence-heading-${offer.id}`} class="text-sm font-medium">
											Bundle contents and evidence
										</h4>
										<ul
											class="evidence-list mt-3"
											aria-labelledby={`evidence-heading-${offer.id}`}
										>
											{#each offer.components as component (component.id)}
												<li class="evidence-item">
													<div class="evidence-item__summary">
														<div class="evidence-item__title">
															<p>{component.name} ×{component.quantity}</p>
															<Badge variant="outline">
																{componentValuationLabel(component.valuation)}
															</Badge>
														</div>
														<dl class="evidence-item__values">
															<div>
																<dt>Unit value</dt>
																<dd>
																	{component.valuation === 'priced' || component.valuation === 'estimated'
																		? formatEly(component.unitEly)
																		: '—'}
																</dd>
															</div>
															<div>
																<dt>Bundle value</dt>
																<dd>{componentValue(component)}</dd>
															</div>
														</dl>
													</div>

													<div class="evidence-item__review">
														<div class="flex flex-wrap gap-1">
															<Badge variant="secondary">{component.confidence}</Badge>
															<Badge variant="outline">{evidenceAge(component)}</Badge>
														</div>
														<p>{component.evidence}</p>
														<p class="evidence-item__source">
															{component.source} · {formatDate(component.priceUpdatedAt)}
														</p>
													</div>
												</li>
											{/each}
										</ul>
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
										<Card.Root class="personal-offer-card" size="sm">
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
														aria-describedby={`utility-description-${offer.id}`}
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
													<Field.Description id={`utility-description-${offer.id}`}>
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
														aria-describedby={`direct-description-${offer.id}`}
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
													<Field.Description id={`direct-description-${offer.id}`}>
														Overrides component percentages for this bundle.
													</Field.Description>
													</Field.Field>
												</Field.Group>
											</Card.Content>
											<Card.Footer
												class="personal-results flex-wrap gap-x-6 gap-y-2"
												aria-live="polite"
											>
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

								<Card.Footer class="offer-card__footer">
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
				</ul>
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

	<section class="notes-grid grid gap-5 lg:grid-cols-2 xl:grid-cols-3" aria-label="Flash sale data notes">
		<Card.Root class="notes-card" data-note="coverage">
			<Card.Header>
				<div class="notes-card__eyebrow flex items-center gap-2 text-secondary-foreground">
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

		<Card.Root class="notes-card" data-note="evidence">
			<Card.Header>
				<div class="notes-card__eyebrow flex items-center gap-2 text-secondary-foreground">
					<Clock3Icon class="size-5" aria-hidden="true" />
					<p class="text-sm font-medium">Evidence</p>
				</div>
				<Card.Title><h2>Source and review</h2></Card.Title>
				<Card.Description>Frozen sale data and valuations make each comparison reproducible.</Card.Description>
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

		<Card.Root class="notes-card" data-note="method">
			<Card.Header>
				<div class="notes-card__eyebrow flex items-center gap-2 text-secondary-foreground">
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
	</div>
</div>

<style>
	.flash-sale-route {
		--background: #fff4f9;
		--foreground: #3f2148;
		--card: #ffffff;
		--card-foreground: #3f2148;
		--popover: #ffffff;
		--popover-foreground: #3f2148;
		--primary: #b90c58;
		--primary-foreground: #ffffff;
		--secondary: #ffe16b;
		--secondary-foreground: #422800;
		--muted: #f5e7ef;
		--muted-foreground: #715e77;
		--accent: #dff7ff;
		--accent-foreground: #17485d;
		--destructive: #b42318;
		--border: #e7b4cc;
		--input: #dca7c0;
		--ring: #087f9e;
		--radius: 0.9rem;
		--festa-pink: #ef2b7a;
		--festa-pink-deep: #8f174f;
		--festa-plum: #4b214f;
		--festa-purple: #8a4fd6;
		--festa-cyan: #5fd5ed;
		--festa-yellow: #ffdd55;
		position: relative;
		width: 100%;
		flex: 1;
		overflow: clip;
		color: var(--foreground);
		color-scheme: light;
		background:
			radial-gradient(circle at 9% 4%, rgb(255 221 85 / 0.48), transparent 21rem),
			radial-gradient(circle at 92% 12%, rgb(95 213 237 / 0.34), transparent 24rem),
			linear-gradient(180deg, #fffafd 0%, #fff2f8 52%, #f8f4ff 100%);
	}

	.flash-sale-page {
		position: relative;
		isolation: isolate;
	}

	.sale-atmosphere {
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
	}

	.sale-atmosphere span {
		position: absolute;
		display: block;
		border: 2px solid var(--festa-plum);
		background: #fff;
		box-shadow: 0.35rem 0.35rem 0 var(--festa-pink);
	}

	.sale-atmosphere span:nth-child(1) {
		top: 4.5rem;
		left: -2.5rem;
		width: 5rem;
		height: 5rem;
		border-radius: 1.25rem;
		transform: rotate(16deg);
	}

	.sale-atmosphere span:nth-child(2) {
		top: 38rem;
		right: -3.75rem;
		width: 7.5rem;
		height: 7.5rem;
		border-radius: 999px;
		background: var(--festa-yellow);
		box-shadow: 0.45rem 0.45rem 0 var(--festa-cyan);
	}

	.sale-atmosphere span:nth-child(3) {
		top: 75rem;
		left: -3rem;
		width: 6rem;
		height: 2.5rem;
		border-radius: 999px;
		background: var(--festa-cyan);
		box-shadow: 0.35rem 0.35rem 0 var(--festa-purple);
		transform: rotate(-12deg);
	}

	.sale-hero {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(21rem, 0.75fr);
		gap: clamp(2rem, 5vw, 5rem);
		align-items: center;
		min-height: 36rem;
		overflow: hidden;
		padding: clamp(1.5rem, 4vw, 4rem);
		border: 2px solid var(--festa-plum);
		border-radius: 2.25rem;
		background:
			linear-gradient(135deg, rgb(255 255 255 / 0.98) 0 58%, rgb(255 224 239 / 0.98) 58% 100%);
		box-shadow:
			0.8rem 0.8rem 0 var(--festa-pink),
			0 1.75rem 4rem rgb(88 27 78 / 0.14);
	}

	.sale-hero::before,
	.sale-hero::after {
		position: absolute;
		content: '';
		pointer-events: none;
	}

	.sale-hero::before {
		inset: auto auto -5.25rem -3rem;
		width: 12rem;
		height: 12rem;
		border: 2px solid rgb(75 33 79 / 0.16);
		border-radius: 999px;
		background: rgb(255 221 85 / 0.43);
	}

	.sale-hero::after {
		top: 1rem;
		right: 1rem;
		width: 5.5rem;
		height: 5.5rem;
		background-image: radial-gradient(var(--festa-pink) 1.5px, transparent 1.5px);
		background-size: 10px 10px;
		opacity: 0.32;
	}

	.sale-hero__copy {
		position: relative;
		z-index: 2;
		min-width: 0;
	}

	.sale-hero__brand,
	.sale-hero__badges,
	.sale-hero__title-row,
	.sale-hero__facts dd,
	.sale-hero__leader-kicker,
	.offer-section__kicker,
	.notes-card__eyebrow {
		display: flex;
		align-items: center;
	}

	.sale-hero__brand {
		flex-wrap: wrap;
		gap: 0.75rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.68rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.sale-hero__brand :global([data-slot='badge']) {
		border: 1.5px solid var(--festa-plum);
		background: #fff;
		box-shadow: 0.2rem 0.2rem 0 var(--festa-yellow);
		color: var(--festa-pink-deep);
	}

	.sale-hero__brand > span {
		color: var(--muted-foreground);
	}

	.sale-hero__badges {
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1.8rem;
	}

	.sale-hero__badges :global([data-slot='badge']) {
		border: 1px solid var(--festa-plum);
		box-shadow: 0.14rem 0.14rem 0 rgb(75 33 79 / 0.16);
	}

	.sale-hero__title-row {
		align-items: flex-start;
		gap: clamp(0.9rem, 2vw, 1.35rem);
		margin-top: 1.4rem;
	}

	.sale-hero__mark {
		display: grid;
		width: clamp(3.6rem, 6vw, 5.25rem);
		height: clamp(3.6rem, 6vw, 5.25rem);
		flex: 0 0 auto;
		place-items: center;
		border: 2px solid var(--festa-plum);
		border-radius: 1.25rem;
		background: var(--festa-yellow);
		box-shadow: 0.35rem 0.35rem 0 var(--festa-cyan);
		color: var(--festa-plum);
		transform: rotate(-5deg);
	}

	.sale-hero__mark :global(svg) {
		width: 46%;
		height: 46%;
		stroke-width: 2.5;
	}

	.sale-hero__eyebrow {
		margin: 0 0 0.35rem;
		color: var(--festa-pink-deep);
		font-size: 0.76rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.sale-hero h1 {
		max-width: 12ch;
		margin: 0;
		color: var(--festa-plum);
		font-family: ui-rounded, 'Arial Rounded MT Bold', 'Inter Variable', sans-serif;
		font-size: clamp(3rem, 6vw, 5.6rem);
		font-weight: 850;
		letter-spacing: -0.065em;
		line-height: 0.91;
		text-wrap: balance;
	}

	.sale-hero__lede {
		max-width: 43rem;
		margin: 1.65rem 0 0;
		color: #624c68;
		font-size: clamp(1rem, 1.3vw, 1.12rem);
		font-weight: 520;
		line-height: 1.72;
	}

	.sale-hero__facts {
		display: grid;
		grid-template-columns: minmax(0, 1.7fr) minmax(7.5rem, 0.8fr) minmax(7rem, 0.72fr);
		gap: 0.75rem;
		margin: 2rem 0 0;
	}

	.sale-hero__fact {
		min-width: 0;
		padding: 0.85rem 1rem;
		border: 1.5px solid var(--festa-plum);
		border-radius: 1rem;
		box-shadow: 0.18rem 0.18rem 0 rgb(75 33 79 / 0.12);
	}

	.sale-hero__fact--window {
		background: #fff4bd;
	}

	.sale-hero__fact--coverage {
		background: #dff8ff;
	}

	.sale-hero__fact--market {
		background: #f0e4ff;
	}

	.sale-hero__facts dt {
		color: #6c5571;
		font-size: 0.66rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.sale-hero__facts dd {
		gap: 0.45rem;
		margin: 0.3rem 0 0;
		font-size: 0.78rem;
		font-weight: 750;
		line-height: 1.35;
	}

	.sale-hero__fact-note {
		color: #66506b;
		font-size: 0.64rem;
		font-weight: 650;
		line-height: 1.35;
	}

	.sale-hero__facts .sale-hero__coverage-value {
		flex-direction: column;
		align-items: flex-start;
		gap: 0.2rem;
	}

	.sale-hero__facts dd :global(svg) {
		width: 0.9rem;
		height: 0.9rem;
		flex: 0 0 auto;
	}

	.sale-hero__visual {
		position: relative;
		z-index: 1;
		min-width: 0;
		height: clamp(27rem, 39vw, 32rem);
		overflow: hidden;
		border: 2px solid var(--festa-plum);
		border-radius: 2rem;
		background: #ffe1ef;
		box-shadow: 0.65rem 0.65rem 0 var(--festa-purple);
		transform: rotate(1.25deg);
	}

	.sale-hero__poster-fallback,
	.sale-hero__visual > img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.sale-hero__poster-fallback {
		display: grid;
		place-items: center;
		background:
			radial-gradient(circle at 75% 18%, rgb(255 221 85 / 0.85), transparent 8rem),
			linear-gradient(145deg, #ffdeec, #f1dcff 62%, #cef5ff);
		color: rgb(143 23 79 / 0.22);
	}

	.sale-hero__poster-fallback :global(svg) {
		width: 9rem;
		height: 9rem;
		stroke-width: 1.25;
	}

	.sale-hero__visual > img {
		z-index: 1;
		display: block;
		object-fit: cover;
		object-position: center var(--poster-position, 50%);
	}

	.sale-hero__visual::after {
		position: absolute;
		inset: 0;
		z-index: 2;
		content: '';
		pointer-events: none;
		background: linear-gradient(180deg, transparent 48%, rgb(55 20 59 / 0.48) 100%);
	}

	.sale-hero__visual :global(.sale-hero__visual-label) {
		position: absolute;
		display: inline-flex;
		align-items: center;
		top: 1rem;
		right: 1rem;
		z-index: 3;
		gap: 0.55rem;
		padding: 0.42rem 0.5rem 0.42rem 0.75rem;
		border: 1.5px solid var(--festa-plum);
		border-radius: 999px;
		background: rgb(255 255 255 / 0.94);
		box-shadow: 0.2rem 0.2rem 0 var(--festa-cyan);
		font-size: 0.68rem;
		font-weight: 750;
		color: var(--festa-plum);
		text-decoration: none;
	}

	.sale-hero__visual :global(.sale-hero__visual-label [data-slot='badge']) {
		border: 0;
	}

	.sale-hero__visual :global(.sale-hero__visual-label > svg) {
		width: 0.78rem;
		height: 0.78rem;
	}

	.sale-hero__poster-error {
		position: absolute;
		top: 50%;
		right: 1rem;
		left: 1rem;
		z-index: 3;
		display: grid;
		justify-items: center;
		gap: 0.65rem;
		padding: 1rem;
		border: 1.5px solid var(--festa-plum);
		border-radius: 1rem;
		background: rgb(255 255 255 / 0.94);
		box-shadow: 0.25rem 0.25rem 0 var(--festa-cyan);
		font-size: 0.78rem;
		font-weight: 750;
		text-align: center;
		transform: translateY(-50%);
	}

	.sale-hero__poster-error p {
		margin: 0;
	}

	.sale-hero__visual :global(.sale-hero__leader) {
		position: absolute;
		right: 1rem;
		bottom: 1rem;
		left: 1rem;
		z-index: 3;
		gap: 0.4rem;
		border: 1.5px solid var(--festa-plum);
		border-radius: 1.25rem;
		background: rgb(255 255 255 / 0.94);
		box-shadow: 0.3rem 0.3rem 0 var(--festa-yellow);
		backdrop-filter: blur(12px);
	}

	.sale-hero__leader-kicker {
		gap: 0.4rem;
		color: var(--festa-pink-deep);
		font-size: 0.67rem;
		font-weight: 850;
		letter-spacing: 0.09em;
		text-transform: uppercase;
	}

	.sale-hero__leader-kicker :global(svg) {
		width: 0.9rem;
		height: 0.9rem;
	}

	.sale-hero__visual :global(.sale-hero__leader [data-slot='card-title']) {
		font-family: ui-rounded, 'Arial Rounded MT Bold', 'Inter Variable', sans-serif;
		font-size: 1rem;
		font-weight: 800;
		line-height: 1.2;
	}

	.sale-hero__visual :global(.sale-hero__leader [data-slot='card-content']) {
		color: var(--festa-plum);
		font-size: 1.15rem;
		font-weight: 850;
	}

	.flash-sale-page :global(.comparison-panel),
	.flash-sale-page :global(.personal-panel),
	.flash-sale-page :global(.offer-card),
	.flash-sale-page :global(.notes-card) {
		border: 2px solid var(--festa-plum);
		box-shadow: none;
	}

	.sale-hero__copy :global(.sale-hero__mobile-poster) {
		display: none;
	}

	.flash-sale-page :global(.comparison-panel) {
		overflow: hidden;
		border-radius: 1.8rem;
		background: rgb(255 255 255 / 0.95);
		box-shadow: 0.65rem 0.65rem 0 var(--festa-cyan);
	}

	.flash-sale-page :global(.comparison-panel__header) {
		align-content: start;
		background: linear-gradient(145deg, #f9e9ff, #ffe5f0);
	}

	.flash-sale-page :global(.comparison-panel__header [data-slot='card-title']) {
		font-family: ui-rounded, 'Arial Rounded MT Bold', 'Inter Variable', sans-serif;
		font-size: 1.28rem;
		font-weight: 850;
		letter-spacing: -0.025em;
	}

	.flash-sale-page :global(.comparison-panel__grid) {
		align-items: stretch;
	}

	.flash-sale-page :global(.cycle-field),
	.flash-sale-page :global(.view-field) {
		min-width: 0;
		padding: 1rem;
		border: 1.5px solid var(--festa-plum);
		border-radius: 1.2rem;
	}

	.flash-sale-page :global(.cycle-field) {
		background: #fff7c9;
	}

	.flash-sale-page :global(.view-field) {
		background: #ddf8ff;
	}

	.cycle-toggle,
	.view-toggle {
		display: grid;
		width: 100%;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem;
	}

	.cycle-toggle__item,
	.view-toggle__item {
		position: relative;
		display: flex;
		width: 100%;
		min-width: 0;
		min-height: 2.75rem;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		padding: 0.45rem 0.7rem;
		border: 1.5px solid var(--festa-plum);
		border-radius: 999px;
		background: #fff;
		box-shadow: 0.16rem 0.16rem 0 rgb(75 33 79 / 0.17);
		color: var(--festa-plum);
		font-size: 0.78rem;
		font-weight: 750;
		line-height: 1.25;
		text-align: center;
		cursor: pointer;
		transition:
			transform 140ms ease,
			box-shadow 140ms ease,
			background 140ms ease;
	}

	.view-toggle__item :global(svg) {
		width: 0.95rem;
		height: 0.95rem;
		flex: 0 0 auto;
	}

	.cycle-toggle__item:has(input:checked),
	.view-toggle__item:has(input:checked) {
		background: var(--primary);
		box-shadow: 0.22rem 0.22rem 0 var(--festa-yellow);
		color: var(--primary-foreground);
		transform: translate(-1px, -1px);
	}

	.cycle-toggle__item:has(input:focus-visible),
	.view-toggle__item:has(input:focus-visible) {
		outline: 3px solid color-mix(in oklab, var(--ring) 68%, white);
		outline-offset: 3px;
	}

	.flash-sale-page :global(.comparison-panel__footer) {
		border-top: 1.5px dashed #d9a4be;
		background: #fffafd;
	}

	.flash-sale-page :global(.personal-panel) {
		border-style: dashed;
		border-radius: 1.4rem;
		background: #f7edff;
		box-shadow: 0.38rem 0.38rem 0 #d9b9ff;
	}

	.offer-section__heading {
		padding-bottom: 1.35rem;
		border-bottom: 2px dashed #d8a7bf;
	}

	.offer-section__kicker,
	.notes-card__eyebrow {
		width: fit-content;
		gap: 0.45rem;
		padding: 0.35rem 0.65rem;
		border: 1.5px solid var(--festa-plum);
		border-radius: 999px;
		background: var(--festa-yellow);
		box-shadow: 0.15rem 0.15rem 0 var(--festa-cyan);
		color: var(--festa-plum);
	}

	.offer-section__heading h2 {
		margin-top: 0.65rem;
		color: var(--festa-plum);
		font-family: ui-rounded, 'Arial Rounded MT Bold', 'Inter Variable', sans-serif;
		font-size: clamp(1.8rem, 3vw, 2.55rem);
		font-weight: 850;
		letter-spacing: -0.045em;
	}

	.offer-grid {
		counter-reset: offers;
	}

	.flash-sale-page :global(.offer-card) {
		position: relative;
		isolation: isolate;
		border-radius: 1.75rem;
		background: linear-gradient(150deg, #ffffff 0%, #fff8fc 100%);
		box-shadow: 0.5rem 0.5rem 0 #edb8d2;
	}

	.flash-sale-page :global(.offer-card[data-rank='1']) {
		background: linear-gradient(150deg, #fffef7 0%, #fff4b6 135%);
		box-shadow: 0.55rem 0.55rem 0 var(--festa-yellow);
	}

	.flash-sale-page :global(.offer-card[data-rank='2']) {
		background: linear-gradient(150deg, #ffffff 0%, #dff9ff 135%);
		box-shadow: 0.55rem 0.55rem 0 var(--festa-cyan);
	}

	.flash-sale-page :global(.offer-card[data-rank='3']) {
		background: linear-gradient(150deg, #ffffff 0%, #ffe0ee 135%);
		box-shadow: 0.55rem 0.55rem 0 #f4a7c9;
	}

	.flash-sale-page :global(.offer-card[data-rank='unranked']) {
		box-shadow: 0.55rem 0.55rem 0 #cfb3f1;
	}

	.flash-sale-page :global(.offer-card:not([data-rank='unranked'])::before) {
		position: absolute;
		right: 0.65rem;
		bottom: 1rem;
		z-index: -1;
		content: '#' attr(data-rank);
		color: rgb(75 33 79 / 0.055);
		font-family: ui-rounded, 'Arial Rounded MT Bold', 'Inter Variable', sans-serif;
		font-size: 7rem;
		font-weight: 900;
		letter-spacing: -0.12em;
		line-height: 0.8;
		pointer-events: none;
	}

	.flash-sale-page :global(.offer-card__header) {
		padding-bottom: 1rem;
		border-bottom: 1.5px dashed #dcafc5;
		background: rgb(255 255 255 / 0.48);
	}

	.flash-sale-page :global(.offer-card__identity) {
		align-items: center;
	}

	.flash-sale-page :global(.offer-card__icon) {
		border: 1.5px solid var(--festa-plum);
		border-radius: 0.95rem;
		background: var(--festa-yellow);
		box-shadow: 0.18rem 0.18rem 0 var(--festa-cyan);
		color: var(--festa-plum);
	}

	.flash-sale-page :global(.offer-card__header [data-slot='card-title']) {
		color: var(--festa-plum);
		font-family: ui-rounded, 'Arial Rounded MT Bold', 'Inter Variable', sans-serif;
		font-size: 1.08rem;
		font-weight: 820;
		letter-spacing: -0.02em;
	}

	.flash-sale-page :global(.offer-card__badges [data-slot='badge']) {
		border: 1px solid var(--festa-plum);
		box-shadow: 0.12rem 0.12rem 0 rgb(75 33 79 / 0.16);
	}

	.flash-sale-page :global(.offer-card__metrics > div) {
		min-width: 0;
		padding: 0.75rem;
		border: 1px solid #e3bfd1;
		border-radius: 0.9rem;
		background: rgb(255 255 255 / 0.72);
	}

	.flash-sale-page :global(.offer-card__metrics > div[data-metric='efficiency']) {
		border-color: #d4ac24;
		background: #fff6bd;
	}

	.flash-sale-page :global(.offer-card__metrics dd) {
		overflow-wrap: anywhere;
		font-variant-numeric: tabular-nums;
	}

	.evidence-list {
		overflow: hidden;
		margin-bottom: 0;
		padding: 0;
		border: 1.5px solid #d9afc3;
		border-radius: 1rem;
		background: rgb(255 255 255 / 0.82);
		list-style: none;
	}

	.evidence-item {
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(13rem, 0.95fr);
		gap: 1rem;
		min-width: 0;
		padding: 1rem;
	}

	.evidence-item + .evidence-item {
		border-top: 1px solid #e7bfd2;
	}

	.evidence-item__summary,
	.evidence-item__review {
		min-width: 0;
	}

	.evidence-item__title {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.evidence-item__title p {
		margin: 0;
		font-weight: 700;
		overflow-wrap: anywhere;
	}

	.evidence-item__values {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.6rem;
		margin: 0.8rem 0 0;
	}

	.evidence-item__values > div {
		min-width: 0;
		padding: 0.6rem 0.7rem;
		border: 1px solid #e4c0d2;
		border-radius: 0.75rem;
		background: rgb(255 250 253 / 0.86);
	}

	.evidence-item__values dt {
		color: var(--muted-foreground);
		font-size: 0.65rem;
		font-weight: 750;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.evidence-item__values dd {
		margin: 0.2rem 0 0;
		font-weight: 750;
		font-variant-numeric: tabular-nums;
		overflow-wrap: anywhere;
	}

	.evidence-item__review {
		padding-left: 1rem;
		border-left: 1px dashed #d8aec2;
	}

	.evidence-item__review > p {
		margin: 0.65rem 0 0;
		color: var(--muted-foreground);
		font-size: 0.75rem;
		line-height: 1.55;
		overflow-wrap: anywhere;
	}

	.evidence-item__review > .evidence-item__source {
		margin-top: 0.3rem;
		font-size: 0.68rem;
	}

	.flash-sale-page :global(.personal-offer-card) {
		border: 1.5px solid var(--festa-purple);
		background: #f8efff;
		box-shadow: 0.28rem 0.28rem 0 #d9bdff;
	}

	.flash-sale-page :global(.personal-results) {
		border-color: #d4b5eb;
		background: rgb(255 255 255 / 0.58);
	}

	.flash-sale-page :global(.offer-card__footer) {
		border-top: 1.5px dashed #d8aec2;
		background: rgb(255 255 255 / 0.54);
	}

	.flash-sale-page :global(.notes-card) {
		border-radius: 1.55rem;
		background: #fff;
	}

	.flash-sale-page :global(.notes-card[data-note='coverage']) {
		box-shadow: 0.45rem 0.45rem 0 var(--festa-yellow);
	}

	.flash-sale-page :global(.notes-card[data-note='evidence']) {
		box-shadow: 0.45rem 0.45rem 0 var(--festa-cyan);
	}

	.flash-sale-page :global(.notes-card[data-note='method']) {
		box-shadow: 0.45rem 0.45rem 0 #d4b4f3;
	}

	.notes-card__eyebrow {
		background: #fff;
	}

	.notes-grid :global([data-slot='card-title']) {
		font-family: ui-rounded, 'Arial Rounded MT Bold', 'Inter Variable', sans-serif;
		font-weight: 820;
		letter-spacing: -0.025em;
	}

	@media (min-width: 960px) {
		.flash-sale-page :global(.comparison-panel) {
			display: grid;
			grid-template-columns: minmax(14rem, 0.68fr) minmax(0, 2fr);
			grid-template-rows: auto auto;
		}

		.flash-sale-page :global(.comparison-panel__header) {
			grid-row: 1 / span 2;
			align-content: center;
			border-right: 1.5px dashed #d9a4be;
		}

		.flash-sale-page :global(.comparison-panel__grid),
		.flash-sale-page :global(.comparison-panel__footer) {
			grid-column: 2;
		}
	}

	@media (max-width: 1320px) {
		.sale-hero {
			grid-template-columns: minmax(0, 1fr);
		}

		.sale-hero__copy {
			max-width: 50rem;
		}

		.sale-hero__visual {
			width: min(100%, 48rem);
			height: 30rem;
		}
	}

	@media (max-width: 720px) {
		.evidence-item {
			grid-template-columns: minmax(0, 1fr);
			gap: 0.85rem;
			padding: 0.9rem;
		}

		.evidence-item__review {
			padding-top: 0.85rem;
			padding-left: 0;
			border-top: 1px dashed #d8aec2;
			border-left: 0;
		}

		.sale-atmosphere span {
			display: none;
		}

		.sale-hero {
			min-height: 0;
			gap: 1.4rem;
			padding: 1.25rem;
			border-radius: 1.55rem;
			box-shadow: 0.42rem 0.42rem 0 var(--festa-pink);
		}

		.sale-hero h1 {
			font-size: clamp(2.7rem, 13vw, 4rem);
		}

		.sale-hero__mark {
			border-radius: 1rem;
			box-shadow: 0.22rem 0.22rem 0 var(--festa-cyan);
		}

		.sale-hero__lede {
			font-size: 0.95rem;
			line-height: 1.62;
		}

		.sale-hero__facts {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.sale-hero__fact--window {
			grid-column: 1 / -1;
		}

		.sale-hero__visual {
			width: calc(100% - 0.35rem);
			height: 10rem;
			border-radius: 1.4rem;
			box-shadow: 0.35rem 0.35rem 0 var(--festa-purple);
			transform: rotate(0.6deg);
		}

		.sale-hero__visual-copy {
			display: none;
		}

		.sale-hero__visual :global(.sale-hero__leader) {
			display: none;
		}

		.flash-sale-page :global(.comparison-panel),
		.flash-sale-page :global(.offer-card),
		.flash-sale-page :global(.notes-card) {
			border-radius: 1.25rem;
			box-shadow: 0.32rem 0.32rem 0 var(--festa-cyan);
		}

		.offer-section__heading {
			align-items: flex-start;
		}

		.flash-sale-page :global(.offer-card__header) {
			display: grid;
			grid-template-columns: minmax(0, 1fr);
		}

		.flash-sale-page :global(.offer-card__header [data-slot='card-action']) {
			position: static;
			grid-row: 1;
			grid-column: 1;
			justify-self: start;
			margin-bottom: 0.35rem;
		}

		.flash-sale-page :global(.offer-card__badges) {
			align-items: flex-start;
		}

		.flash-sale-page :global(.offer-card__identity) {
			grid-row: 2;
			padding-right: 0;
		}
	}

	@media (max-width: 440px) {
		.evidence-item__title {
			flex-direction: column;
		}

		.flash-sale-page {
			padding-top: 1rem;
		}

		.sale-hero__title-row {
			align-items: center;
		}

		.sale-hero__eyebrow {
			font-size: 0.66rem;
		}

		.sale-hero__visual {
			display: none;
		}

		.sale-hero__copy :global(.sale-hero__mobile-poster) {
			display: inline-flex;
			margin-top: 0.9rem;
			border: 1.5px solid var(--festa-plum);
			box-shadow: 0.18rem 0.18rem 0 var(--festa-cyan);
			color: var(--festa-plum);
		}

		.flash-sale-page :global(.offer-card__metrics) {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cycle-toggle__item,
		.view-toggle__item {
			transition: none;
		}
	}
</style>
