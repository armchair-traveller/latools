# Flash-sale maintenance

The `/flash-sale` page reads checked-in JSON. It does not scrape PapayaPlay, run OCR, call an AI service, accept uploads, or store player data at runtime.

## Refresh a sale

1. Give Codex the official PapayaPlay La Tale announcement URL, or ask it to locate the latest official flash-sale post.
2. Invoke `$flash-sale-maintainer`. Codex uses `agent-browser`, saves evidence under `.cache/flash-sale/<postid>/`, verifies sale details against the source images, and reconciles cycle and offer counts.
3. A new sale defaults to `draft.json` and `review.md` in that cache directory for review before checked-in data changes. Resolve ambiguous item mappings and any new numeric valuations; unknown values can remain explicitly pending. Codex honors existing authorization and asks for approval only when the proposed changes still require it.
4. For an authorized refresh, Codex updates the catalog if required, writes the sale snapshot, advances the current-sale pointer when requested, updates affected fixture tests, runs the flash-sale and project checks, and previews `/flash-sale` with `agent-browser`.

Focused, authorized corrections use the existing evidence and repository diff when sufficient, with verification matched to the change.

The public files are `static/data/flash-sale/index.json`, `static/data/flash-sale/catalog.json`, and `static/data/flash-sale/sales/<sale-id>.json`. Raw announcement captures stay in `.cache` and are not committed.

Use the optional sale-level `purchaseNotice` for a short, evidence-backed restriction buyers need to see before choosing an offer. It stays visible above the offers while each package's caveats are collapsed by default. Keep detailed explanations and capture notes in the existing offer fields. Omit `purchaseNotice` when no sale-wide notice is needed; when present, it must be a non-empty string. Notices apply only to their own snapshot: do not carry them into later sales without evidence for that sale.

Authorization to edit the data does not itself authorize a commit, push, pull request, or deployment.
