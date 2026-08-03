import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getExchangeCompleteness } from '../src/lib/event-exchange.js';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataRoot = resolve(projectRoot, 'static/data/event-exchange');
const errors = [];
const warnings = [];
const valuations = new Set(['priced', 'unique', 'pending']);

function check(condition, message) {
	if (!condition) errors.push(message);
}

function isPositiveInteger(value) {
	return Number.isInteger(value) && value > 0;
}

function isDate(value) {
	return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function readJson(filename) {
	const body = await readFile(resolve(dataRoot, filename), 'utf8');
	return JSON.parse(body);
}

async function checkPublicAsset(publicPath, context) {
	check(
		typeof publicPath === 'string' && publicPath.startsWith('/items/event-exchange/'),
		`${context} must use an /items/event-exchange/ path.`
	);
	if (typeof publicPath !== 'string' || !publicPath.startsWith('/')) return;

	try {
		await access(resolve(projectRoot, 'static', publicPath.slice(1)));
	} catch {
		errors.push(`${context} does not exist: ${publicPath}`);
	}
}

let catalog;
let event;

try {
	[catalog, event] = await Promise.all([readJson('catalog.json'), readJson('current.json')]);
} catch (error) {
	console.error(`Event exchange data could not be read: ${error.message}`);
	process.exit(1);
}

check(Array.isArray(catalog.items), 'catalog.items must be an array.');
check(typeof event.id === 'string' && event.id.length > 0, 'event.id is required.');
check(typeof event.title === 'string' && event.title.length > 0, 'event.title is required.');
check(typeof event.region === 'string' && event.region.length > 0, 'event.region is required.');
check(typeof event.source === 'string' && event.source.length > 0, 'event.source is required.');
check(isDate(event.startDate), 'event.startDate must use YYYY-MM-DD.');
check(isDate(event.endDate), 'event.endDate must use YYYY-MM-DD.');
check(isDate(event.reviewedAt), 'event.reviewedAt must use YYYY-MM-DD.');
check(event.startDate <= event.endDate, 'event.startDate must not be after event.endDate.');
check(isPositiveInteger(event.expectedOfferCount), 'event.expectedOfferCount must be positive.');
check(Array.isArray(event.stages) && event.stages.length === 5, 'The exchange must have exactly five stages.');

const itemsById = new Map();
for (const [index, item] of (catalog.items ?? []).entries()) {
	const context = `catalog.items[${index}]`;
	check(typeof item.id === 'string' && item.id.length > 0, `${context}.id is required.`);
	check(!itemsById.has(item.id), `${context}.id is duplicated: ${item.id}`);
	itemsById.set(item.id, item);
	check(item.name === null || (typeof item.name === 'string' && item.name.trim().length > 0), `${context}.name must be null or non-empty.`);
	check(valuations.has(item.valuation), `${context}.valuation must be priced, unique, or pending.`);

	if (item.valuation === 'priced') {
		check(Number.isFinite(item.unitEly) && item.unitEly > 0, `${context}.unitEly must be positive when priced.`);
		check(isDate(item.priceUpdatedAt), `${context}.priceUpdatedAt must use YYYY-MM-DD when priced.`);
		check(item.name !== null, `${context}.name is required when priced.`);
	} else if (item.valuation === 'unique' || item.valuation === 'pending') {
		check(item.unitEly === null, `${context}.unitEly must be null when ${item.valuation}.`);
		check(item.priceUpdatedAt === null, `${context}.priceUpdatedAt must be null when ${item.valuation}.`);
		if (item.valuation === 'unique') check(item.name !== null, `${context}.name is required when unique.`);
	}

	await checkPublicAsset(item.referenceIcon, `${context}.referenceIcon`);
}

const seenStageNumbers = new Set();
const referencedItemIds = new Set();
for (const [stageIndex, stage] of (event.stages ?? []).entries()) {
	const context = `event.stages[${stageIndex}]`;
	check(isPositiveInteger(stage.number), `${context}.number must be positive.`);
	check(!seenStageNumbers.has(stage.number), `${context}.number is duplicated: ${stage.number}`);
	seenStageNumbers.add(stage.number);
	check(Array.isArray(stage.missingSlots), `${context}.missingSlots must be an array.`);
	check(Array.isArray(stage.offers), `${context}.offers must be an array.`);

	const seenSlots = new Set();
	for (const slot of stage.missingSlots ?? []) {
		check(isPositiveInteger(slot), `${context}.missingSlots contains an invalid slot.`);
		check(!seenSlots.has(slot), `${context} repeats slot ${slot}.`);
		seenSlots.add(slot);
	}

	for (const [offerIndex, offer] of (stage.offers ?? []).entries()) {
		const offerContext = `${context}.offers[${offerIndex}]`;
		check(isPositiveInteger(offer.slot), `${offerContext}.slot must be positive.`);
		check(!seenSlots.has(offer.slot), `${context} repeats or captures missing slot ${offer.slot}.`);
		seenSlots.add(offer.slot);
		check(typeof offer.itemId === 'string' && itemsById.has(offer.itemId), `${offerContext}.itemId is unknown: ${offer.itemId}`);
		referencedItemIds.add(offer.itemId);
		check(isPositiveInteger(offer.quantity), `${offerContext}.quantity must be positive.`);
		check(isPositiveInteger(offer.pointCost), `${offerContext}.pointCost must be positive.`);
		check(offer.accountLimit === null || isPositiveInteger(offer.accountLimit), `${offerContext}.accountLimit must be null or positive.`);
		await checkPublicAsset(offer.icon, `${offerContext}.icon`);
	}
}

check(
	[1, 2, 3, 4, 5].every((stageNumber) => seenStageNumbers.has(stageNumber)),
	'Stage numbers must be exactly 1 through 5.'
);

const completeness = getExchangeCompleteness(event);
check(
	completeness.total === event.expectedOfferCount,
	`Captured plus missing offers (${completeness.total}) must equal expectedOfferCount (${event.expectedOfferCount}).`
);

const referencedOffers = (event.stages ?? []).flatMap((stage) => stage.offers ?? []);
const pendingCount = referencedOffers.filter((offer) => itemsById.get(offer.itemId)?.valuation === 'pending').length;
const unnamedCount = referencedOffers.filter((offer) => itemsById.get(offer.itemId)?.name === null).length;
const unusedCount = [...itemsById.keys()].filter((id) => !referencedItemIds.has(id)).length;

if (pendingCount) warnings.push(`${pendingCount} captured offers still need an Ely value.`);
if (unnamedCount) warnings.push(`${unnamedCount} captured offers still need an English label.`);
if (unusedCount) warnings.push(`${unusedCount} catalog items are not used by the current event.`);

if (errors.length) {
	console.error(`Event exchange validation failed with ${errors.length} error${errors.length === 1 ? '' : 's'}:`);
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}

console.log(`Event exchange data is valid: ${completeness.captured}/${completeness.total} offers captured across 5 stages.`);
for (const warning of warnings) console.warn(`Warning: ${warning}`);
