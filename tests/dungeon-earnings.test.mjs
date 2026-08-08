import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
	D5_MATERIAL_BONUS_RATE,
	MARKET_SELLING_FEE_RATE,
	calculateDungeonEarnings,
	validateDungeonBuffSelection
} from '../src/lib/dungeon-earnings.js';
import {
	formatCompactEly,
	formatCompactElyAmount,
	normalizeElyInput,
	parseElyInput
} from '../src/lib/ely.js';

test('parses and formats compact Ely values', () => {
	assert.equal(parseElyInput('2.5m'), 2_500_000);
	assert.equal(parseElyInput('200M'), 200_000_000);
	assert.equal(parseElyInput('9 b'), 9_000_000_000);
	assert.equal(parseElyInput('2500k'), 2_500_000);
	assert.equal(parseElyInput('2,500,000'), 2_500_000);
	assert.equal(parseElyInput('1.000000001b'), 1_000_000_001);
	assert.equal(parseElyInput('9,007,199,254,740,991'), Number.MAX_SAFE_INTEGER);
	assert.equal(parseElyInput('2,50'), null);
	assert.equal(parseElyInput('1,,000'), null);
	assert.equal(parseElyInput('1.25'), null);
	assert.equal(parseElyInput('-1m'), null);
	assert.equal(parseElyInput('1e6'), null);
	assert.equal(parseElyInput('1mm'), null);
	assert.equal(parseElyInput('10t'), null);
	assert.equal(parseElyInput('9007199.254741b'), null);
	assert.equal(parseElyInput('not Ely'), null);
	assert.equal(formatCompactElyAmount(2_500_000), '2.5m');
	assert.equal(formatCompactEly(613_500_000), '613.5m Ely');
	assert.equal(formatCompactEly(4_440_166_667), '≈4.44b Ely');
	assert.equal(formatCompactEly(null), 'Pending');
	assert.equal(formatCompactEly(Number.NaN), '—');
	assert.equal(normalizeElyInput('1234567'), '1,234,567');
	assert.equal(normalizeElyInput('1.234567m'), '1.234567m');
	assert.equal(parseElyInput(normalizeElyInput('1234567')), 1_234_567);
	assert.equal(parseElyInput(normalizeElyInput('1.234567m')), 1_234_567);
	assert.equal(
		parseElyInput(normalizeElyInput(String(Number.MAX_SAFE_INTEGER))),
		Number.MAX_SAFE_INTEGER
	);
});

