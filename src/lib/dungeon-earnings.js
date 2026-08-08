// @ts-check

/** @typedef {import('$lib/types').DungeonEarningsBuff} DungeonEarningsBuff */
/** @typedef {import('$lib/types').DungeonEarningsCatalog} DungeonEarningsCatalog */
/** @typedef {import('$lib/types').DungeonEarningsEstimate} DungeonEarningsEstimate */
/** @typedef {import('$lib/types').DungeonEarningsEstimateInput} DungeonEarningsEstimateInput */
/** @typedef {import('$lib/types').DungeonEarningsPriceKind} DungeonEarningsPriceKind */
/** @typedef {import('$lib/types').DungeonEarningsPriceOverrides} DungeonEarningsPriceOverrides */
/** @typedef {import('$lib/types').DungeonEarningsRewardRow} DungeonEarningsRewardRow */
/** @typedef {import('$lib/types').DungeonEarningsServiceStrategyRow} DungeonEarningsServiceStrategyRow */
/** @typedef {import('$lib/types').DungeonEarningsSnapshotPrice} DungeonEarningsSnapshotPrice */

export const MARKET_SELLING_FEE_RATE = 0.01;
// Retained as the documented game constant. Maintained reward rows already include
// the bonus and therefore set d5BonusEligible to false.
export const D5_MATERIAL_BONUS_RATE = 0.05;

const MAX_SAFE_MAGNITUDE = Number.MAX_SAFE_INTEGER;

/**
 * @param {unknown} value
 * @param {string} label
 * @returns {asserts value is number}
 */
function assertSafeNumber(value, label) {
	if (
		typeof value !== 'number' ||
		!Number.isFinite(value) ||
		Math.abs(value) > MAX_SAFE_MAGNITUDE
	) {
		throw new RangeError(`${label} must be a finite number within JavaScript's safe numeric range.`);
	}
}

/**
 * @param {unknown} value
 * @param {string} label
 * @returns {asserts value is number}
 */
function assertNonNegative(value, label) {
	assertSafeNumber(value, label);
	if (value < 0) throw new RangeError(`${label} must be nonnegative.`);
}

/**
 * @param {unknown} value
 * @param {string} label
 * @returns {asserts value is number}
 */
function assertPositive(value, label) {
	assertSafeNumber(value, label);
	if (value <= 0) throw new RangeError(`${label} must be greater than zero.`);
}

/**
 * @param {number} value
 * @param {string} label
 */
function safeResult(value, label) {
	assertSafeNumber(value, label);
	return value;
}

/**
 * @template {{ id: string }} T
 * @param {T[]} entries
 * @param {string} label
 * @returns {Map<string, T>}
 */
function entriesById(entries, label) {
	const result = new Map();
	for (const entry of entries) {
		if (result.has(entry.id)) throw new Error(`Duplicate ${label} id: ${entry.id}`);
		result.set(entry.id, entry);
	}
	return result;
}

/**
 * @param {DungeonEarningsSnapshotPrice[]} entries
 * @returns {Map<string, DungeonEarningsSnapshotPrice>}
 */
function pricesById(entries) {
	const result = new Map();
	for (const entry of entries) {
		if (result.has(entry.itemId)) throw new Error(`Duplicate snapshot price id: ${entry.itemId}`);
		result.set(entry.itemId, entry);
	}
	return result;
}

/** @param {string[]} values */
function uniqueStrings(values) {
	return [...new Set(values)];
}

/**
 * @param {Array<number | null>} values
 * @param {string} label
 */
function sumKnownValues(values, label) {
	let total = 0;
	for (const value of values) total += value ?? 0;
	return safeResult(total, label);
}

/**
 * Resolve a maintained snapshot price. Overrides may be disabled for fixed-price
 * buffs. The caller decides whether an override actually influenced the result.
 *
 * @param {string} itemId
 * @param {DungeonEarningsPriceKind} expectedKind
 * @param {Map<string, DungeonEarningsSnapshotPrice>} snapshotPrices
 * @param {DungeonEarningsPriceOverrides} overrides
 * @param {boolean} [allowOverride]
 */
