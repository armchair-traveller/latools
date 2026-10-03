import assert from 'node:assert/strict';
import test from 'node:test';
import {
	DEFAULT_SPEC_INPUTS, DEFAULT_SPEC_CALCULATION_SETTINGS, SPEC_ANALYZER_DATA_META,
	DIRECT_SKILLS, PLACEMENT_SKILLS, DUNGEONS, JOBS, SUMMONS,
	aggregateStats, applyEnchantDelta, applyEnchantReplacement, applyEnchantReplacementToStats,
	calcDirectHitDamage, calcPlacementDamage, calculateBuildEfficiency, calculateConversionSummary,
	calculateDamageEfficiency, calculateHpComparison, compareEnchants, directSkillCoefficient,
	inferPlacementMultiplier, inspectNumericInput, parseNumericInput, placementCoefficients, resolveDungeon
} from '../src/lib/spec-analyzer.js';

const closeTo = (actual, expected, tolerance = .0001) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
const directSkill = DIRECT_SKILLS.find((skill) => skill.name === 'DS-DR');
const placementSkill = PLACEMENT_SKILLS.find((skill) => skill.name === 'Elmei');
const dungeon = DUNGEONS.find((entry) => entry.id === 'wings-of-icarus');
const basicOptions = { directCoefficient: directSkillCoefficient(directSkill), directSkill, placementSkill, dungeon };
const blankInputs = () => Object.fromEntries(Object.entries(DEFAULT_SPEC_INPUTS).map(([key, value]) => [key, typeof value === 'boolean' ? false : typeof value === 'string' ? 'none' : key === 'characterLevel' ? 235 : 0]));
const assertFinite = (value) => {
	if (typeof value === 'number') assert.ok(Number.isFinite(value), `Non-finite output: ${value}`);
	else if (value && typeof value === 'object') Object.values(value).forEach(assertFinite);
};

test('arithmetic expressions honor precedence, unary parentheses and thousands separators', () => {
	for (const [source, expected] of [['1,200 + 20 * 3', 1260], ['-(10 + 5) / 2', -7.5], ['2 * --(3 - 1)', 4], ['.5 + 12.', 12.5], ['', 0]]) {
		assert.deepEqual(inspectNumericInput(source), { value: expected, valid: true });
	}
});

test('malformed and unsafe expressions are rejected without partial results', () => {
	for (const source of ['1 / 0 + 4', '(1 + 2', '1.2.3', '1 +', '1e3', 'Math.random()', 'globalThis.process.exit()', '2 ** 3', '('.repeat(40) + '1' + ')'.repeat(40), '1'.repeat(600), undefined, Infinity]) {
		assert.equal(inspectNumericInput(source).valid, false, `${source} should be invalid`);
		assert.equal(parseNumericInput(source), 0);
	}
});

test('catalog counts match their captured metadata and selected defaults exist', () => {
	assert.deepEqual({ jobs: JOBS.length, directSkills: DIRECT_SKILLS.length, placementSkills: PLACEMENT_SKILLS.length, dungeons: DUNGEONS.length, summons: SUMMONS.length }, SPEC_ANALYZER_DATA_META.counts);
	assert.ok(directSkill && placementSkill && dungeon);
	assert.equal(directSkillCoefficient(directSkill), 5000);
	assert.equal(directSkillCoefficient(directSkill, 2), 7000);
});

test('current reference aggregation adds summon bonuses once and has no old physical weapon bonus', () => {
	const stats = aggregateStats();
	closeTo(stats.strMag.total, 4967646.36);
	closeTo(stats.weaponAttr.total, 36372.6);
	closeTo(stats.criticalDamage.total, 7416.6);
	closeTo(stats.minimumDamage.total, 6253.61);
	closeTo(stats.maximumDamage.total, 7244.72);
	closeTo(stats.fixedDamage.total, 804685.31);
	closeTo(stats.normalExtraDamage.total, 814348.74);
	closeTo(stats.bossExtraDamage.total, 691511.1);
	assert.equal(aggregateStats({ ...DEFAULT_SPEC_INPUTS, physicalJob: false }).weaponAttr.total, stats.weaponAttr.total);
	const none = aggregateStats({ ...DEFAULT_SPEC_INPUTS, summonId: 'none' });
	assert.equal(stats.weaponAttr.flat - none.weaponAttr.flat, 500);
	assert.equal(stats.weaponAttr.percent - none.weaponAttr.percent, 5);
});

