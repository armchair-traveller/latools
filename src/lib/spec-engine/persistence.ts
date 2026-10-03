/** Local saves and portable reports for the rebuilt wiki analyzer. */
export type Workspace = Record<string, any>;
export type SavedSpec = {
  id: string;
  name: string;
  createdAt: string;
  data: Workspace;
};
const STORAGE_KEY = "latools.wiki-spec-analyzer.v1";
const DRAFT_STORAGE_KEY = "latools.wiki-spec-analyzer.draft.v1";
const numericStats = [
  "strMagPlus",
  "strMagPercent",
  "weaponAttrPlus",
  "weaponAttrPercent",
  "critDmgPlus",
  "critDmgPercent",
  "minDmgPlus",
  "minDmgPercent",
  "maxDmgPlus",
  "maxDmgPercent",
  "fixedDmgPlus",
  "fixedDmgPercent",
  "normalExtraDmgPlus",
  "normalExtraDmgPercent",
  "bossExtraDmgPlus",
  "bossExtraDmgPercent",
  "normalDomination",
  "bossDomination",
  "penetration",
  "placementCoreLevel",
  "backAttackDmg",
  "strMagEfficiency",
];

function object(value: unknown): value is Record<string, any> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function assertSafe(value: unknown, depth = 0): void {
  if (depth > 12) throw new Error("The file contains too many nested values.");
  if (typeof value === "number" && !Number.isFinite(value))
    throw new Error("All numeric values must be finite.");
  if (Array.isArray(value)) value.forEach((v) => assertSafe(v, depth + 1));
  else if (object(value))
    for (const [key, v] of Object.entries(value)) {
      if (["__proto__", "prototype", "constructor"].includes(key))
        throw new Error("The file contains an unsupported property.");
      assertSafe(v, depth + 1);
    }
}
function validateWorkspace(value: unknown): Workspace {
  if (!object(value) || !object(value.stats))
    throw new Error(
      "Choose an analyzer export or a collected character stats JSON file.",
    );
  assertSafe(value);
  for (const key of numericStats) {
    if (
      typeof value.stats[key] !== "number" ||
      !Number.isFinite(value.stats[key]) ||
      value.stats[key] < 0
    )
      throw new Error(
        `Missing or invalid stat: ${key}. Use a nonnegative number.`,
      );
  }
  if (value.stats.penetration > 100)
    throw new Error("Penetration cannot exceed 100%.");
  if (typeof value.stats.isPhysicalJob !== "boolean")
    throw new Error("The physical/magical attack type is missing.");
  if ("hybridStats" in value.stats) {
    if (!object(value.stats.hybridStats))
      throw new Error("Invalid hybrid stats.");
    for (const side of ["physical", "magical"]) {
      const values = value.stats.hybridStats[side];
      if (
        values !== undefined &&
        (!object(values) ||
          Object.values(values).some(
            (v) => typeof v !== "number" || !Number.isFinite(v) || v < 0,
          ) ||
          values.penetration > 100)
      )
        throw new Error(`Invalid ${side} hybrid stats.`);
    }
  }
  if ("reference" in value.stats) {
    if (!object(value.stats.reference))
      throw new Error("Invalid actual damage inputs.");
    for (const [key, v] of Object.entries(value.stats.reference)) {
      if (key === "attackType") {
        if (!["physical", "magical"].includes(String(v)))
          throw new Error("Invalid attack type.");
      } else if (["backAttack", "melee", "status"].includes(key)) {
        if (typeof v !== "boolean")
          throw new Error(`Invalid actual damage input: ${key}.`);
      } else if (
        typeof v !== "number" ||
        !Number.isFinite(v) ||
        v < (key === "summonCoef" ? -100 : 0) ||
        (["guard", "penetration"].includes(key) && v > 100) ||
        (key === "elasticity" && v > 1000)
      )
        throw new Error(`Invalid actual damage input: ${key}.`);
    }
  }
  for (const key of [
    "selectedSummon",
    "selectedJob",
    "selectedDirectHit",
    "selectedPlacement",
    "selectedDungeon",
  ]) {
    if (key in value && typeof value[key] !== "string")
      throw new Error(`Invalid selection: ${key}.`);
  }
  for (const key of [
    "directHitLevel",
    "placementLevel",
    "directHitIndicatorCoef",
    "summonIndicatorReflection",
  ]) {
    if (
      key in value &&
      (typeof value[key] !== "number" || !Number.isFinite(value[key]))
    )
      throw new Error(`Invalid number: ${key}.`);
  }
  for (const key of ["oldEnchant", "newEnchant", "hpBase"]) {
    if (
      key in value &&
      (!object(value[key]) ||
        Object.values(value[key]).some(
          (v) => typeof v !== "number" || !Number.isFinite(v),
        ))
    )
      throw new Error(`Invalid values: ${key}.`);
  }
  if ("calculationSettings" in value) {
    const settings = value.calculationSettings;
    if (!object(settings)) throw new Error("Invalid calculation settings.");
    for (const [key, v] of Object.entries(settings)) {
      if (key === "damageMode") {
        if (!["average", "maximum"].includes(String(v)))
          throw new Error("Invalid damage mode.");
      } else if (key === "referenceStat") {
        if (!["crit", "minimum", "maximum", "minmax"].includes(String(v)))
          throw new Error("Invalid efficiency reference.");
      } else if (key.startsWith("useCustom")) {
        if (typeof v !== "boolean") throw new Error(`Invalid setting: ${key}.`);
      } else if (
        typeof v !== "number" ||
        !Number.isFinite(v) ||
        v < 0 ||
        (["backAttackRate", "normalGuard", "bossGuard"].includes(key) &&
          v > 100) ||
        (["normalElasticity", "bossElasticity"].includes(key) && v > 1000)
      )
        throw new Error(`Invalid setting: ${key}.`);
    }
  }
  return structuredClone(value);
}

