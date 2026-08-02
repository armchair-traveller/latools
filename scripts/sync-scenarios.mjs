#!/usr/bin/env node

import { mkdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_ORIGIN = 'https://latale.wiki';
const SOURCE_PAGE = `${SOURCE_ORIGIN}/scenario-script`;
const TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const STATIC_DIR = join(ROOT, 'static');
const DATA_DIR = join(STATIC_DIR, 'data');
const NPC_DIR = join(STATIC_DIR, 'npc');
const REQUEST_RETRIES = 5;
const STORY_CONCURRENCY = 12;
const TRANSLATION_CONCURRENCY = 4;
const PORTRAIT_CONCURRENCY = 16;
const MAX_TRANSLATION_PAYLOAD = 4_400;

const manualTranslations = new Map(
	Object.entries({
		'이리스 리비에르': 'Iris Livier',
		'불안한 세계': 'An Unsettled World',
		'데이모스 사가': 'Deimos Saga',
		'마녀의 밤': 'Night of the Witch',
		'1. 모험의 시작': '1. The Adventure Begins',
		'여정의 시작': 'The Journey Begins',
		'꽃의 소녀': 'The Flower Girl',
		'데르의 활 (1)': "Der's Bow (1)",
		'데르의 활 (2)': "Der's Bow (2)",
		'안녕 무웬': 'Hello, Muwen',
		'가자, 엘리아스로': "Let's Go to Elias",
		'모험가': 'Adventurer',
		'아세스': 'Ases',
		'조에': 'Zoe',
		'조에.': 'Zoe',
		'무웬': 'Muwen',
		'무웬&조에': 'Muwen & Zoe',
		'이그나트': 'Ignate',
		'이리스': 'Iris',
		'야휘': 'Yahui',
		'인보크': 'Invoke',
		'엘리아스': 'Elias',
		'벨로스': 'Belos',
		'초엔 팜': 'Choen Palm',
		'카즈노': 'Kazno',
		'샤오위': 'Xiaowei',
		'라무아': 'Ramua',
		'으아아아아아, 바아아알드으으으리이이익!!': 'Aaaaaah, Baaaaaldriiiick!!',
		'???': '???',
		'????': '????',
		'▒▒▒': '▒▒▒',
		'%s': '%s'
	})
);

const protectedTerms = [
	['이리스 리비에르', 'Iris Livier'],
	['불안한 세계', 'An Unsettled World'],
	['데이모스 사가', 'Deimos Saga'],
	['마녀의 밤', 'Night of the Witch'],
	['초엔 팜', 'Choen Palm'],
	['모험가', 'Adventurer'],
	['아세스', 'Ases'],
	['이그나트', 'Ignate'],
	['카즈노', 'Kazno'],
	['샤오위', 'Xiaowei'],
	['라무아', 'Ramua'],
	['엘리아스', 'Elias'],
	['벨로스', 'Belos'],
	['세레스티아', 'Celestia'],
	['인보크', 'Invoke'],
	['이리스', 'Iris'],
	['무웬', 'Muwen'],
	['조에', 'Zoe'],
	['야휘', 'Yahui']
];

function log(message) {
	console.log(`[scenario-sync] ${message}`);
}

function sleep(milliseconds) {
	return new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
}

async function fetchWithRetry(url, options = {}, label = url) {
	let lastError;

	for (let attempt = 1; attempt <= REQUEST_RETRIES; attempt += 1) {
		try {
			const response = await fetch(url, {
				...options,
				headers: {
					'User-Agent': 'latale-scenario-script-sync/1.0',
					...options.headers
				}
			});

			if (response.ok) return response;
			lastError = new Error(`${label} returned HTTP ${response.status}`);
			if (response.status < 429 && response.status < 500) break;
		} catch (error) {
			lastError = error;
		}

		if (attempt < REQUEST_RETRIES) {
			await sleep(Math.min(750 * 2 ** (attempt - 1), 8_000));
		}
	}

	throw lastError ?? new Error(`${label} failed`);
}

async function mapConcurrent(items, concurrency, worker) {
	const results = new Array(items.length);
	let cursor = 0;

	async function runWorker() {
		while (cursor < items.length) {
			const index = cursor;
			cursor += 1;
			results[index] = await worker(items[index], index);
		}
	}

	await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runWorker));
	return results;
}

