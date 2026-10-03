<script lang="ts">
  import * as E from "$lib/spec-engine/engine.js";
  import Help from "./Help.svelte";
  let {
    computed,
    adjusted,
    directCoef,
    placement,
    dungeon,
    adjustedCoefs,
    settings,
    part = "details",
  }: {
    computed: E.ComputedStats;
    adjusted: E.ComputedStats;
    directCoef: number;
    placement: E.PlacementCoefs;
    dungeon: E.Dungeon;
    adjustedCoefs: {
      directHitCoef: number;
      placementStrMagMult: number;
      placementTotalMult: number;
    };
    settings: E.CalculationSettings;
    part?: "gains" | "details";
  } = $props();
  const fmt = (n: number, d = 2) =>
    Number.isFinite(n)
      ? n.toLocaleString("en-US", {
          minimumFractionDigits: d,
          maximumFractionDigits: d,
        })
      : "—";
  const pct = (n: number) => (n > 0 ? "+" : "") + fmt(n) + "%";
  const ratio = (before: number, after: number) =>
    before ? (after / before - 1) * 100 : 0;
  const compact = (n: number) =>
    Math.abs(n) >= 1e9
      ? fmt(n / 1e9) + "B"
      : Math.abs(n) >= 1e6
        ? fmt(n / 1e6) + "M"
        : fmt(n, 0);
  const contexts = [
    {
      key: "theory",
      label: "Theoretical normal",
      scenario: "theory",
      target: false,
    },
    {
      key: "bossTheory",
      label: "Theoretical boss",
      scenario: "boss",
      target: false,
    },
    {
      key: "normal",
      label: "Dungeon normal",
      scenario: "normal",
      target: true,
    },
    { key: "boss", label: "Dungeon boss", scenario: "boss", target: true },
  ] as const;
  let options = $derived({
    damageMode: settings.damageMode,
    backAttackRate: settings.backAttackRate,
  });
  const calculate = (
    s: E.ComputedStats,
    kind: "direct" | "placement",
    scenario: E.Scenario,
    target: E.Dungeon | undefined,
    after = false,
    back?: number,
  ) => {
    const opt =
      back === undefined ? options : { ...options, backAttackRate: back };
    return kind === "direct"
      ? E.calcDirectHitDamage(
          s,
          after ? adjustedCoefs.directHitCoef : directCoef,
          scenario,
          opt,
          target,
        )
      : E.calcPlacementDamage(
          s,
          placement.weaponAttrCoef,
          after ? adjustedCoefs.placementStrMagMult : placement.strMagMult,
          after ? adjustedCoefs.placementTotalMult : placement.totalMult,
          scenario,
          opt,
          target,
        );
  };
  let analysis = $derived.by(() => {
    try {
      const changes = (["direct", "placement"] as const).flatMap((kind) =>
        contexts.map((c) => ({
          key: kind + c.key,
          label: `${kind === "direct" ? "Direct" : "Placement"} · ${c.label}`,
          before: calculate(
            computed,
            kind,
            c.scenario,
            c.target ? dungeon : undefined,
          ),
          after: calculate(
            adjusted,
            kind,
            c.scenario,
            c.target ? dungeon : undefined,
            true,
          ),
        })),
      );
      const bypass = (s: E.ComputedStats, after: boolean, boss: boolean) => {
        const scenario = boss ? "boss" : "normal";
        const baseline = E.calcDirectHitDamage(
          s,
          after ? adjustedCoefs.directHitCoef : directCoef,
          boss ? "boss" : "theory",
          { damageMode: "average", backAttackRate: 0 },
        );
        return baseline
          ? (E.calcDirectHitDamage(
              s,
              after ? adjustedCoefs.directHitCoef : directCoef,
              scenario,
              { damageMode: "average", backAttackRate: 0 },
              dungeon,
            ) /
              baseline) *
              100
          : 0;
      };
      const bypassRows = [false, true].map((boss) => ({
        label: boss ? "Boss monsters" : "Normal monsters",
        before: bypass(computed, false, boss),
        after: bypass(adjusted, true, boss),
      }));
      const backRows = [
        {
          label: "Direct · Theoretical normal",
          kind: "direct",
          scenario: "theory",
          target: false,
        },
        {
          label: "Direct · Dungeon boss",
          kind: "direct",
          scenario: "boss",
          target: true,
        },
        {
          label: "Placement · Dungeon boss",
          kind: "placement",
          scenario: "boss",
          target: true,
        },
      ].map((r) => ({
        label: r.label,
        before: calculate(
          computed,
          r.kind as "direct" | "placement",
          r.scenario as E.Scenario,
          r.target ? dungeon : undefined,
          false,
          100,
        ),
        after: calculate(
          adjusted,
          r.kind as "direct" | "placement",
          r.scenario as E.Scenario,
          r.target ? dungeon : undefined,
          true,
          100,
        ),
      }));
      const beforeEfficiency = E.calcDirectHitEfficiencyTheory(
        computed,
        directCoef,
        settings.backAttackRate,
      );
      const afterEfficiency = E.calcDirectHitEfficiencyTheory(
        adjusted,
        adjustedCoefs.directHitCoef,
        settings.backAttackRate,
      );
      return {
        changes,
        bypassRows,
        backRows,
        beforeEfficiency,
        afterEfficiency,
        error: "",
      };
    } catch (error) {
      return {
        changes: [],
        bypassRows: [],
        backRows: [],
        beforeEfficiency: null,
        afterEfficiency: null,
        error:
          error instanceof Error
            ? error.message
            : "Check the replacement options.",
      };
    }
  });
  const efficiencyRows = [
    ["Critical 1% ≈ Strength / Magic", "critToStrMag"],
    ["Critical 1% ≈ Weapon / Element", "critToWeaponAttr"],
    ["Critical 1% ≈ Fixed damage", "critToFixedDmg"],
    ["Critical 1% ≈ Extra damage", "critToExtraDmg"],
    ["Strength / Magic 1% ≈ Critical", "strMagToCrit"],
    ["Weapon / Element 1% ≈ Critical", "weaponAttrToCrit"],
    ["Fixed damage 1% ≈ Critical", "fixedDmgToCrit"],
    ["Extra damage 1% ≈ Critical", "extraDmgToCrit"],
  ] as const;
