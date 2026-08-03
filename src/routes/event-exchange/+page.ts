import {
	expandOffers,
	getEventStatus,
	getExchangeCompleteness,
	rankOffers
} from '$lib/event-exchange.js';
import type {
	ExchangeCatalog,
	ExchangeEvent,
	RankedExchangeOffer,
	UnpricedExchangeOffer
} from '$lib/types';
import type { PageLoad } from './$types';

type ExpandedOffer = RankedExchangeOffer | UnpricedExchangeOffer;

function offerId(offer: ExpandedOffer): string {
	return `stage-${offer.stage}-slot-${offer.slot}`;
}

function offerView(offer: ExpandedOffer, rank: number | null) {
	const isPriced = 'elyPerPoint' in offer;

	return {
		id: offerId(offer),
		stageNumber: offer.stage,
		slotNumber: offer.slot,
		name: offer.item.name,
		identified: offer.item.name !== null,
		captured: true,
		iconSrc: offer.icon,
		quantity: offer.quantity,
		pointCost: offer.pointCost,
		purchaseLimit: offer.accountLimit,
		unitEly: offer.item.unitEly,
		bundleEly: isPriced ? offer.bundleEly : null,
		elyPerPoint: isPriced ? offer.elyPerPoint : null,
		rank
	};
}

export const load: PageLoad = async ({ fetch }) => {
	const [catalogResponse, eventResponse] = await Promise.all([
		fetch('/data/event-exchange/catalog.json'),
		fetch('/data/event-exchange/current.json')
	]);

	if (!catalogResponse.ok || !eventResponse.ok) {
		throw new Error('The current event exchange data could not be loaded.');
	}

	const catalog = (await catalogResponse.json()) as ExchangeCatalog;
	const event = (await eventResponse.json()) as ExchangeEvent;
	const allOffers = expandOffers(event, catalog);
	const overallRanking = rankOffers(event, catalog);
	const completeness = getExchangeCompleteness(event);
	const identifiedOffers = allOffers.filter((offer) => offer.item.name !== null).length;
	const validationNotes = event.stages
		.filter((stage) => stage.missingSlots.length > 0)
		.map((stage) => {
			const slots = stage.missingSlots.join(', ');
			return `Stage ${stage.number}: completed slots ${slots} were obscured in the screenshots and are excluded from rankings.`;
		});

	if (identifiedOffers < completeness.captured) {
		validationNotes.push(
			`${completeness.captured - identifiedOffers} captured items still need a confirmed English label.`
		);
	}

	if (overallRanking.length < completeness.captured) {
		validationNotes.push(
			`${completeness.captured - overallRanking.length} captured items still need a confirmed Ely value.`
		);
	}

	return {
		event: {
			id: event.id,
			title: event.title,
			startsAt: event.startDate,
			endsAt: event.endDate,
			updatedAt: event.reviewedAt,
			region: event.region,
			source: event.source,
			sourceUrl: null as string | null,
			status: getEventStatus(event)
		},
		topOffers: overallRanking.slice(0, 5).map((offer, index) => offerView(offer, index + 1)),
		stages: event.stages.map((stage) => {
			const stageRanking = rankOffers(event, catalog, stage.number);
			const rankById = new Map(stageRanking.map((offer, index) => [offerId(offer), index + 1]));
			const offers = allOffers
				.filter((offer) => offer.stage === stage.number)
				.map((offer) => offerView(offer, rankById.get(offerId(offer)) ?? null))
				.sort(
					(left, right) =>
						(left.rank ?? Number.MAX_SAFE_INTEGER) - (right.rank ?? Number.MAX_SAFE_INTEGER) ||
						left.slotNumber - right.slotNumber
				);

			return {
				number: stage.number,
				capturedCount: stage.offers.length,
				expectedSlots: stage.offers.length + stage.missingSlots.length,
				pricedCount: stageRanking.length,
				offers
			};
		}),
		completeness: {
			capturedOffers: completeness.captured,
			expectedSlots: event.expectedOfferCount,
			identifiedOffers,
			pricedOffers: overallRanking.length,
			capturePercent: Math.round((completeness.captured / event.expectedOfferCount) * 100),
			validationNotes
		},
		methodSummary: 'Ely per point = (bundle quantity × confirmed unit Ely) ÷ point cost.',
		methodSteps: [
			'Use the maintainer-confirmed Ely value for one item and multiply it by the bundle quantity.',
			'Divide that bundle value by the event point cost. Higher Ely per point ranks first.',
			'Break ties by bundle value, lower point cost, stage, and in-game slot so results stay deterministic.',
			'Exclude unpriced and obscured offers from ranks while keeping every known gap visible.'
		]
	};
};
