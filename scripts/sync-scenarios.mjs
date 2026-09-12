#!/usr/bin/env node

import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { missingScenarioTranslations } from '../src/lib/scenario-guide.js';

export const SOURCE_PAGE = 'https://latale.wiki/progression/scenario';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUTPUT = join(ROOT, 'static', 'data', 'scenario');
const REQUEST_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 20_000;

function findGuide(value) {
	if (!value || typeof value !== 'object') return null;
	if (Array.isArray(value.quests) && typeof value.updated === 'string') return value;
	for (const child of Object.values(value)) {
		const match = findGuide(child);
		if (match) return match;
	}
	return null;
}

/** Read Next Flight's JSON data without evaluating any source-page JavaScript. */
export function extractGuideProps(html) {
	const chunks = [];
	const pattern = /self\.__next_f\.push\((\[1,"(?:\\.|[^"\\])*"\])\)/g;
	for (const match of html.matchAll(pattern)) {
		try {
			chunks.push(JSON.parse(match[1])[1]);
		} catch {
			// Ignore non-JSON script content; validation below fails closed.
		}
	}

	// A record can span script tags, and one tag can contain several records.
	for (const record of chunks.join('').split('\n')) {
		const separator = record.indexOf(':');
		if (separator === -1 || !record.includes('"quests"')) continue;
		try {
			const guide = findGuide(JSON.parse(record.slice(separator + 1)));
			if (guide) return guide;
		} catch {
			// Flight also contains records that are not JSON component trees.
		}
	}
	throw new Error('Could not find the scenario walkthrough data in the source page.');
}

function assert(condition, message) {
	if (!condition) throw new Error(`Invalid scenario source: ${message}`);
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

function strings(value, label) {
	array(value, label);
	value.forEach((entry, index) => string(entry, `${label}[${index}]`));
}

function items(value, label) {
	array(value, label);
	for (const [index, item] of value.entries()) {
		const context = `${label}[${index}]`;
		object(item, context);
		// The reference uses 0 for a named target without a catalog item ID.
		integer(item.id, `${context}.id`);
		string(item.name, `${context}.name`);
		string(item.description, `${context}.description`);
		integer(item.count, `${context}.count`);
		for (const field of ['npc', 'place']) {
			if (item[field] !== undefined) string(item[field], `${context}.${field}`);
		}
		if (item.obtainedFrom !== undefined) {
			object(item.obtainedFrom, `${context}.obtainedFrom`);
			integer(item.obtainedFrom.questId, `${context}.obtainedFrom.questId`, 1);
			for (const field of ['stepName', 'npc', 'place', 'method']) {
				string(item.obtainedFrom[field], `${context}.obtainedFrom.${field}`);
			}
		}
	}
}

/** Validate before publication; retain unknown source fields for future updates. */
export function validateGuide(guide) {
	object(guide, 'guide');
	assert(
		typeof guide.updated === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(guide.updated) &&
			!Number.isNaN(Date.parse(guide.updated)) &&
			new Date(guide.updated).toISOString().slice(0, 10) === guide.updated,
		'updated must be a calendar date.'
	);
	string(guide.source, 'source');
	array(guide.quests, 'quests');
	assert(guide.quests.length > 0, 'quests cannot be empty.');
	const questIds = new Set();
	const stepIds = new Set();
	for (const quest of guide.quests) {
		object(quest, 'quest');
		integer(quest.id, 'quest.id', 1);
		assert(!questIds.has(quest.id), `duplicate quest ${quest.id}.`);
		questIds.add(quest.id);
		const context = `quest ${quest.id}`;
		assert(['main', 'sub'].includes(quest.type), `${context}.type is unsupported.`);
		string(quest.name, `${context}.name`);
		for (const field of ['chapter', 'order', 'level', 'ultraLevel']) {
			integer(quest[field], `${context}.${field}`);
		}
		strings(quest.requirements, `${context}.requirements`);
		array(quest.steps, `${context}.steps`);
		assert(quest.steps.length > 0, `${context} has no steps.`);
		for (const step of quest.steps) {
			object(step, `${context}.step`);
			integer(step.id, `${context}.step.id`, 1);
			assert(!stepIds.has(step.id), `duplicate step ${step.id}.`);
			stepIds.add(step.id);
			const label = `${context}, step ${step.id}`;
			for (const field of ['name', 'startNpc', 'startPlace', 'objective', 'endNpc', 'endPlace']) {
				string(step[field], `${label}.${field}`);
			}
			object(step.targets, `${label}.targets`);
			strings(step.targets.monsters, `${label}.targets.monsters`);
			items(step.targets.items, `${label}.targets.items`);
			array(step.targets.dungeons, `${label}.targets.dungeons`);
			for (const dungeon of step.targets.dungeons) {
				object(dungeon, `${label}.dungeon`);
				integer(dungeon.id, `${label}.dungeon.id`, 1);
				string(dungeon.name, `${label}.dungeon.name`);
				string(dungeon.entrance, `${label}.dungeon.entrance`);
				integer(dungeon.partySize, `${label}.dungeon.partySize`);
			}
			array(step.travel, `${label}.travel`);
			for (const route of step.travel) {
				object(route, `${label}.travel route`);
				string(route.destination, `${label}.travel.destination`);
				assert(['move', 'dungeon'].includes(route.method), `${label}.travel.method is unsupported.`);
				strings(route.steps, `${label}.travel.steps`);
			}
			strings(step.notes, `${label}.notes`);
			for (const field of ['grantedItems', 'consumedItems', 'rewardItems']) {
				items(step[field], `${label}.${field}`);
			}
		}
	}
	return { questCount: questIds.size, stepCount: stepIds.size };
}

export function createSnapshot(guide, generatedAt = new Date().toISOString()) {
	const counts = validateGuide(guide);
	return {
		...guide,
		schemaVersion: 1,
		sourceLanguage: 'ko',
		sourceUrl: SOURCE_PAGE,
		generatedAt,
		snapshot: {
			...counts,
			sha256: createHash('sha256').update(JSON.stringify(guide)).digest('hex')
		}
	};
}

/** Only the guide file is replaced; other tools' data and existing assets are untouched. */
export async function publishGuide(guide, outputDirectory = DEFAULT_OUTPUT) {
	const snapshot = createSnapshot(guide);
	const directory = resolve(outputDirectory);
	await mkdir(directory, { recursive: true });
	const temporaryFile = join(directory, `.index-${randomUUID()}.tmp`);
	try {
		await writeFile(temporaryFile, `${JSON.stringify(snapshot)}\n`, { flag: 'wx' });
		await rename(temporaryFile, join(directory, 'index.json'));
	} finally {
		await rm(temporaryFile, { force: true });
	}
	return snapshot;
}

export async function fetchSourcePage({ fetchImpl = fetch, sleep = (ms) => new Promise((done) => setTimeout(done, ms)) } = {}) {
	let lastError;
	for (let attempt = 1; attempt <= REQUEST_ATTEMPTS; attempt += 1) {
		let retryable = true;
		try {
			const response = await fetchImpl(SOURCE_PAGE, {
				signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
				headers: { 'User-Agent': 'latale-scenario-walkthrough-sync/1.0' }
			});
			if (response.ok) return await response.text();
			retryable = response.status === 429 || response.status >= 500;
			lastError = new Error(`Source page returned HTTP ${response.status}.`);
		} catch (error) {
			lastError = error;
		}
		if (!retryable || attempt === REQUEST_ATTEMPTS) break;
		await sleep(750 * 2 ** (attempt - 1));
	}
	throw lastError;
}

async function main(args) {
	if (args.includes('--help')) {
		console.log('Usage: node scripts/sync-scenarios.mjs [--output <directory>]');
		console.log('Imports the original Korean walkthrough to static/data/scenario/index.json.');
		return;
	}
	if (args.length && (args.length !== 2 || args[0] !== '--output' || !args[1])) {
		throw new Error('Expected --output <directory>, or no arguments for the site snapshot.');
	}
	const outputDirectory = args[1] ? resolve(args[1]) : DEFAULT_OUTPUT;
	console.log(`[scenario-sync] Reading ${SOURCE_PAGE}…`);
	const guide = extractGuideProps(await fetchSourcePage());
	// Review imports can contain new text; publishing must keep the English view complete.
	if (outputDirectory === DEFAULT_OUTPUT) {
		let translation;
		try {
			translation = JSON.parse(await readFile(join(DEFAULT_OUTPUT, 'en.json'), 'utf8'));
		} catch (error) {
			if (error.code !== 'ENOENT') throw error;
		}
		if (translation) {
			const missing = missingScenarioTranslations(guide.quests, translation.strings);
			if (missing.length) throw new Error(
				`${missing.length} new or changed strings need English translations. ` +
				'Use --output .cache/scenario-review to stage the source, update en.json, then publish again.'
			);
		}
	}
	const snapshot = await publishGuide(guide, outputDirectory);
	console.log(
		`[scenario-sync] Wrote ${snapshot.snapshot.questCount} quests and ${snapshot.snapshot.stepCount} steps ` +
			`(source updated ${snapshot.updated}) to ${join(outputDirectory, 'index.json')}.`
	);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	main(process.argv.slice(2)).catch((error) => {
		console.error('[scenario-sync] Failed:', error);
		process.exitCode = 1;
	});
}
