import * as E from "./engine.js";
import type { Workspace } from "./persistence";

/** Translate the wiki's actual-damage fields back into shared raw stats/settings. */
export function updateActualField<T extends Workspace>(
  workspace: T,
  key: string,
  value: number | boolean | string,
  actualBoss: boolean,
  side?: E.CombatSide,
): T {
  const stats: E.BaseStats = { ...workspace.stats };
  const settings: E.CalculationSettings = { ...workspace.calculationSettings };
  const result = { ...workspace, stats, calculationSettings: settings } as T;
  const hybrid = workspace.selectedJob === "팬텀메이지";
  const activeSide = side ?? (stats.isPhysicalJob ? "physical" : "magical");
  const bonuses = E.findSpecSummon(workspace.selectedSummon)?.bonuses;
  const computed = hybrid
    ? E.aggregateCombatSides(stats, bonuses)[activeSide]
    : E.aggregateStats(stats, bonuses);
  const dungeonBase =
    E.dungeons.find((d) => d.name === workspace.selectedDungeon) ??
    E.dungeons[0];
  const dungeon = E.resolveDungeon(dungeonBase, settings);
  const direct = E.findDirectHitSkill(
    workspace.selectedJob,
    workspace.selectedDirectHit,
  );
  const skill = E.findPlacementSkill(
    workspace.selectedJob,
    workspace.selectedPlacement,
  );
  const placement = E.resolvePlacementCoefs(
    E.calcPlacementSkillCoefficients(
      skill,
      workspace.placementLevel,
      computed.placementCoreLevel,
    ),
    settings,
  );
  const coefficient = E.resolveDirectHitCoef(
    (direct?.baseCoef ?? 0) +
      (direct?.levelIncrease ?? 0) * workspace.directHitLevel,
    settings,
  );
  const input = E.referenceInput(
    computed,
    actualBoss ? "boss" : "normal",
    dungeon,
    coefficient,
    skill || settings.useCustomPlacementCoefs ? placement : undefined,
  );
  const numeric =
    typeof value === "number" && Number.isFinite(value) ? value : 0;
  const reference = (property: string, changed: number | boolean) => {
    stats.reference = { ...stats.reference, [property]: changed };
  };
  const updateBonus = (property: string, current: number, multiplier = 1) => {
    if (!Number.isFinite(multiplier) || multiplier === 0)
      throw new Error(
        "This stat cannot be converted while its total multiplier is zero.",
      );
    const previous = hybrid
      ? E.ensureHybridCombatStats(stats)[activeSide][property]
      : stats[property];
    const next = Number(previous) + (numeric - current) / multiplier;
    if (hybrid)
      (result as Workspace).stats = E.updateHybridCombatStat(
        stats,
        activeSide,
        property,
        next,
      );
    else stats[property] = next;
  };
  const rawFields: Record<string, [string, string, string?]> = {
    mainStat: ["strMagPlus", "strMag", "strMagPct"],
    efficiency: ["strMagEfficiency", "strMagEfficiency"],
    weaponMax: ["weaponAttrPlus", "weaponAttr", "weaponAttrPct"],
    penetration: ["penetration", "penetration"],
    fixedDamage: ["fixedDmgPlus", "fixedDmg", "fixedDmgPct"],
    minRaw: ["minDmgPlus", "minDmgAbs"],
    minFinal: ["minDmgPercent", "minDmgPct"],
    maxRaw: ["maxDmgPlus", "maxDmgAbs"],
    maxFinal: ["maxDmgPercent", "maxDmgPct"],
    critRaw: ["critDmgPlus", "critDmgAbs"],
    critFinal: ["critDmgPercent", "critDmgPct"],
    backAttackDamage: ["backAttackDmg", "backAttackDmg"],
  };
  if (rawFields[key]) {
    const [property, current, percent] = rawFields[key];
    updateBonus(
      property,
      computed[current],
      percent ? 1 + computed[percent] / 100 : 1,
    );
    return result;
  }
  switch (key) {
    case "attackType":
      if (!hybrid) stats.isPhysicalJob = value === "physical";
      break;
    case "backAttack":
      settings.backAttackRate = value ? 100 : 0;
      break;
    case "melee":
    case "status":
      reference(key, Boolean(value));
      break;
    case "level":
    case "weaponMin":
    case "meleeDamage":
    case "statusDamage":
      reference(key, numeric);
      break;
    case "directCoef":
      settings.useCustomDirectHitCoef = true;
      settings.customDirectHitCoef = numeric;
      break;
    case "summonScale":
    case "summonCoef":
      settings.useCustomPlacementCoefs = true;
      settings.customPlacementStrMagMult =
        (key === "summonScale" ? numeric : input.summonScale) / 100;
      settings.customPlacementWeaponAttrCoef =
        ((key === "summonCoef" ? numeric : input.summonCoef) + 100) / 50;
      settings.customPlacementTotalMult = placement.totalMult;
      break;
    case "defense":
    case "damageReduction":
      Object.assign(settings, {
        useCustomDungeonStats: true,
        customNormalDefense: dungeon.normalDefense,
        customBossDefense: dungeon.bossDefense,
        customNormalDmgReduction: dungeon.normalDmgReduction,
        customBossDmgReduction: dungeon.bossDmgReduction,
        [`custom${actualBoss ? "Boss" : "Normal"}${key === "defense" ? "Defense" : "DmgReduction"}`]:
          numeric,
      });
      break;
    case "guard":
      settings[actualBoss ? "bossGuard" : "normalGuard"] = numeric;
      break;
    case "elasticity":
      settings[actualBoss ? "bossElasticity" : "normalElasticity"] =
        numeric * 10;
      break;
    case "extraDamage": {
      const family = actualBoss ? "bossExtraDmg" : "normalExtraDmg";
      stats[family + "Plus"] +=
        (numeric - input.extraDamage) / (1 + computed[family + "Pct"] / 100);
      break;
    }
    case "domination": {
      const property = actualBoss ? "bossDomination" : "normalDomination";
      stats[property] += numeric - input.domination;
      break;
    }
    default:
      throw new Error(`Unknown actual damage field: ${key}`);
  }
  return result;
}
