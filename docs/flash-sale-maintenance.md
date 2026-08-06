# Flash-sale maintenance

The `/flash-sale` page reads checked-in JSON. It does not scrape PapayaPlay, run OCR, call an AI service, accept uploads, or store player data at runtime.

## Refresh a sale

1. Give Codex the official PapayaPlay La Tale announcement URL, or ask it to locate the latest official flash-sale post.
2. Invoke `$flash-sale-maintainer`. Codex uses `agent-browser`, saves evidence under `.cache/flash-sale/<postid>/`, and performs two visual transcription passes.
3. Review `draft.json` and `review.md` in that cache directory. Resolve any ambiguous item mapping or catalog valuation, then explicitly approve or reject publication of that draft.
4. After approval, Codex updates the catalog if required, writes the sale snapshot, advances the current-sale pointer, runs the flash-sale and project checks, and previews `/flash-sale` with `agent-browser`.

The public files are `static/data/flash-sale/index.json`, `static/data/flash-sale/catalog.json`, and `static/data/flash-sale/sales/<sale-id>.json`. Raw announcement captures stay in `.cache` and are not committed.

Publication approval covers those data edits only. Request a commit, push, pull request, or deployment separately.
