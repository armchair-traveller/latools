import snapshot from './data/enhancement-calculator.json' with { type: 'json' };

/** Numerical snapshot and calculation rules from the wiki's public calculator bundle. */
export const enhancementSource = snapshot.source;
export const enhancementEquipment = snapshot.equipment;
export const enhancementDungeons = snapshot.dungeons;
export const defaultEnhancementSelections = [
	{ selectionId: 1, equipmentId: 'badge1', currentStage: 0 }
];

const equipmentById = new Map(enhancementEquipment.map((equipment) => [equipment.id, equipment]));

function sumMaterials(costs) {
	const totals = new Map();
	for (const cost of costs) {
		const previous = totals.get(cost.materialId);
		totals.set(cost.materialId, { ...cost, amount: (previous?.amount ?? 0) + cost.amount });
	}
	return [...totals.values()];
}

/**
 * Preserve the wiki's remaining-stage sums and expected dungeon yield calculation.
 * Shared materials are aggregated before dividing by yield. Materials from the same
 * dungeon drop together, so its slowest material determines the number of clears.
 */
export function calculateEnhancement(selections, difficultyByDungeon = {}, pointRewardsByDungeon = {}) {
	const selectedEquipment = selections.flatMap((selection) => {
		const equipment = equipmentById.get(selection.equipmentId);
		return equipment ? [equipment] : [];
	});
	const baseDungeonIds = new Set(selectedEquipment.map((equipment) => equipment.dungeonId.replace(/-5$/, '')));
	// The wiki forces difficulty 5 from the selection, even if that item is already finished.
	const forcedDungeons = new Set(selectedEquipment
		.filter((equipment) => equipment.dungeonId.endsWith('-5'))
		.map((equipment) => equipment.dungeonId.replace(/-5$/, '')));
	const items = selections.flatMap((selection) => {
		const equipment = equipmentById.get(selection.equipmentId);
		if (!equipment) return [];
		const currentStage = Math.min(Math.max(0, selection.currentStage), equipment.stages.length);
		const remaining = equipment.stages.slice(currentStage);
		return [{
			selectionId: selection.selectionId,
			equipmentId: equipment.id,
			name: `${equipment.name} (${equipment.subName})`,
			currentLabel: currentStage === 0
				? equipment.baseLabel
				: equipment.stages[currentStage - 1]?.label ?? equipment.baseLabel,
			targetLabel: equipment.stages.at(-1)?.label ?? 'Complete',
			materialCosts: sumMaterials(remaining.flatMap((stage) => stage.costs)),
			ely: remaining.reduce((sum, stage) => sum + stage.ely, 0)
		}];
	});
	const totalMaterials = sumMaterials(items.flatMap((item) => item.materialCosts));
	const requiredByMaterial = new Map(totalMaterials.map((material) => [material.materialId, material.amount]));
	const selectedDungeons = [...baseDungeonIds].flatMap((baseDungeonId) => {
		const variants = enhancementDungeons.filter((dungeon) => dungeon.baseDungeonId === baseDungeonId);
		const difficulty = forcedDungeons.has(baseDungeonId) ? 5 : difficultyByDungeon[baseDungeonId] ?? 4;
		const dungeon = variants.find((variant) => variant.difficulty === difficulty)
			?? variants.find((variant) => variant.difficulty === 4)
			?? variants[0];
		return dungeon ? [dungeon] : [];
	});
	const dungeons = selectedDungeons.flatMap((dungeon) => {
		const pointRewardEnabled = Boolean(dungeon.pointReward && pointRewardsByDungeon[dungeon.baseDungeonId]);
		const materials = dungeon.materials.flatMap((material) => {
			const required = requiredByMaterial.get(material.materialId) ?? 0;
			const expectedPerRun = material.expectedPerRun + (pointRewardEnabled ? material.pointBonusPerRun ?? 0 : 0);
			return required <= 0 || expectedPerRun <= 0 ? [] : [{
				...material,
				expectedPerRun,
				required,
				rawRuns: required / expectedPerRun
			}];
		});
		if (!materials.length) return [];
		const rawRuns = Math.max(...materials.map((material) => material.rawRuns));
		return [{
			dungeonId: dungeon.id,
			baseDungeonId: dungeon.baseDungeonId,
			difficulty: dungeon.difficulty,
			name: dungeon.name,
			originalName: dungeon.originalName,
			basis: dungeon.basis,
			originalBasis: dungeon.originalBasis,
			rawRuns,
			runs: Math.ceil(rawRuns),
			materials,
			pointRewardEnabled,
			pointReward: dungeon.pointReward,
			forcedDifficulty: forcedDungeons.has(dungeon.baseDungeonId)
		}];
	});
	return {
		items,
		dungeons,
		totalMaterials,
		totalRuns: dungeons.reduce((sum, dungeon) => sum + dungeon.runs, 0),
		expectedDays: dungeons.reduce((days, dungeon) => Math.max(days, dungeon.runs), 0),
		totalEly: items.reduce((sum, item) => sum + item.ely, 0)
	};
}