test('combat inputs follow current supported ranges without clipping domination at100', () => {
	const stats = aggregateStats({ ...DEFAULT_SPEC_INPUTS, normalDomination: 125, penetration: 120, characterLevel: 0, minDmgPercent: -2 });
	assert.equal(stats.normalDomination, 125);
	assert.equal(stats.penetration, 100);
	assert.equal(stats.characterLevel, 1);
	assert.equal(stats.minimumDamage.percent, 0);
});

// Independent goldens from latale.wiki's current calculator module and visible
// practical sheet, captured 2026-10-03: DS-DR0 / Elmei0 / Icarus / sample inputs.
const currentReference = {
	theory: { direct: [86414405933.9259, 80069542259, 92759276388], placement: [100121154743.99127, 92796448182, 107445863595] },
	normal: { direct: [12959357060.305176, 12007832519, 13910881585], placement: [14289195022.012756, 13243820304, 15334570344] },
	boss: { direct: [2893385468.4555054, 2680942275, 3105828678], placement: [2899077604.5894775, 2686985636, 3111169562] },
	'boss-theory': { direct: [82413706641.36884, 76362588648, 88464831420], placement: [95289927454.58325, 88318666815, 102261187319] }
};
test('direct and placed critical damage match the current reference in every scenario', () => {
	const stats = aggregateStats();
	for (const [scenario, values] of Object.entries(currentReference)) {
		const direct = calcDirectHitDamage({ stats, coefficient: 5000, dungeon, scenario });
		const placement = calcPlacementDamage({ stats, skill: placementSkill, dungeon, scenario });
		for (const [kind, result] of [['direct', direct], ['placement', placement]]) {
			const [average, minimum, maximum] = values[kind];
			closeTo(result.damage, average);
			assert.equal(result.minimum, minimum);
			assert.equal(result.maximum, maximum);
			assert.ok(minimum <= result.damage && result.damage <= maximum);
		}
	}
});

test('noncritical boss damage matches the current live practical range table', () => {
	const stats = aggregateStats();
	const direct = calcDirectHitDamage({ stats, coefficient: 5000, scenario: 'boss', dungeon, critical: false });
	const placed = calcPlacementDamage({ stats, skill: placementSkill, scenario: 'boss', dungeon, critical: false });
	assert.equal(direct.minimum, 115358964);
	assert.equal(direct.maximum, 133641505);
	assert.equal(Math.round(direct.damage), 124500233);
	assert.equal(placed.minimum, 100373013);
	assert.equal(placed.maximum, 116218505);
	assert.equal(Math.round(placed.damage), 108295759);
});

test('maximum mode selects the top critical roll without changing its range', () => {
	const stats = aggregateStats();
	for (const calculate of [() => calcDirectHitDamage({ stats, coefficient: 5000, scenario: 'boss', dungeon, mode: 'maximum' }), () => calcPlacementDamage({ stats, skill: placementSkill, scenario: 'boss', dungeon, mode: 'maximum' })]) {
		const result = calculate();
		assert.equal(result.damage, result.maximum);
	}
});

test('simple direct fixture independently verifies coefficient offset and strength efficiency', () => {
	const stats = aggregateStats({ ...blankInputs(), strMagFlat: 1000, strMagEfficiency: 10, weaponAttrFlat: 100, minDmgFlat: 100, maxDmgFlat: 100, critDmgFlat: 100 });
	// (floor(1000*1.1) + floor(100*(5000+100)/50)) * 2 critical * 1 roll.
	assert.equal(calcDirectHitDamage({ stats, coefficient: 5000 }).damage, 22600);
});

