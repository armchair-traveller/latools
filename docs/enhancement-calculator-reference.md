# Enhancement calculator reference

The enhancement calculator at `/enhancement-calculator` uses [RamuWiki's equipment enhancement calculator](https://latale.wiki/tools/enhancement-calculator) as its primary reference. The source was reviewed on **October 3, 2026**.

The snapshot contains **32 equipment presets**, **373 enhancement stages**, **33 distinct materials**, and **21 dungeon variants across 16 dungeons**. It preserves the source IDs and Korean labels alongside English translations. Names are translations of the Korean reference and may differ from Global service names. Numerical data follows the wiki rather than substituting assumptions about the Global service.

The source data and calculation function were published in `https://latale.wiki/_next/static/chunks/3kzpnmpaw1qco.js` at capture time. The checked-in snapshot in `src/lib/data/enhancement-calculator.json` records provenance. `src/lib/enhancement-calculator.js` contains the calculation engine, with its public types in the adjacent `.d.ts` file. Equipment and material icons are saved locally under `static/enhancement-calculator/`; LaTale images belong to Actoz Soft and their respective rights holders.

## Rules preserved from the wiki

- A selection's current stage is an index: zero means the preset's starting state, and `stages.length` means complete. The calculator sums material quantities and Ely costs for all remaining stages. The relic preset starts from Doll's Relic +4; its base label is preserved.
- Transcendence and combination presets are separate steps. Selecting one does not also add the preceding normal enhancement path. Add both presets when planning both steps.
- Duplicate selections are allowed, and their material quantities and Ely costs add together. Materials are aggregated by the source material ID, rather than by translated names.
- Dungeon difficulty defaults to 4. Difficulty 5 is selectable only where the source has that variant. A selected preset associated with a difficulty-5 dungeon forces that dungeon to difficulty 5, including when that selection is already complete. This last detail matches the source's selection-based rule.
- Dungeon yields retain the source's generated values. Difficulty 5 can increase some yields while leaving others unchanged; it is not a multiplier applied to every material. The wiki derives its yields from reward bags, average slot quantities, weighted item sets, bosses, and quests.
- Dungeon-point reward boxes are off by default. Enabling them adds only each material's declared `pointBonusPerRun`, and only for a dungeon with a point reward. The displayed point cost is the source's box price; it is not an Ely cost and does not affect enhancement Ely totals. The calculator does not model point balances or time to earn those points.
- For each dungeon, divide each required material quantity by its expected yield per run. Take the largest of these ratios, then round up once. Materials from the same dungeon are collected together, so their run estimates are not added.
- Total runs add the rounded run counts of all required dungeons. Expected days take the largest rounded dungeon count, assuming one run of each dungeon per day in parallel. The wiki snapshot lists one run per day for all dungeons.
- Fully enhanced selections require no more materials or Ely. Dungeon rows with no remaining required materials are omitted. An empty plan returns zero totals.
- This is an expected material-farming planner. It does not calculate enhancement success probabilities, failed attempts, inventory deductions, or market purchases; those inputs are absent from the source model.

## Independently observed browser examples

| Plan | Expected results |
| --- | --- |
| Tireman Badge 1, unenhanced | 6,750 Inspiration Flags; 80 per run; 85 runs; 85 days; 2,000,000,000 Ely |
| Same badge with its 10,000-point box enabled | 152 flags per run; 45 runs and days; unchanged Ely cost |
| Default badge plus Destruction / Memory weapon, unenhanced | 60 wings and 60 horns in Pleroma at 37 each per run; 2 Pleroma runs; 87 total runs; 85 days |
| Destruction / Memory transcendence step | 100 wings, 100 horns, 50 Demiurge stones; forced difficulty 5; 8 runs and days; 200,000,000 Ely |
| Same transcendence step with its 3,000-point box enabled | Wings and horns increase to 70 each per run, but stones remain at 7; still 8 runs and days |

## Refreshing and checking

1. Open the source page with `agent-browser` and record representative outputs before changing the snapshot. Include the default badge, duplicate items, items sharing a dungeon, both difficulties, extra boxes, a transcended or combined item, a maxed item, and an empty plan.
2. Inspect the page's current public JavaScript assets to locate its equipment data, dungeon yields, and calculation function. Asset filenames can change. Compare the data and formulas rather than assuming an old chunk remains current.
3. Preserve source IDs, stage ordering, Korean labels, material costs, Ely costs, difficulty-specific yields, and point bonuses. Update English labels and local icons where needed. Record the reviewed source URL, date, and checksum.
4. Regenerate reference fixtures independently from the source calculation and review any differences before updating expected results. `tests/fixtures/enhancement-reference.json` contains 1,648 outputs produced by executing the original function: all 405 possible preset/stage combinations under both difficulties and point-box settings, plus seven multi-item or empty plans under those settings. The fixture's source checksum ties it to the data snapshot. Tests compare numeric results, excluding translated labels and local icon paths.
5. Run `node --test tests/enhancement-calculator.test.mjs tests/enhancement-reference.test.mjs`, `npm run check`, and `npm run build`. Compare local browser outputs to the live reference examples, and verify mobile layout, add/remove/reset, stage changes, and forced difficulty behavior.

Any intentional UI improvement should remain separate from changes to the source calculation model.
