// @ts-nocheck

import {
	DEFAULT_ENCHANT_OPTION,
	DEFAULT_SPEC_CALCULATION_SETTINGS as DATA_SETTINGS,
	DEFAULT_SPEC_INPUTS as DATA_INPUTS,
	DEFAULT_SPEC_SELECTIONS,
	DIRECT_SKILLS,
	DUNGEONS,
	JOBS,
	PLACEMENT_SKILLS,
	SPEC_ANALYZER_DATA_META,
	SUMMONS
} from './spec-analyzer-data.js';

export { DEFAULT_ENCHANT_OPTION, DEFAULT_SPEC_SELECTIONS, DIRECT_SKILLS, DUNGEONS, JOBS, PLACEMENT_SKILLS, SPEC_ANALYZER_DATA_META, SUMMONS };

export const DEFAULT_SPEC_INPUTS = Object.freeze({
	...DATA_INPUTS,
	characterLevel: 235,
	weaponMinimum: 0,
	meleeAttack: false,
	meleeDamage: 0,
	statusAttack: false,
	statusDamage: 0
});
export const DEFAULT_SPEC_CALCULATION_SETTINGS = Object.freeze({
	...DATA_SETTINGS,
	customNormalGuard: 0,
	customBossGuard: 0,
	customNormalElasticity: 0,
	customBossElasticity: 0
});

/** A bounded arithmetic parser: expressions are never evaluated as JavaScript. */
export function inspectNumericInput(value) {
	if (typeof value === 'number') return { value: Number.isFinite(value) ? value : 0, valid: Number.isFinite(value) };
	if (typeof value !== 'string') return { value: 0, valid: false };
	const source = value.trim().replaceAll(',', '');
	if (!source) return { value: 0, valid: true };
	if (source.length > 512 || !/^[\d+\-*/().\s]+$/.test(source)) return { value: 0, valid: false };
	let index = 0;
	let depth = 0;
	const skip = () => { while (/\s/.test(source[index] ?? '')) index += 1; };
	const primary = () => {
		skip();
		let sign = 1;
		while (source[index] === '+' || source[index] === '-') {
			if (source[index++] === '-') sign *= -1;
			skip();
		}
		if (source[index] === '(') {
			if (++depth > 32) throw new Error('Expression nesting limit');
			index += 1;
			const result = expression();
			skip();
			if (source[index++] !== ')') throw new Error('Missing parenthesis');
			depth -= 1;
			return sign * result;
		}
		const match = /^(?:\d+(?:\.\d*)?|\.\d+)/.exec(source.slice(index));
		if (!match) throw new Error('Number expected');
		index += match[0].length;
		return sign * Number(match[0]);
	};
	const term = () => {
		let result = primary();
		while (true) {
			skip();
			const operator = source[index];
			if (operator !== '*' && operator !== '/') return result;
			index += 1;
			const right = primary();
			if (operator === '/' && right === 0) throw new Error('Division by zero');
			result = operator === '*' ? result * right : result / right;
		}
	};
	const expression = () => {
		let result = term();
		while (true) {
			skip();
			const operator = source[index];
			if (operator !== '+' && operator !== '-') return result;
			index += 1;
			const right = term();
			result = operator === '+' ? result + right : result - right;
		}
	};
	try {
		const result = expression();
		skip();
		return index === source.length && Number.isFinite(result) ? { value: result, valid: true } : { value: 0, valid: false };
	} catch { return { value: 0, valid: false }; }
}
export const parseNumericInput = (value) => inspectNumericInput(value).value;
const number = parseNumericInput;
const clamp = (value, min, max) => Math.min(max, Math.max(min, number(value)));
const nonnegative = (value) => Math.max(0, number(value));
const divide = (a, b) => b === 0 || !Number.isFinite(a / b) ? 0 : a / b;
const percentChange = (a, b) => a > 0 ? (b / a - 1) * 100 : 0;
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
const statPair = (flat, percent) => ({ flat, percent, total: flat * (1 + percent / 100), per1Pct: divide(flat, 100 + percent) });

