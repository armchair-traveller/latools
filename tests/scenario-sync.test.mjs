import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
	createSnapshot,
	extractGuideProps,
	fetchSourcePage,
	publishGuide,
	validateGuide
} from '../scripts/sync-scenarios.mjs';

function fixture() {
	return {
		updated: '2026-09-02',
		source: '기준 자료',
		quests: [{
			id: 1101, type: 'main', chapter: 1, order: 1, name: '1. 모험의 시작',
			level: 1, ultraLevel: 0, requirements: ['[튜토리얼] 완료'],
			steps: [{
				id: 901000001, name: '여정의 시작', startNpc: '아세스', startPlace: '벨로스',
				objective: ' %s님, "벨로스"의 [아세스]와 대화하세요.\\n ', endNpc: '', endPlace: '',
				targets: { monsters: [], items: [{ id: 0, name: '아이템', description: '\\n설명', count: 0 }], dungeons: [] },
				travel: [{ destination: '벨로스', method: 'move', steps: ['H', '이동', '벨로스'] }],
				notes: [' 아이템을 사용하세요. '], grantedItems: [], consumedItems: [], rewardItems: [],
				futureField: { original: '보존' }
			}]
		}]
	};
}

function flight(chunk) {
	return `<script>self.__next_f.push(${JSON.stringify([1, chunk])})</script>`;
}

test('extracts original nested Flight props across chunks without changing Korean, tokens or whitespace', () => {
	const guide = fixture();
	const record = `9:${JSON.stringify(['$', '$L1', null, { data: guide }])}\n`;
	const split = record.indexOf('벨로스') + 1;
	const html = flight('1:I["module"]\n') + flight(record.slice(0, split)) + flight(record.slice(split));
	assert.deepEqual(extractGuideProps(html), guide);
	assert.deepEqual(createSnapshot(guide).quests, guide.quests);
	assert.equal(createSnapshot(guide).sourceLanguage, 'ko');
});

test('fails closed for missing Flight data, malformed guides and duplicate identifiers', () => {
	assert.throws(() => extractGuideProps('<html>Maintenance</html>'), /Could not find/);
	const empty = fixture();
	empty.quests = [];
	assert.throws(() => validateGuide(empty), /cannot be empty/);
	const duplicateQuest = fixture();
	duplicateQuest.quests.push(structuredClone(duplicateQuest.quests[0]));
	assert.throws(() => validateGuide(duplicateQuest), /duplicate quest/);
	const duplicateStep = fixture();
	duplicateStep.quests[0].steps.push(structuredClone(duplicateStep.quests[0].steps[0]));
	assert.throws(() => validateGuide(duplicateStep), /duplicate step/);
	const invalidDate = fixture();
	invalidDate.updated = '2026-02-30';
	assert.throws(() => validateGuide(invalidDate), /calendar date/);
	const missingTargets = fixture();
	delete missingTargets.quests[0].steps[0].targets;
	assert.throws(() => validateGuide(missingTargets), /targets must be an object/);
});

test('publishes only the scenario index and preserves the last good snapshot when validation fails', async (t) => {
	const root = await mkdtemp(join(tmpdir(), 'scenario-sync-'));
	t.after(() => rm(root, { recursive: true, force: true }));
	const output = join(root, 'data', 'scenario');
	await mkdir(output, { recursive: true });
	const unrelated = join(root, 'data', 'flash-sale.json');
	const sibling = join(output, 'notes.json');
	await writeFile(unrelated, 'other tool data');
	await writeFile(sibling, 'separate scenario resource');
	const snapshot = await publishGuide(fixture(), output);
	const before = await readFile(join(output, 'index.json'), 'utf8');
	assert.equal(JSON.parse(before).snapshot.questCount, 1);
	assert.equal(snapshot.snapshot.stepCount, 1);
	assert.match(snapshot.snapshot.sha256, /^[0-9a-f]{64}$/);
	const invalid = fixture();
	invalid.quests[0].steps[0].rewardItems[0] = { id: 1 };
	await assert.rejects(publishGuide(invalid, output), /must be a string/);
	assert.equal(await readFile(join(output, 'index.json'), 'utf8'), before);
	assert.equal(await readFile(unrelated, 'utf8'), 'other tool data');
	assert.equal(await readFile(sibling, 'utf8'), 'separate scenario resource');
	assert.deepEqual((await readdir(output)).sort(), ['index.json', 'notes.json']);
});

test('retries transient HTTP failures with a timeout but does not retry missing sources', async () => {
	let calls = 0;
	const delays = [];
	const result = await fetchSourcePage({
		fetchImpl: async (_url, options) => {
			assert.ok(options.signal instanceof AbortSignal);
			calls += 1;
			return calls === 1 ? new Response('', { status: 503 }) : new Response('source');
		},
		sleep: async (ms) => { delays.push(ms); }
	});
	assert.equal(result, 'source');
	assert.equal(calls, 2);
	assert.deepEqual(delays, [750]);
	calls = 0;
	await assert.rejects(fetchSourcePage({
		fetchImpl: async () => { calls += 1; return new Response('', { status: 404 }); },
		sleep: async () => assert.fail('A missing page should not be retried.')
	}), /HTTP 404/);
	assert.equal(calls, 1);
});
