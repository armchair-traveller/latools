import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	calculatePersonalFlashSaleValue,
	evaluateFlashSaleCycle,
	getFlashSaleCompleteness,
	getFlashSaleCycleStatus,
	getFlashSaleTimeline,
	rankFlashSaleCycle,
	rankPersonalFlashSaleOffers
} from '../src/lib/flash-sale.js';

const source = {
	id: 'source',
	kind: 'market-observation',
	title: 'Fixture source',
	url: 'https://example.com',
	accessedAt: '2026-08-05T00:00:00Z',
	note: 'Fixture'
};

const valuation = (status, unitEly = null) => ({
	status,
	unitEly,
	method: status === 'priced' ? 'market-observation' : status === 'unique' ? 'not-applicable' : 'pending',
	confidence: status === 'priced' ? 'high' : null,
	asOf: status === 'priced' ? '2026-08-05' : null,
	sourceIds: status === 'priced' ? ['source'] : [],
	note: 'Fixture'
});

const catalog = {
	schemaVersion: 1,
	sources: [source],
	items: [
		{ id: 'priced', name: 'Priced', aliases: [], valuation: valuation('priced', 100) },
		{ id: 'pending', name: 'Pending', aliases: [], valuation: valuation('pending') },
		{ id: 'unique', name: 'Unique', aliases: [], valuation: valuation('unique') }
	]
};

const offer = (id, slot, price, contents, captureStatus = 'verified') => ({
	id,
	slot,
	name: id,
	salePriceLtc: price,
	purchaseLimit: null,
	contents,
	capture: { status: captureStatus, sourceIds: ['source'], note: 'Fixture' },
	bestFor: 'Fixture user',
	skipIf: 'Fixture condition',
	caveats: []
});

const fixtureSale = {
	schemaVersion: 1,
	id: 'fixture',
	postId: 1,
	title: 'Fixture',
	region: 'NA',
	currency: 'LTC',
	timezone: 'America/New_York',
	sourceUrl: 'https://latale.papayaplay.com/latale.do?tp=news.view&postid=1',
	publishedAt: '2026-08-05T00:00:00Z',
	analyzedAt: '2026-08-05T00:00:00Z',
	reviewedAt: '2026-08-05',
	status: 'published',
	sourceFingerprint: 'fixture',
	posterUrls: ['https://example.com/poster.jpg'],
	expectedOfferCount: 7,
	sources: [source],
	valuationSnapshot: [
		{ itemId: 'priced', ...valuation('priced', 100) },
		{ itemId: 'pending', ...valuation('pending') },
		{ itemId: 'unique', ...valuation('unique') }
	],
	cycles: [
		{
			id: 'r1',
			label: 'R1',
			startsAt: '2026-08-05T00:00:00Z',
			endsAt: '2026-08-05T01:00:00Z',
			expectedOfferCount: 6,
			unresolvedSlots: [],
			offers: [
				offer('best', 1, 10, [{ itemId: 'priced', quantity: 2 }]),
				offer('bundle', 2, 20, [{ itemId: 'priced', quantity: 4 }]),
				offer('cheap', 3, 5, [{ itemId: 'priced', quantity: 1 }]),
				offer('partial', 4, 10, [
					{ itemId: 'priced', quantity: 1 },
					{ itemId: 'pending', quantity: 1 }
				]),
				offer('unique', 5, 10, [{ itemId: 'unique', quantity: 1 }]),
				offer('uncertain', 6, 10, [{ itemId: 'priced', quantity: 1 }], 'uncertain')
			]
		},
		{
			id: 'r2',
			label: 'R2',
			startsAt: '2026-08-05T01:01:00Z',
			endsAt: '2026-08-05T02:00:00Z',
			expectedOfferCount: 1,
			unresolvedSlots: [],
			offers: [offer('later', 1, 10, [{ itemId: 'priced', quantity: 1 }])]
		}
	]
};

test('ranks exact offers per cycle with deterministic tie breakers', () => {
	const ranked = rankFlashSaleCycle(fixtureSale, catalog, 'r1');

	assert.deepEqual(
		ranked.map((entry) => entry.id),
		['bundle', 'best', 'cheap']
	);
	assert.deepEqual(
		ranked.map((entry) => entry.rank),
		[1, 2, 3]
	);
	assert.ok(ranked.every((entry) => entry.elyPerLtc === 20));
});

test('keeps partial, unique, and uncertain offers out of exact ranks', () => {
	const offers = evaluateFlashSaleCycle(fixtureSale, catalog, 'r1');
	const partial = offers.find((entry) => entry.id === 'partial');
	const unique = offers.find((entry) => entry.id === 'unique');
	const uncertain = offers.find((entry) => entry.id === 'uncertain');

	assert.equal(partial.valuationState, 'partial');
	assert.equal(partial.knownBundleEly, 100);
	assert.equal(partial.lowerBoundElyPerLtc, 10);
	assert.equal(partial.rank, null);
	assert.equal(unique.valuationState, 'unranked');
	assert.equal(unique.bundleEly, null);
	assert.equal(uncertain.valuationState, 'unranked');
	assert.equal(uncertain.knownBundleEly, 100);
});