export function aggregateStats(inputs = DEFAULT_SPEC_INPUTS, options = {}) {
	const summon = SUMMONS.find((item) => item.id === (options.summonId ?? inputs.summonId)) ?? SUMMONS[0];
	const bonuses = summon.bonuses ?? {};
	const result = Object.fromEntries(pairedStats.map(([key, flat, percent]) => [key, statPair(nonnegative(inputs[flat]) + nonnegative(bonuses[flat]), nonnegative(inputs[percent]) + nonnegative(bonuses[percent]))]));
	return {
		...result,
		normalDomination: nonnegative(inputs.normalDomination) + nonnegative(bonuses.normalDomination),
		bossDomination: nonnegative(inputs.bossDomination) + nonnegative(bonuses.bossDomination),
		penetration: clamp(inputs.penetration, 0, 100),
		placementCoreLevel: nonnegative(inputs.placementCoreLevel),
		backAttackDmg: nonnegative(inputs.backAttackDmg),
		strMagEfficiency: nonnegative(inputs.strMagEfficiency),
		physicalJob: inputs.physicalJob !== false,
		summonId: summon.id,
		characterLevel: Math.max(1, number(inputs.characterLevel ?? 235)),
		weaponMinimum: nonnegative(inputs.weaponMinimum),
		meleeAttack: inputs.meleeAttack === true,
		meleeDamage: nonnegative(inputs.meleeDamage),
		statusAttack: inputs.statusAttack === true,
		statusDamage: nonnegative(inputs.statusDamage)
	};
}

export function calculateBaseShares(stats, { criterion = 'normal' } = {}) {
	const parts = { strMag: stats.strMag.total, weaponAttr: 100 * stats.weaponAttr.total, fixedDamage: stats.fixedDamage.total, extraDamage: (criterion === 'boss' ? stats.bossExtraDamage : stats.normalExtraDamage).total };
	const total = Object.values(parts).reduce((sum, value) => sum + value, 0);
	return Object.fromEntries(Object.entries(parts).map(([key, value]) => [key, divide(value, total)]));
}

/** Continuous theory ratios. Damage tables below include the game's integer rounding. */
export function calculateConversionSummary(stats, { criterion = 'normal' } = {}) {
	const minimum = Math.min(stats.minimumDamage.total, stats.maximumDamage.total);
	const maximum = stats.maximumDamage.total;
	const average = (minimum + maximum) / 2;
	const critical = stats.criticalDamage.total;
	const domination = criterion === 'boss' ? stats.bossDomination : stats.normalDomination;
	const criticalGain = divide(1 + stats.criticalDamage.percent / 100, 100 + critical);
	const minimumGain = stats.minimumDamage.total < maximum ? divide(1 + stats.minimumDamage.percent / 100, 2 * average) : 0;
	const maximumGain = divide((1 + stats.maximumDamage.percent / 100) * (stats.minimumDamage.total > maximum ? 1 : .5), average);
	const dominationGain = divide(1, 100 + domination);
	const shares = { minimum: minimum / 2, maximum: maximum / 2, critical: critical, domination: domination };
	const shareTotal = Object.values(shares).reduce((sum, value) => sum + value, 0);
	const dominationToCritical = divide(dominationGain, criticalGain);
	const dominationToMaximum = divide(dominationGain, maximumGain);
	const dominationToMinimum = divide(dominationGain, minimumGain);
	return {
		criterion,
		criticalToMinimum: divide(criticalGain, minimumGain),
		criticalToMaximum: divide(criticalGain, maximumGain),
		finalCriticalPer1: stats.criticalDamage.per1Pct,
		finalMaximumPer1: stats.maximumDamage.per1Pct,
		finalMinimumPer1: stats.minimumDamage.per1Pct,
		dominationToCritical, dominationToMaximum, dominationToMinimum,
		criticalToDomination: dominationToCritical,
		criticalToMaximumAdjusted: dominationToMaximum,
		criticalToMinimumAdjusted: dominationToMinimum,
		damageShares: Object.fromEntries(Object.entries(shares).map(([key, value]) => [key, divide(value, shareTotal)])),
		baseShares: calculateBaseShares(stats, { criterion })
	};
}

export function damageFactor({ minimumDamage = 0, maximumDamage = 0, criticalDamage = 0, domination = 0, backAttackRate = 0, backAttackDamage = 0, mode = 'average' }) {
	const maximum = nonnegative(maximumDamage) / 100;
	const minimum = Math.min(nonnegative(minimumDamage) / 100, maximum);
	const roll = mode === 'maximum' ? maximum : (minimum + maximum) / 2;
	const rate = typeof backAttackRate === 'boolean' ? Number(backAttackRate) : clamp(backAttackRate, 0, 100) / 100;
	return roll * (1 + (nonnegative(criticalDamage) + rate * nonnegative(backAttackDamage)) / 100) * (1 + nonnegative(domination) / 100);
}