const catalog = {
	schemaVersion: 1,
	id: 'fixture',
	updatedAt: '2026-08-07',
	market: {
		id: 'papayaplay-na',
		label: 'Global',
		region: 'NA',
		feeRate: 0.01,
		currency: 'Ely'
	},
	d5MaterialBonusRate: 0.05,
	sources: [],
	rewardItems: [
		{
			id: 'material',
			name: 'Material',
			route: 'market',
			marketConversionCostPerUnitEly: 50,
			icon: '/material.png',
			sourceIds: []
		},
		{ id: 'coupon', name: 'Coupon', route: 'market', icon: '/coupon.png', sourceIds: [] },
		{ id: 'stone', name: 'Stone', route: 'service', icon: '/stone.png', sourceIds: [] },
		{
			id: 'pending-route',
			name: 'Pending route',
			route: 'pending',
			icon: '/pending.png',
			sourceIds: []
		}
	],
	serviceRecipes: [
		{
			id: 'priority-service',
			name: 'Priority service',
			inputs: [
				{ itemId: 'material', quantity: 3 },
				{ itemId: 'stone', quantity: 2 }
			],
			providerElyCostEly: 100,
			customerPriceItemId: 'priority-service-price',
			customerSuppliedSealLocks: 50,
			customerSuppliedEquipment: true,
			sourceIds: [],
			note: 'First strategy.',
			status: 'confirmed'
		},
		{
			id: 'leftover-service',
			name: 'Leftover service',
			inputs: [{ itemId: 'material', quantity: 2 }],
			providerElyCostEly: 50,
			customerPriceItemId: 'leftover-service-price',
			customerSuppliedSealLocks: 40,
			customerSuppliedEquipment: true,
			sourceIds: [],
			note: 'Uses only inventory left by the first strategy.',
			status: 'provisional'
		}
	],
	dungeons: [
		{
			id: 'fixture-dungeon',
			name: 'Fixture Dungeon',
			requirement: { kind: 'ascension', value: 8000, label: 'Ascension 8000' },
			image: '/fixture.png',
			sourceIds: [],
			difficulties: {
				D4: {
					rewards: [
						{
							itemId: 'material',
							yield: { status: 'known', expectedPerClear: 10, note: 'Fixture' },
							d5BonusEligible: false
						},
						{
							itemId: 'coupon',
							yield: { status: 'known', expectedPerClear: 3, note: 'Fixture' },
							d5BonusEligible: false
						},
						{
							itemId: 'stone',
							yield: { status: 'known', expectedPerClear: 4, note: 'Fixture' },
							d5BonusEligible: false
						}
					],
					serviceStrategyIds: ['priority-service', 'leftover-service']
				},
				D5: {
					rewards: [
						{
							itemId: 'material',
							yield: {
								status: 'known',
								expectedPerClear: 127.5,
								note: 'Maintained total already includes the bonus bag.'
							},
							d5BonusEligible: false
						},
						{
							itemId: 'coupon',
							yield: { status: 'known', expectedPerClear: 3, note: 'Fixed D5 reward' },
							d5BonusEligible: false
						},
						{
							itemId: 'stone',
							yield: { status: 'known', expectedPerClear: 21, note: 'Fixed D5 reward' },
							d5BonusEligible: false
						}
					],
					serviceStrategyIds: []
				}
			}
		}
	],
	buffs: [
		{
			id: 'timed-buff',
			name: 'Timed buff',
			description: 'Fixture',
			durationSeconds: 1800,
			consumablesPerActivation: 1,
			priceMode: 'snapshot',
			priceEditable: true,
			priceItemId: 'timed-buff-price',
			essential: false,
			standardPreset: true,
			exclusivityGroup: null,
			icon: '/timed-buff.png',
			sourceIds: []
		},
		{
			id: 'fixed-zero',
			name: 'Fixed zero',
			description: 'Not purchasable.',
			durationSeconds: 3600,
			consumablesPerActivation: 1,
			priceMode: 'fixed-zero',
			priceEditable: false,
			priceItemId: null,
			essential: false,
			standardPreset: false,
			exclusivityGroup: null,
			icon: '/fixed-zero.png',
			sourceIds: []
		},
		{
			id: 'fixed-snapshot',
			name: 'Fixed snapshot',
			description: 'Fixed source price.',
			durationSeconds: 3600,
			consumablesPerActivation: 1,
			priceMode: 'snapshot',
			priceEditable: false,
			priceItemId: 'fixed-snapshot-price',
			essential: false,
			standardPreset: false,
			exclusivityGroup: null,
			icon: '/fixed-snapshot.png',
			sourceIds: []
		},
		{
			id: 'premium-syrup',
			name: 'Premium Syrup',
			description: 'Fixture',
			durationSeconds: 7200,
			consumablesPerActivation: 1,
			priceMode: 'snapshot',
			priceEditable: true,
			priceItemId: 'premium-syrup',
			essential: false,
			standardPreset: false,
			exclusivityGroup: 'syrup',
			icon: '/premium.png',
			sourceIds: []
		},
		{
			id: 'advanced-premium-syrup',
			name: 'Advanced Premium Syrup',
			description: 'Fixture',
			durationSeconds: 3600,
			consumablesPerActivation: 1,
			priceMode: 'snapshot',
			priceEditable: true,
			priceItemId: 'advanced-premium-syrup',
			alternativePrice: { priceItemId: 'premium-syrup', quantity: 2 },
			essential: false,
			standardPreset: true,
			exclusivityGroup: 'syrup',
			icon: '/advanced.png',
			sourceIds: []
		},
		{
			id: 'exclusive-a',
			name: 'Exclusive A',
			description: 'Fixture',
			durationSeconds: 3600,
			consumablesPerActivation: 1,
			priceMode: 'fixed-zero',
			priceEditable: false,
			priceItemId: null,
			essential: false,
			standardPreset: false,
			exclusivityGroup: 'exclusive',
			icon: '/a.png',
			sourceIds: []
		},
		{
			id: 'exclusive-b',
			name: 'Exclusive B',
			description: 'Fixture',
			durationSeconds: 3600,
			consumablesPerActivation: 1,
			priceMode: 'fixed-zero',
			priceEditable: false,
			priceItemId: null,
			essential: false,
			standardPreset: false,
			exclusivityGroup: 'exclusive',
			icon: '/b.png',
			sourceIds: []
		},
		{
			id: 'unpriced-buff',
			name: 'Unpriced buff',
			description: 'Fixture',
			durationSeconds: 3600,
			consumablesPerActivation: 1,
			priceMode: 'snapshot',
			priceEditable: true,
			priceItemId: 'unpriced-buff-price',
			essential: false,
			standardPreset: false,
			exclusivityGroup: null,
			icon: '/unpriced.png',
			sourceIds: []
		}
	]
};

