import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateStats, DEFAULT_BASE_STATS, DEFAULT_SPEC_CALCULATION_SETTINGS, findSpecSummon, calcDirectHitEfficiencyTheory } from '../src/lib/spec-engine/engine.js';
import { summarizeStats, efficiencyBasis, scaleEfficiency } from '../src/lib/spec-engine/summary.ts';
const stats = () => aggregateStats(DEFAULT_BASE_STATS, findSpecSummon('초신수').bonuses);

test('stat conversions and both contribution charts reproduce the live wiki default display', () => {
 const summary = summarizeStats(stats());
 assert.deepEqual(summary.rows.map(row=>row.value.toFixed(2)), ['1684.81','23.19','2301.14','6266.15','5228.82','1.82','1.86','37.30','39.17','32.37','33.87','63.05','61.69']);
 assert.deepEqual(summary.conditional.map(item=>Math.round(item.value*100)), [13,35,36,16]);
 assert.deepEqual(summary.baseStats.map(item=>Math.round(item.value*100)), [27,65,4,4]);
});
test('maximum damage gives minimum-damage efficiency no value when min is below max', () => {
 const computed = stats();
 const basis = efficiencyBasis(computed, {...DEFAULT_SPEC_CALCULATION_SETTINGS, damageMode:'maximum', referenceStat:'minimum'});
 assert.equal(basis.ratio,0);
 const result=scaleEfficiency(calcDirectHitEfficiencyTheory(computed,5000),basis.ratio);
 assert.ok(Object.values(result).every(value=>value===0));
});
test('zero stats have finite conversion summaries and chart weights', () => {
 const empty = Object.fromEntries(Object.entries(DEFAULT_BASE_STATS).map(([key,value])=>[key,typeof value==='number'?0:value]));
 const summary = summarizeStats(aggregateStats(empty));
 assert.ok(summary.rows.every(row=>Number.isFinite(row.value)));
 assert.ok([...summary.conditional,...summary.baseStats].every(item=>Number.isFinite(item.value)));
});
test('asymmetric hybrid charts remove each side stat independently without negative damage inputs', () => {
 const base = {...DEFAULT_BASE_STATS,hybridStats:{physical:{strMagPlus:914852,critDmgPlus:5260},magical:{strMagPlus:500000,critDmgPlus:2000}}};
 const summary = summarizeStats(aggregateStats(base,findSpecSummon('초신수').bonuses,true));
 assert.ok([...summary.conditional,...summary.baseStats].every(item=>Number.isFinite(item.value)&&item.value>=0&&item.value<=1));
 assert.ok(Math.abs(summary.baseStats.reduce((sum,item)=>sum+item.value,0)-1)<1e-12);
});