test('defense is level-scaled, guard is a separate percent and critical resistance lowers only crit amplification', () => {
	const inputs = { ...blankInputs(), strMagFlat: 1_000_000, weaponAttrFlat: 1000, minDmgFlat: 100, maxDmgFlat: 100, critDmgFlat: 100, penetration: 0 };
	const target = { id: 'test', name: 'Test', normalDefense: 100000, bossDefense: 100000, normalDmgReduction: 0, bossDmgReduction: 0 };
	const calculate = (values, overrides = {}) => calcDirectHitDamage({ stats: aggregateStats(values), coefficient: 5000, scenario: 'normal', dungeon: { ...target, ...overrides } }).damage;
	const base = calculate(inputs);
	assert.ok(calculate({ ...inputs, characterLevel: 300 }) > base);
	assert.ok(calculate({ ...inputs, penetration: 100 }) > base);
	closeTo(calculate(inputs, { normalGuard: 50 }), base / 2, 1);
	closeTo(calculate(inputs, { normalElasticity: 1000 }), base / 2, 1);
	assert.equal(calculate(inputs, { normalGuard: 100 }), 0);
});

test('placement reflection scales damage stats and bypasses player penetration but retains target defense', () => {
	const stats = aggregateStats();
	const a = calcPlacementDamage({ stats, skill: placementSkill, scenario: 'boss', dungeon });
	const b = calcPlacementDamage({ stats: { ...stats, penetration: 0 }, skill: placementSkill, scenario: 'boss', dungeon });
	assert.equal(a.damage, b.damage);
	const coefficients = placementCoefficients(placementSkill, 2);
	closeTo(coefficients.strengthMultiplier, 1.2);
	assert.ok(calcPlacementDamage({ stats, coefficients, scenario: 'boss', dungeon }).damage > a.damage);
	const legacyTotal = { ...placementCoefficients(placementSkill), totalMultiplier: 999 };
	assert.equal(calcPlacementDamage({ stats, coefficients: legacyTotal, scenario: 'boss', dungeon }).damage, a.damage);
});

test('back attacks add damage and blend probabilities without substituting the maximum roll', () => {
	const stats = aggregateStats();
	const direct = (rate) => calcDirectHitDamage({ stats, coefficient: 5000, scenario: 'boss', dungeon, backAttackRate: rate }).damage;
	assert.ok(direct(100) > direct(0));
	closeTo(direct(25), .75 * direct(0) + .25 * direct(100));
	const mixed = calcDirectHitDamage({ stats, coefficient: 5000, scenario: 'boss', dungeon, backAttackRate: 25 });
	assert.equal(mixed.minimum, calcDirectHitDamage({ stats, coefficient: 5000, scenario: 'boss', dungeon }).minimum);
	assert.equal(mixed.maximum, calcDirectHitDamage({ stats, coefficient: 5000, scenario: 'boss', dungeon, backAttackRate: 100 }).maximum);
	const noBonus = { ...stats, backAttackDmg: 0 };
	assert.equal(calcDirectHitDamage({ stats: noBonus, coefficient: 5000, backAttackRate: 100 }).damage, calcDirectHitDamage({ stats: noBonus, coefficient: 5000 }).damage);
});

test('physical weapon ranges and magical fixed attributes use the correct roll model', () => {
	const full = aggregateStats();
	const range = { ...full, weaponMinimum: full.weaponAttr.total / 2 };
	assert.ok(calcDirectHitDamage({ stats: range, coefficient: 5000 }).damage < calcDirectHitDamage({ stats: full, coefficient: 5000 }).damage);
	assert.equal(calcDirectHitDamage({ stats: { ...range, physicalJob: false }, coefficient: 5000 }).damage, calcDirectHitDamage({ stats: { ...full, physicalJob: false }, coefficient: 5000 }).damage);
});

