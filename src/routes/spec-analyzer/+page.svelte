<script lang="ts">
  import { onMount } from "svelte";
  import translations from "$lib/components/spec-rebuild/translations.json";
  import { updateActualField } from "$lib/spec-engine/actual-fields";
  import {
    summarizeStats,
    efficiencyBasis,
    scaleEfficiency,
  } from "$lib/spec-engine/summary";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import * as E from "$lib/spec-engine/engine.js";
  import {
    readSaves,
    readDraft,
    writeDraft,
    saveSpec,
    deleteSave,
    parseSpecImport,
    downloadSpec,
    exportReport,
    type SavedSpec,
  } from "$lib/spec-engine/persistence";
  import NumberField from "$lib/components/spec-rebuild/NumberField.svelte";
  import Help from "$lib/components/spec-rebuild/Help.svelte";
  import StatPanels from "$lib/components/spec-rebuild/StatPanels.svelte";
  import EnchantDetails from "$lib/components/spec-rebuild/EnchantDetails.svelte";
  type Workspace = {
    stats: E.BaseStats;
    selectedSummon: string;
    selectedJob: string;
    selectedDirectHit: string;
    directHitLevel: number;
    selectedPlacement: string;
    placementLevel: number;
    selectedDungeon: string;
    hpBase: E.HpBase;
    directHitIndicatorCoef: number;
    summonIndicatorReflection: number;
    oldEnchant: E.EnchantOption;
    newEnchant: E.EnchantOption;
    calculationSettings: E.CalculationSettings;
  };
  function example(): Workspace {
    return {
      stats: structuredClone(E.DEFAULT_BASE_STATS),
      selectedSummon: "초신수",
      selectedJob: "스타시커",
      selectedDirectHit: "DS-DR",
      directHitLevel: 0,
      selectedPlacement: "엘메이",
      placementLevel: 0,
      selectedDungeon: "이카로스의 날개",
      hpBase: { ...E.DEFAULT_HP_BASE },
      directHitIndicatorCoef: E.HIT_INDICATOR_DIRECT_COEF,
      summonIndicatorReflection: E.HIT_INDICATOR_SUMMON_REFLECTION,
      oldEnchant: { ...E.DEFAULT_ENCHANT_OPTION },
      newEnchant: { ...E.DEFAULT_ENCHANT_OPTION },
      calculationSettings: { ...E.DEFAULT_SPEC_CALCULATION_SETTINGS },
    };
  }
  let workspace = $state<Workspace>(example());
  let activeTab = $state("basic");
  let draftReady = $state(false);
  let advanced = $state(false);
  let wide = $state(false);
  let reportMenu = $state(false);
  let reportBusy = $state(false);
  let message = $state("");
  let saves = $state<SavedSpec[]>([]);
  let saveName = $state("");
  let selectedSave = $state("");
  let skillJob = $state(E.jobs[0]);
  let measuredDamage = $state(0);
  let bossSummary = $state(true);
  let actualBoss = $state(true);
  let actualSide = $state<E.CombatSide>("physical");
  let showFormula = $state(false);
  let importOpen = $state(false);
  let importText = $state("");
  let reportElement: HTMLDivElement;
  const tabs = [
    { key: "basic", label: "Base settings" },
    { key: "efficiency", label: "Damage efficiency" },
    { key: "enchant", label: "Enchant comparison" },
    { key: "setting", label: "Setting efficiency" },
    { key: "skills", label: "Skill coefficients" },
    { key: "actual", label: "Actual damage" },
  ];
  const names: Record<string, string> = {
    아이돌: "Idol",
    스타시커: "Star Seeker",
    "직업 공용": "All classes",
    "이카로스의 날개": "Wings of Icarus",
    "리키모 펠케": "Rikimo Felke",
    "아마란스 노바": "Amaranth Nova",
    "노르니르의 눈물": "Tears of Nornir",
    플레로마: "Pleroma",
    에메랄디아: "Emeraldia",
    "[증명의탑] 30층 이상": "Tower of Proof · Floor 30+",
    없음: "None",
    초신수: "Lustral",
    "초신수(광기)": "Lustral (Madness)",
    베아트리체: "Beatrice",
    카르디안: "Kardian",
    이레이저: "Erazer",
    유니아: "Yunia",
    리치링: "Richling",
    아리아: "Aria",
  };
  const label = (name: string) =>
    (translations.classes as Record<string, string>)[name] ??
    names[name] ??
    translations.skills.find((s) => s.name === name)?.englishName ??
    name;
  const skillLabel = (skill: E.DirectHitSkill | E.PlacementSkill) =>
    translations.skills.find(
      (s) =>
        s.job === skill.job &&
        (s.name === skill.name || skill.legacyNames?.includes(s.name)),
    )?.englishName ?? label(skill.name);
  const fmt = (value: number, decimals = 0) =>
    Number.isFinite(value)
      ? value.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : "—";
  const compact = (value: number) =>
    !Number.isFinite(value)
      ? "—"
      : Math.abs(value) >= 1e9
        ? `${fmt(value / 1e9, 2)}B`
        : Math.abs(value) >= 1e6
          ? `${fmt(value / 1e6, 2)}M`
          : fmt(value);
  const percent = (value: number) => `${value > 0 ? "+" : ""}${fmt(value, 2)}%`;
  const ratio = (before: number, after: number) =>
    before ? (after / before - 1) * 100 : 0;
  let stats = $derived(workspace.stats);
  let settings = $derived(workspace.calculationSettings);
  let directSkills = $derived(
    E.directHitSkills.filter((s) => s.job === workspace.selectedJob),
  );
  let placementSkills = $derived(
    E.placementSkills.filter((s) => s.job === workspace.selectedJob),
  );
  let directSkill = $derived(
    E.findDirectHitSkill(workspace.selectedJob, workspace.selectedDirectHit) ??
      E.findDirectHitSkill("직업 공용", workspace.selectedDirectHit),
  );
  let placementSkill = $derived(
    E.findPlacementSkill(workspace.selectedJob, workspace.selectedPlacement) ??
      E.findPlacementSkill("직업 공용", workspace.selectedPlacement),
  );
  let dungeonBase = $derived(
    E.dungeons.find((d) => d.name === workspace.selectedDungeon) ??
      E.dungeons[0],
  );
  let dungeon = $derived(E.resolveDungeon(dungeonBase, settings));
  let hybrid = $derived(workspace.selectedJob === "팬텀메이지");
  let computedSides = $derived(
    E.aggregateCombatSides(
      stats,
      E.findSpecSummon(workspace.selectedSummon)?.bonuses,
    ),
  );
  let computed = $derived(
    E.aggregateStats(
      stats,
      E.findSpecSummon(workspace.selectedSummon)?.bonuses,
      hybrid,
    ),
  );
  let directCoef = $derived(
    E.resolveDirectHitCoef(
      (directSkill?.baseCoef ?? 0) +
        (directSkill?.levelIncrease ?? 0) * workspace.directHitLevel,
      settings,
    ),
  );
  let placement = $derived(
    E.resolvePlacementCoefs(
      E.calcPlacementSkillCoefficients(
        placementSkill,
        workspace.placementLevel,
        stats.placementCoreLevel,
      ),
      settings,
    ),
  );
  let damageOptions = $derived({
    damageMode: settings.damageMode,
    backAttackRate: settings.backAttackRate,
  });
  let indicators = $derived(
    E.calcHitIndicatorSummary(
      computed,
      stats.isPhysicalJob,
      workspace.directHitIndicatorCoef,
      workspace.summonIndicatorReflection,
    ),
  );
  let placementPrediction = $derived(
    E.calcPlacementDamage(
      computed,
      placement.weaponAttrCoef,
      placement.strMagMult,
      placement.totalMult,
      "boss",
      damageOptions,
      dungeon,
    ),
  );
  let comparison = $derived.by(() => {
    const fallback = {
      stats: computed,
      coefs: {
        directHitCoef: directCoef,
        placementStrMagMult: placement.strMagMult,
        placementTotalMult: placement.totalMult,
      },
    };
    try {
      const changed = E.applyEnchantDelta(
        computed,
        workspace.oldEnchant,
        workspace.newEnchant,
      );
      const coefs = E.calcEnchantAdjustedCoefficients(
        directCoef,
        placement.strMagMult,
        placement.totalMult,
        workspace.oldEnchant,
        workspace.newEnchant,
        {
          directHit: directSkill?.levelIncrease ?? 0,
          placementStrMag: placementSkill?.levelStrMagMult ?? 0,
          placementTotal: placementSkill?.levelTotalMult ?? 0,
        },
      );
      E.calcDirectHitDamage(
        changed,
        coefs.directHitCoef,
        "boss",
        damageOptions,
        dungeon,
      );
      E.calcPlacementDamage(
        changed,
        placement.weaponAttrCoef,
        coefs.placementStrMagMult,
        coefs.placementTotalMult,
        "boss",
        damageOptions,
        dungeon,
      );
      return { stats: changed, coefs, error: "" };
    } catch {
      return {
        ...fallback,
        error:
          "These equipped options exceed the entered stats, or produce an invalid skill coefficient. Check the current and replacement options.",
      };
    }
  });
  let adjusted = $derived(comparison.stats);
  let adjustedCoefs = $derived(comparison.coefs);
  let adjustedIndicators = $derived(
    E.calcHitIndicatorSummary(
      adjusted,
      stats.isPhysicalJob,
      workspace.directHitIndicatorCoef,
      workspace.summonIndicatorReflection,
    ),
  );
  let settingComparison = $derived(
    E.compareSettings(
      computed,
      directCoef,
      placement,
      dungeon,
      settings.damageMode === "average",
      settings.backAttackRate,
    ),
  );
  let actualInput = $derived({
    ...E.referenceInput(
      hybrid ? computedSides[actualSide] : computed,
      actualBoss ? "boss" : "normal",
      dungeon,
      directCoef,
      placementSkill || settings.useCustomPlacementCoefs
        ? placement
        : undefined,
    ),
    backAttack: settings.backAttackRate >= 100,
  });
  let actualDamage = $derived(E.calculateReferenceDamage(actualInput));
  let hpComparison = $derived(
    E.calcHpComparison(
      workspace.hpBase,
      workspace.oldEnchant,
      workspace.newEnchant,
    ),
  );
  const enchantRows = [
    ["Minimum damage", "minDmg"],
    ["Maximum damage", "maxDmg"],
    ["Critical damage", "critDmg"],
    ["Final minimum damage", "finalMinDmg"],
    ["Final maximum damage", "finalMaxDmg"],
    ["Final critical damage", "finalCritDmg"],
    ["Strength / Magic / All stats", "strMagAll"],
    ["Strength / Magic / All stats %", "strMagAllPercent"],
    ["Strength / Magic efficiency %", "strMagEfficiency"],
    ["Weapon attack / Element", "weaponAttr"],
    ["Weapon attack / Element %", "weaponAttrPercent"],
    ["Fixed damage", "fixedDmg"],
    ["Fixed damage %", "fixedDmgPercent"],
    ["Normal damage %", "normalDmgPercent"],
    ["Boss damage %", "bossDmgPercent"],
    ["Normal domination", "normalDomination"],
    ["Boss domination", "bossDomination"],
    ["Back attack damage", "backAttackDmg"],
    ["Direct hit skill level", "directHitSkillLevel"],
    ["Placement skill level", "placementSkillLevel"],
    ["HP %", "hpPercent"],
    ["Stamina", "stamina"],
  ];
  const statRows = [
    ["Strength / Magic", "strMag"],
    ["Weapon attack / Element", "weaponAttr"],
    ["Fixed damage", "fixedDmg"],
    ["Critical damage", "critDmg"],
    ["Minimum damage", "minDmg"],
    ["Maximum damage", "maxDmg"],
    ["Normal domination", "normalDomination"],
    ["Boss domination", "bossDomination"],
    ["Normal extra damage", "normalExtraDmg"],
    ["Boss extra damage", "bossExtraDmg"],
  ];
  const settingKeys = [
    "current",
    "extremeWeapon",
    "weapon",
    "balanced",
    "strMag",
    "extremeStrMag",
  ] as const;
  const settingLabels = [
    "Current",
    "Extreme weapon",
    "Weapon balance",
    "Balanced",
    "Stat balance",
    "Extreme stats",
  ];
  const damageRows = [
    ["Normal direct hit", "normalDirect"],
    ["Boss direct hit", "bossDirect"],
    ["Normal placement", "normalPlacement"],
    ["Boss placement", "bossPlacement"],
  ];
  const rangeRows = [
    ["Direct · Noncritical", "directNoncrit"],
    ["Direct · Critical", "directCrit"],
    ["Summon · Noncritical", "summonNoncrit"],
    ["Summon · Critical", "summonCrit"],
  ] as const;
  let currentRatio = $derived(
    settingComparison.budget
      ? (computed.strMag / 100 / settingComparison.budget) * 100
      : 0,
  );
  let efficiencyGroups = $derived.by(() => {
    const values = (kind: string, scenario: E.Scenario) =>
      kind === "direct"
        ? scenario === "theory"
          ? E.calcDirectHitEfficiencyTheory(
              computed,
              directCoef,
              settings.backAttackRate,
            )
          : E.calcDirectHitEfficiencyDungeon(
              computed,
              directCoef,
              dungeon,
              scenario,
              settings.backAttackRate,
            )
        : scenario === "theory"
          ? E.calcPlacementEfficiencyTheory(
              computed,
              placement.weaponAttrCoef,
              placement.strMagMult,
              settings.backAttackRate,
            )
          : E.calcPlacementEfficiencyDungeon(
              computed,
              placement.weaponAttrCoef,
              placement.strMagMult,
              dungeon,
              scenario,
              settings.backAttackRate,
            );
    return ["direct", "placement"].map((kind) => ({
      kind,
      rows: (["theory", "normal", "boss"] as E.Scenario[]).map((scenario) => ({
        scenario,
        values: values(kind, scenario),
      })),
    }));
  });
  let statSummary = $derived(summarizeStats(computed, bossSummary));
  let conversionRows = $derived(
    statSummary.rows.map(
      (r) => [r.label + " = " + r.equivalent, r.value] as [string, number],
    ),
  );
  let changedConversion = $derived(
    summarizeStats(adjusted, bossSummary).rows.map(
      (r) => [r.label + " = " + r.equivalent, r.value] as [string, number],
    ),
  );
  let conditionalContribution = $derived(
    statSummary.conditional.map((r) => ({
      name: r.label,
      value: r.value * 100,
    })),
  );
  let basicContribution = $derived(
    statSummary.baseStats.map((r) => ({ name: r.label, value: r.value * 100 })),
  );
  let damageComparisons = $derived.by(() => {
    const rows: { label: string; before: number; after: number }[] = [];
    for (const kind of ["direct", "placement"])
      for (const context of [
        { scenario: "theory", theory: true, label: "Theoretical normal" },
        { scenario: "boss", theory: true, label: "Theoretical boss" },
        { scenario: "normal", theory: false, label: "Dungeon normal" },
        { scenario: "boss", theory: false, label: "Dungeon boss" },
      ] as { scenario: E.Scenario; theory: boolean; label: string }[]) {
        const scenario = context.scenario;
        const target = context.theory ? undefined : dungeon;
        const before =
          kind === "direct"
            ? E.calcDirectHitDamage(
                computed,
                directCoef,
                scenario,
                damageOptions,
                target,
              )
            : E.calcPlacementDamage(
                computed,
                placement.weaponAttrCoef,
                placement.strMagMult,
                placement.totalMult,
                scenario,
                damageOptions,
                target,
              );
        const after =
          kind === "direct"
            ? E.calcDirectHitDamage(
                adjusted,
                adjustedCoefs.directHitCoef,
                scenario,
                damageOptions,
                target,
              )
            : E.calcPlacementDamage(
                adjusted,
                placement.weaponAttrCoef,
                adjustedCoefs.placementStrMagMult,
                adjustedCoefs.placementTotalMult,
                scenario,
                damageOptions,
                target,
              );
        rows.push({
          label: `${kind === "direct" ? "Direct" : "Placement"} · ${context.label}`,
          before,
          after,
        });
      }
    return rows;
  });
  function changeJob(job: string) {
    workspace.selectedJob = job;
    workspace.selectedDirectHit =
      E.directHitSkills.find((s) => s.job === job)?.name ?? "";
    workspace.selectedPlacement =
      E.placementSkills.find((s) => s.job === job)?.name ?? "";
    workspace.directHitLevel = 0;
    workspace.placementLevel = 0;
  }
  function resetStats() {
    workspace.stats = {
      ...E.DEFAULT_BASE_STATS,
      ...Object.fromEntries(
        Object.keys(E.DEFAULT_BASE_STATS)
          .filter((k) => typeof E.DEFAULT_BASE_STATS[k] === "number")
          .map((k) => [k, 0]),
      ),
    };
    workspace.selectedSummon = "없음";
    message = "Status inputs reset.";
  }
  function loadExample() {
    workspace = example();
    message = "Wiki test data loaded.";
  }
  function fillDungeon() {
    Object.assign(settings, {
      customNormalDefense: dungeonBase.normalDefense,
      customBossDefense: dungeonBase.bossDefense,
      customNormalDmgReduction: dungeonBase.normalDmgReduction,
      customBossDmgReduction: dungeonBase.bossDmgReduction,
      normalGuard: dungeonBase.normalGuard ?? 0,
      bossGuard: dungeonBase.bossGuard ?? 0,
      normalElasticity: dungeonBase.normalElasticity ?? 0,
      bossElasticity: dungeonBase.bossElasticity ?? 0,
    });
  }
  function save() {
    try {
      saves = saveSpec(
        saveName.trim() || "My specification",
        $state.snapshot(workspace),
      );
      selectedSave = saves[0]?.id ?? "";
      message = "Specification saved on this device.";
    } catch (e) {
      message = e instanceof Error ? e.message : "Unable to save.";
    }
  }
  function load() {
    const saved = saves.find((s) => s.id === selectedSave);
    if (saved) {
      workspace = { ...example(), ...$state.snapshot(saved.data) } as Workspace;
      message = `Loaded ${saved.name}.`;
    }
  }
  function remove() {
    try {
      saves = deleteSave(selectedSave);
      selectedSave = "";
      message = "Saved specification deleted.";
    } catch (e) {
      message = String(e);
    }
  }
  function applyImport() {
    try {
      workspace = {
        ...example(),
        ...$state.snapshot(workspace),
        ...parseSpecImport(importText),
      } as Workspace;
      importOpen = false;
      importText = "";
      message = "Imported specification applied.";
    } catch (e) {
      message = e instanceof Error ? e.message : "Import failed.";
    }
  }
  async function importFile(event: Event) {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (file) {
      importText = await file.text();
      applyImport();
    }
  }
  async function report(format: "png" | "pdf") {
    reportMenu = false;
    reportBusy = true;
    try {
      await exportReport(reportElement, format);
      message = `${format.toUpperCase()} report exported.`;
    } catch (e) {
      message = e instanceof Error ? e.message : "Export failed.";
    } finally {
      reportBusy = false;
    }
  }
  function setReference(key: string, value: number | boolean | string) {
    workspace = updateActualField(
      workspace,
      key,
      value,
      actualBoss,
      hybrid ? actualSide : undefined,
    );
  }
  const actualGroups = [
    {
      title: "Attacker",
      fields: [
        ["Character level", "level"],
        ["Strength / Magic", "mainStat"],
        ["Strength / Magic efficiency %", "efficiency"],
        ["Minimum weapon attack", "weaponMin"],
        ["Maximum weapon / Element", "weaponMax"],
        ["Penetration %", "penetration"],
        ["Fixed damage", "fixedDamage"],
      ],
    },
    {
      title: "Skill / Summon",
      fields: [
        ["Direct skill coefficient", "directCoef"],
        ["Summon stat multiplier %", "summonScale"],
        ["Summon attack coefficient", "summonCoef"],
      ],
    },
    {
      title: "Damage options",
      fields: [
        ["Minimum damage +", "minRaw"],
        ["Final minimum damage %", "minFinal"],
        ["Maximum damage +", "maxRaw"],
        ["Final maximum damage %", "maxFinal"],
        ["Critical damage +", "critRaw"],
        ["Final critical damage %", "critFinal"],
        ["Back attack damage", "backAttackDamage"],
        ["Close range damage", "meleeDamage"],
        ["Status damage", "statusDamage"],
      ],
    },
    {
      title: "Monster",
      fields: [
        ["Defense / Resistance", "defense"],
        ["Damage reduction", "damageReduction"],
        ["Damage reduction %", "guard"],
        ["Critical resistance %", "elasticity"],
        ["Monster extra damage", "extraDamage"],
        ["Monster domination %", "domination"],
      ],
    },
  ];
  function referenceLabel() {
    return efficiencyBasis(computed, settings).label.replace(" 1%", "");
  }
  function efficiencyValue(
    values: E.EfficiencyResult,
    key: string,
    _scenario: E.Scenario,
    _inverse = false,
  ) {
    return scaleEfficiency(values, efficiencyBasis(computed, settings).ratio)[
      key as keyof E.EfficiencyResult
    ];
  }
  function breakthrough(scenario: "normal" | "boss") {
    const opts = { damageMode: "average" as const, backAttackRate: 0 };
    const ordinary = E.calcDirectHitDamage(
      computed,
      directCoef,
      scenario,
      opts,
      dungeon,
    );
    const theory = E.calcDirectHitDamage(
      computed,
      directCoef,
      scenario === "boss" ? "boss" : "theory",
      opts,
    );
    return theory ? (ordinary / theory) * 100 : 0;
  }
  function updateActual(key: string, value: number) {
    try {
      workspace = updateActualField(
        workspace,
        key,
        value,
        actualBoss,
        hybrid ? actualSide : undefined,
      );
    } catch (e) {
      message = e instanceof Error ? e.message : "Invalid value.";
    }
  }

  onMount(() => {
    try {
      saves = readSaves();
      const draft = readDraft();
      if (draft) {
        workspace = { ...example(), ...draft.data } as Workspace;
        if (tabs.some((tab) => tab.key === draft.tab)) activeTab = draft.tab;
      }
    } catch (e) {
      message = e instanceof Error ? e.message : "Local saves unavailable.";
    }
    draftReady = true;
  });

  $effect(() => {
    if (!draftReady) return;
    try {
      writeDraft($state.snapshot(workspace), activeTab);
    } catch {
      // Explicit saves report storage failures; draft storage is best effort.
    }
  });
