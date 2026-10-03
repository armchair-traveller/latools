import {
	DEFAULT_SPEC_INPUTS,
	DEFAULT_SPEC_CALCULATION_SETTINGS,
	DEFAULT_SPEC_SELECTIONS,
	DEFAULT_ENCHANT_OPTION,
	JOBS,
	DIRECT_SKILLS,
	PLACEMENT_SKILLS,
	DUNGEONS,
	SUMMONS,
	type SpecInputs,
	type CalculationSettings,
	type SpecSelections,
	type EnchantOption,
	type HpCalibration,
	type NumericExpression
} from './spec-analyzer.js';

export const WORKSPACE_KEY = 'latale-spec-analyzer-v3';
export interface Specification {
	inputs: SpecInputs;
	settings: CalculationSettings;
	selections: SpecSelections;
	oldEnchant: EnchantOption;
	newEnchant: EnchantOption;
	hpCalibration: HpCalibration;
	overrides: {
		enabled: boolean;
		direct: NumericExpression;
		placedWeapon: NumericExpression;
		placedReflection: NumericExpression;
	};
}
export interface SavedSpecification {
	id: string;
	name: string;
	savedAt: string;
	specification: Specification;
}
export function createSpecification(): Specification {
	return {
		inputs: { ...DEFAULT_SPEC_INPUTS },
		settings: { ...DEFAULT_SPEC_CALCULATION_SETTINGS },
		selections: { ...DEFAULT_SPEC_SELECTIONS },
		oldEnchant: { ...DEFAULT_ENCHANT_OPTION },
		newEnchant: { ...DEFAULT_ENCHANT_OPTION },
		hpCalibration: { stamina: 0, staminaMinus10: 0, maxHp: 0, maxHpMinus10: 0 },
		overrides: {
			enabled: false,
			direct: 5000,
			placedWeapon: 42,
			placedReflection: 116
		}
	};
}
function record(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === 'object' && !Array.isArray(value);
}
function restorable(original: unknown, candidate: unknown): boolean {
	if (typeof original === 'boolean') return typeof candidate === 'boolean';
	if (typeof original === 'string')
		return typeof candidate === 'string' && candidate.length <= 200;
	// Preserve arithmetic text, including an unfinished draft, so the editor can flag it.
	return (
		typeof original === 'number' &&
		((typeof candidate === 'number' && Number.isFinite(candidate)) ||
			(typeof candidate === 'string' && candidate.length <= 200))
	);
}
function mergeKnown<T extends object>(defaults: T, value: unknown): T {
	if (!record(value)) return { ...defaults };
	const result = { ...defaults };
	for (const key of Object.keys(defaults) as (keyof T & string)[]) {
		if (!Object.hasOwn(value, key)) continue;
		const candidate = value[key];
		if (restorable(defaults[key], candidate))
			result[key] = candidate as T[typeof key];
	}
	return result;
}
/** Untrusted imports only restore known fields and valid catalog selections. */
export function readSpecification(
	value: unknown,
	{ legacy = false }: { legacy?: boolean } = {}
): Specification | null {
	if (!record(value) || !record(value.inputs)) return null;
	const base = createSpecification();
	const inputValues = value.inputs;
	if (
		!Object.entries(base.inputs).some(
			([key, original]) =>
				Object.hasOwn(inputValues, key) &&
				restorable(original, inputValues[key])
		)
	)
		return null;
	const result: Specification = {
		inputs: mergeKnown(base.inputs, value.inputs),
		settings: mergeKnown(base.settings, value.settings),
		selections: mergeKnown(base.selections, value.selections),
		oldEnchant: mergeKnown(base.oldEnchant, value.oldEnchant),
		newEnchant: mergeKnown(base.newEnchant, value.newEnchant),
		hpCalibration: mergeKnown(base.hpCalibration, value.hpCalibration),
		overrides: mergeKnown(base.overrides, value.overrides)
	};
	const { inputs, settings, selections } = result;
	if (selections.jobId === 'custom') result.overrides.enabled = true;
	else if (!JOBS.some((x) => x.id === selections.jobId))
		selections.jobId = base.selections.jobId;
	if (!DUNGEONS.some((x) => x.id === selections.dungeonId))
		selections.dungeonId = base.selections.dungeonId;
	// Version 2's summon selector lived in selections; inputs.summonId could be stale.
	if (
		legacy &&
		record(value.selections) &&
		Object.hasOwn(value.selections, 'summonId')
	) {
		inputs.summonId =
			typeof value.selections.summonId === 'string'
				? value.selections.summonId
				: 'none';
	}
	if (!SUMMONS.some((x) => x.id === inputs.summonId)) inputs.summonId = 'none';
	selections.summonId = inputs.summonId;
	const job = JOBS.find((x) => x.id === selections.jobId);
	const allowed = (skill: { job: string }) =>
		selections.jobId === 'custom' ||
		skill.job === job?.name ||
		skill.job === 'All Classes';
	if (
		!DIRECT_SKILLS.some((x) => x.id === selections.directSkillId && allowed(x))
	)
		selections.directSkillId = (
			DIRECT_SKILLS.find((x) => x.job === job?.name) ??
			DIRECT_SKILLS.find(allowed) ??
			DIRECT_SKILLS[0]
		).id;
	if (
		!PLACEMENT_SKILLS.some(
			(x) => x.id === selections.placementSkillId && allowed(x)
		)
	)
		selections.placementSkillId = (
			PLACEMENT_SKILLS.find((x) => x.job === job?.name) ??
			PLACEMENT_SKILLS.find(allowed) ??
			PLACEMENT_SKILLS[0]
		).id;
	if (!['average', 'maximum'].includes(settings.damageMode))
		settings.damageMode = 'average';
	if (
		!['crit', 'minimum', 'maximum', 'minmax'].includes(settings.referenceStat)
	)
		settings.referenceStat = 'crit';
	return result;
}
export function readSavedSpecifications(value: unknown): SavedSpecification[] {
	if (!Array.isArray(value)) return [];
	const seen = new Set<string>();
	return value.slice(0, 100).flatMap((item) => {
		if (
			!record(item) ||
			typeof item.id !== 'string' ||
			typeof item.name !== 'string'
		)
			return [];
		const id = item.id.trim().slice(0, 100);
		const name = item.name.trim().slice(0, 80);
		if (!id || !name || seen.has(id)) return [];
		const legacy = item.specification == null;
		const specification = readSpecification(
			legacy ? item.state : item.specification,
			{ legacy }
		);
		if (!specification) return [];
		seen.add(id);
		const savedAt =
			typeof item.savedAt === 'string' &&
			item.savedAt.length <= 50 &&
			Number.isFinite(Date.parse(item.savedAt))
				? item.savedAt
				: '';
		return [{ id, name, savedAt, specification }];
	});
}
export const formatNumber = (value: number, digits = 0) =>
	new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(
		Number.isFinite(value) ? value : 0
	);
export const formatDamage = (value: number) =>
	new Intl.NumberFormat('en-US', {
		notation: 'compact',
		maximumFractionDigits: 2
	}).format(Number.isFinite(value) ? value : 0);
export const formatChange = (value: number) =>
	`${value > 0 ? '+' : ''}${formatNumber(value, 2)}%`;
