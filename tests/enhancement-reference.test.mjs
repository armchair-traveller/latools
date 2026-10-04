import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { calculateEnhancement, enhancementSource } from '../src/lib/enhancement-calculator.js';

const reference = JSON.parse(readFileSync(new URL('./fixtures/enhancement-reference.json', import.meta.url), 'utf8'));

// Exclude translated text and local image paths; retain every numeric result.
function numericResult(result) {
	return {
		items: result.items.map((item) => ({
			selectionId: item.selectionId,
			equipmentId: item.equipmentId,
			materials: item.materialCosts.map((material) => [material.materialId, material.amount]),
			ely: item.ely
		})),
		materials: result.totalMaterials.map((material) => [material.materialId, material.amount]),
		dungeons: result.dungeons.map((dungeon) => ({
			id: dungeon.dungeonId,
			baseId: dungeon.baseDungeonId,
			difficulty: dungeon.difficulty,
			runs: dungeon.runs,
			rawRuns: dungeon.rawRuns,
			materials: dungeon.materials.map((material) => [
				material.materialId, material.expectedPerRun, material.required, material.rawRuns
			]),
			pointRewardEnabled: dungeon.pointRewardEnabled,
			pointCost: dungeon.pointReward?.pointCost ?? null
		})),
		totalRuns: result.totalRuns,
		expectedDays: result.expectedDays,
		totalEly: result.totalEly
	};
}

test('enhancement goldens refer to the same source snapshot', () => {
	assert.equal(enhancementSource.bundleSha256, reference.source.bundleSha256);
	assert.equal(reference.cases.length, 1648);
});

for (const level of [4, 5]) {
	for (const boxes of [false, true]) {
		test(`wiki parity for every stage and mixed plans: D${level}, point boxes ${boxes ? 'on' : 'off'}`, () => {
			const difficulty = Object.fromEntries(reference.baseDungeonIds.map((id) => [id, level]));
			const rewards = Object.fromEntries(reference.baseDungeonIds.map((id) => [id, boxes]));
			for (const fixture of reference.cases.filter((item) => item.level === level && item.boxes === boxes)) {
				const actual = calculateEnhancement(fixture.selections, difficulty, rewards);
				assert.deepEqual(numericResult(actual), fixture.expected, fixture.name);
			}
		});
	}
}
