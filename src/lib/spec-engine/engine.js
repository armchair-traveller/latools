/**
 * Independently rebuilt from the public wiki analyzer (2026-10-03).
 * The wiki is the authority for both float32 rounding and average integration.
 * Public source: https://latale.wiki/tools/spec-analyzer
 * Reference arithmetic upstream: https://github.com/alfm201/damage-test
 */
import { directHitSkills, placementSkills, specSummons } from './data.js';
export * from './data.js';

export const DEFAULT_HP_BASE = { stamina: 0, staminaMinus10: 0, maxHp: 0, maxHpMinus10: 0 };
export const HIT_INDICATOR_DIRECT_COEF = 17000;
export const HIT_INDICATOR_SUMMON_REFLECTION = 148;
const f32 = Math.fround;
const boundedRate = (rate) => Math.min(Math.max(rate, 0), 100);
const statGroups = ['strMag', 'weaponAttr', 'critDmg', 'minDmg', 'maxDmg', 'fixedDmg', 'normalExtraDmg', 'bossExtraDmg'];
const sideKeys = [...statGroups.slice(0, 6).flatMap((key) => [key + 'Plus', key + 'Percent']), 'penetration', 'backAttackDmg', 'strMagEfficiency'];
const percentageUnit = (absolute, percent) => 100 + percent !== 0 ? absolute / (100 + percent) : 0;

export const normalizeSpecSummonName = (name) => name === '이레이져' ? '이레이저' : name;
export const findSpecSummon = (name) => specSummons.find((summon) => summon.name === normalizeSpecSummonName(name));
const matchesSkill = (skill, nameOrId) => skill.id === nameOrId || skill.name === nameOrId || skill.legacyNames.includes(nameOrId);
export const findDirectHitSkill = (job, nameOrId) => directHitSkills.find((skill) => skill.job === job && matchesSkill(skill, nameOrId));
export const findPlacementSkill = (job, nameOrId) => placementSkills.find((skill) => skill.job === job && matchesSkill(skill, nameOrId));

export function ensureHybridCombatStats(base) {
  const common = Object.fromEntries(sideKeys.map((key) => [key, base[key]]));
  return { physical: { ...common, ...base.hybridStats?.physical }, magical: { ...common, ...base.hybridStats?.magical } };
}
export function baseStatsForSide(base, side) {
  return { ...base, ...ensureHybridCombatStats(base)[side], isPhysicalJob: side === 'physical' };
}
export function updateHybridCombatStat(base, side, key, value) {
  const sides = ensureHybridCombatStats(base);
  return { ...base, hybridStats: { ...sides, [side]: { ...sides[side], [key]: value } } };
}
export function aggregateStats(base, bonuses = {}, hybrid = false) {
  if (hybrid) {
    const sides = aggregateCombatSides(base, bonuses);
    return averageComputedStats(sides.physical, sides.magical);
  }
  const result = { reference: { ...base.reference, attackType: base.isPhysicalJob ? 'physical' : 'magical' } };
  for (const key of statGroups) {
    const absolute = base[key + 'Plus'] + (bonuses[key + 'Plus'] ?? 0);
    const percent = base[key + 'Percent'] + (bonuses[key + 'Percent'] ?? 0);
    result[key] = absolute * (1 + percent / 100);
    result[key + 'Abs'] = absolute;
    result[key + 'Pct'] = percent;
    if (key !== 'minDmg' && key !== 'maxDmg') result[key + 'Per1Pct'] = absolute / (100 + percent);
  }
  for (const key of ['normalDomination', 'bossDomination']) result[key] = base[key] + (bonuses[key] ?? 0);
  for (const key of ['penetration', 'backAttackDmg', 'placementCoreLevel', 'strMagEfficiency']) result[key] = base[key];
  return result;
}
export function aggregateCombatSides(base, bonuses = {}) {
  return { physical: aggregateStats(baseStatsForSide(base, 'physical'), bonuses), magical: aggregateStats(baseStatsForSide(base, 'magical'), bonuses) };
}
export function averageComputedStats(physical, magical) {
  return {
    ...Object.fromEntries(Object.keys(physical).filter((key) => typeof physical[key] === 'number').map((key) => [key, (physical[key] + magical[key]) / 2])),
    reference: { ...physical.reference, hybridSides: { physical, magical } }
  };
}
export function expandHybridStats(stats) {
  const sides = stats.reference?.hybridSides;
  if (!sides) return null;
  // Changes made to a combined stat apply equally to both independently calculated sides.
  const expand = (side) => ({ ...side, ...Object.fromEntries(Object.keys(side).filter((key) => typeof side[key] === 'number').map((key) => [key, side[key] + stats[key] - (sides.physical[key] + sides.magical[key]) / 2])) });
  return { physical: expand(sides.physical), magical: expand(sides.magical) };
}

