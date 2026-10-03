import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/lib/spec-engine/engine.js';
import { updateActualField } from '../src/lib/spec-engine/actual-fields.ts';
const setup=()=>({stats:structuredClone(E.DEFAULT_BASE_STATS),selectedSummon:'초신수',selectedJob:'스타시커',selectedDirectHit:'DS-DR',directHitLevel:0,selectedPlacement:'엘메이',placementLevel:0,selectedDungeon:'이카로스의 날개',calculationSettings:{...E.DEFAULT_SPEC_CALCULATION_SETTINGS}});
const totals=w=>E.aggregateStats(w.stats,E.findSpecSummon(w.selectedSummon).bonuses);
test('actual total stat editing reverses percentages and summon bonuses into shared raw inputs',()=>{
 const before=setup();
 const after=updateActualField(before,'weaponMax',40000,true);
 assert.ok(Math.abs(totals(after).weaponAttr-40000)<1e-8);
 assert.equal(before.stats.weaponAttrPlus,E.DEFAULT_BASE_STATS.weaponAttrPlus);
 const crit=updateActualField(after,'critRaw',6000,true);
 assert.equal(totals(crit).critDmgAbs,6000);
});
test('editing one dungeon field retains every other resolved target value and scales critical resistance',()=>{
 const w=updateActualField(setup(),'defense',12345,true);
 assert.equal(w.calculationSettings.customBossDefense,12345);
 assert.equal(w.calculationSettings.customNormalDefense,2187171);
 assert.equal(w.calculationSettings.customBossDmgReduction,4374342);
 assert.equal(updateActualField(w,'elasticity',70,true).calculationSettings.bossElasticity,700);
 assert.equal(updateActualField(w,'backAttack',true,true).calculationSettings.backAttackRate,100);
});
test('summon coefficient editing preserves other current coefficients and enables the shared override',()=>{
 const w=updateActualField(setup(),'summonScale',150,true);
 assert.equal(w.calculationSettings.customPlacementStrMagMult,1.5);
 assert.equal(w.calculationSettings.customPlacementWeaponAttrCoef,42);
 const next=updateActualField(w,'summonCoef',3000,true);
 assert.equal(next.calculationSettings.customPlacementStrMagMult,1.5);
 assert.equal(next.calculationSettings.customPlacementWeaponAttrCoef,62);
});
test('actual stat editing in hybrid mode updates only the selected combat side',()=>{
 const w=setup();w.selectedJob='팬텀메이지';
 const changed=updateActualField(w,'mainStat',3000000,true,'magical');
 const both=E.aggregateCombatSides(changed.stats,E.findSpecSummon(changed.selectedSummon).bonuses);
 assert.ok(Math.abs(both.magical.strMag-3000000)<1e-8);
 assert.equal(both.physical.strMag,totals(w).strMag);
});
