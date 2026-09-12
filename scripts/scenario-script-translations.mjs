import { createHash, randomUUID } from 'node:crypto';
import { readFile, mkdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const scriptDataRoot = path.resolve('static/data/scenario-script');
export const hasKorean = (text) => /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/u.test(text);
export const sourceHash = (story) => createHash('sha256').update(JSON.stringify(story)).digest('hex');
export const normalizeMetadata = (text) => text.replaceAll('\\\\n', '\n').replaceAll('\\n', '\n').replace(/\s+/gu, '');
export const playerTokens = (text) => (text.match(/%[sS]/g) ?? []).sort();
export const readJson = async (filename) => JSON.parse(await readFile(filename, 'utf8'));

async function publishJson(filename, value) {
	const temporary = `${filename}.${randomUUID()}.tmp`;
	try {
		await writeFile(temporary, `${JSON.stringify(value)}\n`);
		await rename(temporary, filename);
	} finally {
		await rm(temporary, { force: true });
	}
}

export function visitDialogue(story, callback) {
	function visitLines(lines, location) {
		lines.forEach((line, index) => {
			const linePath = `${location}/${index}`;
			callback(line.text, `${linePath}/text`, line, 'line');
			line.choices?.forEach((choice, choiceIndex) => {
				const choicePath = `${linePath}/choices/${choiceIndex}`;
				callback(choice.text, `${choicePath}/text`, choice, 'choice');
				visitLines(choice.lines, `${choicePath}/lines`);
			});
		});
	}
	story.steps.forEach((step, stepIndex) => step.scenes.forEach((scene, sceneIndex) => {
		visitLines(scene.lines, `/steps/${stepIndex}/scenes/${sceneIndex}/lines`);
	}));
}

export function untranslatedStrings(story, strings = {}) {
	const missing = new Set();
	visitDialogue(story, (text) => {
		if (hasKorean(text) && !Object.hasOwn(strings, text)) missing.add(text);
	});
	return [...missing];
}

export function assertTranslation(source, english, location) {
	if (typeof english !== 'string' || (source.trim() && !english.trim())) throw new Error(`${location}: empty translation`);
	if (hasKorean(english)) throw new Error(`${location}: untranslated Korean`);
	if (JSON.stringify(playerTokens(source)) !== JSON.stringify(playerTokens(english))) throw new Error(`${location}: player token mismatch`);
}

export async function loadTranslationContext(root = scriptDataRoot) {
	const [walkthrough, speakers] = await Promise.all([
		readJson(path.join(root, '../scenario/en.json')),
		readJson(path.join(root, 'speakers.json'))
	]);
	const metadata = new Map(Object.entries(walkthrough.strings).map(([source, english]) => [normalizeMetadata(source), english]));
	return { metadata, speakers: speakers.strings };
}

export function translateMetadata(source, context) {
	const english = context.metadata.get(normalizeMetadata(source));
	if (english !== undefined) return english;
	if (!hasKorean(source)) return source;
	throw new Error(`No current walkthrough translation for metadata: ${source}`);
}

export function assembleStory(source, catalog, context) {
	if (catalog.sourceSha256 !== sourceHash(source)) throw new Error(`Story ${source.id}: translation belongs to a different Korean source`);
	const missing = untranslatedStrings(source, catalog.strings);
	if (missing.length) throw new Error(`Story ${source.id}: ${missing.length} untranslated strings`);
	const story = structuredClone(source);
	story.originalName = source.name;
	story.name = translateMetadata(source.name, context);
	story.steps.forEach((step) => {
		step.originalName = step.name;
		step.name = translateMetadata(step.name, context);
		step.objective = translateMetadata(step.objective, context);
	});
	visitDialogue(story, (original, location, object, kind) => {
		const english = catalog.strings[original] ?? original;
		assertTranslation(original, english, `Story ${source.id}${location}`);
		object.text = english;
		if (kind === 'line') {
			object.speakerName = context.speakers[(object.speaker ?? '').trim()];
			if (object.speakerName === undefined) throw new Error(`Missing speaker label: ${object.speaker}`);
		}
	});
	story.translation = {
		language: 'en',
		sourceSha256: catalog.sourceSha256,
		translatedAt: catalog.translatedAt,
		method: 'Fresh translation from the current Korean source',
	};
	return story;
}

export async function assembleArchive(root = scriptDataRoot) {
	const [sourceIndex, context] = await Promise.all([readJson(path.join(root, 'ko/index.json')), loadTranslationContext(root)]);
	await mkdir(path.join(root, 'stories'), { recursive: true });
	const completeStoryIds = [];
	const incomplete = [];
	for (const metadata of sourceIndex.index) {
		const catalogFile = path.join(root, `translations/${metadata.id}.json`);
		let catalog;
		try { catalog = await readJson(catalogFile); } catch (error) {
			if (error.code !== 'ENOENT') throw error;
			incomplete.push({ id: metadata.id, reason: 'No translation catalog' });
			continue;
		}
		const source = await readJson(path.join(root, `ko/stories/${metadata.id}.json`));
		const missing = untranslatedStrings(source, catalog.strings);
		if (missing.length) {
			incomplete.push({ id: metadata.id, missing: missing.length });
			continue;
		}
		const english = assembleStory(source, catalog, context);
		completeStoryIds.push(metadata.id);
		await publishJson(path.join(root, `stories/${metadata.id}.json`), english);
	}
	const index = {
		...sourceIndex,
		index: sourceIndex.index.map((entry) => ({ ...entry, originalName: entry.name, name: translateMetadata(entry.name, context) })),
		chapters: { 1: 'Iris Livier', 2: 'An Unsettled World', 3: 'Deimos Saga', 4: 'Night of the Witch' },
		translation: {
			language: 'en',
			sourceSha256: sourceIndex.snapshot?.sha256 ?? null,
			method: 'Fresh translation from the current Korean source',
			metadataSource: 'Current English scenario walkthrough',
			completeStoryIds,
			complete: completeStoryIds.length === sourceIndex.index.length,
			note: 'Community English translation. Unverified names use consistent transliterations; this is not official Global localization.'
		}
	};
	await publishJson(path.join(root, 'index.json'), index);
	return { complete: completeStoryIds.length, total: sourceIndex.index.length, incomplete };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
	const result = await assembleArchive(scriptDataRoot);
	console.log(`Fresh English scenario scripts: ${result.complete}/${result.total} stories complete.`);
}
