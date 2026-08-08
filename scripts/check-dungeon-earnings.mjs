import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const staticRoot = resolve(projectRoot, 'static');
const dataRoot = resolve(staticRoot, 'data/dungeon-earnings');
const releaseMode = process.argv.includes('--release');
const errors = [];
const warnings = [];

const expectedDungeons = new Map([
	['pleroma', ['ascension', 8000]],
	['emeraldia', ['ascension', 9000]],
	['wings-of-icarus', ['ascension', 9999]],
	['likimo-pelke', ['super-level', 5]]
]);
const fixedD5Rewards = new Map([
	['pleroma', ['pleroma-advanced-equipment-coupon', 'demiurge-ascension-stone']],
	['emeraldia', ['emeraldia-advanced-equipment-coupon', 'dorothea-ascension-stone']],
	['wings-of-icarus', ['wings-of-icarus-advanced-equipment-coupon', 'grendel-ascension-stone']],
	['likimo-pelke', ['likimo-pelke-advanced-equipment-coupon', 'belial-ascension-stone']]
]);
const expectedMainYields = new Map([
	['pleroma', { D4: 118, D5: 121 }],
	['emeraldia', { D4: 118, D5: 121 }],
	['wings-of-icarus', { D4: 118, D5: 127.5 }],
	['likimo-pelke', { D4: 118, D5: 127.5 }]
]);
const expectedBuffIds = new Set([
	'flasks',
	'critical-oil',
	'alvis-support-potion',
	'hunter-hp-recovery-kit-30',
	'mysterious-critical-damage-amplifier',
	'premium-syrup',
	'advanced-premium-syrup',
	'shining-storm-potion',
	'heroes-set',
	'heroes-attack-nostrum-ii'
]);
const expectedEssentialBuffIds = new Set([
	'flasks',
	'critical-oil',
	'alvis-support-potion',
	'hunter-hp-recovery-kit-30',
	'mysterious-critical-damage-amplifier'
]);
const derivedFields = new Set(['clearsPerHour', 'effectiveYield', 'grossEly', 'netEly', 'elyPerHour', 'marketNet', 'serviceNet', 'buffCostPerHour', 'potentialTotal']);