function findArchiveProps(value) {
	if (Array.isArray(value)) {
		for (const child of value) {
			const match = findArchiveProps(child);
			if (match) return match;
		}
		return null;
	}

	if (value && typeof value === 'object') {
		if (Array.isArray(value.index) && value.speakers && value.chapters) return value;
		for (const child of Object.values(value)) {
			const match = findArchiveProps(child);
			if (match) return match;
		}
	}

	return null;
}

function extractArchiveProps(html) {
	const payloadPattern = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)<\/script>/g;

	for (const match of html.matchAll(payloadPattern)) {
		let payload;
		try {
			payload = JSON.parse(`"${match[1]}"`);
		} catch {
			continue;
		}

		const separator = payload.indexOf(':');
		if (separator === -1 || !payload.includes('"index"') || !payload.includes('"speakers"')) continue;

		try {
			const tree = JSON.parse(payload.slice(separator + 1));
			const props = findArchiveProps(tree);
			if (props) return props;
		} catch {
			// Other flight chunks are not necessarily complete JSON trees.
		}
	}

	throw new Error('Could not find the scenario index in the source page.');
}

function addLineStrings(line, strings) {
	if (line.speaker) strings.add(line.speaker);
	if (line.text) strings.add(line.text);

	for (const choice of line.choices ?? []) {
		if (choice.text) strings.add(choice.text);
		for (const nestedLine of choice.lines ?? []) addLineStrings(nestedLine, strings);
	}
}

function collectStrings(props, stories) {
	const strings = new Set();
	for (const chapter of Object.values(props.chapters)) strings.add(chapter);
	for (const meta of props.index) strings.add(meta.name);
	for (const speaker of Object.keys(props.speakers)) if (speaker) strings.add(speaker);

	for (const story of stories) {
		strings.add(story.name);
		for (const step of story.steps) {
			strings.add(step.name);
			if (step.objective) strings.add(step.objective);
			for (const scene of step.scenes) {
				for (const line of scene.lines) addLineStrings(line, strings);
			}
		}
	}

	return [...strings];
}

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sourceTermCount(value, term) {
	return value.match(new RegExp(`(?<![가-힣])${escapeRegex(term)}`, 'g'))?.length ?? 0;
}

function protectText(value) {
	let protectedValue = value
		.replaceAll('__LATALE_', '__LATALE_LITERAL_')
		.replaceAll('\\n', '__LATALE_ESCAPED_BREAK__')
		.replaceAll('\n', '__LATALE_LINE_BREAK__')
		.replaceAll('%s', '__LATALE_PLAYER_NAME__');

	protectedTerms.forEach(([source], index) => {
		protectedValue = protectedValue.replace(
			new RegExp(`(?<![가-힣])${escapeRegex(source)}`, 'g'),
			`__LATALE_TERM_${index}__`
		);
	});

	return protectedValue;
}

function restoreText(value) {
	let restoredValue = value;
	protectedTerms.forEach(([, english], index) => {
		restoredValue = restoredValue.replaceAll(`__LATALE_TERM_${index}__`, english);
	});

	return restoredValue
		.replaceAll('__LATALE_PLAYER_NAME__', '%s')
		.replaceAll('__LATALE_LINE_BREAK__', '\n')
		.replaceAll('__LATALE_ESCAPED_BREAK__', '\\n')
		.replaceAll('__LATALE_LITERAL_', '__LATALE_')
		.trim();
}

