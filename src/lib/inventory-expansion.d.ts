export type InventorySource = 'guide' | 'story' | 'dungeon' | 'burning' | 'limited';
export type InventoryType = 'equipment' | 'consumables' | 'etc' | 'event' | 'storage';
export type BagType = InventoryType | 'all';
export type SlotTotals = Record<InventoryType, number>;
export interface InventoryEntry {
	id: string;
	source: InventorySource;
	title: string;
	originalTitle: string;
	location?: string;
	originalLocation?: string;
	level?: string;
	note?: string;
	rewards: Partial<Record<BagType, number>>;
}
export const inventorySources: { id: InventorySource; label: string; description: string }[];
export const inventoryTypes: { id: InventoryType; label: string; cap: number }[];
export const bagLabels: Record<BagType, string>;
export const inventoryStorageKey: string;
export function totalInventorySlots(entries: InventoryEntry[]): SlotTotals;
export function filterInventoryEntries(entries: InventoryEntry[], options?: {
	source?: InventorySource;
	query?: string;
	hideCompleted?: boolean;
	completed?: string[];
}): InventoryEntry[];
export function readInventoryProgress(value: string | null, entries: InventoryEntry[]): string[];
