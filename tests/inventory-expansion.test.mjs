import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
	filterInventoryEntries,
	readInventoryProgress,
	totalInventorySlots
} from '../src/lib/inventory-expansion.js';

const snapshot = JSON.parse(await readFile(new URL('../src/lib/data/inventory-expansion.json', import.meta.url), 'utf8'));
const { entries } = snapshot;
const bySource = (source) => entries.filter((entry) => entry.source === source);
const byId = (id) => entries.find((entry) => entry.id === id);
const ids = (rows) => rows.map((entry) => entry.id);
const numberedIds = (prefix, count, start = 0) => Array.from({ length: count }, (_, index) => `${prefix}-${index + start}`);

test('translated snapshot retains all 137 original source IDs and reward counts', () => {
	assert.equal(snapshot.sourceUrl, 'https://latale.wiki/inventory-expansion');
	assert.equal(snapshot.sourceUpdatedAt, '2026-07-27');
	assert.equal(entries.length, 137);
	assert.equal(new Set(ids(entries)).size, 137);
	assert.deepEqual(ids(bySource('guide')), [
		...numberedIds('guide-all', 6),
		...numberedIds('guide-equip', 14),
		...numberedIds('guide-use', 15),
		...numberedIds('guide-etc', 15),
		...numberedIds('guide-event', 15),
		...numberedIds('guide-storage', 4)
	]);
	assert.deepEqual(ids(bySource('story')), numberedIds('story', 11));
	assert.deepEqual(ids(bySource('dungeon')), [...numberedIds('dungeon', 24), 'dungeon-home', 'dungeon-despair']);
	assert.deepEqual(ids(bySource('burning')), numberedIds('burning', 18, 1));
	assert.deepEqual(ids(bySource('limited')), numberedIds('limited', 13));

	// Independently counted from the Korean source; these are bag counts, not slots.
	const expectedRewards = {
		guide: { all: 7, equipment: 14, consumables: 15, etc: 15, event: 15, storage: 4 },
		story: { all: 3, equipment: 1, consumables: 1, etc: 1, event: 2, storage: 5 },
		dungeon: { equipment: 5, consumables: 5, etc: 8, event: 10 },
		burning: { all: 2, equipment: 4, consumables: 4, etc: 4, event: 4 },
		limited: { all: 17, equipment: 5, event: 5, storage: 1 }
	};
	for (const [source, expected] of Object.entries(expectedRewards)) {
		const actual = {};
		for (const entry of bySource(source)) {
			for (const [type, amount] of Object.entries(entry.rewards)) {
				assert.ok(Number.isInteger(amount) && amount > 0, `${entry.id}: ${type}`);
				actual[type] = (actual[type] ?? 0) + amount;
			}
		}
		assert.deepEqual(actual, expected, source);
	}
});

test('English display fields are fully translated while preserving Korean search references', () => {
	for (const entry of entries) {
		assert.ok(entry.title.trim(), entry.id);
		assert.ok(entry.originalTitle.trim(), entry.id);
		for (const field of ['title', 'location', 'level', 'note']) {
			assert.equal(/[가-힣]/u.test(entry[field] ?? ''), false, `${entry.id}: ${field}`);
		}
		if (entry.location) assert.ok(entry.originalLocation, entry.id);
	}
	assert.equal(byId('guide-all-2').originalTitle, '전직: 1차 전직하기 [Lv.50]');
	assert.equal(byId('guide-all-2').level, 'Lv. 50');
	assert.equal(byId('guide-equip-13').level, 'ULv. 500');
	assert.equal(byId('story-4').originalLocation, '오로라의 숲 · 플라리');
	assert.equal(byId('burning-18').level, 'Stage 18');
	assert.ok(bySource('limited').every((entry) => entry.note?.includes('may have ended')));
});

test('guidebook rewards provide 84 equipment, 88 other inventory and 16 storage slots', () => {
	assert.deepEqual(totalInventorySlots(bySource('guide')), {
		equipment: 84, consumables: 88, etc: 88, event: 88, storage: 16
	});
});

test('all 18 Burning stages provide 24 slots per character inventory and no storage', () => {
	assert.deepEqual(totalInventorySlots(bySource('burning')), {
		equipment: 24, consumables: 24, etc: 24, event: 24, storage: 0
	});
});

