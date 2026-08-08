# Dungeon earnings maintenance

The `/dungeon-earnings` estimator reads checked-in mechanics and dated economy observations. It never scrapes community guides at runtime.

## Public files

- `static/data/dungeon-earnings/catalog.json` contains dungeon rewards, service recipes and priority, market-conversion costs, and the combat-buff whitelist.
- `static/data/dungeon-earnings/index.json` points to the current immutable economy snapshot.
- `static/data/dungeon-earnings/snapshots/<snapshot-id>.json` contains gross auction observations, customer service prices, and per-activation buff prices.
- `static/images/dungeon-earnings/` contains local assets. The page must never hotlink game icons.

Raw screenshots and calculation evidence belong under `.cache/dungeon-earnings/<date>/`, which is intentionally ignored by Git.

## Maintained reward model

All material expectations assume capped item-drop rate. Item-drop rate is not calculated: players are assumed to reach cap with or without the selected buffs.

Each dungeon drops two separately named main materials. An equipment base decomposes into one of each material.

| Profile | Expected yield of each material | Composition |
| --- | ---: | --- |
| Any D4 | 118 | midpoint of 110–120, plus three decomposed bases |
| Pleroma/Emeraldia D5 | 121 | midpoint of 110–120, plus six decomposed bases |
| Icarus/Rikimo D5 | 127.5 | the normal 121, one bonus base, and half of a random 7–15 bag's 11-material expectation |

The Icarus/Rikimo D5 total is 255 materials. It already contains the bonus bag and base (about 5.37% above the normal combined 242), so every checked-in reward row uses `d5BonusEligible: false`. Do not apply `d5MaterialBonusRate` again.

Every D5 additionally yields three immediately tradable, dungeon-specific Advanced Equipment Coupons and 21 dungeon-specific Ascension Stones. D4 has neither.

## Service recipes and strategy

A service recipe contains:

- `inputs`: all dungeon reward items consumed per customer transaction;
- `providerElyCostEly`: Ely paid by the service provider during the upgrade;
- `customerPriceItemId`: the service price key in the economy snapshot;
- `customerSuppliedSealLocks` and `customerSuppliedEquipment`: buyer obligations, never provider deductions;
- `status`: `confirmed` or `provisional`;
- `sourceIds` and `note`: provenance and known caveats.

Profiles list `serviceStrategyIds` in allocation priority. Pleroma and Emeraldia allocate their limited D5 stones to 6→7 before 0→6, and Icarus/Rikimo use 6→7. A recipe may consume a market-routed reward; route controls the leftover valuation, not recipe eligibility.

