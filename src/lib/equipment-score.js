import snapshot from './data/equipment-score.json' with { type: 'json' };

/**
 * Numerical snapshot of https://latale.wiki/tools/equipment-score, retrieved 2026-10-03.
 * The wiki's profile-dependent values and calculation quirks are retained verbatim.
 * Source asset and SHA-256 are recorded with the translated snapshot for future audits.
 */
export const EQUIPMENT_SCORE_SOURCE = snapshot.source;
export const EQUIPMENT_SCORE_KIND_CONFIGS = snapshot.EQUIPMENT_SCORE_KIND_CONFIGS;
export const EQUIPMENT_SCORE_KIND_GROUPS = snapshot.EQUIPMENT_SCORE_KIND_GROUPS;
export const EQUIPMENT_SCORE_OPTIONS = snapshot.EQUIPMENT_SCORE_OPTIONS;
export const EQUIPMENT_SCORE_EXAMPLES = snapshot.EQUIPMENT_SCORE_EXAMPLES;
export const EQUIPMENT_SCORE_GRADE_LABELS = snapshot.EQUIPMENT_SCORE_GRADE_LABELS;
export const EQUIPMENT_SCORE_PROFILE_LABELS = snapshot.EQUIPMENT_SCORE_PROFILE_LABELS;
export const EQUIPMENT_SCORE_SOURCE_NOTE = snapshot.EQUIPMENT_SCORE_SOURCE_NOTE;

/** Match the wiki input's handling of decimal numbers, separators, and negative input. */
export function parseEquipmentScoreInput(value) {
	const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
	return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function calculatePenalty(kind, grade, values) {
	const penalty = EQUIPMENT_SCORE_KIND_CONFIGS[kind].penalty;
	const threshold = penalty?.thresholdByGrade[grade];
	return penalty && threshold !== undefined
		? Math.max(0, threshold - (values[penalty.optionKey] ?? 0)) * penalty.perPoint
		: 0;
}

/**
 * Each option caps at 100% attainment, but the sum of weighted contributions is not
 * capped at 100 points. Only the two Spirit Stone reference rows are excluded.
 */
export function calculateEquipmentScore(kind, grade, profile, values) {
	const rows = EQUIPMENT_SCORE_OPTIONS[kind].map((option) => {
		const current = values[option.key] ?? 0;
		const max = grade === 'transcendence'
			? option.transcendenceMaxByProfile[profile]
			: option.baseMaxByProfile[profile];
		const attainment = max > 0 ? Math.min(100, current / max * 100) : 0;
		const baseBonus = grade === 'base' ? option.baseBonusByProfile[profile] : 0;
		// The wiki uses base maximum + bonus here, even when its transcendent maximum differs.
		const convertedMax = grade === 'base' ? max + baseBonus : max;
		// Empty/zero options receive no projected contribution, even when they have a bonus.
		const transcendenceAttainment = convertedMax > 0 && current > 0
			? Math.min(100, (current + baseBonus) / convertedMax * 100)
			: 0;
		const weight = option.weightByProfile[profile];
		return {
			...option,
			current,
			max,
			baseBonus,
			attainment,
			transcendenceAttainment,
			weight,
			contribution: attainment * weight,
			transcendenceContribution: transcendenceAttainment * weight
		};
	});
	const included = rows.filter((row) => row.includeInTotal);
	const subtotal = included.reduce((total, row) => total + row.contribution, 0);
	const penalty = calculatePenalty(kind, grade, values);
	const score = Math.max(0, subtotal - penalty);
	const projectedValues = Object.fromEntries(rows.map((row) => [row.key, row.current + row.baseBonus]));
	const projectedSubtotal = included.reduce((total, row) => total + row.transcendenceContribution, 0);
	const transcendenceScore = Math.max(0, projectedSubtotal - (
		grade === 'base' ? calculatePenalty(kind, 'transcendence', projectedValues) : 0
	));
	const config = EQUIPMENT_SCORE_KIND_CONFIGS[kind];
	const comparisonScore = config.comparisonLabel
		? config.group === 'tear'
			? Math.max(0, (3.75 * score - 66) / 4.6)
			// Preserve the published Garden formula, including its zero-clamped results.
			: Math.max(0, (score - (94 + score / 100 * 60)) / 6)
		: null;

	return { rows, subtotal, penalty, score, transcendenceScore, comparisonScore };
}

/** The wiki uses these same thresholds for every kind; Ika's adjustment is advisory. */
export function getEquipmentScoreRating(score) {
	if (score >= 90) return {
		id: 'mythic', label: 'Mythic', originalLabel: '신화급',
		description: 'Strong enough to use as a final equipment piece.'
	};
	if (score >= 84) return {
		id: 'near-mythic', label: 'Near-mythic', originalLabel: '준신화급',
		description: 'Consider whether stronger options are worth replacing this piece.'
	};
	if (score >= 70) return {
		id: 'transcendent', label: 'Transcendent', originalLabel: '초월급',
		description: 'A usable range for transcendent equipment.'
	};
	return {
		id: 'developing', label: 'Developing', originalLabel: '성장 구간',
		description: 'Look for improvements through enhancement or option replacement.'
	};
}