const priced = (itemId, kind, unitEly) => ({
	itemId,
	kind,
	status: 'priced',
	unitEly,
	asOf: '2026-08-07',
	sourceIds: [],
	note: 'Fixture'
});

const pending = (itemId, kind) => ({
	itemId,
	kind,
	status: 'pending',
	unitEly: null,
	asOf: null,
	sourceIds: [],
	note: 'Fixture'
});

const snapshot = {
	schemaVersion: 1,
	id: 'fixture-2026-08-07',
	marketId: 'papayaplay-na',
	currency: 'Ely',
	asOf: '2026-08-07',
	reviewedAt: '2026-08-07',
	sources: [],
	prices: [
		priced('material', 'market', 100),
		priced('coupon', 'market', 200),
		priced('priority-service-price', 'service', 1000),
		priced('leftover-service-price', 'service', 500),
		priced('timed-buff-price', 'buff', 600),
		priced('fixed-snapshot-price', 'buff', 1000),
		priced('premium-syrup', 'buff', 150_000_000),
		priced('advanced-premium-syrup', 'buff', 250_000_000),
		pending('unpriced-buff-price', 'buff')
	]
};

const calculate = (overrides = {}) =>
	calculateDungeonEarnings({
		catalog,
		snapshot,
		dungeonId: 'fixture-dungeon',
		difficulty: 'D4',
		clearTimeSeconds: 600,
		selectedBuffIds: ['timed-buff'],
		...overrides
	});

test('exports the locked market fee and compatibility D5 bonus rate', () => {
	assert.equal(MARKET_SELLING_FEE_RATE, 0.01);
	assert.equal(D5_MATERIAL_BONUS_RATE, 0.05);
});

test('allocates prioritized services from one inventory and auctions only leftovers', () => {
	const result = calculate();
	const material = result.rewardRows.find((row) => row.itemId === 'material');
	const [priority, leftover] = result.serviceStrategyRows;

	assert.equal(result.clearsPerHour, 6);
	assert.equal(priority.servicesPerClear, 2);
	assert.equal(priority.inputs[0].availableBeforePerClear, 10);
	assert.equal(priority.inputs[0].consumedPerClear, 6);
	assert.equal(priority.inputs[0].remainingAfterPerClear, 4);
	assert.equal(leftover.servicesPerClear, 2);
	assert.equal(leftover.inputs[0].availableBeforePerClear, 4);
	assert.equal(leftover.inputs[0].remainingAfterPerClear, 0);
	assert.equal(material.allocatedToServicesPerClear, 10);
	assert.equal(material.remainingAfterServicesPerClear, 0);

	assert.equal(result.perClear.marketGrossEly, 1600);
	assert.equal(result.perClear.marketFeeEly, 16);
	assert.equal(result.perClear.marketConversionCostEly, 500);
	assert.equal(result.perClear.marketNetEly, 1084);
	assert.equal(result.perClear.serviceFirstMarketGrossEly, 600);
	assert.equal(result.perClear.serviceFirstMarketFeeEly, 6);
	assert.equal(result.perClear.serviceFirstMarketConversionCostEly, 0);
	assert.equal(result.perClear.serviceFirstMarketNetEly, 594);
	assert.equal(result.perClear.serviceGrossEly, 3000);
	assert.equal(result.perClear.serviceProviderCostEly, 300);
	assert.equal(result.perClear.serviceRawNetEly, 2700);
	assert.equal(result.perClear.totalRewardProceedsEly, 3294);
	assert.equal(result.perHour.buffCostEly, 1200);
	assert.equal(result.perHour.directNetEly, 5304);
	assert.equal(result.perHour.potentialNetEly, 18_564);
	assert.equal(result.estimateState, 'complete');
});

test('customer-supplied locks and equipment are disclosed but not deducted', () => {
	const result = calculate({ selectedBuffIds: [] });
	const priority = result.serviceStrategyRows[0];
	assert.equal(priority.customerSuppliedSealLocks, 50);
	assert.equal(priority.customerSuppliedEquipment, true);
	assert.equal(priority.providerCostPerClearEly, 200);
	assert.equal(priority.netPerClearEly, 1800);
});

