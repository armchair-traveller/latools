---
name: flash-sale-maintainer
description: Maintain La Tale PapayaPlay flash-sale snapshots and catalog valuations from official announcements and promotional images. Use for sale analysis, offer corrections, new-sale refreshes, and current-sale selection.
---

# Flash Sale Maintainer

Maintain the checked-in dataset from official PapayaPlay evidence. Match the work to the request: analysis, a focused correction, or a full sale refresh.

## Scope and authorization

For a new sale or material refresh, default to preparing a reviewable draft before changing checked-in public data. Honor explicit user instructions and existing authorization for the current scope; do not request the same approval again. An analysis-only request ends with findings or a draft. A focused, authorized correction can use the repository diff as its review artifact without restarting a full-sale workflow.

When approval is still needed, finish the draft and document the proposed edits and unresolved decisions first. Ask about that concrete result. Revisit approval only for material decisions outside the authorization already given. Commit, push, pull request, and deployment require authorization for those actions.

## Source and verification

Use the `agent-browser` skill for browser work. For the latest sale, confirm the post on the official listing. Use the canonical announcement and original promotional media; identify secondary evidence and any conflicts with the official source.

Keep legible source captures and working artifacts under `.cache/flash-sale/<postid>/`, never full announcement screenshots in `static/`. Record the post title, canonical URL/post ID, publication timestamp, sale timezone, media URLs, capture time, and source roles. Reuse adequate existing captures for targeted corrections.

Read image-only details visually, without OCR or external transcription services. Verify transcribed dates, variants, quantities, prices, limits, and bundle relationships against the original pixels. Scale recapture and additional review to the changed fields and evidence quality; a new sale needs complete panel coverage and offer-count reconciliation. Preserve source order and trace each offer to its cycle and source region. Leave illegible or conflicting facts explicit, continue work supported by clear evidence, and withhold publication of incomplete or uncertain offers.

The application remains static and deterministic; extraction belongs in the maintenance workflow.

## Data and valuation

Read [references/data-contract.md](references/data-contract.md) when preparing a snapshot, reconciling catalog entries, or editing checked-in data. It maps the authoritative implementation, valuation semantics, review artifacts, and validation limits.

Match exact item variants and units, including individual items versus multipacks. Review the values used by the sale and flag stale or ambiguous evidence. Use user-supplied or previously approved values where applicable; ask for any new or materially changed numeric valuation that still needs a maintainer decision. Unknown values can remain explicitly pending. Freeze the sale's values and their evidence in `valuationSnapshot` so catalog changes do not rewrite historical comparisons.

Write `bestFor`, `skipIf`, and `caveats` from supported sale facts, with valuation uncertainty reflected in the guidance.

## Apply and verify

For a full refresh, prepare `.cache/flash-sale/<postid>/draft.json` and `review.md` using the reference's handoff guidance. Apply authorized changes to the catalog, target snapshot, and index as needed; change the current pointer only when the request calls for it. Preserve stable IDs and unrelated historical data.

For a sale refresh, run:

```sh
npm run check:flash-sale
npm test
npm run check
npm run build
```

For a focused correction, run the data validator and checks relevant to the change. Keep fixture tests aligned with a new current sale while preserving historical assertions; do not weaken validation to accept unsupported data.

Preview a refreshed `/flash-sale` with `agent-browser` at desktop and narrow widths when practical. Verify the selected sale, cycles and counts, values, guidance, and console errors. For a narrow correction, inspect the affected behavior. Report changed files, checks actually run, verification limits, and outstanding decisions.
