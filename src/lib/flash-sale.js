// @ts-check

/** @typedef {import('$lib/types').FlashSaleAnalysis} FlashSaleAnalysis */
/** @typedef {import('$lib/types').FlashSaleCatalog} FlashSaleCatalog */
/** @typedef {import('$lib/types').FlashSaleConfidence} FlashSaleConfidence */
/** @typedef {import('$lib/types').FlashSaleCycle} FlashSaleCycle */
/** @typedef {import('$lib/types').FlashSaleOffer} FlashSaleOffer */
/** @typedef {import('$lib/types').FlashSaleValuationSnapshot} FlashSaleValuationSnapshot */
/** @typedef {import('$lib/types').EvaluatedFlashSaleOffer} EvaluatedFlashSaleOffer */

const confidenceWeight = { high: 3, medium: 2, low: 1 };

/**
 * @param {FlashSaleCatalog} catalog
 */
function catalogById(catalog) {
	return new Map(catalog.items.map((item) => [item.id, item]));
}

/**
 * @param {FlashSaleAnalysis} sale
 */
function valuationByItemId(sale) {
	return new Map(sale.valuationSnapshot.map((valuation) => [valuation.itemId, valuation]));
}

/**
 * @param {Array<FlashSaleConfidence | null>} values
 * @returns {FlashSaleConfidence | null}
 */
function lowestConfidence(values) {
	const present = values.filter(
		/** @returns {value is FlashSaleConfidence} */
		(value) => value !== null
	);
	if (present.length === 0) return null;
	return present.reduce((lowest, value) =>
		confidenceWeight[value] < confidenceWeight[lowest] ? value : lowest
	);
}

/**
 * @param {FlashSaleValuationSnapshot} valuation
 */
function hasNumericValue(valuation) {
	return (
		(valuation.status === 'priced' || valuation.status === 'estimated') &&
		Number.isFinite(valuation.unitEly) &&
		valuation.unitEly !== null &&
		valuation.unitEly >= 0
	);
}

/**
 * Evaluate one offer from the immutable valuation snapshot stored with its sale.
 *
 * @param {FlashSaleOffer} offer
 * @param {string} cycleId
 * @param {FlashSaleCatalog} catalog
 * @param {FlashSaleAnalysis} sale
 * @returns {EvaluatedFlashSaleOffer}
 */
export function evaluateFlashSaleOffer(offer, cycleId, catalog, sale) {
	const items = catalogById(catalog);
	const valuations = valuationByItemId(sale);
	const components = offer.contents.map((content) => {
		const item = items.get(content.itemId);
		if (!item) throw new Error(`Unknown flash-sale catalog item: ${content.itemId}`);
		const valuation = valuations.get(content.itemId);
		if (!valuation) throw new Error(`Missing valuation snapshot for: ${content.itemId}`);

		return {
			...content,
			item,
			valuation,
			componentEly: hasNumericValue(valuation) ? content.quantity * /** @type {number} */ (valuation.unitEly) : null
		};
	});
	const valuedComponents = components.filter((component) => component.componentEly !== null);
	const knownBundleEly = valuedComponents.reduce(
		(total, component) => total + /** @type {number} */ (component.componentEly),
		0
	);
	const allComponentsValued = components.length > 0 && valuedComponents.length === components.length;
	const captureVerified = offer.capture.status === 'verified';
	const valuationState = !captureVerified
		? 'unranked'
		: allComponentsValued
			? 'exact'
			: valuedComponents.length > 0
				? 'partial'
				: 'unranked';
	const bundleEly = valuationState === 'exact' ? knownBundleEly : null;
	const elyPerLtc = bundleEly === null ? null : bundleEly / offer.salePriceLtc;
	const lowerBoundElyPerLtc = valuationState === 'partial' ? knownBundleEly / offer.salePriceLtc : null;

	return {
		...offer,
		cycleId,
		components,
		knownBundleEly,
		bundleEly,
		elyPerLtc,
		lowerBoundElyPerLtc,
		valuationState,
		confidence: lowestConfidence(valuedComponents.map((component) => component.valuation.confidence)),
		rank: null
	};
}

/**
 * @param {EvaluatedFlashSaleOffer} left
 * @param {EvaluatedFlashSaleOffer} right
 */
function compareObjectiveOffers(left, right) {
	return (
		/** @type {number} */ (right.elyPerLtc) - /** @type {number} */ (left.elyPerLtc) ||
		/** @type {number} */ (right.bundleEly) - /** @type {number} */ (left.bundleEly) ||
		left.salePriceLtc - right.salePriceLtc ||
		left.slot - right.slot ||
		left.id.localeCompare(right.id)
	);
}

/**
 * @param {FlashSaleAnalysis} sale
 * @param {FlashSaleCatalog} catalog
 * @param {string} cycleId
 * @returns {EvaluatedFlashSaleOffer[]}
 */
export function rankFlashSaleCycle(sale, catalog, cycleId) {
	const cycle = sale.cycles.find((candidate) => candidate.id === cycleId);
	if (!cycle) throw new Error(`Unknown flash-sale cycle: ${cycleId}`);

	return cycle.offers
		.map((offer) => evaluateFlashSaleOffer(offer, cycle.id, catalog, sale))
		.filter((offer) => offer.valuationState === 'exact')
		.sort(compareObjectiveOffers)
		.map((offer, index) => ({ ...offer, rank: index + 1 }));
}

