import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import reference from './fixtures/equipment-score-reference.json' with { type: 'json' };
import {
	EQUIPMENT_SCORE_SOURCE,
	EQUIPMENT_SCORE_KIND_CONFIGS,
	EQUIPMENT_SCORE_KIND_GROUPS,
	EQUIPMENT_SCORE_OPTIONS,
	EQUIPMENT_SCORE_EXAMPLES,
	calculateEquipmentScore,
	getEquipmentScoreRating,
	parseEquipmentScoreInput
} from '../src/lib/equipment-score.js';

const profiles = ['strMag', 'weapon', 'balance'];
const option = (kind, key) => EQUIPMENT_SCORE_OPTIONS[kind].find((row) => row.key === key);
const close = (actual, expected, message = '') => assert.ok(
	Math.abs(actual - expected) < 1e-10,
	`${message}: expected ${expected}, received ${actual}`
);

test('all 183 numerical rows exactly match the public wiki snapshot', () => {
	const kinds = Object.keys(EQUIPMENT_SCORE_KIND_CONFIGS);
	assert.equal(kinds.length, 16);
	assert.deepEqual(EQUIPMENT_SCORE_KIND_GROUPS.flatMap((group) => group.kinds), kinds);
	assert.equal(Object.values(EQUIPMENT_SCORE_OPTIONS).flat().length, 183);
	assert.equal(EQUIPMENT_SCORE_SOURCE.url, 'https://latale.wiki/tools/equipment-score');
	assert.equal(EQUIPMENT_SCORE_SOURCE.retrievedAt, '2026-10-03');
	assert.equal(EQUIPMENT_SCORE_SOURCE.dataSourceUrl, reference.source);
	assert.match(EQUIPMENT_SCORE_SOURCE.dataSourceSha256, /^[a-f0-9]{64}$/);
	// Independently fingerprinted from the wiki's public module before translation.
	const numericalData = Object.fromEntries(Object.entries(EQUIPMENT_SCORE_OPTIONS).map(([kind, rows]) => [
		kind, rows.map(({ label, originalLabel, ...numeric }) => numeric)
	]));
	assert.equal(createHash('sha256').update(JSON.stringify(numericalData)).digest('hex'),
		'e12bbab90076c8799fc5234a9a27e41446b01af40b0c67560af5b8032d54cd75');
});

test('English display labels retain Korean source names and every profile value', () => {
	for (const [kind, config] of Object.entries(EQUIPMENT_SCORE_KIND_CONFIGS)) {
		assert.ok(config.label && config.originalLabel, kind);
		assert.equal(/[가-힣]/u.test(config.label), false, kind);
		assert.equal(/[가-힣]/u.test(config.note ?? ''), false, kind);
		const rows = EQUIPMENT_SCORE_OPTIONS[kind];
		assert.equal(new Set(rows.map((row) => row.key)).size, rows.length, kind);
		for (const row of rows) {
			assert.ok(row.label && row.originalLabel, `${kind}/${row.key}`);
			assert.equal(/[가-힣]/u.test(row.label), false, `${kind}/${row.key}`);
			for (const profile of profiles) {
				for (const field of ['baseMaxByProfile', 'transcendenceMaxByProfile', 'baseBonusByProfile', 'weightByProfile']) {
					assert.ok(Number.isFinite(row[field][profile]), `${kind}/${row.key}/${field}/${profile}`);
				}
			}
		}
	}
});

test('all 75 kind, grade, and profile combinations match independently captured wiki results', () => {
	// These expected outputs were produced by the original public wiki function.
	// Mixed inputs exercise zero, decimal, near-maximum, and over-maximum values together.
	assert.equal(reference.cases.length, 75);
	const combinations = new Set();
	for (const expected of reference.cases) {
		const { kind, grade, profile } = expected;
		const label = `${kind}/${grade}/${profile}`;
		combinations.add(label);
		const values = Object.fromEntries(EQUIPMENT_SCORE_OPTIONS[kind].map((row, index) => {
			const max = (grade === 'transcendence' ? row.transcendenceMaxByProfile : row.baseMaxByProfile)[profile];
			return [row.key, Math.round(max * [0.31, 0, 0.875, 1.3, 0.5, 0.01][index % 6] * 100) / 100];
		}));
		const result = calculateEquipmentScore(kind, grade, profile, values);
		for (const key of ['score', 'subtotal', 'penalty', 'transcendenceScore']) {
			close(result[key], expected[key], `${label}/${key}`);
		}
		if (expected.comparisonScore === null) assert.equal(result.comparisonScore, null, label);
		else close(result.comparisonScore, expected.comparisonScore, `${label}/comparisonScore`);
	}
	for (const [kind, config] of Object.entries(EQUIPMENT_SCORE_KIND_CONFIGS)) {
		for (const grade of config.grades) for (const profile of profiles) {
			assert.ok(combinations.has(`${kind}/${grade}/${profile}`));
		}
	}
});

