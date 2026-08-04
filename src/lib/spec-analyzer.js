// @ts-nocheck

import {
	DEFAULT_ENCHANT_OPTION,
	DEFAULT_SPEC_CALCULATION_SETTINGS,
	DEFAULT_SPEC_INPUTS,
	DEFAULT_SPEC_SELECTIONS,
	DIRECT_SKILLS,
	DUNGEONS,
	JOBS,
	PLACEMENT_SKILLS,
	SPEC_ANALYZER_DATA_META,
	SUMMONS
} from './spec-analyzer-data.js';

export {
	DEFAULT_ENCHANT_OPTION,
	DEFAULT_SPEC_CALCULATION_SETTINGS,
	DEFAULT_SPEC_INPUTS,
	DEFAULT_SPEC_SELECTIONS,
	DIRECT_SKILLS,
	DUNGEONS,
	JOBS,
	PLACEMENT_SKILLS,
	SPEC_ANALYZER_DATA_META,
	SUMMONS
};

/** Parse the small arithmetic expressions accepted by the reference workbook UI. */
export function parseNumericInput(value) {
	if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
	if (typeof value !== 'string') {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}
	const source = value.trim().replaceAll(',', '');
	if (!source) return 0;
	if (!/^[\d+\-*/().\s]+$/.test(source)) return 0;

	let index = 0;
	const skip = () => {
		while (/\s/.test(source[index] ?? '')) index += 1;
	};
	const primary = () => {
		skip();
		if (source[index] === '(') {
			index += 1;
			const result = expression();
			skip();
			if (source[index] !== ')') throw new Error('unclosed expression');
			index += 1;
			return result;
		}
		let sign = 1;
		while (source[index] === '+' || source[index] === '-') {
			if (source[index] === '-') sign *= -1;
			index += 1;
			skip();
		}
		const start = index;
		while (/[\d.]/.test(source[index] ?? '')) index += 1;
		if (start === index) throw new Error('number expected');
		const parsed = Number(source.slice(start, index));
		if (!Number.isFinite(parsed)) throw new Error('invalid number');
		return sign * parsed;
	};
	const term = () => {
		let result = primary();
		while (true) {
			skip();
			const operator = source[index];
			if (operator !== '*' && operator !== '/') break;
			index += 1;
			const right = primary();
			result = operator === '*' ? result * right : right === 0 ? 0 : result / right;
		}
		return result;
	};
	const expression = () => {
		let result = term();
		while (true) {
			skip();
			const operator = source[index];
			if (operator !== '+' && operator !== '-') break;
			index += 1;
			const right = term();
			result = operator === '+' ? result + right : result - right;
		}
		return result;
	};

	try {
		const result = expression();
		skip();
		return index === source.length && Number.isFinite(result) ? result : 0;
	} catch {
		return 0;
	}
}

const number = (value) => parseNumericInput(value);
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, number(value)));
const divide = (numerator, denominator) => (number(denominator) === 0 ? 0 : number(numerator) / number(denominator));
const percentChange = (before, after) => (number(before) === 0 ? 0 : (number(after) / number(before) - 1) * 100);
const round2 = (value) => Math.round(number(value) * 100) / 100;
const round4 = (value) => Math.round(number(value) * 10000) / 10000;
const cloneStats = (stats) => structuredClone(stats);

const pairedStats = [
	['strMag', 'strMagFlat', 'strMagPercent'],
	['weaponAttr', 'weaponAttrFlat', 'weaponAttrPercent'],
	['criticalDamage', 'critDmgFlat', 'critDmgPercent'],
	['minimumDamage', 'minDmgFlat', 'minDmgPercent'],
	['maximumDamage', 'maxDmgFlat', 'maxDmgPercent'],
	['fixedDamage', 'fixedDmgFlat', 'fixedDmgPercent'],
	['normalExtraDamage', 'normalExtraDmgFlat', 'normalExtraDmgPercent'],
	['bossExtraDamage', 'bossExtraDmgFlat', 'bossExtraDmgPercent']
];

export function aggregateStats(inputs = DEFAULT_SPEC_INPUTS, options = {}) {
	const summonId = options.summonId ?? inputs.summonId ?? 'none';
	const summon = SUMMONS.find((item) => item.id === summonId) ?? SUMMONS[0];
	const bonuses = summon.bonuses ?? {};
	const result = {};

	for (const [resultKey, flatKey, percentKey] of pairedStats) {
		let flat = number(inputs[flatKey]) + number(bonuses[flatKey]);
		if (resultKey === 'weaponAttr' && inputs.physicalJob !== false) flat += 115;
		const percent = number(inputs[percentKey]) + number(bonuses[percentKey]);
		result[resultKey] = {
			flat,
			percent,
			total: flat * (1 + percent / 100),
			per1Pct: divide(flat, 100 + percent)
		};
	}

	return {
		...result,
		normalDomination: Math.min(number(inputs.normalDomination) + number(bonuses.normalDomination), 100),
		bossDomination: Math.min(number(inputs.bossDomination) + number(bonuses.bossDomination), 100),
		penetration: Math.min(number(inputs.penetration), 99),
		placementCoreLevel: number(inputs.placementCoreLevel),
		backAttackDmg: number(inputs.backAttackDmg),
		strMagEfficiency: number(inputs.strMagEfficiency),
		physicalJob: inputs.physicalJob !== false,
		summonId: summon.id
	};
}

