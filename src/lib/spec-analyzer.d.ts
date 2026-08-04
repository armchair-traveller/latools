export type NumericExpression = number | string;
export type Scenario = 'theory' | 'boss-theory' | 'normal' | 'boss';
export type DisplayScenario = Exclude<Scenario, 'boss-theory'>;
export type DamageMode = 'average' | 'maximum';
export type ReferenceStat = 'crit' | 'minimum' | 'maximum' | 'minmax';

export interface SpecInputs {
	strMagFlat: NumericExpression;
	strMagPercent: NumericExpression;
	weaponAttrFlat: NumericExpression;
	weaponAttrPercent: NumericExpression;
	critDmgFlat: NumericExpression;
	critDmgPercent: NumericExpression;
	minDmgFlat: NumericExpression;
	minDmgPercent: NumericExpression;
	maxDmgFlat: NumericExpression;
	maxDmgPercent: NumericExpression;
	fixedDmgFlat: NumericExpression;
	fixedDmgPercent: NumericExpression;
	normalExtraDmgFlat: NumericExpression;
	normalExtraDmgPercent: NumericExpression;
	bossExtraDmgFlat: NumericExpression;
	bossExtraDmgPercent: NumericExpression;
	normalDomination: NumericExpression;
	bossDomination: NumericExpression;
	penetration: NumericExpression;
	placementCoreLevel: NumericExpression;
	backAttackDmg: NumericExpression;
	strMagEfficiency: NumericExpression;
	physicalJob: boolean;
	summonId: string;
}

export type NumericSpecInputKey = Exclude<keyof SpecInputs, 'physicalJob' | 'summonId'>;
export type EnchantDelta = Partial<Record<NumericSpecInputKey | EnchantOptionKey, NumericExpression>>;

export interface EnchantOption {
	minDmg: NumericExpression;
	maxDmg: NumericExpression;
	critDmg: NumericExpression;
	finalMinDmg: NumericExpression;
	finalMaxDmg: NumericExpression;
	finalCritDmg: NumericExpression;
	strMagAll: NumericExpression;
	strMagAllPercent: NumericExpression;
	strMagEfficiency: NumericExpression;
	weaponAttr: NumericExpression;
	weaponAttrPercent: NumericExpression;
	fixedDmg: NumericExpression;
	fixedDmgPercent: NumericExpression;
	normalDmgPercent: NumericExpression;
	bossDmgPercent: NumericExpression;
	normalDomination: NumericExpression;
	bossDomination: NumericExpression;
	backAttackDmg: NumericExpression;
	directHitSkillLevel: NumericExpression;
	placementSkillLevel: NumericExpression;
	hpPercent: NumericExpression;
	stamina: NumericExpression;
}
export type EnchantOptionKey = keyof EnchantOption;

export interface CalculationSettings {
	useCustomDungeonStats: boolean;
	customNormalDefense: NumericExpression;
	customBossDefense: NumericExpression;
	customNormalDmgReduction: NumericExpression;
	customBossDmgReduction: NumericExpression;
	damageMode: DamageMode;
	referenceStat: ReferenceStat;
	backAttackRate: NumericExpression;
}

export interface SpecSelections {
	jobId: string;
	directSkillId: string;
	directSkillLevel: NumericExpression;
	placementSkillId: string;
	placementSkillLevel: NumericExpression;
	dungeonId: string;
	summonId: string;
}

export interface AggregateStat {
	flat: number;
	percent: number;
	total: number;
	per1Pct: number;
}

export type AggregateStatKey =
	| 'strMag'
	| 'weaponAttr'
	| 'criticalDamage'
	| 'minimumDamage'
	| 'maximumDamage'
	| 'fixedDamage'
	| 'normalExtraDamage'
	| 'bossExtraDamage';

export interface AggregatedStats extends Record<AggregateStatKey, AggregateStat> {
	normalDomination: number;
	bossDomination: number;
	penetration: number;
	placementCoreLevel: number;
	backAttackDmg: number;
	strMagEfficiency: number;
	physicalJob: boolean;
	summonId: string;
}

export interface Job {
	id: string;
	name: string;
	sourceName: string;
	classId: number | null;
}

export interface Summon {
	id: string;
	name: string;
	sourceName: string;
	bonuses: Partial<Record<NumericSpecInputKey, number>>;
}

export interface Dungeon {
	id: string;
	name: string;
	sourceName?: string;
	normalDefense: number;
	bossDefense: number;
	normalDmgReduction: number;
	bossDmgReduction: number;
}

export interface DirectSkill {
	id: string;
	job: string;
	sourceJob: string;
	name: string;
	sourceName: string;
	skillId: number | null;
	skillIds: number[];
	effectId: number | null;
	effectIds: number[];
	coefficientSource: string;
	baseCoefficient: number;
	perLevel: number;
}

