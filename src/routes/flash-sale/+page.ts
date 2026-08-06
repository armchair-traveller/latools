import { error } from '@sveltejs/kit';
import {
	evaluateFlashSaleCycle,
	getFlashSaleCompleteness,
	getFlashSaleCycleStatus,
	getFlashSaleTimeline,
	rankFlashSaleCycle
} from '$lib/flash-sale.js';
import type {
	EvaluatedFlashSaleOffer,
	FlashSaleAnalysis,
	FlashSaleCatalog,
	FlashSaleIndex,
	FlashSaleSource
} from '$lib/types';
import type { PageLoad } from './$types';

type OfferValuation = 'exact' | 'partial' | 'unique' | 'pending' | 'unverified';

function daysBetween(earlier: string | null, later: string): number | null {
	if (!earlier) return null;
	const start = new Date(earlier).getTime();
	const end = new Date(later).getTime();
	if (Number.isNaN(start) || Number.isNaN(end)) return null;
	return Math.max(0, Math.floor((end - start) / 86_400_000));
}

function confidenceLabel(confidence: 'high' | 'medium' | 'low' | null): string {
	if (!confidence) return 'Not rated';
	return `${confidence[0].toUpperCase()}${confidence.slice(1)} confidence`;
}

function offerValuation(offer: EvaluatedFlashSaleOffer): OfferValuation {
	if (offer.valuationState === 'exact') return 'exact';
	if (offer.valuationState === 'partial') return 'partial';
	if (offer.capture.status !== 'verified') return 'unverified';

	const componentStates = offer.components.map((component) => component.valuation.status);
	if (componentStates.length > 0 && componentStates.every((status) => status === 'unique')) {
		return 'unique';
	}
	if (componentStates.includes('pending')) return 'pending';
	if (componentStates.includes('unique')) return 'unique';
	return 'pending';
}

function sourceMap(sale: FlashSaleAnalysis, catalog: FlashSaleCatalog): Map<string, FlashSaleSource> {
	return new Map([...catalog.sources, ...sale.sources].map((source) => [source.id, source]));
}

function uniqueSources(
	sale: FlashSaleAnalysis,
	catalog: FlashSaleCatalog
): Array<{ id: string; label: string; url: string }> {
	const links = new Map<string, { id: string; label: string; url: string }>();
	links.set(sale.sourceUrl, {
		id: `official-post-${sale.postId}`,
		label: 'Official sale post',
		url: sale.sourceUrl
	});

	for (const source of [...sale.sources, ...catalog.sources]) {
		if (!links.has(source.url)) {
			links.set(source.url, { id: source.id, label: source.title, url: source.url });
		}
	}

	return [...links.values()];
}

function latestValuationDate(sale: FlashSaleAnalysis): string | null {
	const dates = sale.valuationSnapshot
		.map((valuation) => valuation.asOf)
		.filter((value): value is string => value !== null)
		.sort();
	return dates.at(-1) ?? null;
}

function componentView(
	offerId: string,
	component: EvaluatedFlashSaleOffer['components'][number],
	index: number,
	sources: Map<string, FlashSaleSource>,
	reviewedAt: string
) {
	const citedSources = component.valuation.sourceIds
		.map((sourceId) => sources.get(sourceId))
		.filter((source): source is FlashSaleSource => source !== undefined);

	return {
		id: `${offerId}-${index}-${component.itemId}`,
		itemId: component.itemId,
		name: component.item.name,
		quantity: component.quantity,
		valuation: component.valuation.status,
		unitEly: component.valuation.unitEly,
		bundleEly: component.componentEly,
		confidence: confidenceLabel(component.valuation.confidence),
		priceUpdatedAt: component.valuation.asOf,
		evidenceAgeDays: daysBetween(component.valuation.asOf, reviewedAt),
		source: citedSources.map((source) => source.title).join(', ') || 'No cited source',
		evidence: component.valuation.note || 'No additional valuation note.'
	};
}

