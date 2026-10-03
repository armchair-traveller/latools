export type EquipmentScoreKind =
	| 'weapon' | 'spiritStone'
	| 'ikaHat' | 'ikaUpperLower' | 'ikaGloves' | 'ikaShoes'
	| 'gardenHat' | 'gardenUpperLower' | 'gardenGloves' | 'gardenShoes'
	| 'tearEarring' | 'tearCloak' | 'tearRing'
	| 'belialEarring' | 'belialCloak' | 'belialRing';
export type EquipmentScoreGrade = 'base' | 'transcendence' | 'combined' | 'full';
export type EquipmentScoreProfile = 'strMag' | 'weapon' | 'balance';
export type EquipmentScoreValues = Record<string, number>;
export type EquipmentScoreProfileValues = Record<EquipmentScoreProfile, number>;

export interface EquipmentScoreOption {
	key: string;
	label: string;
	originalLabel: string;
	baseMax: number;
	transcendenceMax: number;
	baseBonus: number;
	baseMaxByProfile: EquipmentScoreProfileValues;
	transcendenceMaxByProfile: EquipmentScoreProfileValues;
	baseBonusByProfile: EquipmentScoreProfileValues;
	weightByProfile: EquipmentScoreProfileValues;
	includeInTotal: boolean;
}
export interface EquipmentScoreKindConfig {
	label: string;
	originalLabel: string;
	group: 'basic' | 'ika' | 'garden' | 'tear' | 'belial';
	grades: EquipmentScoreGrade[];
	icon: string;
	note?: string;
	originalNote?: string;
	comparisonLabel?: string;
	penalty?: {
		optionKey: string;
		thresholdByGrade: Partial<Record<EquipmentScoreGrade, number>>;
		perPoint: number;
		label: string;
	};
}
export interface EquipmentScoreRow extends EquipmentScoreOption {
	current: number;
	max: number;
	attainment: number;
	transcendenceAttainment: number;
	weight: number;
	contribution: number;
	transcendenceContribution: number;
}
export interface EquipmentScoreResult {
	rows: EquipmentScoreRow[];
	subtotal: number;
	penalty: number;
	score: number;
	transcendenceScore: number;
	comparisonScore: number | null;
}
export interface EquipmentScoreRating {
	id: 'mythic' | 'near-mythic' | 'transcendent' | 'developing';
	label: string;
	originalLabel: string;
	description: string;
}

export const EQUIPMENT_SCORE_SOURCE: {
	url: string;
	retrievedAt: string;
	dataSourceUrl: string;
	dataSourceSha256: string;
	contributor: string;
};
export const EQUIPMENT_SCORE_KIND_CONFIGS: Record<EquipmentScoreKind, EquipmentScoreKindConfig>;
export const EQUIPMENT_SCORE_KIND_GROUPS: { label: string; originalLabel: string; kinds: EquipmentScoreKind[] }[];
export const EQUIPMENT_SCORE_OPTIONS: Record<EquipmentScoreKind, EquipmentScoreOption[]>;
export const EQUIPMENT_SCORE_EXAMPLES: Record<EquipmentScoreKind, EquipmentScoreValues>;
export const EQUIPMENT_SCORE_GRADE_LABELS: Record<EquipmentScoreGrade, string>;
export const EQUIPMENT_SCORE_PROFILE_LABELS: Record<EquipmentScoreProfile, string>;
export const EQUIPMENT_SCORE_SOURCE_NOTE: string;
export function calculateEquipmentScore(kind: EquipmentScoreKind, grade: EquipmentScoreGrade, profile: EquipmentScoreProfile, values: EquipmentScoreValues): EquipmentScoreResult;
export function getEquipmentScoreRating(score: number): EquipmentScoreRating;
export function parseEquipmentScoreInput(value: string): number;
