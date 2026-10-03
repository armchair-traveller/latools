<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { Button } from '$lib/components/ui/button';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import * as ToggleGroup from '$lib/components/ui/toggle-group';
	import {
		aggregateStats,
		inspectNumericInput,
		type AggregateStatKey,
		type NumericSpecInputKey,
		type SpecInputs
	} from '$lib/spec-analyzer';

	let { inputs = $bindable() }: { inputs: SpecInputs } = $props();

	type StatRow = {
		key: AggregateStatKey;
		flat: NumericSpecInputKey;
		percent: NumericSpecInputKey;
		label: string;
		unit: string;
	};
	type ExtraField = {
		key: NumericSpecInputKey;
		label: string;
		help?: string;
	};

	const id = $props.id();
	let advancedOpen = $state(false);
	const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
	const stats = $derived(aggregateStats(inputs));
	const rows: StatRow[] = $derived([
		{
			key: 'strMag', flat: 'strMagFlat', percent: 'strMagPercent',
			label: inputs.physicalJob ? 'Strength' : 'Magic', unit: ''
		},
		{
			key: 'weaponAttr', flat: 'weaponAttrFlat', percent: 'weaponAttrPercent',
			label: inputs.physicalJob ? 'Max. weapon attack' : 'Elemental intensity', unit: ''
		},
		{ key: 'criticalDamage', flat: 'critDmgFlat', percent: 'critDmgPercent', label: 'Critical damage', unit: '%' },
		{ key: 'minimumDamage', flat: 'minDmgFlat', percent: 'minDmgPercent', label: 'Minimum damage', unit: '%' },
		{ key: 'maximumDamage', flat: 'maxDmgFlat', percent: 'maxDmgPercent', label: 'Maximum damage', unit: '%' },
		{ key: 'fixedDamage', flat: 'fixedDmgFlat', percent: 'fixedDmgPercent', label: 'Fixed damage', unit: '' },
		{ key: 'normalExtraDamage', flat: 'normalExtraDmgFlat', percent: 'normalExtraDmgPercent', label: 'Normal extra damage', unit: '' },
		{ key: 'bossExtraDamage', flat: 'bossExtraDmgFlat', percent: 'bossExtraDmgPercent', label: 'Boss extra damage', unit: '' }
	]);
	const extraFields: ExtraField[] = [
		{ key: 'normalDomination', label: 'Normal domination (%)' },
		{ key: 'bossDomination', label: 'Boss domination (%)' },
		{ key: 'penetration', label: 'Penetration (%)', help: 'Applied up to 99%.' },
		{ key: 'characterLevel', label: 'Character level', help: 'Used for dungeon guard correction.' },
		{ key: 'strMagEfficiency', label: 'STR / MAG efficiency (%)' },
		{ key: 'backAttackDmg', label: 'Back attack damage (%)' },
		{ key: 'weaponMinimum', label: 'Minimum weapon attack', help: 'Total value. Leave at 0 to use maximum weapon attack.' },
		{ key: 'meleeDamage', label: 'Melee damage (%)' },
		{ key: 'statusDamage', label: 'Status damage (%)' }
	];

	function invalid(key: NumericSpecInputKey) {
		return !inspectNumericInput(inputs[key]).valid;
	}
</script>

