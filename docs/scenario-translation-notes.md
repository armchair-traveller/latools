# Scenario translation notes

The English walkthrough is a new community translation of the original Korean snapshot. It does not reuse the deleted dialogue reader's translations. `static/data/scenario/en.json` records the source checksum and translation date; its exact Korean keys remain the reference for each translated string.

## Naming references

The Global publisher's pages establish these recurring English names:

| Korean | English | Publisher reference |
| --- | --- | --- |
| 글래스턴, 빈민가 라슈에트, 결핍의 경계 | Glaston, LaChouette Slums, Boundary of the Void | [Stella update](https://latale.papayaplay.com/latale.do?tp=update_stella) |
| 샤이닉, 타르타로스, 레이어, 멜빅, 루인, 란다인 | Shynic, Tartaros, Layer, Melvic, Ruin, Randine | [Tartaros update](https://latale.papayaplay.com/latale.do?tp=update191211) |
| 발드릭, 지스카드, 아드키나, 메디아 | Valdrick, Ziskad, Atkina, Medea | [Game overview](https://latale.papayaplay.com/latale.do?tp=about) |
| 아이에 섬, 심연의 거울, 에우가몬 극장, 리코타 | Aie Island, Chaotic Mirror, Theater Eugamon, Licota | [Aie update](https://latale.papayaplay.com/latale.do?tp=update_aie) |
| 빌브라트, 이리스의 악몽 | Bilbradha, Iris' Nightmare | [December 2018 update](https://latale.papayaplay.com/latale.do?tp=update181219) |
| 기아스, 폭주한 이리스, 냉소짓는 이리스, 이블 오더 | Geis, Evil Iris, Cynical Iris, Evil Order | [Illusory World update](https://latale.papayaplay.com/latale.do?tp=update190626_pt1) |
| 지스크 영지 | Zisk Plains | [Zisk Plains update](https://latale.papayaplay.com/latale.do?tp=update_zisk_plains) |
| 데이나, 라클렛, 녹스 왕자, 마력 방공호 | Dayna, Raclette, Prince Nox, Magical Fallout Shelter | [Shadow Walker update](https://latale.papayaplay.com/latale.do?tp=update_shadow_walker) |
| 케이스, 메린 섬, 닥터 SD | Keise, Marin Island, KHW-8011 | [Treasure Beach update](https://latale.papayaplay.com/latale.do?tp=update180220) |
| 검신, 초인 | Sword Master, Champions | [Game overview](https://latale.papayaplay.com/latale.do?tp=about) |
| 제거 | Jager | [Publisher wiki: Arc Master](https://wiki.papayaplay.com/latale/doku.php?id=classes%3Aarc_master) |

Names without a verified Global equivalent use a consistent translation or transliteration. This catalog is not an official localization. The original Korean view remains available, and search accepts both languages.

Context matters for Korean homonyms: `피라미드 현실` refers to a burial chamber, and `피쿠스의 재봉 실패` is a spool of thread. The English view also normalizes the source's `페르난디드` typo to Ferdinand and removes stray instruction text from two destination labels. The Korean snapshot retains all source wording.

## Translation rules

- Quest objectives use direct instructions, preserving actions, locations, order, prerequisite conditions, quantities, and exceptions.
- All text fields are covered, including expandable item descriptions and acquisition hints. Nothing is translated at runtime by an external service.
- Preserve intentional masked characters such as `▒`, instead of revealing hidden names.
- Preserve item quantities and source IDs separately from prose. A zero quantity remains unspecified in the display.
- Keep bracketed prerequisite titles consistent with the corresponding translated scenario names.
- Preserve player-name tokens, percentages, durations, and numbered steps. Literal escaped newlines are decoded only for display.
- Keep the original Korean snapshot intact. A new or changed source string must receive its own translation before a source refresh can be published.
