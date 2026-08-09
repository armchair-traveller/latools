<script lang="ts">
	import CalendarDaysIcon from '@lucide/svelte/icons/calendar-days';
	import CircleDollarSignIcon from '@lucide/svelte/icons/circle-dollar-sign';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import PackageSearchIcon from '@lucide/svelte/icons/package-search';
	import ShoppingBasketIcon from '@lucide/svelte/icons/shopping-basket';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
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

	function offerValue(offer: OfferView, value: number | null): string {
		if (offer.valuation === 'unique') return 'No Ely equivalent';
		if (offer.valuation === 'pending') return 'Pending';
		return formatEly(value);
	}

	function offerStatus(offer: OfferView): string {
		if (!offer.identified) return 'Identification pending';
		if (offer.valuation === 'unique') return 'Unique reward';
		if (offer.valuation === 'pending') return 'Pricing pending';
		return offer.rank === null ? 'Priced' : `#${offer.rank} in stage`;
	}

	function eventStatusLabel(status: PageData['event']['status']): string {
		if (status === 'upcoming') return 'Upcoming event';
		if (status === 'ended') return 'Ended event';
		return 'Current event';
	}

	function offerStatusVariant(offer: OfferView): BadgeVariant {
		if (offer.rank !== null && offer.rank <= 5) return 'default';
		return offer.valuation === 'pending' ? 'outline' : 'secondary';
	}

	function offerNote(offer: OfferView): string {
		if (!offer.captured) return 'This exchange slot has not been captured yet.';
		if (!offer.identified) {
			return 'The offer details were captured, but the item still needs a verified identity.';
		}
		if (offer.pointCost === null) return 'The point cost is incomplete, so this offer is not ranked.';
		if (offer.valuation === 'unique') {
			return 'No defensible Ely equivalent exists, so this reward is highlighted separately and excluded from numeric ranks.';
		}
		if (offer.valuation === 'pending') {
			return 'No verified Ely value yet. The offer remains visible but is excluded from the ranking.';
		}
		return offer.rank === null
			? 'Verified pricing is available for this offer.'
			: `Ranked #${offer.rank} in its stage by verified Ely returned per event point.`;
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

<div class="festival-shell">
	<div class="festival-page">
		<header class="festival-hero">
			<div class="festival-burst festival-burst--one" aria-hidden="true"></div>
			<div class="festival-burst festival-burst--two" aria-hidden="true"></div>

			<div class="hero-masthead">
				<p>LaTale Tools · Exchange desk</p>
				<p>2026 event program</p>
			</div>

			<div class="hero-grid">
				<div class="hero-copy">
					<div class="hero-badges">
						<Badge class="festival-badge festival-badge--coral" variant="secondary">
							{eventStatusLabel(data.event.status)}
						</Badge>
						<Badge class="festival-badge festival-badge--ink" variant={data.completeness.pricedOffers > 0 ? 'default' : 'outline'}>
							{data.completeness.pricedOffers > 0 ? 'Ranking live' : 'Pricing pending'}
						</Badge>
					</div>

					<p class="hero-kicker">
						<span class="hero-kicker-icon"><ShoppingBasketIcon aria-hidden="true" /></span>
						The exchange field guide
					</p>
					<h1>{data.event.title}</h1>
					<p class="hero-brief">
						Event exchange ranking across all five stages by verified value per point. Unique rewards
						are separated, and pending offers stay visible instead of receiving a guessed rank.
					</p>
				</div>

				<aside class="capture-panel" aria-label="Event details and capture status">
					<p class="capture-label">Exchange coverage</p>
					<p class="capture-score">
						<strong>{data.completeness.capturedOffers}</strong>
						<span>/ {data.completeness.expectedSlots}</span>
					</p>
					<p class="capture-caption">offers captured</p>
					<div class="capture-track" aria-hidden="true">
						<div class="capture-fill" style:width={`${data.completeness.capturePercent}%`}></div>
					</div>
					<div class="capture-details">
						<p>
							<CalendarDaysIcon aria-hidden="true" />
							<span>{eventWindow(data.event.startsAt, data.event.endsAt)}</span>
						</p>
						<p><span>{data.event.region ?? 'Region pending'}</span><span aria-hidden="true">·</span><span>5 stages</span></p>
					</div>
				</aside>
			</div>
		</header>

		<nav class="stage-ribbon" aria-label="Jump to exchange stage">
			<div class="stage-ribbon-label">
				<span>Program index</span>
				<small>Jump to a stage</small>
			</div>
			<div class="stage-ribbon-links">
				{#each data.stages as stage (stage.number)}
					<Button class="stage-jump" href={`#stage-${stage.number}`} variant="outline" size="sm">
						<span aria-hidden="true">0{stage.number}</span>
						Stage {stage.number}
					</Button>
				{/each}
			</div>
		</nav>

		<section class="ranking-section" aria-labelledby="top-five-heading">
			<div class="section-heading section-heading--ranking">
				<div>
					<p class="section-kicker"><TrophyIcon aria-hidden="true" /> Quick answer</p>
					<h2 id="top-five-heading">Top five by Ely efficiency</h2>
				</div>
				<p>Only offers with a known item, bundle value, and point cost qualify for this list.</p>
			</div>

			{#if data.topOffers.length > 0}
				<ol class="podium-grid">
					{#each data.topOffers as offer (offer.id)}
						<li class="podium-entry" data-rank={offer.rank}>
							<Card.Root size="sm" class="podium-card">
								<Card.Header class="podium-card-header">
									<Card.Action>
										<Badge class="podium-rank">#{offer.rank}</Badge>
									</Card.Action>
									<div class="podium-image">
										{#if offer.iconSrc}
											<img src={offer.iconSrc} alt="" />
										{:else}
											<PackageSearchIcon aria-hidden="true" />
										{/if}
									</div>
									<div class="podium-title-group">
										<Card.Description>Stage {offer.stageNumber} · Slot {offer.slotNumber}</Card.Description>
										<Card.Title><h3>{offerTitle(offer)}</h3></Card.Title>
									</div>
								</Card.Header>
								<Card.Content class="podium-value">
									<p>{formatEly(offer.elyPerPoint)} <span>/ EP</span></p>
									<small>Bundle value {formatEly(offer.bundleEly)}</small>
								</Card.Content>
								<Card.Footer class="podium-footer">
									<span>{formatInteger(offer.pointCost)} EP</span>
									<span>{offer.quantity === null ? 'Quantity pending' : `×${offer.quantity}`}</span>
								</Card.Footer>
							</Card.Root>
						</li>
					{/each}
				</ol>
			{:else}
				<Empty.Root class="festival-empty">
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

			<p class="ranking-note">
				Unique rewards are listed separately below. They are not treated as zero-value or placed at
				the bottom of this ranking.
			</p>
		</section>

		{#if data.uniqueOffers.length > 0}
			<section class="unique-section" aria-labelledby="unique-rewards-heading">
				<div class="unique-intro">
					<div class="unique-symbol" aria-hidden="true"><SparklesIcon /></div>
					<p class="section-kicker">Non-numeric picks</p>
					<h2 id="unique-rewards-heading">Unique rewards</h2>
					<p>
						These items cannot be bought from players, the Cash Shop, or NPCs, so they do not have an
						honest Ely equivalent. Review them separately from the numeric ranking.
					</p>
				</div>

				<div class="unique-grid">
					{#each data.uniqueOffers as offer (offer.id)}
						<Card.Root size="sm" class="unique-card">
							<Card.Header>
								<Card.Action><Badge class="unique-badge" variant="secondary">Unique</Badge></Card.Action>
								<div class="unique-image">
									<img src={offer.iconSrc} alt="" />
								</div>
								<Card.Description>Stage {offer.stageNumber} · Slot {offer.slotNumber}</Card.Description>
								<Card.Title><h3>{offerTitle(offer)}</h3></Card.Title>
								<Card.Description>Bundle ×{offer.quantity}</Card.Description>
							</Card.Header>
							<Card.Content>
								<dl class="unique-stats">
									<div>
										<dt>Point cost</dt>
										<dd>{formatInteger(offer.pointCost)} EP</dd>
									</div>
									<div>
										<dt>Purchase limit</dt>
										<dd>{formatInteger(offer.purchaseLimit)}</dd>
									</div>
								</dl>
							</Card.Content>
							<Card.Footer class="unique-footer">
								<p>No Ely equivalent · not numerically ranked</p>
							</Card.Footer>
						</Card.Root>
					{/each}
				</div>

				<p class="unique-note">
					“Unique” means incomparable, not low priority. Whether to buy one depends on whether you want
					the reward itself.
				</p>
			</section>
		{/if}

		<Separator class="chapter-rule" />

		<div class="stage-chapters">
			{#each data.stages as stage (stage.number)}
				<section
					id={`stage-${stage.number}`}
					class="stage-chapter"
					data-stage={stage.number}
					aria-labelledby={`stage-${stage.number}-heading`}
				>
					<div class="chapter-heading">
						<div class="chapter-number" aria-hidden="true">0{stage.number}</div>
						<div class="chapter-title">
							<p>Exchange stage {stage.number}</p>
							<h2 id={`stage-${stage.number}-heading`}>Stage {stage.number} offers</h2>
						</div>
						<div class="chapter-status" role="group" aria-label={`Stage ${stage.number} completeness`}>
							<Badge class="chapter-badge chapter-badge--filled" variant="secondary">
								{stage.capturedCount}/{stage.expectedSlots} captured
							</Badge>
							<Badge class="chapter-badge" variant="outline">{stage.pricedCount} priced</Badge>
							{#if stage.uniqueCount > 0}
								<Badge class="chapter-badge" variant="outline">{stage.uniqueCount} unique</Badge>
							{/if}
							{#if stage.pendingCount > 0}
								<Badge class="chapter-badge" variant="outline">{stage.pendingCount} pending</Badge>
							{/if}
						</div>
					</div>

					{#if stage.offers.length > 0}
						<div class="offer-grid">
							{#each stage.offers as offer (offer.id)}
								<Card.Root size="sm" class="offer-card">
									<Card.Header class="offer-header">
										<Card.Action>
											<Badge class="offer-status" variant={offerStatusVariant(offer)}>{offerStatus(offer)}</Badge>
										</Card.Action>
										<div class="offer-lead">
											<div class="offer-image">
												{#if offer.iconSrc}
													<img src={offer.iconSrc} alt="" />
												{:else}
													<PackageSearchIcon aria-hidden="true" />
												{/if}
											</div>
											<div class="offer-title">
												<Card.Description>
													Slot {offer.slotNumber}{offer.quantity === null ? '' : ` · Bundle ×${offer.quantity}`}
												</Card.Description>
												<Card.Title><h3>{offerTitle(offer)}</h3></Card.Title>
											</div>
										</div>
									</Card.Header>
									<Card.Content>
										<dl class="offer-stats">
											<div>
												<dt>Point cost</dt>
												<dd>{formatInteger(offer.pointCost)} EP</dd>
											</div>
											<div>
												<dt>Purchase limit</dt>
												<dd>{formatInteger(offer.purchaseLimit)}</dd>
											</div>
											<div>
												<dt>Unit value</dt>
												<dd>{offerValue(offer, offer.unitEly)}</dd>
											</div>
											<div>
												<dt>Bundle value</dt>
												<dd>{offerValue(offer, offer.bundleEly)}</dd>
											</div>
											<div class="offer-stat-featured">
												<dt>Value per EP</dt>
												<dd>{offerValue(offer, offer.elyPerPoint)}</dd>
											</div>
										</dl>
									</Card.Content>
									<Card.Footer class="offer-footer">
										<p>{offerNote(offer)}</p>
									</Card.Footer>
								</Card.Root>
							{/each}
						</div>
					{:else}
						<Empty.Root class="chapter-empty">
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

		<Separator class="chapter-rule chapter-rule--last" />

		<section class="editorial-notes" aria-label="Ranking completeness and method">
			<div class="notes-heading">
				<p>Postscript</p>
				<h2>Read the numbers with confidence.</h2>
			</div>

			<div class="notes-grid">
				<Card.Root class="notes-card notes-card--completeness">
					<Card.Header>
						<Card.Title><h2>Data completeness</h2></Card.Title>
						<Card.Description>
							See what participates in the numeric ranking and what still needs a decision.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<dl class="completeness-grid">
							<div>
								<dt>Captured slots</dt>
								<dd>{data.completeness.capturedOffers}/{data.completeness.expectedSlots}</dd>
							</div>
							<div>
								<dt>Priced items</dt>
								<dd>{data.completeness.pricedOffers}</dd>
							</div>
							<div>
								<dt>Unique items</dt>
								<dd>{data.completeness.uniqueOffers}</dd>
							</div>
							<div>
								<dt>Pending values</dt>
								<dd>{data.completeness.pendingOffers}</dd>
							</div>
						</dl>

						{#if data.completeness.validationNotes.length > 0}
							<div class="data-notes">
								<p>Open data notes</p>
								<ul>
									{#each data.completeness.validationNotes as note, index (`${index}-${note}`)}
										<li>{note}</li>
									{/each}
								</ul>
							</div>
						{/if}
					</Card.Content>
					<Card.Footer class="notes-footer">
						<p>{data.completeness.capturePercent}% of expected exchange slots are currently captured.</p>
					</Card.Footer>
				</Card.Root>

				<Card.Root class="notes-card notes-card--method">
					<Card.Header>
						<Card.Title><h2>Ranking method</h2></Card.Title>
						<Card.Description>{data.methodSummary}</Card.Description>
					</Card.Header>
					<Card.Content>
						<ol class="method-list">
							{#each data.methodSteps as step, index (`${index}-${step}`)}
								<li>{step}</li>
							{/each}
						</ol>
					</Card.Content>
					<Card.Footer class="notes-footer notes-footer--source">
						<p>
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
			</div>
		</section>
	</div>
</div>

<style>
	:global(html) {
		scroll-padding-top: 8.5rem;
	}

	.festival-shell {
		--festival-ink: #27211e;
		--festival-ink-soft: #5f554d;
		--festival-paper: #f5eedf;
		--festival-paper-light: #fffaf0;
		--festival-coral: #e96f57;
		--festival-coral-dark: #a63f30;
		--festival-saffron: #e6a82d;
		--festival-saffron-light: #f7d989;
		--festival-lavender: #cfc0e6;
		--festival-lavender-deep: #65517d;
		--festival-line: rgba(39, 33, 30, 0.18);
		min-height: 100vh;
		color: var(--festival-ink);
		background:
			linear-gradient(rgba(39, 33, 30, 0.028) 1px, transparent 1px),
			linear-gradient(90deg, rgba(39, 33, 30, 0.022) 1px, transparent 1px),
			var(--festival-paper);
		background-size: 28px 28px;
	}

	.festival-page {
		width: min(100%, 82rem);
		margin-inline: auto;
		padding: 1.5rem 1rem 5rem;
	}

	.festival-hero {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		min-height: 34rem;
		padding: clamp(1.25rem, 3.5vw, 3.5rem);
		border: 1px solid var(--festival-ink);
		background:
			radial-gradient(circle at 88% 14%, rgba(230, 168, 45, 0.3), transparent 23%),
			linear-gradient(135deg, rgba(255, 250, 240, 0.97), rgba(247, 217, 137, 0.23)),
			var(--festival-paper-light);
		box-shadow: 0.65rem 0.65rem 0 var(--festival-coral);
	}

	.festival-hero::before,
	.festival-hero::after {
		position: absolute;
		z-index: -1;
		content: '';
	}

	.festival-hero::before {
		top: 0;
		right: clamp(1rem, 6vw, 5rem);
		width: 1px;
		height: 100%;
		background: rgba(39, 33, 30, 0.12);
	}

	.festival-hero::after {
		right: -3.5rem;
		bottom: -5.5rem;
		width: 18rem;
		height: 18rem;
		border: 3.25rem solid var(--festival-lavender);
		border-radius: 999px;
		opacity: 0.78;
	}

	.festival-burst {
		position: absolute;
		z-index: -1;
		width: 7rem;
		height: 7rem;
		background: repeating-conic-gradient(var(--festival-coral) 0deg 8deg, transparent 8deg 18deg);
		clip-path: circle(49%);
		opacity: 0.18;
	}

	.festival-burst--one {
		top: -2.75rem;
		left: 43%;
	}

	.festival-burst--two {
		right: 18%;
		bottom: -3rem;
		width: 10rem;
		height: 10rem;
		background: repeating-conic-gradient(var(--festival-saffron) 0deg 5deg, transparent 5deg 14deg);
	}

	.hero-masthead {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 0.85rem;
		border-bottom: 1px solid var(--festival-ink);
		font-size: 0.67rem;
		font-weight: 750;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.hero-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.65fr) minmax(17rem, 0.72fr);
		gap: clamp(2rem, 6vw, 6rem);
		align-items: end;
		min-height: 27rem;
		padding-top: 2rem;
	}

	.hero-copy {
		max-width: 47rem;
	}

	.hero-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.35rem;
	}

	:global(.festival-page .festival-badge) {
		height: auto;
		padding: 0.38rem 0.7rem;
		border: 1px solid var(--festival-ink);
		border-radius: 0;
		font-size: 0.67rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	:global(.festival-page .festival-badge--coral) {
		color: var(--festival-ink);
		background: var(--festival-coral);
	}

	:global(.festival-page .festival-badge--ink) {
		color: var(--festival-paper-light);
		background: var(--festival-ink);
	}

	.hero-kicker,
	.section-kicker {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.17em;
		text-transform: uppercase;
	}

	.hero-kicker-icon {
		display: grid;
		width: 2.2rem;
		height: 2.2rem;
		place-items: center;
		border-radius: 999px;
		color: var(--festival-paper-light);
		background: var(--festival-coral);
	}

	.hero-kicker-icon :global(svg),
	.section-kicker :global(svg) {
		width: 1rem;
		height: 1rem;
	}

	.hero-copy h1 {
		max-width: 45rem;
		margin: 1.15rem 0 1.5rem;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: clamp(3.4rem, 7.1vw, 6.65rem);
		font-weight: 500;
		line-height: 0.86;
		letter-spacing: -0.065em;
		text-wrap: balance;
	}

	.hero-brief {
		max-width: 42rem;
		padding-left: 1.25rem;
		border-left: 0.3rem solid var(--festival-saffron);
		font-size: clamp(0.95rem, 1.4vw, 1.08rem);
		line-height: 1.75;
		color: var(--festival-ink-soft);
	}

	.capture-panel {
		position: relative;
		padding: 1.6rem;
		border: 1px solid var(--festival-ink);
		background: rgba(255, 250, 240, 0.82);
	}

	.capture-panel::before {
		position: absolute;
		top: -0.55rem;
		right: 1.2rem;
		width: 3.8rem;
		height: 1.05rem;
		content: '';
		transform: rotate(2deg);
		background: rgba(207, 192, 230, 0.78);
	}

	.capture-label,
	.capture-caption {
		font-size: 0.67rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.capture-score {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		margin-top: 0.35rem;
		font-family: Georgia, 'Times New Roman', serif;
	}

	.capture-score strong {
		font-size: clamp(4rem, 8vw, 6.4rem);
		font-weight: 500;
		line-height: 0.9;
		letter-spacing: -0.07em;
	}

	.capture-score span {
		font-size: 1.5rem;
		color: var(--festival-ink-soft);
	}

	.capture-caption {
		margin-top: 0.3rem;
		color: var(--festival-coral-dark);
	}

	.capture-track {
		height: 0.42rem;
		margin: 1.25rem 0 1rem;
		background: rgba(39, 33, 30, 0.14);
	}

	.capture-fill {
		height: 100%;
		background: var(--festival-coral);
	}

	.capture-details {
		display: grid;
		gap: 0.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--festival-line);
		font-size: 0.74rem;
		font-weight: 650;
		line-height: 1.45;
	}

	.capture-details p {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.capture-details :global(svg) {
		width: 1rem;
		height: 1rem;
		color: var(--festival-coral-dark);
	}

	.stage-ribbon {
		position: sticky;
		top: calc(var(--app-topbar-height, 5.25rem) + 0.15rem);
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin: 1.65rem 0 5rem;
		padding: 0.7rem 0.8rem 0.7rem 1rem;
		border: 1px solid var(--festival-ink);
		background: rgba(39, 33, 30, 0.96);
		box-shadow: 0 0.4rem 1.25rem rgba(39, 33, 30, 0.14);
		backdrop-filter: blur(12px);
	}

	.stage-ribbon-label {
		display: grid;
		gap: 0.05rem;
		color: var(--festival-paper-light);
		line-height: 1.2;
	}

	.stage-ribbon-label span {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 1rem;
	}

	.stage-ribbon-label small {
		font-size: 0.56rem;
		font-weight: 750;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		opacity: 0.65;
	}

	.stage-ribbon-links {
		display: flex;
		gap: 0.42rem;
	}

	:global(.festival-page .stage-jump) {
		height: 2.35rem;
		gap: 0.5rem;
		padding-inline: 0.75rem;
		border-color: rgba(255, 250, 240, 0.34);
		border-radius: 0;
		color: var(--festival-paper-light);
		background: transparent;
		font-size: 0.69rem;
	}

	:global(.festival-page .stage-jump:hover) {
		border-color: var(--festival-saffron);
		color: var(--festival-ink);
		background: var(--festival-saffron);
	}

	:global(.festival-page .stage-jump span) {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 0.86rem;
		color: var(--festival-saffron-light);
	}

	:global(.festival-page .stage-jump:hover span) {
		color: inherit;
	}

	.ranking-section {
		margin-bottom: 5rem;
	}

	.section-heading {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.55fr);
		gap: 2rem;
		align-items: end;
		margin-bottom: 1.6rem;
	}

	.section-heading h2,
	.unique-intro h2,
	.notes-heading h2 {
		margin-top: 0.5rem;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: clamp(2.45rem, 4.6vw, 4.5rem);
		font-weight: 500;
		line-height: 0.98;
		letter-spacing: -0.045em;
		text-wrap: balance;
	}

	.section-heading > p {
		max-width: 32rem;
		padding-bottom: 0.35rem;
		font-size: 0.84rem;
		line-height: 1.65;
		color: var(--festival-ink-soft);
	}

	.section-kicker {
		color: var(--festival-coral-dark);
	}

	.podium-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.42fr) repeat(2, minmax(0, 1fr));
		grid-template-rows: repeat(2, minmax(15rem, auto));
		gap: 0.9rem;
		list-style: none;
	}

	.podium-entry[data-rank='1'] {
		grid-row: 1 / span 2;
	}

	:global(.festival-page .podium-card) {
		position: relative;
		height: 100%;
		padding: 0;
		gap: 0;
		border: 1px solid var(--festival-ink);
		border-radius: 0;
		color: var(--festival-ink);
		background: rgba(255, 250, 240, 0.88);
		box-shadow: none;
	}

	.podium-entry[data-rank='1'] :global(.podium-card) {
		background:
			linear-gradient(145deg, rgba(255, 250, 240, 0.94), rgba(247, 217, 137, 0.72)),
			var(--festival-saffron-light);
		box-shadow: 0.5rem 0.5rem 0 var(--festival-saffron);
	}

	:global(.festival-page .podium-card-header) {
		position: relative;
		flex: 1;
		padding: 1rem;
		gap: 0.65rem;
	}

	.podium-entry[data-rank='1'] :global(.podium-card-header) {
		padding: 1.6rem;
	}

	:global(.festival-page .podium-rank) {
		height: 2rem;
		min-width: 2rem;
		border: 1px solid var(--festival-ink);
		border-radius: 999px;
		color: var(--festival-paper-light);
		background: var(--festival-ink);
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 0.9rem;
	}

	.podium-entry[data-rank='1'] :global(.podium-rank) {
		height: 2.75rem;
		min-width: 2.75rem;
		font-size: 1.15rem;
		color: var(--festival-ink);
		background: var(--festival-coral);
	}

	.podium-image {
		position: relative;
		isolation: isolate;
		display: grid;
		width: 4.75rem;
		height: 4.75rem;
		place-items: center;
		border: 1px solid rgba(39, 33, 30, 0.38);
		border-radius: 0.8rem;
		background: color-mix(in oklab, var(--festival-saffron) 13%, var(--festival-paper-light));
		box-shadow: 0.28rem 0.28rem 0 rgba(230, 168, 45, 0.42);
	}

	.podium-entry[data-rank='1'] .podium-image {
		width: 8.75rem;
		height: 8.75rem;
		margin: 1rem auto 1.5rem;
		border-radius: 1.15rem;
		box-shadow:
			0.55rem 0.55rem 0 rgba(230, 168, 45, 0.68),
			inset 0 0 0 0.35rem rgba(255, 250, 240, 0.6);
		transform: rotate(-1.5deg);
	}

	.podium-image img {
		display: block;
		width: 3.8rem;
		height: 3.8rem;
		border-radius: 0.46rem;
		object-fit: contain;
		image-rendering: auto;
		mix-blend-mode: multiply;
	}

	.podium-entry[data-rank='1'] .podium-image img {
		width: 6.5rem;
		height: 6.5rem;
		border-radius: 0.8rem;
	}

	.podium-image :global(svg) {
		width: 2rem;
		height: 2rem;
	}

	.podium-title-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	:global(.festival-page .podium-title-group [data-slot='card-description']) {
		order: -1;
		font-size: 0.62rem;
		font-weight: 750;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--festival-coral-dark);
	}

	:global(.festival-page .podium-title-group h3) {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 1.08rem;
		font-weight: 600;
		line-height: 1.12;
	}

	.podium-entry[data-rank='1'] :global(.podium-title-group h3) {
		font-size: clamp(1.7rem, 3vw, 2.6rem);
		font-weight: 500;
		letter-spacing: -0.035em;
	}

	:global(.festival-page .podium-value) {
		padding: 0.9rem 1rem 1rem;
		border-top: 1px solid var(--festival-line);
	}

	.podium-entry[data-rank='1'] :global(.podium-value) {
		padding: 1.3rem 1.6rem;
	}

	:global(.festival-page .podium-value p) {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 1.35rem;
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.03em;
	}

	.podium-entry[data-rank='1'] :global(.podium-value p) {
		font-size: clamp(2rem, 4vw, 3.4rem);
	}

	:global(.festival-page .podium-value p span) {
		font-family: Inter, sans-serif;
		font-size: 0.64em;
		font-weight: 650;
		letter-spacing: 0;
	}

	:global(.festival-page .podium-value small) {
		display: block;
		margin-top: 0.35rem;
		font-size: 0.67rem;
		color: var(--festival-ink-soft);
	}

	:global(.festival-page .podium-footer) {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.7rem 1rem;
		border-top: 1px solid var(--festival-line);
		background: rgba(39, 33, 30, 0.045);
		font-size: 0.68rem;
		font-weight: 750;
		color: var(--festival-ink-soft);
	}

	.podium-entry[data-rank='1'] :global(.podium-footer) {
		padding-inline: 1.6rem;
	}

	.ranking-note {
		max-width: 44rem;
		margin-top: 1rem;
		font-size: 0.72rem;
		line-height: 1.55;
		color: var(--festival-ink-soft);
	}

	:global(.festival-page .festival-empty) {
		min-height: 16rem;
		border: 1px solid var(--festival-ink);
		border-radius: 0;
		background: var(--festival-paper-light);
	}

	.unique-section {
		position: relative;
		display: grid;
		grid-template-columns: minmax(14rem, 0.72fr) minmax(0, 1.7fr);
		gap: clamp(2rem, 5vw, 4.5rem);
		margin-inline: clamp(-1rem, -2vw, -2rem);
		padding: clamp(2rem, 5vw, 4.5rem);
		border: 1px solid var(--festival-ink);
		background:
			linear-gradient(115deg, rgba(255, 250, 240, 0.34), transparent 46%),
			var(--festival-lavender);
		box-shadow: -0.55rem 0.55rem 0 var(--festival-ink);
	}

	.unique-section::after {
		position: absolute;
		right: 1.2rem;
		bottom: 0.9rem;
		content: '✦  ✦  ✦';
		font-size: 1.25rem;
		letter-spacing: 0.45em;
		color: rgba(39, 33, 30, 0.3);
	}

	.unique-intro {
		align-self: start;
	}

	.unique-symbol {
		display: grid;
		width: 3.4rem;
		height: 3.4rem;
		margin-bottom: 2rem;
		place-items: center;
		border: 1px solid var(--festival-ink);
		border-radius: 999px;
		background: var(--festival-saffron);
	}

	.unique-symbol :global(svg) {
		width: 1.5rem;
		height: 1.5rem;
	}

	.unique-intro h2 {
		font-size: clamp(2.8rem, 5vw, 4.75rem);
	}

	.unique-intro > p:last-child {
		margin-top: 1.25rem;
		font-size: 0.84rem;
		line-height: 1.7;
		color: #44394f;
	}

	.unique-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.8rem;
	}

	:global(.festival-page .unique-card) {
		height: 100%;
		gap: 0;
		padding: 0;
		border: 1px solid var(--festival-ink);
		border-radius: 0;
		color: var(--festival-ink);
		background: rgba(255, 250, 240, 0.78);
		box-shadow: none;
	}

	:global(.festival-page .unique-card [data-slot='card-header']) {
		padding: 1rem;
		gap: 0.3rem;
	}

	:global(.festival-page .unique-card [data-slot='card-title'] h3) {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 1.15rem;
		line-height: 1.14;
	}

	:global(.festival-page .unique-card [data-slot='card-description']) {
		font-size: 0.65rem;
		color: var(--festival-lavender-deep);
	}

	:global(.festival-page .unique-badge) {
		border: 1px solid var(--festival-ink);
		color: var(--festival-paper-light);
		background: var(--festival-lavender-deep);
	}

	.unique-image {
		position: relative;
		isolation: isolate;
		display: grid;
		width: 4.4rem;
		height: 4.4rem;
		margin-bottom: 0.65rem;
		place-items: center;
		border: 1px solid rgba(39, 33, 30, 0.38);
		border-radius: 0.8rem;
		background: color-mix(in oklab, var(--festival-lavender) 28%, var(--festival-paper-light));
		box-shadow: 0.25rem 0.25rem 0 rgba(101, 81, 125, 0.28);
	}

	.unique-image img {
		display: block;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 0.46rem;
		object-fit: contain;
		mix-blend-mode: multiply;
	}

	:global(.festival-page .unique-card [data-slot='card-content']) {
		padding: 0.9rem 1rem;
		border-top: 1px solid var(--festival-line);
	}

	.unique-stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.unique-stats dt,
	.offer-stats dt,
	.completeness-grid dt {
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--festival-ink-soft);
	}

	.unique-stats dd,
	.offer-stats dd {
		margin-top: 0.2rem;
		font-size: 0.78rem;
		font-weight: 700;
	}

	:global(.festival-page .unique-footer) {
		padding: 0.65rem 1rem;
		border-top: 1px solid var(--festival-line);
		background: rgba(101, 81, 125, 0.07);
	}

	:global(.festival-page .unique-footer p),
	.unique-note {
		font-size: 0.64rem;
		line-height: 1.5;
		color: var(--festival-lavender-deep);
	}

	.unique-note {
		grid-column: 2;
		max-width: 38rem;
		padding-top: 0.35rem;
	}

	:global(.festival-page .chapter-rule) {
		margin-block: 7rem 5rem;
		background: var(--festival-ink);
	}

	.stage-chapters {
		display: flex;
		flex-direction: column;
		gap: 7rem;
	}

	.stage-chapter {
		scroll-margin-top: 8.5rem;
	}

	.chapter-heading {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: 1.35rem;
		align-items: end;
		margin-bottom: 1.75rem;
		padding-bottom: 1.2rem;
		border-bottom: 1px solid var(--festival-ink);
	}

	.chapter-number {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: clamp(3.7rem, 6vw, 6.4rem);
		font-weight: 500;
		line-height: 0.72;
		letter-spacing: -0.08em;
		color: var(--chapter-accent, var(--festival-coral));
	}

	.stage-chapter[data-stage='2'] {
		--chapter-accent: #c17b23;
	}

	.stage-chapter[data-stage='3'] {
		--chapter-accent: var(--festival-lavender-deep);
		--chapter-contrast: var(--festival-paper-light);
	}

	.stage-chapter[data-stage='4'] {
		--chapter-accent: #c14d43;
		--chapter-contrast: var(--festival-paper-light);
	}

	.stage-chapter[data-stage='5'] {
		--chapter-accent: #8b6320;
		--chapter-contrast: var(--festival-paper-light);
	}

	.chapter-title p {
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--chapter-accent, var(--festival-coral-dark));
	}

	.chapter-title h2 {
		margin-top: 0.2rem;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: clamp(2rem, 4vw, 3.25rem);
		font-weight: 500;
		line-height: 1;
		letter-spacing: -0.045em;
	}

	.chapter-status {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 0.4rem;
	}

	:global(.festival-page .chapter-badge) {
		height: auto;
		padding: 0.3rem 0.55rem;
		border-color: var(--festival-ink);
		border-radius: 0;
		color: var(--festival-ink);
		background: transparent;
		font-size: 0.62rem;
	}

	:global(.festival-page .chapter-badge--filled) {
		color: var(--chapter-contrast, var(--festival-ink));
		background: var(--chapter-accent, var(--festival-coral));
	}

	.offer-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
	}

	:global(.festival-page .offer-card) {
		height: 100%;
		gap: 0;
		padding: 0;
		border: 1px solid var(--festival-line);
		border-top: 0.3rem solid var(--chapter-accent, var(--festival-coral));
		border-radius: 0;
		color: var(--festival-ink);
		background: rgba(255, 250, 240, 0.76);
		box-shadow: 0 0.35rem 0 rgba(39, 33, 30, 0.06);
	}

	:global(.festival-page .offer-header) {
		padding: 1rem;
		gap: 0.75rem;
	}

	:global(.festival-page .offer-status) {
		max-width: 9.5rem;
		height: auto;
		padding-block: 0.24rem;
		border-color: var(--festival-line);
		border-radius: 0;
		font-size: 0.58rem;
		line-height: 1.15;
		white-space: normal;
		text-align: center;
	}

	.offer-lead {
		display: flex;
		align-items: flex-start;
		gap: 0.85rem;
		min-width: 0;
		padding-top: 0.55rem;
	}

	.offer-image {
		position: relative;
		isolation: isolate;
		display: grid;
		width: 4rem;
		height: 4rem;
		flex: 0 0 auto;
		place-items: center;
		border: 1px solid rgba(39, 33, 30, 0.38);
		border-radius: 0.8rem;
		background: color-mix(
			in oklab,
			var(--chapter-accent, var(--festival-coral)) 13%,
			var(--festival-paper-light)
		);
		box-shadow: 0.22rem 0.22rem 0
			color-mix(in oklab, var(--chapter-accent, var(--festival-coral)) 34%, transparent);
	}

	.offer-image img {
		display: block;
		width: 3.15rem;
		height: 3.15rem;
		border-radius: 0.46rem;
		object-fit: contain;
		mix-blend-mode: multiply;
	}

	.offer-image :global(svg) {
		width: 1.6rem;
		height: 1.6rem;
		color: var(--festival-ink-soft);
	}

	.offer-title {
		min-width: 0;
		padding-top: 0.2rem;
	}

	:global(.festival-page .offer-title [data-slot='card-description']) {
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		color: var(--chapter-accent, var(--festival-coral-dark));
	}

	:global(.festival-page .offer-title h3) {
		margin-top: 0.28rem;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 1.18rem;
		font-weight: 600;
		line-height: 1.15;
		overflow-wrap: anywhere;
	}

	:global(.festival-page .offer-card [data-slot='card-content']) {
		padding: 0 1rem 1rem;
	}

	.offer-stats {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		border-top: 1px solid var(--festival-line);
		border-left: 1px solid var(--festival-line);
	}

	.offer-stats > div {
		min-width: 0;
		padding: 0.7rem;
		border-right: 1px solid var(--festival-line);
		border-bottom: 1px solid var(--festival-line);
	}

	.offer-stats dd {
		overflow-wrap: anywhere;
	}

	.offer-stats .offer-stat-featured {
		grid-column: 1 / -1;
		background: color-mix(in srgb, var(--chapter-accent, var(--festival-coral)) 12%, transparent);
	}

	.offer-stats .offer-stat-featured dd {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 1.08rem;
	}

	:global(.festival-page .offer-footer) {
		padding: 0.75rem 1rem;
		border-top: 1px solid var(--festival-line);
		background: rgba(39, 33, 30, 0.035);
	}

	:global(.festival-page .offer-footer p) {
		font-size: 0.64rem;
		line-height: 1.55;
		color: var(--festival-ink-soft);
	}

	:global(.festival-page .chapter-empty) {
		min-height: 12rem;
		border: 1px solid var(--festival-line);
		border-radius: 0;
		background: rgba(255, 250, 240, 0.72);
	}

	:global(.festival-page .chapter-rule--last) {
		margin-bottom: 4rem;
	}

	.editorial-notes {
		padding: clamp(1.5rem, 4vw, 3rem);
		border: 1px solid var(--festival-ink);
		background: var(--festival-ink);
		color: var(--festival-paper-light);
	}

	.notes-heading {
		display: grid;
		grid-template-columns: 8rem minmax(0, 1fr);
		gap: 1.5rem;
		align-items: start;
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid rgba(255, 250, 240, 0.3);
	}

	.notes-heading > p {
		padding-top: 0.45rem;
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--festival-saffron-light);
	}

	.notes-heading h2 {
		max-width: 47rem;
		margin: 0;
		font-size: clamp(2.1rem, 4.5vw, 4rem);
	}

	.notes-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	:global(.festival-page .notes-card) {
		gap: 0;
		padding: 0;
		border: 1px solid rgba(255, 250, 240, 0.32);
		border-radius: 0;
		color: var(--festival-paper-light);
		background: rgba(255, 250, 240, 0.07);
		box-shadow: none;
	}

	:global(.festival-page .notes-card [data-slot='card-header']) {
		padding: 1.25rem;
		border-bottom: 1px solid rgba(255, 250, 240, 0.2);
	}

	:global(.festival-page .notes-card [data-slot='card-title'] h2) {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 1.7rem;
		font-weight: 500;
	}

	:global(.festival-page .notes-card [data-slot='card-description']) {
		color: rgba(255, 250, 240, 0.66);
	}

	:global(.festival-page .notes-card [data-slot='card-content']) {
		padding: 1.25rem;
	}

	.completeness-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		border-top: 1px solid rgba(255, 250, 240, 0.22);
		border-left: 1px solid rgba(255, 250, 240, 0.22);
	}

	.completeness-grid > div {
		padding: 0.85rem;
		border-right: 1px solid rgba(255, 250, 240, 0.22);
		border-bottom: 1px solid rgba(255, 250, 240, 0.22);
	}

	.completeness-grid dt {
		color: rgba(255, 250, 240, 0.55);
	}

	.completeness-grid dd {
		margin-top: 0.25rem;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 1.55rem;
	}

	.data-notes {
		margin-top: 1.25rem;
		padding: 1rem;
		border-left: 0.25rem solid var(--festival-coral);
		background: rgba(255, 250, 240, 0.06);
	}

	.data-notes > p {
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.data-notes ul,
	.method-list {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		margin-top: 0.8rem;
		padding-left: 1.15rem;
		font-size: 0.72rem;
		line-height: 1.55;
		color: rgba(255, 250, 240, 0.68);
	}

	.method-list {
		margin-top: 0;
		gap: 0.9rem;
		list-style: decimal-leading-zero;
	}

	.method-list li::marker {
		font-family: Georgia, 'Times New Roman', serif;
		color: var(--festival-saffron-light);
	}

	:global(.festival-page .notes-footer) {
		padding: 0.85rem 1.25rem;
		border-top: 1px solid rgba(255, 250, 240, 0.2);
		background: rgba(0, 0, 0, 0.12);
	}

	:global(.festival-page .notes-footer p) {
		font-size: 0.65rem;
		line-height: 1.5;
		color: rgba(255, 250, 240, 0.62);
	}

	:global(.festival-page .notes-footer--source) {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.8rem;
	}

	@media (max-width: 70rem) {
		.festival-page {
			padding-inline: 1.25rem;
		}

		.hero-grid {
			grid-template-columns: minmax(0, 1.45fr) minmax(15rem, 0.7fr);
			gap: 2rem;
		}

		.podium-grid {
			grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
			grid-template-rows: none;
		}

		.podium-entry[data-rank='1'] {
			grid-row: 1 / span 2;
		}

		.offer-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.completeness-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 52rem) {
		.festival-page {
			padding: 1rem 0.85rem 4rem;
		}

		.festival-hero {
			min-height: 0;
			box-shadow: 0.35rem 0.35rem 0 var(--festival-coral);
		}

		.hero-grid {
			grid-template-columns: 1fr;
			min-height: 0;
		}

		.hero-copy h1 {
			font-size: clamp(3.15rem, 14vw, 5.4rem);
		}

		.capture-panel {
			max-width: 27rem;
		}

		.stage-ribbon {
			align-items: stretch;
			margin-bottom: 4rem;
			padding: 0.55rem;
		}

		.stage-ribbon-label {
			display: none;
		}

		.stage-ribbon-links {
			display: grid;
			grid-template-columns: repeat(5, minmax(0, 1fr));
			width: 100%;
		}

		:global(.festival-page .stage-jump) {
			min-width: 0;
			padding-inline: 0.25rem;
			font-size: 0;
		}

		:global(.festival-page .stage-jump span) {
			font-size: 0.8rem;
		}

		.section-heading {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}

		.podium-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.podium-entry[data-rank='1'] {
			grid-column: 1 / -1;
			grid-row: auto;
		}

		.unique-section {
			grid-template-columns: 1fr;
			margin-inline: 0;
			box-shadow: -0.35rem 0.35rem 0 var(--festival-ink);
		}

		.unique-note {
			grid-column: auto;
		}

		.chapter-heading {
			grid-template-columns: auto minmax(0, 1fr);
		}

		.chapter-status {
			grid-column: 1 / -1;
			justify-content: flex-start;
		}

		.notes-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 36rem) {
		.hero-masthead p:last-child {
			display: none;
		}

		.hero-copy h1 {
			font-size: clamp(2.85rem, 15vw, 4.25rem);
		}

		.podium-grid,
		.unique-grid,
		.offer-grid {
			grid-template-columns: 1fr;
		}

		.podium-entry[data-rank='1'] {
			grid-column: auto;
		}

		.podium-entry[data-rank='1'] .podium-image {
			width: 8.25rem;
			height: 8.25rem;
		}

		.podium-entry[data-rank='1'] .podium-image img {
			width: 6.15rem;
			height: 6.15rem;
		}

		.chapter-heading {
			gap: 0.85rem;
		}

		.notes-heading {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}

		.completeness-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