test('keeps non-divisor clear rates and all service quantities fractional', () => {
	const changed = structuredClone(catalog);
	changed.dungeons[0].difficulties.D4.rewards.find((reward) => reward.itemId === 'stone').yield.expectedPerClear = 1.5;
	const result = calculate({ catalog: changed, clearTimeSeconds: 17 * 60, selectedBuffIds: [] });
	assert.equal(result.clearsPerHour, 60 / 17);
	assert.equal(result.serviceStrategyRows[0].servicesPerClear, 0.75);
});

test('retains maintained D5 expected yields without applying the bonus a second time', () => {
	const result = calculate({ difficulty: 'D5', selectedBuffIds: [] });
	const material = result.rewardRows.find((row) => row.itemId === 'material');
	const coupon = result.rewardRows.find((row) => row.itemId === 'coupon');
	const stone = result.rewardRows.find((row) => row.itemId === 'stone');

	assert.equal(material.baseExpectedPerClear, 127.5);
	assert.equal(material.bonusRate, 0);
	assert.equal(material.effectiveExpectedPerClear, 127.5);
	assert.equal(coupon.effectiveExpectedPerClear, 3);
	assert.equal(stone.effectiveExpectedPerClear, 21);
});

test('supports the legacy D5 bonus marker without affecting maintained rows', () => {
	const changed = structuredClone(catalog);
	changed.dungeons[0].difficulties.D5.rewards[0].d5BonusEligible = true;
	const result = calculate({ catalog: changed, difficulty: 'D5', selectedBuffIds: [] });
	assert.equal(result.rewardRows[0].effectiveExpectedPerClear, 127.5 * 1.05);
});

test('subtracts the 1% fee and per-unit conversion cost from gross material prices', () => {
	const changedCatalog = structuredClone(catalog);
	changedCatalog.dungeons[0].difficulties.D4.rewards = [
		{
			itemId: 'material',
			yield: { status: 'known', expectedPerClear: 1, note: 'Fixture' },
			d5BonusEligible: false
		}
	];
	changedCatalog.dungeons[0].difficulties.D4.serviceStrategyIds = [];
	changedCatalog.rewardItems[0].marketConversionCostPerUnitEly = 50_000;

	for (const [gross, expectedNet] of [
		[2_500_000, 2_425_000],
		[6_000_000, 5_890_000]
	]) {
		const result = calculate({
			catalog: changedCatalog,
			selectedBuffIds: [],
			priceOverrides: { material: gross }
		});
		assert.equal(result.perClear.marketNetEly, expectedNet);
	}
});

test('charges the auction fee to all three advanced coupons', () => {
	const changedCatalog = structuredClone(catalog);
	changedCatalog.dungeons[0].difficulties.D4.rewards = [
		{
			itemId: 'coupon',
			yield: { status: 'known', expectedPerClear: 3, note: 'Fixture' },
			d5BonusEligible: false
		}
	];
	changedCatalog.dungeons[0].difficulties.D4.serviceStrategyIds = [];
	for (const [unitPrice, expectedNet] of [
		[200_000_000, 594_000_000],
		[255_000_000, 757_350_000],
		[180_000_000, 534_600_000],
		[260_000_000, 772_200_000]
	]) {
		const result = calculate({
			catalog: changedCatalog,
			selectedBuffIds: [],
			priceOverrides: { coupon: unitPrice }
		});
		assert.equal(result.perClear.marketNetEly, expectedNet);
	}
});

test('calculates syrup duration cost and chooses the cheaper Advanced Premium source', () => {
	const premium = calculate({ selectedBuffIds: ['premium-syrup'] });
	assert.equal(premium.buffRows[0].costPerHourEly, 75_000_000);

	const advanced = calculate({ selectedBuffIds: ['advanced-premium-syrup'] });
	assert.equal(advanced.buffRows[0].unitPriceEly, 250_000_000);
	assert.equal(advanced.buffRows[0].alternativeCostEly, 300_000_000);
	assert.equal(advanced.buffRows[0].chosenPricePath, 'direct');
	assert.equal(advanced.perHour.buffCostEly, 250_000_000);

	const converted = calculate({
		selectedBuffIds: ['advanced-premium-syrup'],
		priceOverrides: { 'premium-syrup': 100_000_000 }
	});
	assert.equal(converted.buffRows[0].unitPriceEly, 200_000_000);
	assert.equal(converted.buffRows[0].priceSource, 'derived');
	assert.equal(converted.buffRows[0].chosenPricePath, 'alternative');
	assert.deepEqual(converted.overriddenPriceIds, ['premium-syrup']);

	const directOverride = calculate({
		selectedBuffIds: ['advanced-premium-syrup'],
		priceOverrides: {
			'advanced-premium-syrup': 190_000_000,
			'premium-syrup': 100_000_000
		}
	});
	assert.equal(directOverride.buffRows[0].unitPriceEly, 190_000_000);
	assert.deepEqual(directOverride.overriddenPriceIds, ['advanced-premium-syrup']);
});