export function calculateBaseShares(stats, { criterion = 'normal' } = {}) {
	const extra = criterion === 'boss' ? stats.bossExtraDamage.total : stats.normalExtraDamage.total;
	const components = {
		strMag: stats.strMag.total,
		weaponAttr: 100 * stats.weaponAttr.total,
		fixedDamage: stats.fixedDamage.total,
		extraDamage: extra
	};
	const total = Object.values(components).reduce((sum, value) => sum + value, 0);
	return Object.fromEntries(Object.entries(components).map(([key, value]) => [key, round4(divide(value, total))]));
}

export function calculateConversionSummary(stats, { criterion = 'normal' } = {}) {
	const minimum = stats.minimumDamage.total;
	const maximum = stats.maximumDamage.total;
	const critical = stats.criticalDamage.total;
	const domination = criterion === 'boss' ? stats.bossDomination : stats.normalDomination;
	const minimumTerm = 0.95 + Math.min(minimum, maximum) / 100;
	const maximumTerm = 1.05 + maximum / 100;
	const average = (minimumTerm + maximumTerm) / 2;
	const inverse = divide(1, divide(average, 1 + critical / 100) * 2);
	const minimumRatio = divide(inverse * (1 + stats.minimumDamage.percent / 100), 1 + stats.criticalDamage.percent / 100);
	const maximumRatio = divide(inverse * (1 + stats.maximumDamage.percent / 100), 1 + stats.criticalDamage.percent / 100);
	const criticalToMinimum = divide(1, minimumRatio);
	const criticalToMaximum = divide(1, maximumRatio);
	const criticalMarginal = (average * (1 + critical / 100)) / 100;
	const dominationMarginal = (average / 100) * (1 + domination / 100) * (1 + stats.criticalDamage.percent / 100);
	const maximumMarginal = (critical / 10000) * (1 + domination / 100) * (1 + stats.maximumDamage.percent / 100);
	const minimumMarginal = (critical / 10000) * (1 + domination / 100) * (1 + stats.minimumDamage.percent / 100);
	const dominationToCritical = divide(criticalMarginal, dominationMarginal);
	const dominationToMaximum = divide(criticalMarginal, maximumMarginal) * criticalToMaximum;
	const dominationToMinimum = divide(criticalMarginal, minimumMarginal) * criticalToMinimum;

	const dominationShare = round2(divide(domination, 100 + domination));
	const criticalShare = round2(divide(1 + critical / 100, 1 + critical / 100 + average) * (1 - dominationShare));
	const maximumShare = round2((1 - criticalShare - dominationShare) * divide(maximum / 100, 2 * average));
	const minimumShare = round2(1 - criticalShare - dominationShare - maximumShare);

	return {
		criterion,
		criticalToMinimum,
		criticalToMaximum,
		finalCriticalPer1: stats.criticalDamage.per1Pct,
		finalMaximumPer1: stats.maximumDamage.per1Pct,
		finalMinimumPer1: stats.minimumDamage.per1Pct,
		dominationToCritical,
		dominationToMaximum,
		dominationToMinimum,
		// Compatibility aliases used by the first local implementation.
		criticalToDomination: dominationToCritical,
		criticalToMaximumAdjusted: dominationToMaximum,
		criticalToMinimumAdjusted: dominationToMinimum,
		damageShares: {
			minimum: minimumShare,
			maximum: maximumShare,
			critical: criticalShare,
			domination: dominationShare
		},
		baseShares: calculateBaseShares(stats, { criterion })
	};
}

export function damageFactor({
	minimumDamage = 0,
	maximumDamage = 0,
	criticalDamage = 0,
	domination = 0,
	backAttackRate = 0,
	mode = 'average'
}) {
	const minimumTerm = 0.95 + Math.min(number(minimumDamage), number(maximumDamage)) / 100;
	const maximumTerm = 1.05 + number(maximumDamage) / 100;
	const average = (minimumTerm + maximumTerm) / 2;
	const rate = typeof backAttackRate === 'boolean' ? (backAttackRate ? 1 : 0) : clamp(backAttackRate, 0, 100) / 100;
	const roll = mode === 'maximum' ? maximumTerm : average * (1 - rate) + maximumTerm * rate;
	return roll * (1 + number(criticalDamage) / 100) * (1 + number(domination) / 100);
}

const isBossScenario = (scenario) => scenario === 'boss' || scenario === 'boss-theory';
const usesDungeon = (scenario) => scenario === 'normal' || scenario === 'boss';

function scenarioValues(stats, scenario) {
	const boss = isBossScenario(scenario);
	return {
		boss,
		extraDamage: boss ? stats.bossExtraDamage.total : stats.normalExtraDamage.total,
		domination: boss ? stats.bossDomination : stats.normalDomination
	};
}

