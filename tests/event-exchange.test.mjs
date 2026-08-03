import assert from 'node:assert/strict';
import test from 'node:test';
import {
	getEventStatus,
	getExchangeCompleteness,
	rankOffers,
	unpricedOffers
} from '../src/lib/event-exchange.js';

const catalog = {
	items: [
		{ id: 'best', name: 'Best', referenceIcon: '/best.png', unitEly: 100, priceUpdatedAt: '2026-08-02' },
		{ id: 'bundle', name: 'Bundle', referenceIcon: '/bundle.png', unitEly: 50, priceUpdatedAt: '2026-08-02' },
		{ id: 'cheap', name: 'Cheap', referenceIcon: '/cheap.png', unitEly: 50, priceUpdatedAt: '2026-08-02' },
		{ id: 'pending', name: null, referenceIcon: '/pending.png', unitEly: null, priceUpdatedAt: null }
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
	expectedOfferCount: 5,
	stages: [
		{
			number: 1,
			missingSlots: [5],
			offers: [
				{ slot: 1, itemId: 'best', icon: '/best.png', quantity: 2, pointCost: 10, accountLimit: 1 },
				{ slot: 2, itemId: 'bundle', icon: '/bundle.png', quantity: 4, pointCost: 20, accountLimit: 1 },
				{ slot: 3, itemId: 'cheap', icon: '/cheap.png', quantity: 2, pointCost: 10, accountLimit: 1 },
				{ slot: 4, itemId: 'pending', icon: '/pending.png', quantity: 1, pointCost: 10, accountLimit: null }
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

test('keeps unpriced offers out of rankings', () => {
	assert.deepEqual(
		unpricedOffers(event, catalog).map((offer) => offer.itemId),
		['pending']
	);
});

test('filters a ranking to one stage', () => {
	assert.equal(rankOffers(event, catalog, 2).length, 0);
	assert.equal(rankOffers(event, catalog, 1).length, 3);
});

test('reports captured and missing coverage', () => {
	assert.deepEqual(getExchangeCompleteness(event), { captured: 4, missing: 1, total: 5 });
});

test('derives event status from inclusive date bounds', () => {
	assert.equal(getEventStatus(event, '2026-07-14'), 'upcoming');
	assert.equal(getEventStatus(event, '2026-07-15'), 'current');
	assert.equal(getEventStatus(event, '2026-08-12'), 'current');
	assert.equal(getEventStatus(event, '2026-08-13'), 'ended');
});
