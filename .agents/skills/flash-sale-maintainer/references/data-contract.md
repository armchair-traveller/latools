# Flash-sale data contract and review handoff

Use `src/lib/types.ts` (`FlashSale*`), `scripts/check-flash-sale.mjs`, and an existing sale as the schema authority. `src/lib/flash-sale.js` defines valuation and ranking behavior; `tests/flash-sale.test.mjs` covers it and the checked-in fixtures. This reference records maintenance decisions and validation limits rather than duplicating the schema.

## Checked-in files

| Path | Role |
| --- | --- |
| `static/data/flash-sale/index.json` | Lightweight sale index plus the pointer to the sale presented as current. |
| `static/data/flash-sale/catalog.json` | Canonical items, recognized source-label aliases, and each item's current valuation. |
| `static/data/flash-sale/sales/<sale-id>.json` | Immutable-style snapshot of one sale and the valuations used to evaluate it. |

Use the repository's exact field names and enum values. Preserve stable IDs and unrelated history.

## Snapshot semantics

- The current schema uses region `NA`, currency `LTC`, and timezone `America/New_York`. Store offset-bearing timestamps consistent with the announced dates, including daylight saving time; preserve stated gaps between cycles.
- `sourceUrl` identifies the official `latale.papayaplay.com/latale.do?tp=news.view&postid=...` post, and `posterUrls` identify its HTTPS media on `cdn.papayaplay.com`. Source entries record `accessedAt` and human-readable roles in `note`.
- Preserve cycle order and offer `slot` order. Captured offers plus `unresolvedSlots` must equal each cycle's `expectedOfferCount`, and totals must match the sale. A publishable sale has no unresolved slots and every offer has `capture.status: "verified"` with source IDs. Use capture notes or the review for source-region details.
- `purchaseLimit: null` means no limit was captured; an explicit quantity with unclear scope uses `scope: "unknown"`. Do not turn absent evidence into an unlimited-purchase claim.
- The current index entry's title, first start, final end, and review date must agree with the selected snapshot.
- Keep ranks, Ely totals, and Ely-per-LTC ratios out of the JSON; the application derives them. Review-only metadata belongs in the review artifact, not new schema fields.

## Catalog contract

- Use stable canonical IDs for distinct variants. Aliases identify the exact item and must not collide after case/whitespace normalization. Similar names or icons are insufficient evidence.
- `contents[].quantity` counts the catalog item's unit. A five-item package and one individual item are different units; verify the mapping before multiplying quantities or reusing a valuation.
- Numeric `priced` or `estimated` valuations require positive `unitEly`, a supported method, confidence, `asOf` date, and evidence source IDs. Preserve the date and basis of reused evidence rather than making it appear newly observed.
- `pending` means an unknown value; `unique` means intentionally non-comparable value. Both use null numeric value, confidence, and date, with their corresponding method. A pending valuation is allowed in a published sale; an uncertain offer capture is not.
- Every component needs a `valuationSnapshot` entry. Snapshot evidence IDs resolve against `sale.sources`; current catalog evidence IDs resolve against `catalog.sources`. Copy the needed evidence when freezing values.
- Only fully valued, verified offers enter objective rankings. Partially valued bundles have a lower-bound comparison; pending or unique components are not zero-value items.

## Review artifacts

For a full refresh, keep `draft.json` and `review.md` under `.cache/flash-sale/<postid>/`. The draft is the proposed `sales/<sale-id>.json` payload, without review wrappers. The schema currently has only `status: "published"`; a staged payload carrying that value is not evidence of approval or completed verification.

Make the review sufficient to assess the proposed change. Include source provenance and regions, verification performed, expected versus actual counts, unresolved facts, relevant item/unit mappings and valuation decisions, exact catalog additions or changes (including evidence), and intended files/current pointer. Explain editorial conclusions that require judgment and material changes since earlier review. Summarize reused values together when uncontroversial; separate categories or a fixed section template are unnecessary.

Link both artifacts in the handoff and identify any remaining decisions. For a focused authorized correction, the diff and a concise evidence note may be sufficient. Authorization is governed by the skill's scope guidance; the review format does not create an additional approval gate.

## Validation limits

`npm run check:flash-sale` reads the checked-in catalog and the sale selected by `index.currentSaleId`. It does not accept a draft path or validate every historical sale. JSON parsing alone also does not establish schema validity.

For draft or historical-sale validation, use an isolated validation copy with the target sale, proposed catalog, and matching index alongside `package.json`, the validator, and its `src/lib/flash-sale.js` dependency, preserving their repository-relative paths. Run the existing validator there without altering the working tree's current pointer. Report incomplete-draft failures or validation limits accurately; do not relax checks to make an unfinished payload pass.

Fixture tests currently include assertions tied to a particular current sale. When advancing the pointer, update the affected current-sale coverage and retain the old sale's historical assertions. Include necessary fixture-test changes in the review's file list; a data refresh does not justify unrelated application or validator changes.