export function referenceInput(stats, scenario, dungeon, directCoef = 0, placement) {
  const boss = scenario === 'boss';
  const theory = scenario === 'theory' || !dungeon;
  return {
    attackType: stats.reference?.attackType ?? 'physical', level: stats.reference?.level ?? 235,
    mainStat: stats.strMag, efficiency: stats.strMagEfficiency,
    weaponMin: stats.reference?.weaponMin ?? stats.weaponAttr, weaponMax: stats.weaponAttr,
    directCoef, summonScale: placement ? placement.strMagMult * 100 : 148,
    summonCoef: placement ? placement.weaponAttrCoef * 50 - 100 : 2000,
    minRaw: stats.minDmgAbs, minFinal: stats.minDmgPct, maxRaw: stats.maxDmgAbs, maxFinal: stats.maxDmgPct,
    critRaw: stats.critDmgAbs, critFinal: stats.critDmgPct, penetration: stats.penetration,
    fixedDamage: stats.fixedDmg, extraDamage: boss ? stats.bossExtraDmg : stats.normalExtraDmg,
    damageReduction: theory ? 0 : boss ? dungeon.bossDmgReduction : dungeon.normalDmgReduction,
    defense: theory ? 0 : boss ? dungeon.bossDefense : dungeon.normalDefense,
    guard: theory ? 0 : boss ? (dungeon.bossGuard ?? 0) : (dungeon.normalGuard ?? 0),
    elasticity: theory ? 0 : boss ? (dungeon.bossElasticity ?? 0) : (dungeon.normalElasticity ?? 0),
    domination: boss ? stats.bossDomination : stats.normalDomination,
    backAttack: false, backAttackDamage: stats.backAttackDmg,
    melee: stats.reference?.melee ?? false, meleeDamage: stats.reference?.meleeDamage ?? 0,
    status: stats.reference?.status ?? false, statusDamage: stats.reference?.statusDamage ?? 0
  };
}