<div class="@container/stat-editor flex min-w-0 flex-col gap-5">
	<Field.FieldGroup class="gap-3">
		<Field.Field orientation="responsive" class="items-start">
			<Field.FieldContent>
				<Field.FieldLabel id="{id}-damage-type">Damage type</Field.FieldLabel>
				<Field.FieldDescription>Use your buffed, detailed Status Window values.</Field.FieldDescription>
			</Field.FieldContent>
			<ToggleGroup.Root
				type="single"
				variant="outline"
				size="sm"
				value={inputs.physicalJob ? 'physical' : 'magic'}
				onValueChange={(value) => { if (value) inputs.physicalJob = value === 'physical'; }}
				aria-labelledby="{id}-damage-type"
			>
				<ToggleGroup.Item value="physical">Physical</ToggleGroup.Item>
				<ToggleGroup.Item value="magic">Magic</ToggleGroup.Item>
			</ToggleGroup.Root>
		</Field.Field>
	</Field.FieldGroup>

	<div class="flex min-w-0 flex-col gap-2">
		<div
			class="grid grid-cols-[minmax(0,1fr)_minmax(0,.7fr)_minmax(0,1fr)] items-end gap-2 text-xs text-muted-foreground @lg/stat-editor:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,.7fr)_minmax(0,1fr)]"
			aria-hidden="true"
		>
			<span class="hidden @lg/stat-editor:block">Stat</span>
			<span>Raw value</span>
			<span>Bonus %</span>
			<span class="text-right">Total</span>
		</div>
		<Field.FieldGroup class="gap-3 @lg/stat-editor:gap-2">
			{#each rows as row (row.key)}
				{@const flatInvalid = invalid(row.flat)}
				{@const percentInvalid = invalid(row.percent)}
				<Field.FieldGroup
					class="grid grid-cols-[minmax(0,1fr)_minmax(0,.7fr)_minmax(0,1fr)] items-center gap-2 @lg/stat-editor:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,.7fr)_minmax(0,1fr)]"
				>
					<span class="col-span-full text-sm @lg/stat-editor:col-span-1">{row.label}</span>
					<Field.Field data-invalid={flatInvalid} class="min-w-0 gap-0">
						<Field.FieldLabel for="{id}-{row.flat}" class="sr-only !w-px">{row.label} raw value</Field.FieldLabel>
						<Input
							id="{id}-{row.flat}"
							type="text"
							inputmode="decimal"
							autocomplete="off"
							spellcheck={false}
							bind:value={inputs[row.flat]}
							aria-invalid={flatInvalid}
							aria-describedby={flatInvalid ? `${id}-${row.key}-error` : `${id}-input-help`}
						/>
					</Field.Field>
					<Field.Field data-invalid={percentInvalid} class="min-w-0 gap-0">
						<Field.FieldLabel for="{id}-{row.percent}" class="sr-only !w-px">{row.label} bonus percent</Field.FieldLabel>
						<Input
							id="{id}-{row.percent}"
							type="text"
							inputmode="decimal"
							autocomplete="off"
							spellcheck={false}
							bind:value={inputs[row.percent]}
							aria-invalid={percentInvalid}
							aria-describedby={percentInvalid ? `${id}-${row.key}-error` : `${id}-input-help`}
						/>
					</Field.Field>
					<output
						for="{id}-{row.flat} {id}-{row.percent}"
						aria-label="{row.label} total"
						class="min-w-0 text-right text-sm font-medium break-words tabular-nums"
					>
						{flatInvalid || percentInvalid ? '—' : `${numberFormat.format(stats[row.key].total)}${row.unit}`}
					</output>
					{#if flatInvalid || percentInvalid}
						<Field.FieldError id="{id}-{row.key}-error" class="col-span-full">
							Enter a number or a complete arithmetic expression.
						</Field.FieldError>
					{/if}
				</Field.FieldGroup>
			{/each}
		</Field.FieldGroup>
		<p id="{id}-input-help" class="mt-1 text-xs leading-relaxed text-muted-foreground">
			Use the separate raw value and percentage from each stat’s details. Expressions such as
			<code class="font-mono">5000 + 260</code> work too. Totals include any selected summon bonus.
		</p>
	</div>

	<Separator />

	<Collapsible.Root bind:open={advancedOpen} class="flex flex-col gap-3">
		<Collapsible.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="ghost" class="group w-full justify-between">
					Combat modifiers
					<ChevronDown data-icon="inline-end" class="transition-transform group-data-[state=open]:rotate-180" />
				</Button>
			{/snippet}
		</Collapsible.Trigger>
		<Collapsible.Content>
			<Field.FieldGroup class="grid grid-cols-1 gap-4 @xs/stat-editor:grid-cols-2">
				{#each extraFields as field (field.key)}
					{@const fieldInvalid = invalid(field.key)}
					<Field.Field data-invalid={fieldInvalid} class="min-w-0">
						<Field.FieldLabel for="{id}-{field.key}">{field.label}</Field.FieldLabel>
						<Input
							id="{id}-{field.key}"
							type="text"
							inputmode="decimal"
							autocomplete="off"
							spellcheck={false}
							bind:value={inputs[field.key]}
							aria-invalid={fieldInvalid}
							aria-describedby={fieldInvalid ? `${id}-${field.key}-error` : field.help ? `${id}-${field.key}-help` : undefined}
						/>
						{#if fieldInvalid}
							<Field.FieldError id="{id}-{field.key}-error">Enter a valid number or expression.</Field.FieldError>
						{:else if field.help}
							<Field.FieldDescription id="{id}-{field.key}-help">{field.help}</Field.FieldDescription>
						{/if}
					</Field.Field>
				{/each}
				<Field.Field>
					<Field.FieldLabel id="{id}-melee-label">Apply melee bonus</Field.FieldLabel>
					<ToggleGroup.Root
						type="single" variant="outline" size="sm"
						value={inputs.meleeAttack ? 'on' : 'off'}
						onValueChange={(value) => { if (value) inputs.meleeAttack = value === 'on'; }}
						aria-labelledby="{id}-melee-label"
					>
						<ToggleGroup.Item value="off">Off</ToggleGroup.Item>
						<ToggleGroup.Item value="on">On</ToggleGroup.Item>
					</ToggleGroup.Root>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel id="{id}-status-label">Apply status bonus</Field.FieldLabel>
					<ToggleGroup.Root
						type="single" variant="outline" size="sm"
						value={inputs.statusAttack ? 'on' : 'off'}
						onValueChange={(value) => { if (value) inputs.statusAttack = value === 'on'; }}
						aria-labelledby="{id}-status-label"
					>
						<ToggleGroup.Item value="off">Off</ToggleGroup.Item>
						<ToggleGroup.Item value="on">On</ToggleGroup.Item>
					</ToggleGroup.Root>
				</Field.Field>
			</Field.FieldGroup>
		</Collapsible.Content>
	</Collapsible.Root>
</div>