function check(condition, message) {
	if (!condition) errors.push(message);
}
function nonEmpty(value) {
	return typeof value === 'string' && value.trim().length > 0;
}
function validDate(value) {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const date = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
function positive(value) {
	return Number.isFinite(value) && value > 0 && value <= Number.MAX_SAFE_INTEGER;
}
function nonnegativeInteger(value) {
	return Number.isSafeInteger(value) && value >= 0;
}
function unique(map, id, context) {
	check(nonEmpty(id), `${context}.id is required.`);
	check(!map.has(id), `${context}.id is duplicated: ${id}`);
	if (nonEmpty(id) && !map.has(id)) map.set(id, context);
}
function references(values, ids, context) {
	check(Array.isArray(values), `${context} must be an array.`);
	for (const id of values ?? []) check(ids.has(id), `${context} references unknown source ${id}.`);
}
function noDerived(value, context) {
	if (Array.isArray(value)) return value.forEach((entry, index) => noDerived(entry, `${context}[${index}]`));
	if (!value || typeof value !== 'object') return;
	for (const [key, entry] of Object.entries(value)) {
		check(!derivedFields.has(key), `${context} must not store derived field ${key}.`);
		noDerived(entry, `${context}.${key}`);
	}
}
async function localAsset(path, context, nullable = false) {
	if (path === null && nullable) return;
	check(nonEmpty(path) && path.startsWith('/images/dungeon-earnings/'), `${context} must be a local dungeon-earnings image path${nullable ? ' or null' : ''}.`);
	if (!nonEmpty(path) || !path.startsWith('/')) return;
	try { await access(resolve(staticRoot, path.slice(1))); } catch { errors.push(`${context} does not exist: ${path}`); }
}
async function readJson(path) {
	return JSON.parse(await readFile(resolve(dataRoot, path), 'utf8'));
}
function source(source, context, kinds) {
	check(nonEmpty(source.id), `${context}.id is required.`);
	check(kinds.has(source.kind), `${context}.kind is invalid: ${source.kind}`);
	check(nonEmpty(source.title), `${context}.title is required.`);
	check(validDate(source.accessedAt), `${context}.accessedAt must use YYYY-MM-DD.`);
	check(typeof source.note === 'string', `${context}.note must be a string.`);
	if (source.url === null) check(source.kind === 'maintainer-input', `${context}.url may be null only for maintainer input.`);
	else {
		try { check(new URL(source.url).protocol === 'https:', `${context}.url must use HTTPS.`); }
		catch { errors.push(`${context}.url must be a valid HTTPS URL or null.`); }
	}
}

let index;
let catalog;
let snapshot;
try {
	[index, catalog] = await Promise.all([readJson('index.json'), readJson('catalog.json')]);
	const current = index.snapshots?.find((entry) => entry.id === index.currentSnapshotId);
	check(Boolean(current), 'index.currentSnapshotId must reference index.snapshots.');
	if (current?.path?.startsWith('/data/dungeon-earnings/')) snapshot = await readJson(current.path.slice('/data/dungeon-earnings/'.length));
} catch (error) {
	console.error(`Dungeon-earnings data could not be read: ${error.message}`);
	process.exit(1);
}

check(index.schemaVersion === 1 && catalog.schemaVersion === 1 && snapshot?.schemaVersion === 1, 'All dungeon-earnings files must use schemaVersion 1.');
check(Array.isArray(index.snapshots) && index.snapshots.length > 0, 'index.snapshots must be non-empty.');
const indexIds = new Map();
for (const [i, entry] of (index.snapshots ?? []).entries()) {
	const context = `index.snapshots[${i}]`;
	unique(indexIds, entry.id, context);
	check(validDate(entry.asOf), `${context}.asOf must use YYYY-MM-DD.`);
	check(entry.marketId === 'papayaplay-na', `${context}.marketId must preserve the stable papayaplay-na id.`);
	check(entry.path === `/data/dungeon-earnings/snapshots/${entry.id}.json`, `${context}.path must be derived from its id.`);
	try { await access(resolve(staticRoot, entry.path.slice(1))); } catch { errors.push(`${context}.path does not exist.`); }
}

check(catalog.market?.id === 'papayaplay-na', 'catalog.market.id must preserve papayaplay-na.');
check(catalog.market?.label === 'Global', 'catalog.market.label must be Global.');
check(catalog.market?.region === 'Global', 'catalog.market.region must be Global.');
check(catalog.market?.currency === 'Ely', 'catalog.market.currency must be Ely.');
check(catalog.market?.feeRate === 0.01, 'catalog.market.feeRate must be 0.01.');
check(catalog.d5MaterialBonusRate === 0.05, 'catalog.d5MaterialBonusRate must remain 0.05 for provenance.');
check(Array.isArray(catalog.sources) && Array.isArray(catalog.rewardItems) && Array.isArray(catalog.serviceRecipes) && Array.isArray(catalog.costItems) && Array.isArray(catalog.dungeons) && Array.isArray(catalog.buffs), 'Catalog collections must be arrays.');
noDerived(catalog, 'catalog');
noDerived(snapshot, 'snapshot');

const catalogSources = new Map();
for (const [i, entry] of (catalog.sources ?? []).entries()) {
	const context = `catalog.sources[${i}]`;
	source(entry, context, new Set(['dungeon-guide', 'buff-guide', 'maintainer-input']));
	unique(catalogSources, entry.id, context);
}
const knownCatalogSources = new Set(catalogSources.keys());

const rewardItems = new Map();
for (const [i, item] of (catalog.rewardItems ?? []).entries()) {
	const context = `catalog.rewardItems[${i}]`;
	unique(rewardItems, item.id, context);
	if (nonEmpty(item.id)) rewardItems.set(item.id, item);
	check(nonEmpty(item.name), `${context}.name is required.`);
	check(['market', 'service'].includes(item.route), `${context}.route must be market or service.`);
	if ('marketPriceItemId' in item) {
		check(item.route === 'market', `${context}.marketPriceItemId requires market route.`);
		check(nonEmpty(item.marketPriceItemId), `${context}.marketPriceItemId must be non-empty.`);
	}
	if ('marketConversionCostPerUnitEly' in item) {
		check(item.route === 'market', `${context}.marketConversionCostPerUnitEly requires market route.`);
		check(nonnegativeInteger(item.marketConversionCostPerUnitEly), `${context}.marketConversionCostPerUnitEly must be a nonnegative safe integer.`);
	}
	references(item.sourceIds, knownCatalogSources, `${context}.sourceIds`);
	await localAsset(item.icon, `${context}.icon`, true);
}

const recipes = new Map();
const customerPriceIds = new Set();
const provisionalRecipes = [];
for (const [i, recipe] of (catalog.serviceRecipes ?? []).entries()) {
	const context = `catalog.serviceRecipes[${i}]`;
	unique(recipes, recipe.id, context);
	if (nonEmpty(recipe.id)) recipes.set(recipe.id, recipe);
	check(nonEmpty(recipe.name), `${context}.name is required.`);
	check(Array.isArray(recipe.inputs) && recipe.inputs.length > 0, `${context}.inputs must be non-empty.`);
	const inputs = new Set();
	for (const [j, input] of (recipe.inputs ?? []).entries()) {
		check(rewardItems.has(input.itemId), `${context}.inputs[${j}] references unknown reward ${input.itemId}.`);
		check(!inputs.has(input.itemId), `${context} repeats input ${input.itemId}.`);
		inputs.add(input.itemId);
		check(positive(input.quantity), `${context}.inputs[${j}].quantity must be positive.`);
	}
	check(nonnegativeInteger(recipe.providerElyCostEly), `${context}.providerElyCostEly must be a nonnegative safe integer.`);
	check(nonEmpty(recipe.customerPriceItemId), `${context}.customerPriceItemId is required.`);
	check(!customerPriceIds.has(recipe.customerPriceItemId), `${context}.customerPriceItemId is duplicated.`);
	customerPriceIds.add(recipe.customerPriceItemId);
	check(Number.isSafeInteger(recipe.customerSuppliedSealLocks) && recipe.customerSuppliedSealLocks > 0, `${context}.customerSuppliedSealLocks must be a positive integer.`);
	check(recipe.customerSuppliedEquipment === true, `${context}.customerSuppliedEquipment must be true.`);
	check(['confirmed', 'provisional'].includes(recipe.status), `${context}.status must be confirmed or provisional.`);
	if (recipe.status === 'provisional') provisionalRecipes.push(recipe.name);
	check(typeof recipe.note === 'string', `${context}.note must be a string.`);
	references(recipe.sourceIds, knownCatalogSources, `${context}.sourceIds`);
}

const pendingYields = [];
const pendingBonuses = [];
const dungeonIds = new Map();
for (const [i, dungeon] of (catalog.dungeons ?? []).entries()) {
	const context = `catalog.dungeons[${i}]`;
	unique(dungeonIds, dungeon.id, context);
	check(expectedDungeons.has(dungeon.id), `${context}.id is outside the supported set.`);
	check(nonEmpty(dungeon.name), `${context}.name is required.`);
	const expected = expectedDungeons.get(dungeon.id);
	check(dungeon.requirement?.kind === expected?.[0] && dungeon.requirement?.value === expected?.[1], `${context}.requirement is incorrect.`);
	references(dungeon.sourceIds, knownCatalogSources, `${context}.sourceIds`);
	await localAsset(dungeon.image, `${context}.image`);
	check(dungeon.difficulties?.D4 && dungeon.difficulties?.D5 && Object.keys(dungeon.difficulties).length === 2, `${context}.difficulties must contain D4 and D5.`);
	for (const difficulty of ['D4', 'D5']) {
		const profile = dungeon.difficulties?.[difficulty];
		const profileContext = `${context}.difficulties.${difficulty}`;
		check(Array.isArray(profile?.rewards) && profile.rewards.length > 0, `${profileContext}.rewards must be non-empty.`);
		check(Array.isArray(profile?.serviceStrategyIds), `${profileContext}.serviceStrategyIds must be an array.`);
		const strategyIds = new Set();
		for (const id of profile?.serviceStrategyIds ?? []) {
			check(recipes.has(id), `${profileContext}.serviceStrategyIds references unknown recipe ${id}.`);
			check(!strategyIds.has(id), `${profileContext}.serviceStrategyIds repeats ${id}.`);
			strategyIds.add(id);
		}
		const profileItems = new Set();
		for (const [j, reward] of (profile?.rewards ?? []).entries()) {
			const rewardContext = `${profileContext}.rewards[${j}]`;
			check(rewardItems.has(reward.itemId), `${rewardContext}.itemId is unknown.`);
			check(!profileItems.has(reward.itemId), `${profileContext} repeats ${reward.itemId}.`);
			profileItems.add(reward.itemId);
			check(!('serviceRecipeId' in reward), `${rewardContext} must use profile.serviceStrategyIds, not serviceRecipeId.`);
			check(['known', 'pending'].includes(reward.yield?.status), `${rewardContext}.yield.status is invalid.`);
			if (reward.yield?.status === 'known') check(positive(reward.yield.expectedPerClear), `${rewardContext}.yield.expectedPerClear must be positive.`);
			else { check(reward.yield?.expectedPerClear === null, `${rewardContext}.pending yield must be null.`); pendingYields.push(`${dungeon.id} ${difficulty} ${reward.itemId}`); }
			check(typeof reward.yield?.note === 'string', `${rewardContext}.yield.note must be a string.`);
			check(typeof reward.d5BonusEligible === 'boolean' || reward.d5BonusEligible === null, `${rewardContext}.d5BonusEligible must be boolean or null.`);
			if (reward.d5BonusEligible === null) pendingBonuses.push(`${dungeon.id} ${difficulty} ${reward.itemId}`);
			check(reward.d5BonusEligible !== true, `${rewardContext} must not apply another D5 multiplier; maintained yields already include all bonus rewards.`);
		}
		const fixed = fixedD5Rewards.get(dungeon.id);
		if (difficulty === 'D4') {
			check(!profileItems.has(fixed?.[0]) && !profileItems.has(fixed?.[1]), `${profileContext} must exclude D5 coupons and stones.`);
		} else {
			const coupon = profile.rewards.find((row) => row.itemId === fixed?.[0]);
			const stone = profile.rewards.find((row) => row.itemId === fixed?.[1]);
			check(coupon?.yield?.expectedPerClear === 3, `${profileContext} must yield three advanced coupons.`);
			check(stone?.yield?.expectedPerClear === 21, `${profileContext} must yield 21 ascension stones.`);
		}
		const mainRows = profile.rewards.filter((row) => row.itemId !== fixed?.[0] && row.itemId !== fixed?.[1]);
		check(mainRows.length === 2, `${profileContext} must contain two named main materials.`);
		for (const row of mainRows) check(row.yield?.expectedPerClear === expectedMainYields.get(dungeon.id)?.[difficulty], `${profileContext} main material ${row.itemId} has incorrect expected yield.`);
	}
}
check(dungeonIds.size === expectedDungeons.size, 'Catalog must contain exactly four supported dungeons.');

const buffIds = new Map();
const buffPriceIds = new Set();
const presetGroups = new Map();
for (const [i, buff] of (catalog.buffs ?? []).entries()) {
	const context = `catalog.buffs[${i}]`;
	unique(buffIds, buff.id, context);
	check(expectedBuffIds.has(buff.id), `${context}.id is outside the maintained buff set.`);
	check(nonEmpty(buff.name), `${context}.name must be a non-empty string.`);
	check(typeof buff.description === 'string', `${context}.description must be a string.`);
	check(positive(buff.durationSeconds) && positive(buff.consumablesPerActivation), `${context} duration and activation quantity must be positive.`);
	check(['snapshot', 'fixed-zero'].includes(buff.priceMode), `${context}.priceMode is invalid.`);
	check(typeof buff.priceEditable === 'boolean', `${context}.priceEditable must be boolean.`);
	check(typeof buff.essential === 'boolean', `${context}.essential must be boolean.`);
	check(buff.essential === expectedEssentialBuffIds.has(buff.id), `${context}.essential does not match the maintained baseline.`);
	if (buff.essential) {
		check(buff.standardPreset === true, `${context} essential buffs must be part of the standard preset.`);
		check(buff.exclusivityGroup === null, `${context} essential buffs cannot be mutually exclusive.`);
	}
	if (buff.priceMode === 'fixed-zero') {
		check(buff.priceItemId === null && buff.priceEditable === false, `${context} fixed-zero buffs require null priceItemId and cannot be editable.`);
	} else {
		check(nonEmpty(buff.priceItemId), `${context}.priceItemId is required for snapshot pricing.`);
		check(!buffPriceIds.has(buff.priceItemId), `${context}.priceItemId is duplicated.`);
		buffPriceIds.add(buff.priceItemId);
	}
	check(buff.exclusivityGroup === null || ['heroes-attack', 'syrup'].includes(buff.exclusivityGroup), `${context}.exclusivityGroup is invalid.`);
	if (buff.standardPreset && buff.exclusivityGroup) {
		check(!presetGroups.has(buff.exclusivityGroup), `Standard preset conflicts in ${buff.exclusivityGroup}.`);
		presetGroups.set(buff.exclusivityGroup, buff.id);
	}
	if (buff.alternativePrice) {
		check(buff.priceMode === 'snapshot', `${context}.alternativePrice requires snapshot pricing.`);
		check(nonEmpty(buff.alternativePrice.priceItemId) && positive(buff.alternativePrice.quantity), `${context}.alternativePrice is invalid.`);
	}
	references(buff.sourceIds, knownCatalogSources, `${context}.sourceIds`);
	await localAsset(buff.icon, `${context}.icon`);
}
check(buffIds.size === expectedBuffIds.size, `Catalog must contain exactly ${expectedBuffIds.size} maintained buffs.`);
for (const id of expectedBuffIds) check(buffIds.has(id), `Catalog is missing buff ${id}.`);
for (const buff of catalog.buffs ?? []) if (buff.alternativePrice) check(buffPriceIds.has(buff.alternativePrice.priceItemId), `${buff.id}.alternativePrice references an unknown buff price.`);

check(snapshot?.id === index.currentSnapshotId, 'snapshot.id must match index.currentSnapshotId.');
check(snapshot?.marketId === catalog.market?.id && snapshot?.currency === catalog.market?.currency, 'Snapshot market/currency must match catalog.');
check(validDate(snapshot?.asOf) && validDate(snapshot?.reviewedAt), 'Snapshot dates must use YYYY-MM-DD.');
check(index.snapshots.find((entry) => entry.id === index.currentSnapshotId)?.asOf === snapshot?.asOf, 'Current index asOf must match snapshot.');

const snapshotSources = new Map();
for (const [i, entry] of (snapshot?.sources ?? []).entries()) {
	const context = `snapshot.sources[${i}]`;
	source(entry, context, new Set(['market-observation', 'maintainer-input']));
	unique(snapshotSources, entry.id, context);
}
const knownSnapshotSources = new Set(snapshotSources.keys());
const validPrices = {
	market: new Set(
		[...rewardItems.values()]
			.filter((item) => item.route === 'market')
			.map((item) => item.marketPriceItemId ?? item.id)
	),
	service: customerPriceIds,
	cost: new Set((catalog.costItems ?? []).map((item) => item.id)),
	buff: buffPriceIds
};
const prices = new Map();
const itemPriceOwners = new Map();
const pendingPrices = [];
for (const [i, price] of (snapshot?.prices ?? []).entries()) {
	const context = `snapshot.prices[${i}]`;
	check(['market', 'service', 'cost', 'buff'].includes(price.kind), `${context}.kind is invalid.`);
	check(validPrices[price.kind]?.has(price.itemId), `${context} references unknown ${price.kind} item ${price.itemId}.`);
	const key = `${price.kind}:${price.itemId}`;
	check(!prices.has(key), `${context} duplicates ${key}.`);
	check(!itemPriceOwners.has(price.itemId), `${context}.itemId is duplicated across price kinds.`);
	prices.set(key, price);
	itemPriceOwners.set(price.itemId, price.kind);
	check(['priced', 'pending'].includes(price.status), `${context}.status is invalid.`);
	check(typeof price.note === 'string', `${context}.note must be a string.`);
	references(price.sourceIds, knownSnapshotSources, `${context}.sourceIds`);
	if (price.status === 'priced') {
		check(Number.isSafeInteger(price.unitEly) && price.unitEly > 0, `${context}.unitEly must be a positive safe integer.`);
		check(validDate(price.asOf), `${context}.asOf must be a date.`);
		check(price.sourceIds.length > 0, `${context} requires a source.`);
	} else {
		check(price.unitEly === null && price.asOf === null, `${context} pending price must have null value/date.`);
		pendingPrices.push(key);
	}
}
for (const [kind, ids] of Object.entries(validPrices)) for (const id of ids) check(prices.has(`${kind}:${id}`), `Snapshot is missing ${kind} price ${id}.`);
check(!buffIds.has('sweet-mutant-special-potion'), 'Sweet Mutant must stay outside the modeled buff-cost set.');
for (const buff of catalog.buffs.filter(
	(buff) => buff.essential && buff.priceMode === 'snapshot' && !buff.priceEditable
)) {
	check(
		prices.get(`buff:${buff.priceItemId}`)?.status === 'priced',
		`Essential fixed-cost buff ${buff.id} must have a priced snapshot value.`
	);
}

if (pendingYields.length) warnings.push(`${pendingYields.length} reward averages remain pending: ${pendingYields.join(', ')}.`);
if (pendingBonuses.length) warnings.push(`${pendingBonuses.length} D5 bonus decisions remain pending: ${pendingBonuses.join(', ')}.`);
if (pendingPrices.length) warnings.push(`${pendingPrices.length} economy values remain pending: ${pendingPrices.join(', ')}.`);
if (provisionalRecipes.length) warnings.push(`Provisional service assumptions (non-blocking): ${provisionalRecipes.join(', ')}.`);
if (releaseMode) {
	check(pendingYields.length === 0, 'Release data cannot contain pending reward averages.');
	check(pendingBonuses.length === 0, 'Release data cannot contain pending D5 bonus decisions.');
}

if (errors.length) {
	console.error(`Dungeon-earnings validation failed with ${errors.length} error${errors.length === 1 ? '' : 's'}:`);
	for (const error of errors) console.error(`- ${error}`);
	process.exit(1);
}
console.log(`Dungeon-earnings data is structurally valid${releaseMode ? ' and release-ready' : ''}: ${dungeonIds.size} dungeons, ${catalog.buffs.length} buffs, snapshot ${snapshot.id}.`);
for (const warning of warnings) console.warn(`Warning: ${warning}`);