test('all six wiki examples preserve their original scores and transcendent projections', () => {
	const expected = {
		weapon: [73.56110381104237, 78.41785404645542],
		spiritStone: [89.59450834799554, 91.91824264718886],
		ikaHat: [64.21532689939534, 71.48117537137887],
		ikaUpperLower: [76.0849735690018, 81.7049190433381],
		ikaGloves: [74.71550808373156, 78.70756168207579],
		ikaShoes: [66.84191573969137, 74.64676068580341]
	};
	for (const [kind, example] of Object.entries(EQUIPMENT_SCORE_EXAMPLES)) {
		if (!expected[kind]) {
			assert.deepEqual(example, {}, kind);
			continue;
		}
		const result = calculateEquipmentScore(kind, 'base', 'strMag', example);
		close(result.score, expected[kind][0], kind);
		close(result.transcendenceScore, expected[kind][1], kind);
	}
	assert.equal(calculateEquipmentScore('weapon', 'transcendence', 'strMag', EQUIPMENT_SCORE_EXAMPLES.weapon).score.toFixed(2), '59.18');
});

test('scores also agree with independently observed values in the rendered wiki', () => {
	const cases = [
		['gardenHat', 'combined', 'strMag', { accuracyPercent: 100, critDamage: 131 }, '32.76', null, '0.00', '3.12'],
		['gardenHat', 'combined', 'strMag', { accuracyPercent: 139, critDamage: 131 }, '40.22', null, '0.00', '0.00'],
		['gardenHat', 'combined', 'strMag', { normalDomination: 5.3 }, '8.58', null, '0.00', '11.12'],
		['spiritStone', 'base', 'weapon', EQUIPMENT_SCORE_EXAMPLES.spiritStone, '86.02', '88.35', null, '0.00'],
		['spiritStone', 'base', 'balance', EQUIPMENT_SCORE_EXAMPLES.spiritStone, '89.49', '91.82', null, '0.00'],
		['tearEarring', 'full', 'strMag', { maxDamage: 91, critDamage: 91, weaponAttr: 157, strMag: 18201, allStat: 14301 }, '100.04', null, '67.21', '0.00'],
		['ikaHat', 'base', 'strMag', { critDamage: 121 }, '23.14', '23.14', null, '6.32'],
		['ikaHat', 'transcendence', 'strMag', { critDamage: 121 }, '10.35', null, null, '11.12']
	];
	for (const [kind, grade, profile, values, score, projection, comparison, penalty] of cases) {
		const result = calculateEquipmentScore(kind, grade, profile, values);
		assert.equal(result.score.toFixed(2), score, kind);
		assert.equal(result.penalty.toFixed(2), penalty, kind);
		if (projection !== null) assert.equal(result.transcendenceScore.toFixed(2), projection, kind);
		if (comparison !== null) assert.equal(result.comparisonScore.toFixed(2), comparison, kind);
	}
});

test('attainment caps each row, totals can exceed 100, and absent options receive no bonus', () => {
	const empty = calculateEquipmentScore('weapon', 'base', 'strMag', {});
	assert.equal(empty.score, 0);
	assert.equal(empty.transcendenceScore, 0);
	assert.ok(empty.rows.every((row) => row.transcendenceAttainment === 0));
	const overMax = Object.fromEntries(EQUIPMENT_SCORE_OPTIONS.weapon.map((row) => [row.key, row.baseMax * 2]));
	const result = calculateEquipmentScore('weapon', 'base', 'strMag', overMax);
	assert.ok(result.rows.every((row) => row.attainment === 100 && row.transcendenceAttainment === 100));
	assert.ok(result.score > 100);
	close(result.score, EQUIPMENT_SCORE_OPTIONS.weapon.reduce((sum, row) => sum + 100 * row.weightByProfile.strMag, 0));
});

test('Spirit Stone boss and normal damage are reference rows, excluded from both totals', () => {
	const referenceOnly = calculateEquipmentScore('spiritStone', 'base', 'strMag', { bossDamage: 48001, normalDamage: 48001 });
	const rows = referenceOnly.rows.filter((row) => !row.includeInTotal);
	assert.deepEqual(rows.map((row) => row.key), ['bossDamage', 'normalDamage']);
	assert.ok(rows.every((row) => row.attainment === 100 && row.contribution > 0));
	assert.equal(referenceOnly.score, 0);
	assert.equal(referenceOnly.transcendenceScore, 0);
	assert.ok(Object.entries(EQUIPMENT_SCORE_OPTIONS).filter(([kind]) => kind !== 'spiritStone')
		.every(([, options]) => options.every((row) => row.includeInTotal)));
});

