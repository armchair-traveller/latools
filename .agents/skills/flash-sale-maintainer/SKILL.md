---
name: flash-sale-maintainer
description: Analyze, update, or refresh La Tale PapayaPlay flash-sale data from official announcement pages and promotional images. Use for extracting or correcting flash-sale cycles and offers, reconciling item catalog valuations, preparing a new sale snapshot, or changing which sale the site presents as current.
---

# Flash Sale Maintainer

Maintain the checked-in flash-sale dataset from official PapayaPlay evidence. Stage every result for human review before changing public data.

## Operating rules

- Read [references/data-contract.md](references/data-contract.md) before creating a draft or editing checked-in data.
- Load and use the `agent-browser` skill for every browser action, including source discovery, navigation, capture, and preview verification. Do not substitute another browser tool.
- Prefer the official PapayaPlay La Tale announcement and its original promotional media. Label secondary evidence; never let it silently override the official source.
- Read image-only sale details visually. Do not use OCR, Tesseract, a transcription service, or an AI call added to a script or application runtime. The published application must remain static and deterministic.
- Keep raw captures and working files under `.cache/flash-sale/<postid>/`; `.cache` is ignored by Git. Never place full announcement screenshots in `static/`.
- Treat a request to analyze, update, or refresh as permission to draft, not approval to publish.

## Workflow

### 1. Establish the source

1. Resolve the canonical official post URL and stable PapayaPlay `postid`. If asked for the latest sale, navigate the official listing and confirm the post instead of trusting a search snippet.
2. Record the post title, URL, post ID, publication timestamp, stated sale timezone, source media URLs, capture time, and a reproducible fingerprint for each captured source.
3. Capture the announcement and each sale panel at legible/native resolution with `agent-browser`. Preserve overlapping captures when content scrolls or spans panels.
4. Create `.cache/flash-sale/<postid>/` and keep all evidence there. Stop and report the gap when a source panel cannot be captured clearly.

### 2. Perform two visual passes

Keep the passes distinct and read the original source pixels in both.

**Pass 1 — inventory and transcription**

1. Determine the expected offer count and cycle structure from the official post.
2. Inventory panels and offers in source order.
3. Transcribe cycle dates/times, item names and variants, quantities, prices, limits, bundle contents, and qualifying notes into a candidate sale snapshot.
4. Mark obscured, cropped, or ambiguous fields; do not infer missing digits or variants.

**Pass 2 — independent field audit**

1. Reopen every original panel without using the Pass 1 text as the visual source.
2. Verify every number, date boundary, timezone, item variant, quantity, price, limit, and content relationship cell by cell.
3. Reconcile the actual offer count with the expected count and confirm that each offer maps to exactly one cycle and source region.
4. Record mismatches and the final capture status. Leave unresolved facts explicit and block publication when a required field is not visually verified.

### 3. Reconcile the catalog and editorial fields

1. Match source labels against canonical catalog entries and aliases. Preserve variant distinctions; never merge items because their names or icons merely look similar.
2. Review every valuation used by the sale, including its unit, effective date, and basis/source. List reused, changed, new, stale, ambiguous, and pending values separately.
3. Ask the user to decide any new or materially changed value. Do not invent a value or silently reuse an ambiguous alias.
4. Freeze the approved values used for this sale in its `valuationSnapshot` so later catalog changes do not rewrite historical comparisons.
5. Draft concise `bestFor`, `skipIf`, and `caveats` claims supported by the transcribed data. Present uncertainty as a caveat, not as confident advice.

### 4. Create the review draft

Write both files before proposing any checked-in edit:

- `.cache/flash-sale/<postid>/draft.json`: the proposed sale snapshot in the current checked-in sale schema.
- `.cache/flash-sale/<postid>/review.md`: the evidence, pass results, count reconciliation, catalog decisions, unresolved items, editorial claims, and exact publication plan described in the reference.

Validate JSON syntax and compare the draft with the repository's current schema and validator. The repository implementation is authoritative if it differs from the reference. Do not weaken validation to make a draft pass.

Give the user a compact handoff that links both draft files and identifies every unresolved or catalog-value decision. Ask explicitly whether to publish this specific draft and source fingerprint. Do not infer approval from the original task or from earlier approval of a different draft. Any source or material draft change invalidates approval.

### 5. Publish only after approval

After explicit approval of the current draft:

1. Recheck the approved source fingerprint and unresolved-items list.
2. Apply approved canonical items, aliases, and current valuations to `static/data/flash-sale/catalog.json` when needed.
3. Create or update `static/data/flash-sale/sales/<sale-id>.json` from the approved snapshot.
4. Update `static/data/flash-sale/index.json` so its current pointer and metadata select the approved sale. Do not rewrite unrelated historical snapshots.
5. Run, in order:

```sh
npm run check:flash-sale
npm test
npm run check
npm run build
```

6. Start the local site when practical and use `agent-browser` to verify `/flash-sale` against the approved draft at desktop and narrow viewport widths. Check the selected sale, cycles, offer counts, catalog-derived values, editorial guidance, and console errors.
7. Report changed files, checks, visual verification, and any remaining caveats.

Approval here permits only the checked-in data edits above. Do not commit, push, open a pull request, or deploy unless the user separately requests that action.