const isBossScenario = (scenario) => scenario === 'boss' || scenario === 'boss-theory';
const usesDungeon = (scenario) => scenario === 'normal' || scenario === 'boss';
export function resolveDungeon(dungeon = DUNGEONS[0], settings = {}) {
	if (!settings.useCustomDungeonStats) return dungeon ?? DUNGEONS[0];
	return {
		id: 'custom', name: 'Custom dungeon',
		normalDefense: nonnegative(settings.customNormalDefense), bossDefense: nonnegative(settings.customBossDefense),
		normalDmgReduction: nonnegative(settings.customNormalDmgReduction), bossDmgReduction: nonnegative(settings.customBossDmgReduction),
		normalGuard: clamp(settings.customNormalGuard, 0, 100), bossGuard: clamp(settings.customBossGuard, 0, 100),
		normalElasticity: clamp(settings.customNormalElasticity, 0, 1000), bossElasticity: clamp(settings.customBossElasticity, 0, 1000)
	};
}

export function directSkillCoefficient(skill = DIRECT_SKILLS[0], skillLevel = 0) {
	return nonnegative(skill.baseCoefficient) + nonnegative(skill.perLevel) * nonnegative(skillLevel);
}
export function placementCoefficients(skill = PLACEMENT_SKILLS[0], skillLevel = 0) {
	const level = nonnegative(skillLevel);
	return { weaponCoefficient: nonnegative(skill.weaponCoefficient), strengthMultiplier: nonnegative(skill.strengthBase) + number(skill.strengthPerLevel) * level, totalMultiplier: nonnegative(skill.totalBase) + number(skill.totalPerLevel) * level };
}
export function placementCoreCoefficients(coreLevel = 19) {
	const skillLevel = nonnegative(coreLevel) + 50;
	const tiers = [[10, 0, 1.5], [40, 15, 2], [60, 75, 2.5], [80, 125, 3], [Infinity, 185, 3.5]];
	const index = tiers.findIndex(([end]) => skillLevel <= end);
	const [, base, rate] = tiers[index];
	const start = index === 0 ? 0 : tiers[index - 1][0];
	return { skillLevel, weaponCoefficient: 42, strengthMultiplier: .8 + .01 * skillLevel, totalMultiplier: .7 + (base + (skillLevel - start) * rate) / 100 };
}

/* Current wiki reference model, captured 2026-10-03. The float32 boundaries and
 * integer floors are deliberate. Defense is level-scaled; guard and critical
 * resistance are separate reductions. The old +115 weapon bonus and placement
 * final multiplier are absent from this model. */