/** Preserve each float32 operation: combining these expressions changes game rounding. */
function damageBeforeRoll(input, summon, critical, weaponRoll) {
  const mainTerm = summon ? Math.floor(input.mainStat * input.summonScale / 100) : Math.floor(input.mainStat * (1 + input.efficiency / 100));
  const base = summon ? mainTerm + (weaponRoll + 1) * ((input.summonCoef + 100) / 50) + 1 : mainTerm + Math.floor(weaponRoll * (input.directCoef + 100) / 50);
  const levelDefense = (input.attackType === 'physical' ? 30 : 20) * input.level + 200;
  const penetration = summon ? 99 : input.penetration;
  const defenseFactor = f32(1 - input.defense / (input.defense + levelDefense) * f32((100 - penetration) / 100));
  const defended = f32(f32(base) * defenseFactor);
  const fixed = f32(defended + input.fixedDamage);
  const reduced = f32(fixed - input.damageReduction);
  const extra = f32(reduced + input.extraDamage);
  const back = input.backAttack ? (summon ? 20 : input.backAttackDamage) : 0;
  const situational = summon ? back : back + (input.melee ? input.meleeDamage : 0) + (input.status ? input.statusDamage : 0);
  const crit = summon
    ? Math.floor((Math.floor((input.critRaw - 50) * input.summonScale / 100) + 50) * (100 + input.critFinal) / 100)
    : Math.floor(input.critRaw * (100 + input.critFinal) / 100);
  return f32(extra * f32((100 + situational + (critical ? Math.floor(crit * (1000 - input.elasticity) / 1000) : 0)) / 100));
}
const rolledDamage = (input, summon, critical, weapon, roll) => Math.floor(f32(damageBeforeRoll(input, summon, critical, weapon) * roll) / 100);
function rollBounds(input, summon) {
  const rawMin = Math.floor(input.minRaw * (100 + input.minFinal) / 100);
  const rawMax = Math.floor(input.maxRaw * (100 + input.maxFinal) / 100);
  const maximum = summon ? Math.floor(rawMax * input.summonScale / 100) + 105 : rawMax;
  return [Math.min(summon ? Math.floor(rawMin * input.summonScale / 100) + 95 : rawMin, maximum), maximum];
}
function weaponBounds(input) {
  return [input.attackType === 'physical' ? Math.min(input.weaponMin, input.weaponMax) : input.weaponMax, input.weaponMax];
}
function validateReferenceInput(input) {
  if (Object.entries(input).filter(([, value]) => typeof value === 'number').some(([key, value]) => !Number.isFinite(value) || value < (key === 'summonCoef' ? -100 : 0)) || input.guard > 100 || input.elasticity > 1000 || input.penetration > 100) {
    throw new RangeError('Check the input range: summon coefficient must be at least -100; penetration and damage reduction cannot exceed 100%; critical resistance cannot exceed 100%.');
  }
}
export function calculateReferenceDamage(input) {
  validateReferenceInput(input);
  const weapons = input.attackType === 'physical' ? weaponBounds(input) : [input.weaponMax];
  const domination = f32(f32(100 + input.domination) / 100);
  const range = (summon, critical) => {
    const values = weapons.flatMap((weapon) => rollBounds(input, summon).flatMap((roll) => [1, 2].map((fallback) => {
      const damage = rolledDamage(input, summon, critical, weapon, roll);
      return Math.floor((damage > 0 ? damage : fallback) * (100 - input.guard) / 100 * domination);
    })));
    return { min: Math.min(...values), max: Math.max(...values) };
  };
  return { directNoncrit: range(false, false), directCrit: range(false, true), summonNoncrit: range(true, false), summonCrit: range(true, true) };
}
export function estimateReferenceAverage(input, summon, critical) {
  const [minimum, maximum] = rollBounds(input, summon);
  const [weaponMin, weaponMax] = weaponBounds(input);
  const weaponSamples = weaponMin === weaponMax ? 1 : minimum === maximum ? 16384 : 256;
  const damageSamples = minimum === maximum ? 1 : weaponSamples === 256 ? 256 : 16384;
  if ((weaponSamples === 1 && damageSamples === 1) || rolledDamage(input, summon, critical, weaponMin, minimum) <= 0) return undefined;
  const domination = f32(f32(100 + input.domination) / 100);
  let sum = 0;
  let compensation = 0;
  for (let w = 0; w < weaponSamples; w++) {
    const weapon = weaponSamples === 1 ? weaponMin : weaponMin + (w + 0.5) * (weaponMax - weaponMin) / weaponSamples;
    const base = damageBeforeRoll(input, summon, critical, weapon);
    for (let d = 0; d < damageSamples; d++) {
      const roll = damageSamples === 1 ? minimum : minimum + (d + 0.5) * (maximum - minimum) / damageSamples;
      const damage = Math.floor(f32(base * roll) / 100);
      if (damage <= 0) return undefined;
      const corrected = Math.floor(damage * (100 - input.guard) / 100 * domination) - compensation;
      const next = sum + corrected;
      compensation = next - sum - corrected;
      sum = next;
    }
  }
  return sum / (weaponSamples * damageSamples);
}
export function referenceScore(input, kind, mode, backAttackRate = 0) {
  const key = kind === 'direct' ? 'directCrit' : 'summonCrit';
  const score = (backAttack) => {
    const situational = { ...input, backAttack };
    const range = calculateReferenceDamage(situational)[key];
    return mode === 'maximum' ? range.max : (estimateReferenceAverage(situational, kind === 'summon', true) ?? (range.min + range.max) / 2);
  };
  const rate = boundedRate(backAttackRate) / 100;
  return rate === 0 ? score(false) : rate === 1 ? score(true) : score(false) * (1 - rate) + score(true) * rate;
}
function normalizeDamageOptions(options) {
  return typeof options === 'object' && options !== null
    ? { damageMode: options.damageMode, backAttackRate: boundedRate(options.backAttackRate) }
    : { damageMode: 'average', backAttackRate: typeof options === 'number' ? boundedRate(options) : 100 * !!options };
}
export function calcDirectHitDamage(stats, coefficient, scenario, options, dungeon) {
  const sides = expandHybridStats(stats);
  if (sides) return (calcDirectHitDamage(sides.physical, coefficient, scenario, options, dungeon) + calcDirectHitDamage(sides.magical, coefficient, scenario, options, dungeon)) / 2;
  const { damageMode, backAttackRate } = normalizeDamageOptions(options);
  return referenceScore(referenceInput(stats, scenario, dungeon, coefficient), 'direct', damageMode, backAttackRate);
}
export function calcPlacementDamage(stats, weaponAttrCoef, strMagMult, totalMult, scenario, options, dungeon) {
  const sides = expandHybridStats(stats);
  if (sides) return (calcPlacementDamage(sides.physical, weaponAttrCoef, strMagMult, totalMult, scenario, options, dungeon) + calcPlacementDamage(sides.magical, weaponAttrCoef, strMagMult, totalMult, scenario, options, dungeon)) / 2;
  const { damageMode, backAttackRate } = normalizeDamageOptions(options);
  // The wiki keeps totalMult for its skill table but its reference damage engine does not multiply by it.
  return referenceScore(referenceInput(stats, scenario, dungeon, 0, { weaponAttrCoef, strMagMult }), 'summon', damageMode, backAttackRate);
}