export function resolveDungeon(dungeon = DUNGEONS[0], settings = {}) {
	if (!settings.useCustomDungeonStats) return dungeon ?? DUNGEONS[0];
	return {
		id: 'custom',
		name: 'Custom dungeon',
		normalDefense: number(settings.customNormalDefense),
		bossDefense: number(settings.customBossDefense),
		normalDmgReduction: number(settings.customNormalDmgReduction),
		bossDmgReduction: number(settings.customBossDmgReduction)
	};
}

export function calcDirectHitDamage({
	stats,
	coefficient,
	scenario = 'theory',
	dungeon = DUNGEONS[0],
	backAttackRate = 0,
	mode = 'average'
}) {
	const resolvedCoefficient = number(coefficient);
	const weaponTerm = (2 * stats.weaponAttr.total * resolvedCoefficient) / 100;
	const strengthTerm = stats.strMag.total * (1 + stats.strMagEfficiency / 100);
	const core = strengthTerm + weaponTerm;
	const values = scenarioValues(stats, scenario);
	let rawBase = core + stats.fixedDamage.total + values.extraDamage;

	if (usesDungeon(scenario)) {
		const penetration = stats.penetration / 100;
		const defense = values.boss ? dungeon.bossDefense : dungeon.normalDefense;
		const reduction = values.boss ? dungeon.bossDmgReduction : dungeon.normalDmgReduction;
		rawBase = penetration * core - reduction - (1 - penetration) * defense + stats.fixedDamage.total + values.extraDamage;
	}

	const factor = damageFactor({
		minimumDamage: stats.minimumDamage.total,
		maximumDamage: stats.maximumDamage.total,
		criticalDamage: stats.criticalDamage.total,
		domination: values.domination,
		backAttackRate,
		mode
	});
	return { damage: rawBase * factor, rawBase, factor, coefficient: resolvedCoefficient, scenario };
}

export function placementCoefficients(skill, skillLevel = 0) {
	const resolved = skill ?? PLACEMENT_SKILLS[0];
	const level = number(skillLevel);
	return {
		weaponCoefficient: number(resolved.weaponCoefficient),
		strengthMultiplier: number(resolved.strengthBase) + number(resolved.strengthPerLevel) * level,
		totalMultiplier: number(resolved.totalBase) + number(resolved.totalPerLevel) * level
	};
}

export function placementCoreCoefficients(coreLevel = 19) {
	const skillLevel = number(coreLevel) + 50;
	let step = 0;
	let rate = 0;
	let base = 0;
	if (skillLevel >= 1 && skillLevel <= 10) [step, rate, base] = [skillLevel, 1.5, 0];
	else if (skillLevel >= 11 && skillLevel <= 40) [step, rate, base] = [skillLevel - 10, 2, 15];
	else if (skillLevel >= 41 && skillLevel <= 60) [step, rate, base] = [skillLevel - 40, 2.5, 75];
	else if (skillLevel >= 61 && skillLevel <= 80) [step, rate, base] = [skillLevel - 60, 3, 125];
	else if (skillLevel > 80) [step, rate, base] = [skillLevel - 80, 3.5, 185];
	return {
		skillLevel,
		weaponCoefficient: 42,
		strengthMultiplier: 0.8 + 0.01 * skillLevel,
		totalMultiplier: 0.7 + base / 100 + (step * rate) / 100
	};
}

export function calcPlacementDamage({
	stats,
	skill = PLACEMENT_SKILLS[0],
	skillLevel = 0,
	coefficients,
	scenario = 'theory',
	dungeon = DUNGEONS[0],
	backAttackRate = 0,
	mode = 'average'
}) {
	const resolvedCoefficients = coefficients ?? placementCoefficients(skill, skillLevel);
	const values = scenarioValues(stats, scenario);
	const strengthTerm = stats.strMag.total * resolvedCoefficients.strengthMultiplier;
	const weaponTerm = stats.weaponAttr.total * resolvedCoefficients.weaponCoefficient;
	let rawBase = strengthTerm + weaponTerm + stats.fixedDamage.total + values.extraDamage;
	if (usesDungeon(scenario)) rawBase -= values.boss ? dungeon.bossDmgReduction : dungeon.normalDmgReduction;
	const factor = damageFactor({
		minimumDamage: stats.minimumDamage.total,
		maximumDamage: stats.maximumDamage.total,
		criticalDamage: stats.criticalDamage.total,
		domination: values.domination,
		backAttackRate,
		mode
	});
	return {
		damage: rawBase * factor * resolvedCoefficients.totalMultiplier,
		rawBase,
		factor,
		...resolvedCoefficients,
		scenario
	};
}

const EQUIVALENT_STATS = [
	['strMag', 'Strength / magic'],
	['weaponAttr', 'Weapon / attribute'],
	['fixedDamage', 'Fixed damage']
];

