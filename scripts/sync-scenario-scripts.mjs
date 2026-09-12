#!/usr/bin/env node

import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SOURCE_PAGE = 'https://latale.wiki/scenario-script';
export const STORY_URL = 'https://latale.wiki/api/scenario-story/';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUTPUT = join(ROOT, 'static', 'data', 'scenario-script', 'ko');
const REQUEST_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 20_000;

function findArchive(value) {
	if (!value || typeof value !== 'object') return null;
	if (Array.isArray(value.index) && value.speakers && value.chapters) return value;
	for (const child of Object.values(value)) {
		const match = findArchive(child);
		if (match) return match;
	}
	return null;
}

/** Decode Flight JSON only. A component record may span several script tags. */
export function extractArchiveProps(html) {
	const chunks = [];
	const pattern = /self\.__next_f\.push\((\[1,"(?:\\.|[^"\\])*"\])\)/g;
	for (const match of html.matchAll(pattern)) {
		try {
			chunks.push(JSON.parse(match[1])[1]);
		} catch {
			// Never evaluate the source page's JavaScript.
		}
	}
	for (const record of chunks.join('').split('\n')) {
		const separator = record.indexOf(':');
		if (separator === -1 || !record.includes('"index"')) continue;
		try {
			const props = findArchive(JSON.parse(record.slice(separator + 1)));
			if (props) return props;
		} catch {
			// Not every Flight record is a JSON component tree.
		}
	}
	throw new Error('Could not find the scenario script index in the source page.');
}

function assert(condition, message) {
	if (!condition) throw new Error(`Invalid scenario script source: ${message}`);
}

function object(value, label) {
	assert(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object.`);
}

function string(value, label) {
	assert(typeof value === 'string', `${label} must be a string.`);
}

function integer(value, label, minimum = 0) {
	assert(Number.isSafeInteger(value) && value >= minimum, `${label} must be an integer >= ${minimum}.`);
}

function array(value, label) {
	assert(Array.isArray(value), `${label} must be an array.`);
}

function date(value, label) {
	assert(
		typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
			!Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value,
		`${label} must be a calendar date.`
	);
}

export function validateIndex(props) {
	object(props, 'archive');
	array(props.index, 'index');
	assert(props.index.length > 0, 'index cannot be empty.');
	object(props.speakers, 'speakers');
	object(props.chapters, 'chapters');
	for (const [speaker, id] of Object.entries(props.speakers)) integer(id, `speaker ${speaker}`, 1);
	for (const [chapter, name] of Object.entries(props.chapters)) {
		assert(/^[1-9]\d*$/.test(chapter), `chapter key ${chapter} must be a positive integer.`);
		string(name, `chapter ${chapter}`);
	}
	const ids = new Set();
	for (const meta of props.index) {
		object(meta, 'index entry');
		integer(meta.id, 'story.id', 1);
		assert(!ids.has(meta.id), `duplicate story ${meta.id}.`);
		ids.add(meta.id);
		const label = `story ${meta.id}`;
		assert(['main', 'sub'].includes(meta.type), `${label}.type is unsupported.`);
		string(meta.name, `${label}.name`);
		for (const field of ['chapter', 'order', 'level']) integer(meta[field], `${label}.${field}`);
		for (const field of ['stepCount', 'lineCount']) integer(meta[field], `${label}.${field}`, 1);
		assert(Object.hasOwn(props.chapters, meta.chapter), `${label} has an unknown chapter.`);
	}
}

/** Validate nested branches without deduplicating repeated scene or dialogue IDs. */
export function validateArchive(props, stories) {
	validateIndex(props);
	array(stories, 'stories');
	assert(stories.length === props.index.length, 'story count does not match the index.');
	const counts = { storyCount: stories.length, stepCount: 0, sceneCount: 0, lineCount: 0, choiceCount: 0 };
	const stepIds = new Set();
	function validateLines(lines, label, depth = 0) {
		array(lines, `${label}.lines`);
		assert(depth <= 100, `${label} has excessive branch nesting.`);
		let total = 0;
		for (const [index, line] of lines.entries()) {
			const context = `${label}.lines[${index}]`;
			object(line, context);
			integer(line.id, `${context}.id`, 1);
			string(line.speaker, `${context}.speaker`);
			string(line.text, `${context}.text`);
			total += 1;
			if (line.choices === undefined) continue;
			array(line.choices, `${context}.choices`);
			for (const [choiceIndex, choice] of line.choices.entries()) {
				const branch = `${context}.choices[${choiceIndex}]`;
				object(choice, branch);
				string(choice.text, `${branch}.text`);
				integer(choice.goto, `${branch}.goto`);
				counts.choiceCount += 1;
				total += validateLines(choice.lines, branch, depth + 1);
			}
		}
		return total;
	}
	for (const [index, story] of stories.entries()) {
		const meta = props.index[index];
		const label = `story ${meta.id}`;
		object(story, label);
		for (const field of ['id', 'name', 'type', 'chapter', 'order']) {
			assert(story[field] === meta[field], `${label}.${field} does not match the index.`);
		}
		date(story.updated, `${label}.updated`);
		string(story.source, `${label}.source`);
		array(story.steps, `${label}.steps`);
		assert(story.steps.length === meta.stepCount, `${label} step count does not match the index.`);
		let lineCount = 0;
		for (const step of story.steps) {
			object(step, `${label}.step`);
			integer(step.id, `${label}.step.id`, 1);
			assert(!stepIds.has(step.id), `duplicate step ${step.id}.`);
			stepIds.add(step.id);
			const context = `${label}, step ${step.id}`;
			string(step.name, `${context}.name`);
			string(step.objective, `${context}.objective`);
			array(step.scenes, `${context}.scenes`);
			counts.stepCount += 1;
			for (const scene of step.scenes) {
				object(scene, `${context}.scene`);
				integer(scene.id, `${context}.scene.id`, 1);
				counts.sceneCount += 1;
				lineCount += validateLines(scene.lines, `${context}, scene ${scene.id}`);
			}
		}
		assert(lineCount === meta.lineCount, `${label} line count does not match the index (${lineCount} vs ${meta.lineCount}).`);
		counts.lineCount += lineCount;
	}
	return counts;
}

function sha256(value) {
	return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function createArchiveSnapshot(props, stories, generatedAt = new Date().toISOString()) {
	const counts = validateArchive(props, stories);
	return {
		...props,
		schemaVersion: 1,
		sourceLanguage: 'ko',
		sourceUrl: SOURCE_PAGE,
		generatedAt,
		snapshot: {
			...counts,
			sha256: sha256({ index: props.index, speakers: props.speakers, chapters: props.chapters, stories }),
			stories: Object.fromEntries(stories.map((story) => [story.id, sha256(story)]))
		}
	};
}

/** Retry transient errors and consume response bodies within the request timeout. */
export async function fetchSource(url, {
	fetchImpl = fetch,
	sleep = (ms) => new Promise((done) => setTimeout(done, ms))
} = {}) {
	let lastError;
	for (let attempt = 1; attempt <= REQUEST_ATTEMPTS; attempt += 1) {
		let retryable = true;
		try {
			const response = await fetchImpl(url, {
				signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
				headers: { 'User-Agent': 'latale-scenario-script-sync/1.0' }
			});
			if (response.ok) return await response.text();
			retryable = response.status === 429 || response.status >= 500;
			lastError = new Error(`${url} returned HTTP ${response.status}.`);
		} catch (error) {
			lastError = error;
		}
		if (!retryable || attempt === REQUEST_ATTEMPTS) break;
		await sleep(750 * 2 ** (attempt - 1));
	}
	throw lastError;
}

export async function fetchArchive(options = {}) {
	const props = extractArchiveProps(await fetchSource(SOURCE_PAGE, options));
	validateIndex(props);
	const stories = new Array(props.index.length);
	let cursor = 0;
	const workers = await Promise.allSettled(Array.from({ length: Math.min(6, stories.length) }, async () => {
		while (cursor < props.index.length) {
			const index = cursor++;
			stories[index] = JSON.parse(await fetchSource(`${STORY_URL}${props.index[index].id}`, options));
		}
	}));
	const failed = workers.find((worker) => worker.status === 'rejected');
	if (failed) throw failed.reason;
	validateArchive(props, stories);
	return { props, stories };
}

/** The dedicated source directory is staged completely before replacing the old snapshot. */
export async function publishArchive(props, stories, outputDirectory = DEFAULT_OUTPUT) {
	const snapshot = createArchiveSnapshot(props, stories);
	const destination = resolve(outputDirectory);
	assert(destination !== dirname(destination) && destination !== ROOT, 'output must be a dedicated snapshot directory.');
	try {
		const entries = await readdir(destination);
		assert(entries.every((entry) => ['index.json', 'stories'].includes(entry)), 'output contains unrelated files; choose a dedicated snapshot directory.');
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
	const token = randomUUID();
	const staging = join(dirname(destination), `.${basename(destination)}-staging-${token}`);
	const backup = join(dirname(destination), `.${basename(destination)}-backup-${token}`);
	let movedPrevious = false;
	await mkdir(join(staging, 'stories'), { recursive: true });
	try {
		await Promise.all(stories.map((story) => writeFile(join(staging, 'stories', `${story.id}.json`), `${JSON.stringify(story)}\n`, { flag: 'wx' })));
		await writeFile(join(staging, 'index.json'), `${JSON.stringify(snapshot)}\n`, { flag: 'wx' });
		try {
			await rename(destination, backup);
			movedPrevious = true;
		} catch (error) {
			if (error.code !== 'ENOENT') throw error;
		}
		try {
			await rename(staging, destination);
		} catch (error) {
			if (movedPrevious) await rename(backup, destination);
			throw error;
		}
		if (movedPrevious) await rm(backup, { recursive: true, force: true });
	} finally {
		await rm(staging, { recursive: true, force: true });
	}
	return snapshot;
}

/** Publishing refreshed source must not silently invalidate the reviewed English archive. */
export function assertTranslationSource(snapshot, translation) {
	if (translation && translation.translation?.sourceSha256 !== snapshot.snapshot.sha256) {
		throw new Error(
			'The source changed and the English archive needs review. ' +
			'Use --output .cache/scenario-script-review, update the English archive and its source checksum, then publish again.'
		);
	}
}

async function main(args) {
	if (args.length === 1 && args[0] === '--help') {
		console.log('Usage: node scripts/sync-scenario-scripts.mjs [--output <directory>]');
		console.log('Imports original Korean dialogue to static/data/scenario-script/ko; English is maintained separately.');
		return;
	}
	if (args.length && (args.length !== 2 || args[0] !== '--output' || !args[1])) {
		throw new Error('Expected --output <directory>, or no arguments for the site snapshot.');
	}
	const output = args[1] ? resolve(args[1]) : DEFAULT_OUTPUT;
	console.log(`[scenario-script-sync] Reading ${SOURCE_PAGE}…`);
	const { props, stories } = await fetchArchive();
	if (output === DEFAULT_OUTPUT) {
		let translation;
		try {
			translation = JSON.parse(await readFile(join(dirname(DEFAULT_OUTPUT), 'index.json'), 'utf8'));
		} catch (error) {
			if (error.code !== 'ENOENT') throw error;
		}
		assertTranslationSource(createArchiveSnapshot(props, stories), translation);
	}
	const snapshot = await publishArchive(props, stories, output);
	console.log(`[scenario-script-sync] Wrote ${snapshot.snapshot.storyCount} stories, ${snapshot.snapshot.stepCount} steps, ${snapshot.snapshot.sceneCount} scenes, and ${snapshot.snapshot.lineCount} dialogue lines to ${output}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main(process.argv.slice(2)).catch((error) => {
		console.error('[scenario-script-sync] Failed:', error);
		process.exitCode = 1;
	});
}