export function applyEnchantDelta(stats, oldOption, newOption) {
  const sides = expandHybridStats(stats);
  if (sides) return averageComputedStats(applyEnchantDelta(sides.physical, oldOption, newOption), applyEnchantDelta(sides.magical, oldOption, newOption));
  const delta = (key) => newOption[key] - oldOption[key];
  const result = { ...stats };
  const mapping = {
    strMag: ['strMagAll', 'strMagAllPercent'], weaponAttr: ['weaponAttr', 'weaponAttrPercent'],
    critDmg: ['critDmg', 'finalCritDmg'], minDmg: ['minDmg', 'finalMinDmg'],
    maxDmg: ['maxDmg', 'finalMaxDmg'], fixedDmg: ['fixedDmg', 'fixedDmgPercent'],
    normalExtraDmg: [null, 'normalDmgPercent'], bossExtraDmg: [null, 'bossDmgPercent']
  };
  for (const [key, [absoluteKey, percentKey]] of Object.entries(mapping)) {
    const absolute = stats[key + 'Abs'] + (absoluteKey ? delta(absoluteKey) : 0);
    const percent = stats[key + 'Pct'] + delta(percentKey);
    result[key + 'Abs'] = absolute;
    result[key + 'Pct'] = percent;
    result[key] = absolute * (1 + percent / 100);
    if (key !== 'minDmg' && key !== 'maxDmg') result[key + 'Per1Pct'] = percentageUnit(absolute, percent);
  }
  for (const key of ['normalDomination', 'bossDomination', 'backAttackDmg', 'strMagEfficiency']) result[key] = stats[key] + delta(key);
  return result;
}
export function calcEnchantAdjustedCoefficients(direct, strMag, total, oldOption, newOption, growth = { directHit: 0, placementStrMag: 0, placementTotal: 0 }) {
  const directLevels = newOption.directHitSkillLevel - oldOption.directHitSkillLevel;
  const placementLevels = newOption.placementSkillLevel - oldOption.placementSkillLevel;
  return { directHitCoef: direct + growth.directHit * directLevels, placementStrMagMult: strMag + growth.placementStrMag * placementLevels, placementTotalMult: total + growth.placementTotal * placementLevels };
}
export function compareEnchants(stats, oldOption, newOption, direct, weapon, strMag, total, dungeon, options = false, growth) {
  const changed = applyEnchantDelta(stats, oldOption, newOption);
  const coefs = calcEnchantAdjustedCoefficients(direct, strMag, total, oldOption, newOption, growth);
  const rate = (before, after) => before !== 0 ? (after / before - 1) * 100 : 0;
  const result = {};
  for (const [suffix, scenario, target] of [['Theory', 'theory', dungeon], ['BossTheory', 'boss', undefined], ['Normal', 'normal', dungeon], ['Boss', 'boss', dungeon]]) {
    result['directHit' + suffix] = rate(calcDirectHitDamage(stats, direct, scenario, options, target), calcDirectHitDamage(changed, coefs.directHitCoef, scenario, options, target));
    result['placement' + suffix] = rate(calcPlacementDamage(stats, weapon, strMag, total, scenario, options, target), calcPlacementDamage(changed, weapon, coefs.placementStrMagMult, coefs.placementTotalMult, scenario, options, target));
  }
  return result;
}