function referenceScale(stats, referenceStat = 'crit', damageMode = 'average') {
	const minimum = stats.minimumDamage.total;
	const maximum = stats.maximumDamage.total;
	const minimumTerm = 0.95 + Math.min(minimum, maximum) / 100;
	const maximumTerm = 1.05 + maximum / 100;
	const average = (minimumTerm + maximumTerm) / 2;
	const critical = divide(1 + stats.criticalDamage.percent / 100, Math.max(100 + stats.criticalDamage.total, 1));
	const minimumMarginal =
		minimum <= maximum
			? divide(1 + stats.minimumDamage.percent / 100, Math.max(200 * average, 1))
			: 0;
	const maximumMarginal = divide(
		1 + stats.maximumDamage.percent / 100,
		Math.max(100 * (damageMode === 'maximum' ? maximumTerm : 2 * average), 1)
	);
	const selected =
		referenceStat === 'minimum'
			? minimumMarginal
			: referenceStat === 'maximum'
				? maximumMarginal
				: referenceStat === 'minmax'
					? minimumMarginal + maximumMarginal
					: critical;
	return critical > 0 ? selected / critical : 0;
}

function efficiencyPanel({ kind, stats, scenario, directCoefficient, placementSkill, placementSkillLevel, dungeon, backAttackRate, damageMode, referenceStat }) {
	const values = scenarioValues(stats, scenario);
	const extraKey = values.boss ? 'bossExtraDamage' : 'normalExtraDamage';
	const criticalPercentMultiplier = 1 + stats.criticalDamage.percent / 100;
	const criticalTotalDenominator = 100 + stats.criticalDamage.total;
	let rawBase;
	let sensitivity;
	let damage;

	if (kind === 'direct') {
		const weaponCoefficient = (2 * number(directCoefficient)) / 100;
		const strengthMultiplier = 1 + stats.strMagEfficiency / 100;
		const core = weaponCoefficient * stats.weaponAttr.total + strengthMultiplier * stats.strMag.total;
		rawBase = core + stats.fixedDamage.total + values.extraDamage;
		if (usesDungeon(scenario)) {
			const penetration = stats.penetration / 100;
			const defense = values.boss ? dungeon.bossDefense : dungeon.normalDefense;
			const reduction = values.boss ? dungeon.bossDmgReduction : dungeon.normalDmgReduction;
			rawBase = penetration * core - reduction - (1 - penetration) * defense + stats.fixedDamage.total + values.extraDamage;
		}
		sensitivity = {
			strMag: strengthMultiplier,
			weaponAttr: weaponCoefficient,
			fixedDamage: 1,
			[extraKey]: 1
		};
		damage = calcDirectHitDamage({ stats, coefficient: directCoefficient, scenario, dungeon, backAttackRate, mode: damageMode }).damage;
	} else {
		const coefficients = placementCoefficients(placementSkill, placementSkillLevel);
		const core = coefficients.weaponCoefficient * stats.weaponAttr.total + coefficients.strengthMultiplier * stats.strMag.total;
		rawBase = core + stats.fixedDamage.total + values.extraDamage;
		if (usesDungeon(scenario)) rawBase -= values.boss ? dungeon.bossDmgReduction : dungeon.normalDmgReduction;
		sensitivity = {
			strMag: coefficients.strengthMultiplier,
			weaponAttr: coefficients.weaponCoefficient,
			fixedDamage: 1,
			[extraKey]: 1
		};
		damage = calcPlacementDamage({ stats, skill: placementSkill, skillLevel: placementSkillLevel, scenario, dungeon, backAttackRate, mode: damageMode }).damage;
	}

	const scale = referenceScale(stats, referenceStat, damageMode);
	const comparisonStats = [...EQUIVALENT_STATS, [extraKey, values.boss ? 'Boss extra damage' : 'Normal extra damage']];
	const equivalents = comparisonStats.map(([key, label]) => {
		const percentMultiplier = 1 + stats[key].percent / 100;
		const denominator = sensitivity[key] * percentMultiplier * criticalTotalDenominator;
		const nativeValue = rawBase > 0 && percentMultiplier > 0 ? divide(rawBase * criticalPercentMultiplier, denominator) : 0;
		const value = nativeValue * scale;
		return {
			key,
			label,
			value,
			reverse: nativeValue > 0 && scale > 0 ? divide(stats[key].per1Pct, nativeValue) / scale : 0
		};
	});
	return { damage, rawBase, referenceGain: 0, referenceStat, scale, equivalents };
}

