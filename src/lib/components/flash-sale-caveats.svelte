<script lang="ts">
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Collapsible from '$lib/components/ui/collapsible';

	let {
		offerName,
		caveats,
		note
	}: { offerName: string; caveats: string[]; note: string | null } = $props();

	let notes = $derived(
		[...new Set([note, ...caveats].filter((item): item is string => Boolean(item?.trim())))]
	);
</script>

{#if notes.length > 0}
	<Collapsible.Root>
		<Collapsible.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="ghost"
					class="group/caveats min-h-11 w-full justify-start gap-2.5"
					aria-label={`Caveats for ${offerName}, ${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`}
				>
					<span>Caveats</span>
					<Badge variant="outline" aria-hidden="true">{notes.length}</Badge>
					<ChevronRightIcon
						data-icon="inline-end"
						class="ml-auto transition-transform duration-150 group-data-[state=open]/caveats:rotate-90 motion-reduce:transition-none"
						aria-hidden="true"
					/>
				</Button>
			{/snippet}
		</Collapsible.Trigger>
		<Collapsible.Content>
			<ul class="caveat-list">
				{#each notes as item (item)}
					<li>{item}</li>
				{/each}
			</ul>
		</Collapsible.Content>
	</Collapsible.Root>
{/if}

<style>
	.caveat-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 0;
		padding: 0.9rem 0.75rem 0.35rem 1.75rem;
		color: var(--muted-foreground);
		font-size: 0.8125rem;
		line-height: 1.65;
		list-style: disc;
		overflow-wrap: anywhere;
	}

	.caveat-list li {
		max-width: 90ch;
		padding-left: 0.25rem;
	}

	.caveat-list li::marker {
		color: var(--primary);
	}
</style>
