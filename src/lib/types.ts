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

export type DungeonEarningsDifficulty = 'D4' | 'D5';
export type DungeonEarningsRewardRoute = 'market' | 'service' | 'pending';
export type DungeonEarningsPriceKind = 'market' | 'service' | 'cost' | 'buff';
export type DungeonEarningsPriceSource = 'snapshot' | 'override' | 'fixed' | 'derived' | null;

export interface DungeonEarningsSource {
	id: string;
	kind: 'dungeon-guide' | 'buff-guide' | 'maintainer-input' | 'market-observation';
	title: string;
	url: string | null;
	accessedAt: string;
	note: string;
}

export interface DungeonEarningsRewardItem {
	id: string;
	name: string;
	route: DungeonEarningsRewardRoute;
	marketPriceItemId?: string;
	marketConversionCostPerUnitEly?: number;
	icon: string | null;
	sourceIds: string[];
}

export interface DungeonEarningsServiceRecipeInput {
	itemId: string;
	quantity: number;
}

export interface DungeonEarningsServiceRecipe {
	id: string;
	name: string;
	inputs: DungeonEarningsServiceRecipeInput[];
	providerElyCostEly: number;
	customerPriceItemId: string;
	customerSuppliedSealLocks: number;
	customerSuppliedEquipment: boolean;
	sourceIds: string[];
	note: string;
	status: 'confirmed' | 'provisional';
}

export type DungeonEarningsExpectedYield =
	| { status: 'known'; expectedPerClear: number; note: string }
	| { status: 'pending'; expectedPerClear: null; note: string };

export interface DungeonEarningsRewardProfileEntry {
	itemId: string;
	yield: DungeonEarningsExpectedYield;
	d5BonusEligible: boolean | null;
}

export interface DungeonEarningsDifficultyProfile {
	rewards: DungeonEarningsRewardProfileEntry[];
	serviceStrategyIds: string[];
}

export interface DungeonEarningsRequirement {
	kind: 'ascension' | 'super-level';
	value: number;
	label: string;
}

export interface DungeonEarningsDungeon {
	id: string;
	name: string;
	requirement: DungeonEarningsRequirement;
	image: string;
	sourceIds: string[];
	difficulties: Record<DungeonEarningsDifficulty, DungeonEarningsDifficultyProfile>;
}

export interface DungeonEarningsBuff {
	id: string;
	name: string;
	description: string;
	durationSeconds: number;
	consumablesPerActivation: number;
	priceMode: 'fixed-zero' | 'snapshot';
	priceEditable: boolean;
	priceItemId: string | null;
	alternativePrice?: {
		priceItemId: string;
		quantity: number;
	};
	standardPreset: boolean;
	exclusivityGroup: string | null;
	icon: string;
	sourceIds: string[];
}

export interface DungeonEarningsCatalog {
	schemaVersion: 1;
	id: string;
	updatedAt: string;
	market: {
		id: 'papayaplay-na';
		label: string;
		region: 'Global';
		feeRate: number;
		currency: 'Ely';
	};
	d5MaterialBonusRate: number;
	sources: DungeonEarningsSource[];
	rewardItems: DungeonEarningsRewardItem[];
	serviceRecipes: DungeonEarningsServiceRecipe[];
	dungeons: DungeonEarningsDungeon[];
	buffs: DungeonEarningsBuff[];
}

interface DungeonEarningsSnapshotPriceBase {
	itemId: string;
	kind: DungeonEarningsPriceKind;
	sourceIds: string[];
	note: string;
}

export type DungeonEarningsSnapshotPrice =
	| (DungeonEarningsSnapshotPriceBase & {
			status: 'priced';
			unitEly: number;
			asOf: string;
	  })
	| (DungeonEarningsSnapshotPriceBase & {
			status: 'pending';
			unitEly: null;
			asOf: null;
	  });

export interface DungeonEarningsSnapshot {
	schemaVersion: 1;
	id: string;
	marketId: 'papayaplay-na';
	currency: 'Ely';
	asOf: string;
	reviewedAt: string;
	sources: DungeonEarningsSource[];
	prices: DungeonEarningsSnapshotPrice[];
}

export interface DungeonEarningsSnapshotIndexEntry {
	id: string;
	asOf: string;
	marketId: 'papayaplay-na';
	path: string;
}

export interface DungeonEarningsIndex {
	schemaVersion: 1;
	currentSnapshotId: string;
	snapshots: DungeonEarningsSnapshotIndexEntry[];
}

export type DungeonEarningsPriceOverrides = Record<string, number>;

export interface DungeonEarningsEstimateInput {
	catalog: DungeonEarningsCatalog;
	snapshot: DungeonEarningsSnapshot;
	dungeonId: string;
	difficulty: DungeonEarningsDifficulty;
	clearTimeSeconds: number;
	selectedBuffIds?: string[];
	priceOverrides?: DungeonEarningsPriceOverrides;
}

export interface DungeonEarningsServiceStrategyInputRow {
	itemId: string;
	name: string;
	quantityPerService: number;
	availableBeforePerClear: number | null;
	consumedPerClear: number | null;
	remainingAfterPerClear: number | null;
}

