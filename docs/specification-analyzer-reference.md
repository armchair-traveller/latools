# Specification Analyzer reference

The analyzer at `/spec-analyzer` was rebuilt on 2026-10-03 using these external references:

1. [LaMu Wiki Specification Analyzer](https://latale.wiki/tools/spec-analyzer), the primary reference for appearance, behavior, sample values, current skill catalog, and calculations.
2. [English workbook, v3.4.1](https://docs.google.com/spreadsheets/d/1ytrf0W-j_FUBsj071Fbuhz6Tx7Qv2EdsoZEmxyvlwaM), supporting terminology and formula reference.
3. [Korean workbook, v3.4.1](https://docs.google.com/spreadsheets/d/19LMNB8_6JddY-srP4BB2Grxc52KodG75oebjMtK-taM), supporting cross-check for HP formulas and dungeon constants.

The previous project analyzer was not used as a source. New logic lives in `src/lib/spec-engine/`; new UI components live in `src/lib/components/spec-rebuild/`. The route retains the application's shared navigation.

## Reference precedence

The wiki's behavior takes precedence when spreadsheets differ. The spreadsheet coefficient tables identify historical balance dates; the English translation also contains stale lookup names. They should not silently override the wiki catalog.

The reference distinguishes direct hits and placed summons, physical and magical damage, normal monsters and bosses. Phantom Mage calculates physical and magical sides separately before combining them. Damage calculations preserve the reference's intermediate float32 arithmetic, truncation, critical resistance, defense, damage reduction, random damage bounds, and averaging behavior. The setup's displayed raw and percent values are kept separately so option replacement can remove old values and add new ones before recomputation.

Summon coefficients are estimates from measurements. The wiki exposes a total summon multiplier but its current exact damage calculation does not apply it. This quirk is intentionally retained for parity, rather than substituting the older workbook formula.

## UI and portability

The six wiki tabs are presented in English: base settings, damage efficiency, enchant comparison, setting efficiency, skill coefficients, and actual damage. Common settings apply across tabs. Blue status panels use game UI sprite assets obtained from the wiki's public equipment UI endpoints; labels and accessible inputs are rendered locally.

The wiki's account-bound saves and packet collector cannot be shared across sites. This version saves up to ten named setups in this browser, restores the current draft and tab after reload, and imports/exports portable JSON. Collected character JSON uses the wiki's public raw stat ID/detail field mapping, including separate physical and magical values for hybrid classes. Missing collected values are zero, and the summon bonus is cleared to avoid double counting. The original private collection service and OCR endpoint are not called. Reports can be downloaded as PNG or PDF.

Workbook-backed English labels are used where a verified translation is available; newer unmatched skill names retain the wiki's Korean name.

## Validation

Tests use both precise calculation fixtures and values independently observed in the wiki's rendered analyzer. Supporting workbook checks cover the HP inverse formula, core scaling, dungeon constants, and skill coefficient arithmetic. Browser checks exercise tab navigation, editable values, class changes, responsive layout, setup import/export, and report generation.

When updating this analyzer, refresh the external reference and regression fixtures together. Preserve a clear distinction between wiki parity and deliberate behavior changes.
