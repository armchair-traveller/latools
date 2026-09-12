# Scenario script English translation

The dialogue reader uses fresh English translations made directly from the current Korean snapshot. It does not reuse the deleted reader's English dialogue. The existing English scenario walkthrough supplies matching story titles, step titles, objectives, and shared names; metadata matching ignores only whitespace and escaped-newline differences.

Every story has an exact-source-string catalog in `static/data/scenario-script/translations/{id}.json`. A catalog records its Korean story checksum, translation date, and Korean-to-English strings. Punctuation and text already written without Korean can remain unchanged. Identical Korean text can share one translation within a story, but context should be considered before reusing dialogue across stories.

Keep dialogue natural while preserving meaning, tone, relationship between speakers, masked names, the `%s` and `%S` player-name tokens, and every branch choice. Speaker labels keep the original Korean key separately from the English display name. Narration remains narration. The source's IDs, scene order, branch targets, and nested line arrays must remain unchanged, including deliberately reused IDs.

Names shared with the walkthrough follow its [naming references](scenario-translation-notes.md). Other names use a consistent translation or transliteration in `static/data/scenario-script/speakers.json`; they should not be presented as verified official Global names. This is a community translation, not an official localization.

Run `node scripts/scenario-script-translations.mjs` to assemble every completed catalog into the reader's English story files and regenerate the English index. Partial catalogs remain work in progress and are never assembled as English stories. The index explicitly records completed story IDs and whether the entire archive is translated.

Run `node scripts/check-scenario-script-translations.mjs` before release. It checks the current source checksum, full metadata and tree structure, every fresh translation, speaker labels, and player tokens, and fails if any story is incomplete. During translation work, `--allow-partial` audits the completed stories while reporting the number still missing; it is not a release check.
