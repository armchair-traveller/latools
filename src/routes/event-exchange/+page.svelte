<script lang="ts">
	import CalendarDaysIcon from '@lucide/svelte/icons/calendar-days';
	import CircleDollarSignIcon from '@lucide/svelte/icons/circle-dollar-sign';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import PackageSearchIcon from '@lucide/svelte/icons/package-search';
	import ShoppingBasketIcon from '@lucide/svelte/icons/shopping-basket';
	import TrophyIcon from '@lucide/svelte/icons/trophy';
	import { Badge, type BadgeVariant } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Empty from '$lib/components/ui/empty';
	import { Separator } from '$lib/components/ui/separator';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type OfferView = PageData['topOffers'][number];

	const integerFormatter = new Intl.NumberFormat('en-US');
	const compactFormatter = new Intl.NumberFormat('en-US', {
		notation: 'compact',
		maximumFractionDigits: 2
	});
	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});

	function formatInteger(value: number | null): string {
		return value === null ? 'Pending' : integerFormatter.format(value);
	}

	function formatEly(value: number | null): string {
		return value === null ? 'Not priced' : `${compactFormatter.format(value)} Ely`;
	}

	function formatDate(value: string | null): string | null {
		if (!value) return null;

		const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
		const date = dateOnly
			? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
			: new Date(value);

		return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
	}

	function eventWindow(startsAt: string | null, endsAt: string | null): string {
		const start = formatDate(startsAt);
		const end = formatDate(endsAt);

		if (start && end) return `${start} – ${end}`;
		if (start) return `Starts ${start}`;
		if (end) return `Ends ${end}`;
		return 'Event dates pending';
	}

	function offerTitle(offer: OfferView): string {
		return offer.name ?? 'Item identification pending';
	}

	function offerStatus(offer: OfferView): string {
		if (!offer.identified) return 'Identification pending';
		if (offer.elyPerPoint === null) return 'Pricing pending';
		return offer.rank === null ? 'Priced' : `#${offer.rank} in stage`;
	}

	function eventStatusLabel(status: PageData['event']['status']): string {
		if (status === 'upcoming') return 'Upcoming event';
		if (status === 'ended') return 'Ended event';
		return 'Current event';
	}

	function offerStatusVariant(offer: OfferView): BadgeVariant {
		if (offer.rank !== null && offer.rank <= 5) return 'default';
		return offer.elyPerPoint === null ? 'outline' : 'secondary';
	}

	function offerNote(offer: OfferView): string {
		if (!offer.captured) return 'This exchange slot has not been captured yet.';
		if (!offer.identified) {
			return 'The offer details were captured, but the item still needs a verified identity.';
		}
		if (offer.pointCost === null) return 'The point cost is incomplete, so this offer is not ranked.';
		if (offer.elyPerPoint === null) {
			return 'No verified Ely value yet. The offer remains visible but is excluded from the ranking.';
		}
		return offer.rank === null
			? 'Verified pricing is available for this offer.'
			: `Ranked #${offer.rank} by verified Ely returned per event point.`;
	}
</script>

<svelte:head>
	<title>{data.event.title} Exchange Ranking · LaTale Tools</title>
	<meta
		name="description"
		content="Compare LaTale event exchange rewards across all five stages by verified value per point."
	/>
	<meta property="og:title" content={`${data.event.title} Exchange Ranking`} />
	<meta
		property="og:description"
		content="A transparent, stage-by-stage ranking of the current LaTale event exchange."
	/>
</svelte:head>

