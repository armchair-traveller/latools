import test from 'node:test';
import assert from 'node:assert/strict';
import { filterScriptStories, scenarioScriptText, scriptSpeakerName, scriptLevel, selectScriptStory, selectScriptStep } from '../src/lib/scenario-script.js';

test('character substitution handles repeated/case variants and treats names literally', () => {
	assert.equal(scenarioScriptText('Hello %s! %S, follow me.', '  Fang  '), 'Hello Fang! Fang, follow me.');
	assert.equal(scenarioScriptText('%s and %s', '$& <script>'), '$& <script> and $& <script>');
	assert.equal(scenarioScriptText('%s\\n\\n100% complete', '  '), 'Adventurer\n\n100% complete');
	assert.equal(scenarioScriptText('A\\\\r\\\\nB'), 'A\nB');
	assert.equal(scriptSpeakerName({ speaker: '%S', speakerName: '%s' }, 'Fang'), 'Fang');
	assert.equal(scriptSpeakerName({ speaker: '아세스', speakerName: 'Ases' }), 'Ases');
	assert.equal(scriptSpeakerName({ speaker: '아세스', speakerName: 'Ases' }, '', 'ko'), '아세스');
	assert.equal(scriptSpeakerName({ text: '(A door opens.)' }), 'Narrator');
});

const stories = [
	{ id: 1101, name: '1. The Adventure Begins', originalName: '1. 모험의 시작', chapter: 1, type: 'main', level: 1 },
	{ id: 1176, name: 'Toward Freios', originalName: '프레이오스를 향해', chapter: 1, type: 'sub', level: 120 },
	{ id: 1946, name: 'Fragments of Despair', originalName: '절망의 조각', chapter: 4, type: 'main', level: 235, ultraLevel: 8500 }
];

test('title search supports both languages, token order, Unicode and combined filters', () => {
	assert.deepEqual(filterScriptStories(stories, { query: ' ＡＤＶＥＮＴＵＲＥ  Begins ' }), [stories[0]]);
	assert.deepEqual(filterScriptStories(stories, { query: '모험의' }), [stories[0]]);
	assert.deepEqual(filterScriptStories(stories, { type: 'sub', chapter: '1' }), [stories[1]]);
	assert.deepEqual(filterScriptStories(stories, { query: 'despair', type: 'sub' }), []);
	assert.deepEqual(filterScriptStories(stories, { query: '   ' }), stories);
	assert.equal(scriptLevel(stories[0]), 'Lv. 1');
	assert.equal(scriptLevel(stories[2]), 'Super Lv. 8,500');
});

test('shared IDs resolve only catalog records and invalid requests fall back safely', () => {
	const story = { steps: [{ id: 901000001 }, { id: 901000002 }] };
	assert.equal(selectScriptStory(stories, '1946'), stories[2]);
	for (const requested of [null, '', '../scenario/index', '1101oops', 'Infinity', '99999']) {
		assert.equal(selectScriptStory(stories, requested), stories[0]);
	}
	assert.equal(selectScriptStory([], '1101'), undefined);
	assert.equal(selectScriptStep(story, '901000002'), story.steps[1]);
	assert.equal(selectScriptStep(story, '901000002oops'), story.steps[0]);
});
