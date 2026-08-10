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

	assert.equal(ranked.length, 21);
	assert.equal(unranked.filter((offer) => offer.item.valuation === 'unique').length, 4);
	assert.equal(unranked.filter((offer) => offer.item.valuation === 'pending').length, 6);
	assert.deepEqual(
		ranked
			.filter((offer) => offer.itemId === 'premium-abio-coke')
			.map(({ stage, bundleEly, elyPerPoint }) => ({ stage, bundleEly, elyPerPoint })),
		[
			{ stage: 2, bundleEly: 18_000_000, elyPerPoint: 1_800_000 },
			{ stage: 3, bundleEly: 18_000_000, elyPerPoint: 1_800_000 }
		]
	);
	assert.deepEqual(
		ranked
			.filter((offer) =>
				[
					'bottle-of-orange-stars',
					'cheerful-tengu-totem-fragment',
					'permanent-pet-transformation-kit',
					'potion-of-resurrection'
				].includes(offer.itemId)
			)
			.map(({ itemId, stage, bundleEly, elyPerPoint }) => ({ itemId, stage, bundleEly, elyPerPoint })),
		[
			{
				itemId: 'permanent-pet-transformation-kit',
				stage: 5,
				bundleEly: 2_200_000_000,
				elyPerPoint: 2_200_000_000 / 60
			},
			{
				itemId: 'potion-of-resurrection',
				stage: 2,
				bundleEly: 60_000_000,
				elyPerPoint: 6_000_000
			},
			{
				itemId: 'cheerful-tengu-totem-fragment',
				stage: 4,
				bundleEly: 30_000_000,
				elyPerPoint: 2_000_000
			},
			{
				itemId: 'cheerful-tengu-totem-fragment',
				stage: 2,
				bundleEly: 20_000_000,
				elyPerPoint: 2_000_000
			},
			{
				itemId: 'bottle-of-orange-stars',
				stage: 5,
				bundleEly: 50_000_000,
				elyPerPoint: 50_000_000 / 30
			}
		]
	);
	assert.deepEqual(
		ranked.slice(0, 5).map(({ itemId, stage, slot, bundleEly, elyPerPoint }) => ({
			itemId,
			stage,
			slot,
			bundleEly,
			elyPerPoint
		})),
		[
			{
				itemId: 'permanent-pet-transformation-kit',
				stage: 5,
				slot: 4,
				bundleEly: 2_200_000_000,
				elyPerPoint: 2_200_000_000 / 60
			},
			{ itemId: 'gatia-sues-stone-7d', stage: 3, slot: 3, bundleEly: 520_000_000, elyPerPoint: 20_800_000 },
			{ itemId: 'la-tale-adventure-dice', stage: 2, slot: 2, bundleEly: 172_500_000, elyPerPoint: 17_250_000 },
			{ itemId: 'iceflower-charm', stage: 2, slot: 3, bundleEly: 400_000_000, elyPerPoint: 400_000_000 / 35 },
			{ itemId: 'dungeon-titlebook-1-10-coupon', stage: 5, slot: 7, bundleEly: 900_000_000, elyPerPoint: 11_250_000 }
		]
	);
});