export function calcPlacementCoreMultipliers(coreBonus) {
  const skillLevel = coreBonus + 50;
  let remainder = 0, growth = 0, accumulated = 0;
  if (skillLevel > 0 && skillLevel < 11) { remainder = skillLevel; growth = 1.5; }
  else if (skillLevel > 10 && skillLevel < 41) { remainder = skillLevel - 10; growth = 2; accumulated = 15; }
  else if (skillLevel > 40 && skillLevel < 61) { remainder = skillLevel - 40; growth = 2.5; accumulated = 75; }
  else if (skillLevel > 60 && skillLevel < 81) { remainder = skillLevel - 60; growth = 3; accumulated = 125; }
  else if (skillLevel > 80) { remainder = skillLevel - 80; growth = 3.5; accumulated = 185; }
  return { totalMult: 0.7 + accumulated / 100 + remainder * growth / 100, strMagEff: 0.8 + 0.01 * skillLevel, skillLevel };
}
export function calcPlacementSkillCoefficients(skill, level, coreBonus) {
  if (!skill) return { weaponAttrCoef: 0, strMagMult: 0, totalMult: 0 };
  if (skill.name === '설치형 코어') {
    const core = calcPlacementCoreMultipliers(coreBonus);
    return { weaponAttrCoef: skill.weaponAttrCoef, strMagMult: core.strMagEff, totalMult: core.totalMult };
  }
  return { weaponAttrCoef: skill.weaponAttrCoef, strMagMult: skill.baseStrMagMult + skill.levelStrMagMult * level, totalMult: skill.baseTotalMult + skill.levelTotalMult * level };
}
export function resolveDirectHitCoef(coefficient, settings) {
  return settings?.useCustomDirectHitCoef && Number.isFinite(settings.customDirectHitCoef) ? settings.customDirectHitCoef : coefficient;
}
export function resolvePlacementCoefs(coefs, settings) {
  if (!settings?.useCustomPlacementCoefs) return coefs;
  return {
    weaponAttrCoef: Number.isFinite(settings.customPlacementWeaponAttrCoef) ? settings.customPlacementWeaponAttrCoef : coefs.weaponAttrCoef,
    strMagMult: Number.isFinite(settings.customPlacementStrMagMult) ? settings.customPlacementStrMagMult : coefs.strMagMult,
    totalMult: Number.isFinite(settings.customPlacementTotalMult) ? settings.customPlacementTotalMult : coefs.totalMult
  };
}
export function resolveDungeon(dungeon, settings) {
  return {
    ...(settings.useCustomDungeonStats ? {
      name: `${dungeon.name} · Custom`, normalDefense: settings.customNormalDefense, bossDefense: settings.customBossDefense,
      normalDmgReduction: settings.customNormalDmgReduction, bossDmgReduction: settings.customBossDmgReduction
    } : dungeon),
    ...Object.fromEntries(['normalGuard', 'bossGuard', 'normalElasticity', 'bossElasticity'].map((key) => [key, settings[key] ?? dungeon[key] ?? 0]))
  };
}

