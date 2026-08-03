// @ts-check

/** @typedef {import('$lib/types').ExchangeCatalog} ExchangeCatalog */
/** @typedef {import('$lib/types').ExchangeCatalogItem} ExchangeCatalogItem */
/** @typedef {import('$lib/types').ExchangeEvent} ExchangeEvent */
/** @typedef {import('$lib/types').ExchangeCompleteness} ExchangeCompleteness */
/** @typedef {import('$lib/types').RankedExchangeOffer} RankedExchangeOffer */
/** @typedef {import('$lib/types').UnrankedExchangeOffer} UnrankedExchangeOffer */

/**
 * @param {ExchangeCatalog} catalog
 * @returns {Map<string, ExchangeCatalogItem>}
 */
function catalogById(catalog) {
	return new Map(catalog.items.map((item) => [item.id, item]));
}

/**
 * @param {ExchangeEvent} event
 * @param {ExchangeCatalog} catalog
 * @returns {Array<UnrankedExchangeOffer | RankedExchangeOffer>}
 */
export function expandOffers(event, catalog) {
	const items = catalogById(catalog);

	return event.stages.flatMap((stage) =>
		stage.offers.map((offer) => {
			const item = items.get(offer.itemId);
			if (!item) throw new Error(`Unknown catalog item: ${offer.itemId}`);

			if (item.valuation !== 'priced') {
				return { ...offer, stage: stage.number, item };
			}

			const bundleEly = offer.quantity * item.unitEly;
			return {
				...offer,
				stage: stage.number,
				item,
				bundleEly,
				elyPerPoint: bundleEly / offer.pointCost
			};
		})
	);
}

/**
 * @param {RankedExchangeOffer} left
 * @param {RankedExchangeOffer} right
 */
function compareRankedOffers(left, right) {
	return (
		right.elyPerPoint - left.elyPerPoint ||
		right.bundleEly - left.bundleEly ||
		left.pointCost - right.pointCost ||
		left.stage - right.stage ||
		left.slot - right.slot
	);
}

/**
 * @param {ExchangeEvent} event
 * @param {ExchangeCatalog} catalog
 * @param {number} [stageNumber]
 * @returns {RankedExchangeOffer[]}
 */
export function rankOffers(event, catalog, stageNumber) {
	return expandOffers(event, catalog)
		.filter(
			/** @returns {offer is RankedExchangeOffer} */
			(offer) => 'elyPerPoint' in offer && (stageNumber === undefined || offer.stage === stageNumber)
		)
		.sort(compareRankedOffers);
}

/**
 * @param {ExchangeEvent} event
 * @param {ExchangeCatalog} catalog
 * @param {number} [stageNumber]
 * @returns {UnrankedExchangeOffer[]}
 */
export function unrankedOffers(event, catalog, stageNumber) {
	return expandOffers(event, catalog)
		.filter(
			/** @returns {offer is UnrankedExchangeOffer} */
			(offer) => !('elyPerPoint' in offer) && (stageNumber === undefined || offer.stage === stageNumber)
		)
		.sort((left, right) => left.stage - right.stage || left.slot - right.slot);
}

/** @deprecated Use unrankedOffers to include both unique and pending valuations. */
export const unpricedOffers = unrankedOffers;

/**
 * @param {ExchangeEvent} event
 * @returns {ExchangeCompleteness}
 */
export function getExchangeCompleteness(event) {
	const captured = event.stages.reduce((total, stage) => total + stage.offers.length, 0);
	const missing = event.stages.reduce((total, stage) => total + stage.missingSlots.length, 0);

	return { captured, missing, total: captured + missing };
}

/**
 * @param {ExchangeEvent} event
 * @param {string} [today]
 * @returns {'upcoming' | 'current' | 'ended'}
 */
export function getEventStatus(event, today = new Date().toISOString().slice(0, 10)) {
	if (today < event.startDate) return 'upcoming';
	if (today > event.endDate) return 'ended';
	return 'current';
}