</script>

{#if analysis.error}<p class="error" role="alert">{analysis.error}</p>
{:else if part === "gains"}
  <div class="heading">
    <h3>
      Damage increase % <Help
        text="Removes the existing options, adds the new options, and recalculates the same direct or placement attack for every target."
      />
    </h3>
    <span
      >{settings.damageMode === "average" ? "Average" : "Maximum"} damage</span
    >
  </div>
  <div class="gain-grid">
    {#each analysis.changes as row (row.key)}<div>
        <span>{row.label}</span><strong
          class={[
            row.after > row.before && "positive",
            row.after < row.before && "negative",
          ]}>{pct(ratio(row.before, row.after))}</strong
        >
      </div>{/each}
  </div>
  <div class="bypass">
    <h4>Damage reduction bypass change</h4>
    {#each analysis.bypassRows as row (row.label)}<div>
        <span>{row.label}</span><strong
          >{fmt(row.before)}% → {fmt(row.after)}%
          <small
            >({row.after - row.before > 0 ? "+" : ""}{fmt(
              row.after - row.before,
            )} pp)</small
          ></strong
        >
      </div>{/each}
  </div>
{:else}
  <h3>
    Back attack damage estimates <Help
      text="Compares full back-attack hits. Direct attacks use your back attack damage; summoned attacks use the wiki's fixed summon back-attack bonus."
    />
  </h3>
  <div class="table-scroll">
    <table>
      <thead
        ><tr><th>Scenario</th><th>Before</th><th>After</th><th>Change</th></tr
        ></thead
      ><tbody
        >{#each analysis.backRows as row (row.label)}<tr
            ><td>{row.label}</td><td>{compact(row.before)}</td><td
              >{compact(row.after)}</td
            ><td
              class={[
                row.after > row.before && "positive",
                row.after < row.before && "negative",
              ]}>{pct(ratio(row.before, row.after))}</td
            ></tr
          >{/each}</tbody
      >
    </table>
  </div>
  <h3>
    Direct hit stat efficiency comparison (theoretical) <Help
      text="Shows how replacing options changes the equivalent value of raw stats and percent bonuses, using critical damage as the reference."
    />
  </h3>
  <p class="fine">
    Strength / Magic efficiency {fmt(computed.strMagEfficiency, 0)}% → {fmt(
      adjusted.strMagEfficiency,
      0,
    )}%
  </p>
  <div class="table-scroll">
    <table>
      <thead><tr><th>Stat</th><th>Before</th><th>After</th></tr></thead><tbody
        >{#each efficiencyRows as row (row[1])}<tr
            ><td>{row[0]}</td><td
              >{fmt(analysis.beforeEfficiency?.[row[1]] ?? 0)}</td
            ><td>{fmt(analysis.afterEfficiency?.[row[1]] ?? 0)}</td></tr
          >{/each}</tbody
      >
    </table>
  </div>
{/if}

<style>
  h3 {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    font-weight: 700;
    margin: 26px 0 10px;
  }
  h4 {
    font-weight: 600;
    font-size: 12px;
    margin-bottom: 10px;
  }
  .heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .heading span,
  .fine {
    font-size: 12px;
    color: var(--spec-muted, #79756f);
  }
  .gain-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 20px;
  }
  .gain-grid > div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 10px;
    border: 1px solid var(--spec-border, #e4dfd6);
    border-radius: 4px;
    font-size: 12px;
  }
  .gain-grid strong {
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .bypass {
    border-top: 1px solid var(--spec-border, #e4dfd6);
    margin-top: 18px;
    padding: 15px 0;
    font-size: 12px;
  }
  .bypass > div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 5px 0;
  }
  .bypass small {
    font-weight: 400;
  }
  .table-scroll {
    overflow-x: auto;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 12px;
  }
  th,
  td {
    padding: 8px 10px;
    border-bottom: 1px solid var(--spec-border, #e4dfd6);
    text-align: right;
    white-space: nowrap;
  }
  th {
    background: var(--spec-surface, #f3f1ec);
    color: var(--spec-muted, #79756f);
    font-weight: 600;
  }
  td {
    font-variant-numeric: tabular-nums;
  }
  th:first-child,
  td:first-child {
    text-align: left;
  }
  tbody tr:nth-child(even) {
    background: #f5f3ef66;
  }
  .positive {
    color: #14804a;
  }
  .negative,
  .error {
    color: #bd3434;
  }
  .error {
    padding: 12px;
    font-size: 13px;
    border: 1px solid currentColor;
    border-radius: 4px;
  }
  @media (max-width: 620px) {
    .gain-grid {
      grid-template-columns: 1fr;
    }
    .heading {
      align-items: flex-start;
    }
    .bypass > div {
      flex-wrap: wrap;
    }
  }
</style>
