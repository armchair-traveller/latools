# Flash-sale data contract and review handoff

Treat the checked-in TypeScript/JavaScript types, fixture data, and `npm run check:flash-sale` validator as authoritative. Inspect them before drafting; retain this reference as a map of file ownership and review expectations rather than a substitute schema.

## Checked-in files

| Path | Role |
| --- | --- |
| `static/data/flash-sale/index.json` | Lightweight sale index plus the pointer to the sale presented as current. |
| `static/data/flash-sale/catalog.json` | Canonical items, recognized source-label aliases, and each item's current valuation. |
| `static/data/flash-sale/sales/<sale-id>.json` | Immutable-style snapshot of one sale and the valuations used to evaluate it. |

Use the repository's exact field names and enum values. Preserve stable IDs and unrelated history.

## Sale snapshot shape

A sale snapshot must represent these logical groups:

- **Identity and provenance:** sale ID plus official post metadata, source URL/post ID, capture time, and human-readable source roles.
- **Schedule:** the announcement timezone and ordered sale cycles with explicit boundaries.
- **Coverage:** expected offer count, captured sources/source regions, and a capture status that exposes incomplete or ambiguous evidence.
- **Merchandise:** ordered offers and their structured bundle contents, preserving source order, quantities, prices, limits, variants, and cycle relationships.
- **Valuation:** a `valuationSnapshot` containing the reviewed values actually used for this sale. Do not derive historical results from mutable current catalog values.
- **Editorial guidance:** `bestFor`, `skipIf`, and `caveats` supported by the snapshot rather than generic sales language.

Keep original labels or source references where the checked-in schema supports them. Never place personal account state, purchase history, or unrelated page content in the snapshot.

## Catalog contract

- Give every distinct item or variant one stable canonical ID.
- Use aliases only for labels verified to identify that exact canonical item; an alias is not a fuzzy match rule.
- Store the current valuation with the repository-required unit, basis/source, and review/effective date.
- Represent unknown, unique, or non-comparable value with the repository's explicit status rather than a fabricated zero.
- Copy the approved values used by a sale into its `valuationSnapshot` before publication.

## Draft files

Keep all pre-approval artifacts under `.cache/flash-sale/<postid>/`.

`draft.json` must be the proposed `sales/<sale-id>.json` payload in the current checked-in schema. It must not include review-only wrapper fields. Put proposed catalog additions or changes in `review.md` until approval.

Structure `review.md` with these sections:

1. **Source** — canonical URL, post ID, capture time, and source list/regions.
2. **Two-pass transcription** — expected versus actual offer count, Pass 1 inventory, Pass 2 audit result, and capture status.
3. **Unresolved evidence** — every illegible, missing, conflicting, or inferred field; write `None` when empty.
4. **Catalog review** — source label to canonical ID mapping and separate reused, new, changed, stale, ambiguous, and pending valuations. Include exact proposed catalog entries for additions/changes.
5. **Editorial review** — proposed `bestFor`, `skipIf`, and `caveats`, each traceable to sale facts.
6. **Publication plan** — exact checked-in files to create or edit and the intended current sale pointer.
7. **Approval** — the draft identity and material decisions the user is being asked to approve.

Handoff to the user with the draft/review paths, pass status, count reconciliation, unresolved evidence, catalog decisions, material changes since any prior review, and planned checked-in files. Request an explicit yes/no publication decision. A changed source, offer set, price, cycle, valuation, or editorial conclusion requires a new review and approval that describes the change.
