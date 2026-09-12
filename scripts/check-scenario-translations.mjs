#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { missingScenarioTranslations, translateScenarios } from '../src/lib/scenario-guide.js';

const root = new URL('../static/data/scenario/', import.meta.url);
const guide = JSON.parse(await readFile(new URL('index.json', root), 'utf8'));
const english = JSON.parse(await readFile(new URL('en.json', root), 'utf8'));
assert.equal(english.schemaVersion, 1);
assert.equal(english.language, 'en');
assert.equal(missingScenarioTranslations(guide.quests, english.strings).length, 0, 'Every Korean string needs a complete English translation.');
const translated = translateScenarios(guide.quests, english.strings);
function structure(value) {
	if (typeof value === 'string') return '<text>';
	if (Array.isArray(value)) return value.map(structure);
	if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, structure(item)]));
	return value;
}
assert.deepEqual(structure(translated), structure(guide.quests), 'Translations must preserve every ID, quantity, level, field, and step.');
console.log(`Complete English translation: ${Object.keys(english.strings).length} strings, ${translated.length} scenarios, ${translated.flatMap((quest) => quest.steps).length} steps.`);
