# Event exchange maintenance

The public event exchange page is generated from checked-in JSON and small item icon crops. It does not call an AI API, accept uploads, or store player data.

## Update an event

1. Capture each of the five exchange stages at native resolution. If a stage scrolls, include one overlapping row.
2. Keep raw screenshots under `.cache/event-exchange/raw/`. This directory is ignored by Git; never place full screenshots under `static/`.
3. Ask Codex to transcribe each visible offer and crop its icon. Completed offers whose icon or cost is obscured belong in `missingSlots` until a clean screenshot is available.
4. Have Codex create a numbered contact sheet under `.cache/event-exchange/`.
5. Reply once for each new icon using `number — short English label — Ely per unit`. Reuse a previously confirmed catalog item when the icon and item variant match.
6. Update `static/data/event-exchange/catalog.json` with the confirmed label, unit value, and price review date. Update `current.json` with the event dates and offer details.
7. Run the checks below, review the page, and publish the static site normally.

```sh
npm run check:event-exchange
npm test
npm run check
npm run build
```

## Ranking rules

The page computes rankings at render time instead of storing rank numbers:

`bundle Ely = quantity × unit Ely`

`Ely per point = bundle Ely ÷ point cost`

Offers sort by Ely per point, then bundle Ely, lower point cost, stage, and in-game slot. Offers without a confirmed Ely value are listed as pending and excluded from every rank. Missing completed offers are called out separately and never receive placeholder ranks.

The screenshots show personal point totals and purchase counts. Do not copy those values. Only the shared bundle quantity, point cost, account limit, stage, and slot belong in the event data.
