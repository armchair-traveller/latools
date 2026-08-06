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

export type ExchangeValuation = 'priced' | 'unique' | 'pending';

interface ExchangeCatalogItemBase {
	id: string;
	name: string | null;
	referenceIcon: string;
}

export type ExchangeCatalogItem =
	| (ExchangeCatalogItemBase & {
			valuation: 'priced';
			unitEly: number;
			priceUpdatedAt: string;
	  })
	| (ExchangeCatalogItemBase & {
			valuation: 'unique' | 'pending';
			unitEly: null;
			priceUpdatedAt: null;
	  });

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
	item: Extract<ExchangeCatalogItem, { valuation: 'priced' }>;
	bundleEly: number;
	elyPerPoint: number;
}

export interface UnrankedExchangeOffer extends ExchangeOffer {
	stage: number;
	item: Exclude<ExchangeCatalogItem, { valuation: 'priced' }>;
}

/** @deprecated Use UnrankedExchangeOffer. */
export type UnpricedExchangeOffer = UnrankedExchangeOffer;

export interface ExchangeCompleteness {
	captured: number;
	missing: number;
	total: number;
}

export type FlashSaleConfidence = 'high' | 'medium' | 'low';
export type FlashSaleValuationStatus = 'priced' | 'estimated' | 'unique' | 'pending';
export type FlashSaleValuationMethod =
	| 'market-observation'
	| 'maintainer-estimate'
	| 'historical-comparison'
	| 'not-applicable'
	| 'pending';

export interface FlashSaleSource {
	id: string;
	kind: 'official-sale' | 'official-guide' | 'historical-sale' | 'market-observation';
	title: string;
	url: string;
	accessedAt: string;
	note: string;
}

export interface FlashSaleValuation {
	status: FlashSaleValuationStatus;
	unitEly: number | null;
	method: FlashSaleValuationMethod;
	confidence: FlashSaleConfidence | null;
	asOf: string | null;
	sourceIds: string[];
	note: string;
}

export interface FlashSaleCatalogItem {
	id: string;
	name: string;
	aliases: string[];
	valuation: FlashSaleValuation;
}

export interface FlashSaleCatalog {
	schemaVersion: 1;
	sources: FlashSaleSource[];
	items: FlashSaleCatalogItem[];
}

export interface FlashSaleIndexEntry {
	id: string;
	title: string;
	startsAt: string;
	endsAt: string;
	reviewedAt: string;
}

export interface FlashSaleIndex {
	schemaVersion: 1;
	currentSaleId: string;
	sales: FlashSaleIndexEntry[];
}

export interface FlashSaleValuationSnapshot extends FlashSaleValuation {
	itemId: string;
}

export interface FlashSaleOfferContent {
	itemId: string;
	quantity: number;
}

export interface FlashSaleOffer {
	id: string;
	slot: number;
	name: string;
	salePriceLtc: number;
	purchaseLimit: {
		quantity: number;
		scope: 'account' | 'character' | 'unknown';
	} | null;
	contents: FlashSaleOfferContent[];
	capture: {
		status: 'verified' | 'uncertain';
		sourceIds: string[];
		note: string;
	};
	bestFor: string;
	skipIf: string;
	caveats: string[];
}

export interface FlashSaleCycle {
	id: string;
	label: string;
	startsAt: string;
	endsAt: string;
	expectedOfferCount: number;
	unresolvedSlots: number[];
	offers: FlashSaleOffer[];
}

export interface FlashSaleAnalysis {
	schemaVersion: 1;
	id: string;
	postId: number;
	title: string;
	region: 'NA';
	currency: 'LTC';
	timezone: 'America/New_York';
	sourceUrl: string;
	publishedAt: string;
	analyzedAt: string;
	reviewedAt: string;
	status: 'published';
	sourceFingerprint: string;
	posterUrls: string[];
	expectedOfferCount: number;
	sources: FlashSaleSource[];
	valuationSnapshot: FlashSaleValuationSnapshot[];
	cycles: FlashSaleCycle[];
}

export interface EvaluatedFlashSaleComponent extends FlashSaleOfferContent {
	item: FlashSaleCatalogItem;
	valuation: FlashSaleValuationSnapshot;
	componentEly: number | null;
}

export interface EvaluatedFlashSaleOffer extends FlashSaleOffer {
	cycleId: string;
	components: EvaluatedFlashSaleComponent[];
	knownBundleEly: number;
	bundleEly: number | null;
	elyPerLtc: number | null;
	lowerBoundElyPerLtc: number | null;
	valuationState: 'exact' | 'partial' | 'unranked';
	confidence: FlashSaleConfidence | null;
	rank: number | null;
}

export interface FlashSaleCompleteness {
	captured: number;
	unresolved: number;
	total: number;
	fullyValued: number;
	partiallyValued: number;
	unranked: number;
}