function offerView(
	offer: EvaluatedFlashSaleOffer,
	sources: Map<string, FlashSaleSource>,
	reviewedAt: string
) {
	const valuation = offerValuation(offer);

	return {
		id: offer.id,
		slot: offer.slot,
		name: offer.name,
		note: offer.capture.note || null,
		priceLtc: offer.salePriceLtc,
		purchaseLimit: offer.purchaseLimit?.quantity ?? null,
		purchaseLimitScope: offer.purchaseLimit?.scope ?? null,
		valuation,
		rank: valuation === 'exact' ? offer.rank : null,
		bundleEly: valuation === 'exact' ? offer.bundleEly : null,
		knownEly: offer.knownBundleEly,
		lowerBoundEly: valuation === 'partial' ? offer.knownBundleEly : null,
		elyPerLtc: valuation === 'exact' ? offer.elyPerLtc : null,
		lowerBoundElyPerLtc: valuation === 'partial' ? offer.lowerBoundElyPerLtc : null,
		components: offer.components.map((component, index) =>
			componentView(offer.id, component, index, sources, reviewedAt)
		),
		bestFor: offer.bestFor.trim() ? [offer.bestFor] : [],
		skipIf: offer.skipIf.trim() ? [offer.skipIf] : [],
		caveats: offer.caveats
	};
}

function valuationOrder(value: OfferValuation): number {
	if (value === 'exact') return 0;
	if (value === 'partial') return 1;
	if (value === 'unique') return 2;
	if (value === 'pending') return 3;
	return 4;
}

function summarizeValuations(offers: Array<{ valuation: OfferValuation }>) {
	return {
		exactOffers: offers.filter((offer) => offer.valuation === 'exact').length,
		partialOffers: offers.filter((offer) => offer.valuation === 'partial').length,
		uniqueOffers: offers.filter((offer) => offer.valuation === 'unique').length,
		pendingOffers: offers.filter((offer) => offer.valuation === 'pending').length,
		unverifiedOffers: offers.filter((offer) => offer.valuation === 'unverified').length
	};
}

function cycleStatus(status: ReturnType<typeof getFlashSaleCycleStatus>) {
	return status === 'active' ? ('current' as const) : status;
}