function createTranslationBatches(strings) {
	const batches = [];
	let batch = [];
	let length = 0;

	for (const source of strings) {
		const protectedSource = protectText(source);
		const markerLength = `<<<L${batch.length}>>>\n`.length;
		const entryLength = markerLength + protectedSource.length + 1;

		if (batch.length && length + entryLength > MAX_TRANSLATION_PAYLOAD) {
			batches.push(batch);
			batch = [];
			length = 0;
		}

		batch.push({ source, protectedSource });
		length += `<<<L${batch.length - 1}>>>\n`.length + protectedSource.length + 1;
	}

	if (batch.length) batches.push(batch);
	return batches;
}

function decodeGoogleTranslation(payload) {
	if (!Array.isArray(payload?.[0])) throw new Error('Unexpected translation response.');
	return payload[0].map((part) => part?.[0] ?? '').join('');
}

function parseTranslatedBatch(output, expectedCount) {
	const parsed = new Map();
	const markerPattern = /<<<L(\d+)>>>\s*\n?([\s\S]*?)(?=\n?<<<L\d+>>>|$)/g;

	for (const match of output.matchAll(markerPattern)) {
		parsed.set(Number(match[1]), restoreText(match[2]));
	}

	if (parsed.size !== expectedCount) {
		throw new Error(`Translation markers were not preserved (${parsed.size}/${expectedCount}).`);
	}

	return parsed;
}

class PlayerTokenMismatchError extends Error {}
class ProtectedTermMismatchError extends Error {}

function playerTokenCount(value) {
	return value.match(/%s/g)?.length ?? 0;
}

function occurrenceCount(value, search) {
	return value.split(search).length - 1;
}

async function requestTranslation(batch) {
	const markedText = batch.map((entry, index) => `<<<L${index}>>>\n${entry.protectedSource}`).join('\n');
	const body = new URLSearchParams({
		client: 'gtx',
		sl: 'ko',
		tl: 'en',
		dt: 't',
		q: markedText
	});
	const response = await fetchWithRetry(
		TRANSLATE_URL,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
			body
		},
		'translation request'
	);
	const output = decodeGoogleTranslation(await response.json());
	return parseTranslatedBatch(output, batch.length);
}

function assertTranslationIntegrity(batch, translations) {
	for (const [index, value] of translations) {
		const source = batch[index].source;
		const sourceCount = playerTokenCount(source);
		const translatedCount = playerTokenCount(value);
		if (sourceCount !== translatedCount) {
			throw new PlayerTokenMismatchError(
				`Player-name token count changed (${sourceCount} to ${translatedCount}): ${source}`
			);
		}

		for (const [sourceTerm, englishTerm] of protectedTerms) {
			if (sourceTermCount(source, sourceTerm) && !occurrenceCount(value, englishTerm)) {
				throw new ProtectedTermMismatchError(
					`Protected term was lost (${sourceTerm} to ${englishTerm}): ${source}`
				);
			}
		}
	}
}

async function translateProtectedString(source) {
	const protectedLookup = new Map(protectedTerms);
	const splitPattern = new RegExp(
		`(%s|(?<![가-힣])(?:${protectedTerms
			.map(([sourceTerm]) => sourceTerm)
			.sort((a, b) => b.length - a.length)
			.map(escapeRegex)
			.join('|')}))`,
		'g'
	);
	const segments = source.split(splitPattern);
	const translatedSegments = [];

	for (const segment of segments) {
		if (segment === '%s') {
			translatedSegments.push(segment);
			continue;
		}

		if (protectedLookup.has(segment)) {
			translatedSegments.push(protectedLookup.get(segment));
			continue;
		}

		if (!segment || !/[가-힣]/.test(segment)) {
			translatedSegments.push(segment);
			continue;
		}

		const leadingWhitespace = segment.match(/^\s*/)?.[0] ?? '';
		const trailingWhitespace = segment.match(/\s*$/)?.[0] ?? '';
		const segmentEnd = trailingWhitespace ? -trailingWhitespace.length : undefined;
		const core = segment.slice(leadingWhitespace.length, segmentEnd);
		const batch = [{ source: core, protectedSource: protectText(core) }];
		const result = await requestTranslation(batch);
		translatedSegments.push(
			`${leadingWhitespace}${result.get(0) ?? core}${trailingWhitespace}`
		);
	}

	return translatedSegments.join('');
}

