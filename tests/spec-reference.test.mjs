import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  DEFAULT_ENCHANT_OPTION,
  aggregateStats,
  averageComputedStats,
  calculateReferenceDamage,
  calcHpComparison,
  calcPlacementDamage,
  calcPlacementSkillCoefficients,
  estimateReferenceAverage,
  findDirectHitSkill,
  findPlacementSkill,
  referenceScore
} from '../src/lib/spec-engine/engine.js';

// These expectations were read from the rendered wiki, independently of its JS
// implementation. The persisted fixture records the source, date, and units.
const observed = JSON.parse(readFileSync(new URL('./fixtures/spec-wiki-observed.json', import.meta.url), 'utf8'));
const fixture = (name) => observed.fixtures.find((entry) => entry.name === name);

for (const entry of observed.fixtures) {
  test(`wiki rendered damage: ${entry.name}`, () => {
    const result = calculateReferenceDamage(entry.input);
    for (const [key, expected] of Object.entries(entry.expected)) {
      assert.deepEqual(result[key], { min: expected.min, max: expected.max }, `${key} possible range`);
      const average = estimateReferenceAverage(entry.input, key.startsWith('summon'), key.endsWith('Crit'));
      assert.equal(Math.round(average), expected.average, `${key} displayed average`);
    }
  });
}

// Raw values from the wiki's Basic Setup, with its selected Lustral bonuses
// applied explicitly. This also catches accidentally applying a summon twice.
const phantomBase = {
  strMagPlus: 914852, strMagPercent: 443,
  weaponAttrPlus: 8685, weaponAttrPercent: 291,
  critDmgPlus: 5260, critDmgPercent: 41,
  minDmgPlus: 4449, minDmgPercent: 39,
  maxDmgPlus: 5327, maxDmgPercent: 36,
  fixedDmgPlus: 390313, fixedDmgPercent: 82,
  normalExtraDmgPlus: 664341, normalExtraDmgPercent: 14,
  bossExtraDmgPlus: 601314, bossExtraDmgPercent: 15,
  normalDomination: 63.1, bossDomination: 57.4,
  penetration: 99, placementCoreLevel: 19,
  backAttackDmg: 242, strMagEfficiency: 3, isPhysicalJob: true
};
const lustral = {
  normalExtraDmgPlus: 50000, fixedDmgPlus: 40000, minDmgPlus: 50,
  weaponAttrPlus: 500, fixedDmgPercent: 5, weaponAttrPercent: 5
};
const icarus = {
  name: 'Icarus', normalDefense: 2187171, bossDefense: 4374342,
  normalDmgReduction: 2187171, bossDmgReduction: 4374342,
  normalGuard: 53, bossGuard: 80, normalElasticity: 600, bossElasticity: 700
};

test('Phantom Mage summary matches the observed mean of physical and magical results', () => {
  const hybrid = aggregateStats(phantomBase, lustral, true);
  const average = calcPlacementDamage(hybrid, 42, 1.1, 1.1925, 'boss', { damageMode: 'average', backAttackRate: 0 }, icarus);
  const back = calcPlacementDamage(hybrid, 42, 1.1, 1.1925, 'boss', { damageMode: 'average', backAttackRate: 100 }, icarus);
  assert.equal(Math.round(average), fixture('phantom').summonBossSummary);
  assert.equal(Math.round(back), fixture('phantom-backattack').summonBossSummary);
});

test('Phantom Mage preserves independent side damage when its physical and magic stats differ', () => {
  const physical = aggregateStats(phantomBase, lustral);
  const magical = aggregateStats({ ...phantomBase, isPhysicalJob: false, strMagPlus: 500000, critDmgPlus: 3500 }, lustral);
  const combined = averageComputedStats(physical, magical);
  const score = (stats) => calcPlacementDamage(stats, 42, 1.1, 1.1925, 'boss', { damageMode: 'average', backAttackRate: 0 }, icarus);
  assert.equal(score(combined), (score(physical) + score(magical)) / 2);
  const averagedBeforeCalculation = { ...combined, reference: { attackType: 'physical' } };
  assert.notEqual(Math.round(score(combined)), Math.round(score(averagedBeforeCalculation)));
});

