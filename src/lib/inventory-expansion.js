export const inventoryStorageKey = 'latools:inventory-expansion:v1';

export const inventorySources = [
	{ id: 'guide', label: 'Guidebook', description: 'Start here. Complete the guidebook to earn bags for every inventory and your storage.' },
	{ id: 'story', label: 'Story quests', description: 'Collect expansion bags as you progress through the story.' },
	{ id: 'dungeon', label: 'Dungeon quests', description: 'Visit these quest givers and clear their dungeon objectives.' },
	{ id: 'burning', label: 'Burning 4000', description: 'Follow the 18 reward stages. Check that Burning 4000 is available on your server.' },
	{ id: 'limited', label: 'Limited-time', description: 'Event rewards may have ended. Check availability on your server before starting.' }
];

export const inventoryTypes = [
	{ id: 'equipment', label: 'Equipment', cap: 240 },
	{ id: 'consumables', label: 'Consumables', cap: 240 },
	{ id: 'etc', label: 'Etc.', cap: 240 },
	{ id: 'event', label: 'Event', cap: 240 },
	{ id: 'storage', label: 'Storage', cap: 480 }
];

export const bagLabels = {
	all: 'All-in-one', equipment: 'Equipment', consumables: 'Consumables',
	etc: 'Etc.', event: 'Event', storage: 'Storage'
};

/** Reward potential, before inventory caps: an all-in-one bag adds four slots to each character inventory. */
export function totalInventorySlots(entries) {
	const totals = { equipment: 0, consumables: 0, etc: 0, event: 0, storage: 0 };
	for (const entry of entries) {
		for (const { id } of inventoryTypes) {
			totals[id] += 4 * ((entry.rewards[id] ?? 0) + (id === 'storage' ? 0 : (entry.rewards.all ?? 0)));
		}
	}
	return totals;
}

export function filterInventoryEntries(entries, { source, query = '', hideCompleted = false, completed = [] } = {}) {
	const checked = new Set(completed);
	const terms = query.normalize('NFKC').toLocaleLowerCase('en-US').trim().split(/\s+/).filter(Boolean);
	return entries.filter((entry) => {
		if (source && entry.source !== source) return false;
		if (hideCompleted && checked.has(entry.id)) return false;
		const searchable = [entry.title, entry.originalTitle, entry.location, entry.originalLocation,
			entry.level, entry.note, ...Object.keys(entry.rewards).map((type) => bagLabels[type])]
			.filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase('en-US');
		return terms.every((term) => searchable.includes(term));
	});
}

/** Ignore stale IDs and malformed browser data instead of breaking the checklist. */
export function readInventoryProgress(value, entries) {
	try {
		const stored = JSON.parse(value ?? 'null');
		if (stored?.version !== 1 || !Array.isArray(stored.completed)) return [];
		const valid = new Set(entries.map((entry) => entry.id));
		return [...new Set(stored.completed.filter((id) => typeof id === 'string' && valid.has(id)))];
	} catch {
		return [];
	}
}