function resolvePrice(itemId, expectedKind, snapshotPrices, overrides, allowOverride = true) {
	const snapshotPrice = snapshotPrices.get(itemId);
	if (snapshotPrice && snapshotPrice.kind !== expectedKind) {
		throw new Error(`Price ${itemId} has kind ${snapshotPrice.kind}; expected ${expectedKind}.`);
	}

	if (allowOverride && Object.hasOwn(overrides, itemId)) {
		const overridden = overrides[itemId];
		assertNonNegative(overridden, `Price override ${itemId}`);
		return {
			unitPriceEly: overridden,
			priceSource: /** @type {const} */ ('override'),
			overrideId: itemId
		};
	}

	if (!snapshotPrice || snapshotPrice.status === 'pending') {
		return { unitPriceEly: null, priceSource: null, overrideId: null };
	}

	assertNonNegative(snapshotPrice.unitEly, `Snapshot price ${itemId}`);
	return {
		unitPriceEly: snapshotPrice.unitEly,
		priceSource: /** @type {const} */ ('snapshot'),
		overrideId: null
	};
}

/**
 * @param {number | null} quantity
 * @param {number | null} unitPriceEly
 * @param {number} conversionCostPerUnitEly
 * @param {string} label
 */
function calculateMarketValues(quantity, unitPriceEly, conversionCostPerUnitEly, label) {
	if (quantity === null || unitPriceEly === null) {
		return {
			grossEly: null,
			feeEly: null,
			conversionCostEly: null,
			netEly: null
		};
	}
	const grossEly = safeResult(quantity * unitPriceEly, `${label} gross`);
	const feeEly = safeResult(grossEly * MARKET_SELLING_FEE_RATE, `${label} fee`);
	const conversionCostEly = safeResult(
		quantity * conversionCostPerUnitEly,
		`${label} conversion cost`
	);
	return {
		grossEly,
		feeEly,
		conversionCostEly,
		netEly: safeResult(grossEly - feeEly - conversionCostEly, `${label} net`)
	};
}

/**
 * Validate and deduplicate the selected universal buffs.
 *
 * @param {DungeonEarningsCatalog} catalog
 * @param {string[]} [selectedBuffIds]
 * @returns {DungeonEarningsBuff[]}
 */
export function validateDungeonBuffSelection(catalog, selectedBuffIds = []) {
	if (!Array.isArray(selectedBuffIds)) throw new TypeError('selectedBuffIds must be an array.');

	const buffs = entriesById(catalog.buffs, 'buff');
	const selected = uniqueStrings(selectedBuffIds).map((buffId) => {
		const buff = buffs.get(buffId);
		if (!buff) throw new Error(`Unknown dungeon-earnings buff: ${buffId}`);
		return buff;
	});
	const groupSelections = new Map();

	for (const buff of selected) {
		if (!buff.exclusivityGroup) continue;
		const conflictingBuff = groupSelections.get(buff.exclusivityGroup);
		if (conflictingBuff) {
			throw new Error(
				`Conflicting buffs in exclusivity group ${buff.exclusivityGroup}: ${conflictingBuff} and ${buff.id}`
			);
		}
		groupSelections.set(buff.exclusivityGroup, buff.id);
	}

	return selected;
}

export const validateBuffSelection = validateDungeonBuffSelection;

/**
 * Calculate both the full direct-market scenario and a prioritized service-first
 * scenario. Service recipes consume one shared expected reward inventory, then
 * only the leftover market-routed inventory is auctioned.
 *
 * @param {DungeonEarningsEstimateInput} input
 * @returns {DungeonEarningsEstimate}
 */