async function translateBatchSafely(batch) {
	try {
		const translations = await requestTranslation(batch);
		assertTranslationIntegrity(batch, translations);
		return translations;
	} catch (error) {
		if (batch.length === 1) {
			if (
				error instanceof PlayerTokenMismatchError ||
				error instanceof ProtectedTermMismatchError
			) {
				const fallback = new Map([[0, await translateProtectedString(batch[0].source)]]);
				assertTranslationIntegrity(batch, fallback);
				return fallback;
			}
			throw error;
		}

		const midpoint = Math.ceil(batch.length / 2);
		const leftBatch = batch.slice(0, midpoint);
		const rightBatch = batch.slice(midpoint);
		const [left, right] = await Promise.all([
			translateBatchSafely(leftBatch),
			translateBatchSafely(rightBatch)
		]);
		const merged = new Map();
		for (const [index, value] of left) merged.set(index, value);
		for (const [index, value] of right) merged.set(index + midpoint, value);
		return merged;
	}
}

async function translateStrings(strings) {
	const translations = new Map(manualTranslations);
	const pending = strings.filter((value) => {
		if (!value || translations.has(value)) return false;
		if (!/[가-힣]/.test(value)) {
			translations.set(value, value);
			return false;
		}
		return true;
	});
	const batches = createTranslationBatches(pending);
	let completed = 0;

	log(`Translating ${pending.length.toLocaleString('en-US')} unique strings in ${batches.length} batches…`);
	await mapConcurrent(batches, TRANSLATION_CONCURRENCY, async (batch) => {
		const translated = await translateBatchSafely(batch);
		for (const [index, value] of translated) {
			const source = batch[index].source;
			if (playerTokenCount(value) !== playerTokenCount(source)) {
				throw new Error(`Player-name token count changed while translating: ${source}`);
			}
			translations.set(source, value);
		}

		completed += 1;
		if (completed % 25 === 0 || completed === batches.length) {
			log(`Translated ${completed}/${batches.length} batches.`);
		}
	});

	for (const source of strings) {
		if (!translations.has(source)) translations.set(source, source);
	}

	return translations;
}

function translated(value, translations) {
	if (!value) return value;
	return translations.get(value) ?? value;
}

function translateLine(line, translations) {
	return {
		...line,
		speakerName: line.speaker ? translated(line.speaker, translations) : '',
		text: translated(line.text, translations),
		...(line.choices
			? {
					choices: line.choices.map((choice) => ({
						...choice,
						text: translated(choice.text, translations),
						lines: (choice.lines ?? []).map((nestedLine) => translateLine(nestedLine, translations))
					}))
				}
			: {})
	};
}

function translateStory(story, translations) {
	return {
		...story,
		name: translated(story.name, translations),
		steps: story.steps.map((step) => ({
			...step,
			name: translated(step.name, translations),
			objective: translated(step.objective, translations),
			scenes: step.scenes.map((scene) => ({
				...scene,
				lines: scene.lines.map((line) => translateLine(line, translations))
			}))
		}))
	};
}

async function pathExists(path) {
	try {
		return (await stat(path)).isFile();
	} catch {
		return false;
	}
}

async function downloadPortrait(id) {
	const destination = join(NPC_DIR, `${id}.png`);
	if (await pathExists(destination)) return false;
	const response = await fetchWithRetry(`${SOURCE_ORIGIN}/icons/npc/${id}.png`, {}, `portrait ${id}`);
	const bytes = Buffer.from(await response.arrayBuffer());
	if (!bytes.length) throw new Error(`Portrait ${id} was empty.`);
	await writeFile(destination, bytes);
	return true;
}