test('uses fixed-zero and fixed snapshot prices without accepting overrides', () => {
	const result = calculate({
		selectedBuffIds: ['fixed-zero', 'fixed-snapshot'],
		priceOverrides: { 'fixed-snapshot-price': 999_999 }
	});
	assert.equal(result.buffRows[0].unitPriceEly, 0);
	assert.equal(result.buffRows[0].priceSource, 'fixed');
	assert.equal(result.buffRows[1].unitPriceEly, 1000);
	assert.equal(result.buffRows[1].priceSource, 'snapshot');
	assert.deepEqual(result.overriddenPriceIds, []);
});

test('always includes and deduplicates the essential buff baseline', () => {
	const changed = structuredClone(catalog);
	const essential = changed.buffs.find((buff) => buff.id === 'fixed-snapshot');
	essential.essential = true;
	essential.standardPreset = true;

	const essentialsOnly = calculate({ catalog: changed, selectedBuffIds: [] });
	assert.deepEqual(
		essentialsOnly.buffRows.map((row) => row.buffId),
		['fixed-snapshot']
	);
	assert.equal(essentialsOnly.perHour.buffCostEly, 1000);

	const withOptional = calculate({
		catalog: changed,
		selectedBuffIds: ['timed-buff', 'fixed-snapshot', 'fixed-snapshot']
	});
	assert.deepEqual(
		withOptional.buffRows.map((row) => row.buffId),
		['timed-buff', 'fixed-snapshot']
	);
	assert.equal(withOptional.perHour.buffCostEly, 2200);
});

test('deduplicates buffs and rejects unknown or mutually exclusive selections', () => {
	const duplicate = calculate({ selectedBuffIds: ['timed-buff', 'timed-buff'] });
	assert.equal(duplicate.buffRows.length, 1);
	assert.equal(duplicate.perHour.buffCostEly, 1200);
	assert.deepEqual(
		validateDungeonBuffSelection(catalog, ['exclusive-a']).map((buff) => buff.id),
		['exclusive-a']
	);
	assert.throws(
		() => calculate({ selectedBuffIds: ['exclusive-a', 'exclusive-b'] }),
		/Conflicting buffs in exclusivity group exclusive/
	);
	assert.throws(() => calculate({ selectedBuffIds: ['unknown'] }), /Unknown dungeon-earnings buff/);
});

test('blocks net estimates for an unpriced selected buff until an override is supplied', () => {
	const blocked = calculate({ selectedBuffIds: ['unpriced-buff'] });
	assert.equal(blocked.estimateState, 'blocked');
	assert.equal(blocked.perHour.buffCostEly, null);
	assert.equal(blocked.perHour.directNetEly, null);
	assert.equal(blocked.perHour.potentialNetEly, null);
	assert.deepEqual(blocked.missingBuffPriceIds, ['unpriced-buff-price']);

	const resolved = calculate({
		selectedBuffIds: ['unpriced-buff'],
		priceOverrides: { 'unpriced-buff-price': 500 }
	});
	assert.equal(resolved.estimateState, 'complete');
	assert.equal(resolved.perHour.buffCostEly, 500);
	assert.deepEqual(resolved.overriddenPriceIds, ['unpriced-buff-price']);
});

test('reports missing market and service prices without treating either as zero-valued income', () => {
	const changed = structuredClone(snapshot);
	for (const itemId of ['material', 'priority-service-price']) {
		const entry = changed.prices.find((price) => price.itemId === itemId);
		entry.status = 'pending';
		entry.unitEly = null;
		entry.asOf = null;
	}
	const result = calculate({ snapshot: changed, selectedBuffIds: [] });
	assert.equal(result.estimateState, 'lower-bound');
	assert.deepEqual(result.missingIncomePriceIds, ['priority-service-price', 'material']);
	assert.equal(result.rewardRows.find((row) => row.itemId === 'material').grossPerClearEly, null);
	assert.equal(result.serviceStrategyRows[0].grossPerClearEly, null);
	assert.equal(result.perClear.serviceFirstMarketNetEly, 594);
	assert.equal(result.perClear.serviceRawNetEly, 900);
});