interface DungeonEarningsRewardRowBase {
	itemId: string;
	name: string;
	icon: string | null;
	baseExpectedPerClear: number | null;
	bonusRate: number;
	effectiveExpectedPerClear: number | null;
	allocatedToServicesPerClear: number | null;
	remainingAfterServicesPerClear: number | null;
	missingMechanicIds: string[];
	missingPriceIds: string[];
}

export interface DungeonEarningsMarketRewardRow extends DungeonEarningsRewardRowBase {
	route: 'market';
	priceItemId: string;
	unitPriceEly: number | null;
	priceSource: DungeonEarningsPriceSource;
	conversionCostPerUnitEly: number;
	grossPerClearEly: number | null;
	marketFeePerClearEly: number | null;
	conversionCostPerClearEly: number | null;
	netPerClearEly: number | null;
	netPerHourEly: number | null;
	serviceFirstGrossPerClearEly: number | null;
	serviceFirstMarketFeePerClearEly: number | null;
	serviceFirstConversionCostPerClearEly: number | null;
	serviceFirstNetPerClearEly: number | null;
	serviceFirstNetPerHourEly: number | null;
}

export interface DungeonEarningsServiceRewardRow extends DungeonEarningsRewardRowBase {
	route: 'service';
}

export interface DungeonEarningsPendingRewardRow extends DungeonEarningsRewardRowBase {
	route: 'pending';
}

export type DungeonEarningsRewardRow =
	| DungeonEarningsMarketRewardRow
	| DungeonEarningsServiceRewardRow
	| DungeonEarningsPendingRewardRow;

export interface DungeonEarningsServiceStrategyRow {
	strategyId: string;
	name: string;
	status: 'confirmed' | 'provisional';
	note: string;
	sourceIds: string[];
	inputs: DungeonEarningsServiceStrategyInputRow[];
	servicesPerClear: number | null;
	customerPriceItemId: string;
	customerPricePerServiceEly: number | null;
	priceSource: DungeonEarningsPriceSource;
	providerElyCostPerServiceEly: number;
	customerSuppliedSealLocks: number;
	customerSuppliedEquipment: boolean;
	grossPerClearEly: number | null;
	providerCostPerClearEly: number | null;
	netPerClearEly: number | null;
	netPerHourEly: number | null;
	missingMechanicIds: string[];
	missingPriceIds: string[];
}

export interface DungeonEarningsBuffRow {
	buffId: string;
	name: string;
	description: string;
	icon: string;
	durationSeconds: number;
	consumablesPerActivation: number;
	priceMode: 'fixed-zero' | 'snapshot';
	priceEditable: boolean;
	priceItemId: string | null;
	unitPriceEly: number | null;
	priceSource: DungeonEarningsPriceSource;
	directUnitPriceEly: number | null;
	directPriceSource: DungeonEarningsPriceSource;
	alternativePriceItemId: string | null;
	alternativePriceQuantity: number | null;
	alternativeUnitPriceEly: number | null;
	alternativeCostEly: number | null;
	alternativePriceSource: DungeonEarningsPriceSource;
	chosenPricePath: 'direct' | 'alternative' | null;
	costPerHourEly: number | null;
}

export interface DungeonEarningsPerClearTotals {
	marketGrossEly: number;
	marketFeeEly: number;
	marketConversionCostEly: number;
	marketNetEly: number;
	serviceFirstMarketGrossEly: number;
	serviceFirstMarketFeeEly: number;
	serviceFirstMarketConversionCostEly: number;
	serviceFirstMarketNetEly: number;
	serviceGrossEly: number;
	serviceProviderCostEly: number;
	serviceTransferCostEly: number;
	serviceRawNetEly: number;
	serviceCountedNetEly: number;
	totalGrossEly: number;
	totalRewardProceedsEly: number;
}

export interface DungeonEarningsPerHourTotals {
	marketGrossEly: number;
	marketFeeEly: number;
	marketConversionCostEly: number;
	marketNetBeforeBuffsEly: number;
	serviceFirstMarketGrossEly: number;
	serviceFirstMarketFeeEly: number;
	serviceFirstMarketConversionCostEly: number;
	serviceFirstMarketNetBeforeBuffsEly: number;
	serviceGrossEly: number;
	serviceProviderCostEly: number;
	serviceTransferCostEly: number;
	serviceRawNetEly: number;
	serviceCountedNetEly: number;
	totalGrossEly: number;
	rewardProceedsBeforeBuffsEly: number;
	buffCostEly: number | null;
	directNetEly: number | null;
	potentialServiceContributionEly: number;
	potentialNetEly: number | null;
}

export interface DungeonEarningsEstimate {
	dungeonId: string;
	difficulty: DungeonEarningsDifficulty;
	clearTimeSeconds: number;
	clearsPerHour: number;
	estimateState: 'complete' | 'lower-bound' | 'blocked';
	isLowerBound: boolean;
	rewardRows: DungeonEarningsRewardRow[];
	serviceStrategyRows: DungeonEarningsServiceStrategyRow[];
	buffRows: DungeonEarningsBuffRow[];
	perClear: DungeonEarningsPerClearTotals;
	perHour: DungeonEarningsPerHourTotals;
	missingMechanicIds: string[];
	missingIncomePriceIds: string[];
	missingBuffPriceIds: string[];
	missingPriceIds: string[];
	overriddenPriceIds: string[];
}