export function calculateDamageEfficiency({
	stats,
	directCoefficient,
	placementSkill = PLACEMENT_SKILLS[0],
	placementSkillLevel = 0,
	dungeon = DUNGEONS[0],
	backAttackRate,
	damageMode,
	referenceStat,
	settings
}) {
	const resolvedSettings = {
		...DEFAULT_SPEC_CALCULATION_SETTINGS,
		...settings,
		...(backAttackRate === undefined ? {} : { backAttackRate }),
		...(damageMode === undefined ? {} : { damageMode }),
		...(referenceStat === undefined ? {} : { referenceStat })
	};
	const resolvedDungeon = resolveDungeon(dungeon, resolvedSettings);
	const scenarios = ['theory', 'normal', 'boss'];
	const direct = {};
	const placement = {};
	for (const scenario of scenarios) {
		const common = {
			stats,
			scenario,
			directCoefficient,
			placementSkill,
			placementSkillLevel,
			dungeon: resolvedDungeon,
			backAttackRate: resolvedSettings.backAttackRate,
			damageMode: resolvedSettings.damageMode,
			referenceStat: resolvedSettings.referenceStat
		};
		direct[scenario] = efficiencyPanel({ kind: 'direct', ...common });
		placement[scenario] = efficiencyPanel({ kind: 'placement', ...common });
	}
	const directBossTheory = efficiencyPanel({
		kind: 'direct', stats, scenario: 'boss-theory', directCoefficient, placementSkill, placementSkillLevel,
		dungeon: resolvedDungeon, backAttackRate: resolvedSettings.backAttackRate, damageMode: resolvedSettings.damageMode,
		referenceStat: resolvedSettings.referenceStat
	});
	const placementBossTheory = efficiencyPanel({
		kind: 'placement', stats, scenario: 'boss-theory', directCoefficient, placementSkill, placementSkillLevel,
		dungeon: resolvedDungeon, backAttackRate: resolvedSettings.backAttackRate, damageMode: resolvedSettings.damageMode,
		referenceStat: resolvedSettings.referenceStat
	});
	const bypass = {
		normal: {
			direct: divide(direct.normal.rawBase, direct.theory.rawBase) * 100,
			placement: divide(placement.normal.rawBase, placement.theory.rawBase) * 100
		},
		boss: {
			direct: divide(direct.boss.rawBase, directBossTheory.rawBase) * 100,
			placement: divide(placement.boss.rawBase, placementBossTheory.rawBase) * 100
		}
	};
	return {
		direct: { ...direct, bossTheory: directBossTheory },
		placement: { ...placement, bossTheory: placementBossTheory },
		bypass: { ...bypass, direct: bypass.boss.direct, placement: bypass.boss.placement }
	};
}

const enchantAliases = {
	minDmgFlat: 'minDmg',
	maxDmgFlat: 'maxDmg',
	critDmgFlat: 'critDmg',
	minDmgPercent: 'finalMinDmg',
	maxDmgPercent: 'finalMaxDmg',
	critDmgPercent: 'finalCritDmg',
	strMagFlat: 'strMagAll',
	strMagPercent: 'strMagAllPercent',
	weaponAttrFlat: 'weaponAttr',
	fixedDmgFlat: 'fixedDmg',
	normalExtraDmgPercent: 'normalDmgPercent',
	bossExtraDmgPercent: 'bossDmgPercent'
};

const enchantToInput = {
	minDmg: 'minDmgFlat',
	maxDmg: 'maxDmgFlat',
	critDmg: 'critDmgFlat',
	finalMinDmg: 'minDmgPercent',
	finalMaxDmg: 'maxDmgPercent',
	finalCritDmg: 'critDmgPercent',
	strMagAll: 'strMagFlat',
	strMagAllPercent: 'strMagPercent',
	strMagEfficiency: 'strMagEfficiency',
	weaponAttr: 'weaponAttrFlat',
	weaponAttrPercent: 'weaponAttrPercent',
	fixedDmg: 'fixedDmgFlat',
	fixedDmgPercent: 'fixedDmgPercent',
	normalDmgPercent: 'normalExtraDmgPercent',
	bossDmgPercent: 'bossExtraDmgPercent',
	normalDomination: 'normalDomination',
	bossDomination: 'bossDomination'
};

function enchantValue(option, key) {
	if (option?.[key] !== undefined) return number(option[key]);
	const alias = Object.entries(enchantAliases).find(([, canonical]) => canonical === key)?.[0];
	return alias ? number(option?.[alias]) : 0;
}

export function enchantDelta(oldEnchant = {}, newEnchant = {}) {
	return Object.fromEntries(
		Object.keys(DEFAULT_ENCHANT_OPTION).map((key) => [key, enchantValue(newEnchant, key) - enchantValue(oldEnchant, key)])
	);
}

/** Add a raw delta to the displayed base inputs. Retained for public API compatibility. */
export function applyEnchantDelta(inputs, delta = {}) {
	const result = { ...inputs };
	for (const [key, defaultValue] of Object.entries(DEFAULT_SPEC_INPUTS)) {
		if (typeof defaultValue === 'number') result[key] = number(inputs[key]) + number(delta[key]);
	}
	return result;
}

/** Apply a replacement where the old option is already included in the base specification. */
export function applyEnchantReplacement(inputs, oldEnchant = {}, newEnchant = {}) {
	const result = { ...inputs };
	const delta = enchantDelta(oldEnchant, newEnchant);
	for (const [optionKey, inputKey] of Object.entries(enchantToInput)) {
		result[inputKey] = number(inputs[inputKey]) + number(delta[optionKey]);
	}
	return result;
}