function efficiency(stats, scenario, dungeon, backRate, kind, direct, weapon = 0, strMag = 0) {
  const score = (modified) => kind === 'direct' ? calcDirectHitDamage(modified, direct, scenario, { damageMode: 'average', backAttackRate: backRate }, dungeon) : calcPlacementDamage(modified, weapon, strMag, 1, scenario, { damageMode: 'average', backAttackRate: backRate }, dungeon);
  const baseline = score(stats);
  const extraKey = scenario === 'boss' ? 'bossExtraDmg' : 'normalExtraDmg';
  const marginal = (delta) => (score({ ...stats, ...delta }) - baseline) / 100;
  const crit = marginal({ critDmgAbs: stats.critDmgAbs + 100 });
  const compare = (delta) => { const gain = marginal(delta); return gain > 0 ? crit / gain : 0; };
  const critToStrMag = compare({ strMag: stats.strMag + 100 * (1 + stats.strMagPct / 100) });
  const critToWeaponAttr = compare({ weaponAttr: stats.weaponAttr + 100 * (1 + stats.weaponAttrPct / 100) });
  const critToFixedDmg = compare({ fixedDmg: stats.fixedDmg + 100 * (1 + stats.fixedDmgPct / 100) });
  const critToExtraDmg = compare({ [extraKey]: stats[extraKey] + 100 * (1 + stats[extraKey + 'Pct'] / 100) });
  return {
    critToStrMag, critToWeaponAttr, critToFixedDmg, critToExtraDmg,
    strMagToCrit: critToStrMag > 0 ? stats.strMagPer1Pct / critToStrMag : 0,
    weaponAttrToCrit: critToWeaponAttr > 0 ? stats.weaponAttrPer1Pct / critToWeaponAttr : 0,
    fixedDmgToCrit: critToFixedDmg > 0 ? stats.fixedDmgPer1Pct / critToFixedDmg : 0,
    extraDmgToCrit: critToExtraDmg > 0 ? stats[extraKey + 'Per1Pct'] / critToExtraDmg : 0
  };
}
export const calcDirectHitEfficiencyTheory = (stats, coefficient, backRate = 0) => efficiency(stats, 'theory', undefined, backRate, 'direct', coefficient);
export const calcDirectHitEfficiencyDungeon = (stats, coefficient, dungeon, scenario, backRate = 0) => efficiency(stats, scenario, dungeon, backRate, 'direct', coefficient);
export const calcPlacementEfficiencyTheory = (stats, weapon, strMag, backRate = 0) => efficiency(stats, 'theory', undefined, backRate, 'summon', 0, weapon, strMag);
export const calcPlacementEfficiencyDungeon = (stats, weapon, strMag, dungeon, scenario, backRate = 0) => efficiency(stats, scenario, dungeon, backRate, 'summon', 0, weapon, strMag);
export function calcMarginalEfficiency(stats, boss = false, mode = 'average', backRate = 0) {
  const score = (modified) => calcDirectHitDamage(modified, 17000, boss ? 'boss' : 'theory', { damageMode: mode, backAttackRate: backRate });
  const baseline = score(stats);
  if (baseline <= 0) return { crit: 0, min: 0, max: 0, domination: 0 };
  const rate = (delta) => (score({ ...stats, ...delta }) - baseline) / 100 / baseline;
  const domKey = boss ? 'bossDomination' : 'normalDomination';
  return {
    crit: rate({ critDmgAbs: stats.critDmgAbs + 100 }), min: rate({ minDmgAbs: stats.minDmgAbs + 100 }), max: rate({ maxDmgAbs: stats.maxDmgAbs + 100 }),
    domination: (score({ ...stats, [domKey]: stats[domKey] + 1 }) - baseline) / baseline
  };
}
export function calcHitIndicatorSummary(stats, physical, directCoef = 17000, reflection = 148) {
  const sides = expandHybridStats(stats);
  if (sides) {
    const first = calcHitIndicatorSummary(sides.physical, true, directCoef, reflection);
    const second = calcHitIndicatorSummary(sides.magical, false, directCoef, reflection);
    const direct = { ...first.direct, value: (first.direct.value + second.direct.value) / 2 };
    const summon = { ...first.summon, value: (first.summon.value + second.summon.value) / 2 };
    return { direct, summon, combatPower: (direct.value + summon.value) / 2 };
  }
  const dominationSide = stats.bossDomination <= stats.normalDomination ? 'boss' : 'normal';
  const directInput = referenceInput({ ...stats, reference: { ...stats.reference, attackType: physical ? 'physical' : 'magical' } }, dominationSide, undefined, directCoef);
  const weaponTerm = Math.floor(stats.weaponAttr * (directCoef + 100) / 50);
  const strMagTerm = Math.floor(stats.strMag * (1 + stats.strMagEfficiency / 100));
  const direct = {
    dominationSide, domination: directInput.domination, extraDmg: directInput.extraDamage,
    base: weaponTerm + strMagTerm + directInput.fixedDamage + directInput.extraDamage,
    avgDmgFactor: (Math.min(stats.minDmg, stats.maxDmg) + stats.maxDmg) / 200,
    critMult: 1 + stats.critDmg / 100, domMult: 1 + directInput.domination / 100,
    value: referenceScore(directInput, 'direct', 'average') / 1e5, skillCoef: directCoef, weaponAttrShown: stats.weaponAttr, weaponTerm, strMagTerm
  };
  const summonInput = referenceInput(stats, dominationSide, undefined, 0, { weaponAttrCoef: 42, strMagMult: reflection / 100 });
  const summonStatTerm = Math.floor(stats.strMag * reflection / 100);
  const minimum = Math.floor(Math.floor(stats.minDmg) * reflection / 100) + 95;
  const maximum = Math.floor(Math.floor(stats.maxDmg) * reflection / 100) + 105;
  const crit = Math.floor((Math.floor((stats.critDmgAbs - 50) * reflection / 100) + 50) * (100 + stats.critDmgPct) / 100);
  const summon = {
    dominationSide, domination: summonInput.domination, extraDmg: summonInput.extraDamage,
    base: summonStatTerm + (stats.weaponAttr + 1) * 42 + 1 + summonInput.fixedDamage + summonInput.extraDamage,
    avgDmgFactor: (Math.min(minimum, maximum) + maximum) / 200, critMult: 1 + crit / 100, domMult: 1 + summonInput.domination / 100,
    value: referenceScore(summonInput, 'summon', 'average') / 1e5, reflectionPct: reflection, strMagTerm: summonStatTerm
  };
  return { direct, summon, combatPower: (direct.value + summon.value) / 2 };
}

