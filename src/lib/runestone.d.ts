export interface Runestone {
	id: number;
	name: string;
	originalName: string;
	effects: string[];
	originalEffects: string[];
	score: number;
	level: string;
	type: 'basic' | 'advanced';
	reviewNote?: string;
}

export interface RunestoneTier {
	name: string;
	originalName: string;
	minScore: number;
}

export interface RunestoneScore {
	selectedRunes: Runestone[];
	baseScore: number;
	eighthSlotBonus: number;
	totalScore: number;
	tier: RunestoneTier;
	nextTier: RunestoneTier | null;
	pointsToNextTier: number;
}

export const RUNESTONE_SOURCE: {
	url: string;
	retrievedAt: string;
	dataSourceUrl: string;
	dataSourceSha256: string;
	calculationSourceUrl: string;
	calculationSourceSha256: string;
	terminologySource: string;
	terminologySourceSha256: string;
	note: string;
};
export const RUNESTONE_RUNES: Runestone[];
export const RUNESTONE_TIERS: RunestoneTier[];
export const MAX_RUNESTONE_SLOTS: number;
export const MAX_RUNESTONE_SCORE: number;
export function calculateRunestoneScore(selectedIds?: readonly number[]): RunestoneScore;
export function toggleRunestone(selectedIds: readonly number[], id: number): number[];
export function moveRunestoneToBoostSlot(selectedIds: readonly number[], id: number): number[];
export function getBestRunestoneSelection(): number[];