export interface PlacementSkill {
	id: string;
	job: string;
	sourceJob: string;
	name: string;
	sourceName: string;
	skillId: number | null;
	skillIds: number[];
	coefficientSource: string;
	weaponCoefficient: number;
	strengthBase: number;
	strengthPerLevel: number;
	totalBase: number;
	totalPerLevel: number;
}

export interface PlacementCoefficients {
	weaponCoefficient: number;
	strengthMultiplier: number;
	totalMultiplier: number;
	skillLevel?: number;
}

export interface DamageResult {
	damage: number;
	rawBase: number;
	factor: number;
	scenario: Scenario;
	coefficient?: number;
	weaponCoefficient?: number;
	strengthMultiplier?: number;
	totalMultiplier?: number;
}

export interface EfficiencyEquivalent {
	key: string;
	label: string;
	value: number;
	reverse: number;
}

export interface EfficiencyPanel {
	damage: number;
	rawBase: number;
	referenceGain: number;
	referenceStat: ReferenceStat;
	scale: number;
	equivalents: EfficiencyEquivalent[];
}

export interface DamageEfficiencyGroup extends Record<DisplayScenario, EfficiencyPanel> {
	bossTheory: EfficiencyPanel;
}

export interface BypassSide {
	direct: number;
	placement: number;
}

export interface DamageEfficiency {
	direct: DamageEfficiencyGroup;
	placement: DamageEfficiencyGroup;
	bypass: {
		normal: BypassSide;
		boss: BypassSide;
		direct: number;
		placement: number;
	};
}

export type DamageShareKey = 'minimum' | 'maximum' | 'critical' | 'domination';
export type BaseShareKey = 'strMag' | 'weaponAttr' | 'fixedDamage' | 'extraDamage';

export interface ConversionSummary {
	criterion: 'normal' | 'boss';
	criticalToMinimum: number;
	criticalToMaximum: number;
	finalCriticalPer1: number;
	finalMaximumPer1: number;
	finalMinimumPer1: number;
	dominationToCritical: number;
	dominationToMaximum: number;
	dominationToMinimum: number;
	criticalToDomination: number;
	criticalToMaximumAdjusted: number;
	criticalToMinimumAdjusted: number;
	damageShares: Record<DamageShareKey, number>;
	baseShares: Record<BaseShareKey, number>;
}

export interface EnchantValueChange {
	old: number;
	new: number;
	percentChange: number;
}
export interface EnchantScenarioResult {
	direct: EnchantValueChange;
	placement: EnchantValueChange;
}
export interface BypassComparison {
	old: number;
	new: number;
	change: number;
}
export interface HpCalibration {
	stamina: NumericExpression;
	staminaMinus10: NumericExpression;
	maxHp: NumericExpression;
	maxHpMinus10: NumericExpression;
}
export interface HpComparison {
	expected: number;
	changeRate: number;
	staminaMultiplier: number;
	hpMultiplier: number;
	hpPlus: number;
}
export interface EnchantComparison {
	delta: Record<EnchantOptionKey, number>;
	oldStats: AggregatedStats;
	newStats: AggregatedStats;
	scenarios: Record<Scenario, EnchantScenarioResult>;
	changes: Record<string, number>;
	conversion: { old: ConversionSummary; new: ConversionSummary };
	efficiency: { old: DamageEfficiency; new: DamageEfficiency };
	hp: HpComparison | null;
	bypass: {
		normal: { direct: BypassComparison };
		boss: { direct: BypassComparison };
		direct: BypassComparison;
		placement: BypassComparison;
	};
}

export interface PracticalDamage {
	normalDirect: number;
	bossDirect: number;
	normalPlacement: number;
	bossPlacement: number;
}
export interface BuildProfile {
	id: string;
	name: string;
	strengthRatio?: number;
	weaponRatio?: number;
	strMag: number;
	weaponAttr: number;
	direct: Record<Scenario, number>;
	placement: Record<Scenario, number>;
	practical: PracticalDamage;
	practicalEok: PracticalDamage;
	practicalAbsolute: PracticalDamage;
	change?: {
		normalDirect: number;
		bossDirect: number;
		normalPlacement: number;
		bossPlacement: number;
		directBoss: number;
		placementBoss: number;
	};
}
export interface BuildEfficiency {
	budget: number;
	current: BuildProfile;
	profiles: Array<BuildProfile & { change: NonNullable<BuildProfile['change']> }>;
	currentRatio: number;
	nearestProfileId: string | null;
	partyScale: number;
}

export interface DataMeta {
	capturedAt: string;
	livePage: string;
	counts: { jobs: number; directSkills: number; placementSkills: number; dungeons: number; summons: number };
	[key: string]: unknown;
}

