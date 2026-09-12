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

test('historical Back-to-School fixture preserves every approved cycle and offer', async () => {
	const [index, currentCatalog, sale, historicalSale, priorSale] = await Promise.all([
		readFile(new URL('../static/data/flash-sale/index.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/catalog.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/sales/papayaplay-6382.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/sales/papayaplay-6332.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/sales/papayaplay-6347.json', import.meta.url), 'utf8').then(JSON.parse)
	]);
	const indexedSales = await Promise.all(
		index.sales.map((entry) =>
			readFile(
				new URL(`../static/data/flash-sale/sales/${encodeURIComponent(entry.id)}.json`, import.meta.url),
				'utf8'
			).then(JSON.parse)
		)
	);

	assert.ok(index.sales.some((entry) => entry.id === sale.id));
	assert.ok(index.sales.some((entry) => entry.id === 'papayaplay-6332'));
	assert.ok(index.sales.some((entry) => entry.id === 'papayaplay-6347'));
	const expectedSaleKeys = [
		'schemaVersion',
		'id',
		'postId',
		'title',
		'region',
		'currency',
		'timezone',
		'sourceUrl',
		'publishedAt',
		'analyzedAt',
		'reviewedAt',
		'status',
		'posterUrls',
		'expectedOfferCount',
		'sources',
		'valuationSnapshot',
		'cycles'
	].sort();
	for (const checkedSale of indexedSales) {
		assert.deepEqual(Object.keys(checkedSale).sort(), expectedSaleKeys);
		assert.ok(checkedSale.sources.every((entry) => !/\bSHA-?256\b/i.test(entry.note)));
	}
	assert.equal(sale.postId, 6382);
	assert.equal(sale.publishedAt, '2026-08-27T00:00:00-04:00');
	assert.equal(sale.expectedOfferCount, 42);
	assert.deepEqual(
		sale.cycles.map((cycle) => cycle.offers.length),
		[8, 8, 7, 7, 5, 7]
	);
	assert.deepEqual(
		sale.cycles.map((cycle) => [cycle.startsAt, cycle.endsAt]),
		[
			['2026-08-26T20:30:00-04:00', '2026-08-28T20:29:00-04:00'],
			['2026-08-28T20:30:00-04:00', '2026-08-31T20:29:00-04:00'],
			['2026-08-31T20:30:00-04:00', '2026-09-02T20:29:00-04:00'],
			['2026-09-02T20:30:00-04:00', '2026-09-04T20:29:00-04:00'],
			['2026-09-04T20:30:00-04:00', '2026-09-07T20:29:00-04:00'],
			['2026-09-07T20:30:00-04:00', '2026-09-09T19:50:00-04:00']
		]
	);
	const offers = sale.cycles.flatMap((cycle) => cycle.offers);
	assert.equal(offers.length, 42);
	assert.ok(sale.cycles.every((cycle) => cycle.unresolvedSlots.length === 0));
	assert.ok(offers.every((entry) => entry.purchaseLimit === null));
	assert.ok(
		offers.every(
			(entry) =>
				entry.capture.status === 'verified' &&
				JSON.stringify(entry.capture.sourceIds) === JSON.stringify(['official-poster-1'])
		)
	);

	assert.deepEqual(offers.find((entry) => entry.id === 'p1-storage-expansion').contents, [
		{ itemId: 'storage-expansion-bag', quantity: 10 }
	]);
	assert.deepEqual(offers.find((entry) => entry.id === 'p4-back-to-school-bags').contents, [
		{ itemId: 'storage-expansion-bag', quantity: 5 },
		{ itemId: 'general-inventory-bag', quantity: 5 }
	]);

	const advancedGuild = offers.find((entry) => entry.id === 'p5-advanced-guild');
	assert.deepEqual(advancedGuild.contents, [
		{ itemId: 'advanced-guild-food-supply-box', quantity: 20 },
		{ itemId: 'greater-guild-coin-box', quantity: 20 },
		{ itemId: 'guild-crop-seed-box', quantity: 30 }
	]);
	assert.deepEqual(offers.find((entry) => entry.id === 'p2-mystic-fragment').contents, [
		{ itemId: 'mysterious-fragment', quantity: 1000 },
		{ itemId: 'cheerful-tengu-totem-fragment', quantity: 2000 }
	]);

	const p2 = rankFlashSaleCycle(sale, currentCatalog, 'p2');
	assert.deepEqual(
		p2.map((entry) => entry.id),
		['p2-platinum-hammer', 'p2-constellation-expansion']
	);
	assert.equal(p2[0].bundleEly, 15_000_000_000);
	assert.equal(p2[0].elyPerLtc, 15_000_000_000 / 2_590);

	const platinumHammer = currentCatalog.items.find((entry) => entry.id === 'platinum-hammer');
	assert.equal(platinumHammer.name, 'Platinum Hammer');
	assert.deepEqual(platinumHammer.aliases, []);
	for (const offerId of ['p2-platinum-hammer', 'p6-platinum-hammer']) {
		const platinumPackage = offers.find((entry) => entry.id === offerId);
		assert.equal(platinumPackage.name, 'Giga Platinum Hammer (x100)');
		assert.deepEqual(platinumPackage.contents, [
			{ itemId: 'platinum-hammer', quantity: 100 }
		]);
	}

	const p1Memorial = evaluateFlashSaleCycle(sale, currentCatalog, 'p1').find(
		(entry) => entry.id === 'p1-memorial-x'
	);
	const p5Memorial = evaluateFlashSaleCycle(sale, currentCatalog, 'p5').find(
		(entry) => entry.id === 'p5-memorial-x'
	);
	assert.deepEqual(p1Memorial.contents, [
		{ itemId: 'memorial-hero-fragment', quantity: 350 },
		{ itemId: 'memorial-reset-crystal', quantity: 150 }
	]);
	assert.equal(p1Memorial.valuationState, 'exact');
	assert.equal(p1Memorial.bundleEly, 27_000_000_000);
	assert.equal(p1Memorial.knownBundleEly, 27_000_000_000);
	assert.equal(p1Memorial.elyPerLtc, 10_000_000);
	assert.deepEqual(p5Memorial.contents, [
		{ itemId: 'memorial-reset-crystal', quantity: 150 }
	]);
	assert.equal(p5Memorial.valuationState, 'exact');
	assert.equal(p5Memorial.bundleEly, 6_000_000_000);
	assert.equal(p5Memorial.elyPerLtc, 6_000_000_000 / 2_700);
	assert.equal(
		currentCatalog.items.find((entry) => entry.id === 'memorial-hero-fragment').valuation.unitEly,
		60_000_000
	);
	assert.equal(
		sale.valuationSnapshot.find((entry) => entry.itemId === 'memorial-hero-fragment').unitEly,
		60_000_000
	);
	assert.equal(
		historicalSale.valuationSnapshot.find((entry) => entry.itemId === 'memorial-hero-fragment').unitEly,
		100_000_000
	);
	assert.equal(
		priorSale.valuationSnapshot.find((entry) => entry.itemId === 'memorial-hero-fragment').unitEly,
		60_000_000
	);

	const newPendingItemIds = [
		'storage-expansion-bag',
		'elias-royal-academy-uniform-i',
		'elias-royal-academy-uniform-ii',
		'bottle-blue-stars',
		'shining-laititia-dungeon-reset-coupon',
		'cheerful-tengu-totem-fragment',
		'daily-red-storm-potion-30d',
		'compass-of-eternity-coupon',
		'bilbradha-fashion-set-i',
		'bilbradha-fashion-set-ii',
		'mega-value-afterimage-coupon',
		'great-kina-pet-coupon',
		'festival-celebration-emoticon',
		'latale-anniversary-dance-emoticon',
		'autumn-titlebook',
		'class-set-piece-coupon'
	];
	for (const itemId of newPendingItemIds) {
		const item = currentCatalog.items.find((entry) => entry.id === itemId);
		assert.ok(item, `Missing new catalog item ${itemId}`);
		const snapshot = sale.valuationSnapshot.find((entry) => entry.itemId === itemId);
		assert.ok(snapshot, `Missing historical valuation for ${itemId}`);
		assert.equal(snapshot.status, 'pending');
		assert.equal(snapshot.unitEly, null);
	}

	const eelEnergy = currentCatalog.items.find((entry) => entry.id === 'eoli-energy-extract');
	assert.equal(eelEnergy.name, 'Eel Energy Extract');
	assert.equal(eelEnergy.valuation.status, 'unique');

	const completeness = getFlashSaleCompleteness(sale, currentCatalog);
	assert.deepEqual(completeness, {
		captured: 42,
		unresolved: 0,
		total: 42,
		fullyValued: 15,
		partiallyValued: 6,
		unranked: 21
	});
	assert.ok(
		sale.cycles
			.flatMap((cycle) => cycle.offers)
			.every((entry) => !('rank' in entry) && !('bundleEly' in entry) && !('elyPerLtc' in entry))
	);
});

