import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
	calculateEnhancement,
	defaultEnhancementSelections,
	enhancementDungeons,
	enhancementEquipment,
	enhancementSource
} from '../src/lib/enhancement-calculator.js';

test('the full wiki catalog has local icons, translations and valid material sources', async () => {
	assert.equal(enhancementEquipment.length, 32);
	assert.equal(enhancementEquipment.reduce((count, item) => count + item.stages.length, 0), 373);
	assert.equal(enhancementDungeons.length, 21);
	assert.equal(new Set(enhancementDungeons.map((dungeon) => dungeon.baseDungeonId)).size, 16);
	assert.equal(enhancementSource.url, 'https://latale.wiki/tools/enhancement-calculator');
	assert.match(enhancementSource.bundleSha256, /^[a-f0-9]{64}$/);
	const materialIds = new Set();
	const assets = new Set();
	for (const item of enhancementEquipment) {
		assert.ok(item.name && item.originalName && item.subName && item.originalSubName);
		assert.ok(item.baseLabel && item.originalBaseLabel);
		assert.doesNotMatch(item.name + item.subName + item.category, /[가-힣]/);
		assets.add(item.icon);
		const dungeon = enhancementDungeons.find((candidate) => candidate.id === item.dungeonId);
		assert.ok(dungeon, `Missing dungeon for ${item.id}`);
		for (const stage of item.stages) {
			assert.ok(stage.label && stage.originalLabel);
			assert.ok(Number.isInteger(stage.ely) && stage.ely >= 0);
			for (const material of stage.costs) {
				assert.ok(material.materialName && material.originalMaterialName);
				assert.doesNotMatch(material.materialName, /[가-힣]/);
				assert.ok(Number.isInteger(material.amount) && material.amount > 0);
				assert.ok(dungeon.materials.some((yieldEntry) => yieldEntry.materialId === material.materialId));
				materialIds.add(material.materialId);
				assets.add(material.icon);
			}
		}
	}
	assert.equal(materialIds.size, 33);
	assert.equal(assets.size, 56);
	for (const asset of assets) {
		assert.ok(asset.startsWith('/enhancement-calculator/'));
		const contents = await readFile(new URL(`../static${asset}`, import.meta.url));
		assert.deepEqual(contents.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
	}
});

test('empty, unknown and completed selections produce zero work', () => {
	for (const selections of [[], [{ selectionId: 1, equipmentId: 'unknown', currentStage: 0 }]]) {
		assert.deepEqual(calculateEnhancement(selections), {
			items: [], dungeons: [], totalMaterials: [], totalRuns: 0, expectedDays: 0, totalEly: 0
		});
	}
	const finished = enhancementEquipment.map((item, index) => ({
		selectionId: index,
		equipmentId: item.id,
		currentStage: item.stages.length
	}));
	const result = calculateEnhancement(finished);
	assert.equal(result.items.length, 32);
	assert.deepEqual(result.totalMaterials, []);
	assert.deepEqual(result.dungeons, []);
	assert.equal(result.totalRuns, 0);
	assert.equal(result.expectedDays, 0);
	assert.equal(result.totalEly, 0);
});

test('stage bounds and unavailable difficulties retain the wiki fallbacks', () => {
	const base = calculateEnhancement(defaultEnhancementSelections);
	assert.deepEqual(calculateEnhancement([{ selectionId: 1, equipmentId: 'badge1', currentStage: -10 }]), base);
	assert.deepEqual(calculateEnhancement(defaultEnhancementSelections, { inspiration: 5 }), base);
	const complete = calculateEnhancement([{ selectionId: 1, equipmentId: 'badge1', currentStage: 999 }]);
	assert.equal(complete.items[0].currentLabel, '+20');
	assert.equal(complete.totalRuns, 0);
});

test('the default remains an independent selection and calculations do not mutate inputs', () => {
	const selections = structuredClone(defaultEnhancementSelections);
	const difficulties = { inspiration: 4 };
	const points = { inspiration: true };
	const catalogBefore = JSON.stringify({ enhancementEquipment, enhancementDungeons });
	const before = structuredClone({ selections, difficulties, points });
	const result = calculateEnhancement(selections, difficulties, points);
	assert.equal(result.totalRuns, 45);
	assert.equal(result.totalEly, 2_000_000_000);
	assert.deepEqual({ selections, difficulties, points }, before);
	assert.equal(JSON.stringify({ enhancementEquipment, enhancementDungeons }), catalogBefore);
	assert.deepEqual(defaultEnhancementSelections, [{ selectionId: 1, equipmentId: 'badge1', currentStage: 0 }]);
});