/** Packet field IDs and detail names are from the wiki's public import mapping. */
function packetWorkspace(packet: Record<string, any>): Workspace {
  const detail = object(packet.stats.detail) ? packet.stats.detail : {};
  const raw = new Map<number, number>();
  for (const row of packet.stats.raw) {
    if (
      object(row) &&
      typeof row.id === "number" &&
      typeof row.value === "number" &&
      Number.isFinite(row.value)
    )
      raw.set(row.id, row.value);
  }
  const physical = !(
    Number(detail.magicBonus ?? 0) > Number(detail.strengthBonus ?? 0)
  );
  const number = (v: unknown) =>
    typeof v === "number" && Number.isFinite(v) ? v : 0;
  const stats: Record<string, any> = Object.fromEntries(
    numericStats.map((key) => [key, 0]),
  );
  const combatSide = (isPhysical: boolean): Record<string, number> => {
    const side: Record<string, number> = {};
    const fields = isPhysical
      ? [
          "strengthBonus",
          "strengthBonusPercent",
          "weaponBonusMax",
          "weaponBonusMaxPercent",
          "piercePhysical",
          "backAttackPhysical",
        ]
      : [
          "magicBonus",
          "magicBonusPercent",
          "attributeBonus",
          "attributeBonusPercent",
          "pierceMagical",
          "backAttackMagical",
        ];
    [
      "strMagPlus",
      "strMagPercent",
      "weaponAttrPlus",
      "weaponAttrPercent",
      "penetration",
      "backAttackDmg",
    ].forEach((key, index) => (side[key] = number(detail[fields[index]])));
    const ids = isPhysical
      ? [198, 199, 190, 191, 192, 193, 202, 203, 207]
      : [200, 201, 194, 195, 196, 197, 204, 205, 209];
    [
      "critDmgPlus",
      "critDmgPercent",
      "minDmgPlus",
      "minDmgPercent",
      "maxDmgPlus",
      "maxDmgPercent",
      "fixedDmgPlus",
      "fixedDmgPercent",
      "strMagEfficiency",
    ].forEach((key, index) => (side[key] = raw.get(ids[index]) ?? 0));
    return side;
  };
  const hybridStats = {
    physical: combatSide(true),
    magical: combatSide(false),
  };
  Object.assign(stats, physical ? hybridStats.physical : hybridStats.magical);
  // Keep both independently collected sides for Phantom Mage and later class changes.
  stats.hybridStats = hybridStats;
  [
    "normalExtraDmgPlus",
    "normalExtraDmgPercent",
    "bossExtraDmgPlus",
    "bossExtraDmgPercent",
  ].forEach((key, index) => (stats[key] = raw.get(231 + index) ?? 0));
  stats.normalDomination = number(detail.controlNormalPermille) / 10;
  stats.bossDomination = number(detail.controlBossPermille) / 10;
  stats.isPhysicalJob = physical;
  if (physical && typeof detail.weaponBonusMin === "number")
    stats.reference = {
      weaponMin:
        number(detail.weaponBonusMin) *
        (1 + number(detail.weaponBonusMinPercent) / 100),
    };
  return { stats, selectedSummon: "없음" };
}

