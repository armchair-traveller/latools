import data from './data/runestone.json' with { type: 'json' };

export const RUNESTONE_SOURCE = data.source;
export const RUNESTONE_RUNES = data.runes;
export const RUNESTONE_TIERS = data.tiers;
export const MAX_RUNESTONE_SLOTS = data.maxSlots;
export const MAX_RUNESTONE_SCORE = data.maxScore;

const runesById = new Map(RUNESTONE_RUNES.map((rune) => [rune.id, rune]));
const roundScore = (score) => Math.round(score * 10) / 10;

/** Keep a selection in the same order as the wiki's unique, eight-slot picker. */
function validSelection(selectedIds) {
	if (!Array.isArray(selectedIds)) return [];
	return [...new Set(selectedIds.filter((id) => runesById.has(id)))].slice(0, MAX_RUNESTONE_SLOTS);
}

/** The eighth rune contributes its score twice, only when all eight slots are filled. */
export function calculateRunestoneScore(selectedIds = []) {
	const selectedRunes = validSelection(selectedIds).map((id) => runesById.get(id));
	const baseScore = roundScore(selectedRunes.reduce((sum, rune) => sum + rune.score, 0));
	const eighthSlotBonus = selectedRunes.length === MAX_RUNESTONE_SLOTS
		? selectedRunes[MAX_RUNESTONE_SLOTS - 1].score
		: 0;
	const totalScore = Math.min(roundScore(baseScore + eighthSlotBonus), MAX_RUNESTONE_SCORE);
	const tier = [...RUNESTONE_TIERS].sort((a, b) => b.minScore - a.minScore)
		.find((entry) => totalScore >= entry.minScore) ?? RUNESTONE_TIERS[RUNESTONE_TIERS.length - 1];
	const nextTier = [...RUNESTONE_TIERS].sort((a, b) => a.minScore - b.minScore)
		.find((entry) => entry.minScore > totalScore) ?? null;

	return {
		selectedRunes,
		baseScore,
		eighthSlotBonus,
		totalScore,
		tier,
		nextTier,
		pointsToNextTier: nextTier ? roundScore(nextTier.minScore - totalScore) : 0
	};
}

/** Selecting again removes a rune and closes its gap; a full selection rejects new runes. */
export function toggleRunestone(selectedIds, id) {
	const selection = validSelection(selectedIds);
	if (selection.includes(id)) return selection.filter((selectedId) => selectedId !== id);
	if (!runesById.has(id) || selection.length >= MAX_RUNESTONE_SLOTS) return selection;
	return [...selection, id];
}

/** Match the wiki's "To slot 8": remove the chosen rune, shift left, and append it. */
export function moveRunestoneToBoostSlot(selectedIds, id) {
	const selection = validSelection(selectedIds);
	if (!selection.includes(id) || selection.length !== MAX_RUNESTONE_SLOTS) return selection;
	return [...selection.filter((selectedId) => selectedId !== id), id];
}

/** Stable score order preserves the wiki's tie ordering, with the best rune last. */
export function getBestRunestoneSelection() {
	const [best, ...remaining] = [...RUNESTONE_RUNES]
		.sort((a, b) => b.score - a.score)
		.slice(0, MAX_RUNESTONE_SLOTS);
	return [...remaining.map((rune) => rune.id), best.id];
}
