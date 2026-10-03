<script lang="ts">
	import * as Field from '$lib/components/ui/field';
	let { label, value = $bindable(0), step = 'any', min, max, hint, compact = false }: { label: string; value?: number; step?: number | string; min?: number; max?: number; hint?: string; compact?: boolean } = $props();
	const id = $props.id();
</script>
<Field.Field orientation="horizontal" class={compact ? 'spec-number compact' : 'spec-number'}>
	<label for={id} title={hint}>{label}</label>
	<input id={id} type="number" {step} {min} {max} value={value ? Number(value.toFixed(6)) : ''} placeholder="0" oninput={(event) => value = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, Number(event.currentTarget.value) || 0))} />
</Field.Field>
<style>
	:global(.spec-number){display:grid!important;grid-template-columns:minmax(0,1fr) 112px;gap:10px!important;align-items:center;font-size:12px;padding:5px 0;}
	:global(.spec-number.compact){padding:2px 0;grid-template-columns:minmax(0,1fr) 100px;}
	label{color:var(--spec-muted,#79756f);line-height:1.35;}input{width:100%;height:27px;border:1px solid var(--spec-border,#e4dfd6);border-radius:4px;padding:3px 7px;text-align:right;background:var(--spec-bg,#faf9f6);color:var(--spec-fg,#292622);font-variant-numeric:tabular-nums;font-size:12px;}input:focus{outline:2px solid var(--spec-accent,#b65100);outline-offset:1px;}input::placeholder{color:#aaa49b;}
</style>