export function applyEnchantReplacementToStats(stats, oldEnchant = {}, newEnchant = {}) {
	const result = cloneStats(stats);
	const delta = enchantDelta(oldEnchant, newEnchant);
	const pairs = [
		['minimumDamage', 'minDmg', 'finalMinDmg'],
		['maximumDamage', 'maxDmg', 'finalMaxDmg'],
		['criticalDamage', 'critDmg', 'finalCritDmg'],
		['strMag', 'strMagAll', 'strMagAllPercent'],
		['weaponAttr', 'weaponAttr', 'weaponAttrPercent'],
		['fixedDamage', 'fixedDmg', 'fixedDmgPercent'],
		['normalExtraDamage', null, 'normalDmgPercent'],
		['bossExtraDamage', null, 'bossDmgPercent']
	];
	for (const [statKey, flatKey, percentKey] of pairs) {
		if (flatKey) result[statKey].flat += delta[flatKey];
		result[statKey].percent += delta[percentKey];
		result[statKey].total = result[statKey].flat * (1 + result[statKey].percent / 100);
		result[statKey].per1Pct = divide(result[statKey].flat, 100 + result[statKey].percent);
	}
	result.normalDomination = Math.min(stats.normalDomination + delta.normalDomination, 100);
	result.bossDomination = Math.min(stats.bossDomination + delta.bossDomination, 100);
	result.strMagEfficiency = stats.strMagEfficiency + delta.strMagEfficiency;
	return result;
}

export function calculateHpComparison(calibration = {}, oldEnchant = {}, newEnchant = {}) {
	const stamina = number(calibration.stamina);
	const staminaMinus10 = number(calibration.staminaMinus10);
	const maxHp = number(calibration.maxHp);
	const maxHpMinus10 = number(calibration.maxHpMinus10);
	if (stamina === 0 && maxHp === 0) return null;
	const delta = enchantDelta(oldEnchant, newEnchant);
	const staminaDifference = stamina - staminaMinus10;
	const pureStamina = 10 * staminaDifference;
	const staminaMultiplier = pureStamina > 0 ? stamina / pureStamina : 0;
	const hpDifference = maxHp - maxHpMinus10;
	const hpMultiplier = staminaDifference > 0 ? hpDifference / (4 * staminaDifference) : 0;
	const hpPlus = hpMultiplier > 0 ? maxHp / hpMultiplier - 4 * stamina : 0;
	const expected =
		((pureStamina + delta.strMagAll + delta.stamina) *
			(staminaMultiplier + delta.strMagAllPercent / 100) *
			4 +
			hpPlus) *
		(hpMultiplier + delta.hpPercent / 100);
	return { expected, changeRate: percentChange(maxHp, expected), staminaMultiplier, hpMultiplier, hpPlus };
}

export function compareEnchants({
	inputs,
	oldEnchant = {},
	newEnchant = {},
	directCoefficient,
	placementSkill = PLACEMENT_SKILLS[0],
	placementSkillLevel = 0,
	dungeon = DUNGEONS[0],
	backAttackRate = 0,
	damageMode = 'average',
	referenceStat = 'crit',
	hpCalibration
}) {
	const oldStats = aggregateStats(inputs);
	const newStats = applyEnchantReplacementToStats(oldStats, oldEnchant, newEnchant);
	const delta = enchantDelta(oldEnchant, newEnchant);
	const scenarioNames = ['theory', 'boss-theory', 'normal', 'boss'];
	const scenarios = {};
	const changes = {};
	const selectedPlacementCoefficients = placementCoefficients(placementSkill, placementSkillLevel);
	const coreCoefficients = placementCoreCoefficients(oldStats.placementCoreLevel);
	// The live enchant sheet intentionally mixes the selected skill's raw
	// weapon/strength coefficients with the placement core's final multiplier.
	const enchantPlacementCoefficients = {
		...selectedPlacementCoefficients,
		totalMultiplier: coreCoefficients.totalMultiplier
	};
	for (const scenario of scenarioNames) {
		const oldDirect = calcDirectHitDamage({ stats: oldStats, coefficient: directCoefficient, scenario, dungeon, backAttackRate, mode: damageMode }).damage;
		const newDirect = calcDirectHitDamage({ stats: newStats, coefficient: directCoefficient, scenario, dungeon, backAttackRate, mode: damageMode }).damage;
		const oldPlacement = calcPlacementDamage({ stats: oldStats, coefficients: enchantPlacementCoefficients, scenario, dungeon, backAttackRate, mode: damageMode }).damage;
		const newPlacement = calcPlacementDamage({ stats: newStats, coefficients: enchantPlacementCoefficients, scenario, dungeon, backAttackRate, mode: damageMode }).damage;
		scenarios[scenario] = {
			direct: { old: oldDirect, new: newDirect, percentChange: percentChange(oldDirect, newDirect) },
			placement: { old: oldPlacement, new: newPlacement, percentChange: percentChange(oldPlacement, newPlacement) }
		};
	}
	changes.directHitTheory = scenarios.theory.direct.percentChange;
	changes.directHitBossTheory = scenarios['boss-theory'].direct.percentChange;
	changes.directHitNormal = scenarios.normal.direct.percentChange;
	changes.directHitBoss = scenarios.boss.direct.percentChange;
	changes.placementTheory = scenarios.theory.placement.percentChange;
	changes.placementBossTheory = scenarios['boss-theory'].placement.percentChange;
	changes.placementNormal = scenarios.normal.placement.percentChange;
	changes.placementBoss = scenarios.boss.placement.percentChange;

	const efficiencyOptions = { directCoefficient, placementSkill, placementSkillLevel, dungeon, backAttackRate, damageMode, referenceStat };
	const oldEfficiency = calculateDamageEfficiency({ stats: oldStats, ...efficiencyOptions });
	const newEfficiency = calculateDamageEfficiency({ stats: newStats, ...efficiencyOptions });
	const oldConversion = calculateConversionSummary(oldStats, { criterion: 'boss' });
	const newConversion = calculateConversionSummary(newStats, { criterion: 'boss' });
	return {
		delta,
		oldStats,
		newStats,
		scenarios,
		changes,
		conversion: { old: oldConversion, new: newConversion },
		efficiency: { old: oldEfficiency, new: newEfficiency },
		hp: calculateHpComparison(hpCalibration, oldEnchant, newEnchant),
		bypass: {
			normal: {
				direct: { old: oldEfficiency.bypass.normal.direct, new: newEfficiency.bypass.normal.direct, change: newEfficiency.bypass.normal.direct - oldEfficiency.bypass.normal.direct }
			},
			boss: {
				direct: { old: oldEfficiency.bypass.boss.direct, new: newEfficiency.bypass.boss.direct, change: newEfficiency.bypass.boss.direct - oldEfficiency.bypass.boss.direct }
			},
			direct: { old: oldEfficiency.bypass.boss.direct, new: newEfficiency.bypass.boss.direct, change: newEfficiency.bypass.boss.direct - oldEfficiency.bypass.boss.direct },
			placement: { old: oldEfficiency.bypass.boss.placement, new: newEfficiency.bypass.boss.placement, change: newEfficiency.bypass.boss.placement - oldEfficiency.bypass.boss.placement }
		}
	};
}