test('back-attack uptime interpolates the observed full and zero-uptime outputs', () => {
  const plain = fixture('phantom').input;
  const always = { ...plain, backAttack: true };
  const noBack = estimateReferenceAverage(plain, true, true);
  const fullBack = estimateReferenceAverage(always, true, true);
  const weighted = referenceScore(plain, 'summon', 'average', 25);
  assert.equal(weighted, noBack * 0.75 + fullBack * 0.25);
  assert.equal(referenceScore(plain, 'summon', 'average', -1), noBack);
  assert.equal(referenceScore(plain, 'summon', 'average', 101), fullBack);
});

test('summon back attack stays at its fixed bonus while direct back attack uses the entered stat', () => {
  const base = fixture('phantom-backattack-physical').input;
  const changed = { ...base, backAttackDamage: 999 };
  const before = calculateReferenceDamage(base);
  const after = calculateReferenceDamage(changed);
  assert.deepEqual(after.summonCrit, before.summonCrit);
  assert.deepEqual(after.summonNoncrit, before.summonNoncrit);
  assert.ok(after.directCrit.max > before.directCrit.max);
});

test('magic ignores a physical minimum-weapon value; physical damage still uses it', () => {
  const magical = fixture('magical').input;
  assert.deepEqual(calculateReferenceDamage({ ...magical, weaponMin: 1 }), calculateReferenceDamage(magical));
  const physical = fixture('physical').input;
  const original = calculateReferenceDamage(physical);
  const changed = calculateReferenceDamage({ ...physical, weaponMin: physical.weaponMax / 2 });
  assert.ok(changed.directCrit.min < original.directCrit.min);
  assert.equal(changed.directCrit.max, original.directCrit.max);
});

test('coefficient records agree with independently read English and Korean workbook cells', () => {
  // Direct-Type Skill Coefficients E4:F6 / 직타스킬계수 E4:F6.
  for (const [id, base, growth] of [['direct-0001', 1000, 500], ['direct-0002', 1500, 300], ['direct-0003', 7500, 1500]]) {
    const skill = findDirectHitSkill('히어로 (검)', id);
    assert.ok(skill);
    assert.equal(skill.baseCoef, base);
    assert.equal(skill.levelIncrease, growth);
  }
  // Summon-Type Skill Coefficients H40:L40 / 설치기 계수 H40:L40.
  const phantom = findPlacementSkill('팬텀메이지', '사신의 기운');
  assert.ok(phantom);
  const values = calcPlacementSkillCoefficients(phantom, 10, 19);
  assert.equal(values.weaponAttrCoef, 42);
  assert.ok(Math.abs(values.strMagMult - 1.3) < 1e-12);
  assert.ok(Math.abs(values.totalMult - 1.7175) < 1e-12);
});

test('HP inversion recovers a known character and reproduces workbook replacement arithmetic', () => {
  // HP!E6:E14 in both workbooks: S=300000, S-10%=290000,
  // H=4800000, H-10%=4680000 imply base stamina 100000,
  // stamina multiplier 3, HP multiplier 3, and flat HP 400000.
  const base = { stamina: 300000, staminaMinus10: 290000, maxHp: 4800000, maxHpMinus10: 4680000 };
  const unchanged = calcHpComparison(base, DEFAULT_ENCHANT_OPTION, DEFAULT_ENCHANT_OPTION);
  assert.deepEqual(unchanged, {
    pureStamina: 100000, staminaPctTotal: 3, hpPctTotal: 3, hpPlusTotal: 400000,
    expectedHp: 4800000, hpChangeRate: 0
  });
  const oldOption = { ...DEFAULT_ENCHANT_OPTION, strMagAll: 1000, strMagAllPercent: 5, hpPercent: 3 };
  const newOption = { ...DEFAULT_ENCHANT_OPTION, strMagAll: 2000, stamina: 500, strMagAllPercent: 8, hpPercent: 5 };
  const replacement = calcHpComparison(base, oldOption, newOption);
  assert.equal(Math.round(replacement.expectedHp), 4923144);
  assert.ok(Math.abs(replacement.hpChangeRate - 2.565491666666667) < 1e-10);
});

test('empty HP measurements show no estimate rather than a fabricated result', () => {
  assert.equal(calcHpComparison({ stamina: 0, staminaMinus10: 0, maxHp: 0, maxHpMinus10: 0 }, DEFAULT_ENCHANT_OPTION, DEFAULT_ENCHANT_OPTION), null);
});