const f32 = Math.fround;
function referenceInput(stats, scenario, dungeon, coefficient, coefficients) {
	const boss = isBossScenario(scenario);
	const target = usesDungeon(scenario) ? dungeon : null;
	return {
		physical: stats.physicalJob,
		level: stats.characterLevel ?? 235,
		mainStat: stats.strMag.total,
		efficiency: stats.strMagEfficiency,
		weaponMin: stats.weaponMinimum > 0 ? Math.min(stats.weaponMinimum, stats.weaponAttr.total) : stats.weaponAttr.total,
		weaponMax: stats.weaponAttr.total,
		directCoef: nonnegative(coefficient),
		summonScale: 100 * (coefficients?.strengthMultiplier ?? 1.48),
		summonCoef: 50 * (coefficients?.weaponCoefficient ?? 42) - 100,
		minRaw: stats.minimumDamage.flat, minFinal: stats.minimumDamage.percent,
		maxRaw: stats.maximumDamage.flat, maxFinal: stats.maximumDamage.percent,
		critRaw: stats.criticalDamage.flat, critFinal: stats.criticalDamage.percent,
		penetration: stats.penetration, fixedDamage: stats.fixedDamage.total,
		extraDamage: (boss ? stats.bossExtraDamage : stats.normalExtraDamage).total,
		defense: nonnegative(target?.[boss ? 'bossDefense' : 'normalDefense']),
		damageReduction: nonnegative(target?.[boss ? 'bossDmgReduction' : 'normalDmgReduction']),
		guard: clamp(target?.[boss ? 'bossGuard' : 'normalGuard'], 0, 100),
		elasticity: clamp(target?.[boss ? 'bossElasticity' : 'normalElasticity'], 0, 1000),
		domination: boss ? stats.bossDomination : stats.normalDomination,
		backAttackDamage: stats.backAttackDmg,
		meleeDamage: stats.meleeAttack ? stats.meleeDamage : 0,
		statusDamage: stats.statusAttack ? stats.statusDamage : 0
	};
}
function referenceBase(input, placement, weapon, backAttack, criticalHit = true) {
	const strength = placement ? Math.floor(input.mainStat * input.summonScale / 100) : Math.floor(input.mainStat * (1 + input.efficiency / 100));
	const core = placement ? strength + (weapon + 1) * ((input.summonCoef + 100) / 50) + 1 : strength + Math.floor(weapon * (input.directCoef + 100) / 50);
	const levelDefense = (input.physical ? 30 : 20) * input.level + 200;
	const defenseMultiplier = f32(1 - input.defense / (input.defense + levelDefense) * f32((100 - (placement ? 99 : input.penetration)) / 100));
	const rawBase = f32(f32(f32(f32(core) * defenseMultiplier) + input.fixedDamage) - input.damageReduction);
	const extraBase = f32(rawBase + input.extraDamage);
	const critical = placement ? Math.floor((Math.floor((input.critRaw - 50) * input.summonScale / 100) + 50) * (100 + input.critFinal) / 100) : Math.floor(input.critRaw * (100 + input.critFinal) / 100);
	const bonus = (backAttack ? placement ? 20 : input.backAttackDamage : 0) + (placement ? 0 : input.meleeDamage + input.statusDamage);
	const factor = f32((100 + bonus + (criticalHit ? Math.floor(critical * (1000 - input.elasticity) / 1000) : 0)) / 100);
	return { rawBase: extraBase, factor, beforeRoll: f32(extraBase * factor) };
}
function referenceRolls(input, placement) {
	const minimum = Math.floor(input.minRaw * (100 + input.minFinal) / 100);
	const maximum = Math.floor(input.maxRaw * (100 + input.maxFinal) / 100);
	const high = placement ? Math.floor(maximum * input.summonScale / 100) + 105 : maximum;
	return [Math.min(placement ? Math.floor(minimum * input.summonScale / 100) + 95 : minimum, high), high];
}
function referenceScore(input, placement, backAttack, mode, criticalHit) {
	const [minimum, maximum] = referenceRolls(input, placement);
	const weaponMin = input.physical ? input.weaponMin : input.weaponMax;
	const weaponMax = input.weaponMax;
	const domination = f32(f32(100 + input.domination) / 100);
	const finish = (damage) => Math.floor(damage * (100 - input.guard) / 100 * domination);
	const rollDamage = (beforeRoll, roll) => Math.floor(f32(beforeRoll * roll) / 100);
	const ends = [weaponMin, weaponMax].flatMap((weapon) => {
		const { beforeRoll } = referenceBase(input, placement, weapon, backAttack, criticalHit);
		return [minimum, maximum].flatMap((roll) => {
			const damage = rollDamage(beforeRoll, roll);
			return [finish(damage > 0 ? damage : 1), finish(damage > 0 ? damage : 2)];
		});
	});
	const range = { minimum: Math.min(...ends), maximum: Math.max(...ends) };
	if (mode === 'maximum') return { ...range, damage: range.maximum };
	const weapons = weaponMin === weaponMax ? 1 : minimum === maximum ? 16384 : 256;
	const rolls = minimum === maximum ? 1 : weapons === 256 ? 256 : 16384;
	if ((weapons === 1 && rolls === 1) || rollDamage(referenceBase(input, placement, weaponMin, backAttack, criticalHit).beforeRoll, minimum) <= 0) return { ...range, damage: (range.minimum + range.maximum) / 2 };
	let sum = 0;
	let compensation = 0;
	for (let w = 0; w < weapons; w += 1) {
		const weapon = weapons === 1 ? weaponMin : weaponMin + (w + .5) * (weaponMax - weaponMin) / weapons;
		const { beforeRoll } = referenceBase(input, placement, weapon, backAttack, criticalHit);
		for (let r = 0; r < rolls; r += 1) {
			const roll = rolls === 1 ? minimum : minimum + (r + .5) * (maximum - minimum) / rolls;
			const damage = rollDamage(beforeRoll, roll);
			if (damage <= 0) return { ...range, damage: (range.minimum + range.maximum) / 2 };
			const value = finish(damage) - compensation;
			const next = sum + value;
			compensation = next - sum - value;
			sum = next;
		}
	}
	return { ...range, damage: sum / (weapons * rolls) };
}
function calculateDamage({ stats, coefficient = 0, coefficients, scenario = 'theory', dungeon = DUNGEONS[0], backAttackRate = 0, mode = 'average', placement = false, critical = true }) {
	const input = referenceInput(stats, scenario, dungeon, coefficient, coefficients);
	const rate = clamp(backAttackRate, 0, 100) / 100;
	const front = referenceScore(input, placement, false, mode, critical);
	const back = rate === 0 ? front : referenceScore(input, placement, true, mode, critical);
	const base = referenceBase(input, placement, input.weaponMax, false, critical);
	return {
		damage: front.damage * (1 - rate) + back.damage * rate,
		minimum: rate === 0 ? front.minimum : rate === 1 ? back.minimum : Math.min(front.minimum, back.minimum),
		maximum: rate === 0 ? front.maximum : rate === 1 ? back.maximum : Math.max(front.maximum, back.maximum),
		rawBase: base.rawBase, factor: base.factor, scenario
	};
}
export function calcDirectHitDamage(options) {
	return { ...calculateDamage(options), coefficient: nonnegative(options.coefficient) };
}
export function calcPlacementDamage({ skill = PLACEMENT_SKILLS[0], skillLevel = 0, coefficients, ...options }) {
	const resolved = coefficients ?? placementCoefficients(skill, skillLevel);
	return { ...calculateDamage({ ...options, coefficients: resolved, placement: true }), ...resolved };
}