test('current Before Mistwood fixture preserves all 25 offers and their valuation evidence', async () => {
	const [index, currentCatalog, sale] = await Promise.all([
		readFile(new URL('../static/data/flash-sale/index.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/catalog.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/sales/papayaplay-6401.json', import.meta.url), 'utf8').then(JSON.parse)
	]);
	assert.equal(index.currentSaleId, sale.id);
	assert.equal(sale.postId, 6401);
	assert.equal(sale.title, 'Last Call! Before Mistwood');
	assert.equal(sale.publishedAt, '2026-09-10T00:00:00-04:00');
	assert.equal(sale.expectedOfferCount, 25);
	assert.deepEqual(
		sale.cycles.map((cycle) => [cycle.id, cycle.expectedOfferCount, cycle.offers.length]),
		[['r1', 8, 8], ['r2', 9, 9], ['r3', 8, 8]]
	);
	assert.deepEqual(
		sale.cycles.map((cycle) => [cycle.startsAt, cycle.endsAt]),
		[
			['2026-09-09T20:30:00-04:00', '2026-09-11T20:29:00-04:00'],
			['2026-09-11T20:30:00-04:00', '2026-09-14T20:29:00-04:00'],
			['2026-09-14T20:30:00-04:00', '2026-09-16T19:50:00-04:00']
		]
	);
	assert.deepEqual(
		sale.cycles.map((cycle) => cycle.offers.map((entry) => entry.salePriceLtc)),
		[
			[950, 900, 690, 1990, 690, 2290, 2590, 2500],
			[1590, 1590, 690, 1290, 4500, 3590, 1095, 1095, 2290],
			[3500, 3500, 2700, 2500, 2290, 1990, 1200, 990]
		]
	);
	for (const cycle of sale.cycles) {
		assert.deepEqual(cycle.unresolvedSlots, []);
		assert.deepEqual(cycle.offers.map((entry) => entry.slot),
			Array.from({ length: cycle.expectedOfferCount }, (_, slot) => slot + 1));
	}
	const offers = sale.cycles.flatMap((cycle) => cycle.offers);
	assert.ok(offers.every((entry) => entry.purchaseLimit === null));
	for (const entry of offers) {
		assert.equal(entry.capture.status, 'verified');
		assert.deepEqual(entry.capture.sourceIds, ['official-poster-2']);
		assert.ok(!('rank' in entry) && !('bundleEly' in entry) && !('elyPerLtc' in entry));
	}

	assert.deepEqual(offers.find((entry) => entry.id === 'r2-summonable-scroll').contents, [
		{ itemId: 'summonable-upgrade-spellbook', quantity: 250 },
		{ itemId: 'advanced-summonable-upgrade-spellbook', quantity: 80 }
	]);
	assert.deepEqual(offers.find((entry) => entry.id === 'r2-guild-accessory-plus-9').contents, [
		{ itemId: 'guild-accessory-coupon-plus-9', quantity: 1 }
	]);
	assert.deepEqual(offers.find((entry) => entry.id === 'r2-gm-guild-iii').contents, [
		{ itemId: 'gm-guild-bundle-iii', quantity: 1 }
	]);
	assert.deepEqual(offers.find((entry) => entry.id === 'r3-great-nine').contents, [
		{ itemId: 'great-nine-pet-coupon', quantity: 1 },
		{ itemId: 'pet-damage-puzzle', quantity: 5 },
		{ itemId: 'pet-reassign-puzzle', quantity: 1 },
		{ itemId: 'pet-name-change-coupon', quantity: 1 }
	]);
	assert.deepEqual(offers.find((entry) => entry.id === 'r3-great-patchwork-sheepy').contents, [
		{ itemId: 'great-patchwork-sheepy-pet-coupon', quantity: 1 },
		{ itemId: 'pet-damage-puzzle', quantity: 5 },
		{ itemId: 'pet-reassign-puzzle', quantity: 5 },
		{ itemId: 'pet-name-change-coupon', quantity: 1 }
	]);

	const blueStars = sale.valuationSnapshot.find((entry) => entry.itemId === 'bottle-blue-stars');
	assert.equal(blueStars.status, 'priced');
	assert.equal(blueStars.unitEly, 700_000);
	assert.equal(blueStars.asOf, '2026-08-20');
	assert.deepEqual(blueStars.sourceIds, ['event-exchange-values-2026-08-20']);
	assert.equal(currentCatalog.items.find((entry) => entry.id === 'bottle-blue-stars').valuation.unitEly,
		700_000);
	for (const itemId of [
		'black-highteen-fashion-set-i',
		'black-highteen-fashion-set-ii',
		'summonable-upgrade-spellbook',
		'advanced-summonable-upgrade-spellbook',
		'yellow-hoppity-mount-coupon',
		'guild-accessory-coupon-plus-9',
		'gm-guild-bundle-iii',
		'great-nine-pet-coupon',
		'great-patchwork-sheepy-pet-coupon'
	]) {
		assert.ok(currentCatalog.items.some((entry) => entry.id === itemId));
		const snapshot = sale.valuationSnapshot.find((entry) => entry.itemId === itemId);
		assert.equal(snapshot.status, 'pending');
		assert.equal(snapshot.unitEly, null);
	}

	const r1 = rankFlashSaleCycle(sale, currentCatalog, 'r1');
	assert.equal(r1[0].id, 'r1-adventure-dice');
	assert.equal(r1[0].bundleEly, 17_250_000_000);
	assert.equal(r1[0].elyPerLtc, 25_000_000);
	const r3 = rankFlashSaleCycle(sale, currentCatalog, 'r3');
	assert.equal(r3[0].id, 'r3-memorial-x');
	assert.equal(r3[0].bundleEly, 27_000_000_000);
	assert.equal(r3[0].elyPerLtc, 10_000_000);
	for (const cycleId of ['r1', 'r3']) {
		const constellation = evaluateFlashSaleCycle(sale, currentCatalog, cycleId).find(
			(entry) => entry.id === `${cycleId}-constellation`
		);
		assert.equal(constellation.valuationState, 'partial');
		assert.equal(constellation.knownBundleEly, 6_100_000_000);
		assert.equal(constellation.rank, null);
	}
	assert.deepEqual(getFlashSaleCompleteness(sale, currentCatalog), {
		captured: 25,
		unresolved: 0,
		total: 25,
		fullyValued: 11,
		partiallyValued: 6,
		unranked: 8
	});
});
