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

test('historical Before Mistwood fixture preserves all 25 offers and their valuation evidence', async () => {
	const [index, currentCatalog, sale] = await Promise.all([
		readFile(new URL('../static/data/flash-sale/index.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/catalog.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/sales/papayaplay-6401.json', import.meta.url), 'utf8').then(JSON.parse)
	]);
	assert.ok(index.sales.some((entry) => entry.id === sale.id));
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

test('historical September fixture follows Discord rounds and the canonical sale poster', async () => {
	const [index, currentCatalog, sale, beforeMistwood] = await Promise.all([
		readFile(new URL('../static/data/flash-sale/index.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/catalog.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/sales/papayaplay-6421.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/sales/papayaplay-6401.json', import.meta.url), 'utf8').then(JSON.parse)
	]);
	assert.equal(sale.id, 'papayaplay-6421');
	assert.ok(index.sales.some((entry) => entry.id === sale.id));
	assert.equal(sale.postId, 6421);
	assert.equal(sale.sourceUrl, 'https://latale.papayaplay.com/latale.do?tp=news.view&postid=6421');
	assert.equal(sale.title, 'Eternal Royal Paradise - New Pet & Premium Items');
	assert.equal(sale.publishedAt, '2026-09-17T00:00:00-04:00');
	assert.equal(sale.timezone, 'America/New_York');
	assert.deepEqual(index.sales.find((entry) => entry.id === sale.id), {
		id: sale.id,
		title: sale.title,
		startsAt: '2026-09-16T20:30:00-04:00',
		endsAt: '2026-09-30T19:50:00-04:00',
		reviewedAt: sale.reviewedAt
	});
	for (const id of ['papayaplay-6332', 'papayaplay-6347', 'papayaplay-6382', 'papayaplay-6401']) {
		assert.ok(index.sales.some((entry) => entry.id === id), `Missing historical sale ${id}`);
	}
	assert.deepEqual(sale.posterUrls, [
		'https://cdn.papayaplay.com/SF/1789/6153/7052/0916_LT_Sales_poster1_fixed.jpeg',
		'https://cdn.papayaplay.com/SF/1789/6087/0834/0916_LT_Sales_poster2.jpeg'
	]);
	assert.equal(sale.sources.find((entry) => entry.id === 'official-sale-6421').url, sale.sourceUrl);
	assert.match(sale.sources.find((entry) => entry.id === 'discord-sale-6421').note, /supplied/i);
	assert.equal(sale.expectedOfferCount, 34);
	assert.deepEqual(sale.cycles.map((cycle) => cycle.expectedOfferCount), [7, 7, 5, 5, 5, 5]);
	assert.deepEqual(sale.cycles.map((cycle) => cycle.offers.length), [7, 7, 5, 5, 5, 5]);
	assert.deepEqual(
		sale.cycles.map((cycle) => [cycle.startsAt, cycle.endsAt]),
		[
			['2026-09-16T20:30:00-04:00', '2026-09-18T20:29:00-04:00'],
			['2026-09-18T20:30:00-04:00', '2026-09-21T20:29:00-04:00'],
			['2026-09-21T20:30:00-04:00', '2026-09-23T20:29:00-04:00'],
			['2026-09-23T20:30:00-04:00', '2026-09-25T20:29:00-04:00'],
			['2026-09-25T20:30:00-04:00', '2026-09-28T20:29:00-04:00'],
			['2026-09-28T20:30:00-04:00', '2026-09-30T19:50:00-04:00']
		]
	);
	assert.deepEqual(
		sale.cycles.map((cycle) => cycle.offers.map((entry) => entry.id)),
		[
			['r1-storage-expansion', 'r1-general-inventory', 'r1-adventure-dice', 'r1-platinum-hammer',
				'r1-instance-title-ii', 'r1-constellation', 'r1-constellation-expansion'],
			['r2-goddess-card', 'r2-special-weapon-skin', 'r2-strawberry-patissier-i',
				'r2-strawberry-patissier-ii', 'r2-night-camping', 'r2-power-picnic', 'r2-autumn-crates'],
			['r3-mechanical-angel-wings', 'r3-summonable-spellbooks', 'r3-memorial-x',
				'r3-constellation-expansion', 'r3-gm-guild-iii'],
			['r4-compass-eternity', 'r4-tome-ancients', 'r4-mystic-fragments', 'r4-seres-30d',
				'r4-weekly-grinder-iii'],
			['r5-cosmic-orca', 'r5-paragon-30d', 'r5-memorial-x', 'r5-great-dreamy', 'r5-great-wippy'],
			['r6-god-crafting', 'r6-masters-hand', 'r6-goddess-card', 'r6-advanced-guild', 'r6-constellation']
		]
	);
	assert.deepEqual(
		sale.cycles.map((cycle) => cycle.offers.map((entry) => entry.salePriceLtc)),
		[
			[950, 900, 690, 2590, 690, 1990, 2290],
			[2500, 1290, 1590, 1590, 1990, 1790, 4400],
			[1590, 690, 2700, 2290, 3590],
			[5000, 1095, 1500, 1095, 2490],
			[790, 1200, 2700, 3500, 3500],
			[690, 690, 2500, 990, 1990]
		]
	);
	assert.deepEqual(
		sale.cycles.map((cycle) => cycle.offers.map((entry) => entry.purchaseLimit.quantity)),
		[
			[25, 25, 50, 50, 35, 50, 30],
			[15, 15, 15, 15, 15, 35, 40],
			[10, 25, 50, 50, 20],
			[15, 20, 30, 35, 15],
			[15, 15, 50, 25, 25],
			[15, 15, 15, 20, 30]
		]
	);
	for (const cycle of sale.cycles) {
		assert.deepEqual(cycle.unresolvedSlots, []);
		assert.deepEqual(cycle.offers.map((entry) => entry.slot),
			Array.from({ length: cycle.expectedOfferCount }, (_, slot) => slot + 1));
		for (const entry of cycle.offers) {
			assert.equal(entry.purchaseLimit.scope, 'sale');
			assert.equal(entry.capture.status, 'verified');
			assert.deepEqual(entry.capture.sourceIds,
				['discord-sale-6421', cycle.id === 'r1' ? 'official-poster-1' : 'official-poster-2']);
		}
	}
	assert.deepEqual(getFlashSaleTimeline(sale, '2026-09-23T20:29:00-04:00'), {
		status: 'gap', activeCycleId: null, nextCycleId: 'r4'
	});
	assert.deepEqual(getFlashSaleTimeline(sale, '2026-09-23T20:30:00-04:00'), {
		status: 'active', activeCycleId: 'r4', nextCycleId: 'r5'
	});
	assert.equal(getFlashSaleTimeline(sale, '2026-09-30T19:50:00-04:00').status, 'ended');

	const offers = new Map(sale.cycles.flatMap((cycle) => cycle.offers).map((entry) => [entry.id, entry]));
	for (const [offerId, itemId, quantity] of [
		['r1-storage-expansion', 'storage-expansion-bag', 10],
		['r1-general-inventory', 'general-inventory-bag', 6],
		['r1-adventure-dice', 'la-tale-adventure-dice', 500],
		['r1-platinum-hammer', 'platinum-hammer', 100],
		['r4-compass-eternity', 'compass-of-eternity-coupon', 5]
	]) {
		assert.deepEqual(offers.get(offerId).contents, [{ itemId, quantity }]);
	}
	assert.deepEqual(offers.get('r3-summonable-spellbooks').contents, [
		{ itemId: 'summonable-upgrade-spellbook', quantity: 250 },
		{ itemId: 'advanced-summonable-upgrade-spell', quantity: 80 }
	]);
	assert.deepEqual(offers.get('r3-gm-guild-iii').contents, [
		{ itemId: 'guild-firepower-king-30d', quantity: 1 },
		{ itemId: 'greater-guild-coin-box', quantity: 20 },
		{ itemId: 'guild-relic-upgrade-stone', quantity: 6 },
		{ itemId: 'guild-upgrade-stone', quantity: 15 },
		{ itemId: 'guild-reward-ticket', quantity: 50 }
	]);
	assert.deepEqual(offers.get('r2-autumn-crates').contents, [
		{ itemId: 'legends-of-etoile', quantity: 20 },
		{ itemId: 'soulys-midnight-hunt', quantity: 20 },
		{ itemId: 'premium-divine-era', quantity: 20 },
		{ itemId: 'phantasmal-tin-crate', quantity: 20 }
	]);
	assert.deepEqual(offers.get('r5-great-dreamy').contents, [
		{ itemId: 'great-dreamy-fairy-pet-coupon', quantity: 1 },
		{ itemId: 'pet-damage-puzzle', quantity: 5 },
		{ itemId: 'pet-reassign-puzzle', quantity: 5 },
		{ itemId: 'pet-name-change-coupon', quantity: 1 }
	]);
	assert.deepEqual(offers.get('r5-great-wippy').contents, [
		{ itemId: 'wippy-pet-coupon', quantity: 1 },
		{ itemId: 'pet-damage-puzzle', quantity: 5 },
		{ itemId: 'pet-reassign-puzzle', quantity: 5 },
		{ itemId: 'permanent-pet-transformation-kit', quantity: 1 }
	]);
	for (const offerId of ['r3-memorial-x', 'r5-memorial-x']) {
		assert.deepEqual(offers.get(offerId).contents, [
			{ itemId: 'memorial-hero-fragment', quantity: 350 },
			{ itemId: 'memorial-reset-crystal', quantity: 150 }
		]);
	}
	assert.deepEqual(offers.get('r6-advanced-guild').contents, [
		{ itemId: 'advanced-guild-food-supply-box', quantity: 20 },
		{ itemId: 'greater-guild-coin-box', quantity: 20 },
		{ itemId: 'guild-crop-seed-box', quantity: 30 }
	]);
	assert.deepEqual(offers.get('r1-constellation').contents, offers.get('r6-constellation').contents);
	assert.deepEqual(offers.get('r1-constellation-expansion').contents,
		offers.get('r3-constellation-expansion').contents);

	const snapshot = new Map(sale.valuationSnapshot.map((entry) => [entry.itemId, entry]));
	for (const itemId of [
		'special-weapon-skin-coupon', 'strawberry-patissier-dessert-set-i',
		'strawberry-patissier-dessert-set-ii', 'night-camping-chair-coupon', 'legends-of-etoile',
		'soulys-midnight-hunt', 'premium-divine-era', 'phantasmal-tin-crate',
		'mechanical-angel-wings-mount-coupon', 'advanced-summonable-upgrade-spell',
		'cosmic-orca-damage-skin-coupon', 'great-dreamy-fairy-pet-coupon', 'wippy-pet-coupon',
		'permanent-pet-transformation-kit', 'guaranteed-god-of-crafting-titlebook',
		'guaranteed-masters-hand-titlebook'
	]) {
		const item = currentCatalog.items.find((entry) => entry.id === itemId);
		assert.ok(item, `Missing new catalog item ${itemId}`);
		for (const value of [item.valuation, snapshot.get(itemId)]) {
			assert.equal(value.status, 'pending', itemId);
			assert.equal(value.method, 'pending', itemId);
			assert.equal(value.unitEly, null, itemId);
			assert.equal(value.asOf, null, itemId);
			assert.equal(value.confidence, null, itemId);
		}
	}
	assert.equal(currentCatalog.items.find((entry) => entry.id === 'wippy-pet-coupon').name, 'Wippy Pet Coupon');
	assert.equal(currentCatalog.items.find((entry) => entry.id === 'advanced-summonable-upgrade-spell').name,
		'Advanced Summonable Upgrade Spell');
	assert.ok(!snapshot.has('advanced-summonable-upgrade-spellbook'));
	assert.ok(!snapshot.has('storage-expansion-bag-x5'));
	for (const previousValue of beforeMistwood.valuationSnapshot) {
		if (snapshot.has(previousValue.itemId)) {
			assert.deepEqual(snapshot.get(previousValue.itemId), previousValue,
				`Changed reused evidence for ${previousValue.itemId}`);
		}
	}
	assert.equal(snapshot.get('bottle-blue-stars').asOf, '2026-08-20');
	assert.equal(snapshot.get('memorial-hero-fragment').asOf, '2026-08-13');
	assert.equal(snapshot.get('la-tale-adventure-dice').asOf, '2026-08-03');
	for (const value of sale.valuationSnapshot) {
		assert.ok(value.sourceIds.every((id) => sale.sources.some((entry) => entry.id === id)));
	}
	assert.deepEqual(getFlashSaleCompleteness(sale, currentCatalog), {
		captured: 34, unresolved: 0, total: 34, fullyValued: 11, partiallyValued: 8, unranked: 15
	});
	const r1 = rankFlashSaleCycle(sale, currentCatalog, 'r1');
	assert.equal(r1[0].id, 'r1-adventure-dice');
	assert.equal(r1[0].elyPerLtc, 25_000_000);
	for (const cycleId of ['r1', 'r6']) {
		const constellation = evaluateFlashSaleCycle(sale, currentCatalog, cycleId).find(
			(entry) => entry.id === `${cycleId}-constellation`
		);
		assert.equal(constellation.valuationState, 'partial');
		assert.equal(constellation.knownBundleEly, 6_100_000_000);
		assert.equal(constellation.rank, null);
	}
});

test('current Pre-Halloween fixture preserves all 36 offers and Discord corrections', async () => {
	const [index, currentCatalog, sale, septemberSale] = await Promise.all([
		readFile(new URL('../static/data/flash-sale/index.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/catalog.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/sales/papayaplay-6457.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/flash-sale/sales/papayaplay-6421.json', import.meta.url), 'utf8').then(JSON.parse)
	]);
	assert.equal(index.currentSaleId, 'papayaplay-6457');
	assert.equal(sale.id, index.currentSaleId);
	assert.equal(sale.postId, 6457);
	assert.equal(sale.title, 'Pre-Halloween Flash Sales');
	assert.equal(sale.sourceUrl, 'https://latale.papayaplay.com/latale.do?tp=news.view&postid=6457');
	assert.equal(sale.timezone, 'America/New_York');
	assert.equal(sale.status, 'published');
	assert.deepEqual(index.sales.find((entry) => entry.id === sale.id), {
		id: sale.id,
		title: sale.title,
		startsAt: '2026-09-30T20:30:00-04:00',
		endsAt: '2026-10-14T19:50:00-04:00',
		reviewedAt: sale.reviewedAt
	});
	for (const id of ['papayaplay-6332', 'papayaplay-6347', 'papayaplay-6382', 'papayaplay-6401', 'papayaplay-6421']) {
		assert.ok(index.sales.some((entry) => entry.id === id), `Missing historical sale ${id}`);
	}
	assert.ok(sale.sources.some((entry) => entry.url === sale.sourceUrl && /Haunted Harvest/i.test(entry.title)));
	const discordSource = sale.sources.find((entry) => /discord/i.test(entry.id));
	assert.ok(discordSource, 'Missing supplied Discord evidence');
	assert.match(discordSource.note, /supplied/i);
	const posterSources = new Set(sale.sources.filter((entry) => sale.posterUrls.includes(entry.url)).map((entry) => entry.id));
	assert.ok(posterSources.size > 0, 'Missing original poster evidence');
	assert.equal(sale.expectedOfferCount, 36);
	assert.deepEqual(sale.cycles.map((cycle) => cycle.expectedOfferCount), [7, 8, 6, 5, 5, 5]);
	assert.deepEqual(sale.cycles.map((cycle) => cycle.offers.length), [7, 8, 6, 5, 5, 5]);
	assert.deepEqual(sale.cycles.map((cycle) => [cycle.startsAt, cycle.endsAt]), [
		['2026-09-30T20:30:00-04:00', '2026-10-02T20:29:00-04:00'],
		['2026-10-02T20:30:00-04:00', '2026-10-05T20:29:00-04:00'],
		['2026-10-05T20:30:00-04:00', '2026-10-07T20:29:00-04:00'],
		['2026-10-07T20:30:00-04:00', '2026-10-09T20:29:00-04:00'],
		['2026-10-09T20:30:00-04:00', '2026-10-12T20:29:00-04:00'],
		['2026-10-12T20:30:00-04:00', '2026-10-14T19:50:00-04:00']
	]);
	assert.deepEqual(sale.cycles.slice(0, 3).map((cycle) => cycle.offers.map((entry) => entry.name)), [
		['Storage Expansion Bag (x10)', 'General Inventory Bag (x6)', 'La Tale Adventure Dice Package (x500)',
			'Constellation Package', 'Instance Dungeon Guaranteed Titlebook Coupon II',
			'Constellation Expansion Package', 'Giga Platinum Hammer (x100)'],
		['Halloween Souly FX Titlebook', "Goddess' Card of Eternity", 'Blue Halloween Vampire Set I',
			'Blue Halloween Vampire Set II', 'Power Picnic Pack', 'White Pumpkin Carriage Mount Coupon',
			'October Adventures Crate Bundle I', 'Halloween Pumpkin Shadow Effect Coupon'],
		['Summonable Scroll Bundle', 'Memorial Package Bundle X', 'Grim Reaper Fashion Set',
			'Pumpkin Carriage Mount Coupon', 'Constellation Expansion Package', "GM's Guild Bundle III"]
	]);
	assert.deepEqual(sale.cycles.map((cycle) => cycle.offers.map((entry) => entry.salePriceLtc)), [
		[950, 900, 690, 1990, 690, 2290, 2590],
		[990, 2500, 1590, 1590, 1790, 1290, 4400, 890],
		[690, 2700, 1190, 1290, 2290, 3590],
		[1095, 1500, 2490, 5000, 1095],
		[1200, 2700, 3500, 3500, 690],
		[590, 490, 990, 1990, 2500]
	]);
	assert.deepEqual(sale.cycles.map((cycle) => cycle.offers.map((entry) => entry.purchaseLimit.quantity)), [
		[25, 25, 50, 40, 35, 30, 50],
		[15, 15, 15, 15, 35, 10, 20, 15],
		[25, 50, 15, 10, 30, 20],
		[35, 30, 15, 15, 20],
		[15, 50, 25, 25, 15],
		[15, 20, 20, 40, 15]
	]);
	for (const [cycleIndex, cycle] of sale.cycles.entries()) {
		assert.deepEqual(cycle.unresolvedSlots, []);
		assert.deepEqual(cycle.offers.map((entry) => entry.slot),
			Array.from({ length: cycle.expectedOfferCount }, (_, slot) => slot + 1));
		for (const entry of cycle.offers) {
			assert.equal(entry.purchaseLimit.scope, 'unknown');
			assert.equal(entry.capture.status, 'verified');
			assert.ok(entry.capture.sourceIds.some((id) => posterSources.has(id)), entry.name);
			if (cycleIndex < 3) assert.ok(entry.capture.sourceIds.includes(discordSource.id), entry.name);
			assert.ok(entry.caveats.some((note) => /gift/i.test(note) && /not available|unavailable|disabled|cannot|can't/i.test(note)),
				`Missing no-gift warning for ${entry.name}`);
		}
	}
	assert.deepEqual(getFlashSaleTimeline(sale, '2026-10-02T20:29:00-04:00'), {
		status: 'gap', activeCycleId: null, nextCycleId: sale.cycles[1].id
	});
	assert.deepEqual(getFlashSaleTimeline(sale, '2026-10-02T20:30:00-04:00'), {
		status: 'active', activeCycleId: sale.cycles[1].id, nextCycleId: sale.cycles[2].id
	});
	assert.equal(getFlashSaleTimeline(sale, '2026-10-14T19:50:00-04:00').status, 'ended');

	const offers = sale.cycles.flatMap((cycle) => cycle.offers);
	const items = new Map(currentCatalog.items.map((entry) => [entry.id, entry]));
	const contentsFor = (name) => {
		const entry = offers.find((offer) => offer.name === name);
		assert.ok(entry, `Missing offer ${name}`);
		return entry.contents.map(({ itemId, quantity }) => [items.get(itemId)?.name, quantity]);
	};
	assert.deepEqual(contentsFor('Blue Halloween Vampire Set I'), [
		['Halloween Vampire Veil II', 1], ['Halloween Vampire Suit II', 1],
		['Halloween Vampire Gloves II', 1], ['Halloween Vampire Boots II', 1], ['Halloween Power Basket', 1]
	]);
	assert.deepEqual(contentsFor('Blue Halloween Vampire Set II'), [
		['Halloween Vampire Bonnet II', 1], ['Halloween Vampire Dress II', 1],
		['Halloween Vampire Gloves II', 1], ['Halloween Vampire Heels II', 1], ['Halloween Power Basket', 1]
	]);
	assert.deepEqual(contentsFor('Grim Reaper Fashion Set'), [
		["Grim Reaper's Mask", 1], ["Grim Reaper's Ragged Outfit", 1],
		["Grim Reaper's Skull Gloves", 1], ["Grim Reaper's Skull Boots", 1], ['Halloween Power Basket', 5]
	]);
	assert.deepEqual(contentsFor('Summonable Scroll Bundle'), [
		['Summon Skill Enhancement Scroll', 250], ['Advanced Summon Skill Enhancement Scroll', 80]
	]);
	assert.deepEqual(getFlashSaleCompleteness(sale, currentCatalog), {
		captured: 36, unresolved: 0, total: 36, fullyValued: 11, partiallyValued: 8, unranked: 17
	});

	const snapshot = new Map(sale.valuationSnapshot.map((entry) => [entry.itemId, entry]));
	for (const previousValue of septemberSale.valuationSnapshot) {
		if (snapshot.has(previousValue.itemId) && previousValue.unitEly !== null) {
			assert.deepEqual(snapshot.get(previousValue.itemId), previousValue,
				`Changed reused numeric valuation evidence for ${previousValue.itemId}`);
		}
	}
	for (const value of sale.valuationSnapshot) {
		assert.ok(value.sourceIds.every((id) => sale.sources.some((entry) => entry.id === id)));
	}
	for (const name of ['Halloween Power Basket', 'Summon Skill Enhancement Scroll', 'Advanced Summon Skill Enhancement Scroll']) {
		const item = currentCatalog.items.find((entry) => entry.name === name);
		assert.ok(item, `Missing exact catalog variant ${name}`);
		for (const value of [item.valuation, snapshot.get(item.id)]) {
			assert.equal(value.status, 'pending', name);
			assert.equal(value.method, 'pending', name);
			assert.equal(value.unitEly, null, name);
			assert.equal(value.asOf, null, name);
			assert.equal(value.confidence, null, name);
		}
	}
});