test('propagates pending yields through prioritized allocation', () => {
	const changed = structuredClone(catalog);
	const material = changed.dungeons[0].difficulties.D4.rewards.find(
		(reward) => reward.itemId === 'material'
	);
	material.yield = { status: 'pending', expectedPerClear: null, note: 'Unknown average' };
	const result = calculate({ catalog: changed, selectedBuffIds: [] });
	assert.equal(result.estimateState, 'lower-bound');
	assert.equal(result.serviceStrategyRows[0].servicesPerClear, null);
	assert.equal(result.serviceStrategyRows[1].servicesPerClear, null);
	assert.equal(
		result.rewardRows.find((row) => row.itemId === 'material').remainingAfterServicesPerClear,
		null
	);
	assert.ok(result.missingMechanicIds.includes('yield:fixture-dungeon:D4:material'));
});

test('rejects invalid times, recipes, D4 bonus markers, and unsafe calculations', () => {
	for (const clearTimeSeconds of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
		assert.throws(() => calculate({ clearTimeSeconds }), /clearTimeSeconds/);
	}
	assert.throws(() => calculate({ clearTimeSeconds: Number.MIN_VALUE }), /clearsPerHour/);

	const invalidRecipe = structuredClone(catalog);
	invalidRecipe.serviceRecipes[0].inputs[0].quantity = 0;
	assert.throws(() => calculate({ catalog: invalidRecipe }), /Service input quantity/);

	const invalidBonus = structuredClone(catalog);
	invalidBonus.dungeons[0].difficulties.D4.rewards[0].d5BonusEligible = true;
	assert.throws(() => calculate({ catalog: invalidBonus }), /cannot be applied to D4/);
	assert.throws(
		() => calculate({ snapshot: { ...snapshot, marketId: 'another-market' } }),
		/does not match the catalog market/
	);
	assert.throws(
		() => calculate({ selectedBuffIds: [], priceOverrides: { material: Number.MAX_SAFE_INTEGER } }),
		/Direct market material gross/
	);
});