export function calcHpComparison(base, oldOption, newOption) {
  if (base.stamina === 0 && base.maxHp === 0) return null;
  const staminaDifference = base.stamina - base.staminaMinus10;
  const pureStamina = 10 * staminaDifference;
  const staminaPctTotal = pureStamina > 0 ? base.stamina / pureStamina : 0;
  const hpPctTotal = staminaDifference > 0 ? (base.maxHp - base.maxHpMinus10) / (4 * staminaDifference) : 0;
  const hpPlusTotal = hpPctTotal > 0 ? base.maxHp / hpPctTotal - 4 * base.stamina : 0;
  const staminaDelta = newOption.strMagAll - oldOption.strMagAll + newOption.stamina - oldOption.stamina;
  const staminaPctDelta = (newOption.strMagAllPercent - oldOption.strMagAllPercent) / 100;
  const hpPctDelta = (newOption.hpPercent - oldOption.hpPercent) / 100;
  const expectedHp = ((pureStamina + staminaDelta) * (staminaPctTotal + staminaPctDelta) * 4 + hpPlusTotal) * (hpPctTotal + hpPctDelta);
  return { pureStamina, staminaPctTotal, hpPctTotal, hpPlusTotal, expectedHp, hpChangeRate: base.maxHp > 0 ? (expectedHp / base.maxHp - 1) * 100 : 0 };
}
export function compareSettings(stats, directCoef, placement, dungeon, average = true, backRate = 0) {
  const sides = expandHybridStats(stats);
  if (sides) {
    // A preset redistributes each combat side's own budget. Applying a change to
    // the displayed average can otherwise drive the weaker side below zero.
    const physical = compareSettings(sides.physical, directCoef, placement, dungeon, average, backRate);
    const magical = compareSettings(sides.magical, directCoef, placement, dungeon, average, backRate);
    const combined = { budget: (physical.budget + magical.budget) / 2 };
    for (const key of ['current', 'extremeWeapon', 'weapon', 'balanced', 'strMag', 'extremeStrMag']) {
      const first = physical[key], second = magical[key];
      combined[key] = {
        dist: {
          label: first.dist.label,
          strMag: (first.dist.strMag + second.dist.strMag) / 2,
          weaponAttr: (first.dist.weaponAttr + second.dist.weaponAttr) / 2
        },
        damage: Object.fromEntries(Object.keys(first.damage).map((scenario) => [scenario, (first.damage[scenario] + second.damage[scenario]) / 2]))
      };
    }
    return combined;
  }
  const budget = stats.strMag / 100 + stats.weaponAttr;
  const options = { damageMode: average ? 'average' : 'maximum', backAttackRate: backRate };
  const calculate = (dist) => {
    const modified = { ...stats, strMag: dist.strMag, weaponAttr: dist.weaponAttr };
    const damage = (scenario) => calcPlacementDamage(modified, placement.weaponAttrCoef, placement.strMagMult, placement.totalMult, scenario, options, dungeon);
    return { dist, damage: {
      normalDirect: calcDirectHitDamage(modified, directCoef, 'normal', options, dungeon) / 1e8,
      bossDirect: calcDirectHitDamage(modified, directCoef, 'boss', options, dungeon) / 1e8,
      normalPlacement: damage('normal') / 1e8, bossPlacement: damage('boss') / 1e8
    } };
  };
  const preset = (label, statPercent, weaponRatio) => calculate({ label, strMag: statPercent * budget, weaponAttr: weaponRatio * budget });
  return { budget,
    current: calculate({ label: 'Current', strMag: stats.strMag, weaponAttr: stats.weaponAttr }),
    extremeWeapon: preset('Extreme weapon', 37.5, 0.625), weapon: preset('Balanced weapon', 42.85, 0.5715),
    balanced: preset('Balanced', 50, 0.5), strMag: preset('Balanced main stat', 55.5, 0.445), extremeStrMag: preset('Extreme main stat', 58.5, 0.415)
  };
}
export const inferPlacementRatio = (measuredDamage, predictedDamage) => predictedDamage !== 0 ? measuredDamage / predictedDamage : 0;
