<script lang="ts">
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import PackageSearchIcon from '@lucide/svelte/icons/package-search';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	type OverviewOffer = {
		id: string;
		name: string;
		rank: number | null;
		valuation: string;
		statusLabel: string;
		price: string;
		bundle: string;
		efficiency: string;
		stock: string;
		stockScope: string;
		contents: { name: string; quantity: number | null }[];
		personalRank?: number | null;
		personalBundle?: string;
		personalEfficiency?: string;
	};

	let {
		offers,
		personal,
		oninspect
	}: {
		offers: OverviewOffer[];
		personal: boolean;
		oninspect: (id: string) => void;
	} = $props();

	function contentLabel(item: OverviewOffer['contents'][number]): string {
		return item.quantity === null ? item.name : `${item.name} ×${item.quantity}`;
	}
</script>

<div class="offer-overview">
	<ul class="overview-grid" aria-label="Flash sale offers">
		{#each offers as offer (offer.id)}
			<li class="overview-item">
				<Card.Root
					class="overview-card"
					data-rank={offer.rank ?? 'unranked'}
					data-valuation={offer.valuation}
				>
					<Card.Header class="overview-card__header">
						<div class="overview-identity">
							<div class="overview-icon"><PackageSearchIcon aria-hidden="true" /></div>
							<div class="overview-heading">
								<Card.Title><h3 class="overview-title">{offer.name}</h3></Card.Title>
								<div class="overview-badges">
									<Badge variant={offer.rank !== null ? 'secondary' : 'outline'}>
										{offer.rank !== null ? `#${offer.rank} ${offer.statusLabel}` : offer.statusLabel}
									</Badge>
									{#if personal && offer.personalRank != null}
										<Badge variant="outline">Personal #{offer.personalRank}</Badge>
									{/if}
								</div>
							</div>
						</div>
					</Card.Header>

					<Card.Content class="overview-card__content">
						<dl class="overview-metrics">
							<div class="overview-metric">
								<dt>Price</dt>
								<dd>{offer.price}</dd>
							</div>
							<div class="overview-metric overview-metric--efficiency">
								<dt>Objective Ely / LTC</dt>
								<dd>{offer.efficiency}</dd>
							</div>
						</dl>
						<p class="overview-value"><span>Objective value</span><strong>{offer.bundle}</strong></p>
						<div class="overview-contents" aria-label="Bundle contents preview">
							{#each offer.contents.slice(0, 2) as item, index (`${offer.id}-${index}`)}
								<p class="overview-content-line">
									<span class="truncate" title={contentLabel(item)}>{contentLabel(item)}</span>
									{#if index === 1 && offer.contents.length > 2}
										<span class="overview-more" aria-label={`${offer.contents.length - 2} more item types in details`}>+{offer.contents.length - 2} more</span>
									{/if}
								</p>
							{/each}
						</div>
						{#if personal}
							<div class="overview-personal">
								<span>Your estimate</span>
								<strong>{offer.personalBundle ?? 'Not valued'}</strong>
								<span>{offer.personalEfficiency ?? 'Not ranked'}</span>
							</div>
						{/if}
					</Card.Content>

					<Card.Footer class="overview-card__footer">
						<div class="overview-stock">
							<p>Stock / limit <strong>{offer.stock}</strong></p>
							{#if offer.stockScope}<span>{offer.stockScope}</span>{/if}
						</div>
						<Button
							variant="outline"
							size="sm"
							class="min-h-10 shrink-0"
							aria-label={`View details for ${offer.name}`}
							onclick={() => oninspect(offer.id)}
						>
							View details
							<ChevronRightIcon data-icon="inline-end" aria-hidden="true" />
						</Button>
					</Card.Footer>
				</Card.Root>
			</li>
		{/each}
	</ul>
</div>

<style>
	.offer-overview {
		container: offer-overview / inline-size;
		min-width: 0;
	}

	.overview-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.1rem;
		margin: 0;
		padding: 0 0.4rem 0.4rem 0;
		list-style: none;
	}

	.overview-item {
		display: flex;
		min-width: 0;
	}

	.offer-overview :global(.overview-card) {
		--card-spacing: 0.85rem;
		--overview-accent: color-mix(in oklab, var(--foreground) 18%, var(--card));
		width: 100%;
		gap: 0.65rem;
		border: 2px solid var(--festa-plum, var(--foreground));
		border-radius: 1.25rem;
		background: linear-gradient(145deg, var(--card) 20%, color-mix(in oklab, var(--overview-accent) 13%, var(--card)));
		box-shadow: 0.3rem 0.3rem 0 var(--overview-accent);
	}

	.offer-overview :global(.overview-card[data-rank='1']) {
		--overview-accent: var(--festa-yellow, var(--secondary));
	}

	.offer-overview :global(.overview-card[data-rank='2']) {
		--overview-accent: var(--festa-cyan, var(--accent));
	}

	.offer-overview :global(.overview-card[data-rank='3']) {
		--overview-accent: color-mix(in oklab, var(--festa-pink, var(--primary)) 55%, var(--card));
	}

	.offer-overview :global(.overview-card[data-rank='unranked']) {
		--overview-accent: color-mix(in oklab, var(--festa-purple, var(--primary)) 45%, var(--card));
	}

	.offer-overview :global(.overview-card__header) {
		display: block;
	}

	.overview-identity {
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		min-width: 0;
	}

	.overview-icon {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		width: 2.1rem;
		height: 2.1rem;
		border: 1.5px solid var(--festa-plum, var(--foreground));
		border-radius: 0.65rem;
		background: color-mix(in oklab, var(--overview-accent) 60%, var(--card));
		box-shadow: 0.12rem 0.12rem 0 var(--festa-plum, var(--foreground));
		color: var(--foreground);
	}

	.overview-icon :global(svg) {
		width: 1.05rem;
		height: 1.05rem;
	}

	.overview-heading {
		min-width: 0;
		flex: 1;
	}

	.overview-title {
		margin: 0;
		font-family: ui-rounded, 'Arial Rounded MT Bold', 'Inter Variable', sans-serif;
		font-size: 0.975rem;
		font-weight: 800;
		line-height: 1.25;
		letter-spacing: -0.02em;
		overflow-wrap: anywhere;
	}

	.overview-badges {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.3rem;
		margin-top: 0.35rem;
	}

	.offer-overview :global(.overview-card__content) {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 0.45rem;
		min-width: 0;
	}

	.overview-metrics {
		display: grid;
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		gap: 0.5rem;
		margin: 0;
	}

	.overview-metric {
		min-width: 0;
		padding: 0.4rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: 0.7rem;
		background: color-mix(in oklab, var(--card) 82%, var(--secondary));
	}

	.overview-metric--efficiency {
		border-color: color-mix(in oklab, var(--primary) 30%, var(--border));
		background: color-mix(in oklab, var(--festa-yellow, var(--secondary)) 35%, var(--card));
	}

	.overview-metric dt {
		color: var(--muted-foreground);
		font-size: 0.6875rem;
		line-height: 1.35;
	}

	.overview-metric dd {
		margin: 0.15rem 0 0;
		font-size: 0.975rem;
		font-weight: 800;
		line-height: 1.3;
		font-variant-numeric: tabular-nums;
		overflow-wrap: anywhere;
	}

	.overview-value {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.1rem 0.5rem;
		margin: 0;
		font-size: 0.75rem;
		line-height: 1.4;
		color: var(--muted-foreground);
	}

	.overview-value strong {
		color: var(--foreground);
		font-weight: 650;
		font-variant-numeric: tabular-nums;
		overflow-wrap: anywhere;
	}

	.overview-contents {
		min-height: 2.1rem;
		color: var(--muted-foreground);
		font-size: 0.75rem;
		line-height: 1.4;
	}

	.overview-content-line {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		min-width: 0;
		margin: 0;
	}

	.overview-more {
		flex: 0 0 auto;
		color: var(--primary);
		font-weight: 650;
	}

	.overview-personal {
		display: flex;
		flex-wrap: wrap;
		gap: 0.15rem 0.5rem;
		padding-top: 0.4rem;
		border-top: 1px dashed var(--border);
		color: var(--muted-foreground);
		font-size: 0.75rem;
		line-height: 1.4;
	}

	.overview-personal strong {
		color: var(--foreground);
	}

	.offer-overview :global(.overview-card__footer) {
		justify-content: space-between;
		gap: 0.5rem;
		padding-block: 0.45rem;
		border-top: 1px dashed var(--border);
		background: color-mix(in oklab, var(--overview-accent) 8%, var(--card));
	}

	.overview-stock {
		min-width: 0;
		color: var(--muted-foreground);
		font-size: 0.6875rem;
		line-height: 1.4;
		overflow-wrap: anywhere;
	}

	.overview-stock p {
		margin: 0;
	}

	.overview-stock strong {
		margin-left: 0.2rem;
		color: var(--foreground);
		font-size: 0.8125rem;
		font-weight: 750;
	}

	@container offer-overview (min-width: 40rem) {
		.overview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
	}

	@container offer-overview (min-width: 60rem) {
		.overview-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
	}
</style>