test('custom dungeon resolves all four defense mechanics and treats resistance as per-mille', () => {
	const resolved = resolveDungeon(dungeon, { ...DEFAULT_SPEC_CALCULATION_SETTINGS, useCustomDungeonStats: true, customNormalDefense: '10 + 20', customBossDefense: 50, customNormalDmgReduction: 100, customBossDmgReduction: 200, customNormalGuard: 53, customBossGuard: 80, customNormalElasticity: 600, customBossElasticity: 700 });
	assert.deepEqual(resolved, { id: 'custom', name: 'Custom dungeon', normalDefense: 30, bossDefense: 50, normalDmgReduction: 100, bossDmgReduction: 200, normalGuard: 53, bossGuard: 80, normalElasticity: 600, bossElasticity: 700 });
});

test('efficiency normalizes measured reference-stat damage gains over a stable probe', () => {
	const stats = aggregateStats();
	const result = calculateDamageEfficiency({ stats, ...basicOptions });
	const extraCrit = aggregateStats({ ...DEFAULT_SPEC_INPUTS, critDmgFlat: DEFAULT_SPEC_INPUTS.critDmgFlat + 100 });
	const gain = calcDirectHitDamage({ stats: extraCrit, coefficient: 5000, scenario: 'boss', dungeon }).damage - result.direct.boss.damage;
	assert.equal(result.direct.boss.referenceGain, gain / 100);
	assert.equal(result.direct.boss.referenceStep, 100);
	assert.ok(result.placement.boss.referenceGain > 0, 'Reflection rounding must not hide the marginal critical gain');
	assert.ok(result.placement.boss.equivalents.every((entry) => entry.value > 0));
	assert.equal(result.direct.boss.equivalents.length, 4);
	assert.ok(result.direct.boss.equivalents.every((entry) => entry.value > 0));
	closeTo(result.bypass.boss.direct, 100 * currentReference.boss.direct[0] / currentReference['boss-theory'].direct[0]);
	assertFinite(result);
});

test('minimum damage has no marginal benefit in maximum-roll mode or above the maximum cap', () => {
	const result = calculateDamageEfficiency({ stats: aggregateStats(), ...basicOptions, referenceStat: 'minimum', damageMode: 'maximum' });
	assert.equal(result.direct.boss.referenceGain, 0);
	assert.ok(result.direct.boss.equivalents.every((entry) => entry.value === 0));
	const capped = aggregateStats({ ...DEFAULT_SPEC_INPUTS, minDmgFlat: 999999 });
	assert.equal(calculateDamageEfficiency({ stats: capped, ...basicOptions, referenceStat: 'minimum' }).direct.theory.referenceGain, 0);
});

test('theory conversion uses the current direct roll terms and keeps full precision', () => {
	const stats = aggregateStats();
	const result = calculateConversionSummary(stats, { criterion: 'boss' });
	const expected = (stats.minimumDamage.total + stats.maximumDamage.total) * 1.41 / ((100 + stats.criticalDamage.total) * 1.39);
	closeTo(result.criticalToMinimum, expected, 1e-12);
	closeTo(Object.values(result.baseShares).reduce((a, b) => a + b), 1, 1e-12);
});

test('enchant replacement subtracts the old option, preserves summon bonuses and does not mutate inputs', () => {
	const inputs = { ...DEFAULT_SPEC_INPUTS };
	const snapshot = structuredClone(inputs);
	const oldEnchant = { strMagFlat: 1200, critDmgFlat: 20, bossDomination: 1.5 };
	const newEnchant = { strMagFlat: 1650, critDmgFlat: 12, bossDomination: 2.25 };
	const result = compareEnchants({ inputs, oldEnchant, newEnchant, ...basicOptions });
	assert.deepEqual(inputs, snapshot);
	assert.deepEqual(result.newStats, aggregateStats(applyEnchantDelta(inputs, { strMagFlat: 450, critDmgFlat: -8, bossDomination: .75 })));
	assert.deepEqual(applyEnchantReplacementToStats(aggregateStats(inputs), oldEnchant, newEnchant), result.newStats);
	assert.equal(applyEnchantReplacement(inputs, {}, { backAttackDmg: 10 }).backAttackDmg, inputs.backAttackDmg + 10);
});