Pleroma uses the Global, pre-nerf values from [LaTale Gear Toolkit](https://ltgear.vercel.app/upgrade), not the current Korean values on Ramu Wiki:

- 0→6: 3,839 of each main material and 600m provider Ely;
- 6→7 (shown by the source as Ascended +0→+1): 999 of each main material, 999 Demiurge Ascension Stones, and 2b provider Ely.

The Global source supplies the material count, stone count, and Ely fee. Maintainer confirmation establishes that Torn Wing and Horn are both required simultaneously at that material count.

Emeraldia and the Icarus/Rikimo 6→7 inputs and provider costs remain sourced from Ramu Wiki. The Icarus/Rikimo 20b/30b customer prices are provisional. Provisional recipes produce validator warnings and do not block release.

Customers separately supply estimated Seal Locks: 40 for +6 and 50 for +7. The maintained 60m-per-lock observation is informational only. Do not add Seal Locks to provider costs or expose that value as an editable calculator price.

## Auction pricing

Snapshot market prices are gross listings. The engine deducts `market.feeRate` exactly once.

Pleroma/Emeraldia main materials are not directly auctionable and are service inputs only. Icarus/Rikimo materials can be converted in lots of 2,000 into a universal coupon for 100m Ely. Both types from a dungeon therefore share one `marketPriceItemId`, preventing contradictory user prices for interchangeable coupon output. Their reward definitions store `marketConversionCostPerUnitEly: 50000`, while the snapshot stores gross coupon price divided by 2,000:

- Icarus: 5b / 2,000 = 2.5m gross per material; net is 2.425m after the 1% fee and 50k conversion.
- Rikimo: 12b / 2,000 = 6m gross per material; net is 5.89m after the 1% fee and 50k conversion.

Do not pre-deduct either fee when refreshing a snapshot.

## Buff whitelist and pricing

Guild food is excluded. Combat and Utility Elixirs are represented by one `Flasks` activation at their combined fixed cost. Hero's Attack Nostrums I and II are represented by the combined `Hero's Set`, with Attack Nostrum II also available by itself; the defense Nostrum is excluded. Only the Mysterious Critical Damage Amplifier is maintained because the alternatives have the same modeled cost and are not meaningful to the earnings comparison.

Six buffs are the non-optional baseline and use `essential: true`: Flasks, Critical Oil, Sweet Mutant Special Potion, Alvis Support Potion, Hunter HP Recovery Kit 30%, and Mysterious Critical Damage Amplifier. The calculation engine appends these even when callers provide no buff IDs. UI persistence therefore stores optional selections only. Optional high-cost choices are displayed before the condensed essential baseline.

`priceMode: "fixed-zero"` is reserved for Sweet Mutant Special Potion, which is not purchasable and has `priceItemId: null`. Snapshot-priced buffs use `priceMode: "snapshot"`. `priceEditable: false` is used for fixed-source prices (Flasks, Alvis, Hunter Kit, and the Mysterious Critical Damage Amplifier); market-priced buffs remain editable.

Premium Syrup lasts two hours and Advanced Premium Syrup lasts one. Advanced Premium uses the lower of its direct snapshot price or `2 × premium-syrup` through `alternativePrice`. Premium Syrup has no current in-game source and survives only as legacy hoarded stock, so Advanced Premium remains the standard preset even when Premium is cheaper per hour.

Only real calculator choices receive an `exclusivityGroup`: `syrup` and `heroes-attack`. At most one standard-preset buff may belong to each group. Essential buffs must be standard, non-exclusive, and always included; fixed-cost essentials cannot publish with a pending snapshot price.

## Refreshing an economy snapshot

1. Preserve evidence under `.cache/dungeon-earnings/<date>/prices/`.
2. Copy the current snapshot to a new dated ID; do not rewrite a published historical snapshot.
3. Enter one gross `unitEly` observation per market item, complete service transaction, or buff activation.
4. Use `status: "pending"`, `unitEly: null`, and `asOf: null` rather than inventing a missing price.
5. Add the new snapshot to `index.json` and update `currentSnapshotId`.
6. Run both validators and review the assumptions UI. Existing local overrides remain user-owned.

Pending prices are allowed and produce warnings except for non-editable essential buffs, which must remain priced. Pending reward mechanics fail release validation. Provisional service assumptions warn but do not block release.

## Sources and local assets

Dungeon overviews and banners come from [LaTale Info](https://latale.info/67). Upgrade recipes and buff details come from [Ramu Wiki](https://latale.wiki/buff-items?tab=combat). Both are unofficial community resources; LaTale names and game assets belong to their respective rights holders.

New local buff icons copied on 2026-08-07:

- Advanced Premium Syrup: `https://latale.wiki/icons/items/170196680.png`
- Premium Syrup: `https://latale.wiki/icons/items/170195643.png`
- Shining Storm Potion (60 min): `https://latale.wiki/icons/items/170196890.png`
- Hero's Set representative (Hero's Attack Nostrum I): `https://latale.wiki/icons/royal-simulator/6479b041babe3e47.png`
- Hero's Attack Nostrum II: `https://latale.wiki/icons/royal-simulator/dd449845fa4cc0ba.png`

Flasks use the locally stored Combat Elixir icon. Existing local icons retain their source mappings from the original catalog research.

## Validation

Run:

```sh
npm run check:dungeon-earnings
npm run check:dungeon-earnings:release
```

The normal validator rejects schema drift, unknown references, missing assets, invalid yields, accidental double application of the D5 bonus, incomplete snapshot coverage, and conflicting presets. Release mode additionally rejects pending yields and pending D5 decisions; pending prices and explicitly provisional services remain non-blocking warnings.
