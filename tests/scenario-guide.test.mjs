import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createScenarioSearch, filterScenarios, missingScenarioTranslations, translateScenarios, scenarioLevel, scenarioSelection, scenarioText } from '../src/lib/scenario-guide.js';

const guide = JSON.parse(await readFile(new URL('../static/data/scenario/index.json', import.meta.url), 'utf8'));
const search = createScenarioSearch(guide.quests);

test('snapshot preserves source contents and complete ordered walkthrough', () => {
	const { schemaVersion, sourceLanguage, sourceUrl, generatedAt, snapshot, ...original } = guide;
	assert.equal(schemaVersion, 1);
	assert.equal(sourceLanguage, 'ko');
	assert.equal(sourceUrl, 'https://latale.wiki/progression/scenario');
	assert.equal(createHash('sha256').update(JSON.stringify(original)).digest('hex'), snapshot.sha256);
	assert.equal(snapshot.questCount, guide.quests.length);
	assert.equal(snapshot.stepCount, guide.quests.flatMap((quest) => quest.steps).length);
	assert.equal(guide.quests[0].name, '1. 모험의 시작');
	assert.equal(guide.quests[0].steps[0].name, '여정의 시작');
	assert.equal(guide.quests[0].steps[0].rewardItems[0].count, 1);
});

test('search finds nested NPCs, dungeons, items and prerequisites and combines filters', () => {
	const find = (query, filters = {}) => filterScenarios(guide.quests, search, { query, ...filters });
	for (const query of ['아세스', '고목나무 숲', '잘생긴 알', '튜토리얼']) {
		assert.ok(find(query).some((quest) => quest.id === 1101), query);
	}
	assert.ok(find('벨로스 아세스').some((quest) => quest.id === 1101));
	assert.ok(find('', { type: 'sub', chapter: '4' }).every((quest) => quest.type === 'sub' && quest.chapter === 4));
	assert.equal(find('this-does-not-exist').length, 0);
	assert.equal(find('아세스', { type: 'sub', chapter: '4' }).some((quest) => quest.id === 1101), false);
	assert.equal(find('  ').length, guide.quests.length);
});

test('scenario and step links restore the parent scenario, rejecting malformed or missing IDs', () => {
	assert.deepEqual(scenarioSelection('#quest-1102', guide.quests), { questId: 1102, stepId: null });
	assert.deepEqual(scenarioSelection('#step-901000003', guide.quests), { questId: 1101, stepId: 901000003 });
	const side = guide.quests.find((quest) => quest.type === 'sub' && quest.ultraLevel > 0);
	assert.equal(scenarioSelection(`#step-${side.steps[0].id}`, guide.quests).questId, side.id);
	for (const hash of ['', '#quest-0', '#quest-99999999999', '#quest-1101oops', '#step-NaN']) {
		assert.equal(scenarioSelection(hash, guide.quests), null);
	}
});

test('display preserves quantities and distinguishes super levels, decoding only newlines', () => {
	assert.equal(scenarioLevel(guide.quests[0]), 'Lv. 1');
	const quest = guide.quests.find((entry) => entry.ultraLevel >= 1000);
	assert.equal(scenarioLevel(quest), `Super Lv. ${quest.ultraLevel.toLocaleString('en-US')}`);
	assert.equal(scenarioText('이름\\n\\n설명'), '이름\n\n설명');
	assert.equal(scenarioText('이름\\\\n설명'), '이름\n설명');
	assert.equal(scenarioText('<세레스티아> %s × 0'), '<세레스티아> %s × 0');
});

test('English translation covers the full source and preserves gameplay data without mutating Korean', async () => {
	const { strings } = JSON.parse(await readFile(new URL('../static/data/scenario/en.json', import.meta.url), 'utf8'));
	const original = structuredClone(guide.quests);
	assert.deepEqual(missingScenarioTranslations(guide.quests, strings), []);
	const english = translateScenarios(guide.quests, strings);
	assert.deepEqual(guide.quests, original);
	assert.equal(/[가-힣]/.test(JSON.stringify(english)), false);
	function assertStructure(source, translated) {
		if (typeof source === 'string') {
			assert.equal(translated, strings[source] ?? source);
		} else if (source && typeof source === 'object') {
			assert.deepEqual(Object.keys(translated), Object.keys(source));
			for (const key of Object.keys(source)) assertStructure(source[key], translated[key]);
		} else {
			assert.equal(translated, source);
		}
	}
	assertStructure(original, english);
	const bilingual = createScenarioSearch(english, original);
	for (const query of ['Ases', '아세스', 'Ancient Forest', '고목나무 숲', 'Belos 아세스']) {
		assert.ok(filterScenarios(english, bilingual, { query }).some((quest) => quest.id === 1101), query);
		assert.ok(filterScenarios(original, bilingual, { query }).some((quest) => quest.id === 1101), query);
	}
});

test('revised or incomplete translations cannot silently display stale or mixed-language text', () => {
	const dictionary = { '모험의 시작': 'The Adventure Begins' };
	assert.deepEqual(missingScenarioTranslations([{ name: '모험의 시작', notes: ['새로운 지시'] }], dictionary), ['새로운 지시']);
	assert.throws(() => translateScenarios([{ name: '모험의 시작', notes: ['새로운 지시'] }], dictionary), /Missing English translations for 1/);
	for (const invalid of ['', '  ', '모험의 시작', 10, null]) {
		assert.throws(() => translateScenarios([{ name: '모험의 시작' }], { '모험의 시작': invalid }), /Missing English translations/);
	}
});