export const SPEC_ANALYZER_DATA_META: Readonly<DataMeta>;
export const DEFAULT_SPEC_INPUTS: Readonly<SpecInputs>;
export const DEFAULT_ENCHANT_OPTION: Readonly<EnchantOption>;
export const DEFAULT_SPEC_CALCULATION_SETTINGS: Readonly<CalculationSettings>;
export const DEFAULT_SPEC_SELECTIONS: Readonly<SpecSelections>;
export const JOBS: ReadonlyArray<Job>;
export const SUMMONS: ReadonlyArray<Summon>;
export const DUNGEONS: ReadonlyArray<Dungeon>;
export const DIRECT_SKILLS: ReadonlyArray<DirectSkill>;
export const PLACEMENT_SKILLS: ReadonlyArray<PlacementSkill>;

export function parseNumericInput(value: unknown): number;
export function aggregateStats(inputs?: SpecInputs, options?: { summonId?: string }): AggregatedStats;
export function calculateBaseShares(stats: AggregatedStats, options?: { criterion?: 'normal' | 'boss' }): Record<BaseShareKey, number>;
export function calculateConversionSummary(stats: AggregatedStats, options?: { criterion?: 'normal' | 'boss' }): ConversionSummary;
export function damageFactor(options: {
	minimumDamage?: NumericExpression;
	maximumDamage?: NumericExpression;
	criticalDamage?: NumericExpression;
	domination?: NumericExpression;
	backAttackRate?: NumericExpression | boolean;
	mode?: DamageMode;
}): number;
export function resolveDungeon(dungeon?: Dungeon, settings?: Partial<CalculationSettings>): Dungeon;
export function calcDirectHitDamage(options: {
	stats: AggregatedStats;
	coefficient: NumericExpression;
	scenario?: Scenario;
	dungeon?: Dungeon;
	backAttackRate?: NumericExpression;
	mode?: DamageMode;
}): DamageResult;
export function placementCoefficients(skill?: PlacementSkill, skillLevel?: NumericExpression): PlacementCoefficients;
export function placementCoreCoefficients(coreLevel?: NumericExpression): PlacementCoefficients & { skillLevel: number };
export function calcPlacementDamage(options: {
	stats: AggregatedStats;
	skill?: PlacementSkill;
	skillLevel?: NumericExpression;
	coefficients?: PlacementCoefficients;
	scenario?: Scenario;
	dungeon?: Dungeon;
	backAttackRate?: NumericExpression;
	mode?: DamageMode;
}): DamageResult;
export function calculateDamageEfficiency(options: {
	stats: AggregatedStats;
	directCoefficient: NumericExpression;
	placementSkill?: PlacementSkill;
	placementSkillLevel?: NumericExpression;
	dungeon?: Dungeon;
	backAttackRate?: NumericExpression;
	damageMode?: DamageMode;
	referenceStat?: ReferenceStat;
	settings?: Partial<CalculationSettings>;
}): DamageEfficiency;
export function enchantDelta(oldEnchant?: EnchantDelta, newEnchant?: EnchantDelta): Record<EnchantOptionKey, number>;
export function applyEnchantDelta(inputs: SpecInputs, delta?: EnchantDelta): SpecInputs;
export function applyEnchantReplacement(inputs: SpecInputs, oldEnchant?: EnchantDelta, newEnchant?: EnchantDelta): SpecInputs;
export function applyEnchantReplacementToStats(stats: AggregatedStats, oldEnchant?: EnchantDelta, newEnchant?: EnchantDelta): AggregatedStats;
export function calculateHpComparison(calibration?: Partial<HpCalibration>, oldEnchant?: EnchantDelta, newEnchant?: EnchantDelta): HpComparison | null;
export function compareEnchants(options: {
	inputs: SpecInputs;
	oldEnchant?: EnchantDelta;
	newEnchant?: EnchantDelta;
	directCoefficient: NumericExpression;
	placementSkill?: PlacementSkill;
	placementSkillLevel?: NumericExpression;
	dungeon?: Dungeon;
	backAttackRate?: NumericExpression;
	damageMode?: DamageMode;
	referenceStat?: ReferenceStat;
	hpCalibration?: Partial<HpCalibration>;
}): EnchantComparison;
export function calculateHitIndicator(stats: AggregatedStats, coefficient?: NumericExpression): { side: 'normal' | 'boss'; value: number };
export function calculateSummonReflection(stats: AggregatedStats, reflectionPercent?: NumericExpression): { side: 'normal' | 'boss'; value: number };
export function inferPlacementMultiplier(options: {
	stats: AggregatedStats;
	skill?: PlacementSkill;
	skillLevel?: NumericExpression;
	dungeon?: Dungeon;
	measuredBossDamage?: NumericExpression;
	mode?: DamageMode;
}): { expected: number; preMultiplier: number; selectedTotalMultiplier: number; inferredTotalMultiplier: number };
export function calculateBuildEfficiency(options: {
	stats: AggregatedStats;
	directCoefficient: NumericExpression;
	placementSkill?: PlacementSkill;
	placementSkillLevel?: NumericExpression;
	dungeon?: Dungeon;
	backAttackRate?: NumericExpression;
	damageMode?: DamageMode;
}): BuildEfficiency;
