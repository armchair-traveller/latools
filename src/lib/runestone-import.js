import { MAX_RUNESTONE_SLOTS, RUNESTONE_RUNES } from './runestone.js';

const runeIds = new Set(RUNESTONE_RUNES.map((rune) => rune.id));

/** Imports must be complete. Never compact a partial reading into the doubled slot. */
export function validateRunestoneImport(ids) {
	if (!Array.isArray(ids) || ids.length !== MAX_RUNESTONE_SLOTS) return null;
	if (new Set(ids).size !== MAX_RUNESTONE_SLOTS || !ids.every((id) => runeIds.has(id))) return null;
	// Detection supplies the seven outer runes followed by the center rune.
	return [...ids];
}