export function calculateHitIndicator(stats, coefficient = 17000) {
	const boss = stats.bossDomination <= stats.normalDomination;
	const domination = boss ? stats.bossDomination : stats.normalDomination;
	const extra = boss ? stats.bossExtraDamage.total : stats.normalExtraDamage.total;
	const physicalBonus = stats.physicalJob ? 115 * (1 + stats.weaponAttr.percent / 100) : 0;
	const displayedWeapon = stats.weaponAttr.total - physicalBonus;
	const base =
		(2 * displayedWeapon * number(coefficient)) / 100 +
		stats.strMag.total * (1 + stats.strMagEfficiency / 100) +
		stats.fixedDamage.total +
		extra;
	const average =
		(0.95 + stats.minimumDamage.total / 100 +
			1.05 + stats.maximumDamage.total / 100) /
		2;
	return { side: boss ? 'boss' : 'normal', value: (base * average * (1 + stats.criticalDamage.total / 100) * (1 + domination / 100)) / 100000 };
}

export function calculateSummonReflection(stats, reflectionPercent = 148) {
	const reflection = number(reflectionPercent) / 100;
	const boss = stats.bossDomination <= stats.normalDomination;
	const domination = boss ? stats.bossDomination : stats.normalDomination;
	const extra = boss ? stats.bossExtraDamage.total : stats.normalExtraDamage.total;
	const base = reflection * (1.08 * stats.strMag.total + stats.fixedDamage.total + extra);
	const average =
		(0.95 + (reflection * stats.minimumDamage.total) / 100 +
			1.05 + (reflection * stats.maximumDamage.total) / 100) /
		2;
	const critical = 1 + (reflection * stats.criticalDamage.total) / 100;
	return { side: boss ? 'boss' : 'normal', value: (base * average * critical * (1 + domination / 100)) / 100000 };
}

export function inferPlacementMultiplier({ stats, skill, skillLevel = 0, dungeon = DUNGEONS[0], measuredBossDamage = 0, mode = 'average' }) {
	const coefficients = placementCoefficients(skill, skillLevel);
	const rawBase =
		stats.weaponAttr.total * coefficients.weaponCoefficient +
		stats.strMag.total * coefficients.strengthMultiplier +
		stats.fixedDamage.total +
		stats.bossExtraDamage.total -
		dungeon.bossDmgReduction;
	const preMultiplier = rawBase * damageFactor({
		minimumDamage: stats.minimumDamage.total,
		maximumDamage: stats.maximumDamage.total,
		criticalDamage: stats.criticalDamage.total,
		domination: stats.bossDomination,
		mode
	});
	const expected = preMultiplier * coefficients.totalMultiplier;
	return {
		expected,
		preMultiplier,
		selectedTotalMultiplier: coefficients.totalMultiplier,
		inferredTotalMultiplier: preMultiplier === 0 ? 0 : number(measuredBossDamage) / preMultiplier
	};
}

const BUILD_PROFILES = Object.freeze([
	{ id: 'extreme-weapon', name: 'Extreme weapon', strengthRatio: 37.5, weaponRatio: 0.625 },
	{ id: 'weapon-leaning', name: 'Weapon leaning', strengthRatio: 42.85, weaponRatio: 0.5715 },
	{ id: 'balanced', name: 'Balanced', strengthRatio: 50, weaponRatio: 0.5 },
	{ id: 'strength-leaning', name: 'Strength leaning', strengthRatio: 55.5, weaponRatio: 0.445 },
	{ id: 'extreme-strength', name: 'Extreme strength', strengthRatio: 58.5, weaponRatio: 0.415 }
]);