test('checked-in data contains the confirmed yields, routes, prices, and all four profiles', async () => {
	const [currentCatalog, index] = await Promise.all([
		readFile(new URL('../static/data/dungeon-earnings/catalog.json', import.meta.url), 'utf8').then(
			JSON.parse
		),
		readFile(new URL('../static/data/dungeon-earnings/index.json', import.meta.url), 'utf8').then(
			JSON.parse
		)
	]);
	const currentEntry = index.snapshots.find((entry) => entry.id === index.currentSnapshotId);
	assert.ok(currentEntry);
	const currentSnapshot = JSON.parse(
		await readFile(new URL(`../static${currentEntry.path}`, import.meta.url), 'utf8')
	);
	const currentBuffs = new Map(currentCatalog.buffs.map((buff) => [buff.id, buff]));
	const essentialBuffIds = [
		'flasks',
		'critical-oil',
		'alvis-support-potion',
		'hunter-hp-recovery-kit-30',
		'mysterious-critical-damage-amplifier'
	];

	assert.deepEqual(
		currentCatalog.buffs.filter((buff) => buff.essential).map((buff) => buff.id),
		essentialBuffIds
	);
	assert.ok(
		essentialBuffIds.every((buffId) => {
			const buff = currentBuffs.get(buffId);
			return buff?.standardPreset === true && buff.exclusivityGroup === null;
		})
	);

	assert.equal(
		currentBuffs.get('mysterious-critical-damage-amplifier')?.exclusivityGroup,
		null
	);
	assert.equal(currentBuffs.has('mysterious-critical-chance-amplifier'), false);
	assert.equal(currentBuffs.has('mysterious-damage-amplifier'), false);
	assert.equal(currentBuffs.has('sweet-mutant-special-potion'), false);
	assert.equal(currentBuffs.get('critical-oil')?.priceEditable, true);
	assert.ok(
		[
			'flasks',
			'alvis-support-potion',
			'hunter-hp-recovery-kit-30',
			'mysterious-critical-damage-amplifier'
		].every((buffId) => currentBuffs.get(buffId)?.priceEditable === false)
	);
	assert.match(currentBuffs.get('shining-storm-potion')?.description ?? '', /Critical rate \+100/);
	assert.equal(currentBuffs.get('heroes-set')?.name, "Hero's Set");
	assert.equal(currentBuffs.get('heroes-set')?.exclusivityGroup, 'heroes-attack');
	assert.equal(currentBuffs.get('heroes-set')?.standardPreset, true);
	assert.equal(
		currentBuffs.get('heroes-attack-nostrum-ii')?.name,
		"Hero's Attack Nostrum II"
	);
	assert.equal(currentBuffs.get('heroes-attack-nostrum-ii')?.exclusivityGroup, 'heroes-attack');
	assert.equal(currentBuffs.get('heroes-attack-nostrum-ii')?.standardPreset, false);
	assert.equal(
		currentSnapshot.prices.find((price) => price.itemId === 'heroes-set')?.unitEly,
		245_000_000
	);
	assert.equal(
		currentSnapshot.prices.find((price) => price.itemId === 'heroes-attack-nostrum-ii')
			?.unitEly,
		95_000_000
	);
	assert.throws(
		() =>
			calculateDungeonEarnings({
				catalog: currentCatalog,
				snapshot: currentSnapshot,
				dungeonId: 'pleroma',
				difficulty: 'D4',
				clearTimeSeconds: 3600,
				selectedBuffIds: ['heroes-set', 'heroes-attack-nostrum-ii']
			}),
		/Conflicting buffs in exclusivity group heroes-attack/
	);
	const essentialsOnly = calculateDungeonEarnings({
		catalog: currentCatalog,
		snapshot: currentSnapshot,
		dungeonId: 'pleroma',
		difficulty: 'D4',
		clearTimeSeconds: 3600,
		selectedBuffIds: []
	});
	assert.deepEqual(
		essentialsOnly.buffRows.map((row) => row.buffId),
		essentialBuffIds
	);
	assert.equal(essentialsOnly.perHour.buffCostEly, 18_500_000);

	const defaultOptionalBuffIds = [
		'advanced-premium-syrup',
		'heroes-set',
		'shining-storm-potion'
	];
	const defaultBuffs = calculateDungeonEarnings({
		catalog: currentCatalog,
		snapshot: currentSnapshot,
		dungeonId: 'pleroma',
		difficulty: 'D4',
		clearTimeSeconds: 3600,
		selectedBuffIds: defaultOptionalBuffIds
	});
	assert.deepEqual(
		defaultBuffs.buffRows.slice(0, defaultOptionalBuffIds.length).map((row) => row.buffId),
		defaultOptionalBuffIds
	);
	assert.equal(defaultBuffs.perHour.buffCostEly, 613_500_000);

	const heroesTwoOnly = calculateDungeonEarnings({
		catalog: currentCatalog,
		snapshot: currentSnapshot,
		dungeonId: 'pleroma',
		difficulty: 'D4',
		clearTimeSeconds: 3600,
		selectedBuffIds: ['heroes-attack-nostrum-ii']
	});
	assert.equal(heroesTwoOnly.perHour.buffCostEly, 113_500_000);
	assert.equal(
		heroesTwoOnly.buffRows.find((row) => row.buffId === 'heroes-attack-nostrum-ii')
			?.costPerHourEly,
		95_000_000
	);

	assert.deepEqual(
		currentCatalog.dungeons.map((dungeon) => dungeon.id),
		['pleroma', 'emeraldia', 'wings-of-icarus', 'likimo-pelke']
	);
	const couponPrices = new Map([
		['pleroma', 200_000_000],
		['emeraldia', 255_000_000],
		['wings-of-icarus', 180_000_000],
		['likimo-pelke', 260_000_000]
	]);

	for (const dungeon of currentCatalog.dungeons) {
		for (const difficulty of ['D4', 'D5']) {
			const profile = dungeon.difficulties[difficulty];
			assert.ok(profile);
			const mainRewards = profile.rewards.filter(
				(reward) =>
					!reward.itemId.endsWith('advanced-equipment-coupon') &&
					!reward.itemId.endsWith('ascension-stone')
			);
			const expectedMainYield =
				difficulty === 'D4'
					? 118
					: ['wings-of-icarus', 'likimo-pelke'].includes(dungeon.id)
						? 127.5
						: 121;
			assert.equal(mainRewards.length, 2);
			assert.ok(
				mainRewards.every(
					(reward) =>
						reward.yield.expectedPerClear === expectedMainYield &&
						reward.d5BonusEligible === false
				)
			);
		}

		const d5 = dungeon.difficulties.D5;
		const coupon = d5.rewards.find((reward) =>
			reward.itemId.endsWith('advanced-equipment-coupon')
		);
		const stone = d5.rewards.find((reward) => reward.itemId.endsWith('ascension-stone'));
		assert.equal(coupon?.yield.expectedPerClear, 3);
		assert.equal(stone?.yield.expectedPerClear, 21);
		assert.equal(
			currentSnapshot.prices.find((price) => price.itemId === coupon.itemId)?.unitEly,
			couponPrices.get(dungeon.id)
		);

		const result = calculateDungeonEarnings({
			catalog: currentCatalog,
			snapshot: currentSnapshot,
			dungeonId: dungeon.id,
			difficulty: 'D5',
			clearTimeSeconds: 600,
			selectedBuffIds: []
		});
		assert.equal(result.clearsPerHour, 6);
		assert.ok(Number.isFinite(result.perHour.directNetEly));
		assert.ok(Number.isFinite(result.perHour.potentialNetEly));
	}

	for (const [dungeonId, sharedPriceId] of [
		['wings-of-icarus', 'wings-of-icarus-main-material'],
		['likimo-pelke', 'rikimo-pelke-main-material']
	]) {
		const dungeon = currentCatalog.dungeons.find((entry) => entry.id === dungeonId);
		const mainItemIds = dungeon.difficulties.D4.rewards.map((reward) => reward.itemId);
		const mainItems = currentCatalog.rewardItems.filter((item) => mainItemIds.includes(item.id));
		assert.equal(mainItems.length, 2);
		assert.ok(mainItems.every((item) => item.marketPriceItemId === sharedPriceId));
		assert.equal(
			currentSnapshot.prices.filter(
				(price) => price.kind === 'market' && price.itemId === sharedPriceId
			).length,
			1
		);
	}

	const globalPleromaSource = currentCatalog.sources.find(
		(source) => source.id === 'ltgear-global-pleroma-upgrades'
	);
	assert.equal(globalPleromaSource?.url, 'https://ltgear.vercel.app/upgrade');
	const pleroma = currentCatalog.dungeons.find((dungeon) => dungeon.id === 'pleroma');
	assert.deepEqual(pleroma.difficulties.D5.serviceStrategyIds, [
		'pleroma-6-to-7',
		'pleroma-0-to-6'
	]);
	const expectedPleromaRecipes = new Map([
		[
			'pleroma-6-to-7',
			{
				inputs: [
					['pleroma-incomplete-demigod-torn-wing', 999],
					['pleroma-incomplete-demigod-horn', 999],
					['demiurge-ascension-stone', 999]
				],
				providerEly: 2_000_000_000,
				priceId: 'pleroma-6-to-7'
			}
		],
		[
			'pleroma-0-to-6',
			{
				inputs: [
					['pleroma-incomplete-demigod-torn-wing', 3839],
					['pleroma-incomplete-demigod-horn', 3839]
				],
				providerEly: 600_000_000,
				priceId: 'pleroma-0-to-6'
			}
		]
	]);
	for (const [recipeId, expected] of expectedPleromaRecipes) {
		const recipe = currentCatalog.serviceRecipes.find((entry) => entry.id === recipeId);
		assert.ok(recipe, `Missing Global Pleroma recipe ${recipeId}`);
		assert.deepEqual(
			recipe.inputs.map((input) => [input.itemId, input.quantity]),
			expected.inputs
		);
		assert.equal(recipe.providerElyCostEly, expected.providerEly);
		assert.equal(recipe.customerPriceItemId, expected.priceId);
		assert.deepEqual(recipe.sourceIds, [
			'ltgear-global-pleroma-upgrades',
			'maintainer-confirmed-services'
		]);
	}

	const pleromaD5 = calculateDungeonEarnings({
		catalog: currentCatalog,
		snapshot: currentSnapshot,
		dungeonId: 'pleroma',
		difficulty: 'D5',
		clearTimeSeconds: 600,
		selectedBuffIds: []
	});
	const pleromaStrategies = new Map(
		pleromaD5.serviceStrategyRows.map((row) => [row.strategyId, row])
	);
	assert.equal(pleromaStrategies.get('pleroma-6-to-7')?.servicesPerClear, 21 / 999);
	assert.equal(pleromaStrategies.get('pleroma-0-to-6')?.servicesPerClear, 100 / 3839);
});