async function replaceDataDirectory(tempDirectory) {
	const backupDirectory = `${DATA_DIR}.previous`;
	await rm(backupDirectory, { recursive: true, force: true });

	try {
		await rename(DATA_DIR, backupDirectory);
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}

	try {
		await rename(tempDirectory, DATA_DIR);
		await rm(backupDirectory, { recursive: true, force: true });
	} catch (error) {
		try {
			await rename(backupDirectory, DATA_DIR);
		} catch {
			// Keep the original error; the generated temp directory remains inspectable.
		}
		throw error;
	}
}

async function main() {
	log(`Reading ${SOURCE_PAGE}…`);
	const pageResponse = await fetchWithRetry(SOURCE_PAGE, {}, 'source page');
	const props = extractArchiveProps(await pageResponse.text());
	log(`Found ${props.index.length} stories and ${Object.keys(props.speakers).length} speaker keys.`);

	let downloadedStories = 0;
	const stories = await mapConcurrent(props.index, STORY_CONCURRENCY, async (meta) => {
		const response = await fetchWithRetry(
			`${SOURCE_ORIGIN}/api/scenario-story/${meta.id}`,
			{},
			`story ${meta.id}`
		);
		const story = await response.json();
		downloadedStories += 1;
		if (downloadedStories % 20 === 0 || downloadedStories === props.index.length) {
			log(`Fetched ${downloadedStories}/${props.index.length} stories.`);
		}
		return story;
	});

	const translations = await translateStrings(collectStrings(props, stories));
	const translatedIndex = props.index.map((meta) => ({
		...meta,
		name: translated(meta.name, translations)
	}));
	const translatedChapters = Object.fromEntries(
		Object.entries(props.chapters).map(([chapter, name]) => [chapter, translated(name, translations)])
	);
	const translatedStories = stories.map((story) => translateStory(story, translations));

	const temporaryDataDirectory = join(STATIC_DIR, `.data-sync-${process.pid}`);
	const temporaryStoriesDirectory = join(temporaryDataDirectory, 'stories');
	await rm(temporaryDataDirectory, { recursive: true, force: true });
	await mkdir(temporaryStoriesDirectory, { recursive: true });
	const generatedAt = new Date().toISOString();
	await writeFile(
		join(temporaryDataDirectory, 'index.json'),
		JSON.stringify({
			index: translatedIndex,
			speakers: props.speakers,
			chapters: translatedChapters,
			generatedAt,
			sourceUrl: SOURCE_PAGE
		})
	);
	await Promise.all(
		translatedStories.map((story) =>
			writeFile(join(temporaryStoriesDirectory, `${story.id}.json`), JSON.stringify(story))
		)
	);
	await replaceDataDirectory(temporaryDataDirectory);
	log(`Wrote ${translatedStories.length} translated story files.`);

	await mkdir(NPC_DIR, { recursive: true });
	const portraitIds = [...new Set([...Object.values(props.speakers), 741])].sort((a, b) => a - b);
	let portraitProgress = 0;
	let newPortraits = 0;
	await mapConcurrent(portraitIds, PORTRAIT_CONCURRENCY, async (id) => {
		if (await downloadPortrait(id)) newPortraits += 1;
		portraitProgress += 1;
		if (portraitProgress % 50 === 0 || portraitProgress === portraitIds.length) {
			log(`Checked ${portraitProgress}/${portraitIds.length} portraits.`);
		}
	});

	log(
		`Complete: ${translatedIndex.length} stories, ${translatedIndex
			.reduce((total, item) => total + item.lineCount, 0)
			.toLocaleString('en-US')} lines, ${portraitIds.length} portraits (${newPortraits} downloaded).`
	);
}

main().catch((error) => {
	console.error('[scenario-sync] Failed:', error);
	process.exitCode = 1;
});