export function calculateBuildEfficiency({
	stats,
	directCoefficient,
	placementSkill = PLACEMENT_SKILLS[0],
	placementSkillLevel = 0,
	dungeon = DUNGEONS[0],
	backAttackRate = 0,
	damageMode = 'average'
}) {
	const budget = stats.strMag.total / 100 + stats.weaponAttr.total;
	const partyScale = dungeon.id === 'tower-of-challenge-30' ? 0.06 : 0.03;
	const makeProfile = (profile, profileStats) => {
		const direct = {};
		const placement = {};
		for (const scenario of ['theory', 'boss-theory', 'normal', 'boss']) {
			direct[scenario] = calcDirectHitDamage({ stats: profileStats, coefficient: directCoefficient, scenario, dungeon, backAttackRate, mode: damageMode }).damage;
			placement[scenario] = calcPlacementDamage({ stats: profileStats, skill: placementSkill, skillLevel: placementSkillLevel, scenario, dungeon, backAttackRate, mode: damageMode }).damage;
		}
		const selectedCoefficients = placementCoefficients(placementSkill, placementSkillLevel);
		const minimumTerm = 0.95 + profileStats.minimumDamage.total / 100;
		const maximumTerm = 1.05 + profileStats.maximumDamage.total / 100;
		const average = (minimumTerm + maximumTerm) / 2;
		const rate = clamp(backAttackRate, 0, 100) / 100;
		const roll = damageMode === 'maximum' ? maximumTerm : average * (1 - rate) + maximumTerm * rate;
		const criticalMultiplier = 1 + profileStats.criticalDamage.total / 100;
		const normalFactor = roll * criticalMultiplier * (1 + profileStats.normalDomination / 100);
		const bossFactor = roll * criticalMultiplier * (1 + profileStats.bossDomination / 100);
		const directCore =
			profileStats.strMag.total * (1 + profileStats.strMagEfficiency / 100) +
			(2 * profileStats.weaponAttr.total * number(directCoefficient)) / 100;
		const directNormalAbsolute =
			(directCore + profileStats.fixedDamage.total + profileStats.normalExtraDamage.total) * normalFactor;
		const directBossAbsolute =
			((profileStats.penetration / 100) * directCore -
				dungeon.bossDmgReduction -
				(1 - profileStats.penetration / 100) * dungeon.bossDefense +
				profileStats.fixedDamage.total +
				profileStats.bossExtraDamage.total) *
			bossFactor *
			partyScale;
		const placementCore =
			profileStats.weaponAttr.total * selectedCoefficients.weaponCoefficient +
			profileStats.strMag.total * selectedCoefficients.strengthMultiplier;
		const placementNormalAbsolute =
			(placementCore + profileStats.fixedDamage.total + profileStats.normalExtraDamage.total) *
			normalFactor *
			selectedCoefficients.totalMultiplier;
		const placementBossAbsolute =
			(placementCore - dungeon.bossDmgReduction + profileStats.fixedDamage.total + profileStats.bossExtraDamage.total) *
			bossFactor *
			selectedCoefficients.totalMultiplier *
			partyScale;
		const practicalAbsolute = {
			normalDirect: directNormalAbsolute,
			bossDirect: directBossAbsolute,
			normalPlacement: placementNormalAbsolute,
			bossPlacement: placementBossAbsolute
		};
		const practical = {
			normalDirect: Math.round(directNormalAbsolute * 1e-8),
			bossDirect: Math.round(directBossAbsolute * 1e-4) / 1e4,
			normalPlacement: Math.round(placementNormalAbsolute * 1e-8),
			bossPlacement: Math.round(placementBossAbsolute * 1e-4) / 1e4
		};
		return {
			...profile,
			strMag: profileStats.strMag.total,
			weaponAttr: profileStats.weaponAttr.total,
			direct,
			placement,
			practical,
			practicalEok: practical,
			practicalAbsolute
		};
	};
	const current = makeProfile({ id: 'current', name: 'Current' }, stats);
	const profiles = BUILD_PROFILES.map((profile) => {
		const profileStats = cloneStats(stats);
		profileStats.strMag.total = budget * profile.strengthRatio;
		profileStats.weaponAttr.total = budget * profile.weaponRatio;
		const result = makeProfile(profile, profileStats);
		result.change = {
			normalDirect: percentChange(current.practical.normalDirect, result.practical.normalDirect),
			bossDirect: percentChange(current.practical.bossDirect, result.practical.bossDirect),
			normalPlacement: percentChange(current.practical.normalPlacement, result.practical.normalPlacement),
			bossPlacement: percentChange(current.practical.bossPlacement, result.practical.bossPlacement),
			directBoss: percentChange(current.practical.bossDirect, result.practical.bossDirect),
			placementBoss: percentChange(current.practical.bossPlacement, result.practical.bossPlacement)
		};
		return result;
	});
	const currentRatio = budget === 0 ? 0 : (stats.strMag.total / 100 / budget) * 100;
	const nearest = profiles.reduce(
		(best, profile) => Math.abs(profile.strengthRatio - currentRatio) < Math.abs(best.strengthRatio - currentRatio) ? profile : best,
		profiles[0]
	);
	return { budget, current, profiles, currentRatio, nearestProfileId: nearest?.id ?? null, partyScale };
}
