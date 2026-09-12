# Scenario walkthrough

The tool at `/scenario` is a quest walkthrough. The separate dialogue reader at `/scenario-script` has its own source and fresh translation catalogs; see [scenario-script-maintenance.md](scenario-script-maintenance.md). The walkthrough source is https://latale.wiki/progression/scenario, revised in the wiki's August 31, 2026 patch notes. The wiki's `/scenario-script` page is not the walkthrough's data source.

## Update

Run `npm run sync:data` to fetch and validate the original Korean guide. Only `static/data/scenario/index.json` is replaced, through an atomic file rename. The English translation is stored separately in `static/data/scenario/en.json`; other tools' snapshots and the shared NPC portraits are outside the import scope. The importer never calls a translation service. Once an English catalog exists, publication stops if any source text lacks a complete translation, preserving the previous published guide.

For review, run `node scripts/sync-scenarios.mjs --output .cache/scenario-review`. Compare the original `quests` arrays, the source `updated` date, and `snapshot` counts and checksum. A network or validation failure must leave the published snapshot intact.

## English translation

English is the default view; `?lang=ko` selects the original Korean. Both views search the English and Korean text, and language switching preserves the selected scenario and step link.

`en.json` maps exact Korean source strings to English. All 143 scenarios and 863 steps are translated, including prerequisites, NPC/map/monster/item names, descriptions, travel instructions, and acquisition notes. The Korean snapshot is never overwritten. Shared terms use one translation throughout; names verified against the Global publisher are recorded in `docs/scenario-translation-notes.md`. This is a community translation, not an official localization.

To refresh, stage the new source with `--output .cache/scenario-review`, translate any new or changed strings directly from the Korean, and update `en.json`. Exact keys prevent changed text from silently reusing an older translation. Preserve IDs, quantities, levels, array order, requirements, numeric instructions, and intentional redaction characters. Run `npm run check:scenario` before publishing. Do not restore the old bulk machine-translation pipeline.

## Source details

- Preserve every quest and step in the source array order. IDs are identifiers, not chronological sort keys.
- Keep `requirements`, base `level`, and `ultraLevel`. The interface displays the latter as Super Level when it is nonzero.
- Render start and turn-in locations/NPCs, objectives, monsters, dungeons, all travel instructions, notes, and required/granted/consumed/reward items.
- Item ID and count can be zero in the reference. A zero count is unspecified, not a requirement to collect zero items. Distinct IDs may share a name.
- Granted items can have `npc` and `place`. Consumed items can have `obtainedFrom`; its `questId` actually points to a source step ID. Do not treat it as a top-level scenario ID.
- Store Korean content exactly. Decode literal escaped line breaks only during rendering. Never interpret objectives or descriptions as HTML.
- Metadata records `sourceLanguage`, `sourceUrl`, `generatedAt`, and a SHA-256 checksum of the original guide object. The source update date is distinct from the local refresh date.

## Verification

Run `npm run check:scenario`, `node --test tests/scenario-guide.test.mjs tests/scenario-sync.test.mjs`, `npm run check`, and `npm run build`. Use `agent-browser` to check English and Korean title/NPC/dungeon/item search, language switching, combined type/chapter filters, empty results and reset, previous/next scenarios, and item descriptions. Check direct `#quest-ID` and `#step-ID` links, reload, browser back/forward, and responsive layout. Review a late side scenario with Super Level requirements and item acquisition notes as well as the first main scenario.