export function calculateDungeonEarnings(input) {
	const {
		catalog,
		snapshot,
		dungeonId,
		difficulty,
		clearTimeSeconds,
		selectedBuffIds = [],
		priceOverrides = {}
	} = input;

	assertPositive(clearTimeSeconds, 'clearTimeSeconds');
	if (difficulty !== 'D4' && difficulty !== 'D5') {
		throw new Error(`Unknown dungeon difficulty: ${difficulty}`);
	}
	if (catalog.market.feeRate !== MARKET_SELLING_FEE_RATE) {
		throw new Error(`Dungeon earnings requires a ${MARKET_SELLING_FEE_RATE * 100}% market fee.`);
	}
	if (catalog.d5MaterialBonusRate !== D5_MATERIAL_BONUS_RATE) {
		throw new Error(`Dungeon earnings requires a ${D5_MATERIAL_BONUS_RATE * 100}% D5 material bonus.`);
	}
	if (snapshot.marketId !== catalog.market.id || snapshot.currency !== catalog.market.currency) {
		throw new Error('The economy snapshot does not match the catalog market.');
	}
	if (!priceOverrides || typeof priceOverrides !== 'object' || Array.isArray(priceOverrides)) {
		throw new TypeError('priceOverrides must be an object keyed by price item id.');
	}
	for (const [itemId, value] of Object.entries(priceOverrides)) {
		assertNonNegative(value, `Price override ${itemId}`);
	}

	const dungeons = entriesById(catalog.dungeons, 'dungeon');
	const rewardItems = entriesById(catalog.rewardItems, 'reward item');
	const serviceRecipes = entriesById(catalog.serviceRecipes, 'service recipe');
	const snapshotPrices = pricesById(snapshot.prices);
	const selectedBuffs = validateDungeonBuffSelection(catalog, selectedBuffIds);
	const usedOverrideIds = new Set();
	const dungeon = dungeons.get(dungeonId);
	if (!dungeon) throw new Error(`Unknown dungeon: ${dungeonId}`);
	const profile = dungeon.difficulties[difficulty];
	if (!profile) throw new Error(`Dungeon ${dungeonId} does not define ${difficulty}.`);

	const clearsPerHour = safeResult(3600 / clearTimeSeconds, 'clearsPerHour');
	/** @type {string[]} */
	const missingMechanicIds = [];
	/** @type {string[]} */
	const missingIncomePriceIds = [];
	/** @type {Map<string, number | null>} */
	const inventory = new Map();
	/** @type {Map<string, { item: import('$lib/types').DungeonEarningsRewardItem, common: Omit<import('$lib/types').DungeonEarningsRewardRow, 'route'> & { route?: never } }>} */
	const rewardDrafts = new Map();

	for (const reward of profile.rewards) {
		const item = rewardItems.get(reward.itemId);
		if (!item) throw new Error(`Unknown reward item: ${reward.itemId}`);
		if (rewardDrafts.has(item.id)) {
			throw new Error(`Duplicate reward item in ${dungeonId} ${difficulty}: ${item.id}`);
		}

		/** @type {string[]} */
		const rowMissingMechanics = [];
		let baseExpectedPerClear = null;
		if (reward.yield.status === 'known') {
			assertNonNegative(
				reward.yield.expectedPerClear,
				`Expected yield for ${dungeonId} ${difficulty} ${item.id}`
			);
			baseExpectedPerClear = reward.yield.expectedPerClear;
		} else {
			rowMissingMechanics.push(`yield:${dungeonId}:${difficulty}:${item.id}`);
		}

		let bonusRate = 0;
		if (difficulty === 'D5') {
			// Compatibility for older catalogs only. Current maintained expected yields
			// already include the bonus and deliberately set this marker to false.
			if (reward.d5BonusEligible === true) bonusRate = D5_MATERIAL_BONUS_RATE;
			else if (reward.d5BonusEligible === null) {
				rowMissingMechanics.push(`bonus:${dungeonId}:${difficulty}:${item.id}`);
			}
		} else if (reward.d5BonusEligible === true) {
			throw new Error(`D5 material bonus cannot be applied to D4 reward ${item.id}.`);
		}

		const effectiveExpectedPerClear =
			baseExpectedPerClear === null
				? null
				: safeResult(
						baseExpectedPerClear * (1 + bonusRate),
						`Effective yield for ${dungeonId} ${difficulty} ${item.id}`
					);
		if (item.route === 'pending') rowMissingMechanics.push(`route:${item.id}`);

		inventory.set(item.id, effectiveExpectedPerClear);
		rewardDrafts.set(item.id, {
			item,
			// This draft becomes a concrete union member after service allocation.
			common: /** @type {any} */ ({
				itemId: item.id,
				name: item.name,
				icon: item.icon,
				baseExpectedPerClear,
				bonusRate,
				effectiveExpectedPerClear,
				missingMechanicIds: rowMissingMechanics,
				missingPriceIds: []
			})
		});
		missingMechanicIds.push(...rowMissingMechanics);
	}

	/** @type {DungeonEarningsServiceStrategyRow[]} */
	const serviceStrategyRows = [];
	const seenStrategyIds = new Set();
	for (const strategyId of profile.serviceStrategyIds ?? []) {
		if (seenStrategyIds.has(strategyId)) {
			throw new Error(`Duplicate service strategy id in ${dungeonId} ${difficulty}: ${strategyId}`);
		}
		seenStrategyIds.add(strategyId);
		const recipe = serviceRecipes.get(strategyId);
		if (!recipe) throw new Error(`Unknown service recipe: ${strategyId}`);
		if (!Array.isArray(recipe.inputs) || recipe.inputs.length === 0) {
			throw new Error(`Service recipe ${recipe.id} must have at least one input.`);
		}
		assertNonNegative(recipe.providerElyCostEly, `Provider Ely cost for ${recipe.id}`);
		assertNonNegative(
			recipe.customerSuppliedSealLocks,
			`Customer-supplied Seal Locks for ${recipe.id}`
		);
		if (typeof recipe.customerSuppliedEquipment !== 'boolean') {
			throw new TypeError(`customerSuppliedEquipment for ${recipe.id} must be boolean.`);
		}

		const seenInputIds = new Set();
		const inputStates = recipe.inputs.map((recipeInput) => {
			if (seenInputIds.has(recipeInput.itemId)) {
				throw new Error(`Duplicate input ${recipeInput.itemId} in service recipe ${recipe.id}.`);
			}
			seenInputIds.add(recipeInput.itemId);
			const item = rewardItems.get(recipeInput.itemId);
			if (!item) throw new Error(`Unknown service recipe input: ${recipeInput.itemId}`);
			assertPositive(recipeInput.quantity, `Service input quantity for ${recipe.id} ${item.id}`);
			return {
				item,
				quantityPerService: recipeInput.quantity,
				availableBeforePerClear: inventory.has(item.id) ? inventory.get(item.id) ?? null : 0
			};
		});
		const allocationUnknown = inputStates.some(
			(inputState) => inputState.availableBeforePerClear === null
		);
		const servicesPerClear = allocationUnknown
			? null
			: safeResult(
					Math.min(
						...inputStates.map(
							(inputState) =>
								/** @type {number} */ (inputState.availableBeforePerClear) /
								inputState.quantityPerService
						)
					),
					`Services per clear for ${recipe.id}`
				);

		/** @type {string[]} */
		const strategyMissingMechanics = [];
		const inputs = inputStates.map((inputState) => {
			if (servicesPerClear === null) {
				strategyMissingMechanics.push(`strategy-allocation:${recipe.id}:${inputState.item.id}`);
				inventory.set(inputState.item.id, null);
				return {
					itemId: inputState.item.id,
					name: inputState.item.name,
					quantityPerService: inputState.quantityPerService,
					availableBeforePerClear: inputState.availableBeforePerClear,
					consumedPerClear: null,
					remainingAfterPerClear: null
				};
			}
			const consumedPerClear = safeResult(
				servicesPerClear * inputState.quantityPerService,
				`Consumed input per clear for ${recipe.id} ${inputState.item.id}`
			);
			const remainingAfterPerClear = Math.max(
				0,
				safeResult(
					/** @type {number} */ (inputState.availableBeforePerClear) - consumedPerClear,
					`Remaining input per clear for ${recipe.id} ${inputState.item.id}`
				)
			);
			inventory.set(inputState.item.id, remainingAfterPerClear);
			return {
				itemId: inputState.item.id,
				name: inputState.item.name,
				quantityPerService: inputState.quantityPerService,
				availableBeforePerClear: inputState.availableBeforePerClear,
				consumedPerClear,
				remainingAfterPerClear
			};
		});

		const servicePrice = resolvePrice(
			recipe.customerPriceItemId,
			'service',
			snapshotPrices,
			priceOverrides
		);
		/** @type {string[]} */
		const strategyMissingPrices = [];
		const priceIsRelevant = servicesPerClear === null || servicesPerClear > 0;
		if (priceIsRelevant && servicePrice.unitPriceEly === null) {
			strategyMissingPrices.push(recipe.customerPriceItemId);
			missingIncomePriceIds.push(recipe.customerPriceItemId);
		}
		if (priceIsRelevant && servicePrice.overrideId) usedOverrideIds.add(servicePrice.overrideId);
		const grossPerClearEly =
			servicesPerClear === 0
				? 0
				: servicesPerClear === null || servicePrice.unitPriceEly === null
					? null
					: safeResult(
							servicesPerClear * servicePrice.unitPriceEly,
							`Service gross per clear for ${recipe.id}`
						);
		const providerCostPerClearEly =
			servicesPerClear === null
				? null
				: safeResult(
						servicesPerClear * recipe.providerElyCostEly,
						`Provider cost per clear for ${recipe.id}`
					);
		const netPerClearEly =
			grossPerClearEly === null || providerCostPerClearEly === null
				? null
				: safeResult(
						grossPerClearEly - providerCostPerClearEly,
						`Service net per clear for ${recipe.id}`
					);
		const netPerHourEly =
			netPerClearEly === null
				? null
				: safeResult(netPerClearEly * clearsPerHour, `Service net per hour for ${recipe.id}`);

		serviceStrategyRows.push({
			strategyId: recipe.id,
			name: recipe.name,
			status: recipe.status,
			note: recipe.note,
			sourceIds: recipe.sourceIds,
			inputs,
			servicesPerClear,
			customerPriceItemId: recipe.customerPriceItemId,
			customerPricePerServiceEly: servicePrice.unitPriceEly,
			priceSource: servicePrice.priceSource,
			providerElyCostPerServiceEly: recipe.providerElyCostEly,
			customerSuppliedSealLocks: recipe.customerSuppliedSealLocks,
			customerSuppliedEquipment: recipe.customerSuppliedEquipment,
			grossPerClearEly,
			providerCostPerClearEly,
			netPerClearEly,
			netPerHourEly,
			missingMechanicIds: strategyMissingMechanics,
			missingPriceIds: strategyMissingPrices
		});
		missingMechanicIds.push(...strategyMissingMechanics);
	}

	/** @type {DungeonEarningsRewardRow[]} */
	const rewardRows = [];
	for (const { item, common: draftCommon } of rewardDrafts.values()) {
		const remainingAfterServicesPerClear = inventory.get(item.id) ?? null;
		const allocatedToServicesPerClear =
			draftCommon.effectiveExpectedPerClear === null || remainingAfterServicesPerClear === null
				? null
				: safeResult(
						draftCommon.effectiveExpectedPerClear - remainingAfterServicesPerClear,
						`Allocated reward per clear for ${item.id}`
					);
		const common = {
			...draftCommon,
			allocatedToServicesPerClear,
			remainingAfterServicesPerClear
		};

		if (item.route === 'pending') {
			rewardRows.push({ ...common, route: 'pending' });
			continue;
		}
		if (item.route === 'service') {
			rewardRows.push({ ...common, route: 'service' });
			continue;
		}
		if (item.route !== 'market') throw new Error(`Unknown reward route for ${item.id}: ${item.route}`);

		const conversionCostPerUnitEly = item.marketConversionCostPerUnitEly ?? 0;
		assertNonNegative(
			conversionCostPerUnitEly,
			`Market conversion cost per unit for ${item.id}`
		);
		const priceItemId = item.marketPriceItemId ?? item.id;
		const price = resolvePrice(priceItemId, 'market', snapshotPrices, priceOverrides);
		const priceIsRelevant =
			draftCommon.effectiveExpectedPerClear === null || draftCommon.effectiveExpectedPerClear > 0;
		if (priceIsRelevant && price.unitPriceEly === null) {
			common.missingPriceIds.push(priceItemId);
			missingIncomePriceIds.push(priceItemId);
		}
		if (priceIsRelevant && price.overrideId) usedOverrideIds.add(price.overrideId);
		const direct = calculateMarketValues(
			draftCommon.effectiveExpectedPerClear,
			price.unitPriceEly,
			conversionCostPerUnitEly,
			`Direct market ${item.id}`
		);
		const serviceFirst = calculateMarketValues(
			remainingAfterServicesPerClear,
			price.unitPriceEly,
			conversionCostPerUnitEly,
			`Service-first market ${item.id}`
		);
		rewardRows.push({
			...common,
			route: 'market',
			priceItemId,
			unitPriceEly: price.unitPriceEly,
			priceSource: price.priceSource,
			conversionCostPerUnitEly,
			grossPerClearEly: direct.grossEly,
			marketFeePerClearEly: direct.feeEly,
			conversionCostPerClearEly: direct.conversionCostEly,
			netPerClearEly: direct.netEly,
			netPerHourEly:
				direct.netEly === null
					? null
					: safeResult(direct.netEly * clearsPerHour, `Direct market net per hour for ${item.id}`),
			serviceFirstGrossPerClearEly: serviceFirst.grossEly,
			serviceFirstMarketFeePerClearEly: serviceFirst.feeEly,
			serviceFirstConversionCostPerClearEly: serviceFirst.conversionCostEly,
			serviceFirstNetPerClearEly: serviceFirst.netEly,
			serviceFirstNetPerHourEly:
				serviceFirst.netEly === null
					? null
					: safeResult(
							serviceFirst.netEly * clearsPerHour,
							`Service-first market net per hour for ${item.id}`
						)
		});
	}

	/** @type {string[]} */
	const missingBuffPriceIds = [];
	const buffRows = selectedBuffs.map((buff) => {
		assertPositive(buff.durationSeconds, `Buff duration for ${buff.id}`);
		assertPositive(buff.consumablesPerActivation, `Buff consumables per activation for ${buff.id}`);
		const priceMode = buff.priceMode ?? 'snapshot';
		const priceEditable = buff.priceEditable ?? true;
		let directUnitPriceEly = null;
		/** @type {import('$lib/types').DungeonEarningsPriceSource} */
		let directPriceSource = null;
		let alternativeUnitPriceEly = null;
		/** @type {number | null} */
		let alternativeCostEly = null;
		/** @type {import('$lib/types').DungeonEarningsPriceSource} */
		let alternativePriceSource = null;
		/** @type {'direct' | 'alternative' | null} */
		let chosenPricePath = null;
		let unitPriceEly = null;
		/** @type {import('$lib/types').DungeonEarningsPriceSource} */
		let priceSource = null;

		if (priceMode === 'fixed-zero') {
			if (priceEditable) throw new Error(`Fixed-zero buff ${buff.id} cannot be price editable.`);
			directUnitPriceEly = 0;
			directPriceSource = 'fixed';
			chosenPricePath = 'direct';
			unitPriceEly = 0;
			priceSource = 'fixed';
		} else if (priceMode === 'snapshot') {
			if (!buff.priceItemId) throw new Error(`Snapshot-priced buff ${buff.id} needs a priceItemId.`);
			const directPrice = resolvePrice(
				buff.priceItemId,
				'buff',
				snapshotPrices,
				priceOverrides,
				priceEditable
			);
			directUnitPriceEly = directPrice.unitPriceEly;
			directPriceSource = directPrice.priceSource;

			let alternativePrice = null;
			if (buff.alternativePrice) {
				assertPositive(
					buff.alternativePrice.quantity,
					`Alternative price quantity for ${buff.id}`
				);
				alternativePrice = resolvePrice(
					buff.alternativePrice.priceItemId,
					'buff',
					snapshotPrices,
					priceOverrides,
					priceEditable
				);
				alternativeUnitPriceEly = alternativePrice.unitPriceEly;
				alternativePriceSource = alternativePrice.priceSource;
				alternativeCostEly =
					alternativeUnitPriceEly === null
						? null
						: safeResult(
								alternativeUnitPriceEly * buff.alternativePrice.quantity,
								`Alternative activation cost for ${buff.id}`
							);
			}

			if (
				directUnitPriceEly !== null &&
				(alternativeCostEly === null || directUnitPriceEly <= alternativeCostEly)
			) {
				chosenPricePath = 'direct';
				unitPriceEly = directUnitPriceEly;
				priceSource = directPriceSource;
				if (directPrice.overrideId) usedOverrideIds.add(directPrice.overrideId);
			} else if (alternativeCostEly !== null && alternativePrice) {
				chosenPricePath = 'alternative';
				unitPriceEly = alternativeCostEly;
				priceSource = 'derived';
				if (alternativePrice.overrideId) usedOverrideIds.add(alternativePrice.overrideId);
			} else {
				missingBuffPriceIds.push(buff.priceItemId);
				if (buff.alternativePrice) missingBuffPriceIds.push(buff.alternativePrice.priceItemId);
			}
		} else {
			throw new Error(`Unknown price mode for buff ${buff.id}: ${priceMode}`);
		}

		const costPerHourEly =
			unitPriceEly === null
				? null
				: safeResult(
						unitPriceEly *
							buff.consumablesPerActivation *
							(3600 / buff.durationSeconds),
						`Buff cost per hour for ${buff.id}`
					);
		return {
			buffId: buff.id,
			name: buff.name,
			description: buff.description,
			icon: buff.icon,
			durationSeconds: buff.durationSeconds,
			consumablesPerActivation: buff.consumablesPerActivation,
			priceMode,
			priceEditable,
			priceItemId: buff.priceItemId,
			unitPriceEly,
			priceSource,
			directUnitPriceEly,
			directPriceSource,
			alternativePriceItemId: buff.alternativePrice?.priceItemId ?? null,
			alternativePriceQuantity: buff.alternativePrice?.quantity ?? null,
			alternativeUnitPriceEly,
			alternativeCostEly,
			alternativePriceSource,
			chosenPricePath,
			costPerHourEly
		};
	});

	const marketRows = rewardRows.filter(
		/** @returns {row is import('$lib/types').DungeonEarningsMarketRewardRow} */
		(row) => row.route === 'market'
	);
	const perClear = {
		marketGrossEly: sumKnownValues(
			marketRows.map((row) => row.grossPerClearEly),
			'Direct market gross per clear total'
		),
		marketFeeEly: sumKnownValues(
			marketRows.map((row) => row.marketFeePerClearEly),
			'Direct market fee per clear total'
		),
		marketConversionCostEly: sumKnownValues(
			marketRows.map((row) => row.conversionCostPerClearEly),
			'Direct market conversion cost per clear total'
		),
		marketNetEly: sumKnownValues(
			marketRows.map((row) => row.netPerClearEly),
			'Direct market net per clear total'
		),
		serviceFirstMarketGrossEly: sumKnownValues(
			marketRows.map((row) => row.serviceFirstGrossPerClearEly),
			'Service-first market gross per clear total'
		),
		serviceFirstMarketFeeEly: sumKnownValues(
			marketRows.map((row) => row.serviceFirstMarketFeePerClearEly),
			'Service-first market fee per clear total'
		),
		serviceFirstMarketConversionCostEly: sumKnownValues(
			marketRows.map((row) => row.serviceFirstConversionCostPerClearEly),
			'Service-first market conversion cost per clear total'
		),
		serviceFirstMarketNetEly: sumKnownValues(
			marketRows.map((row) => row.serviceFirstNetPerClearEly),
			'Service-first market net per clear total'
		),
		serviceGrossEly: sumKnownValues(
			serviceStrategyRows.map((row) => row.grossPerClearEly),
			'Service gross per clear total'
		),
		serviceProviderCostEly: sumKnownValues(
			serviceStrategyRows.map((row) => row.providerCostPerClearEly),
			'Service provider cost per clear total'
		),
		serviceTransferCostEly: 0,
		serviceRawNetEly: sumKnownValues(
			serviceStrategyRows.map((row) => row.netPerClearEly),
			'Service net per clear total'
		),
		serviceCountedNetEly: 0,
		totalGrossEly: 0,
		totalRewardProceedsEly: 0
	};
	// Compatibility aliases now reflect provider-paid Ely only. Customer-supplied
	// locks and equipment are disclosed but never deducted from provider profit.
	perClear.serviceTransferCostEly = perClear.serviceProviderCostEly;
	perClear.serviceCountedNetEly = perClear.serviceRawNetEly;
	perClear.totalGrossEly = safeResult(
		perClear.serviceFirstMarketGrossEly + perClear.serviceGrossEly,
		'Service-first total gross per clear'
	);
	perClear.totalRewardProceedsEly = safeResult(
		perClear.serviceFirstMarketNetEly + perClear.serviceRawNetEly,
		'Service-first reward proceeds per clear'
	);

	const knownBuffCostEly = sumKnownValues(
		buffRows.map((row) => row.costPerHourEly),
		'Known buff cost per hour total'
	);
	const uniqueMissingBuffPrices = uniqueStrings(missingBuffPriceIds);
	const buffsBlocked = uniqueMissingBuffPrices.length > 0;
	const buffCostEly = buffsBlocked ? null : knownBuffCostEly;
	/** @param {number} value @param {string} label */
	const multiplyPerHour = (value, label) => safeResult(value * clearsPerHour, label);
	const marketGrossPerHour = multiplyPerHour(perClear.marketGrossEly, 'Direct market gross per hour');
	const marketFeePerHour = multiplyPerHour(perClear.marketFeeEly, 'Direct market fee per hour');
	const marketConversionCostPerHour = multiplyPerHour(
		perClear.marketConversionCostEly,
		'Direct market conversion cost per hour'
	);
	const marketNetBeforeBuffsEly = multiplyPerHour(
		perClear.marketNetEly,
		'Direct market net per hour'
	);
	const serviceFirstMarketGrossPerHour = multiplyPerHour(
		perClear.serviceFirstMarketGrossEly,
		'Service-first market gross per hour'
	);
	const serviceFirstMarketFeePerHour = multiplyPerHour(
		perClear.serviceFirstMarketFeeEly,
		'Service-first market fee per hour'
	);
	const serviceFirstMarketConversionCostPerHour = multiplyPerHour(
		perClear.serviceFirstMarketConversionCostEly,
		'Service-first market conversion cost per hour'
	);
	const serviceFirstMarketNetBeforeBuffsEly = multiplyPerHour(
		perClear.serviceFirstMarketNetEly,
		'Service-first market net per hour'
	);
	const serviceGrossPerHour = multiplyPerHour(perClear.serviceGrossEly, 'Service gross per hour');
	const serviceProviderCostPerHour = multiplyPerHour(
		perClear.serviceProviderCostEly,
		'Service provider cost per hour'
	);
	const serviceRawNetPerHour = multiplyPerHour(
		perClear.serviceRawNetEly,
		'Service net per hour'
	);
	const rewardProceedsBeforeBuffsEly = safeResult(
		serviceFirstMarketNetBeforeBuffsEly + serviceRawNetPerHour,
		'Service-first reward proceeds before buffs per hour'
	);
	const perHour = {
		marketGrossEly: marketGrossPerHour,
		marketFeeEly: marketFeePerHour,
		marketConversionCostEly: marketConversionCostPerHour,
		marketNetBeforeBuffsEly,
		serviceFirstMarketGrossEly: serviceFirstMarketGrossPerHour,
		serviceFirstMarketFeeEly: serviceFirstMarketFeePerHour,
		serviceFirstMarketConversionCostEly: serviceFirstMarketConversionCostPerHour,
		serviceFirstMarketNetBeforeBuffsEly,
		serviceGrossEly: serviceGrossPerHour,
		serviceProviderCostEly: serviceProviderCostPerHour,
		serviceTransferCostEly: serviceProviderCostPerHour,
		serviceRawNetEly: serviceRawNetPerHour,
		serviceCountedNetEly: serviceRawNetPerHour,
		totalGrossEly: safeResult(
			serviceFirstMarketGrossPerHour + serviceGrossPerHour,
			'Service-first total gross per hour'
		),
		rewardProceedsBeforeBuffsEly,
		buffCostEly,
		directNetEly:
			buffCostEly === null
				? null
				: safeResult(marketNetBeforeBuffsEly - buffCostEly, 'Direct net per hour'),
		potentialServiceContributionEly: serviceRawNetPerHour,
		potentialNetEly:
			buffCostEly === null
				? null
				: safeResult(rewardProceedsBeforeBuffsEly - buffCostEly, 'Potential net per hour')
	};

	const uniqueMissingMechanics = uniqueStrings(missingMechanicIds);
	const uniqueMissingIncomePrices = uniqueStrings(missingIncomePriceIds);
	const isLowerBound =
		uniqueMissingMechanics.length > 0 || uniqueMissingIncomePrices.length > 0;

	return {
		dungeonId,
		difficulty,
		clearTimeSeconds,
		clearsPerHour,
		estimateState: buffsBlocked ? 'blocked' : isLowerBound ? 'lower-bound' : 'complete',
		isLowerBound,
		rewardRows,
		serviceStrategyRows,
		buffRows,
		perClear,
		perHour,
		missingMechanicIds: uniqueMissingMechanics,
		missingIncomePriceIds: uniqueMissingIncomePrices,
		missingBuffPriceIds: uniqueMissingBuffPrices,
		missingPriceIds: uniqueStrings([
			...uniqueMissingIncomePrices,
			...uniqueMissingBuffPrices
		]),
		overriddenPriceIds: [...usedOverrideIds]
	};
}

export const calculateDungeonEstimate = calculateDungeonEarnings;
