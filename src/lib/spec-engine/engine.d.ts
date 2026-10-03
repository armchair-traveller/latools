/** Fresh implementation of the public latale.wiki/tools/spec-analyzer reference. */
export type CombatSide = 'physical' | 'magical';
export type Scenario = 'theory' | 'normal' | 'boss';
export type DamageMode = 'average' | 'maximum';
export type NumericStats = Record<string, number>;
export interface BaseStats { [key: string]: any; strMagPlus: number; strMagPercent: number; weaponAttrPlus: number; weaponAttrPercent: number; critDmgPlus: number; critDmgPercent: number; minDmgPlus: number; minDmgPercent: number; maxDmgPlus: number; maxDmgPercent: number; fixedDmgPlus: number; fixedDmgPercent: number; normalExtraDmgPlus: number; normalExtraDmgPercent: number; bossExtraDmgPlus: number; bossExtraDmgPercent: number; normalDomination: number; bossDomination: number; penetration: number; placementCoreLevel: number; backAttackDmg: number; strMagEfficiency: number; isPhysicalJob: boolean; reference?: Partial<ReferenceInput>; hybridStats?: Record<CombatSide, Partial<BaseStats>>; }
export interface ComputedStats extends NumericStats { reference: any; }
export interface EnchantOption extends NumericStats { minDmg: number; maxDmg: number; critDmg: number; finalMinDmg: number; finalMaxDmg: number; finalCritDmg: number; strMagAll: number; strMagAllPercent: number; strMagEfficiency: number; weaponAttr: number; weaponAttrPercent: number; fixedDmg: number; fixedDmgPercent: number; normalDmgPercent: number; bossDmgPercent: number; normalDomination: number; bossDomination: number; backAttackDmg: number; directHitSkillLevel: number; placementSkillLevel: number; hpPercent: number; stamina: number; }
export interface CalculationSettings { [key: string]: any; useCustomDungeonStats: boolean; customNormalDefense: number; customBossDefense: number; customNormalDmgReduction: number; customBossDmgReduction: number; damageMode: DamageMode; referenceStat: 'crit' | 'minimum' | 'maximum' | 'minmax'; backAttackRate: number; useCustomDirectHitCoef: boolean; customDirectHitCoef: number; useCustomPlacementCoefs: boolean; customPlacementWeaponAttrCoef: number; customPlacementStrMagMult: number; customPlacementTotalMult: number; normalGuard?: number; bossGuard?: number; normalElasticity?: number; bossElasticity?: number; }
export interface Dungeon { name: string; normalDefense: number; bossDefense: number; normalDmgReduction: number; bossDmgReduction: number; normalGuard?: number; bossGuard?: number; normalElasticity?: number; bossElasticity?: number; }
export interface DirectHitSkill { id: string; job: string; name: string; legacyNames: string[]; baseCoef: number; levelIncrease: number; coefficientSource: string; [key: string]: any; }
export interface PlacementSkill { id: string; job: string; name: string; legacyNames: string[]; baseStrMagMult: number; levelStrMagMult: number; baseTotalMult: number; levelTotalMult: number; weaponAttrCoef: number; coefficientSource: string; coefficientSources: Record<string, string>; [key: string]: any; }
export interface PlacementCoefs { weaponAttrCoef: number; strMagMult: number; totalMult: number; }
export interface DamageOptions { damageMode: DamageMode; backAttackRate: number; }
export interface ReferenceInput { attackType: CombatSide; level: number; mainStat: number; efficiency: number; weaponMin: number; weaponMax: number; directCoef: number; summonScale: number; summonCoef: number; minRaw: number; minFinal: number; maxRaw: number; maxFinal: number; critRaw: number; critFinal: number; penetration: number; fixedDamage: number; extraDamage: number; damageReduction: number; defense: number; guard: number; elasticity: number; domination: number; backAttack: boolean; backAttackDamage: number; melee: boolean; meleeDamage: number; status: boolean; statusDamage: number; }
export interface DamageRange { min: number; max: number; }
export interface ReferenceDamage { directNoncrit: DamageRange; directCrit: DamageRange; summonNoncrit: DamageRange; summonCrit: DamageRange; }
export interface HpBase { stamina: number; staminaMinus10: number; maxHp: number; maxHpMinus10: number; }
export interface HpComparison { pureStamina: number; staminaPctTotal: number; hpPctTotal: number; hpPlusTotal: number; expectedHp: number; hpChangeRate: number; }
export interface EfficiencyResult { critToStrMag: number; critToWeaponAttr: number; critToFixedDmg: number; critToExtraDmg: number; strMagToCrit: number; weaponAttrToCrit: number; fixedDmgToCrit: number; extraDmgToCrit: number; }
export const DEFAULT_BASE_STATS: BaseStats;
export const DEFAULT_ENCHANT_OPTION: EnchantOption;
export const DEFAULT_SPEC_CALCULATION_SETTINGS: CalculationSettings;
export const DEFAULT_HP_BASE: HpBase;
export const HIT_INDICATOR_DIRECT_COEF: number;
export const HIT_INDICATOR_SUMMON_REFLECTION: number;
export const directHitSkills: DirectHitSkill[];
export const placementSkills: PlacementSkill[];
export const dungeons: Dungeon[];
export const jobs: string[];
export const specSummons: { name: string; bonuses: Partial<BaseStats> }[];
export const sourceMetadata: Record<string, any>;
export function findDirectHitSkill(job: string, nameOrId: string): DirectHitSkill | undefined;
export function findPlacementSkill(job: string, nameOrId: string): PlacementSkill | undefined;
export function findSpecSummon(name: string): { name: string; bonuses: Partial<BaseStats> } | undefined;
export function normalizeSpecSummonName(name: string): string;
export function aggregateStats(base: BaseStats, bonuses?: Partial<BaseStats>, hybrid?: boolean): ComputedStats;
export function aggregateCombatSides(base: BaseStats, bonuses?: Partial<BaseStats>): Record<CombatSide, ComputedStats>;
export function ensureHybridCombatStats(base: BaseStats): Record<CombatSide, Partial<BaseStats>>;
export function baseStatsForSide(base: BaseStats, side: CombatSide): BaseStats;
export function updateHybridCombatStat(base: BaseStats, side: CombatSide, key: string, value: number): BaseStats;
export function averageComputedStats(physical: ComputedStats, magical: ComputedStats): ComputedStats;
export function expandHybridStats(stats: ComputedStats): Record<CombatSide, ComputedStats> | null;
export function referenceInput(stats: ComputedStats, scenario: Scenario, dungeon?: Dungeon, directCoef?: number, placement?: Pick<PlacementCoefs, 'weaponAttrCoef' | 'strMagMult'>): ReferenceInput;
export function calculateReferenceDamage(input: ReferenceInput): ReferenceDamage;
export function estimateReferenceAverage(input: ReferenceInput, summon: boolean, critical: boolean): number | undefined;
export function referenceScore(input: ReferenceInput, kind: 'direct' | 'summon', mode: DamageMode, backAttackRate?: number): number;
export function calcDirectHitDamage(stats: ComputedStats, coefficient: number, scenario: Scenario, options?: DamageOptions | number | boolean, dungeon?: Dungeon): number;
export function calcPlacementDamage(stats: ComputedStats, weaponAttrCoef: number, strMagMult: number, totalMult: number, scenario: Scenario, options?: DamageOptions | number | boolean, dungeon?: Dungeon): number;
export function applyEnchantDelta(stats: ComputedStats, oldOption: EnchantOption, newOption: EnchantOption): ComputedStats;
export function calcEnchantAdjustedCoefficients(direct: number, strMag: number, total: number, oldOption: EnchantOption, newOption: EnchantOption, growth?: { directHit: number; placementStrMag: number; placementTotal: number }): { directHitCoef: number; placementStrMagMult: number; placementTotalMult: number };
export function compareEnchants(stats: ComputedStats, oldOption: EnchantOption, newOption: EnchantOption, direct: number, weapon: number, strMag: number, total: number, dungeon: Dungeon, options?: DamageOptions | number | boolean, growth?: { directHit: number; placementStrMag: number; placementTotal: number }): NumericStats;
export function calcPlacementCoreMultipliers(coreBonus: number): { totalMult: number; strMagEff: number; skillLevel: number };
export function calcPlacementSkillCoefficients(skill: PlacementSkill | undefined, level: number, coreBonus: number): PlacementCoefs;
export function resolveDirectHitCoef(coef: number, settings: CalculationSettings): number;
export function resolvePlacementCoefs(coefs: PlacementCoefs, settings: CalculationSettings): PlacementCoefs;
export function resolveDungeon(dungeon: Dungeon, settings: CalculationSettings): Dungeon;
export function calcDirectHitEfficiencyTheory(stats: ComputedStats, coef: number, backRate?: number): EfficiencyResult;
export function calcDirectHitEfficiencyDungeon(stats: ComputedStats, coef: number, dungeon: Dungeon, scenario: Scenario, backRate?: number): EfficiencyResult;
export function calcPlacementEfficiencyTheory(stats: ComputedStats, weapon: number, strMag: number, backRate?: number): EfficiencyResult;
export function calcPlacementEfficiencyDungeon(stats: ComputedStats, weapon: number, strMag: number, dungeon: Dungeon, scenario: Scenario, backRate?: number): EfficiencyResult;
export function calcHitIndicatorSummary(stats: ComputedStats, physical: boolean, directCoef?: number, reflection?: number): { direct: any; summon: any; combatPower: number };
export function calcHpComparison(base: HpBase, oldOption: EnchantOption, newOption: EnchantOption): HpComparison | null;
export function compareSettings(stats: ComputedStats, directCoef: number, placement: PlacementCoefs, dungeon: Dungeon, average?: boolean, backRate?: number): { budget: number; current: any; extremeWeapon: any; weapon: any; balanced: any; strMag: any; extremeStrMag: any };
export function calcMarginalEfficiency(stats: ComputedStats, boss?: boolean, mode?: DamageMode, backRate?: number): { crit: number; min: number; max: number; domination: number };
export function inferPlacementRatio(measuredDamage: number, predictedDamage: number): number;
