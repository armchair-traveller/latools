<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	let { text }: { text: string } = $props();
</script>
<Tooltip.Root><Tooltip.Trigger class="spec-help" aria-label={text}>?</Tooltip.Trigger><Tooltip.Content><p class="max-w-72 text-xs leading-relaxed">{text}</p></Tooltip.Content></Tooltip.Root>
<style>:global(.spec-help){display:inline-flex;align-items:center;justify-content:center;width:15px;height:15px;border:0;border-radius:100%;font-size:10px;font-weight:700;background:#e7e2d9;color:#81796f;margin-left:5px;vertical-align:middle;cursor:help;}</style>
