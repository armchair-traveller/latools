# LaTale Tools

A growing collection of English-language LaTale fan utilities, including a scenario reader and static value rankings for current events and flash sales.

## Features

- General-purpose tool landing page at `/`
- Complete scenario reader at `/scenario-script`
- Current event exchange guide at `/event-exchange`, ranked by maintainer-confirmed Ely value per point
- Current flash sale guide at `/flash-sale`, ranked per cycle by maintainer-confirmed Ely value per LTC
- All 143 main and side stories, split into lazy-loaded JSON files
- 50,651 dialogue lines organized by chapter and quest step
- English story titles, objectives, character names, narration, and dialogue
- Main/side filters and instant title search
- Custom player-name substitution throughout the script
- Original NPC portraits stored locally for reliable loading
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
npm test
npm run build
```

The app uses the current SvelteKit CLI defaults with TypeScript, Tailwind CSS, `@sveltejs/adapter-vercel`, and shadcn-svelte.

See [`docs/event-exchange-maintenance.md`](docs/event-exchange-maintenance.md) and [`docs/flash-sale-maintenance.md`](docs/flash-sale-maintenance.md) for the Codex-assisted update workflows. Raw screenshots, drafts, and generated review sheets stay under the ignored `.cache/` directory.

## Project-scoped agent skills

The shadcn-svelte and official Svelte AI skills are installed locally in `.agents/skills` and recorded in `skills-lock.json`. The repository also includes a project-specific flash-sale maintainer skill for repeatable sale analysis. No global skill install is required.

## Refreshing the archive

The checked-in data is ready to use. To re-fetch the Korean source, translate it, and refresh the local portraits:

```sh
npm run sync:data
```

The sync script reads the public story index and story endpoints used by the original page. English text is machine-translated and may contain mistakes, especially in proper names or dialect-heavy dialogue. `%s` player-name tokens and the original portrait keys are preserved.

## Attribution

This is an unofficial fan project and is not affiliated with Actoz Soft or the official LaTale service. The original archive comes from [RamuWiki's scenario script tool](https://latale.wiki/scenario-script). LaTale's name, images, game data, and story text belong to Actoz Soft and their respective rights holders.
