import {
  calcDirectHitDamage,
  calcMarginalEfficiency,
  expandHybridStats,
  averageComputedStats,
} from "./engine.js";
import type {
  ComputedStats,
  DamageMode,
  EfficiencyResult,
  CalculationSettings,
} from "./engine.js";

export type Contribution = { key: string; label: string; value: number };
export type Conversion = {
  key: string;
  label: string;
  equivalent: string;
  value: number;
};
const quotient = (top: number, bottom: number) =>
  bottom > 0 && Number.isFinite(top) ? top / bottom : 0;
const normalize = (items: Contribution[]): Contribution[] => {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  return items.map((item) => ({
    ...item,
    value: total > 0 ? Math.max(0, item.value) / total : 0,
  }));
};

/** Wiki stat summary: +100 finite differences avoid float32 one-point noise. */
export function summarizeStats(
  stats: ComputedStats,
  boss = true,
  mode: DamageMode = "average",
  backRate = 0,
) {
  const marginal = calcMarginalEfficiency(stats, boss, mode, backRate);
  const conversions = {
    strMagPer1Pct: stats.strMagPer1Pct,
    weaponAttrPer1Pct: stats.weaponAttrPer1Pct,
    fixedDmgPer1Pct: stats.fixedDmgPer1Pct,
    normalExtraDmgPer1Pct: stats.normalExtraDmgPer1Pct,
    bossExtraDmgPer1Pct: stats.bossExtraDmgPer1Pct,
    critToMinDmg: quotient(marginal.crit, marginal.min),
    critToMaxDmg: quotient(marginal.crit, marginal.max),
    critDmgPer1Pct: stats.critDmgPer1Pct,
    maxDmgPer1Pct: quotient(stats.maxDmgAbs, 100 + stats.maxDmgPct),
    minDmgPer1Pct: quotient(stats.minDmgAbs, 100 + stats.minDmgPct),
    critEquiv: quotient(marginal.domination, marginal.crit),
    maxEquiv: quotient(marginal.domination, marginal.max),
    minEquiv: quotient(marginal.domination, marginal.min),
  };
  const row = (
    key: keyof typeof conversions,
    label: string,
    equivalent: string,
  ): Conversion => ({ key, label, equivalent, value: conversions[key] });
  const rows = [
    row("strMagPer1Pct", "Strength / Magic 1%", "Strength / Magic"),
    row("weaponAttrPer1Pct", "Weapon / Element 1%", "Weapon / Element"),
    row("fixedDmgPer1Pct", "Fixed damage 1%", "Fixed damage"),
    row(
      "normalExtraDmgPer1Pct",
      "Normal extra damage 1%",
      "Normal extra damage",
    ),
    row("bossExtraDmgPer1Pct", "Boss extra damage 1%", "Boss extra damage"),
    row("critToMinDmg", "Critical damage", "Minimum damage"),
    row("critToMaxDmg", "Critical damage", "Maximum damage"),
    row("critDmgPer1Pct", "Final critical damage 1%", "Critical damage"),
    row("maxDmgPer1Pct", "Final maximum damage 1%", "Maximum damage"),
    row("minDmgPer1Pct", "Final minimum damage 1%", "Minimum damage"),
    row(
      "critEquiv",
      `${boss ? "Boss" : "Normal"} domination`,
      "Critical damage",
    ),
    row("maxEquiv", `${boss ? "Boss" : "Normal"} domination`, "Maximum damage"),
    row("minEquiv", `${boss ? "Boss" : "Normal"} domination`, "Minimum damage"),
  ];
  const score = (values: ComputedStats) =>
    calcDirectHitDamage(values, 17000, boss ? "boss" : "theory", {
      damageMode: mode,
      backAttackRate: backRate,
    });
  const base = score(stats);
  const sides = expandHybridStats(stats);
  // Removing a stat means zero on each side. Subtracting a combined mean would
  // make the weaker side negative for an asymmetric Phantom Mage setup.
  const contribution = (
    key: string,
    label: string,
    delta: Record<string, number>,
  ): Contribution => ({
    key,
    label,
    value:
      base -
      score(
        sides
          ? averageComputedStats(
              { ...sides.physical, ...delta },
              { ...sides.magical, ...delta },
            )
          : { ...stats, ...delta },
      ),
  });
  const conditional = normalize([
    contribution("domination", "Domination", {
      [boss ? "bossDomination" : "normalDomination"]: 0,
    }),
    contribution("crit", "Critical", { critDmgAbs: 0 }),
    contribution("max", "Maximum", { maxDmgAbs: 0 }),
    contribution("min", "Minimum", { minDmgAbs: 0 }),
  ]);
  const baseStats = normalize([
    contribution("strMag", "Strength / Magic", { strMag: 0 }),
    contribution("weaponAttr", "Weapon / Element", { weaponAttr: 0 }),
    contribution("fixedDmg", "Fixed damage", { fixedDmg: 0 }),
    contribution("extraDmg", "Extra damage", {
      [boss ? "bossExtraDmg" : "normalExtraDmg"]: 0,
    }),
  ]);
  return { conversions, rows, conditional, baseStats };
}

/** Efficiency tables use normal-theory marginal ratios for their selected reference stat. */
export function efficiencyBasis(
  stats: ComputedStats,
  settings: CalculationSettings,
) {
  const marginal = calcMarginalEfficiency(
    stats,
    false,
    settings.damageMode,
    settings.backAttackRate,
  );
  const bases = {
    crit: { label: "Critical damage 1%", value: marginal.crit },
    minimum: { label: "Minimum damage 1%", value: marginal.min },
    maximum: { label: "Maximum damage 1%", value: marginal.max },
    minmax: {
      label: "Min / Max damage 1%",
      value: marginal.min + marginal.max,
    },
  };
  const selected = bases[settings.referenceStat] ?? bases.crit;
  return {
    label: selected.label,
    ratio: quotient(selected.value, marginal.crit),
  };
}
export function scaleEfficiency(
  result: EfficiencyResult,
  ratio: number,
): EfficiencyResult {
  return {
    critToStrMag: result.critToStrMag * ratio,
    critToWeaponAttr: result.critToWeaponAttr * ratio,
    critToFixedDmg: result.critToFixedDmg * ratio,
    critToExtraDmg: result.critToExtraDmg * ratio,
    strMagToCrit: quotient(result.strMagToCrit, ratio),
    weaponAttrToCrit: quotient(result.weaponAttrToCrit, ratio),
    fixedDmgToCrit: quotient(result.fixedDmgToCrit, ratio),
    extraDmgToCrit: quotient(result.extraDmgToCrit, ratio),
  };
}
