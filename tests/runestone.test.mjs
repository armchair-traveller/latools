import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import reference from './fixtures/runestone-reference.json' with { type: 'json' };
import {
	RUNESTONE_SOURCE,
	RUNESTONE_RUNES,
	RUNESTONE_TIERS,
	MAX_RUNESTONE_SLOTS,
	MAX_RUNESTONE_SCORE,
	calculateRunestoneScore,
	toggleRunestone,
	moveRunestoneToBoostSlot,
	getBestRunestoneSelection
} from '../src/lib/runestone.js';

const originalData = {
	ALL_RUNES: reference.sourceData.runes,
	MAX_SLOTS: reference.sourceData.maxSlots,
	MAX_SCORE: reference.sourceData.maxScore,
	TIERS: reference.sourceData.tiers
};
const originalId = (id) => String(id + 300);
const localIds = (ids) => Array.from(ids, (id) => Number(id) - 300);

// Execute captured, unmodified source expressions in an isolated context. The fixture
// was extracted from the public wiki bundle independently of this implementation.
const originalCalculate = vm.runInNewContext(`(function(e, i) {
	${reference.sourceExcerpts.round}
	let d, h = new Map(e.ALL_RUNES.map(rune => [rune.id, rune]));
	let ${reference.sourceExcerpts.calculate};
	return { baseScore: j, eighthSlotBonus: N, totalScore: v,
		tier: y.name, nextTier: w?.name ?? null, pointsToNextTier: w ? n(w.minScore - v) : 0 };
})`);
const originalAutoBest = vm.runInNewContext(`(function(e) {
	let selected; const c = value => selected = value;
	${reference.sourceExcerpts.autoBest}; return selected;
})`);
const originalToggle = vm.runInNewContext(`(function(e, ids, t) {
	let selected; const c = updater => selected = updater(ids);
	${reference.sourceExcerpts.toggle}; return selected;
})`);
const originalMove = vm.runInNewContext(`(function(e, ids, t) {
	let selected; const c = updater => selected = updater(ids);
	${reference.sourceExcerpts.moveToBoost}; return selected;
})`);

function scoreSummary(result) {
	return {
		baseScore: result.baseScore,
		eighthSlotBonus: result.eighthSlotBonus,
		totalScore: result.totalScore,
		tier: result.tier.originalName,
		nextTier: result.nextTier?.originalName ?? null,
		pointsToNextTier: result.pointsToNextTier
	};
}

test('all 30 rune values, effects, levels, and tier thresholds retain the captured wiki data', () => {
	assert.equal(RUNESTONE_RUNES.length, 30);
	assert.equal(MAX_RUNESTONE_SLOTS, 8);
	assert.equal(MAX_RUNESTONE_SCORE, 500);
	assert.equal(RUNESTONE_SOURCE.url, reference.source);
	assert.equal(RUNESTONE_SOURCE.retrievedAt, '2026-10-17');
	assert.equal(RUNESTONE_SOURCE.calculationSourceUrl, reference.calculationSourceUrl);
	assert.equal(RUNESTONE_SOURCE.calculationSourceSha256, reference.calculationSourceSha256);
	assert.equal(createHash('sha256').update(JSON.stringify(reference.sourceData)).digest('hex'),
		'023543d24b734a29bdde67c56ee229772828d3d4c25beb428251bae14568e6f4');
	assert.equal(RUNESTONE_SOURCE.dataSourceSha256, reference.dataSha256);
	assert.deepEqual(RUNESTONE_TIERS.map(({ name, originalName, ...tier }) => ({ ...tier, name: originalName })),
		reference.sourceData.tiers);

	const numbers = (text) => [...text.matchAll(/\d+(?:\.\d+)?%?/g)].map(([number]) => number).sort();
	for (const [index, rune] of RUNESTONE_RUNES.entries()) {
		const source = reference.sourceData.runes[index];
		assert.equal(rune.id, Number(source.id) - 300);
		assert.equal(rune.originalName, source.name);
		assert.equal(rune.score, source.score, rune.name);
		assert.equal(rune.level, `${source.type === 'basic' ? 'Lv.' : 'ULv.'} ${source.level}`, rune.name);
		assert.equal(rune.type, source.type === 'basic' ? 'basic' : 'advanced', rune.name);
		assert.deepEqual(rune.originalEffects, source.effect.split(/\s*,\s*/).filter(Boolean));
		assert.deepEqual(numbers(rune.effects.join(' ')), numbers(source.effect), `${rune.name}: effect numbers and units`);
	}
});

