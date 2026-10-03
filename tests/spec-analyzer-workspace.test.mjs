import assert from 'node:assert/strict';
import test from 'node:test';

import { DIRECT_SKILLS, JOBS, PLACEMENT_SKILLS } from '../src/lib/spec-analyzer.js';
import {
	createSpecification,
	readSavedSpecifications,
	readSpecification
} from '../src/lib/spec-analyzer-workspace.ts';

test('specifications round-trip without sharing editable objects', () => {
	const original = createSpecification();
	const restored = readSpecification(JSON.parse(JSON.stringify(original)));
	assert.deepEqual(restored, original);
	restored.inputs.strMagFlat = 1;
	restored.overrides.direct = 2;
	assert.notEqual(original.inputs.strMagFlat, 1);
	assert.notEqual(original.overrides.direct, 2);
	assert.deepEqual(createSpecification(), original);
});

test('unrelated or malformed JSON is not accepted as a specification', () => {
	for (const value of [null, 17, 'text', [], {}, { inputs: null }, { inputs: [] },
		{ inputs: {} }, { inputs: { unrelated: 1 } }, { inputs: { strMagFlat: {} } },
		{ inputs: { physicalJob: 'false' } }]) {
		assert.equal(readSpecification(value), null);
	}
});

test('imports keep expressions and repair field types without treating strings as booleans', () => {
	const original = createSpecification();
	const input = structuredClone(original);
	Object.assign(input.inputs, {
		physicalJob: 'false', meleeAttack: 'true', statusAttack: 1,
		strMagFlat: '5000 + 260', strMagPercent: '200 +', critDmgFlat: Infinity,
		bossExtraDmgFlat: '1'.repeat(201), unknownBonus: 999
	});
	input.settings.useCustomDungeonStats = 'false';
	input.settings.damageMode = 1;
	input.settings.referenceStat = 'unrecognized';
	input.overrides.enabled = 'true';
	input.newEnchant.unknownBonus = 900;
	const restored = readSpecification(input);
	assert.equal(restored.inputs.physicalJob, original.inputs.physicalJob);
	assert.equal(restored.inputs.meleeAttack, false);
	assert.equal(restored.inputs.statusAttack, false);
	assert.equal(restored.settings.useCustomDungeonStats, false);
	assert.equal(restored.overrides.enabled, false);
	assert.equal(restored.inputs.strMagFlat, '5000 + 260');
	assert.equal(restored.inputs.strMagPercent, '200 +');
	assert.equal(restored.inputs.critDmgFlat, original.inputs.critDmgFlat);
	assert.equal(restored.inputs.bossExtraDmgFlat, original.inputs.bossExtraDmgFlat);
	assert.equal(restored.settings.damageMode, 'average');
	assert.equal(restored.settings.referenceStat, 'crit');
	assert.equal(Object.hasOwn(restored.inputs, 'unknownBonus'), false);
	assert.equal(Object.hasOwn(restored.newEnchant, 'unknownBonus'), false);
});

test('catalog selections are repaired to the selected class and canonical summon', () => {
	const input = createSpecification();
	const job = JOBS.find(item => DIRECT_SKILLS.some(skill => skill.job === item.name) &&
		PLACEMENT_SKILLS.some(skill => skill.job === item.name));
	input.selections.jobId = job.id;
	input.selections.directSkillId = DIRECT_SKILLS.find(skill => skill.job !== job.name && skill.job !== 'All Classes').id;
	input.selections.placementSkillId = 'missing-skill';
	input.selections.dungeonId = 'missing-dungeon';
	input.selections.summonId = 'stale-selection';
	input.inputs.summonId = 'missing-summon';
	const restored = readSpecification(input);
	assert.equal(DIRECT_SKILLS.find(skill => skill.id === restored.selections.directSkillId).job, job.name);
	assert.equal(PLACEMENT_SKILLS.find(skill => skill.id === restored.selections.placementSkillId).job, job.name);
	assert.equal(restored.selections.dungeonId, createSpecification().selections.dungeonId);
	assert.equal(restored.inputs.summonId, 'none');
	assert.equal(restored.selections.summonId, 'none');
	input.selections.jobId = 'missing-job';
	assert.equal(readSpecification(input).selections.jobId, createSpecification().selections.jobId);
});

test('custom classes restore manual coefficients and enable their use', () => {
	const input = createSpecification();
	input.selections.jobId = 'custom';
	input.overrides = { enabled: false, direct: '5000 + 100', placedWeapon: 55, placedReflection: 120, extra: 1 };
	const restored = readSpecification(input);
	assert.equal(restored.selections.jobId, 'custom');
	assert.deepEqual(restored.overrides, { enabled: true, direct: '5000 + 100', placedWeapon: 55, placedReflection: 120 });
});

test('v2 saves migrate the actual selected summon instead of their stale input copy', () => {
	const state = createSpecification();
	delete state.overrides;
	for (const key of ['characterLevel', 'weaponMinimum', 'meleeDamage', 'statusDamage', 'meleeAttack', 'statusAttack']) {
		delete state.inputs[key];
	}
	state.inputs.strMagFlat = '999000';
	state.inputs.summonId = 'super-beast';
	state.selections.summonId = 'none';
	const [saved] = readSavedSpecifications([{ id: 'old-build', name: 'Previous build', savedAt: '2025-01-01T00:00:00.000Z', state }]);
	assert.equal(saved.specification.inputs.strMagFlat, '999000');
	assert.equal(saved.specification.inputs.summonId, 'none');
	assert.equal(saved.specification.selections.summonId, 'none');
	assert.equal(saved.specification.inputs.characterLevel, 235);
	assert.deepEqual(saved.specification.overrides, createSpecification().overrides);
	assert.equal(readSpecification(state, { legacy: true }).inputs.summonId, 'none');
	// Current files use inputs as the authoritative summon selection.
	assert.equal(readSpecification(state).inputs.summonId, 'super-beast');
});

test('saved build validation normalizes identity before deduplicating and ignores invalid entries', () => {
	const specification = createSpecification();
	const longId = 'a'.repeat(100);
	const saved = readSavedSpecifications([
		null,
		{ id: ' ', name: 'Empty identifier', specification },
		{ id: 'empty-name', name: ' ', specification },
		{ id: 'not-a-build', name: 'Invalid content', specification: {} },
		{ id: ` ${longId}1`, name: '  Valid build  ', savedAt: 'not-a-date', specification },
		{ id: `${longId}2`, name: 'Duplicate after truncation', specification },
		{ id: 'second', name: 'Second build', savedAt: '2026-10-03T12:00:00Z', specification }
	]);
	assert.equal(saved.length, 2);
	assert.equal(saved[0].id, longId);
	assert.equal(saved[0].name, 'Valid build');
	assert.equal(saved[0].savedAt, '');
	assert.equal(saved[1].savedAt, '2026-10-03T12:00:00Z');
	assert.deepEqual(readSavedSpecifications({ saved }), []);
});
