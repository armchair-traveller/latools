<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import BookOpenTextIcon from '@lucide/svelte/icons/book-open-text';
	import CircleDollarSignIcon from '@lucide/svelte/icons/circle-dollar-sign';
	import PercentIcon from '@lucide/svelte/icons/percent';
	import ScanSearchIcon from '@lucide/svelte/icons/scan-search';
	import ShoppingBasketIcon from '@lucide/svelte/icons/shopping-basket';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
</script>

<svelte:head>
	<title>LaTale Tools</title>
	<meta
		name="description"
		content="Community-made LaTale utilities for specification analysis, dungeon earnings, scenario reading, event exchange rankings, and flash sale comparisons."
	/>
</svelte:head>

<main class="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
	<section class="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
		<div>
			<Badge variant="secondary">
				<SparklesIcon data-icon="inline-start" aria-hidden="true" />
				Fan-made utility shelf
			</Badge>
			<h1 class="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
				Useful corners of LaTale, gathered in one place.
			</h1>
			<p class="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
				Browse community tools built to make the game easier to explore, from character damage and
				dungeon earnings analysis to a complete English scenario reader and current event rankings.
			</p>
			<div class="mt-7 flex flex-wrap gap-3">
				<Button href={resolve('/scenario-script')} size="lg">
					Open scenario scripts
					<ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
				</Button>
				<Button href="#tools" variant="outline" size="lg">Browse tools</Button>
			</div>
		</div>

		<Card.Root>
			<Card.Header>
				<Card.Title><h2>Scenario archive at a glance</h2></Card.Title>
				<Card.Description>Dialogue mirrored and translated for fast browsing.</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="flex items-center gap-4">
					<Avatar.Root class="size-16">
						<Avatar.Image
							src="/npc/741.png"
							alt="Iris Livier"
							class="object-contain [image-rendering:pixelated]"
						/>
						<Avatar.Fallback>IL</Avatar.Fallback>
					</Avatar.Root>
					<div>
						<p class="font-medium">143 stories</p>
						<p class="mt-1 text-sm text-muted-foreground">50,651 dialogue lines</p>
					</div>
				</div>
				<div class="mt-5 flex flex-wrap gap-2">
					<Badge variant="secondary">45 main</Badge>
					<Badge variant="secondary">98 side</Badge>
					<Badge variant="outline">4 chapters</Badge>
				</div>
			</Card.Content>
			<Card.Footer class="border-t">
				<p class="text-xs text-muted-foreground">Translated from the Korean fan wiki archive.</p>
			</Card.Footer>
		</Card.Root>
	</section>

	<Separator class="my-12 sm:my-16" />

	<section id="tools" aria-labelledby="tools-heading">
		<div class="max-w-2xl">
			<p class="text-sm font-medium text-secondary-foreground">Tool library</p>
			<h2 id="tools-heading" class="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
				Start exploring
			</h2>
			<p class="mt-2 text-muted-foreground">Pick a focused guide and get straight to what you need.</p>
		</div>

		<div class="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
			<Card.Root>
				<Card.Header>
					<div class="mb-3 grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
						<ScanSearchIcon class="size-5" aria-hidden="true" />
					</div>
					<Card.Title><h3>Specification analyzer</h3></Card.Title>
					<Card.Description>
						Model your character stats, compare enchants, and see damage efficiency by dungeon.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-wrap gap-2">
						<Badge variant="secondary">Damage model</Badge>
						<Badge variant="outline">7 dungeons</Badge>
						<Badge variant="outline">Enchant compare</Badge>
					</div>
				</Card.Content>
				<Card.Footer class="border-t">
					<Button href={resolve('/spec-analyzer')}>
						Analyze stats
						<ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
					</Button>
				</Card.Footer>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<div class="mb-3 grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
						<CircleDollarSignIcon class="size-5" aria-hidden="true" />
					</div>
					<Card.Title><h3>Dungeon earnings</h3></Card.Title>
					<Card.Description>
						Estimate net Ely per hour from expected dungeon drops, service sales, and reusable buffs.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-wrap gap-2">
						<Badge variant="secondary">D4 + D5</Badge>
						<Badge variant="outline">Market overrides</Badge>
						<Badge variant="outline">Buff costs</Badge>
					</div>
				</Card.Content>
				<Card.Footer class="border-t">
					<Button href={resolve('/dungeon-earnings')}>
						Estimate earnings
						<ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
					</Button>
				</Card.Footer>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<div class="mb-3 grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
						<BookOpenTextIcon class="size-5" aria-hidden="true" />
					</div>
					<Card.Title><h3>Scenario scripts</h3></Card.Title>
					<Card.Description>
						Read every mirrored main and side scenario in English, organized by chapter and step.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-wrap gap-2">
						<Badge variant="secondary">English</Badge>
						<Badge variant="outline">Searchable</Badge>
						<Badge variant="outline">Player-name replacement</Badge>
					</div>
				</Card.Content>
				<Card.Footer class="border-t">
					<Button href={resolve('/scenario-script')}>
						Open tool
						<ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
					</Button>
				</Card.Footer>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<div class="mb-3 grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
						<ShoppingBasketIcon class="size-5" aria-hidden="true" />
					</div>
					<Card.Title><h3>Event exchange ranking</h3></Card.Title>
					<Card.Description>
						Compare the current event rewards across all five exchange stages before spending points.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-wrap gap-2">
						<Badge variant="secondary">Current event</Badge>
						<Badge variant="outline">5 stages</Badge>
						<Badge variant="outline">Value per point</Badge>
					</div>
				</Card.Content>
				<Card.Footer class="border-t">
					<Button href={resolve('/event-exchange')}>
						View ranking
						<ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
					</Button>
				</Card.Footer>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<div class="mb-3 grid size-10 place-items-center rounded-lg bg-secondary text-secondary-foreground">
						<PercentIcon class="size-5" aria-hidden="true" />
					</div>
					<Card.Title><h3>Flash sale ranking</h3></Card.Title>
					<Card.Description>
						Compare each sale cycle by verified Ely returned for every LTC spent.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-wrap gap-2">
						<Badge variant="secondary">Current sale</Badge>
						<Badge variant="outline">Per-cycle ranks</Badge>
						<Badge variant="outline">Personal view</Badge>
					</div>
				</Card.Content>
				<Card.Footer class="border-t">
					<Button href={resolve('/flash-sale')}>
						Compare offers
						<ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
					</Button>
				</Card.Footer>
			</Card.Root>
		</div>
	</section>
</main>
