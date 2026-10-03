import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSpecImport, readSaves, saveSpec, deleteSave, readDraft, writeDraft } from '../src/lib/spec-engine/persistence.ts';
import { aggregateStats, aggregateCombatSides } from '../src/lib/spec-engine/engine.js';

const packet = {
 stats: { detail: { strengthBonus: 1200, strengthBonusPercent: 35, magicBonus: 10, weaponBonusMax: 250, weaponBonusMaxPercent: 40, weaponBonusMin: 180, weaponBonusMinPercent: 30, controlNormalPermille: 631, controlBossPermille: 574, piercePhysical: 98, backAttackPhysical: 120 }, raw: [{id:198,value:400}, {id:199,value:20}, {id:231,value:1500}, {id:207,value:3}] }
};
test('wiki collected stats mapping preserves tenths, raw values, physical weapon range and zeroes missing fields', () => {
 const value = parseSpecImport(JSON.stringify(packet));
 assert.equal(value.stats.strMagPlus, 1200);
 assert.equal(value.stats.normalDomination, 63.1);
 assert.equal(value.stats.bossDomination, 57.4);
 assert.equal(value.stats.critDmgPlus, 400);
 assert.equal(value.stats.normalExtraDmgPlus, 1500);
 assert.equal(value.stats.reference.weaponMin, 234);
 assert.equal(value.stats.placementCoreLevel, 0);
 assert.equal(value.stats.fixedDmgPlus, 0);
 assert.equal(value.selectedSummon, '없음');
});
test('magic packet maps separate raw stat IDs', () => {
 const value = structuredClone(packet);
 value.stats.detail.magicBonus = 2400;
 value.stats.detail.attributeBonus = 90;
 value.stats.raw.push({id:200,value:700});
 const imported = parseSpecImport(JSON.stringify(value));
 assert.equal(imported.stats.isPhysicalJob, false);
 assert.equal(imported.stats.strMagPlus, 2400);
 assert.equal(imported.stats.weaponAttrPlus, 90);
 assert.equal(imported.stats.critDmgPlus, 700);
 assert.equal(imported.stats.reference, undefined);
});
test('asymmetric collected stats preserve both Phantom Mage sides and ordinary class selection', () => {
 const collected = {
  stats: {
   detail: { strengthBonus: 1200, strengthBonusPercent: 25, magicBonus: 2400, magicBonusPercent: 50, weaponBonusMax: 200, weaponBonusMaxPercent: 40, attributeBonus: 300, attributeBonusPercent: 60, piercePhysical: 92, pierceMagical: 98, backAttackPhysical: 110, backAttackMagical: 130, controlNormalPermille: 631, controlBossPermille: 574 },
   raw: [
    {id:198,value:400}, {id:199,value:20}, {id:190,value:500}, {id:191,value:30}, {id:192,value:600}, {id:193,value:40}, {id:202,value:700}, {id:203,value:50}, {id:207,value:3},
    {id:200,value:800}, {id:201,value:60}, {id:194,value:900}, {id:195,value:70}, {id:196,value:1000}, {id:197,value:80}, {id:204,value:1100}, {id:205,value:90}, {id:209,value:7},
    {id:231,value:1500}, {id:232,value:10}, {id:233,value:2500}, {id:234,value:20},
   ],
  },
 };
 const imported = parseSpecImport(JSON.stringify(collected));
 assert.deepEqual(imported.stats.hybridStats, {
  physical: { strMagPlus:1200, strMagPercent:25, weaponAttrPlus:200, weaponAttrPercent:40, penetration:92, backAttackDmg:110, critDmgPlus:400, critDmgPercent:20, minDmgPlus:500, minDmgPercent:30, maxDmgPlus:600, maxDmgPercent:40, fixedDmgPlus:700, fixedDmgPercent:50, strMagEfficiency:3 },
  magical: { strMagPlus:2400, strMagPercent:50, weaponAttrPlus:300, weaponAttrPercent:60, penetration:98, backAttackDmg:130, critDmgPlus:800, critDmgPercent:60, minDmgPlus:900, minDmgPercent:70, maxDmgPlus:1000, maxDmgPercent:80, fixedDmgPlus:1100, fixedDmgPercent:90, strMagEfficiency:7 },
 });
 assert.equal(imported.stats.isPhysicalJob, false);
 const sides = aggregateCombatSides(imported.stats);
 assert.equal(sides.physical.strMag, 1500);
 assert.equal(sides.magical.strMag, 3600);
 assert.equal(sides.physical.critDmg, 480);
 assert.equal(sides.magical.critDmg, 1280);
 assert.ok(Math.abs(sides.physical.normalExtraDmg - 1650) < 1e-9);
 assert.equal(sides.magical.normalExtraDmg, sides.physical.normalExtraDmg);
 assert.equal(sides.physical.bossDomination, 57.4);
 assert.equal(sides.magical.bossDomination, 57.4);
 assert.equal(aggregateStats(imported.stats, {}, true).strMag, 2550);
 assert.deepEqual(aggregateStats(imported.stats), sides.magical);
 assert.deepEqual(parseSpecImport(JSON.stringify({version:1,data:imported})), imported);
 const missing = parseSpecImport(JSON.stringify(packet));
 assert.equal(missing.stats.hybridStats.magical.critDmgPlus, 0);
 assert.equal(missing.stats.hybridStats.magical.penetration, 0);
});
test('portable imports round-trip advanced modes and reject malformed settings', () => {
 const workspace = {...parseSpecImport(JSON.stringify(packet)),calculationSettings:{damageMode:'maximum',referenceStat:'minmax',backAttackRate:50,useCustomDungeonStats:true}};
 assert.deepEqual(parseSpecImport(JSON.stringify({version:1,data:workspace})), workspace);
 assert.throws(()=>parseSpecImport(JSON.stringify({version:2,data:workspace})), /version/);
 assert.throws(()=>parseSpecImport('{"__proto__":{"polluted":true}}'), /property/);
 assert.throws(()=>parseSpecImport('invalid'), /valid JSON/);
 workspace.stats.penetration = '98';
 assert.throws(()=>parseSpecImport(JSON.stringify(workspace)), /penetration/);
});
test('import validation rejects unsafe combat domains and permits boundary values', () => {
 const workspace = parseSpecImport(JSON.stringify(packet));
 for (const [key, value] of Object.entries({ backAttackRate:101, normalGuard:101, bossGuard:101, normalElasticity:1001, bossElasticity:1001, customNormalDefense:-1, customDirectHitCoef:-1 })) {
  assert.throws(() => parseSpecImport(JSON.stringify({...workspace, calculationSettings:{[key]:value}})), /Invalid setting/);
 }
 for (const [key, value] of Object.entries({ weaponMin:-1, level:-1, guard:101, penetration:101, elasticity:1001, summonCoef:-101 })) {
  assert.throws(() => parseSpecImport(JSON.stringify({...workspace, stats:{...workspace.stats,reference:{[key]:value}}})), /Invalid actual damage input/);
 }
 const boundary = {...workspace, stats:{...workspace.stats,reference:{guard:100,penetration:100,elasticity:1000,summonCoef:-100}},calculationSettings:{backAttackRate:100,normalGuard:100,bossGuard:100,normalElasticity:1000,bossElasticity:1000,customDirectHitCoef:0}};
 assert.deepEqual(parseSpecImport(JSON.stringify(boundary)), boundary);
});
test('drafts restore workspace and tab independently of named saves, ignoring corrupt storage', () => {
 const entries = new Map();
 const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
 Object.defineProperty(globalThis, 'localStorage', {configurable:true,value:{getItem:key=>entries.get(key)??null,setItem:(key,value)=>entries.set(key,value)}});
 try {
  assert.equal(readDraft(), null);
  const workspace = parseSpecImport(JSON.stringify(packet));
  saveSpec('Named setup', workspace);
  writeDraft(workspace, 'efficiency');
  assert.deepEqual(readDraft(), {data:workspace,tab:'efficiency'});
  workspace.stats.strMagPlus = 999;
  assert.equal(readDraft().data.stats.strMagPlus, 1200);
  const draftKey = [...entries.keys()].find(key=>key.includes('.draft.'));
  for (const corrupt of ['invalid', JSON.stringify({version:2,data:workspace,tab:'efficiency'}), JSON.stringify({version:1,data:workspace,tab:3}), JSON.stringify({version:1,data:{stats:{}},tab:'efficiency'}), JSON.stringify({version:1,data:{...workspace,calculationSettings:{normalGuard:101}},tab:'efficiency'})]) {
   entries.set(draftKey, corrupt);
   assert.equal(readDraft(), null);
   assert.equal(readSaves()[0].data.stats.strMagPlus, 1200);
  }
  Object.defineProperty(globalThis, 'localStorage', {configurable:true,get(){throw new Error('Storage disabled');}});
  assert.equal(readDraft(), null);
 } finally {
  if(previous) Object.defineProperty(globalThis,'localStorage',previous);
  else delete globalThis.localStorage;
 }
});
test('saved setups retain independent state, enforce capacity, and delete only selected save', () => {
 const entries = new Map();
 const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
 Object.defineProperty(globalThis, 'localStorage', {configurable:true,value:{getItem:key=>entries.get(key)??null,setItem:(key,value)=>entries.set(key,value)}});
 try {
  const workspace = parseSpecImport(JSON.stringify(packet));
  const first = saveSpec('First setup',workspace)[0];
  workspace.stats.strMagPlus=999;
  assert.equal(readSaves()[0].data.stats.strMagPlus,1200);
  for(let i=0;i<9;i++) saveSpec(`Setup ${i}`,workspace);
  assert.throws(()=>saveSpec('Too many',workspace), /10 setups/);
  assert.equal(deleteSave(first.id).length,9);
  assert.ok(readSaves().every(save=>save.id!==first.id));
 } finally {
  if(previous) Object.defineProperty(globalThis,'localStorage',previous);
  else delete globalThis.localStorage;
 }
});
