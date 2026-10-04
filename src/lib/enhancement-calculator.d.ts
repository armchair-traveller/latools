export interface EnhancementMaterialCost {
	materialId: string;
	materialName: string;
	originalMaterialName: string;
	icon: string;
	amount: number;
}

export interface EnhancementStage {
	label: string;
	originalLabel: string;
	costs: EnhancementMaterialCost[];
	ely: number;
}

export interface EnhancementEquipment {
	id: string;
	name: string;
	originalName: string;
	subName: string;
	originalSubName: string;
	category: string;
	originalCategory: string;
	dungeonId: string;
	icon: string;
	baseLabel: string;
	originalBaseLabel: string;
	stages: EnhancementStage[];
}

export interface EnhancementMaterialYield {
	materialId: string;
	materialName: string;
	originalMaterialName: string;
	expectedPerRun: number;
	source: string;
	basis: string;
	originalBasis: string;
	pointBonusPerRun?: number;
	pointBonusBasis?: string;
	originalPointBonusBasis?: string;
}

export interface EnhancementPointReward {
	label: string;
	originalLabel: string;
	pointCost: number;
}

export interface EnhancementDungeon {
	id: string;
	baseDungeonId: string;
	difficulty: number;
	name: string;
	originalName: string;
	expectedRunsPerDay: number;
	basis: string;
	originalBasis: string;
	materials: EnhancementMaterialYield[];
	pointReward?: EnhancementPointReward;
}

export interface EnhancementSelection {
	selectionId: number;
	equipmentId: string;
	currentStage: number;
}

export interface EnhancementItemResult {
	selectionId: number;
	equipmentId: string;
	name: string;
	currentLabel: string;
	targetLabel: string;
	materialCosts: EnhancementMaterialCost[];
	ely: number;
}

export interface EnhancementDungeonResult {
	dungeonId: string;
	baseDungeonId: string;
	difficulty: number;
	name: string;
	originalName: string;
	basis: string;
	originalBasis: string;
	rawRuns: number;
	runs: number;
	materials: (EnhancementMaterialYield & { required: number; rawRuns: number })[];
	pointRewardEnabled: boolean;
	pointReward?: EnhancementPointReward;
	forcedDifficulty: boolean;
}

export interface EnhancementResult {
	items: EnhancementItemResult[];
	dungeons: EnhancementDungeonResult[];
	totalMaterials: EnhancementMaterialCost[];
	totalRuns: number;
	expectedDays: number;
	totalEly: number;
}

export const enhancementEquipment: EnhancementEquipment[];
export const enhancementDungeons: EnhancementDungeon[];
export const enhancementSource: {
	url: string;
	title: string;
	retrievedOn: string;
	bundleUrl: string;
	bundleSha256: string;
	notes: string[];
};
export const defaultEnhancementSelections: EnhancementSelection[];
export function calculateEnhancement(
	selections: EnhancementSelection[],
	difficultyByDungeon?: Record<string, number>,
	pointRewardsByDungeon?: Record<string, boolean>
): EnhancementResult;