/**
 * Return every cycle offer in poster order with objective ranks attached where defensible.
 *
 * @param {FlashSaleAnalysis} sale
 * @param {FlashSaleCatalog} catalog
 * @param {string} cycleId
 * @returns {EvaluatedFlashSaleOffer[]}
 */
export function evaluateFlashSaleCycle(sale, catalog, cycleId) {
	const cycle = sale.cycles.find((candidate) => candidate.id === cycleId);
	if (!cycle) throw new Error(`Unknown flash-sale cycle: ${cycleId}`);
	const ranks = new Map(rankFlashSaleCycle(sale, catalog, cycleId).map((offer) => [offer.id, offer.rank]));

	return cycle.offers.map((offer) => ({
		...evaluateFlashSaleOffer(offer, cycle.id, catalog, sale),
		rank: ranks.get(offer.id) ?? null
	}));
}

/**
 * @param {FlashSaleCycle} cycle
 * @param {Date | string | number} [now]
 * @returns {'upcoming' | 'active' | 'ended'}
 */
export function getFlashSaleCycleStatus(cycle, now = new Date()) {
	const instant = new Date(now).getTime();
	if (instant < new Date(cycle.startsAt).getTime()) return 'upcoming';
	if (instant >= new Date(cycle.endsAt).getTime()) return 'ended';
	return 'active';
}

/**
 * @param {FlashSaleAnalysis} sale
 * @param {Date | string | number} [now]
 */
export function getFlashSaleTimeline(sale, now = new Date()) {
	const instant = new Date(now).getTime();
	const cycles = [...sale.cycles].sort(
		(left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
	);
	const active = cycles.find(
		(cycle) =>
			new Date(cycle.startsAt).getTime() <= instant && instant < new Date(cycle.endsAt).getTime()
	);
	const next = cycles.find((cycle) => instant < new Date(cycle.startsAt).getTime());

	if (active) return { status: 'active', activeCycleId: active.id, nextCycleId: next?.id ?? null };
	if (next) {
		return {
			status: instant < new Date(cycles[0].startsAt).getTime() ? 'upcoming' : 'gap',
			activeCycleId: null,
			nextCycleId: next.id
		};
	}
	return { status: 'ended', activeCycleId: null, nextCycleId: null };
}

/**
 * @param {FlashSaleAnalysis} sale
 * @param {FlashSaleCatalog} catalog
 */
export function getFlashSaleCompleteness(sale, catalog) {
	const evaluated = sale.cycles.flatMap((cycle) => evaluateFlashSaleCycle(sale, catalog, cycle.id));
	const captured = sale.cycles.reduce((total, cycle) => total + cycle.offers.length, 0);
	const unresolved = sale.cycles.reduce((total, cycle) => total + cycle.unresolvedSlots.length, 0);

	return {
		captured,
		unresolved,
		total: captured + unresolved,
		fullyValued: evaluated.filter((offer) => offer.valuationState === 'exact').length,
		partiallyValued: evaluated.filter((offer) => offer.valuationState === 'partial').length,
		unranked: evaluated.filter((offer) => offer.valuationState === 'unranked').length
	};
}

/**
 * @param {EvaluatedFlashSaleOffer} offer
 * @param {{ utilityPercent?: number; personalValueEly?: number | null }} [input]
 */
export function calculatePersonalFlashSaleValue(offer, input = {}) {
	const direct = input.personalValueEly;
	const utilityPercent = Math.min(100, Math.max(0, input.utilityPercent ?? 100));
	const objectiveBase = offer.bundleEly ?? (offer.knownBundleEly > 0 ? offer.knownBundleEly : null);
	const personalEly =
		typeof direct === 'number' && Number.isFinite(direct) && direct >= 0
			? direct
			: objectiveBase === null
				? null
				: objectiveBase * (utilityPercent / 100);

	return {
		personalEly,
		personalElyPerLtc: personalEly === null ? null : personalEly / offer.salePriceLtc,
		utilityPercent,
		usedDirectValue: typeof direct === 'number' && Number.isFinite(direct) && direct >= 0
	};
}

/**
 * @param {EvaluatedFlashSaleOffer[]} offers
 * @param {Record<string, { utilityPercent?: number; personalValueEly?: number | null }>} [inputs]
 */
export function rankPersonalFlashSaleOffers(offers, inputs = {}) {
	return offers
		.map((offer) => ({ offer, ...calculatePersonalFlashSaleValue(offer, inputs[offer.id]) }))
		.filter(
			/** @returns {entry is ReturnType<typeof calculatePersonalFlashSaleValue> & { offer: EvaluatedFlashSaleOffer } & { personalEly: number; personalElyPerLtc: number }} */
			(entry) => entry.personalEly !== null && entry.personalElyPerLtc !== null
		)
		.sort(
			(left, right) =>
				right.personalElyPerLtc - left.personalElyPerLtc ||
				right.personalEly - left.personalEly ||
				left.offer.salePriceLtc - right.offer.salePriceLtc ||
				left.offer.slot - right.offer.slot ||
				left.offer.id.localeCompare(right.offer.id)
		)
		.map((entry, index) => ({ ...entry, rank: index + 1 }));
}