const EQUIVALENT_STATS = [['strMag', 'Strength / magic'], ['weaponAttr', 'Weapon / attribute'], ['fixedDamage', 'Fixed damage']];
function bumped(stats, key, amount) {
	const result = cloneStats(stats);
	result[key] = statPair(result[key].flat + amount, result[key].percent);
	return result;
}
function efficiencyPanel(options, kind, scenario) {
	const { stats, directCoefficient, placementSkill, placementSkillLevel, dungeon, backAttackRate, damageMode, referenceStat } = options;
	const calculate = (value) => kind === 'direct'
		? calcDirectHitDamage({ stats: value, coefficient: directCoefficient, scenario, dungeon, backAttackRate, mode: damageMode })
		: calcPlacementDamage({ stats: value, skill: placementSkill, skillLevel: placementSkillLevel, scenario, dungeon, backAttackRate, mode: damageMode });
	const baseline = calculate(stats);
	const referenceKeys = referenceStat === 'minimum' ? ['minimumDamage'] : referenceStat === 'maximum' ? ['maximumDamage'] : referenceStat === 'minmax' ? ['minimumDamage', 'maximumDamage'] : ['criticalDamage'];
	// Reflection and resistance can round a one-point critical upgrade to zero.
	// Average across a larger critical probe, then normalize to one point.
	const referenceStep = referenceStat === 'crit' ? 100 : 1;
	const referenceStats = referenceKeys.reduce((value, key) => bumped(value, key, referenceStep), stats);
	const referenceGain = (calculate(referenceStats).damage - baseline.damage) / referenceStep;
	const extraKey = isBossScenario(scenario) ? 'bossExtraDamage' : 'normalExtraDamage';
	const equivalents = [...EQUIVALENT_STATS, [extraKey, isBossScenario(scenario) ? 'Boss extra damage' : 'Normal extra damage']].map(([key, label]) => {
		// A larger probe avoids float32 quantization hiding a one-point stat gain.
		const probe = Math.max(100, stats[key].flat * .001);
		const gainPerPoint = (calculate(bumped(stats, key, probe)).damage - baseline.damage) / probe;
		const value = referenceGain > 0 && gainPerPoint > 0 ? referenceGain / gainPerPoint : 0;
		return { key, label, value, reverse: divide(stats[key].per1Pct, value) };
	});
	return { damage: baseline.damage, rawBase: baseline.rawBase, referenceGain, referenceStat, referenceStep, scale: 1, equivalents };
}
export function calculateDamageEfficiency({ stats, directCoefficient, placementSkill = PLACEMENT_SKILLS[0], placementSkillLevel = 0, dungeon = DUNGEONS[0], settings = {}, backAttackRate, damageMode, referenceStat }) {
	const resolved = { ...DEFAULT_SPEC_CALCULATION_SETTINGS, ...settings };
	const options = {
		stats, directCoefficient, placementSkill, placementSkillLevel, dungeon: resolveDungeon(dungeon, resolved),
		backAttackRate: backAttackRate ?? resolved.backAttackRate,
		damageMode: damageMode ?? resolved.damageMode,
		referenceStat: referenceStat ?? resolved.referenceStat
	};
	const direct = {};
	const placement = {};
	for (const scenario of ['theory', 'normal', 'boss', 'boss-theory']) {
		const key = scenario === 'boss-theory' ? 'bossTheory' : scenario;
		direct[key] = efficiencyPanel(options, 'direct', scenario);
		placement[key] = efficiencyPanel(options, 'placement', scenario);
	}
	const bypass = {
		normal: { direct: divide(direct.normal.damage, direct.theory.damage) * 100, placement: divide(placement.normal.damage, placement.theory.damage) * 100 },
		boss: { direct: divide(direct.boss.damage, direct.bossTheory.damage) * 100, placement: divide(placement.boss.damage, placement.bossTheory.damage) * 100 }
	};
	return { direct, placement, bypass: { ...bypass, direct: bypass.boss.direct, placement: bypass.boss.placement } };
}

