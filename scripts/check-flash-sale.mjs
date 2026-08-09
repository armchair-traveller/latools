import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFlashSaleCompleteness } from '../src/lib/flash-sale.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataRoot = resolve(projectRoot, 'static/data/flash-sale');
const errors = [];
const warnings = [];
const valuationStatuses = new Set(['priced', 'estimated', 'unique', 'pending']);
const valuationMethods = new Set([
	'market-observation',
	'maintainer-estimate',
	'historical-comparison',
	'not-applicable',
	'pending'
]);
const confidences = new Set(['high', 'medium', 'low']);

function check(condition, message) {
	if (!condition) errors.push(message);
}

function isNonEmpty(value) {
	return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value) {
	return Number.isInteger(value) && value > 0;
}

function isDate(value) {
	return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isInstant(value) {
	return (
		typeof value === 'string' &&
		/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
		!Number.isNaN(Date.parse(value))
	);
}

async function readJson(path) {
	return JSON.parse(await readFile(resolve(dataRoot, path), 'utf8'));
}

function checkSource(source, context) {
	check(isNonEmpty(source.id), `${context}.id is required.`);
	check(isNonEmpty(source.kind), `${context}.kind is required.`);
	check(isNonEmpty(source.title), `${context}.title is required.`);
	check(isNonEmpty(source.url), `${context}.url is required.`);
	check(isInstant(source.accessedAt), `${context}.accessedAt must be an ISO timestamp with an offset.`);
	check(typeof source.note === 'string', `${context}.note must be a string.`);
}

function checkValuation(valuation, context, sourceIds) {
	check(valuationStatuses.has(valuation.status), `${context}.status is invalid.`);
	check(valuationMethods.has(valuation.method), `${context}.method is invalid.`);
	check(Array.isArray(valuation.sourceIds), `${context}.sourceIds must be an array.`);
	check(typeof valuation.note === 'string', `${context}.note must be a string.`);
	for (const sourceId of valuation.sourceIds ?? []) {
		check(sourceIds.has(sourceId), `${context} references unknown source ${sourceId}.`);
	}

	if (valuation.status === 'priced' || valuation.status === 'estimated') {
		check(Number.isFinite(valuation.unitEly) && valuation.unitEly > 0, `${context}.unitEly must be positive.`);
		check(confidences.has(valuation.confidence), `${context}.confidence is required for numeric values.`);
		check(isDate(valuation.asOf), `${context}.asOf must use YYYY-MM-DD for numeric values.`);
		check(valuation.sourceIds?.length > 0, `${context} needs at least one evidence source.`);
		check(
			valuation.method !== 'pending' && valuation.method !== 'not-applicable',
			`${context}.method cannot be ${valuation.method} for a numeric value.`
		);
	} else {
		check(valuation.unitEly === null, `${context}.unitEly must be null when ${valuation.status}.`);
		check(valuation.confidence === null, `${context}.confidence must be null when ${valuation.status}.`);
		check(valuation.asOf === null, `${context}.asOf must be null when ${valuation.status}.`);
		if (valuation.status === 'pending') {
			check(valuation.method === 'pending', `${context}.method must be pending.`);
		} else {
			check(valuation.method === 'not-applicable', `${context}.method must be not-applicable.`);
		}
	}
}

let index;
let catalog;
let sale;

try {
	[index, catalog] = await Promise.all([readJson('index.json'), readJson('catalog.json')]);
	check(isNonEmpty(index.currentSaleId), 'index.currentSaleId is required.');
	sale = await readJson(`sales/${index.currentSaleId}.json`);
} catch (error) {
	console.error(`Flash-sale data could not be read: ${error.message}`);
	process.exit(1);
}

check(index.schemaVersion === 1, 'index.schemaVersion must be 1.');
check(catalog.schemaVersion === 1, 'catalog.schemaVersion must be 1.');
check(sale.schemaVersion === 1, 'sale.schemaVersion must be 1.');
check(Array.isArray(index.sales), 'index.sales must be an array.');
check(Array.isArray(catalog.sources), 'catalog.sources must be an array.');
check(Array.isArray(catalog.items), 'catalog.items must be an array.');
check(Array.isArray(sale.sources), 'sale.sources must be an array.');
check(Array.isArray(sale.valuationSnapshot), 'sale.valuationSnapshot must be an array.');
check(Array.isArray(sale.cycles) && sale.cycles.length > 0, 'sale.cycles must be a non-empty array.');

const indexIds = new Set();
for (const [entryIndex, entry] of (index.sales ?? []).entries()) {
	const context = `index.sales[${entryIndex}]`;
	check(isNonEmpty(entry.id), `${context}.id is required.`);
	check(!indexIds.has(entry.id), `${context}.id is duplicated: ${entry.id}`);
	indexIds.add(entry.id);
	check(isNonEmpty(entry.title), `${context}.title is required.`);
	check(isInstant(entry.startsAt), `${context}.startsAt must be an ISO timestamp.`);
	check(isInstant(entry.endsAt), `${context}.endsAt must be an ISO timestamp.`);
	check(isDate(entry.reviewedAt), `${context}.reviewedAt must use YYYY-MM-DD.`);
}
check(indexIds.has(index.currentSaleId), 'index.currentSaleId must reference index.sales.');

const catalogSourceIds = new Set();
for (const [sourceIndex, source] of (catalog.sources ?? []).entries()) {
	const context = `catalog.sources[${sourceIndex}]`;
	checkSource(source, context);
	check(!catalogSourceIds.has(source.id), `${context}.id is duplicated: ${source.id}`);
	catalogSourceIds.add(source.id);
}

const catalogItems = new Map();
const aliases = new Map();
for (const [itemIndex, item] of (catalog.items ?? []).entries()) {
	const context = `catalog.items[${itemIndex}]`;
	check(isNonEmpty(item.id), `${context}.id is required.`);
	check(!catalogItems.has(item.id), `${context}.id is duplicated: ${item.id}`);
	catalogItems.set(item.id, item);
	check(isNonEmpty(item.name), `${context}.name is required.`);
	check(Array.isArray(item.aliases), `${context}.aliases must be an array.`);
	for (const label of [item.name, ...(item.aliases ?? [])]) {
		check(isNonEmpty(label), `${context} contains an empty alias.`);
		const normalized = typeof label === 'string' ? label.trim().toLocaleLowerCase('en-US') : '';
		const existing = aliases.get(normalized);
		check(!existing || existing === item.id, `${context} alias conflicts with ${existing}: ${label}`);
		aliases.set(normalized, item.id);
	}
	checkValuation(item.valuation ?? {}, `${context}.valuation`, catalogSourceIds);
}

check(sale.id === index.currentSaleId, 'The current sale file id must match index.currentSaleId.');
check(isPositiveInteger(sale.postId), 'sale.postId must be a positive integer.');
check(isNonEmpty(sale.title), 'sale.title is required.');
check(sale.region === 'NA', 'sale.region must be NA.');
check(sale.currency === 'LTC', 'sale.currency must be LTC.');
check(sale.timezone === 'America/New_York', 'sale.timezone must be America/New_York.');
check(isInstant(sale.publishedAt), 'sale.publishedAt must be an ISO timestamp.');
check(isInstant(sale.analyzedAt), 'sale.analyzedAt must be an ISO timestamp.');
check(isDate(sale.reviewedAt), 'sale.reviewedAt must use YYYY-MM-DD.');
check(sale.status === 'published', 'The checked-in current sale must be published.');
check(isNonEmpty(sale.sourceFingerprint), 'sale.sourceFingerprint is required.');
check(Array.isArray(sale.posterUrls) && sale.posterUrls.length > 0, 'sale.posterUrls must not be empty.');
check(isPositiveInteger(sale.expectedOfferCount), 'sale.expectedOfferCount must be positive.');

try {
	const sourceUrl = new URL(sale.sourceUrl);
	check(sourceUrl.hostname === 'latale.papayaplay.com', 'sale.sourceUrl must use latale.papayaplay.com.');
	check(sourceUrl.pathname === '/latale.do', 'sale.sourceUrl must use /latale.do.');
	check(sourceUrl.searchParams.get('tp') === 'news.view', 'sale.sourceUrl must identify a news post.');
	check(Number(sourceUrl.searchParams.get('postid')) === sale.postId, 'sale.sourceUrl postid must match sale.postId.');
} catch {
	errors.push('sale.sourceUrl must be a valid URL.');
}

for (const [posterIndex, posterUrl] of (sale.posterUrls ?? []).entries()) {
	try {
		const url = new URL(posterUrl);
		check(url.protocol === 'https:', `sale.posterUrls[${posterIndex}] must use HTTPS.`);
		check(url.hostname === 'cdn.papayaplay.com', `sale.posterUrls[${posterIndex}] must use the PapayaPlay CDN.`);
	} catch {
		errors.push(`sale.posterUrls[${posterIndex}] must be a valid URL.`);
	}
}

const saleSourceIds = new Set();
for (const [sourceIndex, source] of (sale.sources ?? []).entries()) {
	const context = `sale.sources[${sourceIndex}]`;
	checkSource(source, context);
	check(!saleSourceIds.has(source.id), `${context}.id is duplicated: ${source.id}`);
	saleSourceIds.add(source.id);
}

const snapshot = new Map();
for (const [valuationIndex, valuation] of (sale.valuationSnapshot ?? []).entries()) {
	const context = `sale.valuationSnapshot[${valuationIndex}]`;
	check(isNonEmpty(valuation.itemId), `${context}.itemId is required.`);
	check(catalogItems.has(valuation.itemId), `${context} references unknown item ${valuation.itemId}.`);
	check(!snapshot.has(valuation.itemId), `${context}.itemId is duplicated: ${valuation.itemId}`);
	snapshot.set(valuation.itemId, valuation);
	checkValuation(valuation, context, saleSourceIds);
}

const currentSummary = (index.sales ?? []).find((entry) => entry.id === sale.id);
if (currentSummary && sale.cycles?.length) {
	check(currentSummary.title === sale.title, 'Current index title must match the sale title.');
	check(currentSummary.startsAt === sale.cycles[0].startsAt, 'Current index startsAt must match the first cycle.');
	check(
		currentSummary.endsAt === sale.cycles.at(-1).endsAt,
		'Current index endsAt must match the final cycle.'
	);
	check(currentSummary.reviewedAt === sale.reviewedAt, 'Current index reviewedAt must match the sale.');
}

const cycleIds = new Set();
const offerIds = new Set();
const referencedItems = new Set();
let previousEnd = null;
for (const [cycleIndex, cycle] of (sale.cycles ?? []).entries()) {
	const context = `sale.cycles[${cycleIndex}]`;
	check(isNonEmpty(cycle.id), `${context}.id is required.`);
	check(!cycleIds.has(cycle.id), `${context}.id is duplicated: ${cycle.id}`);
	cycleIds.add(cycle.id);
	check(isNonEmpty(cycle.label), `${context}.label is required.`);
	check(isInstant(cycle.startsAt), `${context}.startsAt must be an ISO timestamp.`);
	check(isInstant(cycle.endsAt), `${context}.endsAt must be an ISO timestamp.`);
	check(Date.parse(cycle.startsAt) < Date.parse(cycle.endsAt), `${context} must start before it ends.`);
	if (previousEnd !== null) {
		check(Date.parse(cycle.startsAt) >= previousEnd, `${context} overlaps or is out of order.`);
	}
	previousEnd = Date.parse(cycle.endsAt);
	check(isPositiveInteger(cycle.expectedOfferCount), `${context}.expectedOfferCount must be positive.`);
	check(Array.isArray(cycle.unresolvedSlots), `${context}.unresolvedSlots must be an array.`);
	check(Array.isArray(cycle.offers), `${context}.offers must be an array.`);
	if (sale.status === 'published') {
		check(cycle.unresolvedSlots.length === 0, `${context} cannot publish with unresolved slots.`);
	}
	const slots = new Set();
	for (const unresolvedSlot of cycle.unresolvedSlots ?? []) {
		check(isPositiveInteger(unresolvedSlot), `${context}.unresolvedSlots contains an invalid slot.`);
		check(!slots.has(unresolvedSlot), `${context} repeats slot ${unresolvedSlot}.`);
		slots.add(unresolvedSlot);
	}

	for (const [offerIndex, offer] of (cycle.offers ?? []).entries()) {
		const offerContext = `${context}.offers[${offerIndex}]`;
		check(isNonEmpty(offer.id), `${offerContext}.id is required.`);
		check(!offerIds.has(offer.id), `${offerContext}.id is duplicated: ${offer.id}`);
		offerIds.add(offer.id);
		check(isPositiveInteger(offer.slot), `${offerContext}.slot must be positive.`);
		check(!slots.has(offer.slot), `${offerContext}.slot is duplicated: ${offer.slot}`);
		slots.add(offer.slot);
		check(isNonEmpty(offer.name), `${offerContext}.name is required.`);
		check(isPositiveInteger(offer.salePriceLtc), `${offerContext}.salePriceLtc must be positive.`);
		check(Array.isArray(offer.contents) && offer.contents.length > 0, `${offerContext}.contents must not be empty.`);
		check(offer.capture?.status === 'verified' || offer.capture?.status === 'uncertain', `${offerContext}.capture.status is invalid.`);
		if (sale.status === 'published') {
			check(offer.capture?.status === 'verified', `${offerContext} cannot publish an uncertain capture.`);
		}
		check(Array.isArray(offer.capture?.sourceIds) && offer.capture.sourceIds.length > 0, `${offerContext}.capture needs sources.`);
		for (const sourceId of offer.capture?.sourceIds ?? []) {
			check(saleSourceIds.has(sourceId), `${offerContext}.capture references unknown source ${sourceId}.`);
		}
		check(typeof offer.capture?.note === 'string', `${offerContext}.capture.note must be a string.`);
		check(isNonEmpty(offer.bestFor), `${offerContext}.bestFor is required.`);
		check(isNonEmpty(offer.skipIf), `${offerContext}.skipIf is required.`);
		check(Array.isArray(offer.caveats), `${offerContext}.caveats must be an array.`);
		for (const forbidden of ['rank', 'bundleEly', 'knownBundleEly', 'elyPerLtc', 'lowerBoundElyPerLtc']) {
			check(!(forbidden in offer), `${offerContext} must not store derived field ${forbidden}.`);
		}
		if (offer.purchaseLimit !== null) {
			check(isPositiveInteger(offer.purchaseLimit?.quantity), `${offerContext}.purchaseLimit.quantity must be positive.`);
			check(
				['sale', 'account', 'character', 'unknown'].includes(offer.purchaseLimit?.scope),
				`${offerContext}.purchaseLimit.scope is invalid.`
			);
		}

		for (const [contentIndex, content] of (offer.contents ?? []).entries()) {
			const contentContext = `${offerContext}.contents[${contentIndex}]`;
			check(isNonEmpty(content.itemId), `${contentContext}.itemId is required.`);
			check(catalogItems.has(content.itemId), `${contentContext} references unknown catalog item ${content.itemId}.`);
			check(snapshot.has(content.itemId), `${contentContext} lacks a valuation snapshot for ${content.itemId}.`);
			check(isPositiveInteger(content.quantity), `${contentContext}.quantity must be positive.`);
			referencedItems.add(content.itemId);
		}
	}
	check(
		(cycle.offers?.length ?? 0) + (cycle.unresolvedSlots?.length ?? 0) === cycle.expectedOfferCount,
		`${context} captured plus unresolved slots must equal expectedOfferCount.`
	);
}

const completeness = getFlashSaleCompleteness(sale, catalog);
check(completeness.total === sale.expectedOfferCount, 'Sale captured plus unresolved total must equal expectedOfferCount.');
for (const itemId of snapshot.keys()) {
	if (!referencedItems.has(itemId)) warnings.push(`Valuation snapshot contains unused item ${itemId}.`);
}
for (const itemId of referencedItems) {
	check(snapshot.has(itemId), `Referenced item ${itemId} is missing from valuationSnapshot.`);
}

const pendingItems = [...referencedItems].filter((itemId) => snapshot.get(itemId)?.status === 'pending').length;
const uniqueItems = [...referencedItems].filter((itemId) => snapshot.get(itemId)?.status === 'unique').length;
if (pendingItems > 0) warnings.push(`${pendingItems} referenced catalog items still need an Ely value.`);
if (uniqueItems > 0) warnings.push(`${uniqueItems} referenced catalog items are intentionally personal/unique.`);

for (const warning of warnings) console.warn(`Warning: ${warning}`);
if (errors.length > 0) {
	for (const message of errors) console.error(`Error: ${message}`);
	process.exit(1);
}

console.log(
	`Flash-sale data is valid: ${sale.cycles.length} cycles, ${completeness.captured}/${sale.expectedOfferCount} offers captured, ${completeness.fullyValued} exact, ${completeness.partiallyValued} partial.`
);