<main class="mx-auto w-full max-w-[76rem] px-4 py-8 sm:px-6 md:px-8 md:py-12">
	<header class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
		<div class="flex items-start gap-4">
			<div class="grid size-14 shrink-0 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
				<ShoppingBasketIcon class="size-7" aria-hidden="true" />
			</div>
			<div>
				<div class="flex flex-wrap gap-2">
					<Badge variant="secondary">{eventStatusLabel(data.event.status)}</Badge>
					<Badge variant={data.completeness.pricedOffers > 0 ? 'default' : 'outline'}>
						{data.completeness.pricedOffers > 0 ? 'Ranking live' : 'Pricing pending'}
					</Badge>
				</div>
				<h1 class="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
					{data.event.title}
				</h1>
				<p class="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
					Event exchange ranking across all five stages by verified value per point. Unidentified and
					unpriced offers stay visible instead of receiving a guessed rank.
				</p>
			</div>
		</div>

		<div class="flex flex-wrap gap-2 lg:justify-end" aria-label="Event details">
			<Badge variant="outline">
				<CalendarDaysIcon data-icon="inline-start" aria-hidden="true" />
				{eventWindow(data.event.startsAt, data.event.endsAt)}
			</Badge>
			<Badge variant="outline">{data.event.region ?? 'Region pending'}</Badge>
			<Badge variant="outline">5 stages</Badge>
			<Badge variant="outline">
				{data.completeness.capturedOffers}/{data.completeness.expectedSlots} offers captured
			</Badge>
		</div>
	</header>

	<div class="mt-6 flex flex-wrap gap-2" aria-label="Jump to exchange stage">
		{#each data.stages as stage (stage.number)}
			<Button href={`#stage-${stage.number}`} variant="outline" size="sm">Stage {stage.number}</Button>
		{/each}
	</div>

	<section class="mt-8" aria-labelledby="top-five-heading">
		<Card.Root>
			<Card.Header>
				<div class="flex items-center gap-2 text-secondary-foreground">
					<TrophyIcon class="size-5" aria-hidden="true" />
					<p class="text-sm font-medium">Quick answer</p>
				</div>
				<Card.Title><h2 id="top-five-heading">Top five by verified value</h2></Card.Title>
				<Card.Description>
					Only offers with a known item, bundle value, and point cost qualify for this list.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if data.topOffers.length > 0}
					<ol class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
						{#each data.topOffers as offer (offer.id)}
							<li>
								<Card.Root size="sm" class="h-full">
									<Card.Header>
										<Card.Action>
											<Badge>#{offer.rank}</Badge>
										</Card.Action>
										<div class="grid size-11 place-items-center rounded-lg bg-muted text-muted-foreground">
											{#if offer.iconSrc}
												<img src={offer.iconSrc} alt="" class="size-9 object-contain" />
											{:else}
												<PackageSearchIcon class="size-5" aria-hidden="true" />
											{/if}
										</div>
										<Card.Title><h3>{offerTitle(offer)}</h3></Card.Title>
										<Card.Description>Stage {offer.stageNumber} · Slot {offer.slotNumber}</Card.Description>
									</Card.Header>
									<Card.Content>
										<p class="text-lg font-semibold">{formatEly(offer.elyPerPoint)} / EP</p>
										<p class="mt-1 text-xs text-muted-foreground">
											Bundle value {formatEly(offer.bundleEly)}
										</p>
									</Card.Content>
									<Card.Footer class="flex-wrap justify-between gap-2">
										<span class="text-xs text-muted-foreground">{formatInteger(offer.pointCost)} EP</span>
										<span class="text-xs text-muted-foreground">
											{offer.quantity === null ? 'Quantity pending' : `×${offer.quantity}`}
										</span>
									</Card.Footer>
								</Card.Root>
							</li>
						{/each}
					</ol>
				{:else}
					<Empty.Root class="min-h-56">
						<Empty.Header>
							<Empty.Media variant="icon">
								<CircleDollarSignIcon aria-hidden="true" />
							</Empty.Media>
							<Empty.Title>Pricing is still being verified</Empty.Title>
							<Empty.Description>
								Captured offer details are shown below. The top five will appear when item identities and
								Ely values are verified.
							</Empty.Description>
						</Empty.Header>
					</Empty.Root>
				{/if}
			</Card.Content>
			<Card.Footer>
				<p class="text-xs leading-relaxed text-muted-foreground">
					Value is one lens, not a universal answer. Cosmetics, account-bound rewards, and personal
					progression needs may deserve a different priority.
				</p>
			</Card.Footer>
		</Card.Root>
	</section>

	<Separator class="my-10" />

	<div class="flex flex-col gap-12">
		{#each data.stages as stage (stage.number)}
			<section id={`stage-${stage.number}`} class="scroll-mt-20" aria-labelledby={`stage-${stage.number}-heading`}>
				<div class="flex flex-wrap items-end justify-between gap-3">
					<div>
						<p class="text-sm font-medium text-secondary-foreground">Exchange stage {stage.number}</p>
						<h2 id={`stage-${stage.number}-heading`} class="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
							Stage {stage.number} offers
						</h2>
					</div>
					<div class="flex flex-wrap gap-2">
						<Badge variant="secondary">{stage.capturedCount}/{stage.expectedSlots} captured</Badge>
						<Badge variant="outline">{stage.pricedCount} priced</Badge>
					</div>
				</div>

				{#if stage.offers.length > 0}
					<div class="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{#each stage.offers as offer (offer.id)}
							<Card.Root size="sm" class="h-full">
								<Card.Header>
									<Card.Action>
										<Badge variant={offerStatusVariant(offer)}>{offerStatus(offer)}</Badge>
									</Card.Action>
									<div class="flex min-w-0 items-start gap-3">
										<div class="grid size-11 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
											{#if offer.iconSrc}
												<img src={offer.iconSrc} alt="" class="size-9 object-contain" />
											{:else}
												<PackageSearchIcon class="size-5" aria-hidden="true" />
											{/if}
										</div>
										<div class="min-w-0">
											<Card.Title><h3 class="break-words">{offerTitle(offer)}</h3></Card.Title>
											<Card.Description>
												Slot {offer.slotNumber}{offer.quantity === null ? '' : ` · Bundle ×${offer.quantity}`}
											</Card.Description>
										</div>
									</div>
								</Card.Header>
								<Card.Content>
									<dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
										<div>
											<dt class="text-xs text-muted-foreground">Point cost</dt>
											<dd class="mt-1 font-medium">{formatInteger(offer.pointCost)} EP</dd>
										</div>
										<div>
											<dt class="text-xs text-muted-foreground">Purchase limit</dt>
											<dd class="mt-1 font-medium">{formatInteger(offer.purchaseLimit)}</dd>
										</div>
										<div>
											<dt class="text-xs text-muted-foreground">Bundle value</dt>
											<dd class="mt-1 font-medium">{formatEly(offer.bundleEly)}</dd>
										</div>
										<div>
											<dt class="text-xs text-muted-foreground">Value per EP</dt>
											<dd class="mt-1 font-medium">{formatEly(offer.elyPerPoint)}</dd>
										</div>
									</dl>
								</Card.Content>
								<Card.Footer>
									<p class="text-xs leading-relaxed text-muted-foreground">{offerNote(offer)}</p>
								</Card.Footer>
							</Card.Root>
						{/each}
					</div>
				{:else}
					<Empty.Root class="mt-5 min-h-48 border">
						<Empty.Header>
							<Empty.Media variant="icon"><PackageSearchIcon aria-hidden="true" /></Empty.Media>
							<Empty.Title>No stage data yet</Empty.Title>
							<Empty.Description>This stage is reserved and will appear when its offers are captured.</Empty.Description>
						</Empty.Header>
					</Empty.Root>
				{/if}
			</section>
		{/each}
	</div>

	<Separator class="my-10" />

	<section class="grid gap-5 lg:grid-cols-2" aria-label="Ranking completeness and method">
		<Card.Root>
			<Card.Header>
				<Card.Title><h2>Data completeness</h2></Card.Title>
				<Card.Description>
					See what is captured, identified, and priced before relying on the ranking.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<dl class="grid gap-4 sm:grid-cols-3">
					<div>
						<dt class="text-xs text-muted-foreground">Captured slots</dt>
						<dd class="mt-1 text-xl font-semibold">
							{data.completeness.capturedOffers}/{data.completeness.expectedSlots}
						</dd>
					</div>
					<div>
						<dt class="text-xs text-muted-foreground">Identified items</dt>
						<dd class="mt-1 text-xl font-semibold">{data.completeness.identifiedOffers}</dd>
					</div>
					<div>
						<dt class="text-xs text-muted-foreground">Priced items</dt>
						<dd class="mt-1 text-xl font-semibold">{data.completeness.pricedOffers}</dd>
					</div>
				</dl>

				{#if data.completeness.validationNotes.length > 0}
					<div class="mt-6">
						<p class="text-sm font-medium">Open data notes</p>
						<ul class="mt-2 flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
							{#each data.completeness.validationNotes as note, index (`${index}-${note}`)}
								<li>{note}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</Card.Content>
			<Card.Footer>
				<p class="text-xs text-muted-foreground">
					{data.completeness.capturePercent}% of expected exchange slots are currently captured.
				</p>
			</Card.Footer>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title><h2>Ranking method</h2></Card.Title>
				<Card.Description>{data.methodSummary}</Card.Description>
			</Card.Header>
			<Card.Content>
				<ol class="flex list-decimal flex-col gap-3 pl-5 text-sm leading-relaxed text-muted-foreground">
					{#each data.methodSteps as step, index (`${index}-${step}`)}
						<li>{step}</li>
					{/each}
				</ol>
			</Card.Content>
			<Card.Footer class="flex-wrap justify-between gap-3">
				<p class="text-xs text-muted-foreground">
					{data.event.updatedAt ? `Data updated ${formatDate(data.event.updatedAt)}` : 'Update date pending'}
					· {data.event.source}
				</p>
				{#if data.event.sourceUrl}
					<Button href={data.event.sourceUrl} target="_blank" rel="noreferrer" variant="outline" size="sm">
						View event source
						<ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
					</Button>
				{/if}
			</Card.Footer>
		</Card.Root>
	</section>
</main>
