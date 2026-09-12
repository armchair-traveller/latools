<script lang="ts">
	import GitBranchIcon from '@lucide/svelte/icons/git-branch';
	import Repeat2Icon from '@lucide/svelte/icons/repeat-2';
	import { base } from '$app/paths';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import { scenarioScriptText, scriptSpeakerName } from '$lib/scenario-script.js';
	import type { DialogueLine } from '$lib/scenario-script-types';

	let { lines, speakers, playerName, language, sceneId }: {
		lines: DialogueLine[];
		speakers: Record<string, number>;
		playerName: string;
		language: 'en' | 'ko';
		sceneId: string;
	} = $props();
</script>

{#snippet dialogue(entries: DialogueLine[], prefix: string, depth = 0)}
	<ol class="dialogue-list">
		{#each entries as line, lineIndex (`${prefix}-${line.id}-${lineIndex}`)}
			{@const speaker = scriptSpeakerName(line, playerName, language)}
			{@const portraitId = line.speaker && !/^\s*%s\s*$/i.test(line.speaker) ? speakers[line.speaker] : undefined}
			<li class="dialogue-entry">
				{#if line.speaker}
					<div class="spoken-line">
						<Avatar.Root size="lg">
							{#if portraitId !== undefined}
								<Avatar.Image src={`${base}/npc/${portraitId}.png`} alt="" loading="lazy" />
							{/if}
							<Avatar.Fallback>{speaker.slice(0, 2).toUpperCase()}</Avatar.Fallback>
						</Avatar.Root>
						<div class="spoken-copy">
							<p class="speaker-name">{speaker}</p>
							<p class="dialogue-text">{scenarioScriptText(line.text, playerName)}</p>
						</div>
					</div>
				{:else}
					<p class="narration">{scenarioScriptText(line.text, playerName)}</p>
				{/if}

				{#if line.choices?.length}
					<div class={cn('choices', depth >= 2 && 'deep-branch')}>
						<p class="choice-label"><GitBranchIcon aria-hidden="true" /> {line.choices.length === 1 ? 'Your response' : `${line.choices.length} possible responses`}</p>
						<ol class="choice-list">
							{#each line.choices as choice, choiceIndex (`${line.id}-${choice.goto}-${choiceIndex}`)}
								<li class="choice-branch">
									<div class="choice-heading">
										<Badge variant="outline">Choice {choiceIndex + 1}</Badge>
									</div>
									<p class="choice-text">{scenarioScriptText(choice.text, playerName)}</p>
									{#if choice.lines?.length}
										{@render dialogue(choice.lines, `${prefix}-${lineIndex}-choice-${choiceIndex}`, depth + 1)}
									{:else}
										<p class="repeated-dialogue"><Repeat2Icon aria-hidden="true" /> This response returns to an existing dialogue branch.</p>
									{/if}
								</li>
							{/each}
						</ol>
					</div>
				{/if}
			</li>
		{/each}
	</ol>
{/snippet}

<div lang={language}>
	{@render dialogue(lines, sceneId)}
</div>

<style>
	.dialogue-list { display: flex; flex-direction: column; gap: 1.6rem; }
	.dialogue-entry, .spoken-copy { min-width: 0; }
	.spoken-line { display: flex; align-items: flex-start; gap: .9rem; }
	.speaker-name { margin: .05rem 0 .4rem; font-size: .78rem; font-weight: 650; color: var(--foreground); }
	.dialogue-text, .choice-text, .narration { white-space: pre-line; overflow-wrap: anywhere; font-size: .9rem; line-height: 1.85; }
	.narration { margin-block: .1rem; padding: .1rem 0 .1rem 1rem; border-left: 2px solid var(--border); color: var(--muted-foreground); font-style: italic; }
	.choices { margin: 1.25rem 0 0 3.4rem; }
	.choices.deep-branch { margin-left: 0; }
	.choice-label { display: flex; align-items: center; gap: .45rem; margin-bottom: .9rem; font-size: .7rem; font-weight: 600; color: var(--muted-foreground); }
	.choice-label :global(svg), .repeated-dialogue :global(svg) { width: .9rem; height: .9rem; flex-shrink: 0; }
	.choice-list { display: flex; flex-direction: column; gap: 1.15rem; }
	.choice-branch { padding-left: 1rem; border-left: 2px solid var(--border); }
	.choice-heading { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
	.choice-text { margin: .65rem 0 1rem; font-weight: 500; }
	.repeated-dialogue { display: flex; align-items: flex-start; gap: .5rem; color: var(--muted-foreground); font-size: .72rem; line-height: 1.7; }
	.repeated-dialogue :global(svg) { margin-top: .15rem; }
	@media (max-width: 640px) {
		.spoken-line { gap: .65rem; }
		.choices { margin-left: .5rem; }
		.choice-branch { padding-left: .65rem; }
		.dialogue-text, .choice-text, .narration { font-size: .85rem; }
	}
</style>