</script>

<svelte:head
  ><title>Specification Analyzer · LaTale Tools</title><meta
    name="description"
    content="Analyze LaTale stats, damage efficiency, enchants, stat distribution, and skill coefficients with the wiki analyzer's calculations."
  /></svelte:head
>
<Tooltip.Provider>
  <div class={["spec-analyzer", wide && "wide"]}>
    <header class="page-header">
      <div>
        <h1>Specification Analyzer</h1>
        <p>
          Enter your base stats to analyze damage, enchants, and build
          efficiency.
        </p>
        <p class="fine">
          Estimates based on public formulas and measured values.
        </p>
      </div>
      <div class="header-actions">
        <div class="report-menu">
          <button
            class="primary-button"
            disabled={reportBusy || Boolean(comparison.error)}
            onclick={() => (reportMenu = !reportMenu)}
            >{reportBusy ? "Exporting…" : "Export report"}</button
          >{#if reportMenu}<div class="report-options">
              <button onclick={() => report("png")}>Save as PNG</button><button
                onclick={() => report("pdf")}>Save as PDF</button
              >
            </div>{/if}
        </div>
        <a
          class="button"
          href="https://latale.wiki/tools/spec-analyzer"
          target="_blank"
          rel="noreferrer">Wiki analyzer ↗</a
        ><button onclick={() => (wide = !wide)} aria-pressed={wide}
          >{wide ? "Standard view" : "Wide view"}</button
        >
      </div>
    </header>
    <section class="common-settings">
      <div class="section-heading">
        <div>
          <h2>Shared calculation settings</h2>
          <p>Changes here apply to every tab.</p>
        </div>
        <button onclick={() => (advanced = !advanced)} aria-expanded={advanced}
          >{advanced ? "Close advanced settings" : "Advanced settings"}</button
        >
      </div>
      <div class="shared-fields">
        <label
          >Class<select
            value={workspace.selectedJob}
            onchange={(e) => changeJob(e.currentTarget.value)}
            >{#each E.jobs as job (job)}<option value={job}>{label(job)}</option
              >{/each}</select
          ></label
        ><label
          >Reference dungeon <select bind:value={workspace.selectedDungeon}
            >{#each E.dungeons as dungeon (dungeon.name)}<option
                value={dungeon.name}>{label(dungeon.name)}</option
              >{/each}</select
          ></label
        ><label
          >Direct hit <select bind:value={workspace.selectedDirectHit}
            >{#each directSkills as skill (skill.id)}<option value={skill.name}
                >{skillLabel(skill)}</option
              >{/each}{#if !directSkills.length}<option value=""
                >No direct skill</option
              >{/if}</select
          ></label
        ><NumberField
          label="Direct skill level"
          bind:value={workspace.directHitLevel}
          min={0}
          compact
        /><label
          >Summon / Placement<select bind:value={workspace.selectedPlacement}
            >{#each placementSkills as skill (skill.id)}<option
                value={skill.name}>{skillLabel(skill)}</option
              >{/each}{#if !placementSkills.length}<option value=""
                >No placement skill</option
              >{/if}</select
          ></label
        ><NumberField
          label="Placement skill level"
          bind:value={workspace.placementLevel}
          min={0}
          compact
        />
      </div>
      <div class="coefficient-summary">
        <span>Direct coefficient <strong>{fmt(directCoef)}</strong></span><span
          >Placement weapon <strong>{fmt(placement.weaponAttrCoef, 2)}</strong
          ></span
        ><span
          >Placement stat <strong>{fmt(placement.strMagMult, 2)}</strong></span
        ><span
          >Placement boss estimate <strong>{fmt(placementPrediction)}</strong
          ></span
        >
      </div>
      {#if advanced}<div class="advanced">
          <div class="advanced-grid">
            <fieldset>
              <legend
                ><label
                  ><input
                    type="checkbox"
                    bind:checked={settings.useCustomDungeonStats}
                  /> Custom monster defenses</label
                ><Help
                  text="Replace the selected dungeon's defense, reduction, damage reduction percent, and critical resistance. All tabs use the same values."
                /></legend
              >{#each [["Normal defense", "customNormalDefense"], ["Boss defense", "customBossDefense"], ["Normal damage reduction", "customNormalDmgReduction"], ["Boss damage reduction", "customBossDmgReduction"], ["Normal reduction %", "normalGuard"], ["Boss reduction %", "bossGuard"], ["Normal critical resistance %", "normalElasticity"], ["Boss critical resistance %", "bossElasticity"]] as row (row[1])}<NumberField
                  label={row[0]}
                  bind:value={
                    () =>
                      Number(settings[row[1]] ?? 0) /
                      (row[1].endsWith("Elasticity") ? 10 : 1),
                    (v) =>
                      (settings[row[1]] =
                        v * (row[1].endsWith("Elasticity") ? 10 : 1))
                  }
                  min={0}
                  max={row[1].endsWith("Guard") || row[1].endsWith("Elasticity")
                    ? 100
                    : undefined}
                  compact
                />{/each}<button onclick={fillDungeon}
                >Fill current dungeon values</button
              >
            </fieldset>
            <fieldset>
              <legend>Damage calculation</legend><label class="stack-label"
                >Damage mode<select bind:value={settings.damageMode}
                  ><option value="average">Average damage</option><option
                    value="maximum">Maximum damage</option
                  ></select
                ></label
              ><NumberField
                label="Back attack rate %"
                bind:value={settings.backAttackRate}
                min={0}
                max={100}
              /><label class="stack-label"
                >Efficiency comparison basis<select
                  bind:value={settings.referenceStat}
                  ><option value="crit">Critical damage 1%</option><option
                    value="minimum">Minimum damage 1%</option
                  ><option value="maximum">Maximum damage 1%</option><option
                    value="minmax">Minimum / Maximum damage 1%</option
                  ></select
                ></label
              >
              <p class="fine">
                Back attack rate is used for expected damage. Maximum mode uses
                the upper damage range.
              </p>
              <label class="check"
                ><input
                  type="checkbox"
                  bind:checked={settings.useCustomDirectHitCoef}
                /> Custom direct coefficient</label
              ><NumberField
                label="Direct coefficient"
                bind:value={settings.customDirectHitCoef}
                min={0}
              /><label class="check"
                ><input
                  type="checkbox"
                  bind:checked={settings.useCustomPlacementCoefs}
                /> Custom placement coefficients</label
              ><NumberField
                label="Weapon / Element"
                bind:value={settings.customPlacementWeaponAttrCoef}
                min={0}
              /><NumberField
                label="Strength / Magic multiplier"
                bind:value={settings.customPlacementStrMagMult}
                min={0}
              /><NumberField
                label="Total multiplier"
                bind:value={settings.customPlacementTotalMult}
                min={0}
              />
            </fieldset>
          </div>
          <div class="measurement">
            <h3>Placement measurement calibration</h3>
            <NumberField
              label="Measured boss damage"
              bind:value={measuredDamage}
            />
            <p>
              Measured / predicted <strong
                >{measuredDamage && placementPrediction
                  ? fmt(
                      E.inferPlacementRatio(
                        measuredDamage,
                        placementPrediction,
                      ),
                      4,
                    )
                  : "—"}</strong
              >
            </p>
          </div>
        </div>{/if}
    </section>
    <nav class="tabs" aria-label="Analyzer sections">
      {#each tabs as tab (tab.key)}<button
          class={activeTab === tab.key ? "active" : ""}
          aria-current={activeTab === tab.key ? "page" : undefined}
          onclick={() => (activeTab = tab.key)}>{tab.label}</button
        >{/each}
    </nav>
    {#if message}<div class="status-message" role="status">
        {message}<button
          aria-label="Dismiss message"
          onclick={() => (message = "")}>×</button
        >
      </div>{/if}
    {#if activeTab === "basic"}
      <section>
        <div class="section-heading">
          <div>
            <h2>Status window input</h2>
            <p>Use the status values shown after applying your buffs.</p>
          </div>
          <div class="actions">
            <button
              class="soft-button"
              onclick={() => (importOpen = !importOpen)}
              >Import collected stats</button
            ><button onclick={loadExample}>Test data</button><button
              onclick={resetStats}>Reset inputs</button
            >
          </div>
        </div>
        {#if importOpen}<section class="import-section">
            <div class="section-heading">
              <h3>Import collected stats or specification</h3>
              <button onclick={() => (importOpen = false)}>Close</button>
            </div>
            <p>
              Paste a collected character JSON payload or a specification
              exported by this analyzer.
            </p>
            <textarea
              aria-label="Import JSON"
              bind:value={importText}
              rows="6"
              placeholder="Paste JSON here"></textarea>
            <div class="actions">
              <button class="primary-button" onclick={applyImport}
                >Apply imported stats</button
              ><label class="button"
                >Choose JSON file<input
                  class="file-input"
                  type="file"
                  accept="application/json,.json"
                  onchange={importFile}
                /></label
              >
            </div>
          </section>{/if}
        <StatPanels
          bind:stats={workspace.stats}
          {computed}
          {indicators}
          {hybrid}
          {computedSides}
          indicatorCoef={workspace.directHitIndicatorCoef}
          reflection={workspace.summonIndicatorReflection}
        />
        <div class="support-settings">
          <h3>
            Analysis support settings <Help
              text="Summon bonuses are applied before calculating final stats. Indicator coefficients affect the combat power display."
            />
          </h3>
          <div class="support-grid">
            <label class="check"
              ><input
                type="checkbox"
                bind:checked={workspace.stats.isPhysicalJob}
              /> Physical class</label
            ><label class="stack-label"
              >Summon bonus<select bind:value={workspace.selectedSummon}
                >{#each E.specSummons as summon (summon.name)}<option
                    value={summon.name}>{label(summon.name)}</option
                  >{/each}</select
              ></label
            ><NumberField
              label="Placement core level"
              bind:value={workspace.stats.placementCoreLevel}
              min={0}
            /><NumberField
              label="Indicator skill coefficient"
              bind:value={workspace.directHitIndicatorCoef}
              min={0}
            /><NumberField
              label="Summon stat reflection %"
              bind:value={workspace.summonIndicatorReflection}
              min={0}
            />
          </div>
          <h4>
            HP calculation base <Help
              text="Enter current stamina and HP, then the values with 10% less all stats. These are used to estimate HP changes in the enchant comparison."
            />
          </h4>
          <div class="support-grid hp">
            {#each [["Stamina", "stamina"], ["Stamina (−10%)", "staminaMinus10"], ["Maximum HP", "maxHp"], ["Maximum HP (−10%)", "maxHpMinus10"]] as row (row[1])}<NumberField
                label={row[0]}
                bind:value={workspace.hpBase[row[1] as keyof E.HpBase]}
              />{/each}
          </div>
        </div>
        <div class="section-heading">
          <h3>
            Base stat conversion summary <Help
              text="Equivalent stat changes are calculated from your current stats. Marginal values vary with minimum, maximum, critical, and domination stats."
            />
          </h3>
          <label class="check"
            ><input type="checkbox" bind:checked={bossSummary} /> Boss basis</label
          >
        </div>
        <div class="summary-grid">
          <div class="table-scroll">
            <table>
              <tbody
                >{#each conversionRows as row (row[0])}<tr
                    ><td>{row[0]}</td><td class="numeric">{fmt(row[1], 2)}</td
                    ></tr
                  >{/each}</tbody
              >
            </table>
          </div>
          <div class="contribution-panels">
            {@render contributionPanel(
              "Conditional stat damage contribution",
              conditionalContribution,
              "Additive stat efficiency is shown in Damage efficiency.",
              "orange",
            )}{@render contributionPanel(
              "Base stat damage contribution",
              basicContribution,
              "Relative contribution of the basic damage components.",
              "blue",
            )}
          </div>
        </div>
      </section>
    {:else if activeTab === "efficiency"}
      <section>
        <h2>
          Damage efficiency <Help
            text="The amount of another stat that provides the same damage increase as your selected reference stat. Theory excludes dungeon defenses."
          />
        </h2>
        <div class="split-note">
          <span>Direct hit coefficient: {fmt(directCoef)}</span><span
            >Placement weapon coefficient: {fmt(placement.weaponAttrCoef, 2)} | Stat
            multiplier: {fmt(placement.strMagMult, 2)}</span
          >
        </div>
        <p class="subnote">
          Damage reduction breakthrough: Normal {fmt(
            breakthrough("normal"),
            2,
          )}% | Boss {fmt(breakthrough("boss"), 2)}% <Help
            text="Damage after dungeon reduction divided by damage without the reduction, at the same dungeon defense."
          />
        </p>
        <div class="efficiency-grid">
          {#each efficiencyGroups as group (group.kind)}<div>
              {#each group.rows as row (row.scenario)}<article
                  class="data-card"
                >
                  <h3>
                    {group.kind === "direct" ? "Direct hit" : "Placement"} stat efficiency
                    ({row.scenario === "theory"
                      ? "Theoretical · Normal"
                      : `${label(dungeon.name)} · ${row.scenario === "boss" ? "Boss" : "Normal"}`})
                  </h3>
                  <p>
                    Stat efficiency {fmt(computed.strMagEfficiency, 2)}% | {row.scenario ===
                    "boss"
                      ? "Boss"
                      : "Normal"} domination {fmt(
                      row.scenario === "boss"
                        ? computed.bossDomination
                        : computed.normalDomination,
                      2,
                    )}
                  </p>
                  <table class="efficiency-table">
                    <tbody
                      >{#each [["Strength / Magic", "critToStrMag", "strMagToCrit"], ["Weapon / Element", "critToWeaponAttr", "weaponAttrToCrit"], ["Fixed damage", "critToFixedDmg", "fixedDmgToCrit"], ["Extra damage", "critToExtraDmg", "extraDmgToCrit"]] as field (field[1])}<tr
                          ><td>{referenceLabel()} 1%</td><td>≈ {field[0]}</td
                          ><td class="numeric"
                            >{fmt(
                              efficiencyValue(
                                row.values,
                                field[1],
                                row.scenario,
                              ),
                              2,
                            )}</td
                          ><td
                            >{field[0]} 1% ≈ {fmt(
                              efficiencyValue(
                                row.values,
                                field[2],
                                row.scenario,
                                true,
                              ),
                              2,
                            )}</td
                          ></tr
                        >{/each}</tbody
                    >
                  </table>
                </article>{/each}
            </div>{/each}
        </div>
      </section>
    {:else if activeTab === "enchant"}
      <section>
        <div class="section-heading">
          <h2>
            Enchant option comparison <Help
              text="Enter the options currently equipped and their replacements. Current options are subtracted from the base stats before the new options are applied."
            />
          </h2>
          <button
            onclick={() => {
              workspace.oldEnchant = { ...E.DEFAULT_ENCHANT_OPTION };
              workspace.newEnchant = { ...E.DEFAULT_ENCHANT_OPTION };
            }}>Reset comparison</button
          >
        </div>
        <div class="two-columns">
          <article class="data-card">
            <h3>Currently equipped options</h3>
            {#each enchantRows as row (row[1])}<NumberField
                label={row[0]}
                bind:value={workspace.oldEnchant[row[1]]}
                compact
              />{/each}
          </article>
          <article class="data-card">
            <h3>Replacement options</h3>
            {#each enchantRows as row (row[1])}<NumberField
                label={row[0]}
                bind:value={workspace.newEnchant[row[1]]}
                compact
              />{/each}
          </article>
        </div>
        {#if comparison.error}<p class="validation-error" role="alert">
            {comparison.error}
          </p>{:else}<h3 class="table-title">Combat power indicator changes</h3>
          {@render comparisonTable(
            [
              [
                "Combat power",
                indicators.combatPower,
                adjustedIndicators.combatPower,
              ],
              [
                "Direct hit",
                indicators.direct.value,
                adjustedIndicators.direct.value,
              ],
              [
                "Summon hit",
                indicators.summon.value,
                adjustedIndicators.summon.value,
              ],
            ],
            0,
          )}
          <h3 class="table-title">
            Damage increase % <span class="muted"
              >{settings.damageMode === "average" ? "Average" : "Maximum"} damage</span
            >
          </h3>
          <EnchantDetails
            {computed}
            {adjusted}
            {directCoef}
            {placement}
            {dungeon}
            {adjustedCoefs}
            {settings}
            part="gains"
          />
          <h3 class="table-title">Stat changes</h3>
          {@render comparisonTable(
            statRows.map(
              ([name, key]) =>
                [name, computed[key], adjusted[key]] as [
                  string,
                  number,
                  number,
                ],
            ),
            2,
          )}
          <h3 class="table-title">Expected damage changes</h3>
          <div class="table-scroll">
            <table>
              <thead
                ><tr
                  ><th>Scenario</th><th>Before</th><th>After</th><th>Change</th
                  ></tr
                ></thead
              ><tbody
                >{#each damageComparisons as row (row.label)}<tr
                    ><td>{row.label}</td><td class="numeric"
                      >{compact(row.before)}</td
                    ><td class="numeric">{compact(row.after)}</td><td
                      class={[
                        "numeric",
                        row.after >= row.before ? "positive" : "negative",
                      ]}>{percent(ratio(row.before, row.after))}</td
                    ></tr
                  >{/each}</tbody
              >
            </table>
          </div>
          <EnchantDetails
            {computed}
            {adjusted}
            {directCoef}
            {placement}
            {dungeon}
            {adjustedCoefs}
            {settings}
            part="details"
          />
          <h3 class="table-title">Stat conversion comparison (boss basis)</h3>
          <div class="table-scroll">
            <table>
              <thead><tr><th>Stat</th><th>Before</th><th>After</th></tr></thead
              ><tbody
                >{#each conversionRows as row, i (row[0])}<tr
                    ><td>{row[0]}</td><td class="numeric">{fmt(row[1], 2)}</td
                    ><td class="numeric">{fmt(changedConversion[i][1], 2)}</td
                    ></tr
                  >{/each}</tbody
              >
            </table>
          </div>
          {#if hpComparison}<h3 class="table-title">HP change estimate</h3>
            <p>
              Expected HP <strong>{fmt(hpComparison.expectedHp)}</strong>
              <span
                class={hpComparison.hpChangeRate >= 0 ? "positive" : "negative"}
                >{percent(hpComparison.hpChangeRate)}</span
              >
            </p>{/if}{/if}
      </section>
    {:else if activeTab === "setting"}
      <section>
        <div class="section-heading">
          <h2>
            Setting efficiency <Help
              text="Compares five allocations of the same stat budget. Budget = Strength / Magic ÷ 100 + Weapon / Element."
            />
          </h2>
          <label class="check"
            ><input
              type="checkbox"
              checked={settings.damageMode === "average"}
              onchange={(e) =>
                (settings.damageMode = e.currentTarget.checked
                  ? "average"
                  : "maximum")}
            /> Average damage basis</label
          >
        </div>
        <div class="setting-intro">
          <p>
            Stat budget: <strong>{fmt(settingComparison.budget, 2)}</strong>
          </p>
          <p>
            Direct skill: {label(workspace.selectedDirectHit)} (coefficient {fmt(
              directCoef,
            )})
          </p>
          <p>
            Placement skill: {label(workspace.selectedPlacement)} (weapon {fmt(
              placement.weaponAttrCoef,
              2,
            )} / stat multiplier {fmt(placement.strMagMult * 100, 2)}%)
          </p>
          <p>Dungeon: {label(dungeon.name)}</p>
        </div>
        <article class="data-card">
          <h3>Current stat distribution</h3>
          <div class="distribution">
            <div
              class="marker"
              style:left={`${Math.max(5, Math.min(95, ((currentRatio - 30) / 35) * 100))}%`}
            >
              {fmt(currentRatio, 1)}%<span>▼</span>
            </div>
            <div class="distribution-line"></div>
            <div class="distribution-labels">
              {#each settingLabels.slice(1) as name (name)}<span>{name}</span
                >{/each}
            </div>
          </div>
          <div class="distribution-summary">
            <strong>Current</strong><span
              >Strength / Magic {fmt(computed.strMag)}</span
            ><span>Weapon / Element {fmt(computed.weaponAttr)}</span><span
              >Ratio {fmt(currentRatio, 1)}%</span
            >
          </div>
        </article>
        <h3 class="table-title">Stat allocation comparison</h3>
        <div class="table-scroll">
          <table>
            <thead
              ><tr
                ><th>Stat</th>{#each settingLabels as name (name)}<th>{name}</th
                  >{/each}</tr
              ></thead
            ><tbody
              >{#each [["Strength / Magic", "strMag"], ["Weapon / Element", "weaponAttr"]] as row (row[1])}<tr
                  ><td>{row[0]}</td>{#each settingKeys as key (key)}<td
                      class={["numeric", key === "current" && "current-cell"]}
                      >{fmt(settingComparison[key].dist[row[1]])}</td
                    >{/each}</tr
                >{/each}</tbody
            >
          </table>
        </div>
        <h3 class="table-title">
          Damage comparison ({settings.damageMode}) — relative to current
        </h3>
        <div class="table-scroll">
          <table>
            <thead
              ><tr
                ><th>Scenario</th>{#each settingLabels as name (name)}<th
                    >{name}</th
                  >{/each}</tr
              ></thead
            ><tbody
              >{#each damageRows as row (row[1])}<tr
                  ><td>{row[0]}</td>{#each settingKeys as key (key)}<td
                      class={["numeric", key === "current" && "current-cell"]}
                      >{compact(
                        settingComparison[key].damage[row[1]] * 1e8,
                      )}{#if key !== "current"}<small
                          class={settingComparison[key].damage[row[1]] >=
                          settingComparison.current.damage[row[1]]
                            ? "positive"
                            : "negative"}
                          >{percent(
                            ratio(
                              settingComparison.current.damage[row[1]],
                              settingComparison[key].damage[row[1]],
                            ),
                          )}</small
                        >{/if}</td
                    >{/each}</tr
                >{/each}</tbody
            >
          </table>
        </div>
      </section>
    {:else if activeTab === "skills"}
      <section>
        <h2>Skill coefficients</h2>
        <p>
          Values marked “Needs review” retain the wiki's recorded coefficients.
          Placement total multipliers remain subject to review.
        </p>
        <label class="skill-class"
          >Select class<select bind:value={skillJob}
            >{#each E.jobs as job (job)}<option value={job}>{label(job)}</option
              >{/each}</select
          ></label
        >
        <h3 class="table-title">
          Direct hit skills <Help
            text="Coefficient = base coefficient + skill level × growth per level."
          />
        </h3>
        <div class="table-scroll">
          <table>
            <thead
              ><tr
                ><th>Skill</th><th>Base coefficient</th><th>Growth / level</th
                ><th>Verification</th></tr
              ></thead
            ><tbody
              >{#each E.directHitSkills.filter((s) => s.job === skillJob) as skill (skill.id)}<tr
                  ><td>{skillLabel(skill)}</td><td class="numeric"
                    >{fmt(skill.baseCoef)}</td
                  ><td class="numeric">{fmt(skill.levelIncrease)}</td><td
                    >{skill.coefficientSource === "effect"
                      ? "Verified"
                      : "Needs review"}</td
                  ></tr
                >{:else}<tr
                  ><td colspan="4"
                    >No direct hit skills recorded for this class.</td
                  ></tr
                >{/each}</tbody
            >
          </table>
        </div>
        <h3 class="table-title">
          Summon / Placement skills <Help
            text="Core level, skill level, and summon scaling are applied by the shared calculation settings."
          />
        </h3>
        <div class="table-scroll">
          <table>
            <thead
              ><tr
                ><th>Skill</th><th>Weapon coef.</th><th>Base stat mult.</th><th
                  >Stat / level</th
                ><th>Base total</th><th>Total / level</th><th>Verification</th
                ></tr
              ></thead
            ><tbody
              >{#each E.placementSkills.filter((s) => s.job === skillJob) as skill (skill.id)}<tr
                  ><td>{skillLabel(skill)}</td><td class="numeric"
                    >{fmt(skill.weaponAttrCoef, 2)}</td
                  ><td class="numeric">{fmt(skill.baseStrMagMult, 2)}</td><td
                    class="numeric">{fmt(skill.levelStrMagMult, 2)}</td
                  ><td class="numeric">{fmt(skill.baseTotalMult, 2)}</td><td
                    class="numeric">{fmt(skill.levelTotalMult, 2)}</td
                  ><td
                    >{skill.coefficientSource === "hybrid"
                      ? "Partially verified"
                      : "Needs review"}</td
                  ></tr
                >{:else}<tr
                  ><td colspan="7"
                    >No placement skills recorded for this class.</td
                  ></tr
                >{/each}</tbody
            >
          </table>
        </div>
      </section>
    {:else if activeTab === "actual"}
      <section>
        <div class="section-heading">
          <div>
            <h2>Actual damage calculation</h2>
            <p>
              Inputs are shared with calculation tabs and saved specifications.
              Results show the possible random damage range.
            </p>
          </div>
          <button
            onclick={() => (showFormula = !showFormula)}
            aria-expanded={showFormula}>Reference formulas</button
          >
        </div>
        {#if showFormula}<div class="formula-note">
            <p>
              Direct hit combines Strength / Magic, weapon damage, the selected
              skill coefficient, and fixed damage. Summon hit applies its stat
              multiplier and attack coefficient.
            </p>
            <p>
              Defense after penetration, flat damage reduction, monster
              domination, minimum / maximum damage, critical resistance, and
              final damage options are then applied in the wiki's order.
            </p>
            <a
              href="https://latale.wiki/tools/spec-analyzer"
              target="_blank"
              rel="noreferrer">View primary reference ↗</a
            >
          </div>{/if}
        <div class="actual-controls">
          <label
            >Attack type<select
              value={hybrid
                ? actualSide
                : stats.isPhysicalJob
                  ? "physical"
                  : "magical"}
              onchange={(e) => {
                if (hybrid) actualSide = e.currentTarget.value as E.CombatSide;
                else
                  workspace.stats.isPhysicalJob =
                    e.currentTarget.value === "physical";
              }}
              ><option value="physical">Physical</option><option value="magical"
                >Magical</option
              ></select
            ></label
          ><label
            >Target<select
              value={actualBoss ? "boss" : "normal"}
              onchange={(e) => (actualBoss = e.currentTarget.value === "boss")}
              ><option value="normal">Normal monster</option><option
                value="boss">Boss monster</option
              ></select
            ></label
          >{#each [["Back attack", "backAttack"], ["Close range", "melee"], ["Status effect", "status"]] as row (row[1])}<label
              class="check"
              ><input
                type="checkbox"
                checked={Boolean(actualInput[row[1] as keyof E.ReferenceInput])}
                onchange={(e) => setReference(row[1], e.currentTarget.checked)}
              />{row[0]}</label
            >{/each}
        </div>
        <div class="actual-grid">
          {#each actualGroups as group (group.title)}<fieldset>
              <legend>{group.title}</legend
              >{#each group.fields.filter((row) => row[1] !== "weaponMin" || (hybrid ? actualSide === "physical" : stats.isPhysicalJob)) as row (row[1])}<NumberField
                  label={row[0]}
                  bind:value={
                    () =>
                      (Number(actualInput[row[1] as keyof E.ReferenceInput]) ||
                        0) / (row[1] === "elasticity" ? 10 : 1),
                    (v) => updateActual(row[1], v)
                  }
                  min={row[1] === "summonCoef" ? -100 : 0}
                  max={["penetration", "guard", "elasticity"].includes(row[1])
                    ? 100
                    : undefined}
                  compact
                />{/each}
            </fieldset>{/each}
        </div>
        <div class="damage-ranges">
          {#each rangeRows as row (row[1])}<article class="data-card">
              <h3>{row[0]}</h3>
              <strong
                >{fmt(actualDamage[row[1]].min)} ~ {fmt(
                  actualDamage[row[1]].max,
                )}</strong
              >
              <p>
                Average ≈ {fmt(
                  E.estimateReferenceAverage(
                    actualInput,
                    row[1].startsWith("summon"),
                    row[1].endsWith("Crit"),
                  ) ??
                    (actualDamage[row[1]].min + actualDamage[row[1]].max) / 2,
                )}
              </p>
            </article>{/each}
        </div>
      </section>
    {/if}
    {#if activeTab === "basic" || activeTab === "enchant"}<section
        class="save-section"
      >
        <h3>
          {activeTab === "basic" ? "Base settings" : "Enchant comparison"} save /
          load
        </h3>
        <p>
          Saved locally on this device. Export JSON to keep a portable copy.
        </p>
        <div class="save-controls">
          <input
            aria-label="Specification name"
            placeholder="Specification name"
            bind:value={saveName}
          /><button class="primary-button" onclick={save}>Save</button><select
            aria-label="Saved specification"
            bind:value={selectedSave}
            ><option value="">Select a saved specification</option
            >{#each saves as saved (saved.id)}<option value={saved.id}
                >{saved.name}</option
              >{/each}</select
          ><button disabled={!selectedSave} onclick={load}>Load</button><button
            disabled={!selectedSave}
            onclick={remove}>Delete</button
          ><button
            onclick={() => {
              try {
                downloadSpec(
                  $state.snapshot(workspace),
                  saveName || "specification",
                );
              } catch (error) {
                message =
                  error instanceof Error ? error.message : "Export failed.";
              }
            }}>Export JSON</button
          ><label class="button"
            >Import JSON<input
              class="file-input"
              type="file"
              accept="application/json,.json"
              onchange={importFile}
            /></label
          >
        </div>
      </section>{/if}

    <footer class="sources">
      Reference: <a
        href="https://latale.wiki/tools/spec-analyzer"
        target="_blank"
        rel="noreferrer">LaTale Wiki analyzer</a
      >
      ·
      <a
        href="https://docs.google.com/spreadsheets/d/1ytrf0W-j_FUBsj071Fbuhz6Tx7Qv2EdsoZEmxyvlwaM"
        target="_blank"
        rel="noreferrer">English workbook</a
      >
      ·
      <a
        href="https://docs.google.com/spreadsheets/d/19LMNB8_6JddY-srP4BB2Grxc52KodG75oebjMtK-taM"
        target="_blank"
        rel="noreferrer">Korean workbook</a
      >
    </footer>
    <div class="report-wrap" aria-hidden="true">
      <div class="report-content" bind:this={reportElement}>
        <h1>Specification Analyzer Report</h1>
        <p>
          {label(workspace.selectedJob)} · {label(dungeon.name)} · {settings.damageMode}
          damage
        </p>
        <p>
          Direct: {label(workspace.selectedDirectHit)} Lv. {workspace.directHitLevel}
          · coefficient {fmt(directCoef)} | Placement: {label(
            workspace.selectedPlacement,
          )} Lv. {workspace.placementLevel}
        </p>
        <h2>Current stats and enchant comparison</h2>
        {@render comparisonTable(
          statRows.map(
            ([name, key]) =>
              [name, computed[key], adjusted[key]] as [string, number, number],
          ),
          2,
        )}
        <h2>Base stat conversion summary</h2>
        <table>
          <tbody
            >{#each conversionRows as row (row[0])}<tr
                ><td>{row[0]}</td><td class="numeric">{fmt(row[1], 2)}</td></tr
              >{/each}</tbody
          >
        </table>
        <div class="two-columns">
          {@render contributionPanel(
            "Conditional stat contribution",
            conditionalContribution,
            "",
            "orange",
          )}{@render contributionPanel(
            "Base stat contribution",
            basicContribution,
            "",
            "blue",
          )}
        </div>
        <h2>Damage efficiency</h2>
        <p>
          Damage reduction bypass: normal {fmt(breakthrough("normal"), 2)}% ·
          boss {fmt(breakthrough("boss"), 2)}%
        </p>
        <div class="two-columns">
          {#each efficiencyGroups as group (group.kind)}<div>
              {#each group.rows as row (row.scenario)}<h3>
                  {group.kind === "direct" ? "Direct hit" : "Placement"} · {row.scenario ===
                  "theory"
                    ? "Theoretical normal"
                    : row.scenario === "normal"
                      ? "Dungeon normal"
                      : "Dungeon boss"}
                </h3>
                <table>
                  <thead
                    ><tr
                      ><th>Critical 1% equivalent</th><th>Value</th><th
                        >Reverse</th
                      ></tr
                    ></thead
                  ><tbody
                    >{#each [["Strength / Magic", "critToStrMag", "strMagToCrit"], ["Weapon / Element", "critToWeaponAttr", "weaponAttrToCrit"], ["Fixed damage", "critToFixedDmg", "fixedDmgToCrit"], ["Extra damage", "critToExtraDmg", "extraDmgToCrit"]] as field (field[1])}<tr
                        ><td>{field[0]}</td><td class="numeric"
                          >{fmt(
                            row.values[field[1] as keyof E.EfficiencyResult],
                            2,
                          )}</td
                        ><td class="numeric"
                          >{fmt(
                            row.values[field[2] as keyof E.EfficiencyResult],
                            2,
                          )}</td
                        ></tr
                      >{/each}</tbody
                  >
                </table>{/each}
            </div>{/each}
        </div>
        <h2>Expected damage</h2>
        <table>
          <thead
            ><tr
              ><th>Scenario</th><th>Before</th><th>After</th><th>Change</th></tr
            ></thead
          ><tbody
            >{#each damageComparisons as row (row.label)}<tr
                ><td>{row.label}</td><td class="numeric">{fmt(row.before)}</td
                ><td class="numeric">{fmt(row.after)}</td><td class="numeric"
                  >{percent(ratio(row.before, row.after))}</td
                ></tr
              >{/each}</tbody
          >
        </table>
        <h2>Stat distribution</h2>
        <table>
          <thead
            ><tr
              ><th>Scenario</th>{#each settingLabels as name (name)}<th
                  >{name}</th
                >{/each}</tr
            ></thead
          ><tbody
            >{#each damageRows as row (row[1])}<tr
                ><td>{row[0]}</td>{#each settingKeys as key (key)}<td
                    class="numeric"
                    >{compact(settingComparison[key].damage[row[1]] * 1e8)}</td
                  >{/each}</tr
              >{/each}</tbody
          >
        </table>
        <p class="fine">
          Calculated using the public LaTale Wiki analyzer formulas. Estimates
          depend on supplied stats and reference data.
        </p>
      </div>
    </div>
  </div>
</Tooltip.Provider>

{#snippet contributionPanel(
  title: string,
  items: { name: string; value: number }[],
  note: string,
  color: string,
)}<article class="data-card">
    <h3>{title}</h3>
    <div class="contributions">
      {#each items as item (item.name)}<div>
          <div class="bar-label">
            <span>{item.name}</span><strong>{fmt(item.value)}%</strong>
          </div>
          <div class="bar-track">
            <div
              class={["bar-fill", color]}
              style:width={`${item.value}%`}
            ></div>
          </div>
        </div>{/each}
      <p class="fine">{note}</p>
    </div>
  </article>{/snippet}
{#snippet comparisonTable(
  rows: [string, number, number][],
  decimals: number,
)}<div class="table-scroll">
    <table>
      <thead
        ><tr><th>Stat</th><th>Before</th><th>After</th><th>Difference</th></tr
        ></thead
      ><tbody
        >{#each rows as row (row[0])}<tr
            ><td>{row[0]}</td><td class="numeric">{fmt(row[1], decimals)}</td
            ><td class="numeric">{fmt(row[2], decimals)}</td><td
              class={[
                "numeric",
                row[2] > row[1]
                  ? "positive"
                  : row[2] < row[1]
                    ? "negative"
                    : "",
              ]}>{fmt(row[2] - row[1], decimals)}</td
            ></tr
          >{/each}</tbody
      >
    </table>
  </div>{/snippet}

<style>
  .spec-analyzer {
    --spec-bg: #faf9f6;
    --spec-fg: #24221f;
    --spec-muted: #807a72;
    --spec-border: #e5dfd6;
    --spec-accent: #b65100;
    --spec-soft: #fff7db;
    background: var(--spec-bg);
    color: var(--spec-fg);
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    padding: 32px 28px 36px;
    font-size: 14px;
    line-height: 1.5;
    min-height: calc(100vh - 60px);
  }
  .spec-analyzer.wide {
    max-width: none;
  }
  h1 {
    font-size: 30px;
    letter-spacing: -1px;
    font-weight: 850;
    line-height: 1.2;
    margin: 0;
  }
  h2 {
    font-size: 21px;
    letter-spacing: -0.5px;
    font-weight: 750;
    line-height: 1.35;
    margin: 0;
  }
  h3 {
    font-size: 14px;
    font-weight: 650;
    line-height: 1.4;
    margin: 0;
  }
  h4 {
    font-size: 12px;
    font-weight: 650;
    margin: 14px 0 7px;
  }
  p {
    color: var(--spec-muted);
    margin: 6px 0 0;
  }
  strong {
    font-weight: 700;
  }
  button,
  .button {
    border: 1px solid var(--spec-border);
    background: #f6f4ef;
    color: #7b746c;
    border-radius: 5px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    white-space: nowrap;
    padding: 5px 10px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    line-height: 1.5;
    transition:
      background 0.15s,
      border-color 0.15s;
  }
  button:hover,
  .button:hover {
    background: #ede9e1;
    color: #403b36;
  }
  button:focus-visible,
  .button:focus-visible,
  select:focus-visible,
  textarea:focus-visible,
  input:focus-visible {
    outline: 2px solid var(--spec-accent);
    outline-offset: 2px;
  }
  button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .primary-button {
    background: var(--spec-accent);
    color: white;
    border-color: var(--spec-accent);
    font-weight: 650;
    padding: 7px 12px;
  }
  .primary-button:hover {
    background: #974100;
    color: white;
  }
  .soft-button {
    background: #fff3c4;
    color: var(--spec-accent);
    border-color: transparent;
  }
  .fine {
    font-size: 12px;
    color: var(--spec-muted);
    line-height: 1.65;
  }
  .muted {
    font-weight: 400;
    color: var(--spec-muted);
    font-size: 12px;
  }
  .page-header {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    border-bottom: 1px solid var(--spec-border);
    padding-bottom: 28px;
    margin-bottom: 32px;
  }
  .page-header p {
    font-size: 14px;
    line-height: 1.7;
    margin-top: 9px;
  }
  .page-header .fine {
    font-size: 12px;
    margin-top: 5px;
  }
  .header-actions {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    flex-wrap: wrap;
    justify-content: flex-end;
    flex: none;
  }
  .header-actions > .button,
  .header-actions > button {
    margin-top: 1px;
    padding: 7px 10px;
  }
  .report-menu {
    position: relative;
  }
  .report-options {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 5px;
    display: flex;
    flex-direction: column;
    background: var(--spec-bg);
    padding: 5px;
    border: 1px solid var(--spec-border);
    border-radius: 6px;
    box-shadow: 0 5px 15px #32200018;
    z-index: 5;
  }
  .validation-error {
    padding: 12px;
    border: 1px solid #bd3434;
    border-radius: 4px;
    color: #bd3434;
    margin: 18px 0;
    font-size: 13px;
  }
  .report-options button {
    border: 0;
    background: transparent;
    justify-content: flex-start;
    min-width: 135px;
  }
  .common-settings {
    border-top: 1px solid var(--spec-border);
    border-bottom: 1px solid var(--spec-border);
    margin-bottom: 24px;
    padding: 20px 0 18px;
  }
  .section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
  }
  .section-heading h2 {
    font-size: 20px;
  }
  .section-heading p {
    font-size: 13px;
  }
  .common-settings > .section-heading {
    padding-bottom: 16px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--spec-border);
  }
  .shared-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 50px;
    row-gap: 4px;
    max-width: 850px;
    margin-left: auto;
  }
  .shared-fields > label {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 180px;
    align-items: center;
    gap: 12px;
    text-align: right;
    font-size: 12px;
  }
  .shared-fields :global(.spec-number) {
    grid-template-columns: minmax(0, 1fr) 180px;
  }
  .shared-fields :global(.spec-number label) {
    text-align: right;
    color: var(--spec-fg);
  }
  .shared-fields :global(input) {
    border-color: #454039;
    height: 25px;
  }
  select {
    border: 1px solid #454039;
    border-radius: 4px;
    background: var(--spec-bg);
    color: var(--spec-fg);
    padding: 2px 6px;
    min-height: 25px;
    min-width: 0;
    max-width: 100%;
    font-size: 12px;
  }
  input[type="checkbox"] {
    accent-color: var(--spec-accent);
    width: 13px;
    height: 13px;
    flex: none;
  }
  input:not([type]) {
    border: 1px solid var(--spec-border);
    background: var(--spec-bg);
    border-radius: 4px;
    padding: 6px 8px;
    font-size: 12px;
    color: var(--spec-fg);
    min-width: 0;
  }
  .coefficient-summary {
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    color: var(--spec-muted);
    font-size: 12px;
    margin-top: 12px;
  }
  .coefficient-summary strong {
    font-size: 14px;
    color: var(--spec-fg);
    margin-left: 3px;
  }
  .advanced {
    border-top: 1px solid var(--spec-border);
    margin-top: 17px;
    padding-top: 16px;
  }
  .advanced-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
  fieldset {
    min-width: 0;
    border: 0;
    padding: 0;
    margin: 0;
  }
  legend {
    font-size: 13px;
    font-weight: 650;
    margin-bottom: 9px;
    width: 100%;
  }
  legend label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .stack-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 12px;
    color: var(--spec-muted);
    padding: 5px 0;
  }
  .stack-label select {
    width: 180px;
  }
  .check {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--spec-muted);
  }
  .measurement {
    display: flex;
    align-items: center;
    gap: 25px;
    flex-wrap: wrap;
    border-top: 1px solid var(--spec-border);
    padding-top: 15px;
    margin-top: 18px;
  }
  .measurement p {
    font-size: 12px;
  }
  .tabs {
    display: flex;
    gap: 3px;
    border-bottom: 1px solid var(--spec-border);
    overflow-x: auto;
    margin-bottom: 23px;
  }
  .tabs button {
    border: 0;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    background: transparent;
    padding: 10px 15px;
    font-size: 13px;
    color: var(--spec-muted);
  }
  .tabs button:hover {
    color: var(--spec-accent);
    background: #f6f1e7;
  }
  .tabs button.active {
    border-bottom-color: var(--spec-accent);
    color: var(--spec-accent);
    background: #fdf8e5;
  }
  .actions {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
  }
  .status-message {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #e9d4b9;
    background: #fff7e9;
    color: #845628;
    padding: 7px 11px;
    font-size: 12px;
    border-radius: 4px;
    margin-bottom: 14px;
  }
  .status-message button {
    background: transparent;
    border: 0;
    font-size: 17px;
    padding: 0 3px;
  }
  .support-settings {
    border: 1px solid var(--spec-border);
    border-radius: 5px;
    padding: 13px 15px;
    margin-bottom: 25px;
  }
  .support-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px 22px;
    margin-top: 8px;
  }
  .support-grid :global(.spec-number) {
    grid-template-columns: minmax(0, 1fr) 90px;
  }
  .support-grid.hp {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .support-grid.hp :global(.spec-number) {
    grid-template-columns: minmax(0, 1fr) 95px;
  }
  .support-grid .stack-label {
    display: grid;
    grid-template-columns: 1fr 100px;
  }
  .support-grid .stack-label select {
    width: 100%;
  }
  .support-settings h4 {
    border-top: 1px solid var(--spec-border);
    padding-top: 12px;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: 1.12fr 1fr;
    gap: 16px;
  }
  .table-scroll {
    width: 100%;
    overflow-x: auto;
    border: 1px solid var(--spec-border);
    border-radius: 4px;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 12px;
  }
  th,
  td {
    padding: 7px 11px;
    text-align: left;
    line-height: 1.45;
  }
  th {
    font-weight: 600;
    background: #eeeae3;
    color: #625d56;
    white-space: nowrap;
  }
  th:not(:first-child) {
    text-align: right;
  }
  tbody tr:nth-child(even) {
    background: #f0ede74d;
  }
  td {
    color: var(--spec-muted);
  }
  td.numeric {
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-variant-numeric: tabular-nums;
    text-align: right;
    font-weight: 600;
    color: var(--spec-fg);
    white-space: nowrap;
  }
  td small {
    display: block;
    font-weight: 500;
    font-size: 10px;
    margin-top: 3px;
  }
  .contribution-panels {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .data-card {
    border: 1px solid var(--spec-border);
    border-radius: 4px;
    padding: 10px 12px;
    min-width: 0;
  }
  .data-card h3 {
    font-size: 13px;
    margin-bottom: 9px;
  }
  .contributions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .bar-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: var(--spec-muted);
    margin-bottom: 3px;
  }
  .bar-label strong {
    font-family: ui-monospace, monospace;
    color: var(--spec-fg);
  }
  .bar-track {
    height: 7px;
    background: #e6e1d8;
    border-radius: 20px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    border-radius: 20px;
  }
  .bar-fill.orange {
    background: #cc8940;
  }
  .bar-fill.blue {
    background: #6f98b0;
  }
  .split-note {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-block: 1px solid var(--spec-border);
    margin: 31px 0 30px;
    color: var(--spec-muted);
    font-size: 13px;
    font-weight: 600;
  }
  .split-note span {
    padding: 13px 12px;
  }
  .split-note span + span {
    border-left: 1px solid var(--spec-border);
  }
  .subnote {
    font-size: 13px;
    margin-bottom: 32px;
  }
  .efficiency-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .efficiency-grid > div {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .efficiency-table {
    font-size: 11px;
    margin-top: 9px;
  }
  .efficiency-table td {
    padding: 6px 2px;
    background: transparent;
  }
  .efficiency-table tr {
    background: none;
  }
  .efficiency-table td:last-child {
    text-align: right;
    font-size: 10px;
  }
  .efficiency-table .numeric {
    font-size: 13px;
  }
  .efficiency-grid .data-card p {
    font-size: 12px;
  }
  .two-columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
  .two-columns .data-card {
    padding: 13px 18px;
  }
  .table-title {
    font-size: 15px;
    margin: 25px 0 11px;
  }
  .table-title .muted {
    float: right;
  }
  .positive {
    color: #318263 !important;
  }
  .negative {
    color: #c14948 !important;
  }
  .setting-intro {
    font-size: 13px;
    margin: 22px 0;
  }
  .setting-intro p {
    margin: 5px 0;
  }
  .setting-intro strong {
    color: var(--spec-fg);
    font-family: ui-monospace, monospace;
  }
  .distribution {
    padding: 36px 10px 0;
    position: relative;
    margin: 10px 10px 0;
  }
  .marker {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    font-size: 11px;
    background: #373833;
    color: white;
    padding: 2px 7px;
    border-radius: 3px;
    font-family: ui-monospace, monospace;
  }
  .marker span {
    position: absolute;
    top: 18px;
    left: 40%;
    color: #373833;
    font-size: 9px;
  }
  .distribution-line {
    height: 7px;
    border-radius: 10px;
    background: #e5e0d7;
    border: 1px solid #d2ccc2;
  }
  .distribution-labels {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    padding-top: 7px;
    font-size: 10px;
    color: var(--spec-muted);
  }
  .distribution-summary {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    border-top: 1px solid var(--spec-border);
    margin: 16px -12px -10px;
    padding: 10px 15px;
    font-size: 12px;
    color: var(--spec-muted);
    background: #f1eee755;
  }
  .current-cell {
    background: #fff8df !important;
  }
  .skill-class {
    display: flex;
    align-items: center;
    gap: 15px;
    margin: 24px 0;
    font-size: 12px;
  }
  .skill-class select {
    width: 220px;
  }
  .actual-controls {
    display: flex;
    gap: 22px;
    flex-wrap: wrap;
    align-items: center;
    margin: 23px 0;
  }
  .actual-controls > label:not(.check) {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
  }
  .actual-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }
  .actual-grid fieldset {
    border: 1px solid var(--spec-border);
    border-radius: 5px;
    padding: 10px;
  }
  .actual-grid legend {
    padding: 0 5px;
    width: auto;
    font-size: 13px;
  }
  .actual-grid :global(.spec-number.compact) {
    grid-template-columns: minmax(0, 1fr) 92px;
    gap: 5px !important;
    font-size: 11px;
    min-height: 40px;
  }
  .actual-grid :global(.spec-number input) {
    font-size: 11px;
    padding: 4px;
  }
  .damage-ranges {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 22px;
  }
  .damage-ranges strong {
    font-size: 17px;
    font-family: ui-monospace, monospace;
    font-weight: 650;
  }
  .damage-ranges p {
    font-size: 12px;
    margin-top: 7px;
  }
  .formula-note {
    border: 1px solid var(--spec-border);
    padding: 12px 16px;
    margin: 15px 0;
    font-size: 12px;
    border-radius: 5px;
  }
  .formula-note a {
    color: var(--spec-accent);
    display: inline-block;
    margin-top: 10px;
  }
  .save-section {
    border-top: 1px solid var(--spec-border);
    padding-top: 20px;
    margin-top: 28px;
  }
  .save-section p {
    font-size: 12px;
  }
  .save-controls {
    display: flex;
    gap: 7px;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 12px;
  }
  .save-controls select {
    max-width: 230px;
    min-height: 30px;
  }
  .file-input {
    display: none;
  }
  .import-section {
    border: 1px solid var(--spec-border);
    padding: 15px;
    margin-top: 22px;
    border-radius: 5px;
  }
  .import-section p {
    font-size: 12px;
    margin-bottom: 10px;
  }
  textarea {
    width: 100%;
    border: 1px solid var(--spec-border);
    background: var(--spec-bg);
    color: var(--spec-fg);
    border-radius: 5px;
    font-size: 12px;
    font-family: ui-monospace, monospace;
    padding: 10px;
    resize: vertical;
    margin-bottom: 10px;
  }
  .sources {
    border-top: 1px solid var(--spec-border);
    padding-top: 18px;
    margin-top: 35px;
    font-size: 11px;
    color: var(--spec-muted);
  }
  .sources a {
    color: #9b672d;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .report-wrap {
    position: fixed;
    left: -12000px;
    top: 0;
    pointer-events: none;
  }
  .report-content {
    width: 900px;
    padding: 28px;
    background: #faf9f6;
    color: #24221f;
  }
  .report-content h1 {
    font-size: 25px;
  }
  .report-content h2 {
    font-size: 17px;
    margin: 22px 0 9px;
  }
  .report-content p {
    font-size: 12px;
  }
  .report-content .table-scroll {
    overflow: visible;
  }
  .report-content th,
  .report-content td {
    font-size: 10px;
    padding: 6px 9px;
  }
  @media (min-width: 1600px) {
    .spec-analyzer {
      padding: 40px;
    }
  }
  @media (max-width: 1200px) {
    .page-header {
      flex-direction: column;
    }
    .header-actions {
      justify-content: flex-start;
    }
    .shared-fields {
      column-gap: 25px;
    }
    .actual-grid {
      grid-template-columns: 1fr 1fr;
    }
    .support-grid {
      grid-template-columns: 1fr 1fr;
    }
    .support-grid.hp {
      grid-template-columns: 1fr 1fr;
    }
    .section-heading {
      flex-wrap: wrap;
    }
    .efficiency-grid {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 760px) {
    .spec-analyzer {
      padding: 24px 16px;
    }
    h1 {
      font-size: 26px;
    }
    .page-header {
      margin-bottom: 24px;
    }
    .shared-fields {
      grid-template-columns: 1fr;
      row-gap: 6px;
    }
    .shared-fields > label {
      grid-template-columns: minmax(0, 1fr) 180px;
    }
    .shared-fields :global(.spec-number) {
      grid-template-columns: minmax(0, 1fr) 180px;
    }
    .shared-fields > label:nth-child(2) {
      order: 5;
    }
    .summary-grid,
    .two-columns,
    .advanced-grid {
      grid-template-columns: 1fr;
    }
    .coefficient-summary {
      gap: 7px 15px;
    }
    .coefficient-summary strong {
      font-size: 12px;
    }
    .support-grid,
    .support-grid.hp {
      grid-template-columns: 1fr;
    }
    .support-grid :global(.spec-number) {
      grid-template-columns: minmax(0, 1fr) 112px;
    }
    .support-grid .stack-label {
      grid-template-columns: 1fr 150px;
    }
    .split-note {
      grid-template-columns: 1fr;
      margin: 20px 0;
    }
    .split-note span + span {
      border-left: 0;
      border-top: 1px solid var(--spec-border);
    }
    .actual-grid,
    .damage-ranges {
      grid-template-columns: 1fr;
    }
    .damage-ranges strong {
      font-size: 16px;
    }
    .actual-grid :global(.spec-number.compact) {
      grid-template-columns: minmax(0, 1fr) 130px;
      min-height: 33px;
    }
    .distribution-labels {
      font-size: 8px;
      gap: 5px;
    }
    .distribution-summary {
      gap: 10px;
    }
    .header-actions {
      gap: 5px;
    }
    .header-actions button,
    .header-actions .button {
      font-size: 11px;
      padding: 6px 8px;
    }
    .tabs button {
      font-size: 12px;
      padding: 9px 11px;
    }
    .efficiency-table td:last-child {
      font-size: 9px;
    }
    .efficiency-table .numeric {
      font-size: 12px;
    }
    .save-controls {
      align-items: stretch;
    }
    .save-controls input,
    .save-controls select {
      flex: 1;
      min-width: 160px;
    }
  }
  @media (min-width: 761px) and (max-width: 1050px) {
    .shared-fields,
    .summary-grid,
    .two-columns,
    .advanced-grid,
    .actual-grid,
    .damage-ranges,
    .support-grid,
    .support-grid.hp {
      grid-template-columns: 1fr;
    }
  }
  .report-content .two-columns {
    grid-template-columns: 1fr 1fr;
  }
  @media print {
    .page-header,
    .common-settings,
    .tabs,
    .sources,
    .save-section,
    .status-message,
    .import-section {
      display: none;
    }
    .spec-analyzer {
      max-width: none;
      padding: 0;
    }
    .spec-analyzer > section {
      display: none;
    }
    .report-wrap {
      position: static;
    }
    .report-content {
      width: 100%;
      padding: 0;
    }
  }
</style>
