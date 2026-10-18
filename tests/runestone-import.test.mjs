import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRunestoneImport } from '../src/lib/runestone-import.js';
import { calculateRunestoneScore } from '../src/lib/runestone.js';

test('a complete screen reading keeps the game center in the wiki doubled slot', () => {
	const screenshot = [11, 14, 20, 17, 29, 3, 15, 28];
	const selection = validateRunestoneImport(screenshot);
	assert.deepEqual(selection, screenshot);
	assert.notEqual(selection, screenshot);
	const result = calculateRunestoneScore(selection);
	assert.equal(result.selectedRunes[7].name, 'Nature and Dominance');
	assert.equal(result.baseScore, 245);
	assert.equal(result.eighthSlotBonus, 45);
	assert.equal(result.totalScore, 290);
	assert.equal(result.tier.name, 'Tier 3');
});

test('incomplete, duplicate, and unknown readings are rejected rather than compacted', () => {
	for (const ids of [
		null, undefined, {}, '1,2,3,4,5,6,7,8', [],
		[1, 2, 3, 4, 5, 6, 7],
		[1, 2, 3, 4, 5, 6, 7, null],
		[1, 2, 3, 4, 5, 6, 7, 7],
		[1, 2, 3, 4, 5, 6, 7, '8'],
		[1, 2, 3, 4, 5, 6, 7, 31],
		[1, 2, 3, 4, 5, 6, 7, NaN],
		[1, 2, 3, 4, 5, 6, 7, 8, 9]
	]) assert.equal(validateRunestoneImport(ids), null);
});

test('import order is preserved even when the center has a lower ID and score', () => {
	const ids = [20, 26, 30, 9, 11, 28, 29, 1];
	const selection = validateRunestoneImport(ids);
	assert.deepEqual(selection, ids);
	assert.equal(calculateRunestoneScore(selection).eighthSlotBonus, 6);
	selection[7] = 2;
	assert.equal(ids[7], 1, 'the caller owns a separate selection array');
});
