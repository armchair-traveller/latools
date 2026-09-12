import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
	assertTranslationSource, createArchiveSnapshot, extractArchiveProps, fetchArchive,
	fetchSource, publishArchive, SOURCE_PAGE, STORY_URL, validateArchive
} from '../scripts/sync-scenario-scripts.mjs';

function fixture() {
	const line = { id: 20, speaker: '%s', text: ' %s님, 괜찮아요?\\n ', future: '그대로' };
	return {
		props: {
			index: [{ id: 1, name: '이야기', type: 'main', chapter: 1, order: 1, level: 1, stepCount: 1, lineCount: 3 }],
			speakers: { 조에: 115 }, chapters: { 1: '이리스 리비에르' }
		},
		stories: [{
			id: 1, name: '이야기', type: 'main', chapter: 1, order: 1, updated: '2026-08-05', source: '원문',
			steps: [{ id: 10, name: '여정', objective: '대화하세요.', scenes: [{ id: 20, lines: [
				{ ...line, choices: [{ text: '1. 조에에 대하여', goto: 20, lines: [structuredClone(line)] }] },
				{ id: 21, speaker: '', text: '▒▒▒' }
			] }] }]
		}]
	};
}

function flight(chunk) {
	return `<script>self.__next_f.push(${JSON.stringify([1, chunk])})</script>`;
}

test('extracts split Flight records and preserves Korean, whitespace, placeholders and repeated branch IDs', () => {
	const { props, stories } = fixture();
	const record = `9:${JSON.stringify(['$', '$L1', null, { data: props }])}\n`;
	const split = record.indexOf('이리스') + 1;
	assert.deepEqual(extractArchiveProps(flight('1:I["module"]\n') + flight(record.slice(0, split)) + flight(record.slice(split))), props);
	const snapshot = createArchiveSnapshot(props, stories, '2026-09-12T00:00:00.000Z');
	assert.deepEqual(snapshot.index, props.index);
	assert.deepEqual(validateArchive(props, stories), { storyCount: 1, stepCount: 1, sceneCount: 1, lineCount: 3, choiceCount: 1 });
	assert.match(snapshot.snapshot.sha256, /^[0-9a-f]{64}$/);
	assert.match(snapshot.snapshot.stories[1], /^[0-9a-f]{64}$/);
	assert.equal(snapshot.snapshot.sha256, createArchiveSnapshot(props, stories).snapshot.sha256);
	const changed = structuredClone(stories);
	changed[0].steps[0].scenes[0].lines[0].text += ' ';
	assert.notEqual(snapshot.snapshot.sha256, createArchiveSnapshot(props, changed).snapshot.sha256);
});

test('rejects missing stories, metadata mismatch, malformed branches and count drift before publication', () => {
	assert.throws(() => extractArchiveProps('<html>Maintenance</html>'), /Could not find/);
	for (const [mutate, expected] of [
		[(p) => { p.index = []; }, /cannot be empty/],
		[(p) => { p.index.push(structuredClone(p.index[0])); }, /duplicate story/],
		[(_p, s) => { s.length = 0; }, /story count/],
		[(_p, s) => { s[0].id = 2; }, /does not match/],
		[(_p, s) => { s[0].updated = '2026-02-30'; }, /calendar date/],
		[(_p, s) => { s[0].steps[0].scenes[0].lines[0].choices[0].goto = '../outside'; }, /must be an integer/],
		[(_p, s) => { s[0].steps[0].scenes[0].lines[0].choices[0].lines = null; }, /must be an array/],
		[(p) => { p.index[0].lineCount = 2; }, /line count/]
	]) {
		const { props, stories } = fixture();
		mutate(props, stories);
		assert.throws(() => validateArchive(props, stories), expected);
	}
});

test('publishes complete source snapshots and leaves translations and the previous snapshot untouched on failure', async (t) => {
	const root = await mkdtemp(join(tmpdir(), 'scenario-script-sync-'));
	t.after(() => rm(root, { recursive: true, force: true }));
	const output = join(root, 'ko');
	await writeFile(join(root, 'index.json'), 'separate English archive');
	const { props, stories } = fixture();
	await publishArchive(props, stories, output);
	const before = await readFile(join(output, 'index.json'), 'utf8');
	assert.deepEqual(JSON.parse(await readFile(join(output, 'stories', '1.json'), 'utf8')), stories[0]);
	assert.equal(await readFile(join(root, 'index.json'), 'utf8'), 'separate English archive');
	const invalid = structuredClone(stories);
	invalid[0].steps[0].scenes[0].lines.pop();
	await assert.rejects(publishArchive(props, invalid, output), /line count/);
	assert.equal(await readFile(join(output, 'index.json'), 'utf8'), before);
	await writeFile(join(output, 'unrelated.txt'), 'keep');
	await assert.rejects(publishArchive(props, stories, output), /unrelated files/);
	assert.equal(await readFile(join(output, 'unrelated.txt'), 'utf8'), 'keep');
	assert.deepEqual((await readdir(root)).sort(), ['index.json', 'ko']);
});

test('fetches source stories in index order, retries transient responses and stops retrying permanent failures', async () => {
	const { props, stories } = fixture();
	const calls = [];
	const delays = [];
	let storyCalls = 0;
	const archive = await fetchArchive({
		fetchImpl: async (url, options) => {
			calls.push(url);
			assert.ok(options.signal instanceof AbortSignal);
			if (url === SOURCE_PAGE) return new Response(flight(`9:${JSON.stringify(props)}\n`));
			assert.equal(url, `${STORY_URL}1`);
			return ++storyCalls === 1 ? new Response('', { status: 503 }) : Response.json(stories[0]);
		},
		sleep: async (ms) => { delays.push(ms); }
	});
	assert.deepEqual(archive, { props, stories });
	assert.equal(calls.length, 3);
	assert.deepEqual(delays, [750]);
	let attempts = 0;
	await assert.rejects(fetchSource(SOURCE_PAGE, {
		fetchImpl: async () => { attempts += 1; return new Response('', { status: 404 }); },
		sleep: async () => assert.fail('Do not retry a missing source.')
	}), /HTTP 404/);
	assert.equal(attempts, 1);
});

test('blocks source changes until the English source checksum is reviewed', () => {
	const { props, stories } = fixture();
	const snapshot = createArchiveSnapshot(props, stories);
	assert.doesNotThrow(() => assertTranslationSource(snapshot, undefined));
	assert.doesNotThrow(() => assertTranslationSource(snapshot, { translation: { sourceSha256: snapshot.snapshot.sha256 } }));
	assert.throws(() => assertTranslationSource(snapshot, { translation: { sourceSha256: 'stale' } }), /English archive needs review/);
	assert.throws(() => assertTranslationSource(snapshot, {}), /English archive needs review/);
});