test('display names and effect terms come from lt-runestone-calculator without its weights', () => {
	assert.match(RUNESTONE_SOURCE.terminologySource, /^lt-runestone-calculator\//);
	assert.equal(RUNESTONE_SOURCE.terminologySourceSha256,
		'33e685499b7c82b51cfeb25b97a0687788df214076dd3797a3d06a897b98ba25');
	const effectTerms = new Set(reference.terms.flatMap((rune) => rune.effects.map((effect) => effect.split(' +')[0])));
	for (const [index, rune] of RUNESTONE_RUNES.entries()) {
		assert.equal(rune.name, reference.terms[index].name);
		assert.equal(/[가-힣]/u.test([rune.name, ...rune.effects, rune.reviewNote ?? ''].join(' ')), false, rune.name);
		assert.equal(Object.hasOwn(rune, 'value'), false, rune.name);
		for (const effect of rune.effects) assert.ok(effectTerms.has(effect.split(' +')[0]), `${rune.name}: ${effect}`);
	}
	assert.equal(RUNESTONE_RUNES[19].score, 75);
	assert.match(RUNESTONE_RUNES[19].reviewNote, /no formula/);
	assert.match(RUNESTONE_RUNES[19].reviewNote, /75 points are retained/);
	assert.equal(RUNESTONE_RUNES.filter((rune) => rune.reviewNote).length, 1);
});

test('calculator matches independently observed wiki outputs, including every tier threshold', () => {
	assert.equal(reference.observedCases.length, 7);
	for (const { name, selectedIds, ...expected } of reference.observedCases) {
		assert.deepEqual(scoreSummary(calculateRunestoneScore(selectedIds)), expected, name);
	}
});

test('500 deterministic selections match the original source calculation expression', () => {
	let seed = 20261017;
	const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
	for (let iteration = 0; iteration < 500; iteration += 1) {
		const ids = RUNESTONE_RUNES.map((rune) => rune.id);
		for (let index = ids.length - 1; index > 0; index -= 1) {
			const other = Math.floor(random() * (index + 1));
			[ids[index], ids[other]] = [ids[other], ids[index]];
		}
		const selected = ids.slice(0, iteration % 9);
		const expected = originalCalculate(originalData, selected.map(originalId));
		assert.deepEqual(scoreSummary(calculateRunestoneScore(selected)), { ...expected }, selected.join(', '));
	}
});

test('half-point scores just below each threshold stay in the preceding tier', () => {
	const cases = [
		[[15, 18, 20, 21, 26], 199.5, 'Tier 5', 0.5],
		[[9, 11, 20, 22, 23, 26], 269.5, 'Tier 4', 0.5],
		[[9, 18, 20, 21, 26, 28, 30], 329.5, 'Tier 3', 0.5],
		[[2, 11, 20, 22, 26, 28, 29, 9], 399.5, 'Tier 2', 0.5]
	];
	for (const [ids, score, tier, gap] of cases) {
		const result = calculateRunestoneScore(ids);
		assert.equal(result.totalScore, score);
		assert.equal(result.tier.name, tier);
		assert.equal(result.pointsToNextTier, gap);
	}
	const empty = calculateRunestoneScore([]);
	assert.equal(empty.totalScore, 0);
	assert.equal(empty.tier.name, 'Tier 5');
	assert.equal(empty.pointsToNextTier, 200);
});

test('best selection preserves source tie ordering and places Insight in the doubled slot', () => {
	const best = getBestRunestoneSelection();
	assert.deepEqual(best, localIds(originalAutoBest(originalData)));
	assert.deepEqual(best, [26, 30, 9, 11, 28, 29, 25, 20]);
	const result = calculateRunestoneScore(best);
	assert.equal(result.baseScore, 425);
	assert.equal(result.eighthSlotBonus, 75);
	assert.equal(result.totalScore, 500);
	assert.equal(result.tier.name, 'God');
	assert.equal(result.nextTier, null);
	assert.equal(result.pointsToNextTier, 0);
	assert.equal(calculateRunestoneScore(best.slice(1)).eighthSlotBonus, 0);
});

test('all toggle and move-to-slot-eight actions agree with original source behavior', () => {
	for (const selected of [[], [1, 2, 3], [1, 2, 3, 4, 5, 6, 7], getBestRunestoneSelection()]) {
		const original = [...selected];
		for (const { id } of RUNESTONE_RUNES) {
			assert.deepEqual(toggleRunestone(selected, id), localIds(originalToggle(originalData, selected.map(originalId), { id: originalId(id) })));
			assert.deepEqual(moveRunestoneToBoostSlot(selected, id), localIds(originalMove(originalData, selected.map(originalId), originalId(id))));
		}
		assert.deepEqual(selected, original, 'the helpers leave the input array unchanged');
	}
	assert.deepEqual(moveRunestoneToBoostSlot(getBestRunestoneSelection(), 9), [26, 30, 11, 28, 29, 25, 20, 9]);
	assert.deepEqual(toggleRunestone(getBestRunestoneSelection(), 1), getBestRunestoneSelection());
});

test('stale or malformed stored selections cannot add duplicate, unknown, or ninth runes', () => {
	assert.deepEqual(calculateRunestoneScore([20, 20, 999, '26', null]).selectedRunes.map((rune) => rune.id), [20]);
	assert.deepEqual(calculateRunestoneScore(null).selectedRunes, []);
	assert.deepEqual(calculateRunestoneScore('20').selectedRunes, []);
	assert.equal(calculateRunestoneScore([...getBestRunestoneSelection(), 1]).totalScore, 500);
	assert.deepEqual(toggleRunestone([1, 2], 999), [1, 2]);
	assert.deepEqual(moveRunestoneToBoostSlot([1, 2], 1), [1, 2]);
});