const enchantToInput = {
	minDmg: 'minDmgFlat', maxDmg: 'maxDmgFlat', critDmg: 'critDmgFlat',
	finalMinDmg: 'minDmgPercent', finalMaxDmg: 'maxDmgPercent', finalCritDmg: 'critDmgPercent',
	strMagAll: 'strMagFlat', strMagAllPercent: 'strMagPercent', strMagEfficiency: 'strMagEfficiency',
	weaponAttr: 'weaponAttrFlat', weaponAttrPercent: 'weaponAttrPercent', fixedDmg: 'fixedDmgFlat', fixedDmgPercent: 'fixedDmgPercent',
	normalDmgPercent: 'normalExtraDmgPercent', bossDmgPercent: 'bossExtraDmgPercent',
	normalDomination: 'normalDomination', bossDomination: 'bossDomination', backAttackDmg: 'backAttackDmg'
};
const enchantValue = (option, key) => number(option?.[key] ?? option?.[enchantToInput[key]]);
export function enchantDelta(oldEnchant = {}, newEnchant = {}) {
	return Object.fromEntries(Object.keys(DEFAULT_ENCHANT_OPTION).map((key) => [key, enchantValue(newEnchant, key) - enchantValue(oldEnchant, key)]));
}
export function applyEnchantDelta(inputs, delta = {}) {
	const result = { ...inputs };
	for (const [key, value] of Object.entries(DEFAULT_SPEC_INPUTS)) if (typeof value === 'number') result[key] = number(inputs[key]) + number(delta[key]);
	return result;
}
export function applyEnchantReplacement(inputs, oldEnchant = {}, newEnchant = {}) {
	const result = { ...inputs };
	const delta = enchantDelta(oldEnchant, newEnchant);
	for (const [option, input] of Object.entries(enchantToInput)) result[input] = number(inputs[input]) + delta[option];
	return result;
}
export function applyEnchantReplacementToStats(stats, oldEnchant = {}, newEnchant = {}) {
	const result = cloneStats(stats);
	const delta = enchantDelta(oldEnchant, newEnchant);
	const inputDeltas = Object.fromEntries(Object.entries(enchantToInput).map(([option, input]) => [input, delta[option]]));
	for (const [key, flat, percent] of pairedStats) result[key] = statPair(nonnegative(result[key].flat + number(inputDeltas[flat])), nonnegative(result[key].percent + number(inputDeltas[percent])));
	for (const key of ['normalDomination', 'bossDomination', 'strMagEfficiency', 'backAttackDmg']) result[key] = nonnegative(result[key] + delta[key]);
	return result;
}
export function calculateHpComparison(calibration = {}, oldEnchant = {}, newEnchant = {}) {
	const stamina = nonnegative(calibration.stamina);
	const maxHp = nonnegative(calibration.maxHp);
	const reducedStamina = nonnegative(calibration.staminaMinus10);
	const reducedHp = nonnegative(calibration.maxHpMinus10);
	const staminaDifference = stamina - reducedStamina;
	const hpDifference = maxHp - reducedHp;
	if (stamina <= 0 || maxHp <= 0 || reducedStamina <= 0 || reducedHp <= 0 || staminaDifference <= 0 || hpDifference <= 0) return null;
	const delta = enchantDelta(oldEnchant, newEnchant);
	const pureStamina = 10 * staminaDifference;
	const staminaMultiplier = stamina / pureStamina;
	const hpMultiplier = hpDifference / (4 * staminaDifference);
	const hpPlus = maxHp / hpMultiplier - 4 * stamina;
	const expected = Math.max(0, ((pureStamina + delta.strMagAll + delta.stamina) * (staminaMultiplier + delta.strMagAllPercent / 100) * 4 + hpPlus) * (hpMultiplier + delta.hpPercent / 100));
	return { expected, changeRate: percentChange(maxHp, expected), staminaMultiplier, hpMultiplier, hpPlus };
}
export function compareEnchants({ inputs, oldEnchant = {}, newEnchant = {}, directCoefficient, directSkill, placementSkill = PLACEMENT_SKILLS[0], placementSkillLevel = 0, dungeon = DUNGEONS[0], backAttackRate = 0, damageMode = 'average', referenceStat = 'crit', hpCalibration }) {
	const oldStats = aggregateStats(inputs);
	// Replace at the input layer so summon bonuses and supported caps apply once.
	const newStats = aggregateStats(applyEnchantReplacement(inputs, oldEnchant, newEnchant));
	const delta = enchantDelta(oldEnchant, newEnchant);
	const newDirectCoefficient = Math.max(0, number(directCoefficient) + number(directSkill?.perLevel) * delta.directHitSkillLevel);
	const newPlacementLevel = Math.max(0, number(placementSkillLevel) + delta.placementSkillLevel);
	const scenarios = {};
	for (const scenario of ['theory', 'boss-theory', 'normal', 'boss']) {
		const common = { scenario, dungeon, backAttackRate, mode: damageMode };
		const directOld = calcDirectHitDamage({ stats: oldStats, coefficient: directCoefficient, ...common }).damage;
		const directNew = calcDirectHitDamage({ stats: newStats, coefficient: newDirectCoefficient, ...common }).damage;
		const placementOld = calcPlacementDamage({ stats: oldStats, skill: placementSkill, skillLevel: placementSkillLevel, ...common }).damage;
		const placementNew = calcPlacementDamage({ stats: newStats, skill: placementSkill, skillLevel: newPlacementLevel, ...common }).damage;
		scenarios[scenario] = { direct: { old: directOld, new: directNew, percentChange: percentChange(directOld, directNew) }, placement: { old: placementOld, new: placementNew, percentChange: percentChange(placementOld, placementNew) } };
	}
	const changes = {};
	for (const [key, scenario] of [['Theory', 'theory'], ['BossTheory', 'boss-theory'], ['Normal', 'normal'], ['Boss', 'boss']]) {
		changes[`directHit${key}`] = scenarios[scenario].direct.percentChange;
		changes[`placement${key}`] = scenarios[scenario].placement.percentChange;
	}
	const efficiencyOptions = { placementSkill, dungeon, backAttackRate, damageMode, referenceStat };
	const oldEfficiency = calculateDamageEfficiency({ stats: oldStats, directCoefficient, placementSkillLevel, ...efficiencyOptions });
	const newEfficiency = calculateDamageEfficiency({ stats: newStats, directCoefficient: newDirectCoefficient, placementSkillLevel: newPlacementLevel, ...efficiencyOptions });
	const bypassChange = (side, kind) => ({ old: oldEfficiency.bypass[side][kind], new: newEfficiency.bypass[side][kind], change: newEfficiency.bypass[side][kind] - oldEfficiency.bypass[side][kind] });
	return {
		delta, oldStats, newStats, scenarios, changes,
		conversion: { old: calculateConversionSummary(oldStats, { criterion: 'boss' }), new: calculateConversionSummary(newStats, { criterion: 'boss' }) },
		efficiency: { old: oldEfficiency, new: newEfficiency },
		hp: calculateHpComparison(hpCalibration, oldEnchant, newEnchant),
		bypass: { normal: { direct: bypassChange('normal', 'direct') }, boss: { direct: bypassChange('boss', 'direct') }, direct: bypassChange('boss', 'direct'), placement: bypassChange('boss', 'placement') }
	};
}

