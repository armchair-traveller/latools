export type StoryType = 'main' | 'sub';

export interface StoryMeta {
	id: number;
	type: StoryType;
	chapter: number;
	order: number;
	name: string;
	level: number;
	stepCount: number;
	lineCount: number;
}

export interface DialogueChoice {
	text: string;
	goto: number;
	lines?: DialogueLine[];
}

export interface DialogueLine {
	id: number;
	speaker?: string;
	speakerName?: string;
	text: string;
	choices?: DialogueChoice[];
}

export interface StoryScene {
	id: number;
	lines: DialogueLine[];
}

export interface StoryStep {
	id: number;
	name: string;
	objective?: string;
	scenes: StoryScene[];
}

export interface Story {
	id: number;
	name: string;
	type: StoryType;
	chapter: number;
	order: number;
	source: string;
	updated: string;
	steps: StoryStep[];
}

export interface ArchiveIndex {
	index: StoryMeta[];
	speakers: Record<string, number>;
	chapters: Record<string, string>;
	generatedAt?: string;
	sourceUrl?: string;
}

export type RenderEntry =
	| { kind: 'line'; line: DialogueLine; id: string }
	| { kind: 'choice'; text: string; id: string }
	| { kind: 'repeated'; id: string };

export interface ExchangeCatalogItem {
	id: string;
	name: string | null;
	referenceIcon: string;
	unitEly: number | null;
	priceUpdatedAt: string | null;
}

export interface ExchangeCatalog {
	items: ExchangeCatalogItem[];
}

export interface ExchangeOffer {
	slot: number;
	itemId: string;
	icon: string;
	quantity: number;
	pointCost: number;
	accountLimit: number | null;
}

export interface ExchangeStage {
	number: number;
	missingSlots: number[];
	offers: ExchangeOffer[];
}

export interface ExchangeEvent {
	id: string;
	title: string;
	startDate: string;
	endDate: string;
	reviewedAt: string;
	region: string;
	source: string;
	expectedOfferCount: number;
	stages: ExchangeStage[];
}

export interface RankedExchangeOffer extends ExchangeOffer {
	stage: number;
	item: ExchangeCatalogItem;
	bundleEly: number;
	elyPerPoint: number;
}

export interface UnpricedExchangeOffer extends ExchangeOffer {
	stage: number;
	item: ExchangeCatalogItem;
}

export interface ExchangeCompleteness {
	captured: number;
	missing: number;
	total: number;
}