test('all-in-one bags expand four character inventories, never storage', () => {
	assert.deepEqual(byId('guide-all-5').rewards, { all: 2 });
	assert.deepEqual(totalInventorySlots([byId('guide-all-5')]), {
		equipment: 8, consumables: 8, etc: 8, event: 8, storage: 0
	});
	assert.deepEqual(totalInventorySlots([byId('guide-all-5'), byId('story-0')]), {
		equipment: 8, consumables: 8, etc: 8, event: 8, storage: 4
	});
	assert.deepEqual(totalInventorySlots([]), {
		equipment: 0, consumables: 0, etc: 0, event: 0, storage: 0
	});
});

test('mixed story and dungeon rewards retain every category without treating them as all-in-one', () => {
	assert.deepEqual(byId('story-10').rewards, { equipment: 1, consumables: 1, etc: 1 });
	for (const id of ['dungeon-home', 'dungeon-despair']) {
		assert.deepEqual(byId(id).rewards, { etc: 1, event: 1 });
	}
	assert.deepEqual(totalInventorySlots([byId('story-10'), byId('dungeon-home'), byId('dungeon-despair')]), {
		equipment: 4, consumables: 4, etc: 12, event: 8, storage: 0
	});
	assert.deepEqual(totalInventorySlots(bySource('story')), {
		equipment: 16, consumables: 16, etc: 16, event: 20, storage: 20
	});
	assert.deepEqual(totalInventorySlots(bySource('dungeon')), {
		equipment: 20, consumables: 20, etc: 32, event: 40, storage: 0
	});
});

test('search combines English, Korean, location and multiple words regardless of case or spacing', () => {
	for (const query of ['Aurora Flari', '오로라 플라리', 'AURORA 플라리', '  ＡＵＲＯＲＡ  \n Flari  ']) {
		assert.deepEqual(ids(filterInventoryEntries(entries, { source: 'story', query })), ['story-4', 'story-5'], query);
	}
	assert.deepEqual(ids(filterInventoryEntries(entries, { query: 'ULv. 500 Equipment' })), ['guide-equip-13']);
	assert.deepEqual(filterInventoryEntries(entries, { query: 'Aurora nonexistingquest' }), []);
	assert.deepEqual(filterInventoryEntries(entries, { query: ' \n\t ' }), entries);
});

test('source, reward search and hide-completed filters work together without hiding unchecked duplicates', () => {
	assert.deepEqual(ids(filterInventoryEntries(entries, { source: 'guide', query: 'NPC equipment' })), ['guide-equip-1']);
	assert.deepEqual(ids(filterInventoryEntries(entries, { source: 'guide', query: 'NPC consumables' })), ['guide-use-0']);
	assert.deepEqual(ids(filterInventoryEntries(entries, { source: 'story', query: 'storage' })), [
		'story-0', 'story-1', 'story-2', 'story-3', 'story-6'
	]);
	const options = { source: 'story', query: 'Aurora', completed: ['story-4', 'stale-id'] };
	assert.deepEqual(ids(filterInventoryEntries(entries, options)), ['story-4', 'story-5']);
	assert.deepEqual(ids(filterInventoryEntries(entries, { ...options, hideCompleted: true })), ['story-5']);
	assert.deepEqual(filterInventoryEntries(entries, {
		source: 'burning', hideCompleted: true, completed: ids(bySource('burning'))
	}), []);
	assert.deepEqual(filterInventoryEntries(entries, { source: 'unknown-source' }), []);
});

test('malformed or unsupported saved progress safely starts with an empty checklist', () => {
	for (const stored of [undefined, null, '', '{', 'null', '[]', '42', '"text"', '{}',
		'{"version":2,"completed":["story-0"]}', '{"version":"1","completed":["story-0"]}',
		'{"version":1,"completed":"story-0"}', '{"version":1,"completed":null}']) {
		assert.deepEqual(readInventoryProgress(stored, entries), [], String(stored));
	}
});

test('saved progress rejects stale and non-string IDs and deduplicates valid entries', () => {
	const stored = JSON.stringify({ version: 1, completed: [
		'story-0', 'guide-all-5', 'story-0', 'removed-quest', '', 0, null, {}, ['story-1'],
		'dungeon-home', 'guide-all-5'
	] });
	assert.deepEqual(readInventoryProgress(stored, entries), ['story-0', 'guide-all-5', 'dungeon-home']);
	assert.deepEqual(readInventoryProgress(stored, []), []);
	assert.deepEqual(readInventoryProgress('{"version":1,"completed":[]}', entries), []);
});
