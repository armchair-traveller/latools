<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BookOpenTextIcon from '@lucide/svelte/icons/book-open-text';
	import CircleDollarSignIcon from '@lucide/svelte/icons/circle-dollar-sign';
	import PercentIcon from '@lucide/svelte/icons/percent';
	import ScanSearchIcon from '@lucide/svelte/icons/scan-search';
	import ShoppingBasketIcon from '@lucide/svelte/icons/shopping-basket';

	const portraits = ['589', '786', '1399', '1102', '1373', '101', '1202', '721', '741'];
	const description =
		'Five community-made shortcuts through LaTale builds, earnings, stories, events, and sales.';
</script>

<svelte:head>
	<title>LaTale Tools — Adventurer's Dispatch</title>
	<meta name="description" content={description} />
	<meta property="og:title" content="LaTale Tools — Adventurer's Dispatch" />
	<meta property="og:description" content={description} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content={`${page.url.origin}${resolve('/og.png')}`} />
	<meta property="og:image:width" content="1731" />
	<meta property="og:image:height" content="909" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="LaTale Tools — Adventurer's Dispatch" />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={`${page.url.origin}${resolve('/og.png')}`} />
</svelte:head>

<main class="dispatch">
	<div class="poster">
		<div class="metadata-rail">
			<span>LaTale Tools / Adventurer's Dispatch</span>
			<span>Vol. 01 · 05 Utilities · <i></i> Status: online</span>
		</div>

		<section class="hero" aria-labelledby="dispatch-title">
			<div class="hero-copy">
				<div class="registration-marks" aria-hidden="true"><span>+</span><span>+</span></div>
				<p class="kicker">Community toolkit / Global service</p>
				<h1 id="dispatch-title">A better way<br />through <em>LaTale.</em></h1>
				<p class="lede">
					Damage models, Ely routes, story archives, and live reward rankings—five ways to
					spend less time guessing.
				</p>
				<div class="actions">
					<a class="action-primary" href={resolve('/scenario-script')}>
						Open the archive <ArrowRightIcon aria-hidden="true" />
					</a>
					<a class="action-secondary" href="#switchboard">View all 05 routes</a>
				</div>
				<div class="hero-note"><span>Read</span><span>Calculate</span><span>Rank</span></div>
			</div>

			<div class="roster" aria-label="LaTale character roster">
				<div class="roster-label">Party select / 09</div>
				{#each portraits as portrait (portrait)}
					<div class="portrait-cell">
						<img src={`/npc/${portrait}.png`} alt="" />
					</div>
				{/each}
				<div class="roster-ribbon">Adventurer's<br />dispatch</div>
				<div class="stats-ticket">
					<div><strong>143</strong><span>Stories</span></div>
					<div><strong>50,651</strong><span>Lines</span></div>
					<div><strong>344</strong><span>Portraits</span></div>
				</div>
			</div>
		</section>

		<div class="index-rail">
			<h2 id="switchboard-title">Choose a route</h2>
			<p>05 shortcuts through the game <span>→</span></p>
		</div>

		<section id="switchboard" class="switchboard" aria-labelledby="switchboard-title">
			<a class="route route-earnings" href={resolve('/dungeon-earnings')}>
				<div class="route-head"><strong>01</strong><CircleDollarSignIcon aria-hidden="true" /></div>
				<div>
					<h3>Dungeon earnings</h3>
					<p>Turn clear time into net Ely/hour.</p>
				</div>
				<div class="route-meta"><span>D4 + D5 · market overrides</span><ArrowRightIcon aria-hidden="true" /></div>
			</a>

			<a class="route route-sale" href={resolve('/flash-sale')}>
				<div class="route-head"><strong>02</strong><PercentIcon aria-hidden="true" /></div>
				<div>
					<h3>Flash sale ranking</h3>
					<p>Verified Ely returned for every LTC.</p>
				</div>
				<div class="route-meta"><span>Per-cycle ranks · personal view</span><ArrowRightIcon aria-hidden="true" /></div>
			</a>

			<a class="route route-event" href={resolve('/event-exchange')}>
				<div class="route-head"><strong>03</strong><ShoppingBasketIcon aria-hidden="true" /></div>
				<div class="event-copy">
					<h3>Event exchange</h3>
					<p>Rank every reward before spending points.</p>
				</div>
				<div class="item-strip" aria-hidden="true">
					<img src="/items/event-exchange/current/stage-5-slot-1.png" alt="" />
					<img src="/items/event-exchange/current/stage-5-slot-2.png" alt="" />
					<img src="/items/event-exchange/current/stage-5-slot-3.png" alt="" />
					<img src="/items/event-exchange/current/stage-5-slot-7.png" alt="" />
				</div>
				<div class="route-meta"><span>5 stages · current event</span><ArrowRightIcon aria-hidden="true" /></div>
			</a>

			<a class="route route-story" href={resolve('/scenario-script')}>
				<div class="route-head"><strong>04</strong><BookOpenTextIcon aria-hidden="true" /></div>
				<div>
					<h3>Scenario scripts</h3>
					<p>50,651 English lines, ready to search.</p>
				</div>
				<div class="route-meta"><span>143 stories · 4 chapters</span><ArrowRightIcon aria-hidden="true" /></div>
			</a>

			<a class="route route-spec" href={resolve('/spec-analyzer')}>
				<div class="route-head"><strong>05</strong><ScanSearchIcon aria-hidden="true" /></div>
				<div>
					<h3>Specification analyzer</h3>
					<p>Model damage. Compare enchants.</p>
				</div>
				<div class="route-meta"><span>7 dungeons · damage efficiency</span><ArrowRightIcon aria-hidden="true" /></div>
			</a>
		</section>
	</div>
</main>

<style>
	.dispatch {
		min-height: calc(100vh - 3.5rem);
		background-color: #f1f3f1;
		background-image: radial-gradient(rgb(24 41 34 / 8%) 0.65px, transparent 0.75px);
		background-size: 8px 8px;
		color: #17180f;
	}

	.poster {
		width: min(100%, 1120px);
		margin: 0 auto;
		padding: 18px 28px 28px;
	}

	.metadata-rail,
	.index-rail,
	.route-head,
	.route-meta,
	.stats-ticket,
	.hero-note {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		text-transform: uppercase;
	}

	.metadata-rail {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 28px;
		border-top: 2px solid #17180f;
		border-bottom: 1px solid #17180f;
		font-size: 9px;
		font-weight: 750;
		letter-spacing: 0.15em;
	}

	.metadata-rail i {
		display: inline-block;
		width: 7px;
		height: 7px;
		margin: 0 3px 0 1px;
		border: 1px solid #17180f;
		border-radius: 50%;
		background: #d7ff4f;
		box-shadow: 0 0 0 2px rgb(215 255 79 / 38%);
	}

	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(390px, 0.9fr);
		min-height: 368px;
		margin-top: 10px;
		border: 2px solid #17180f;
		background: #ffffff;
		box-shadow: 6px 6px 0 #17180f;
	}

	.hero-copy {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow: hidden;
		padding: 30px 38px 28px;
		border-right: 2px solid #17180f;
	}

	.hero-copy::before {
		position: absolute;
		top: -88px;
		right: -125px;
		width: 280px;
		aspect-ratio: 1;
		border: 2px solid #17180f;
		border-radius: 50%;
		background: #d7ff4f;
		content: '';
	}

	.registration-marks {
		position: absolute;
		top: 10px;
		right: 11px;
		left: 11px;
		display: flex;
		justify-content: space-between;
		font-family: ui-monospace, monospace;
		font-size: 15px;
		font-weight: 800;
	}

	.kicker {
		position: relative;
		z-index: 1;
		margin: 0 0 13px;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	h1,
	h2,
	h3,
	p {
		margin-top: 0;
	}

	h1 {
		position: relative;
		z-index: 1;
		max-width: 610px;
		margin-bottom: 13px;
		font-size: clamp(3.9rem, 5.1vw, 4.9rem);
		font-weight: 880;
		letter-spacing: -0.075em;
		line-height: 0.82;
		text-transform: uppercase;
	}

	h1 em {
		color: #2939d6;
		font-style: normal;
		-webkit-text-stroke: 1.5px #17180f;
		text-shadow: 3px 3px 0 #d7ff4f;
	}

	.lede {
		position: relative;
		z-index: 1;
		max-width: 520px;
		margin-bottom: 18px;
		font-size: 13px;
		font-weight: 520;
		line-height: 1.5;
	}

	.actions {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 19px;
	}

	.action-primary,
	.action-secondary,
	.route {
		outline-color: #2939d6;
		outline-offset: 4px;
	}

	.action-primary {
		display: inline-flex;
		align-items: center;
		gap: 13px;
		min-height: 38px;
		padding: 0 14px;
		border: 2px solid #17180f;
		background: #17180f;
		color: #fffdf7;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-decoration: none;
		text-transform: uppercase;
	}

	.action-primary :global(svg) {
		width: 14px;
	}

	.action-secondary {
		color: #17180f;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-decoration-thickness: 2px;
		text-underline-offset: 5px;
		text-transform: uppercase;
	}

	.hero-note {
		position: absolute;
		right: 18px;
		bottom: 10px;
		display: flex;
		gap: 12px;
		font-size: 7px;
		font-weight: 800;
		letter-spacing: 0.1em;
	}

	.hero-note span::before {
		margin-right: 4px;
		color: #ff6257;
		content: '/';
	}

	.roster {
		position: relative;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(3, 1fr);
		min-width: 0;
		overflow: hidden;
		background: #2939d6;
	}

	.roster::before {
		position: absolute;
		z-index: 1;
		top: 44px;
		left: 39px;
		width: 200px;
		aspect-ratio: 1;
		border: 2px solid #17180f;
		border-radius: 50%;
		background: #d7ff4f;
		mix-blend-mode: screen;
		content: '';
	}

	.roster-label {
		position: absolute;
		z-index: 5;
		top: 8px;
		left: 8px;
		padding: 4px 6px;
		border: 1px solid #17180f;
		background: #ffffff;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 7px;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.portrait-cell {
		position: relative;
		z-index: 2;
		display: grid;
		place-items: end center;
		min-width: 0;
		overflow: visible;
		border-right: 1px solid #17180f;
		border-bottom: 1px solid #17180f;
	}

	.portrait-cell:nth-child(3n + 1) {
		background: rgb(255 98 87 / 42%);
	}

	.portrait-cell:nth-child(3n + 2) {
		background: rgb(200 184 255 / 48%);
	}

	.portrait-cell:nth-child(4n + 1) {
		background: rgb(215 255 79 / 46%);
	}

	.portrait-cell img {
		position: relative;
		z-index: 2;
		width: 104px;
		height: 104px;
		object-fit: contain;
		filter: drop-shadow(3px 3px 0 rgb(23 24 15 / 38%));
	}

	.portrait-cell:nth-of-type(even) img {
		transform: translateY(6px) scale(1.08);
	}

	.roster-ribbon {
		position: absolute;
		z-index: 6;
		top: 54px;
		right: -34px;
		transform: rotate(90deg);
		border: 2px solid #17180f;
		padding: 5px 25px;
		background: #ff6257;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 7px;
		font-weight: 850;
		letter-spacing: 0.12em;
		line-height: 1.1;
		text-align: center;
		text-transform: uppercase;
	}

	.stats-ticket {
		position: absolute;
		z-index: 7;
		right: 10px;
		bottom: 9px;
		left: 10px;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border: 2px solid #17180f;
		background: #ffffff;
		box-shadow: 3px 3px 0 #17180f;
	}

	.stats-ticket > div {
		display: flex;
		flex-direction: column;
		padding: 7px 9px;
		border-right: 1px solid #17180f;
	}

	.stats-ticket > div:last-child {
		border-right: 0;
	}

	.stats-ticket strong {
		font-size: 14px;
		font-weight: 900;
		line-height: 1;
	}

	.stats-ticket span {
		margin-top: 3px;
		font-size: 6px;
		font-weight: 750;
		letter-spacing: 0.1em;
	}

	.index-rail {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		height: 48px;
		padding: 8px 1px 6px;
		border-bottom: 2px solid #17180f;
	}

	.index-rail h2,
	.index-rail p {
		margin: 0;
	}

	.index-rail h2 {
		font-size: 13px;
		font-weight: 900;
		letter-spacing: 0.13em;
	}

	.index-rail p {
		font-size: 8px;
		font-weight: 750;
		letter-spacing: 0.12em;
	}

	.index-rail p span {
		margin-left: 9px;
		font-size: 15px;
	}

	.switchboard {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		grid-template-rows: repeat(2, 146px);
		gap: 8px;
		padding-top: 8px;
	}

	.route {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		overflow: hidden;
		border: 2px solid #17180f;
		padding: 12px 13px 10px;
		color: #17180f;
		text-decoration: none;
		transition: box-shadow 150ms ease, transform 150ms ease;
	}

	.route:hover {
		transform: translate(-3px, -3px);
		box-shadow: 5px 5px 0 #17180f;
	}

	.route:hover .route-meta :global(svg) {
		transform: translateX(4px);
	}

	.route h3 {
		max-width: 330px;
		margin-bottom: 4px;
		font-size: 21px;
		font-weight: 820;
		letter-spacing: -0.055em;
		line-height: 0.95;
	}

	.route p {
		margin-bottom: 0;
		font-size: 11px;
		font-weight: 550;
		line-height: 1.35;
	}

	.route-head,
	.route-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.route-head strong {
		font-size: 26px;
		font-weight: 930;
		letter-spacing: -0.08em;
		line-height: 0.8;
	}

	.route-head :global(svg) {
		width: 18px;
		height: 18px;
		stroke-width: 2.2;
	}

	.route-meta {
		position: relative;
		z-index: 2;
		font-size: 7px;
		font-weight: 800;
		letter-spacing: 0.08em;
	}

	.route-meta :global(svg) {
		width: 13px;
		height: 13px;
		transition: transform 150ms ease;
	}

	.route-spec {
		grid-column: span 4;
		background: #2939d6;
		color: #fffdf7;
	}

	.route-earnings {
		grid-column: span 7;
		background: #d7ff4f;
	}

	.route-story {
		grid-column: span 3;
		background: #17180f;
		color: #fffdf7;
	}

	.route-event {
		grid-column: span 5;
		background: #ff6257;
	}

	.route-sale {
		grid-column: span 5;
		background: #c8b8ff;
	}

	.event-copy {
		position: relative;
		z-index: 2;
		max-width: calc(100% - 160px);
	}

	.item-strip {
		position: absolute;
		right: 24px;
		bottom: 28px;
		display: flex;
		transform: rotate(-3deg);
	}

	.item-strip img {
		width: 38px;
		height: 38px;
		margin-left: -7px;
		border: 2px solid #17180f;
		background: #ffffff;
		box-shadow: 2px 2px 0 #17180f;
		object-fit: contain;
	}

	@media (max-width: 1100px) {
		.switchboard {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(3, 146px);
		}

		.route {
			grid-column: span 1;
		}

		.route-spec {
			grid-column: span 2;
		}

		.event-copy {
			max-width: 58%;
		}

		.item-strip {
			right: 16px;
			bottom: 36px;
		}

		.item-strip img {
			width: 30px;
			height: 30px;
			margin-left: -6px;
		}
	}

	@media (max-width: 1000px) {
		.poster {
			padding-inline: 20px;
		}

		.hero {
			grid-template-columns: 1.2fr 0.8fr;
		}

		.hero-copy {
			padding-inline: 28px;
		}

		.portrait-cell img {
			width: 92px;
			height: 92px;
		}
	}

	@media (max-width: 800px) {
		.metadata-rail {
			height: auto;
			padding: 8px 0;
		}

		.hero {
			grid-template-columns: 1fr;
		}

		.hero-copy {
			min-height: 390px;
			border-right: 0;
			border-bottom: 2px solid #17180f;
		}

		.roster {
			min-height: 330px;
		}

		.switchboard {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: auto;
		}

		.route {
			grid-column: span 1;
			min-height: 175px;
		}

		.route-spec {
			grid-column: span 2;
		}
	}

	@media (max-width: 560px) {
		.metadata-rail,
		.actions {
			align-items: flex-start;
			flex-direction: column;
			gap: 8px;
		}

		.index-rail {
			align-items: center;
			height: auto;
			min-height: 48px;
			gap: 12px;
		}

		.index-rail p {
			margin-left: auto;
			text-align: right;
		}

		.hero-copy {
			padding-inline: 20px;
		}

		h1 {
			font-size: 3.6rem;
		}

		.switchboard {
			grid-template-columns: 1fr;
		}

		.route,
		.route-spec {
			grid-column: span 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.route,
		.route-meta :global(svg) {
			transition: none;
		}
	}
</style>