export const load: PageLoad = async ({ fetch }) => {
	const [indexResponse, catalogResponse] = await Promise.all([
		fetch('/data/flash-sale/index.json'),
		fetch('/data/flash-sale/catalog.json')
	]);

	if (!indexResponse.ok || !catalogResponse.ok) {
		error(502, 'The flash sale index or catalog could not be loaded.');
	}

	const index = (await indexResponse.json()) as FlashSaleIndex;
	const catalog = (await catalogResponse.json()) as FlashSaleCatalog;
	const currentSummary = index.sales.find((sale) => sale.id === index.currentSaleId);
	if (!currentSummary) error(500, 'The current flash sale pointer is invalid.');

	const saleResponse = await fetch(`/data/flash-sale/sales/${encodeURIComponent(index.currentSaleId)}.json`);
	if (!saleResponse.ok) error(502, 'The current flash sale snapshot could not be loaded.');

	const sale = (await saleResponse.json()) as FlashSaleAnalysis;
	if (sale.cycles.length === 0) error(500, 'The current flash sale has no sale cycles.');

	const timeline = getFlashSaleTimeline(sale);
	const rawCompleteness = getFlashSaleCompleteness(sale, catalog);
	const sources = sourceMap(sale, catalog);
	const cycleViews = sale.cycles.map((cycle) => {
		const evaluated = evaluateFlashSaleCycle(sale, catalog, cycle.id);
		const ranked = rankFlashSaleCycle(sale, catalog, cycle.id);
		const rankById = new Map(ranked.map((offer) => [offer.id, offer.rank]));
		const offers = evaluated
			.map((offer) => offerView({ ...offer, rank: rankById.get(offer.id) ?? null }, sources, sale.reviewedAt))
			.sort(
				(left, right) =>
					(left.rank ?? Number.MAX_SAFE_INTEGER) - (right.rank ?? Number.MAX_SAFE_INTEGER) ||
					valuationOrder(left.valuation) - valuationOrder(right.valuation) ||
					left.slot - right.slot ||
					left.id.localeCompare(right.id)
			);
		const counts = summarizeValuations(offers);

		return {
			id: cycle.id,
			label: cycle.label,
			startsAt: cycle.startsAt,
			endsAt: cycle.endsAt,
			status: cycleStatus(getFlashSaleCycleStatus(cycle)),
			expectedOffers: cycle.expectedOfferCount,
			capturedOffers: cycle.offers.length,
			...counts,
			offers
		};
	});
	const allOffers = cycleViews.flatMap((cycle) => cycle.offers);
	const counts = summarizeValuations(allOffers);
	const currentCycleId =
		timeline.activeCycleId ??
		timeline.nextCycleId ??
		[...sale.cycles].sort(
			(left, right) => new Date(right.endsAt).getTime() - new Date(left.endsAt).getTime()
		)[0].id;
	const notes: string[] = [];
	if (rawCompleteness.unresolved > 0) {
		notes.push(
			`${rawCompleteness.unresolved} expected offer ${rawCompleteness.unresolved === 1 ? 'slot is' : 'slots are'} unresolved and excluded.`
		);
	}
	if (counts.partialOffers > 0) {
		notes.push(
			`${counts.partialOffers} ${counts.partialOffers === 1 ? 'offer has' : 'offers have'} a lower bound but not an exact rank.`
		);
	}
	if (counts.pendingOffers + counts.unverifiedOffers > 0) {
		const attentionCount = counts.pendingOffers + counts.unverifiedOffers;
		notes.push(
			`${attentionCount} captured ${attentionCount === 1 ? 'offer still needs' : 'offers still need'} valuation or evidence review.`
		);
	}

	return {
		meta: {
			id: sale.id,
			title: sale.title,
			status:
				timeline.status === 'upcoming'
					? ('upcoming' as const)
					: timeline.status === 'ended'
						? ('ended' as const)
						: ('current' as const),
			startsAt: currentSummary.startsAt,
			endsAt: currentSummary.endsAt,
			region: sale.region,
			currency: sale.currency,
			timeZone: sale.timezone,
			sourcePostId: String(sale.postId)
		},
		currentCycleId,
		cycleViews,
		completeness: {
			expectedOffers: sale.expectedOfferCount,
			capturedOffers: rawCompleteness.captured,
			...counts,
			percent:
				sale.expectedOfferCount === 0
					? 100
					: Math.round((rawCompleteness.captured / sale.expectedOfferCount) * 100),
			notes
		},
		review: {
			reviewedAt: sale.reviewedAt,
			valuationAsOf: latestValuationDate(sale),
			captureStatus:
				rawCompleteness.unresolved === 0 && counts.unverifiedOffers === 0
					? 'Verified capture'
					: 'Review required',
			sourceFingerprint: sale.sourceFingerprint
		},
		sources: uniqueSources(sale, catalog),
		methodSummary: 'Objective Ely/LTC = reviewed bundle Ely ÷ sale price in LTC.',
		methodSteps: [
			'Expand every offer into its component items and quantities using the reviewed sale snapshot.',
			'Sum only frozen numeric component valuations. Rank an offer only when every component and its capture are verified.',
			'Rank exact offers inside their own cycle by Ely/LTC, then bundle Ely, lower LTC price, and source order.',
			'Show partial bundles as lower bounds and keep unique, pending, or uncertain offers visible without an invented rank.'
		],
		calculation: {
			sale,
			catalog,
			cycles: sale.cycles
		}
	};
};
