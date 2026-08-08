// @ts-check

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
	maximumFractionDigits: 2
});
const exactIntegerFormatter = new Intl.NumberFormat('en-US', {
	maximumFractionDigits: 0
});

const compactUnits = [
	{ divisor: 1, suffix: '' },
	{ divisor: 1_000, suffix: 'k' },
	{ divisor: 1_000_000, suffix: 'm' },
	{ divisor: 1_000_000_000, suffix: 'b' },
	{ divisor: 1_000_000_000_000, suffix: 't' },
	{ divisor: 1_000_000_000_000_000, suffix: 'q' }
];

const inputMultipliers = new Map([
	['', 1n],
	['k', 1_000n],
	['m', 1_000_000n],
	['b', 1_000_000_000n]
]);
const maxSafeInteger = BigInt(Number.MAX_SAFE_INTEGER);

/**
 * Parse a whole-Ely amount with optional grouping separators or a compact suffix.
 * Examples: 2,500,000; 2.5m; 9b.
 *
 * @param {unknown} value
 * @returns {number | null}
 */
export function parseElyInput(value) {
	if (typeof value === 'number') {
		return Number.isSafeInteger(value) && value >= 0 ? value : null;
	}
	if (typeof value !== 'string') return null;

	const normalized = value.trim().toLowerCase();
	if (!normalized) return null;
	const match = /^(?:\+)?((?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d*)?|\.\d+)\s*([kmb]?)$/.exec(
		normalized
	);
	if (!match) return null;

	const [whole = '', fraction = ''] = match[1].replaceAll(',', '').split('.');
	const multiplier = inputMultipliers.get(match[2] ?? '');
	if (multiplier === undefined) return null;
	const digits = BigInt(`${whole || '0'}${fraction}`);
	const decimalDivisor = 10n ** BigInt(fraction.length);
	const scaled = digits * multiplier;
	if (scaled % decimalDivisor !== 0n) return null;
	const amount = scaled / decimalDivisor;
	return amount <= maxSafeInteger ? Number(amount) : null;
}

/**
 * Normalize a valid editable value without losing a single Ely. Shorthand is
 * preserved; unsuffixed values receive grouping separators.
 *
 * @param {string} value
 */
export function normalizeElyInput(value) {
	const parsed = parseElyInput(value);
	if (parsed === null) return value;
	const trimmed = value.trim().toLowerCase().replace(/^\+/, '');
	return /[kmb]\s*$/.test(trimmed)
		? trimmed.replaceAll(/\s/g, '')
		: exactIntegerFormatter.format(parsed);
}

/**
 * Format a finite Ely value with a compact, lowercase magnitude suffix.
 * Calculations retain their original precision; only the display is shortened.
 *
 * @param {number} value
 */
function compactElyParts(value) {
	if (!Number.isFinite(value)) return { text: '—', exact: false };

	const magnitude = Math.abs(value);
	let unitIndex = 0;
	for (let index = compactUnits.length - 1; index > 0; index -= 1) {
		if (magnitude >= compactUnits[index].divisor) {
			unitIndex = index;
			break;
		}
	}

	let scaled = value / compactUnits[unitIndex].divisor;
	const rounded = Math.round(scaled * 100) / 100;
	if (Math.abs(rounded) >= 1_000 && unitIndex < compactUnits.length - 1) {
		unitIndex += 1;
		scaled = value / compactUnits[unitIndex].divisor;
	}

	const formattedNumber = compactNumberFormatter.format(scaled);
	const displayedValue =
		Number(formattedNumber.replaceAll(',', '')) * compactUnits[unitIndex].divisor;
	return {
		text: `${formattedNumber}${compactUnits[unitIndex].suffix}`,
		exact: displayedValue === value
	};
}

/** @param {number} value */
export function formatCompactElyAmount(value) {
	return compactElyParts(value).text;
}

/** @param {number | null | undefined} value */
export function formatCompactEly(value) {
	if (value === null || value === undefined) return 'Pending';
	if (!Number.isFinite(value)) return '—';
	const formatted = compactElyParts(value);
	return `${formatted.exact ? '' : '≈'}${formatted.text} Ely`;
}
