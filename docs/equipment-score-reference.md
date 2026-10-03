# Equipment Score reference

The Equipment Score calculator uses [LaMu Wiki's equipment score tool](https://latale.wiki/tools/equipment-score) as its primary source. The snapshot was retrieved on **2026-10-03**. The wiki credits **쌀또뽀끼** for the reference information.

`src/lib/data/equipment-score.json` contains all **16 equipment kinds**, **183 option rows**, **3 profiles**, available enhancement stages, and all **6 examples**. English labels accompany the original Korean labels. The snapshot metadata records the exact public JavaScript asset URL and its SHA-256. At capture time, the source data and scoring function were in module `165304` of `/_next/static/chunks/1c8hxr6dxj4ml.js`.

`src/lib/equipment-score.js` implements the source calculation. `tests/fixtures/equipment-score-reference.json` records results produced by the wiki function for all **75 valid kind / stage / profile combinations**. The unit tests also include independently observed browser results and a fingerprint of every numeric option field.

Equipment icons are copied from the source URLs in the snapshot into `static/equipment-score/` so the tool does not depend on runtime requests to the wiki. LaTale images belong to Actoz Soft and their respective rights holders.

## Calculation details retained from the wiki

- An option contributes `min(100, current / maximum × 100) × weight`. Individual attainment caps at 100%; the total score can exceed 100. The Spirit Stone's flat boss and normal monster additional damage rows are displayed for reference and excluded from both totals.
- For unenhanced equipment, projected transcendent attainment is `min(100, (current + bonus) / (base maximum + bonus) × 100)`. Empty or zero-valued options contribute zero. This denominator deliberately uses base maximum plus bonus, even when the separately listed transcendent maximum differs.
- Ika / Grendel helmets lose `0.08` points for each accuracy point below `79` unenhanced or `139` transcendent. Garden Combined helmets use `139`. Projected unenhanced scores use the transcendent threshold and current accuracy plus its bonus, including when the current accuracy option is empty. Final scores clamp to zero.
- Garden's comparison score is `max(0, (score - (94 + score / 100 × 60)) / 6)`. It produces zero for the values achievable with the current capped table. This apparent source quirk is preserved. Tear's Belial comparison is `max(0, (3.75 × score - 66) / 4.6)`.
- The source's profile-specific Ika helmet bonuses and maxima remain as published: some bonuses vary sharply between profiles. Garden top / bottom's combined Strength / Magic maximum is `52002` for the Strength / Magic profile and `52001` for the other two profiles.
- Ratings use fixed thresholds of `70`, `84`, and `90`. The wiki's suggestion to judge Ika / Grendel thresholds about 10 points lower is explanatory advice, not an automatic adjustment.
- Belial values retain the wiki's corrections to what it describes as reference-table formatting remnants. No independent replacement formula or guessed maximum is applied.

The UI shows decimal maxima accurately (for example `5.3` or `6.5`), whereas the wiki rounds the visible maximum column to whole numbers. Calculations use the exact source values in both implementations.

## Refreshing the snapshot

1. Open the wiki tool with `agent-browser` and capture representative results before editing. Include weapon and Spirit Stone examples, each profile, both helmet penalty thresholds, a Tear comparison, and a Garden comparison.
2. Fetch the page's public HTML and locate its current JavaScript asset containing `EQUIPMENT_SCORE_OPTIONS` and `calculateEquipmentScore`. Chunk filenames can change. Inspect the module rather than assuming the old asset still represents the live page.
3. Compare all equipment configuration, option maxima, profile bonuses, weights, inclusion flags, examples, and formulas against the saved snapshot. Preserve source IDs and Korean labels while updating English display labels where needed.
4. Update the snapshot date, asset URL and asset SHA-256. Refresh golden outputs using the source function independently of the local implementation, then update the numerical fingerprint only after reviewing the data changes. The mixed fixture inputs use repeating ratios `[0.31, 0, 0.875, 1.3, 0.5, 0.01]` of each row's current stage maximum, rounded to two decimal places.
5. Run `node --test tests/equipment-score.test.mjs`, `npm run check`, and `npm run build`. Compare the rendered local results with the captured wiki results and check that changing equipment clears values while stage and profile changes retain them.

If a source inconsistency changes, update the numerical data, implementation, fixtures, and this note together. Keep deliberate UI improvements separate from calculation changes.
