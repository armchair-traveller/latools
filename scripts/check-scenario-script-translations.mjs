import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, scriptDataRoot, loadTranslationContext, assembleStory, untranslatedStrings, sourceHash, translateMetadata } from './scenario-script-translations.mjs';

export async function checkScenarioScriptTranslations(root = scriptDataRoot, { allowPartial = false } = {}) {
	const [sourceIndex, index, context] = await Promise.all([
		readJson(path.join(root, 'ko/index.json')),
		readJson(path.join(root, 'index.json')),
		loadTranslationContext(root)
	]);
	assert.deepEqual(index.index.map((entry) => entry.id), sourceIndex.index.map((entry) => entry.id), 'English index must preserve current source ordering');
	assert.equal(index.translation.sourceSha256, sourceIndex.snapshot?.sha256 ?? null, 'English index refers to stale Korean source');
	const completed = [];
	const missing = [];
	let lines = 0;
	for (let position = 0; position < sourceIndex.index.length; position++) {
		const original = sourceIndex.index[position];
		const metadata = index.index[position];
		assert.deepEqual(metadata, { ...original, originalName: original.name, name: translateMetadata(original.name, context) }, `Story ${original.id}: metadata differs from source`);
		let catalog;
		try { catalog = await readJson(path.join(root, `translations/${original.id}.json`)); } catch (error) {
			if (error.code !== 'ENOENT') throw error;
			missing.push(original.id);
			continue;
		}
		const source = await readJson(path.join(root, `ko/stories/${original.id}.json`));
		assert.equal(catalog.schemaVersion, 1);
		assert.equal(catalog.language, 'en');
		assert.equal(catalog.sourceSha256, sourceHash(source), `Story ${original.id}: source checksum changed`);
		assert.ok(Number.isFinite(Date.parse(catalog.translatedAt)), `Story ${original.id}: missing translation date`);
		if (untranslatedStrings(source, catalog.strings).length) {
			missing.push(original.id);
			continue;
		}
		const english = await readJson(path.join(root, `stories/${original.id}.json`));
		// Regeneration checks every tree path, including repeated IDs and nested choices.
		assert.deepEqual(english, assembleStory(source, catalog, context), `Story ${original.id}: published English does not match its source and fresh catalog`);
		completed.push(original.id);
		lines += original.lineCount;
	}
	assert.deepEqual(index.translation.completeStoryIds, completed, 'Index translation availability is stale');
	assert.equal(index.translation.complete, missing.length === 0, 'Index incorrectly claims complete translation');
	if (!allowPartial) assert.equal(missing.length, 0, `${missing.length} stories still need fresh English translation`);
	return { stories: completed.length, lines, missing };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
	const result = await checkScenarioScriptTranslations(scriptDataRoot, { allowPartial: process.argv.includes('--allow-partial') });
	console.log(`Checked ${result.stories} fresh English stories (${result.lines.toLocaleString()} dialogue lines); ${result.missing.length} stories await translation.`);
}
