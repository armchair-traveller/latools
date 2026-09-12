# LaTale Tools

A growing collection of English-language LaTale fan utilities, including a scenario walkthrough and static value rankings for current events and flash sales.

## Features

- General-purpose tool landing page at `/`
- Scenario walkthrough at `/scenario` (the former `/scenario-script` URL redirects here)
- Current event exchange guide at `/event-exchange`, ranked by maintainer-confirmed Ely value per point
- Current flash sale guide at `/flash-sale`, ranked per cycle by maintainer-confirmed Ely value per LTC
- All 143 main and side scenarios, with 863 ordered quest steps across four chapters
- Complete English translation of quest names, objectives, NPCs, travel directions, and item details, with the Korean source available
- Main/side and chapter filters; search quests, locations, NPCs, dungeons, monsters, and items in English or Korean
- Shareable scenario and individual-step URLs, including restoration on reload
- Required, granted, consumed, and reward items with descriptions and acquisition details
- Responsive desktop and mobile layouts
- shadcn-svelte component system with a shared app sidebar and semantic theme tokens

## Development

```sh
npm install
npm run dev
```

Useful checks:

```sh
npm run check
npm run check:event-exchange
npm run check:flash-sale
npm run check:scenario
npm test
npm run build
```

The app uses the current SvelteKit CLI defaults with TypeScript, Tailwind CSS, `@sveltejs/adapter-vercel`, and shadcn-svelte.

See [`docs/event-exchange-maintenance.md`](docs/event-exchange-maintenance.md) and [`docs/flash-sale-maintenance.md`](docs/flash-sale-maintenance.md) for the Codex-assisted update workflows. Raw screenshots, drafts, and generated review sheets stay under the ignored `.cache/` directory.

## Project-scoped agent skills

The shadcn-svelte and official Svelte AI skills are installed locally in `.agents/skills` and recorded in `skills-lock.json`. The repository also includes a project-specific flash-sale maintainer skill for repeatable sale analysis. No global skill install is required.

## Refreshing the scenario guide

The checked-in snapshot is ready to use. To fetch the latest original Korean walkthrough:

```sh
npm run sync:data
```

The importer reads the public data embedded in [RamuWiki's scenario guide](https://latale.wiki/progression/scenario), validates its structure, and atomically replaces only `static/data/scenario/index.json`. It preserves the source strings and quest/step order, records the source update date and a content checksum, and makes no translation requests. The complete English translation lives separately in `static/data/scenario/en.json`, keyed by the exact original text. Publishing stops if new source text needs translation. The old machine-translated dialogue archive has been removed.

For a review snapshot before updating the site:

```sh
node scripts/sync-scenarios.mjs --output .cache/scenario-review
```

See [`docs/scenario-maintenance.md`](docs/scenario-maintenance.md) for the data contract and verification steps.

## Attribution

This is an unofficial fan project and is not affiliated with Actoz Soft or the official LaTale service. The walkthrough comes from [RamuWiki's scenario guide](https://latale.wiki/progression/scenario), redesigned in its [August 31, 2026 patch notes](https://latale.wiki/patch-notes). LaTale's name, images, game data, and story text belong to Actoz Soft and their respective rights holders.