export function calculateHitIndicator(stats, coefficient = 17000) {
	const side = stats.bossDomination <= stats.normalDomination ? 'boss' : 'normal';
	return { side, value: calcDirectHitDamage({ stats, coefficient, scenario: side === 'boss' ? 'boss-theory' : 'theory' }).damage / 100000 };
}
export function calculateSummonReflection(stats, reflectionPercent = 148) {
	const side = stats.bossDomination <= stats.normalDomination ? 'boss' : 'normal';
	return { side, value: calcPlacementDamage({ stats, coefficients: { weaponCoefficient: 0, strengthMultiplier: nonnegative(reflectionPercent) / 100, totalMultiplier: 1 }, scenario: side === 'boss' ? 'boss-theory' : 'theory' }).damage / 100000 };
}
export function inferPlacementMultiplier({ stats, skill, skillLevel = 0, dungeon = DUNGEONS[0], measuredBossDamage = 0, mode = 'average' }) {
	const expected = calcPlacementDamage({ stats, skill, skillLevel, dungeon, scenario: 'boss', mode }).damage;
	return { expected, preMultiplier: expected, selectedTotalMultiplier: 1, inferredTotalMultiplier: divide(nonnegative(measuredBossDamage), expected) };
}

const BUILD_PROFILES = Object.freeze([
	{ id: 'extreme-weapon', name: 'Extreme weapon', strengthRatio: 37.5, weaponRatio: .625 },
	{ id: 'weapon-leaning', name: 'Weapon leaning', strengthRatio: 42.85, weaponRatio: .5715 },
	{ id: 'balanced', name: 'Balanced', strengthRatio: 50, weaponRatio: .5 },
	{ id: 'strength-leaning', name: 'Strength leaning', strengthRatio: 55.5, weaponRatio: .445 },
	{ id: 'extreme-strength', name: 'Extreme strength', strengthRatio: 58.5, weaponRatio: .415 }
]);
export function calculateBuildEfficiency({ stats, directCoefficient, placementSkill = PLACEMENT_SKILLS[0], placementSkillLevel = 0, dungeon = DUNGEONS[0], backAttackRate = 0, damageMode = 'average' }) {
	const budget = stats.strMag.total / 100 + stats.weaponAttr.total;
	const makeProfile = (profile, value) => {
		const direct = {};
		const placement = {};
		for (const scenario of ['theory', 'boss-theory', 'normal', 'boss']) {
			direct[scenario] = calcDirectHitDamage({ stats: value, coefficient: directCoefficient, scenario, dungeon, backAttackRate, mode: damageMode }).damage;
			placement[scenario] = calcPlacementDamage({ stats: value, skill: placementSkill, skillLevel: placementSkillLevel, scenario, dungeon, backAttackRate, mode: damageMode }).damage;
		}
		const practicalAbsolute = { normalDirect: direct.normal, bossDirect: direct.boss, normalPlacement: placement.normal, bossPlacement: placement.boss };
		const practical = Object.fromEntries(Object.entries(practicalAbsolute).map(([key, damage]) => [key, damage / 1e8]));
		return { ...profile, strMag: value.strMag.total, weaponAttr: value.weaponAttr.total, direct, placement, practical, practicalEok: practical, practicalAbsolute };
	};
	const current = makeProfile({ id: 'current', name: 'Current' }, stats);
	const profiles = BUILD_PROFILES.map((profile) => {
		const value = cloneStats(stats);
		value.strMag = statPair(divide(budget * profile.strengthRatio, 1 + value.strMag.percent / 100), value.strMag.percent);
		const weaponRatio = divide(value.weaponMinimum, value.weaponAttr.total);
		value.weaponAttr = statPair(divide(budget * profile.weaponRatio, 1 + value.weaponAttr.percent / 100), value.weaponAttr.percent);
		value.weaponMinimum = value.weaponAttr.total * weaponRatio;
		const result = makeProfile(profile, value);
		result.change = Object.fromEntries(Object.keys(current.practicalAbsolute).map((key) => [key, percentChange(current.practicalAbsolute[key], result.practicalAbsolute[key])]));
		result.change.directBoss = result.change.bossDirect;
		result.change.placementBoss = result.change.bossPlacement;
		return result;
	});
	const currentRatio = divide(stats.strMag.total, budget);
	const nearest = profiles.reduce((best, profile) => Math.abs(profile.strengthRatio - currentRatio) < Math.abs(best.strengthRatio - currentRatio) ? profile : best);
	return { budget, current, profiles, currentRatio, nearestProfileId: budget > 0 ? nearest.id : null, partyScale: 1 };
}
