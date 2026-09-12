# Event exchange maintenance

The public event exchange page reads checked-in JSON and small item icon crops. It remains static and deterministic, without AI API calls, uploads, or stored player data.

## Scope and sources

Match the work to the request: analysis, a focused correction, or a full event refresh. Reuse adequate evidence for corrections. Apply authorized edits without asking for the same approval again; if a decision is needed, prepare the supported changes and ask about the unresolved item or value. Data edits do not themselves authorize a commit, push, pull request, or deployment.

For a refresh, obtain legible in-game captures covering all five stages, with enough overlap to establish slot order when scrolling. Confirm event identity and dates from the official notice. Use `agent-browser` for browser work. Keep raw captures under `.cache/event-exchange/raw/` and review aids under `.cache/event-exchange/`; full screenshots never belong in `static/`.

Verify quantities, point costs, item variants, and shared account limits against the source pixels. Personal point balances and purchase counts stay out of the data and icon crops. If a completed or obscured offer's icon, quantity, or cost cannot be verified, retain its slot in `missingSlots`. Continue with clear evidence and report incomplete coverage.

## Data and catalog

Use `src/lib/types.ts` (`Exchange*`) and `scripts/check-event-exchange.mjs` as the schema authority.

- `static/data/event-exchange/current.json` holds event metadata, inclusive event dates, and offers. Preserve in-game stage and slot positions. The current schema requires stages 1–5; captured offers plus `missingSlots` must equal `expectedOfferCount`. Within each stage, a slot appears once, either captured or missing. Use `accountLimit: null` when a shared limit is unknown.
- `static/data/event-exchange/catalog.json` holds stable item IDs, English labels, reference icons, and per-unit valuations. Match the exact item variant and unit before reusing an entry. Bundle quantities belong in each offer's `quantity`, not its catalog label or unit price.
- `static/items/event-exchange/` holds icon crops, referenced by public `/items/event-exchange/...` paths. Reuse suitable crops and preserve catalog reference images when replacing event-specific icons.

Use supplied or previously confirmed labels and values. A numbered contact sheet can help resolve unfamiliar icons; create one when useful and batch outstanding questions in any clear format. Do not invent labels or Ely values to complete the catalog.

`priced` items require a name, positive `unitEly`, and `priceUpdatedAt` in `YYYY-MM-DD` format. Preserve the evidence date when reusing a price. Use `pending` for unknown values and `unique` for rewards without a defensible Ely equivalent. Unique items require a name; pending items may have `name: null`. Both use null `unitEly` and `priceUpdatedAt`. Missing captures and pending names or values are separate supported states; missing a valuation does not make a captured offer a missing slot.

## Ranking rules

The page uses current catalog values directly, so a price edit affects every offer referencing that item. `src/lib/event-exchange.js` computes comparisons rather than storing ranks or totals in JSON:

`bundle Ely = quantity × unit Ely`

`Ely per point = bundle Ely ÷ point cost`

Rank priced offers by descending Ely per point, descending bundle Ely, then ascending point cost, stage, and slot. Pending and unique items remain unranked; neither means zero value. Missing offers contribute only to coverage reporting.

## Validation

For a full refresh, run:

```sh
npm run check:event-exchange
npm test
npm run check
npm run build
```

For a focused correction, run the data validator and checks relevant to the change. The validator reads the checked-in catalog, current event, and referenced icon files; it does not validate cache drafts. Update affected current-event fixture expectations in `tests/event-exchange.test.mjs` when the event or confirmed values change, preserving behavioral coverage.

Preview a refreshed `/event-exchange` with `agent-browser` at desktop and narrow widths when practical. Check stage coverage, icons, rankings, unranked items, and console errors; for a correction, inspect the affected behavior. Report changed files, checks actually run, verification limits, and outstanding decisions.