test('unchanged enchant comparison uses exactly the same damage model as the damage table', () => {
	const result = compareEnchants({ inputs: DEFAULT_SPEC_INPUTS, oldEnchant: { critDmg: 50 }, newEnchant: { critDmg: 50 }, ...basicOptions });
	for (const [scenario, reference] of Object.entries(currentReference)) {
		closeTo(result.scenarios[scenario].direct.old, reference.direct[0]);
		closeTo(result.scenarios[scenario].placement.old, reference.placement[0]);
		assert.equal(result.scenarios[scenario].direct.percentChange, 0);
		assert.equal(result.scenarios[scenario].placement.percentChange, 0);
	}
});

test('skill-level and back-attack enchant options actually affect the selected skill', () => {
	const inputs = DEFAULT_SPEC_INPUTS;
	const levels = compareEnchants({ inputs, newEnchant: { directHitSkillLevel: 1, placementSkillLevel: 1 }, ...basicOptions });
	assert.ok(levels.scenarios.boss.direct.percentChange > 0);
	assert.ok(levels.scenarios.boss.placement.percentChange > 0);
	closeTo(levels.scenarios.boss.direct.new, calcDirectHitDamage({ stats: aggregateStats(inputs), coefficient: 6000, scenario: 'boss', dungeon }).damage);
	const front = compareEnchants({ inputs, newEnchant: { backAttackDmg: 100 }, ...basicOptions });
	assert.equal(front.scenarios.boss.direct.percentChange, 0);
	const back = compareEnchants({ inputs, newEnchant: { backAttackDmg: 100 }, backAttackRate: 100, ...basicOptions });
	assert.ok(back.scenarios.boss.direct.percentChange > 0);
});

test('HP calibration returns the baseline unchanged and rejects unusable measurements', () => {
	const calibration = { stamina: 5000, staminaMinus10: 4990, maxHp: 500000, maxHpMinus10: 499600 };
	closeTo(calculateHpComparison(calibration).expected, 500000);
	assert.ok(calculateHpComparison(calibration, {}, { hpPercent: 2, stamina: 10 }).expected > 500000);
	assert.equal(calculateHpComparison({ ...calibration, staminaMinus10: 5000 }), null);
	assert.equal(calculateHpComparison({ ...calibration, maxHpMinus10: 600000 }), null);
	assert.equal(calculateHpComparison({}), null);
	assert.equal(calculateHpComparison({ stamina: 5000, maxHp: 500000 }), null);
});

test('builds preserve their stat budget, actual dungeon damage and unrounded changes', () => {
	const result = calculateBuildEfficiency({ stats: aggregateStats(), ...basicOptions });
	assert.equal(result.partyScale, 1);
	closeTo(result.current.practicalAbsolute.bossDirect, currentReference.boss.direct[0]);
	closeTo(result.current.practicalAbsolute.normalDirect, currentReference.normal.direct[0]);
	for (const profile of result.profiles) {
		closeTo(profile.strMag / 100 + profile.weaponAttr, result.budget);
		closeTo(profile.change.bossDirect, (profile.direct.boss / result.current.direct.boss - 1) * 100);
		closeTo(profile.practical.bossDirect * 1e8, profile.direct.boss);
	}
});

test('measured placement comparison reports a multiplier against the same modern model', () => {
	const result = inferPlacementMultiplier({ stats: aggregateStats(), skill: placementSkill, dungeon, measuredBossDamage: currentReference.boss.placement[0] });
	closeTo(result.inferredTotalMultiplier, 1);
	closeTo(result.expected, currentReference.boss.placement[0]);
});

test('zero values stay finite throughout conversion, damage, efficiency and builds', () => {
	const stats = aggregateStats(blankInputs());
	assertFinite(calculateConversionSummary(stats));
	assertFinite(calculateDamageEfficiency({ stats, ...basicOptions }));
	assertFinite(calculateBuildEfficiency({ stats, ...basicOptions }));
	assertFinite(compareEnchants({ inputs: blankInputs(), ...basicOptions }));
});
