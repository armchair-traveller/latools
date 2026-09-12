import assert from 'node:assert/strict';
import test from 'node:test';
import { assembleStory, sourceHash, untranslatedStrings, normalizeMetadata } from '../scripts/scenario-script-translations.mjs';

const source = {
	id: 1, name: '모험', steps: [{ id: 2, name: '시작', objective: '대화하세요.', scenes: [{ id: 3, lines: [
		{ id: 4, speaker: '이리스', text: '안녕, %s.', choices: [{ text: '네.', goto: 4, lines: [{ id: 4, speaker: '%s', text: '……' }] }] }
	] }] }]
};
const context = {
	metadata: new Map([['모험', 'Adventure'], ['시작', 'Beginning'], ['대화하세요.', 'Talk to her.']]),
	speakers: { 이리스: 'Iris', '%s': '%s' }
};
const catalog = () => ({ sourceSha256: sourceHash(source), translatedAt: '2026-09-12T00:00:00.000Z', strings: { '안녕, %s.': 'Hello, %s.', '네.': 'Yes.' } });

test('fresh assembly preserves nested choices, duplicate IDs, raw speaker keys and player tokens', () => {
	const story = assembleStory(source, catalog(), context);
	const line = story.steps[0].scenes[0].lines[0];
	assert.equal(story.originalName, '모험');
	assert.equal(line.speaker, '이리스');
	assert.equal(line.speakerName, 'Iris');
	assert.equal(line.text, 'Hello, %s.');
	assert.deepEqual(line.choices, [{ text: 'Yes.', goto: 4, lines: [{ id: 4, speaker: '%s', speakerName: '%s', text: '……' }] }]);
	assert.equal(source.steps[0].scenes[0].lines[0].text, '안녕, %s.');
});

test('fresh catalogs cannot silently cover changed Korean or omit untranslated branches', () => {
	assert.throws(() => assembleStory({ ...source, name: '새 모험' }, catalog(), context), /different Korean source/);
	const incomplete = catalog();
	delete incomplete.strings['네.'];
	assert.deepEqual(untranslatedStrings(source, incomplete.strings), ['네.']);
	assert.throws(() => assembleStory(source, incomplete, context), /1 untranslated strings/);
});

test('player tokens and complete English coverage are enforced on every translated field', () => {
	for (const [replacement, error] of [['Hello.', /player token/], ['안녕, %s.', /untranslated Korean/], ['', /empty translation/]]) {
		const invalid = catalog();
		invalid.strings['안녕, %s.'] = replacement;
		assert.throws(() => assembleStory(source, invalid, context), error);
	}
});

test('walkthrough metadata matches script source newline encoding without changing words', () => {
	assert.equal(normalizeMetadata('1. 대화\\\\n 2. 이동'), normalizeMetadata('1. 대화\n2. 이동'));
	assert.notEqual(normalizeMetadata('첫 장소'), normalizeMetadata('다른 장소'));
});