export function parseSpecImport(text: string): Workspace {
  if (text.length > 2_000_000)
    throw new Error("The JSON file is too large (maximum 2 MB).");
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  assertSafe(value);
  if (object(value) && object(value.stats) && Array.isArray(value.stats.raw))
    return validateWorkspace(packetWorkspace(value));
  if (object(value) && "version" in value && value.version !== 1)
    throw new Error("This analyzer export version is not supported.");
  return validateWorkspace(
    object(value) && object(value.data) ? value.data : value,
  );
}

export function readSaves(): SavedSpec[] {
  if (typeof localStorage === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  let saves: unknown;
  try {
    saves = JSON.parse(stored);
  } catch {
    throw new Error(
      "Saved setups could not be read. Export a backup before clearing browser storage.",
    );
  }
  if (!Array.isArray(saves))
    throw new Error("The saved setup list is invalid.");
  return saves
    .filter(
      (save): save is SavedSpec =>
        object(save) &&
        typeof save.id === "string" &&
        typeof save.name === "string" &&
        typeof save.createdAt === "string" &&
        object(save.data),
    )
    .map((save) => ({ ...save, data: validateWorkspace(save.data) }));
}
export function readDraft(): { data: Workspace; tab: string } | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!stored) return null;
    const draft: unknown = JSON.parse(stored);
    if (
      !object(draft) ||
      draft.version !== 1 ||
      typeof draft.tab !== "string"
    )
      return null;
    return { data: validateWorkspace(draft.data), tab: draft.tab };
  } catch {
    return null;
  }
}
export function writeDraft(data: Workspace, tab: string): void {
  if (typeof tab !== "string") throw new Error("Invalid draft tab.");
  const workspace = validateWorkspace(data);
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(
    DRAFT_STORAGE_KEY,
    JSON.stringify({ version: 1, data: workspace, tab }),
  );
}
export function saveSpec(name: string, workspace: Workspace): SavedSpec[] {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Enter a name for this setup.");
  const saves = readSaves();
  if (saves.length >= 10)
    throw new Error(
      "You can keep 10 setups. Delete one or export a backup first.",
    );
  const save = {
    id: crypto.randomUUID(),
    name: trimmed.slice(0, 100),
    createdAt: new Date().toISOString(),
    data: validateWorkspace(workspace),
  };
  const updated = [save, ...saves];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
export function deleteSave(id: string): SavedSpec[] {
  const updated = readSaves().filter((save) => save.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
function filename(name: string): string {
  return (
    name.replace(/[^\p{L}\p{N}_-]+/gu, "-").slice(0, 80) || "specification"
  );
}
function download(url: string, name: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
}
export function downloadSpec(
  workspace: Workspace,
  name = "specification",
): void {
  const data = validateWorkspace(workspace);
  const url = URL.createObjectURL(
    new Blob(
      [
        JSON.stringify(
          { version: 1, exportedAt: new Date().toISOString(), data },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    ),
  );
  download(url, `${filename(name)}.json`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function exportReport(
  element: HTMLElement,
  format: "png" | "pdf",
): Promise<void> {
  const { toPng } = await import("html-to-image");
  await document.fonts.ready;
  const image = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    skipAutoScale: false,
  });
  const name = `specification-report-${new Date().toISOString().slice(0, 10)}`;
  if (format === "png") {
    download(image, `${name}.png`);
    return;
  }
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 10,
    width = 190,
    height = (element.scrollHeight * width) / element.scrollWidth,
    pageHeight = 277;
  let remaining = height,
    page = 0;
  while (remaining > 0) {
    if (page) doc.addPage();
    doc.addImage(
      image,
      "PNG",
      margin,
      margin - page * pageHeight,
      width,
      height,
    );
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, margin, "F");
    doc.rect(0, 287, 210, 10, "F");
    remaining -= pageHeight;
    page++;
  }
  doc.save(`${name}.pdf`);
}
