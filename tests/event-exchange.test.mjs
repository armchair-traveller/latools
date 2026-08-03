import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	getEventStatus,
	getExchangeCompleteness,
	rankOffers,
	unrankedOffers
} from '../src/lib/event-exchange.js';

const catalog = {
	items: [
		{ id: 'best', name: 'Best', referenceIcon: '/best.png', valuation: 'priced', unitEly: 100, priceUpdatedAt: '2026-08-02' },
		{ id: 'bundle', name: 'Bundle', referenceIcon: '/bundle.png', valuation: 'priced', unitEly: 50, priceUpdatedAt: '2026-08-02' },
		{ id: 'cheap', name: 'Cheap', referenceIcon: '/cheap.png', valuation: 'priced', unitEly: 50, priceUpdatedAt: '2026-08-02' },
		{ id: 'pending', name: 'Pending', referenceIcon: '/pending.png', valuation: 'pending', unitEly: null, priceUpdatedAt: null },
		{ id: 'unique', name: 'Unique', referenceIcon: '/unique.png', valuation: 'unique', unitEly: null, priceUpdatedAt: null }
	]
};

const event = {
	id: 'fixture',
	title: 'Fixture',
	startDate: '2026-07-15',
	endDate: '2026-08-12',
	reviewedAt: '2026-08-02',
	region: 'NA',
	source: 'Fixture',
	expectedOfferCount: 6,
	stages: [
		{
			number: 1,
			missingSlots: [6],
			offers: [
				{ slot: 1, itemId: 'best', icon: '/best.png', quantity: 2, pointCost: 10, accountLimit: 1 },
				{ slot: 2, itemId: 'bundle', icon: '/bundle.png', quantity: 4, pointCost: 20, accountLimit: 1 },
				{ slot: 3, itemId: 'cheap', icon: '/cheap.png', quantity: 2, pointCost: 10, accountLimit: 1 },
				{ slot: 4, itemId: 'pending', icon: '/pending.png', quantity: 1, pointCost: 10, accountLimit: null },
				{ slot: 5, itemId: 'unique', icon: '/unique.png', quantity: 1, pointCost: 10, accountLimit: 1 }
			]
		}
	]
};

test('ranks by Ely per point with deterministic tie-breakers', () => {
	const ranked = rankOffers(event, catalog);

	assert.deepEqual(
		ranked.map((offer) => offer.itemId),
		['best', 'bundle', 'cheap']
	);
	assert.equal(ranked[0].bundleEly, 200);
	assert.equal(ranked[0].elyPerPoint, 20);
});

test('keeps pending and unique offers distinct and out of rankings', () => {
	const unranked = unrankedOffers(event, catalog);

	assert.deepEqual(
		unranked.map((offer) => offer.itemId),
		['pending', 'unique']
	);
	assert.deepEqual(
		unranked.map((offer) => offer.item.valuation),
		['pending', 'unique']
	);
});

test('filters a ranking to one stage', () => {
	assert.equal(rankOffers(event, catalog, 2).length, 0);
	assert.equal(rankOffers(event, catalog, 1).length, 3);
});

test('reports captured and missing coverage', () => {
	assert.deepEqual(getExchangeCompleteness(event), { captured: 5, missing: 1, total: 6 });
});

test('derives event status from inclusive date bounds', () => {
	assert.equal(getEventStatus(event, '2026-07-14'), 'upcoming');
	assert.equal(getEventStatus(event, '2026-07-15'), 'current');
	assert.equal(getEventStatus(event, '2026-08-12'), 'current');
	assert.equal(getEventStatus(event, '2026-08-13'), 'ended');
});

test('current event keeps unique rewards separate and ranks confirmed values', async () => {
	const [currentCatalog, currentEvent] = await Promise.all([
		readFile(new URL('../static/data/event-exchange/catalog.json', import.meta.url), 'utf8').then(JSON.parse),
		readFile(new URL('../static/data/event-exchange/current.json', import.meta.url), 'utf8').then(JSON.parse)
	]);
	const ranked = rankOffers(currentEvent, currentCatalog);
	const unranked = unrankedOffers(currentEvent, currentCatalog);

	assert.equal(ranked.length, 17);
	assert.equal(unranked.filter((offer) => offer.item.valuation === 'unique').length, 4);
	assert.equal(unranked.filter((offer) => offer.item.valuation === 'pending').length, 10);
	assert.deepEqual(
		ranked.slice(0, 5).map(({ itemId, stage, slot, bundleEly, elyPerPoint }) => ({
			itemId,
			stage,
			slot,
			bundleEly,
			elyPerPoint
		})),
		[
			{ itemId: 'premium-abio-coke', stage: 2, slot: 5, bundleEly: 600_000_000, elyPerPoint: 60_000_000 },
			{ itemId: 'premium-abio-coke', stage: 3, slot: 2, bundleEly: 600_000_000, elyPerPoint: 60_000_000 },
			{ itemId: 'gatia-sues-stone-7d', stage: 3, slot: 3, bundleEly: 520_000_000, elyPerPoint: 20_800_000 },
			{ itemId: 'la-tale-adventure-dice', stage: 2, slot: 2, bundleEly: 172_500_000, elyPerPoint: 17_250_000 },
			{ itemId: 'potion-of-resurrection', stage: 2, slot: 6, bundleEly: 120_000_000, elyPerPoint: 12_000_000 }
		]
	);
});