test('helmet accuracy deductions preserve grade thresholds and projected accuracy bonuses', () => {
	for (const [kind, grade, threshold] of [['ikaHat', 'base', 79], ['ikaHat', 'transcendence', 139], ['gardenHat', 'combined', 139]]) {
		const empty = calculateEquipmentScore(kind, grade, 'strMag', {});
		close(empty.penalty, threshold * 0.08);
		assert.equal(empty.score, 0);
		const short = calculateEquipmentScore(kind, grade, 'strMag', { accuracyPercent: threshold - 1 });
		close(short.penalty, 0.08);
		const exact = calculateEquipmentScore(kind, grade, 'strMag', { accuracyPercent: threshold });
		assert.equal(exact.penalty, 0);
	}
	const projected = calculateEquipmentScore('ikaHat', 'base', 'strMag', { accuracyPercent: 39, critDamage: 121 });
	const projectedSubtotal = projected.rows.reduce((sum, row) => sum + row.transcendenceContribution, 0);
	// Transcendent threshold 139 uses current accuracy 39 + the source's 60-point bonus.
	close(projected.transcendenceScore, projectedSubtotal - 40 * 0.08);
});

test('source profile-dependent maxima and bonuses remain unnormalized', () => {
	assert.deepEqual(option('ikaHat', 'strMag').baseBonusByProfile, { strMag: 9000, weapon: 4200, balance: 4200 });
	assert.deepEqual(option('ikaHat', 'allStat').baseBonusByProfile, { strMag: 6900, weapon: 60, balance: 60 });
	assert.deepEqual(option('ikaHat', 'fixedDamagePercent').baseBonusByProfile, { strMag: 3, weapon: 3, balance: 21 });
	assert.deepEqual(option('ikaHat', 'stamina').transcendenceMaxByProfile, { strMag: 33001, weapon: 33001, balance: 24001 });
	assert.deepEqual(option('gardenUpperLower', 'strMagCombined').baseMaxByProfile, { strMag: 52002, weapon: 52001, balance: 52001 });
	const base = calculateEquipmentScore('ikaHat', 'base', 'balance', { fixedDamagePercent: 10 });
	const row = base.rows.find((item) => item.key === 'fixedDamagePercent');
	// The projection uses 20 + 21, not the separate transcendent maximum of 20.
	close(row.transcendenceAttainment, 31 / 41 * 100);
	assert.equal(option('ikaHat', 'fixedDamagePercent').transcendenceMaxByProfile.balance, 20);
});

test('comparison scores reproduce both source formulas, including Garden zero-clamping', () => {
	for (const kind of ['tearEarring', 'tearCloak', 'tearRing']) {
		const full = Object.fromEntries(EQUIPMENT_SCORE_OPTIONS[kind].map((row) => [row.key, row.baseMax]));
		const result = calculateEquipmentScore(kind, 'full', 'strMag', full);
		close(result.comparisonScore, (3.75 * result.score - 66) / 4.6);
		assert.equal(calculateEquipmentScore(kind, 'full', 'strMag', {}).comparisonScore, 0);
	}
	for (const kind of ['gardenHat', 'gardenUpperLower', 'gardenGloves', 'gardenShoes']) {
		for (const profile of profiles) {
			const full = Object.fromEntries(EQUIPMENT_SCORE_OPTIONS[kind].map((row) => [row.key, row.baseMaxByProfile[profile]]));
			const result = calculateEquipmentScore(kind, 'combined', profile, full);
			assert.equal(result.comparisonScore, 0, `${kind}/${profile}`);
		}
	}
});

test('decimal cooldown and domination values retain their source precision', () => {
	const cooldown = calculateEquipmentScore('tearRing', 'full', 'balance', { cooldownReduction: 3.25 });
	const row = cooldown.rows.find((item) => item.key === 'cooldownReduction');
	assert.equal(row.max, 6.5);
	assert.equal(row.attainment, 50);
	close(row.contribution, 14.0112);
	const domination = calculateEquipmentScore('ikaGloves', 'base', 'strMag', { bossDomination: 2.55 });
	assert.equal(domination.rows.find((item) => item.key === 'bossDomination').attainment, 50);
});

test('rating thresholds and numeric parsing match the wiki UI', () => {
	for (const [score, id] of [[0, 'developing'], [69.999, 'developing'], [70, 'transcendent'], [83.999, 'transcendent'], [84, 'near-mythic'], [89.999, 'near-mythic'], [90, 'mythic'], [200, 'mythic']]) {
		assert.equal(getEquipmentScoreRating(score).id, id);
	}
	for (const [input, value] of [['', 0], ['1,234.5', 1234.5], ['6.5%', 6.5], ['2 400', 2400], ['-12', 0], ['--2', 0], ['1.2.3', 0], ['abc', 0], ['NaN', 0], ['Infinity', 0]]) {
		assert.equal(parseEquipmentScoreInput(input), value, input);
	}
});
