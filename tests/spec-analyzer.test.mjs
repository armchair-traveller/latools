import assert from 'node:assert/strict';
import test from 'node:test';

import {
	DEFAULT_SPEC_INPUTS,
	DIRECT_SKILLS,
	DUNGEONS,
	JOBS,
	PLACEMENT_SKILLS,
	SUMMONS,
	aggregateStats,
	applyEnchantDelta,
	applyEnchantReplacementToStats,
	calcDirectHitDamage,
	calcPlacementDamage,
	calculateBuildEfficiency,
	calculateConversionSummary,
	calculateDamageEfficiency,
	calculateHitIndicator,
	calculateHpComparison,
	calculateSummonReflection,
	compareEnchants,
	damageFactor,
	inferPlacementMultiplier,
	parseNumericInput,
	placementCoreCoefficients,
	placementCoefficients
} from '../src/lib/spec-analyzer.js';

const closeTo = (actual, expected, epsilon = 0.001) => {
	assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} should be within ${epsilon} of ${expected}`);
};

const displayed = (value, fractionDigits = 2) => Number(value.toFixed(fractionDigits));

const directSkill = DIRECT_SKILLS.find((skill) => skill.name === 'DS-DR');
const placementSkill = PLACEMENT_SKILLS.find((skill) => skill.name === 'Elmei');
const dungeon = DUNGEONS[0];

test('default sample aggregates match the live reference values', () => {
	const stats = aggregateStats(DEFAULT_SPEC_INPUTS);

	closeTo(stats.strMag.total, 4967646.36);
	closeTo(stats.weaponAttr.total, 36828);
	closeTo(stats.criticalDamage.total, 7416.6);
	closeTo(stats.minimumDamage.total, 6253.61);
	closeTo(stats.maximumDamage.total, 7244.72);
	closeTo(stats.fixedDamage.total, 804685.31);
	closeTo(stats.normalExtraDamage.total, 814348.74);
	closeTo(stats.bossExtraDamage.total, 691511.1);
});

test('live direct-skill coefficients retain their base and per-level split', () => {
	const dmDr = DIRECT_SKILLS.find((skill) => skill.name === 'DM-DR');
	const dmRs = DIRECT_SKILLS.find((skill) => skill.name === 'DM-RS');

	assert.deepEqual(
		{ baseCoefficient: dmDr?.baseCoefficient, perLevel: dmDr?.perLevel },
		{ baseCoefficient: 4000, perLevel: 800 }
	);
	assert.deepEqual(
		{ baseCoefficient: dmRs?.baseCoefficient, perLevel: dmRs?.perLevel },
		{ baseCoefficient: 3500, perLevel: 700 }
	);
});

test('complete live reference catalogs are present', () => {
	assert.equal(JOBS.length, 39);
	assert.equal(DIRECT_SKILLS.length, 325);
	assert.equal(PLACEMENT_SKILLS.length, 45);
	assert.equal(DUNGEONS.length, 7);
	assert.equal(SUMMONS.length, 9);
	assert.ok(DIRECT_SKILLS.some((skill) => skill.name === 'DM-RS'));
	assert.ok(SUMMONS.some((summon) => summon.id === 'richring'));
	assert.ok(SUMMONS.some((summon) => summon.id === 'aria'));
});

test('boss conversion summary matches the live reference sheet', () => {
	const stats = aggregateStats(DEFAULT_SPEC_INPUTS);
	const conversion = calculateConversionSummary(stats, { criterion: 'boss' });

	// The reference sheet presents these values to two decimal places. The API
	// intentionally retains full precision, so parity is asserted at that same
	// display boundary instead of against an invented hidden-precision value.
	assert.deepEqual(
		{
			criticalToMinimum: displayed(conversion.criticalToMinimum),
			criticalToMaximum: displayed(conversion.criticalToMaximum),
			finalCriticalPer1: displayed(conversion.finalCriticalPer1),
			finalMaximumPer1: displayed(conversion.finalMaximumPer1),
			finalMinimumPer1: displayed(conversion.finalMinimumPer1),
			dominationToCritical: displayed(conversion.dominationToCritical),
			dominationToMaximum: displayed(conversion.dominationToMaximum),
			dominationToMinimum: displayed(conversion.dominationToMinimum)
		},
		{
			criticalToMinimum: 1.85,
			criticalToMaximum: 1.89,
			finalCriticalPer1: 37.3,
			finalMaximumPer1: 39.17,
			finalMinimumPer1: 32.37,
			dominationToCritical: 33.87,
			dominationToMaximum: 61.27,
			dominationToMinimum: 58.65
		}
	);
	assert.deepEqual(
		Object.fromEntries(Object.entries(conversion.damageShares).map(([key, value]) => [key, Math.round(value * 100)])),
		{ domination: 36, critical: 33, maximum: 16, minimum: 15 }
	);
});

test('aggregation applies the live upper caps and physical job bonus', () => {
	const physical = aggregateStats({ ...DEFAULT_SPEC_INPUTS, summonId: 'none', normalDomination: 250, bossDomination: -5, penetration: 120 });
	const magical = aggregateStats({ ...DEFAULT_SPEC_INPUTS, summonId: 'none', physicalJob: false });

	assert.equal(physical.weaponAttr.flat - magical.weaponAttr.flat, 115);
	assert.equal(physical.normalDomination, 100);
	assert.equal(physical.bossDomination, -5);
	assert.equal(physical.penetration, 99);
});

test('damage factor blends average and maximum rolls with back-attack rate', () => {
	const average = damageFactor({ minimumDamage: 100, maximumDamage: 200, criticalDamage: 0, domination: 0 });
	const maximum = damageFactor({ minimumDamage: 100, maximumDamage: 200, criticalDamage: 0, domination: 0, backAttackRate: 100 });

	closeTo(average, 2.5);
	closeTo(maximum, 3.05);
});

test('direct and placement damage respect dungeon reductions', () => {
	const stats = aggregateStats(DEFAULT_SPEC_INPUTS);
	const coefficient = directSkill.baseCoefficient;
	const directTheory = calcDirectHitDamage({ stats, coefficient }).damage;
	const directBoss = calcDirectHitDamage({ stats, coefficient, scenario: 'boss', dungeon }).damage;
	const placementTheory = calcPlacementDamage({ stats, skill: placementSkill }).damage;
	const placementBoss = calcPlacementDamage({ stats, skill: placementSkill, scenario: 'boss', dungeon }).damage;

	assert.ok(directTheory > directBoss);
	assert.ok(placementTheory > placementBoss);
	assert.ok(directBoss > 0);
	assert.ok(placementBoss > 0);
});

test('placement coefficients scale from the selected skill level', () => {
	assert.deepEqual(placementCoefficients(placementSkill, 2), {
		weaponCoefficient: 42,
		strengthMultiplier: 1.2,
		totalMultiplier: 1.415
	});
});

test('negative skill levels retain the live reference extrapolation', () => {
	const negativePlacement = placementCoefficients(placementSkill, -5);
	assert.equal(negativePlacement.weaponCoefficient, 42);
	closeTo(negativePlacement.strengthMultiplier, 1.06, 1e-12);
	closeTo(negativePlacement.totalMultiplier, 1.1, 1e-12);
	const coefficient = directSkill.baseCoefficient + directSkill.perLevel * -6;
	assert.equal(coefficient, -1000);
	assert.equal(calcDirectHitDamage({ stats: aggregateStats(DEFAULT_SPEC_INPUTS), coefficient }).coefficient, -1000);
	const efficiency = calculateDamageEfficiency({
		stats: aggregateStats(DEFAULT_SPEC_INPUTS),
		directCoefficient: coefficient,
		placementSkill,
		dungeon
	});
	assert.equal(displayed(efficiency.direct.theory.equivalents[1].value), -14.21);
});

test('paired stat inputs retain negative live edge values', () => {
	const stats = aggregateStats({ ...DEFAULT_SPEC_INPUTS, critDmgPercent: -200 });
	assert.equal(stats.criticalDamage.percent, -200);
	assert.equal(stats.criticalDamage.total, -5260);
	assert.equal(stats.criticalDamage.per1Pct, -52.6);
});

test('placement core, hit indicator, reflection, and reverse measurement match live goldens', () => {
	const stats = aggregateStats(DEFAULT_SPEC_INPUTS);
	const core = placementCoreCoefficients(19);
	assert.equal(core.skillLevel, 69);
	assert.equal(core.weaponCoefficient, 42);
	closeTo(core.strengthMultiplier, 1.49, 1e-12);
	closeTo(core.totalMultiplier, 2.22, 1e-12);
	const earlyCore = placementCoreCoefficients(-45);
	closeTo(earlyCore.strengthMultiplier, 0.85, 1e-12);
	closeTo(earlyCore.totalMultiplier, 0.775, 1e-12);
	closeTo(calculateHitIndicator(stats, 17000).value, 1537977.0276194974, 1e-6);
	closeTo(calculateSummonReflection(stats, 148).value, 1786130.3920339805, 1e-6);
	const reverse = inferPlacementMultiplier({
		stats,
		skill: placementSkill,
		dungeon,
		measuredBossDamage: 47576363562.874985
	});
	closeTo(reverse.preMultiplier, 35906689481.415085, 1e-5);
	closeTo(reverse.inferredTotalMultiplier, 1.325, 1e-12);
});

test('numeric inputs accept safe additive workbook-style expressions', () => {
	assert.equal(parseNumericInput('100 + 50 - 12.5'), 137.5);
	assert.equal(parseNumericInput('(10 + 5) * 2'), 30);
	assert.equal(parseNumericInput('globalThis.process'), 0);
});

test('damage efficiency produces finite equivalences and bypass rates', () => {
	const stats = aggregateStats(DEFAULT_SPEC_INPUTS);
	const result = calculateDamageEfficiency({
		stats,
		directCoefficient: directSkill.baseCoefficient,
		placementSkill,
		dungeon
	});

	for (const group of [result.direct, result.placement]) {
		for (const scenario of ['theory', 'normal', 'boss']) {
			assert.ok(group[scenario].damage > 0);
			assert.equal(group[scenario].equivalents.length, 4);
			for (const item of group[scenario].equivalents) assert.ok(Number.isFinite(item.value));
		}
	}
	assert.ok(result.bypass.normal.direct > 0 && result.bypass.normal.direct < 100);
	assert.ok(result.bypass.normal.placement > 0 && result.bypass.normal.placement < 100);
	assert.ok(result.bypass.boss.direct > 0 && result.bypass.boss.direct < 100);
	assert.ok(result.bypass.boss.placement > 0 && result.bypass.boss.placement < 100);
});

test('direct theory efficiency and bypass match the live reference sheet', () => {
	const stats = aggregateStats(DEFAULT_SPEC_INPUTS);
	const result = calculateDamageEfficiency({
		stats,
		directCoefficient: directSkill.baseCoefficient,
		placementSkill,
		dungeon
	});
	const theoryEquivalents = Object.fromEntries(result.direct.theory.equivalents.map((item) => [item.key, item]));
	const expected = {
		strMag: { value: 349.43, reverse: 4.82 },
		weaponAttr: { value: 4.94, reverse: 4.76 },
		fixedDamage: { value: 1045.11, reverse: 2.2 },
		normalExtraDamage: { value: 1714.35, reverse: 3.66 }
	};

	for (const [key, reference] of Object.entries(expected)) {
		const equivalent = theoryEquivalents[key];
		assert.ok(equivalent, `missing direct theory equivalent for ${key}`);
		assert.equal(displayed(equivalent.value), reference.value);
		assert.equal(displayed(equivalent.reverse), reference.reverse);
		closeTo(equivalent.reverse, stats[key].per1Pct / equivalent.value, 1e-9);
	}
	assert.equal(displayed(result.bypass.normal.direct), 78.14);
	assert.equal(displayed(result.bypass.boss.direct), 56.64);
});

test('all six efficiency panels match live reference values', () => {
	const result = calculateDamageEfficiency({
		stats: aggregateStats(DEFAULT_SPEC_INPUTS),
		directCoefficient: directSkill.baseCoefficient,
		placementSkill,
		dungeon
	});
	const expected = {
		'direct.theory': [349.4348558427284, 4.935237892027263, 1045.1092006645965, 1714.3457940726275],
		'direct.normal': [273.05124539302244, 3.856435127168271, 816.6568504591631, 1339.6037810163464],
		'direct.boss': [195.5739908194484, 2.762186296096195, 584.9335685850765, 951.1528463079071],
		'placement.theory': [265.8934551760402, 10.069803363773701, 895.6201580015197, 1469.1313118095102],
		'placement.normal': [200.7572289958218, 7.602992027410307, 676.2190556143755, 1109.236521051651],
		'placement.boss': [131.9627701934242, 4.99763766771489, 444.49577374028894, 722.7887799081221]
	};
	for (const [path, golden] of Object.entries(expected)) {
		const [kind, scenario] = path.split('.');
		const actual = result[kind][scenario].equivalents.map((item) => item.value);
		actual.forEach((value, index) => closeTo(value, golden[index], 1e-9));
	}
});

test('default damage scenarios match live absolute outputs', () => {
	const stats = aggregateStats(DEFAULT_SPEC_INPUTS);
	const directExpected = {
		theory: 87481986052.16772,
		'boss-theory': 83429281133.11877,
		normal: 68359137165.613396,
		boss: 47251355930.12875
	};
	for (const [scenario, expected] of Object.entries(directExpected)) {
		closeTo(calcDirectHitDamage({ stats, coefficient: directSkill.baseCoefficient, scenario, dungeon }).damage, expected, 1e-3);
	}
	const placementExpected = {
		theory: 99333720255.90181,
		'boss-theory': 94543319065.8772,
		normal: 74999824313.90797,
		boss: 47576363562.875015
	};
	for (const [scenario, expected] of Object.entries(placementExpected)) {
		closeTo(calcPlacementDamage({ stats, skill: placementSkill, scenario, dungeon }).damage, expected, 1e-3);
	}
});

test('enchant comparison applies deltas without mutating the base input', () => {
	const base = { ...DEFAULT_SPEC_INPUTS };
	const changed = applyEnchantDelta(base, { strMagPercent: 10 });
	assert.equal(changed.strMagPercent, base.strMagPercent + 10);
	assert.equal(base.strMagPercent, DEFAULT_SPEC_INPUTS.strMagPercent);

	const comparison = compareEnchants({
		inputs: base,
		oldEnchant: {},
		newEnchant: { strMagPercent: 10, bossDomination: 2 },
		directCoefficient: directSkill.baseCoefficient,
		placementSkill,
		dungeon
	});
	assert.ok(comparison.scenarios.boss.direct.percentChange > 0);
	assert.ok(comparison.scenarios.boss.placement.percentChange > 0);
});

test('enchant placement scenarios use the live selected-skill/core hybrid', () => {
	const comparison = compareEnchants({
		inputs: DEFAULT_SPEC_INPUTS,
		directCoefficient: directSkill.baseCoefficient,
		placementSkill,
		dungeon
	});
	const expected = {
		theory: 166430836957.05814,
		'boss-theory': 158404655340.5641,
		normal: 125660083001.41565,
		boss: 79712850648.74155
	};
	for (const [scenario, damage] of Object.entries(expected)) {
		closeTo(comparison.scenarios[scenario].placement.old, damage, 1e-3);
		closeTo(comparison.scenarios[scenario].placement.new, damage, 1e-3);
	}
});

test('enchant comparison replaces an old item already included in the base inputs', () => {
	const base = { ...DEFAULT_SPEC_INPUTS };
	const snapshot = structuredClone(base);
	const oldEnchant = { strMagFlat: 1200, critDmgFlat: 20, bossDomination: 1.5 };
	const newEnchant = { strMagFlat: 1650, critDmgFlat: 12, bossDomination: 2.25 };
	const replacementDelta = { strMagFlat: 450, critDmgFlat: -8, bossDomination: 0.75 };
	const comparison = compareEnchants({
		inputs: base,
		oldEnchant,
		newEnchant,
		directCoefficient: directSkill.baseCoefficient,
		placementSkill,
		dungeon
	});

	assert.deepEqual(base, snapshot);
	assert.deepEqual(comparison.oldStats, aggregateStats(base));
	assert.deepEqual(comparison.newStats, aggregateStats(applyEnchantDelta(base, replacementDelta)));
});

test('enchant replacement applies domination deltas after the existing cap', () => {
	const capped = aggregateStats({
		...DEFAULT_SPEC_INPUTS,
		summonId: 'kardian',
		normalDomination: 90
	});
	assert.equal(capped.normalDomination, 100);
	const replaced = applyEnchantReplacementToStats(
		capped,
		{ normalDomination: 5 },
		{ normalDomination: 0 }
	);
	assert.equal(replaced.normalDomination, 95);
});

test('HP calibration applies only the replacement delta', () => {
	const result = calculateHpComparison(
		{ stamina: 5000, staminaMinus10: 4990, maxHp: 500000, maxHpMinus10: 499600 },
		{ strMagAll: 100, strMagAllPercent: 2, stamina: 10, hpPercent: 1 },
		{ strMagAll: 200, strMagAllPercent: 3, stamina: 30, hpPercent: 2 }
	);
	assert.ok(result);
	closeTo(result.staminaMultiplier, 50);
	closeTo(result.hpMultiplier, 10);
	assert.ok(result.expected > 500000);
});

test('build profiles preserve the combined strength and weapon budget', () => {
	const stats = aggregateStats(DEFAULT_SPEC_INPUTS);
	const result = calculateBuildEfficiency({
		stats,
		directCoefficient: directSkill.baseCoefficient,
		placementSkill,
		dungeon
	});
	assert.equal(result.profiles.length, 5);
	for (const profile of result.profiles) closeTo(profile.strMag / 100 + profile.weaponAttr, result.budget, 1);
});

test('build efficiency separates practical boss output from the raw calculation', () => {
	const stats = aggregateStats(DEFAULT_SPEC_INPUTS);
	const result = calculateBuildEfficiency({
		stats,
		directCoefficient: directSkill.baseCoefficient,
		placementSkill,
		dungeon
	});

	assert.equal(displayed(result.current.direct.boss / 1_000_000_000, 3), 47.251);
	assert.deepEqual(result.current.practical, {
		normalDirect: 875,
		bossDirect: 14.1754,
		normalPlacement: 993,
		bossPlacement: 14.2729
	});
	closeTo(result.current.practicalAbsolute.bossDirect / 1_000_000_000, 1.41754, 0.00001);
	for (const profile of result.profiles) {
		for (const key of ['normalDirect', 'bossDirect', 'normalPlacement', 'bossPlacement']) {
			assert.ok(Number.isFinite(profile.practical[key]), `${profile.id}.${key} should be finite`);
		}
	}
});

test('all rounded build profiles match the live report', () => {
	const result = calculateBuildEfficiency({
		stats: aggregateStats(DEFAULT_SPEC_INPUTS),
		directCoefficient: directSkill.baseCoefficient,
		placementSkill,
		dungeon
	});
	const expected = {
		'extreme-weapon': [870, 14.051, 851, 10.1642],
		'weapon-leaning': [872, 14.0844, 890, 11.2674],
		balanced: [873, 14.129, 940, 12.7416],
		'strength-leaning': [874, 14.1634, 980, 13.8757],
		'extreme-strength': [875, 14.1821, 1001, 14.4943]
	};
	for (const profile of result.profiles) {
		assert.deepEqual(Object.values(profile.practical), expected[profile.id]);
		for (const key of ['normalDirect', 'bossDirect', 'normalPlacement', 'bossPlacement']) {
			assert.ok(Number.isFinite(profile.change[key]));
		}
	}
});

test('zeroed inputs never return NaN or Infinity', () => {
	const empty = Object.fromEntries(Object.keys(DEFAULT_SPEC_INPUTS).map((key) => [key, typeof DEFAULT_SPEC_INPUTS[key] === 'boolean' ? false : typeof DEFAULT_SPEC_INPUTS[key] === 'string' ? 'none' : 0]));
	const stats = aggregateStats(empty);
	const efficiency = calculateDamageEfficiency({ stats, directCoefficient: 0, placementSkill, dungeon });
	assert.doesNotMatch(JSON.stringify(efficiency), /NaN|Infinity/);
});