test('uses the immutable sale valuation snapshot instead of the mutable catalog value', () => {
	const changedCatalog = structuredClone(catalog);
	changedCatalog.items[0].valuation.unitEly = 9999;

	const ranked = rankFlashSaleCycle(fixtureSale, changedCatalog, 'r1');
	assert.equal(ranked.find((entry) => entry.id === 'best').bundleEly, 200);
});

test('calculates session-only personal utility and direct overrides', () => {
	const offers = evaluateFlashSaleCycle(fixtureSale, catalog, 'r1');
	const best = offers.find((entry) => entry.id === 'best');
	const unique = offers.find((entry) => entry.id === 'unique');

	assert.deepEqual(calculatePersonalFlashSaleValue(best, { utilityPercent: 50 }), {
		personalEly: 100,
		personalElyPerLtc: 10,
		utilityPercent: 50,
		usedDirectValue: false
	});
	assert.equal(
		calculatePersonalFlashSaleValue(unique, { personalValueEly: 500 }).personalElyPerLtc,
		50
	);
	assert.equal(calculatePersonalFlashSaleValue(best, { utilityPercent: -10 }).utilityPercent, 0);
	assert.equal(calculatePersonalFlashSaleValue(best, { utilityPercent: 500 }).utilityPercent, 100);

	const personal = rankPersonalFlashSaleOffers(offers, {
		unique: { personalValueEly: 500 },
		best: { utilityPercent: 50 }
	});
	assert.equal(personal[0].offer.id, 'unique');
	assert.equal(personal[0].rank, 1);
});

test('uses half-open cycle boundaries and reports gaps', () => {
	assert.equal(getFlashSaleCycleStatus(fixtureSale.cycles[0], '2026-08-04T23:59:59Z'), 'upcoming');
	assert.equal(getFlashSaleCycleStatus(fixtureSale.cycles[0], '2026-08-05T00:00:00Z'), 'active');
	assert.equal(getFlashSaleCycleStatus(fixtureSale.cycles[0], '2026-08-05T01:00:00Z'), 'ended');
	assert.deepEqual(getFlashSaleTimeline(fixtureSale, '2026-08-05T01:00:00Z'), {
		status: 'gap',
		activeCycleId: null,
		nextCycleId: 'r2'
	});
	assert.deepEqual(getFlashSaleTimeline(fixtureSale, '2026-08-05T01:01:00Z'), {
		status: 'active',
		activeCycleId: 'r2',
		nextCycleId: null
	});
});

test('reports capture and valuation completeness independently', () => {
	assert.deepEqual(getFlashSaleCompleteness(fixtureSale, catalog), {
		captured: 7,
		unresolved: 0,
		total: 7,
		fullyValued: 4,
		partiallyValued: 1,
		unranked: 2
	});
});

test('current Festa fixture contains every verified cycle and offer', async () => {
	const [index, currentCatalog, sale] = await Promise.all([
		readFile(new URL('../static/data/flash-sale/index.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/catalog.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/sales/papayaplay-6332.json', import.meta.url), 'utf8').then(JSON.parse)
	]);

	assert.equal(index.currentSaleId, sale.id);
	assert.equal(sale.postId, 6332);
	assert.equal(sale.expectedOfferCount, 32);
	assert.deepEqual(
		sale.cycles.map((cycle) => cycle.offers.length),
		[6, 5, 6, 6, 5, 4]
	);
	assert.equal(sale.cycles.flatMap((cycle) => cycle.offers).length, 32);
	assert.ok(sale.cycles.every((cycle) => cycle.unresolvedSlots.length === 0));

	const r2 = rankFlashSaleCycle(sale, currentCatalog, 'r2');
	assert.deepEqual(r2.map((entry) => entry.id), [
		'r2-adventure-dice',
		'r2-platinum-hammer',
		'r2-royal-title'
	]);
	assert.equal(r2[0].bundleEly, 17_250_000_000);
	assert.equal(r2[0].elyPerLtc, 25_000_000);

	const r1Memorial = evaluateFlashSaleCycle(sale, currentCatalog, 'r1').find(
		(entry) => entry.id === 'r1-memorial-x'
	);
	const r5Memorial = evaluateFlashSaleCycle(sale, currentCatalog, 'r5').find(
		(entry) => entry.id === 'r5-memorial-x'
	);
	assert.equal(r1Memorial.valuationState, 'exact');
	assert.equal(r1Memorial.bundleEly, 41_000_000_000);
	assert.equal(r1Memorial.knownBundleEly, 41_000_000_000);
	assert.equal(r5Memorial.knownBundleEly, r1Memorial.knownBundleEly);

	const eelEnergy = currentCatalog.items.find((entry) => entry.id === 'eoli-energy-extract');
	assert.equal(eelEnergy.name, 'Eel Energy Extract');
	assert.equal(eelEnergy.valuation.status, 'unique');

	const completeness = getFlashSaleCompleteness(sale, currentCatalog);
	assert.deepEqual(completeness, {
		captured: 32,
		unresolved: 0,
		total: 32,
		fullyValued: 19,
		partiallyValued: 4,
		unranked: 9
	});
	assert.ok(
		sale.cycles
			.flatMap((cycle) => cycle.offers)
			.every((entry) => !('rank' in entry) && !('bundleEly' in entry) && !('elyPerLtc' in entry))
	);
});
