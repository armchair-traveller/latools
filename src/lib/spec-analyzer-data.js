// @ts-nocheck

/**
 * Authoritative Specification Analyzer data captured 2026-08-03.
 *
 * Live deployed assets (coefficients, IDs, job filtering, dungeon presets,
 * max-level summon bonuses, and defaults):
 * - https://latale.wiki/_next/static/chunks/2y0ng-_g5mkjt.js
 * - https://latale.wiki/_next/static/chunks/0fe76q8govmxu.js
 * - https://latale.wiki/_next/static/chunks/1oo_1qwocq80b.js
 * - https://latale.wiki/_next/static/chunks/33_ax5531q4ef.js
 *
 * English labels were row-aligned against the hidden coefficient tabs in the
 * matching 3.4.1 English/Korean workbooks ("Direct-Type Skill Coefficients" ↔
 * "직타스킬계수" and "Summon-Type Skill Coefficients" ↔ "설치기 계수"):
 * - https://docs.google.com/spreadsheets/d/1ytrf0W-j_FUBsj071Fbuhz6Tx7Qv2EdsoZEmxyvlwaM/edit
 * - https://docs.google.com/spreadsheets/d/19LMNB8_6JddY-srP4BB2Grxc52KodG75oebjMtK-taM/edit
 *
 * Important: coefficient numbers below always come from the current live JSON,
 * never from the older workbook coefficient cells (dated 2025-02-13 for direct
 * skills and 2025-01-22 for placement skills). The workbooks provide labels only:
 * they contain 324 direct and 46 placement rows, while the deployed payload has
 * the authoritative current 325/45 sets. The live-only Star Seeker skill DM-RS
 * keeps its source label unchanged.
 */

export const SPEC_ANALYZER_DATA_META = Object.freeze({
	"capturedAt": "2026-08-03",
	"livePage": "https://latale.wiki/tools/spec-analyzer",
	"liveAssets": {
		"skills": "https://latale.wiki/_next/static/chunks/2y0ng-_g5mkjt.js",
		"jobs": "https://latale.wiki/_next/static/chunks/0fe76q8govmxu.js",
		"dungeons": "https://latale.wiki/_next/static/chunks/1oo_1qwocq80b.js",
		"summonsAndDefaults": "https://latale.wiki/_next/static/chunks/33_ax5531q4ef.js"
	},
	"workbooks": {
		"english": "https://docs.google.com/spreadsheets/d/1ytrf0W-j_FUBsj071Fbuhz6Tx7Qv2EdsoZEmxyvlwaM/edit",
		"korean": "https://docs.google.com/spreadsheets/d/19LMNB8_6JddY-srP4BB2Grxc52KodG75oebjMtK-taM/edit"
	},
	"counts": {
		"jobs": 39,
		"directSkills": 325,
		"placementSkills": 45,
		"dungeons": 7,
		"summons": 9
	},
	"liveSkillMetadata": {
		"description": "스펙 계산기 스킬 계수",
		"directTotal": 325,
		"directGenerated": 318,
		"directFallback": 7,
		"directIdLinked": 324,
		"placementTotal": 45,
		"placementGenerated": 0,
		"placementFallback": 45,
		"placementIdLinked": 39
	},
	"liveDungeonMetadata": {
		"source": "기준 자료",
		"description": "배치된 전투 몬스터의 대표 방어 수치로 생성한 스펙 계산기 프리셋",
		"count": 7,
		"selectionPolicy": {
			"regularDungeons": "일반은 배치된 고유 전투 몬스터의 최빈 방어 수치 조합, 보스는 최종 보스를 나타내는 최대 피해감소 조합",
			"proofTower": "30층 이상 구간은 기존 계산 의미를 유지하기 위해 35층을 대표값으로 사용"
		}
	},
	"liveSummonGeneratedAt": "2026-07-23"
});

export const JOBS = Object.freeze([
	{
		"id": "agni",
		"name": "Agni",
		"sourceName": "아그니",
		"classId": 64
	},
	{
		"id": "all-classes",
		"name": "All Classes",
		"sourceName": "직업 공용",
		"classId": null
	},
	{
		"id": "arc-master",
		"name": "Arc Master",
		"sourceName": "아크마스터",
		"classId": 49
	},
	{
		"id": "archmage",
		"name": "Archmage",
		"sourceName": "아크메이지",
		"classId": 40
	},
	{
		"id": "black-anima-katana",
		"name": "Black Anima [Katana]",
		"sourceName": "흑영(도)",
		"classId": 56
	},
	{
		"id": "black-anima-lantern",
		"name": "Black Anima [Lantern]",
		"sourceName": "흑영(옥)",
		"classId": 56
	},
	{
		"id": "blade-master",
		"name": "Blade Master",
		"sourceName": "검호",
		"classId": 37
	},
	{
		"id": "dark-chaser",
		"name": "Dark Chaser",
		"sourceName": "다크체이서",
		"classId": 68
	},
	{
		"id": "demigod-divine",
		"name": "Demigod [Divine]",
		"sourceName": "데미갓(신성)",
		"classId": 60
	},
	{
		"id": "demigod-rage",
		"name": "Demigod [Rage]",
		"sourceName": "데미갓(분노)",
		"classId": 60
	},
	{
		"id": "der-freischutz",
		"name": "Der Freischütz",
		"sourceName": "프라이쉬츠",
		"classId": 43
	},
	{
		"id": "dokkaebi",
		"name": "Dokkaebi",
		"sourceName": "도깨비",
		"classId": 82
	},
	{
		"id": "force-master",
		"name": "Force Master",
		"sourceName": "포스마스터",
		"classId": 52
	},
	{
		"id": "gatekeeper",
		"name": "Gatekeeper",
		"sourceName": "게이트키퍼",
		"classId": 78
	},
	{
		"id": "hero-greatsword",
		"name": "Hero [Greatsword]",
		"sourceName": "히어로 (검)",
		"classId": 36
	},
	{
		"id": "hero-spear",
		"name": "Hero [Spear]",
		"sourceName": "히어로 (창)",
		"classId": 36
	},
	{
		"id": "highlander",
		"name": "Highlander",
		"sourceName": "하이랜더",
		"classId": 24
	},
	{
		"id": "jewel-star",
		"name": "Jewel Star",
		"sourceName": "쥬얼스타",
		"classId": 69
	},
	{
		"id": "judgment",
		"name": "Judgment",
		"sourceName": "저지먼트",
		"classId": 31
	},
	{
		"id": "maestro",
		"name": "Maestro",
		"sourceName": "마에스트로",
		"classId": 29
	},
	{
		"id": "phantom-mage",
		"name": "Phantom Mage",
		"sourceName": "팬텀메이지",
		"classId": 28
	},
	{
		"id": "pop-star",
		"name": "Pop Star",
		"sourceName": "파픈스타",
		"classId": 41
	},
	{
		"id": "psykicker",
		"name": "Psykicker",
		"sourceName": "사이키커",
		"classId": 27
	},
	{
		"id": "rainia",
		"name": "Rainia",
		"sourceName": "레이니아",
		"classId": 75
	},
	{
		"id": "rogue-master",
		"name": "Rogue Master",
		"sourceName": "로그마스터",
		"classId": 30
	},
	{
		"id": "savior-longsword",
		"name": "Savior [Longsword]",
		"sourceName": "세이버 (검)",
		"classId": 38
	},
	{
		"id": "savior-mace",
		"name": "Savior [Mace]",
		"sourceName": "세이버 (둔기)",
		"classId": 38
	},
	{
		"id": "sefirot",
		"name": "Sefirot",
		"sourceName": "세피로트",
		"classId": 39
	},
	{
		"id": "shadow-walker",
		"name": "Shadow Walker",
		"sourceName": "섀도우워커",
		"classId": 73
	},
	{
		"id": "soulless-one",
		"name": "Soulless One",
		"sourceName": "소울리스 원",
		"classId": 45
	},
	{
		"id": "star-seeker",
		"name": "Star Seeker",
		"sourceName": "스타시커",
		"classId": 32
	},
	{
		"id": "sword-dancer",
		"name": "Sword Dancer",
		"sourceName": "소드댄서",
		"classId": 25
	},
	{
		"id": "sword-saint",
		"name": "Sword Saint",
		"sourceName": "검성",
		"classId": 81
	},
	{
		"id": "swordian",
		"name": "Swordian",
		"sourceName": "소디언",
		"classId": 44
	},
	{
		"id": "terror-knight",
		"name": "Terror Knight",
		"sourceName": "테러나이트",
		"classId": 26
	},
	{
		"id": "wind-stalker-bow",
		"name": "Wind Stalker [Bow]",
		"sourceName": "윈드스토커 (활)",
		"classId": 42
	},
	{
		"id": "wind-stalker-crossbow",
		"name": "Wind Stalker [Crossbow]",
		"sourceName": "윈드스토커 (석궁)",
		"classId": 42
	},
	{
		"id": "wind-stalker-dagger",
		"name": "Wind Stalker [Dagger]",
		"sourceName": "윈드스토커 (단검)",
		"classId": 42
	},
	{
		"id": "windia",
		"name": "Windia",
		"sourceName": "윈디아",
		"classId": 74
	}
]);

export const DIRECT_SKILLS = Object.freeze([
	{
		"id": "direct-0001",
		"job": "Hero [Greatsword]",
		"sourceJob": "히어로 (검)",
		"name": "[Infinity] Dead End",
		"sourceName": "[인피니티] 데드·앤드",
		"skillId": 1802401,
		"skillIds": [
			1802401
		],
		"effectId": 21508502,
		"effectIds": [
			21508502
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1000,
		"perLevel": 500
	},
	{
		"id": "direct-0002",
		"job": "Hero [Greatsword]",
		"sourceJob": "히어로 (검)",
		"name": "Cross Crack",
		"sourceName": "크로스 크랙",
		"skillId": 1107005,
		"skillIds": [
			1107005
		],
		"effectId": 21505921,
		"effectIds": [
			21505921
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1500,
		"perLevel": 300
	},
	{
		"id": "direct-0003",
		"job": "Hero [Greatsword]",
		"sourceJob": "히어로 (검)",
		"name": "Wind Eclipse",
		"sourceName": "표풍일식",
		"skillId": 1107015,
		"skillIds": [
			1107015
		],
		"effectId": 21406721,
		"effectIds": [
			21406721
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7500,
		"perLevel": 1500
	},
	{
		"id": "direct-0004",
		"job": "Hero [Greatsword]",
		"sourceJob": "히어로 (검)",
		"name": "Gale Slash",
		"sourceName": "광풍참",
		"skillId": 1212005,
		"skillIds": [
			1212005
		],
		"effectId": 21520201,
		"effectIds": [
			21520201
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0005",
		"job": "Hero [Greatsword]",
		"sourceJob": "히어로 (검)",
		"name": "Ascending Slash",
		"sourceName": "승천격",
		"skillId": 1210005,
		"skillIds": [
			1210005
		],
		"effectId": 21520001,
		"effectIds": [
			21520001
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0006",
		"job": "Hero [Greatsword]",
		"sourceJob": "히어로 (검)",
		"name": "Meteor Wave",
		"sourceName": "미티어 웨이브",
		"skillId": 1105005,
		"skillIds": [
			1105005
		],
		"effectId": 21501322,
		"effectIds": [
			21501322
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0007",
		"job": "Hero [Greatsword]",
		"sourceJob": "히어로 (검)",
		"name": "Heavenly Chaos",
		"sourceName": "천패처황참",
		"skillId": 1109505,
		"skillIds": [
			1109505
		],
		"effectId": 22511301,
		"effectIds": [
			22511301
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1400
	},
	{
		"id": "direct-0008",
		"job": "Hero [Greatsword]",
		"sourceJob": "히어로 (검)",
		"name": "Heaven's Fury",
		"sourceName": "천파협란",
		"skillId": 1211005,
		"skillIds": [
			1211005
		],
		"effectId": 21520101,
		"effectIds": [
			21520101
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0009",
		"job": "Hero [Spear]",
		"sourceJob": "히어로 (창)",
		"name": "[Infinity] Blinding Flowers",
		"sourceName": "[인피니티] 백화요란",
		"skillId": 1802402,
		"skillIds": [
			1802402
		],
		"effectId": 21508602,
		"effectIds": [
			21508602
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 500
	},
	{
		"id": "direct-0010",
		"job": "Hero [Spear]",
		"sourceJob": "히어로 (창)",
		"name": "Gale",
		"sourceName": "선풍",
		"skillId": 1105017,
		"skillIds": [
			1105017
		],
		"effectId": 21503421,
		"effectIds": [
			21503421
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0011",
		"job": "Hero [Spear]",
		"sourceJob": "히어로 (창)",
		"name": "Buster Lancer",
		"sourceName": "버스터 랜스",
		"skillId": 1106007,
		"skillIds": [
			1106007
		],
		"effectId": 21504321,
		"effectIds": [
			21504321
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0012",
		"job": "Hero [Spear]",
		"sourceJob": "히어로 (창)",
		"name": "Hurricane Lance",
		"sourceName": "허리케인 랜스",
		"skillId": 1105007,
		"skillIds": [
			1105007
		],
		"effectId": 21501521,
		"effectIds": [
			21501521
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0013",
		"job": "Hero [Spear]",
		"sourceJob": "히어로 (창)",
		"name": "Dragon Spear (Wind)",
		"sourceName": "창룡 풍",
		"skillId": 1109107,
		"skillIds": [
			1109107
		],
		"effectId": 21509912,
		"effectIds": [
			21509912
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0014",
		"job": "Hero [Spear]",
		"sourceJob": "히어로 (창)",
		"name": "Propelling Strike",
		"sourceName": "추진격",
		"skillId": 1211007,
		"skillIds": [
			1211007
		],
		"effectId": 21520401,
		"effectIds": [
			21520401
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3000,
		"perLevel": 600
	},
	{
		"id": "direct-0015",
		"job": "Hero [Spear]",
		"sourceJob": "히어로 (창)",
		"name": "Power Spike",
		"sourceName": "파워 스파이크",
		"skillId": 1210007,
		"skillIds": [
			1210007
		],
		"effectId": 21520302,
		"effectIds": [
			21520302
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0016",
		"job": "Hero [Spear]",
		"sourceJob": "히어로 (창)",
		"name": "Dragon Spear (Thunder)",
		"sourceName": "창룡 뢰",
		"skillId": 1109207,
		"skillIds": [
			1109207
		],
		"effectId": 21511501,
		"effectIds": [
			21511501
		],
		"coefficientSource": "effect",
		"baseCoefficient": 9000,
		"perLevel": 1800
	},
	{
		"id": "direct-0017",
		"job": "Hero [Spear]",
		"sourceJob": "히어로 (창)",
		"name": "Heavy Lance",
		"sourceName": "헤비 랜스",
		"skillId": 1107027,
		"skillIds": [
			1107027
		],
		"effectId": 22506912,
		"effectIds": [
			22506912
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3005,
		"perLevel": 601
	},
	{
		"id": "direct-0018",
		"job": "Hero [Spear]",
		"sourceJob": "히어로 (창)",
		"name": "Rising Dragon Lance",
		"sourceName": "창룡승격",
		"skillId": 1107017,
		"skillIds": [
			1107017
		],
		"effectId": 22516911,
		"effectIds": [
			22516911
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1400
	},
	{
		"id": "direct-0019",
		"job": "Blade Master",
		"sourceJob": "검호",
		"name": "[Infinity] Paranoia",
		"sourceName": "[인피니티] 파라노이아",
		"skillId": 1802403,
		"skillIds": [
			1802403
		],
		"effectId": 21508702,
		"effectIds": [
			21508702
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1000,
		"perLevel": 500
	},
	{
		"id": "direct-0020",
		"job": "Blade Master",
		"sourceJob": "검호",
		"name": "Ascending Sword Dance",
		"sourceName": "승천난무",
		"skillId": 1210101,
		"skillIds": [
			1210101
		],
		"effectId": 21533205,
		"effectIds": [
			21533205
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0021",
		"job": "Blade Master",
		"sourceJob": "검호",
		"name": "Rampant Sword Dance",
		"sourceName": "무쌍난무",
		"skillId": 1210102,
		"skillIds": [
			1210102
		],
		"effectId": 21533209,
		"effectIds": [
			21533209
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0022",
		"job": "Blade Master",
		"sourceJob": "검호",
		"name": "Soul Blade",
		"sourceName": "소울 블레이드",
		"skillId": 1210021,
		"skillIds": [
			1210021
		],
		"effectId": 21520701,
		"effectIds": [
			21520701
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0023",
		"job": "Blade Master",
		"sourceJob": "검호",
		"name": "Cross Blade",
		"sourceName": "크로스 블레이드",
		"skillId": 1109021,
		"skillIds": [
			1109021
		],
		"effectId": 21511202,
		"effectIds": [
			21511202
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0024",
		"job": "Blade Master",
		"sourceJob": "검호",
		"name": "Spirit Dance",
		"sourceName": "스피릿",
		"skillId": 1210103,
		"skillIds": [
			1210103
		],
		"effectId": 21533211,
		"effectIds": [
			21533211
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0025",
		"job": "Blade Master",
		"sourceJob": "검호",
		"name": "Canine Blade",
		"sourceName": "케나인 블레이드",
		"skillId": 1210105,
		"skillIds": [
			1210105
		],
		"effectId": 13111412,
		"effectIds": [
			13111412
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0026",
		"job": "Savior [Longsword]",
		"sourceJob": "세이버 (검)",
		"name": "[Infinity] Majestic Pentagram",
		"sourceName": "[인피니티]",
		"skillId": 1802404,
		"skillIds": [
			1802404
		],
		"effectId": 21508801,
		"effectIds": [
			21508801,
			21508802
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 500
	},
	{
		"id": "direct-0027",
		"job": "Savior [Longsword]",
		"sourceJob": "세이버 (검)",
		"name": "Wind Break",
		"sourceName": "W.브레이크",
		"skillId": 1105004,
		"skillIds": [
			1105004
		],
		"effectId": 24501211,
		"effectIds": [
			24501211
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2250,
		"perLevel": 450
	},
	{
		"id": "direct-0028",
		"job": "Savior [Longsword]",
		"sourceJob": "세이버 (검)",
		"name": "Rapid Hack",
		"sourceName": "래퍼드해쉬",
		"skillId": 1107014,
		"skillIds": [
			1107014
		],
		"effectId": 24506612,
		"effectIds": [
			24506612
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4350,
		"perLevel": 870
	},
	{
		"id": "direct-0029",
		"job": "Savior [Longsword]",
		"sourceJob": "세이버 (검)",
		"name": "Sword Breath",
		"sourceName": "소드브레스",
		"skillId": 1210004,
		"skillIds": [
			1210004
		],
		"effectId": 21520801,
		"effectIds": [
			21520801
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0030",
		"job": "Savior [Longsword]",
		"sourceJob": "세이버 (검)",
		"name": "Death Blow",
		"sourceName": "데스 블로우",
		"skillId": 1107004,
		"skillIds": [
			1107004
		],
		"effectId": 21505821,
		"effectIds": [
			21505821
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0031",
		"job": "Savior [Longsword]",
		"sourceJob": "세이버 (검)",
		"name": "Slash Punt",
		"sourceName": "스플래쉬 펀트",
		"skillId": 1106101,
		"skillIds": [
			1106101
		],
		"effectId": 24502101,
		"effectIds": [
			24502101
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0032",
		"job": "Savior [Longsword]",
		"sourceJob": "세이버 (검)",
		"name": "Shield Charge",
		"sourceName": "쉴드차지",
		"skillId": 1211102,
		"skillIds": [
			1211102
		],
		"effectId": 14021425,
		"effectIds": [
			14021425
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3000,
		"perLevel": 600
	},
	{
		"id": "direct-0033",
		"job": "Savior [Longsword]",
		"sourceJob": "세이버 (검)",
		"name": "Shield Boomerang",
		"sourceName": "쉴드부메랑",
		"skillId": 1106102,
		"skillIds": [
			1106102
		],
		"effectId": 24502111,
		"effectIds": [
			24502111
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0034",
		"job": "Savior [Longsword]",
		"sourceJob": "세이버 (검)",
		"name": "Guard Rush",
		"sourceName": "가드러쉬",
		"skillId": 1109304,
		"skillIds": [
			1109304
		],
		"effectId": 24507611,
		"effectIds": [
			24507611
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3200,
		"perLevel": 640
	},
	{
		"id": "direct-0035",
		"job": "Savior [Mace]",
		"sourceJob": "세이버 (둔기)",
		"name": "[Infinity] Heaven and Hell",
		"sourceName": "[인피니티] 헤븐앤헬",
		"skillId": 1802406,
		"skillIds": [
			1802406
		],
		"effectId": 21509501,
		"effectIds": [
			21509501,
			21509511
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5200,
		"perLevel": 1100
	},
	{
		"id": "direct-0036",
		"job": "Savior [Mace]",
		"sourceJob": "세이버 (둔기)",
		"name": "Double Hit",
		"sourceName": "더블 히트",
		"skillId": 1211101,
		"skillIds": [
			1211101
		],
		"effectId": 14021423,
		"effectIds": [
			14021423
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0037",
		"job": "Savior [Mace]",
		"sourceJob": "세이버 (둔기)",
		"name": "Counter Shot",
		"sourceName": "카운터 샷",
		"skillId": 1211103,
		"skillIds": [
			1211103
		],
		"effectId": 14021424,
		"effectIds": [
			14021424
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1400
	},
	{
		"id": "direct-0038",
		"job": "Savior [Mace]",
		"sourceJob": "세이버 (둔기)",
		"name": "Shield Charge [Mace]",
		"sourceName": "쉴드 차지",
		"skillId": 1211102,
		"skillIds": [
			1211102
		],
		"effectId": 14021425,
		"effectIds": [
			14021425
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3000,
		"perLevel": 600
	},
	{
		"id": "direct-0039",
		"job": "Savior [Mace]",
		"sourceJob": "세이버 (둔기)",
		"name": "Shield Boomerang [Mace]",
		"sourceName": "쉴드 부메랑",
		"skillId": 1106202,
		"skillIds": [
			1106202
		],
		"effectId": 23502111,
		"effectIds": [
			23502111
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2400,
		"perLevel": 480
	},
	{
		"id": "direct-0040",
		"job": "Savior [Mace]",
		"sourceJob": "세이버 (둔기)",
		"name": "Gravity Hammer",
		"sourceName": "갓 버스트",
		"skillId": 1211006,
		"skillIds": [
			1211006
		],
		"effectId": 21521202,
		"effectIds": [
			21521202
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0041",
		"job": "Savior [Mace]",
		"sourceJob": "세이버 (둔기)",
		"name": "Hammer Crash",
		"sourceName": "해머 크래쉬",
		"skillId": 1802407,
		"skillIds": [
			1802407
		],
		"effectId": 24507812,
		"effectIds": [
			24507812
		],
		"coefficientSource": "effect",
		"baseCoefficient": 10000,
		"perLevel": 2000
	},
	{
		"id": "direct-0042",
		"job": "Savior [Mace]",
		"sourceJob": "세이버 (둔기)",
		"name": "Power Grind",
		"sourceName": "파워 그라인드",
		"skillId": null,
		"skillIds": [
			1210006
		],
		"effectId": null,
		"effectIds": [],
		"coefficientSource": "fallback",
		"baseCoefficient": 5750,
		"perLevel": 1050
	},
	{
		"id": "direct-0043",
		"job": "Savior [Mace]",
		"sourceJob": "세이버 (둔기)",
		"name": "Power Bomb",
		"sourceName": "파워 밤",
		"skillId": 1211104,
		"skillIds": [
			1211104
		],
		"effectId": 14021427,
		"effectIds": [
			14021427
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3250,
		"perLevel": 650
	},
	{
		"id": "direct-0044",
		"job": "Sefirot",
		"sourceJob": "세피로트",
		"name": "[Infinity] Wild Fantasy",
		"sourceName": "[인피니티]",
		"skillId": 1802408,
		"skillIds": [
			1802408
		],
		"effectId": 21509602,
		"effectIds": [
			21509602
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1000,
		"perLevel": 500
	},
	{
		"id": "direct-0045",
		"job": "Sefirot",
		"sourceJob": "세피로트",
		"name": "Iron Mountain",
		"sourceName": "철산고",
		"skillId": 1106012,
		"skillIds": [
			1106012
		],
		"effectId": 21504623,
		"effectIds": [
			21504623
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0046",
		"job": "Sefirot",
		"sourceJob": "세피로트",
		"name": "Twin Fist",
		"sourceName": "쌍장타",
		"skillId": 1107012,
		"skillIds": [
			1107012
		],
		"effectId": 21506421,
		"effectIds": [
			21506421
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0047",
		"job": "Sefirot",
		"sourceJob": "세피로트",
		"name": "Spin Kick",
		"sourceName": "돌려차기",
		"skillId": null,
		"skillIds": [
			1100109
		],
		"effectId": null,
		"effectIds": [],
		"coefficientSource": "fallback",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0048",
		"job": "Sefirot",
		"sourceJob": "세피로트",
		"name": "Sliding Kick",
		"sourceName": "슬라이딩 킥",
		"skillId": 1100112,
		"skillIds": [
			1100112
		],
		"effectId": 24502001,
		"effectIds": [
			24502001
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1000
	},
	{
		"id": "direct-0049",
		"job": "Sefirot",
		"sourceJob": "세피로트",
		"name": "Energy Wave",
		"sourceName": "에네르기 파",
		"skillId": 1106002,
		"skillIds": [
			1106002
		],
		"effectId": 24503811,
		"effectIds": [
			24503811
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6500,
		"perLevel": 1300
	},
	{
		"id": "direct-0050",
		"job": "Sefirot",
		"sourceJob": "세피로트",
		"name": "Ghost Fist",
		"sourceName": "참영권",
		"skillId": 1100110,
		"skillIds": [
			1100110
		],
		"effectId": 24501010,
		"effectIds": [
			24501010
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1000
	},
	{
		"id": "direct-0051",
		"job": "Sefirot",
		"sourceJob": "세피로트",
		"name": "Flame Kick",
		"sourceName": "호열각",
		"skillId": 1104001,
		"skillIds": [
			1104001
		],
		"effectId": 24600011,
		"effectIds": [
			24600011
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5750,
		"perLevel": 1150
	},
	{
		"id": "direct-0052",
		"job": "Sefirot",
		"sourceJob": "세피로트",
		"name": "Half-Moon Kick",
		"sourceName": "반월각",
		"skillId": 1106001,
		"skillIds": [
			1106001
		],
		"effectId": 24503711,
		"effectIds": [
			24503711
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2750,
		"perLevel": 550
	},
	{
		"id": "direct-0053",
		"job": "Sefirot",
		"sourceJob": "세피로트",
		"name": "Rising Dragon",
		"sourceName": "승룡권",
		"skillId": 1101101,
		"skillIds": [
			1101101
		],
		"effectId": 24600901,
		"effectIds": [
			24600901,
			24600902
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3000,
		"perLevel": 600
	},
	{
		"id": "direct-0054",
		"job": "Sefirot",
		"sourceJob": "세피로트",
		"name": "Earth Crash",
		"sourceName": "대지파열",
		"skillId": 1210002,
		"skillIds": [
			1210002
		],
		"effectId": 21521301,
		"effectIds": [
			21521301
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4350,
		"perLevel": 870
	},
	{
		"id": "direct-0055",
		"job": "Sefirot",
		"sourceJob": "세피로트",
		"name": "Dragon Kick",
		"sourceName": "천룡각",
		"skillId": 1107001,
		"skillIds": [
			1107001
		],
		"effectId": 24505511,
		"effectIds": [
			24505511
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1400
	},
	{
		"id": "direct-0056",
		"job": "Sefirot",
		"sourceJob": "세피로트",
		"name": "Phantom Kick",
		"sourceName": "환영각",
		"skillId": 1100111,
		"skillIds": [
			1100111
		],
		"effectId": 24501020,
		"effectIds": [
			24501020
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0057",
		"job": "Sefirot",
		"sourceJob": "세피로트",
		"name": "Tornado Kick",
		"sourceName": "선풍각",
		"skillId": 1212002,
		"skillIds": [
			1212002
		],
		"effectId": 21521501,
		"effectIds": [
			21521501
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1900,
		"perLevel": 380
	},
	{
		"id": "direct-0058",
		"job": "Archmage",
		"sourceJob": "아크메이지",
		"name": "[Infinity] Flame Vanguard",
		"sourceName": "[인피니티] 플레임뱅가드",
		"skillId": 1802409,
		"skillIds": [
			1802409
		],
		"effectId": 21509401,
		"effectIds": [
			21509401,
			21509402
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 500
	},
	{
		"id": "direct-0059",
		"job": "Archmage",
		"sourceJob": "아크메이지",
		"name": "Hailstone",
		"sourceName": "헤일스톤",
		"skillId": 2107006,
		"skillIds": [
			2107006
		],
		"effectId": 24511711,
		"effectIds": [
			24511711
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1500,
		"perLevel": 300
	},
	{
		"id": "direct-0060",
		"job": "Archmage",
		"sourceJob": "아크메이지",
		"name": "Ice Flank",
		"sourceName": "아이스플랭크",
		"skillId": 2104104,
		"skillIds": [
			2104104
		],
		"effectId": 24502011,
		"effectIds": [
			24502011
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0061",
		"job": "Archmage",
		"sourceJob": "아크메이지",
		"name": "Cestrilatina",
		"sourceName": "세스티라티나",
		"skillId": 2008006,
		"skillIds": [
			2008006
		],
		"effectId": 21509411,
		"effectIds": [
			21509411
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0062",
		"job": "Archmage",
		"sourceJob": "아크메이지",
		"name": "Flame Eruption",
		"sourceName": "환염초래",
		"skillId": 2211003,
		"skillIds": [
			2211003
		],
		"effectId": 21522301,
		"effectIds": [
			21522301
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2400,
		"perLevel": 480
	},
	{
		"id": "direct-0063",
		"job": "Archmage",
		"sourceJob": "아크메이지",
		"name": "Hellfire",
		"sourceName": "화염지옥",
		"skillId": 2211103,
		"skillIds": [
			2211103
		],
		"effectId": 24510811,
		"effectIds": [
			24510811
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3750,
		"perLevel": 750
	},
	{
		"id": "direct-0064",
		"job": "Archmage",
		"sourceJob": "아크메이지",
		"name": "Fire Wall",
		"sourceName": "파이어월",
		"skillId": 2210003,
		"skillIds": [
			2210003
		],
		"effectId": 21522102,
		"effectIds": [
			21522102
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0065",
		"job": "Archmage",
		"sourceJob": "아크메이지",
		"name": "Cyclone Cutter",
		"sourceName": "사이클론커터",
		"skillId": 2105002,
		"skillIds": [
			2105002
		],
		"effectId": 25500412,
		"effectIds": [
			25500412
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1200,
		"perLevel": 240
	},
	{
		"id": "direct-0066",
		"job": "Archmage",
		"sourceJob": "아크메이지",
		"name": "Air Bomb",
		"sourceName": "에어봄",
		"skillId": 2106002,
		"skillIds": [
			2106002
		],
		"effectId": 25500712,
		"effectIds": [
			25500712
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0067",
		"job": "Archmage",
		"sourceJob": "아크메이지",
		"name": "Tornado Swing",
		"sourceName": "토네이도스윙",
		"skillId": 2107002,
		"skillIds": [
			2107002
		],
		"effectId": 25501512,
		"effectIds": [
			25501512
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1300,
		"perLevel": 260
	},
	{
		"id": "direct-0068",
		"job": "Archmage",
		"sourceJob": "아크메이지",
		"name": "Earthquake",
		"sourceName": "어스퀘이크",
		"skillId": 2104001,
		"skillIds": [
			2104001
		],
		"effectId": 24510011,
		"effectIds": [
			24510011
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0069",
		"job": "Archmage",
		"sourceJob": "아크메이지",
		"name": "Stone Spear",
		"sourceName": "스톤스피어",
		"skillId": 2105001,
		"skillIds": [
			2105001
		],
		"effectId": 24500311,
		"effectIds": [
			24500311
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0070",
		"job": "Archmage",
		"sourceJob": "아크메이지",
		"name": "Sky Dragon",
		"sourceName": "천룡아",
		"skillId": 2106001,
		"skillIds": [
			2106001
		],
		"effectId": 24500611,
		"effectIds": [
			24500611
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1400
	},
	{
		"id": "direct-0071",
		"job": "Pop Star",
		"sourceJob": "파픈스타",
		"name": "[Infinity] Seven Signs",
		"sourceName": "[인피니티] 세븐사인",
		"skillId": 1802410,
		"skillIds": [
			1802410
		],
		"effectId": 21509301,
		"effectIds": [
			21509301
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1000,
		"perLevel": 500
	},
	{
		"id": "direct-0072",
		"job": "Pop Star",
		"sourceJob": "파픈스타",
		"name": "Devil's Play",
		"sourceName": "악마의연주",
		"skillId": 3101013,
		"skillIds": [
			3101013
		],
		"effectId": 24512601,
		"effectIds": [
			24512601
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4300,
		"perLevel": 860
	},
	{
		"id": "direct-0073",
		"job": "Pop Star",
		"sourceJob": "파픈스타",
		"name": "Mega-Death",
		"sourceName": "메가데스",
		"skillId": 3001016,
		"skillIds": [
			3001016
		],
		"effectId": 21510511,
		"effectIds": [
			21510511
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0074",
		"job": "Pop Star",
		"sourceJob": "파픈스타",
		"name": "Screaming Play",
		"sourceName": "괴성의연주",
		"skillId": 1108000,
		"skillIds": [
			1108000
		],
		"effectId": 24509401,
		"effectIds": [
			24509401
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0075",
		"job": "Pop Star",
		"sourceJob": "파픈스타",
		"name": "Devil's Sound",
		"sourceName": "악마의소리",
		"skillId": 3001019,
		"skillIds": [
			3001019
		],
		"effectId": 14021365,
		"effectIds": [
			14021365
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0076",
		"job": "Pop Star",
		"sourceJob": "파픈스타",
		"name": "Hellish Note",
		"sourceName": "음표의나락",
		"skillId": 1108001,
		"skillIds": [
			1108001
		],
		"effectId": 24509501,
		"effectIds": [
			24509501
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0077",
		"job": "Pop Star",
		"sourceJob": "파픈스타",
		"name": "Electric Shock",
		"sourceName": "일렉트릭쇼크",
		"skillId": 3101023,
		"skillIds": [
			3101023
		],
		"effectId": 24061201,
		"effectIds": [
			24061201
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6500,
		"perLevel": 1300
	},
	{
		"id": "direct-0078",
		"job": "Wind Stalker [Dagger]",
		"sourceJob": "윈드스토커 (단검)",
		"name": "[Infinity] Carnival Madness",
		"sourceName": "[인피니티] 카니발매드니스",
		"skillId": 1802411,
		"skillIds": [
			1802411
		],
		"effectId": 21509002,
		"effectIds": [
			21509002
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1000,
		"perLevel": 500
	},
	{
		"id": "direct-0079",
		"job": "Wind Stalker [Dagger]",
		"sourceJob": "윈드스토커 (단검)",
		"name": "Fan of Knives",
		"sourceName": "팬오브나이프",
		"skillId": 1107033,
		"skillIds": [
			1107033
		],
		"effectId": 24506110,
		"effectIds": [
			24506110
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0080",
		"job": "Wind Stalker [Dagger]",
		"sourceJob": "윈드스토커 (단검)",
		"name": "Dagger Rain",
		"sourceName": "만천화우",
		"skillId": 1106013,
		"skillIds": [
			1106013
		],
		"effectId": 21504721,
		"effectIds": [
			21504721
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6500,
		"perLevel": 1300
	},
	{
		"id": "direct-0081",
		"job": "Wind Stalker [Dagger]",
		"sourceJob": "윈드스토커 (단검)",
		"name": "Crazy Throw",
		"sourceName": "크레이지스로우",
		"skillId": 1210003,
		"skillIds": [
			1210003
		],
		"effectId": 21518501,
		"effectIds": [
			21518501
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0082",
		"job": "Wind Stalker [Dagger]",
		"sourceJob": "윈드스토커 (단검)",
		"name": "Blitz",
		"sourceName": "블리츠",
		"skillId": 1107023,
		"skillIds": [
			1107023
		],
		"effectId": 24506010,
		"effectIds": [
			24506010
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5750,
		"perLevel": 1150
	},
	{
		"id": "direct-0083",
		"job": "Wind Stalker [Dagger]",
		"sourceJob": "윈드스토커 (단검)",
		"name": "Triple Stab",
		"sourceName": "삼중살",
		"skillId": 1109003,
		"skillIds": [
			1109003
		],
		"effectId": 21510601,
		"effectIds": [
			21510601
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0084",
		"job": "Wind Stalker [Dagger]",
		"sourceJob": "윈드스토커 (단검)",
		"name": "Sonic Dagger",
		"sourceName": "소리비도",
		"skillId": 1104013,
		"skillIds": [
			1104013
		],
		"effectId": 24512111,
		"effectIds": [
			24512111
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0085",
		"job": "Wind Stalker [Dagger]",
		"sourceJob": "윈드스토커 (단검)",
		"name": "Dark Dagger",
		"sourceName": "다크프레닉",
		"skillId": 1107003,
		"skillIds": [
			1107003
		],
		"effectId": 24505711,
		"effectIds": [
			24505711
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0086",
		"job": "Wind Stalker [Dagger]",
		"sourceJob": "윈드스토커 (단검)",
		"name": "Masquerade",
		"sourceName": "매스커레이드",
		"skillId": 1106003,
		"skillIds": [
			1106003
		],
		"effectId": 21503922,
		"effectIds": [
			21503922
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6500,
		"perLevel": 1300
	},
	{
		"id": "direct-0087",
		"job": "Wind Stalker [Crossbow]",
		"sourceJob": "윈드스토커 (석궁)",
		"name": "[Infinity] Comet Bolt",
		"sourceName": "[인피니티] 혜성난뢰",
		"skillId": 1802413,
		"skillIds": [
			1802413
		],
		"effectId": 21509701,
		"effectIds": [
			21509701
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 500
	},
	{
		"id": "direct-0088",
		"job": "Wind Stalker [Crossbow]",
		"sourceJob": "윈드스토커 (석궁)",
		"name": "Escape Blast",
		"sourceName": "이스케이프샷",
		"skillId": 1211009,
		"skillIds": [
			1211009
		],
		"effectId": 21519101,
		"effectIds": [
			21519101
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0089",
		"job": "Wind Stalker [Crossbow]",
		"sourceJob": "윈드스토커 (석궁)",
		"name": "Galactic Magnum",
		"sourceName": "갤럭티카매그넘",
		"skillId": 1106009,
		"skillIds": [
			1106009
		],
		"effectId": 24504511,
		"effectIds": [
			24504511
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0090",
		"job": "Wind Stalker [Crossbow]",
		"sourceJob": "윈드스토커 (석궁)",
		"name": "Dark Spears",
		"sourceName": "다크스피어스",
		"skillId": 1107009,
		"skillIds": [
			1107009
		],
		"effectId": 24506311,
		"effectIds": [
			24506311
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0091",
		"job": "Wind Stalker [Crossbow]",
		"sourceJob": "윈드스토커 (석궁)",
		"name": "Flame Shower",
		"sourceName": "프레임 샤워",
		"skillId": null,
		"skillIds": [
			1109009
		],
		"effectId": null,
		"effectIds": [],
		"coefficientSource": "fallback",
		"baseCoefficient": 3750,
		"perLevel": 750
	},
	{
		"id": "direct-0092",
		"job": "Wind Stalker [Crossbow]",
		"sourceJob": "윈드스토커 (석궁)",
		"name": "Wide Shot",
		"sourceName": "와이드 샷",
		"skillId": 1105009,
		"skillIds": [
			1105009
		],
		"effectId": 24601711,
		"effectIds": [
			24601711
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0093",
		"job": "Wind Stalker [Crossbow]",
		"sourceJob": "윈드스토커 (석궁)",
		"name": "Stream Shot",
		"sourceName": "스트림 샷",
		"skillId": 1104009,
		"skillIds": [
			1104009
		],
		"effectId": 24600811,
		"effectIds": [
			24600811
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0094",
		"job": "Wind Stalker [Crossbow]",
		"sourceJob": "윈드스토커 (석궁)",
		"name": "Locust",
		"sourceName": "로커스트",
		"skillId": 1108019,
		"skillIds": [
			1108019
		],
		"effectId": 24508321,
		"effectIds": [
			24508321
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1400,
		"perLevel": 280
	},
	{
		"id": "direct-0095",
		"job": "Wind Stalker [Crossbow]",
		"sourceJob": "윈드스토커 (석궁)",
		"name": "Counter Attack",
		"sourceName": "카운터 어택",
		"skillId": 1210009,
		"skillIds": [
			1210009
		],
		"effectId": 21519001,
		"effectIds": [
			21519001
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1000
	},
	{
		"id": "direct-0096",
		"job": "Wind Stalker [Crossbow]",
		"sourceJob": "윈드스토커 (석궁)",
		"name": "Limiter Release",
		"sourceName": "리미터해제",
		"skillId": 1106019,
		"skillIds": [
			1106019
		],
		"effectId": 24505311,
		"effectIds": [
			24505311
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6500,
		"perLevel": 1300
	},
	{
		"id": "direct-0097",
		"job": "Wind Stalker [Bow]",
		"sourceJob": "윈드스토커 (활)",
		"name": "[Infinity] Ray Blast",
		"sourceName": "[인피니티] 레이 블래스트",
		"skillId": 1802412,
		"skillIds": [
			1802412
		],
		"effectId": 21508901,
		"effectIds": [
			21508901,
			21508902
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2800,
		"perLevel": 400
	},
	{
		"id": "direct-0098",
		"job": "Wind Stalker [Bow]",
		"sourceJob": "윈드스토커 (활)",
		"name": "Arrow Boom",
		"sourceName": "애로우붐",
		"skillId": 1109908,
		"skillIds": [
			1109908
		],
		"effectId": 21512702,
		"effectIds": [
			21512702
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0099",
		"job": "Wind Stalker [Bow]",
		"sourceJob": "윈드스토커 (활)",
		"name": "Storm Arrow",
		"sourceName": "스톰애로우",
		"skillId": 1105008,
		"skillIds": [
			1105008
		],
		"effectId": 24501611,
		"effectIds": [
			24501611
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0100",
		"job": "Wind Stalker [Bow]",
		"sourceJob": "윈드스토커 (활)",
		"name": "Bird Hunting",
		"sourceName": "버드헌팅",
		"skillId": 1104018,
		"skillIds": [
			1104018
		],
		"effectId": 24502611,
		"effectIds": [
			24502611
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0101",
		"job": "Wind Stalker [Bow]",
		"sourceJob": "윈드스토커 (활)",
		"name": "Shining Arrow",
		"sourceName": "샤이닝 애로우",
		"skillId": 1108008,
		"skillIds": [
			1108008
		],
		"effectId": 24508215,
		"effectIds": [
			24508215
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0102",
		"job": "Wind Stalker [Bow]",
		"sourceJob": "윈드스토커 (활)",
		"name": "Arrow Shot",
		"sourceName": "에로우 샷",
		"skillId": null,
		"skillIds": [
			1006038
		],
		"effectId": null,
		"effectIds": [],
		"coefficientSource": "fallback",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0103",
		"job": "Wind Stalker [Bow]",
		"sourceJob": "윈드스토커 (활)",
		"name": "Backstep Arrow",
		"sourceName": "백스텝 에로우",
		"skillId": 1105100,
		"skillIds": [
			1105100
		],
		"effectId": 24503610,
		"effectIds": [
			24503610
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0104",
		"job": "Wind Stalker [Bow]",
		"sourceJob": "윈드스토커 (활)",
		"name": "Heavenly Bird Strike",
		"sourceName": "갓버드피니시",
		"skillId": 1106018,
		"skillIds": [
			1106018
		],
		"effectId": 21505221,
		"effectIds": [
			21505221
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2750,
		"perLevel": 550
	},
	{
		"id": "direct-0105",
		"job": "Der Freischütz",
		"sourceJob": "프라이쉬츠",
		"name": "[Infinity] Phantom Faust",
		"sourceName": "[인피니티] 팬텀파우스트",
		"skillId": 1802414,
		"skillIds": [
			1802414
		],
		"effectId": 21509102,
		"effectIds": [
			21509102
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 500
	},
	{
		"id": "direct-0106",
		"job": "Der Freischütz",
		"sourceJob": "프라이쉬츠",
		"name": "Gatling",
		"sourceName": "게틀링",
		"skillId": 1105020,
		"skillIds": [
			1105020
		],
		"effectId": 21507712,
		"effectIds": [
			21507712
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0107",
		"job": "Der Freischütz",
		"sourceJob": "프라이쉬츠",
		"name": "Showtime",
		"sourceName": "쇼타임",
		"skillId": 1106020,
		"skillIds": [
			1106020
		],
		"effectId": 21511001,
		"effectIds": [
			21511001
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0108",
		"job": "Der Freischütz",
		"sourceJob": "프라이쉬츠",
		"name": "Rapid Fire",
		"sourceName": "연사",
		"skillId": 1100420,
		"skillIds": [
			1100420
		],
		"effectId": 14021772,
		"effectIds": [
			14021772
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0109",
		"job": "Der Freischütz",
		"sourceJob": "프라이쉬츠",
		"name": "Flak Noir",
		"sourceName": "플래틱느와르",
		"skillId": 1103020,
		"skillIds": [
			1103020
		],
		"effectId": 24507601,
		"effectIds": [
			24507601
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0110",
		"job": "Der Freischütz",
		"sourceJob": "프라이쉬츠",
		"name": "Spray Down",
		"sourceName": "난사",
		"skillId": 1100520,
		"skillIds": [
			1100520
		],
		"effectId": 14021774,
		"effectIds": [
			14021774
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0111",
		"job": "Der Freischütz",
		"sourceJob": "프라이쉬츠",
		"name": "Stepback",
		"sourceName": "스탭백",
		"skillId": 1100820,
		"skillIds": [
			1100820
		],
		"effectId": 14021776,
		"effectIds": [
			14021776
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0112",
		"job": "Der Freischütz",
		"sourceJob": "프라이쉬츠",
		"name": "Quick Shot",
		"sourceName": "속사",
		"skillId": 1100320,
		"skillIds": [
			1100320
		],
		"effectId": 14021777,
		"effectIds": [
			14021777
		],
		"coefficientSource": "effect",
		"baseCoefficient": 500,
		"perLevel": 500
	},
	{
		"id": "direct-0113",
		"job": "Der Freischütz",
		"sourceJob": "프라이쉬츠",
		"name": "Golden Shot",
		"sourceName": "골든샷",
		"skillId": 1100620,
		"skillIds": [
			1100620
		],
		"effectId": 14021775,
		"effectIds": [
			14021775
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7500,
		"perLevel": 1500
	},
	{
		"id": "direct-0114",
		"job": "Der Freischütz",
		"sourceJob": "프라이쉬츠",
		"name": "Apocalypse",
		"sourceName": "아포칼립스",
		"skillId": 1210020,
		"skillIds": [
			1210020
		],
		"effectId": 21518301,
		"effectIds": [
			21518301
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2300,
		"perLevel": 460
	},
	{
		"id": "direct-0115",
		"job": "Swordian",
		"sourceJob": "소디언",
		"name": "Mistilteinn",
		"sourceName": "미스틸테인",
		"skillId": 1101022,
		"skillIds": [
			1101022
		],
		"effectId": 24508401,
		"effectIds": [
			24508401
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0116",
		"job": "Swordian",
		"sourceJob": "소디언",
		"name": "Raikiri",
		"sourceName": "라이키리",
		"skillId": 1103022,
		"skillIds": [
			1103022
		],
		"effectId": 24508431,
		"effectIds": [
			24508431
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0117",
		"job": "Swordian",
		"sourceJob": "소디언",
		"name": "Lightning",
		"sourceName": "라이트닝",
		"skillId": 1212026,
		"skillIds": [
			1212026
		],
		"effectId": 14021851,
		"effectIds": [
			14021851
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0118",
		"job": "Swordian",
		"sourceJob": "소디언",
		"name": "Gae Bolg",
		"sourceName": "가에보르그",
		"skillId": 1102022,
		"skillIds": [
			1102022
		],
		"effectId": 24508421,
		"effectIds": [
			24508421
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0119",
		"job": "Swordian",
		"sourceJob": "소디언",
		"name": "Vulcan",
		"sourceName": "발칸",
		"skillId": 1109022,
		"skillIds": [
			1109022
		],
		"effectId": 24508531,
		"effectIds": [
			24508531
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3600,
		"perLevel": 720
	},
	{
		"id": "direct-0120",
		"job": "Swordian",
		"sourceJob": "소디언",
		"name": "Rising Beam",
		"sourceName": "라이즈 빔",
		"skillId": 1210022,
		"skillIds": [
			1210022
		],
		"effectId": 21517701,
		"effectIds": [
			21517701
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0121",
		"job": "Soulless One",
		"sourceJob": "소울리스 원",
		"name": "[Infinity] Dragon Hazard",
		"sourceName": "[인피니티]",
		"skillId": 1802416,
		"skillIds": [
			1802416
		],
		"effectId": 21517001,
		"effectIds": [
			21517001
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 500
	},
	{
		"id": "direct-0122",
		"job": "Soulless One",
		"sourceJob": "소울리스 원",
		"name": "Wild Soul",
		"sourceName": "와일드 소울",
		"skillId": 1100033,
		"skillIds": [
			1100033
		],
		"effectId": 14023012,
		"effectIds": [
			14023012
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0123",
		"job": "Soulless One",
		"sourceJob": "소울리스 원",
		"name": "Giant Soul",
		"sourceName": "자이언트 소울",
		"skillId": 1106033,
		"skillIds": [
			1106033
		],
		"effectId": 14023018,
		"effectIds": [
			14023018
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0124",
		"job": "Soulless One",
		"sourceJob": "소울리스 원",
		"name": "Swift Soul",
		"sourceName": "스위프트 소울",
		"skillId": 1210037,
		"skillIds": [
			1210037
		],
		"effectId": 14023019,
		"effectIds": [
			14023019
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0125",
		"job": "Soulless One",
		"sourceJob": "소울리스 원",
		"name": "Soul Master I",
		"sourceName": "소울 마스터 1",
		"skillId": 1101033,
		"skillIds": [
			1101033
		],
		"effectId": 14023013,
		"effectIds": [
			14023013
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7250,
		"perLevel": 1450
	},
	{
		"id": "direct-0126",
		"job": "Soulless One",
		"sourceJob": "소울리스 원",
		"name": "Soul Master II",
		"sourceName": "소울 마스터 2",
		"skillId": 1102033,
		"skillIds": [
			1102033
		],
		"effectId": 14023014,
		"effectIds": [
			14023014
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0127",
		"job": "Soulless One",
		"sourceJob": "소울리스 원",
		"name": "Soul Master III",
		"sourceName": "소울 마스터 3",
		"skillId": 1210036,
		"skillIds": [
			1210036
		],
		"effectId": 14023017,
		"effectIds": [
			14023017
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6500,
		"perLevel": 1300
	},
	{
		"id": "direct-0128",
		"job": "Soulless One",
		"sourceJob": "소울리스 원",
		"name": "Soul Master IV",
		"sourceName": "소울 마스터 4",
		"skillId": 1210036,
		"skillIds": [
			1210036
		],
		"effectId": 14023017,
		"effectIds": [
			14023017
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6500,
		"perLevel": 1300
	},
	{
		"id": "direct-0129",
		"job": "Arc Master",
		"sourceJob": "아크마스터",
		"name": "[Infinity] Galaxy Wave",
		"sourceName": "[인피니티] 갤럭시워",
		"skillId": 1802417,
		"skillIds": [
			1802417
		],
		"effectId": 21532701,
		"effectIds": [
			21532701
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 500
	},
	{
		"id": "direct-0130",
		"job": "Arc Master",
		"sourceJob": "아크마스터",
		"name": "Burst Card",
		"sourceName": "버스트카드",
		"skillId": 2212004,
		"skillIds": [
			2212004
		],
		"effectId": 21532101,
		"effectIds": [
			21532101
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0131",
		"job": "Arc Master",
		"sourceJob": "아크마스터",
		"name": "Thunderbolt",
		"sourceName": "썬더볼트",
		"skillId": 2212005,
		"skillIds": [
			2212005
		],
		"effectId": 21505313,
		"effectIds": [
			21505313
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0132",
		"job": "Arc Master",
		"sourceJob": "아크마스터",
		"name": "Shining Deck",
		"sourceName": "샤이닝덱",
		"skillId": 2212007,
		"skillIds": [
			2212007
		],
		"effectId": 21532501,
		"effectIds": [
			21532501
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0133",
		"job": "Arc Master",
		"sourceJob": "아크마스터",
		"name": "Freedom Light",
		"sourceName": "프리덤라이트",
		"skillId": 1311147,
		"skillIds": [
			1311147
		],
		"effectId": 21505319,
		"effectIds": [
			21505319
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0134",
		"job": "Arc Master",
		"sourceJob": "아크마스터",
		"name": "Reflection",
		"sourceName": "리플렉션",
		"skillId": 1310048,
		"skillIds": [
			1310048
		],
		"effectId": 21532801,
		"effectIds": [
			21532801
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0135",
		"job": "Arc Master",
		"sourceJob": "아크마스터",
		"name": "Twinkle",
		"sourceName": "트윙클",
		"skillId": 1313048,
		"skillIds": [
			1313048
		],
		"effectId": 21533103,
		"effectIds": [
			21533103
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0136",
		"job": "Arc Master",
		"sourceJob": "아크마스터",
		"name": "Illuminate",
		"sourceName": "일리미네이트",
		"skillId": 1311052,
		"skillIds": [
			1311052
		],
		"effectId": 21536401,
		"effectIds": [
			21536401
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1001
	},
	{
		"id": "direct-0137",
		"job": "Arc Master",
		"sourceJob": "아크마스터",
		"name": "Hidden Card",
		"sourceName": "히든카드",
		"skillId": 1311049,
		"skillIds": [
			1311049
		],
		"effectId": 21533301,
		"effectIds": [
			21533301
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2250,
		"perLevel": 450
	},
	{
		"id": "direct-0138",
		"job": "Arc Master",
		"sourceJob": "아크마스터",
		"name": "Wild Cards",
		"sourceName": "와일드카드",
		"skillId": 1310049,
		"skillIds": [
			1310049
		],
		"effectId": 21533203,
		"effectIds": [
			21533203
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0139",
		"job": "Force Master",
		"sourceJob": "포스마스터",
		"name": "[Infinity] Banishment",
		"sourceName": "[인피니티] 배니쉬먼트",
		"skillId": 1802418,
		"skillIds": [
			1802418
		],
		"effectId": 21535901,
		"effectIds": [
			21535901,
			21535902
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 500
	},
	{
		"id": "direct-0140",
		"job": "Force Master",
		"sourceJob": "포스마스터",
		"name": "[♣] Circle Ball",
		"sourceName": "[♣] 서클볼",
		"skillId": 1311446,
		"skillIds": [
			1311446
		],
		"effectId": 21535301,
		"effectIds": [
			21535301
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3800,
		"perLevel": 760
	},
	{
		"id": "direct-0141",
		"job": "Force Master",
		"sourceJob": "포스마스터",
		"name": "[♣] Darkness Deck",
		"sourceName": "[♣] 다크니스덱",
		"skillId": 1310053,
		"skillIds": [
			1310053
		],
		"effectId": 21021553,
		"effectIds": [
			21021553
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0142",
		"job": "Force Master",
		"sourceJob": "포스마스터",
		"name": "[♣] Time Break",
		"sourceName": "[♣] 타임브레이크",
		"skillId": 1310052,
		"skillIds": [
			1310052
		],
		"effectId": 21536301,
		"effectIds": [
			21536301
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1500,
		"perLevel": 300
	},
	{
		"id": "direct-0143",
		"job": "Force Master",
		"sourceJob": "포스마스터",
		"name": "[♠] Uppercut",
		"sourceName": "[♠] 어퍼컷",
		"skillId": 1310250,
		"skillIds": [
			1310250
		],
		"effectId": 21535505,
		"effectIds": [
			21535505
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0144",
		"job": "Force Master",
		"sourceJob": "포스마스터",
		"name": "[♠] Rayborn",
		"sourceName": "[♠] 레이본",
		"skillId": 1312546,
		"skillIds": [
			1312546
		],
		"effectId": 21535211,
		"effectIds": [
			21535211
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0145",
		"job": "Force Master",
		"sourceJob": "포스마스터",
		"name": "[♠] Special Kick",
		"sourceName": "[♠] 스페셜킥",
		"skillId": 1313250,
		"skillIds": [
			1313250
		],
		"effectId": 21535701,
		"effectIds": [
			21535701
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0146",
		"job": "Force Master",
		"sourceJob": "포스마스터",
		"name": "[◆] Hit and Rush",
		"sourceName": "[◆] 힛앤러쉬",
		"skillId": 1310056,
		"skillIds": [
			1310056
		],
		"effectId": 21021559,
		"effectIds": [
			21021559
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4250,
		"perLevel": 900
	},
	{
		"id": "direct-0147",
		"job": "Force Master",
		"sourceJob": "포스마스터",
		"name": "[◆] Crumble",
		"sourceName": "[◆] 크럼블",
		"skillId": 1311051,
		"skillIds": [
			1311051
		],
		"effectId": 21536001,
		"effectIds": [
			21536001
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1400
	},
	{
		"id": "direct-0148",
		"job": "Black Anima [Katana]",
		"sourceJob": "흑영(도)",
		"name": "[Infinity] Shadow Strike",
		"sourceName": "[인피니티] 그림자 일격",
		"skillId": 1802420,
		"skillIds": [
			1802420
		],
		"effectId": 27802501,
		"effectIds": [
			27802501,
			27802511
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2400,
		"perLevel": 600
	},
	{
		"id": "direct-0149",
		"job": "Black Anima [Katana]",
		"sourceJob": "흑영(도)",
		"name": "[Initial Form] 1~3",
		"sourceName": "[초식] 1~3",
		"skillId": null,
		"skillIds": [
			1510055,
			1511055,
			1512055
		],
		"effectId": 13016333,
		"effectIds": [
			13016333,
			13016334,
			13016335
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3000,
		"perLevel": 600
	},
	{
		"id": "direct-0150",
		"job": "Black Anima [Katana]",
		"sourceJob": "흑영(도)",
		"name": "[Initial Form] 4~8",
		"sourceName": "[초식] 4~8",
		"skillId": null,
		"skillIds": [
			1514055,
			1515055,
			1518055,
			1521055,
			1510056
		],
		"effectId": 13016340,
		"effectIds": [
			13016336,
			13016337,
			13016338,
			13016339,
			13016340
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0151",
		"job": "Black Anima [Katana]",
		"sourceJob": "흑영(도)",
		"name": "[Initial Form] 9~12",
		"sourceName": "[초식] 9~12",
		"skillId": null,
		"skillIds": [
			1513055,
			1516055,
			1519055,
			1520055
		],
		"effectId": 13016341,
		"effectIds": [
			13016341,
			13016342,
			13016343,
			13016344
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4250,
		"perLevel": 850
	},
	{
		"id": "direct-0152",
		"job": "Black Anima [Katana]",
		"sourceJob": "흑영(도)",
		"name": "[Chain Form] 1~4",
		"sourceName": "[연식] 1~4",
		"skillId": null,
		"skillIds": [
			1521001,
			1521002,
			1521003,
			1521004
		],
		"effectId": 13016324,
		"effectIds": [
			13016324,
			13016325,
			13016326,
			13016328
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0153",
		"job": "Black Anima [Katana]",
		"sourceJob": "흑영(도)",
		"name": "Shadow Blade",
		"sourceName": "그림자 칼날",
		"skillId": 1411056,
		"skillIds": [
			1411056
		],
		"effectId": 13017230,
		"effectIds": [
			13017230
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0154",
		"job": "Black Anima [Katana]",
		"sourceJob": "흑영(도)",
		"name": "Shadow Tear",
		"sourceName": "그림자 찢기",
		"skillId": 1414055,
		"skillIds": [
			1414055
		],
		"effectId": 27801801,
		"effectIds": [
			27801801
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7500,
		"perLevel": 1500
	},
	{
		"id": "direct-0155",
		"job": "Black Anima [Katana]",
		"sourceJob": "흑영(도)",
		"name": "Shadow Sword",
		"sourceName": "그림자 검",
		"skillId": 1416055,
		"skillIds": [
			1416055
		],
		"effectId": 27802001,
		"effectIds": [
			27802001
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0156",
		"job": "Black Anima [Katana]",
		"sourceJob": "흑영(도)",
		"name": "Shadow Dance",
		"sourceName": "그림자 춤",
		"skillId": 1417055,
		"skillIds": [
			1417055
		],
		"effectId": 27802101,
		"effectIds": [
			27802101
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4250,
		"perLevel": 850
	},
	{
		"id": "direct-0157",
		"job": "Black Anima [Katana]",
		"sourceJob": "흑영(도)",
		"name": "Shadow Whirlwind (Gust)",
		"sourceName": "그림자 돌풍",
		"skillId": 1411060,
		"skillIds": [
			1411060
		],
		"effectId": 13016323,
		"effectIds": [
			13016323
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0158",
		"job": "Black Anima [Katana]",
		"sourceJob": "흑영(도)",
		"name": "Shadow Ambush",
		"sourceName": "그림자 암습",
		"skillId": 1411155,
		"skillIds": [
			1411155
		],
		"effectId": 13111935,
		"effectIds": [
			13111935
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0159",
		"job": "Black Anima [Lantern]",
		"sourceJob": "흑영(옥)",
		"name": "[Infinity] Shadow of Extinction",
		"sourceName": "[인피니티] 소멸의 그림자",
		"skillId": 1802419,
		"skillIds": [
			1802419
		],
		"effectId": 27802412,
		"effectIds": [
			27802412
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1000,
		"perLevel": 500
	},
	{
		"id": "direct-0160",
		"job": "Black Anima [Lantern]",
		"sourceJob": "흑영(옥)",
		"name": "Shadow of Darkness",
		"sourceName": "칠흑의 그림자",
		"skillId": 1410055,
		"skillIds": [
			1410055
		],
		"effectId": 27801401,
		"effectIds": [
			27801401
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0161",
		"job": "Black Anima [Lantern]",
		"sourceJob": "흑영(옥)",
		"name": "Shadow of Fascination",
		"sourceName": "매혹의 그림자",
		"skillId": 1411055,
		"skillIds": [
			1411055
		],
		"effectId": 27801501,
		"effectIds": [
			27801501
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0162",
		"job": "Black Anima [Lantern]",
		"sourceJob": "흑영(옥)",
		"name": "Shadow of Stiffness",
		"sourceName": "경직의 그림자",
		"skillId": 1413055,
		"skillIds": [
			1413055
		],
		"effectId": 27801701,
		"effectIds": [
			27801701
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0163",
		"job": "Black Anima [Lantern]",
		"sourceJob": "흑영(옥)",
		"name": "Shadow of Rage",
		"sourceName": "분노의 그림자",
		"skillId": 1412055,
		"skillIds": [
			1412055
		],
		"effectId": 27801601,
		"effectIds": [
			27801601,
			27801611
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0164",
		"job": "Demigod [Divine]",
		"sourceJob": "데미갓(신성)",
		"name": "[Infinity] Zivinu",
		"sourceName": "[인피니티] 지비누",
		"skillId": 1802421,
		"skillIds": [
			1802421
		],
		"effectId": 25901151,
		"effectIds": [
			25901151,
			25901152,
			25901153,
			25901154
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 500
	},
	{
		"id": "direct-0165",
		"job": "Demigod [Divine]",
		"sourceJob": "데미갓(신성)",
		"name": "Lansar",
		"sourceName": "란샤르",
		"skillId": 1759103,
		"skillIds": [
			1759103
		],
		"effectId": 25901138,
		"effectIds": [
			25901138
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0166",
		"job": "Demigod [Divine]",
		"sourceJob": "데미갓(신성)",
		"name": "Puria",
		"sourceName": "퓨리아",
		"skillId": 1759106,
		"skillIds": [
			1759106
		],
		"effectId": 25901143,
		"effectIds": [
			25901143
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0167",
		"job": "Demigod [Divine]",
		"sourceJob": "데미갓(신성)",
		"name": "Gloria",
		"sourceName": "글로리아",
		"skillId": 1759107,
		"skillIds": [
			1759107
		],
		"effectId": 21505300,
		"effectIds": [
			21505300
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1400
	},
	{
		"id": "direct-0168",
		"job": "Demigod [Divine]",
		"sourceJob": "데미갓(신성)",
		"name": "Kortar",
		"sourceName": "코르타르",
		"skillId": 1759105,
		"skillIds": [
			1759105
		],
		"effectId": 21505293,
		"effectIds": [
			21505293
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0169",
		"job": "Demigod [Divine]",
		"sourceJob": "데미갓(신성)",
		"name": "Huina",
		"sourceName": "후이나",
		"skillId": 1760101,
		"skillIds": [
			1760101
		],
		"effectId": 25901156,
		"effectIds": [
			25901156
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0170",
		"job": "Demigod [Divine]",
		"sourceJob": "데미갓(신성)",
		"name": "Matar",
		"sourceName": "마타르",
		"skillId": 1760102,
		"skillIds": [
			1760102
		],
		"effectId": 25901158,
		"effectIds": [
			25901158
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0171",
		"job": "Demigod [Rage]",
		"sourceJob": "데미갓(분노)",
		"name": "[Infinity] Zivinu",
		"sourceName": "[인피니티] 지비누",
		"skillId": 1802421,
		"skillIds": [
			1802421
		],
		"effectId": 25901151,
		"effectIds": [
			25901151,
			25901152,
			25901153,
			25901154
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 500
	},
	{
		"id": "direct-0172",
		"job": "Demigod [Rage]",
		"sourceJob": "데미갓(분노)",
		"name": "Lansar",
		"sourceName": "란샤르",
		"skillId": 1759103,
		"skillIds": [
			1759103
		],
		"effectId": 25901137,
		"effectIds": [
			25901137
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0173",
		"job": "Demigod [Rage]",
		"sourceJob": "데미갓(분노)",
		"name": "Puria",
		"sourceName": "퓨리아",
		"skillId": 1759106,
		"skillIds": [
			1759106
		],
		"effectId": 25901142,
		"effectIds": [
			25901142
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0174",
		"job": "Demigod [Rage]",
		"sourceJob": "데미갓(분노)",
		"name": "Gloria",
		"sourceName": "글로리아",
		"skillId": 1759107,
		"skillIds": [
			1759107
		],
		"effectId": 25901145,
		"effectIds": [
			25901145
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0175",
		"job": "Demigod [Rage]",
		"sourceJob": "데미갓(분노)",
		"name": "Kortar",
		"sourceName": "코르타르",
		"skillId": 1759105,
		"skillIds": [
			1759105
		],
		"effectId": 25901140,
		"effectIds": [
			25901140
		],
		"coefficientSource": "effect",
		"baseCoefficient": 8000,
		"perLevel": 1600
	},
	{
		"id": "direct-0176",
		"job": "Demigod [Rage]",
		"sourceJob": "데미갓(분노)",
		"name": "Huina",
		"sourceName": "후이나",
		"skillId": 1760101,
		"skillIds": [
			1760101
		],
		"effectId": 25901156,
		"effectIds": [
			25901156
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0177",
		"job": "Demigod [Rage]",
		"sourceJob": "데미갓(분노)",
		"name": "Krenj",
		"sourceName": "크렌치",
		"skillId": 1759109,
		"skillIds": [
			1759109
		],
		"effectId": 25901149,
		"effectIds": [
			25901149
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0178",
		"job": "Demigod [Rage]",
		"sourceJob": "데미갓(분노)",
		"name": "Matar",
		"sourceName": "마타르",
		"skillId": 1760102,
		"skillIds": [
			1760102
		],
		"effectId": 25901147,
		"effectIds": [
			25901147
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0179",
		"job": "Agni",
		"sourceJob": "아그니",
		"name": "[Infinity] Meltdown",
		"sourceName": "[인피니티] 멜트 다운",
		"skillId": 1802422,
		"skillIds": [
			1802422
		],
		"effectId": 30500311,
		"effectIds": [
			30500311,
			30501311
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 500
	},
	{
		"id": "direct-0180",
		"job": "Agni",
		"sourceJob": "아그니",
		"name": "Titan Swing",
		"sourceName": "기간틱 스윙",
		"skillId": 1801301,
		"skillIds": [
			1801301
		],
		"effectId": 30501301,
		"effectIds": [
			30501301
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3000,
		"perLevel": 600
	},
	{
		"id": "direct-0181",
		"job": "Agni",
		"sourceJob": "아그니",
		"name": "Titan Slash",
		"sourceName": "기간틱 슬래시",
		"skillId": 1801302,
		"skillIds": [
			1801302
		],
		"effectId": 30500302,
		"effectIds": [
			30500302
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3050,
		"perLevel": 610
	},
	{
		"id": "direct-0182",
		"job": "Agni",
		"sourceJob": "아그니",
		"name": "Titan Strike",
		"sourceName": "기간틱 스트라이크",
		"skillId": 1801303,
		"skillIds": [
			1801303
		],
		"effectId": 30501303,
		"effectIds": [
			30501303
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7500,
		"perLevel": 1500
	},
	{
		"id": "direct-0183",
		"job": "Agni",
		"sourceJob": "아그니",
		"name": "Titan Buster",
		"sourceName": "기간틱 버스터",
		"skillId": 1801304,
		"skillIds": [
			1801304
		],
		"effectId": 30500304,
		"effectIds": [
			30500304
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0184",
		"job": "Agni",
		"sourceJob": "아그니",
		"name": "Titan Rush",
		"sourceName": "기간틱 러시",
		"skillId": 1801315,
		"skillIds": [
			1801315
		],
		"effectId": 30500305,
		"effectIds": [
			30500305
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0185",
		"job": "Agni",
		"sourceJob": "아그니",
		"name": "Flame Strike",
		"sourceName": "플레임 스트라이크",
		"skillId": 1801305,
		"skillIds": [
			1801305
		],
		"effectId": 30500306,
		"effectIds": [
			30500306
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 400
	},
	{
		"id": "direct-0186",
		"job": "Agni",
		"sourceJob": "아그니",
		"name": "Flame Shot",
		"sourceName": "플레임 샷",
		"skillId": 1801306,
		"skillIds": [
			1801306
		],
		"effectId": 30500307,
		"effectIds": [
			30500307
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1200,
		"perLevel": 240
	},
	{
		"id": "direct-0187",
		"job": "Agni",
		"sourceJob": "아그니",
		"name": "Flame Buster",
		"sourceName": "프레임 버스터",
		"skillId": 1801307,
		"skillIds": [
			1801307
		],
		"effectId": 30501308,
		"effectIds": [
			30501308
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6500,
		"perLevel": 1300
	},
	{
		"id": "direct-0188",
		"job": "Agni",
		"sourceJob": "아그니",
		"name": "Magma Blast",
		"sourceName": "마그마 블래스트",
		"skillId": 1801308,
		"skillIds": [
			1801308
		],
		"effectId": 30500309,
		"effectIds": [
			30500309
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0189",
		"job": "Agni",
		"sourceJob": "아그니",
		"name": "Magma Spear",
		"sourceName": "마그마 스피어",
		"skillId": 1801309,
		"skillIds": [
			1801309
		],
		"effectId": 30500310,
		"effectIds": [
			30500310
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0190",
		"job": "Agni",
		"sourceJob": "아그니",
		"name": "Inferno",
		"sourceName": "인페르노",
		"skillId": 1801312,
		"skillIds": [
			1801312
		],
		"effectId": 30500313,
		"effectIds": [
			30500313
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0191",
		"job": "Dark Chaser",
		"sourceJob": "다크체이서",
		"name": "[Infinity] Blazing",
		"sourceName": "[인피니티] 블레이징",
		"skillId": 1802423,
		"skillIds": [
			1802423
		],
		"effectId": 31504033,
		"effectIds": [
			31504033,
			31504034
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 500
	},
	{
		"id": "direct-0192",
		"job": "Dark Chaser",
		"sourceJob": "다크체이서",
		"name": "Carion Upper",
		"sourceName": "카리온 어퍼",
		"skillId": 1802301,
		"skillIds": [
			1802301
		],
		"effectId": 31004017,
		"effectIds": [
			31004017
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1500,
		"perLevel": 210
	},
	{
		"id": "direct-0193",
		"job": "Dark Chaser",
		"sourceJob": "다크체이서",
		"name": "Carion Slash",
		"sourceName": "카리온 슬래시",
		"skillId": 1802303,
		"skillIds": [
			1802303
		],
		"effectId": 31004018,
		"effectIds": [
			31004018
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1500,
		"perLevel": 210
	},
	{
		"id": "direct-0194",
		"job": "Dark Chaser",
		"sourceJob": "다크체이서",
		"name": "Carion Pierce",
		"sourceName": "카리온 피어스",
		"skillId": 1802302,
		"skillIds": [
			1802302
		],
		"effectId": 31004020,
		"effectIds": [
			31004020
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1400,
		"perLevel": 196
	},
	{
		"id": "direct-0195",
		"job": "Dark Chaser",
		"sourceJob": "다크체이서",
		"name": "Lunge",
		"sourceName": "런지",
		"skillId": 1802308,
		"skillIds": [
			1802308
		],
		"effectId": 31504021,
		"effectIds": [
			31504021
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6250,
		"perLevel": 1250
	},
	{
		"id": "direct-0196",
		"job": "Dark Chaser",
		"sourceJob": "다크체이서",
		"name": "Deadly Shot",
		"sourceName": "데들리 샷",
		"skillId": 1802310,
		"skillIds": [
			1802310
		],
		"effectId": 31504025,
		"effectIds": [
			31504025
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6500,
		"perLevel": 1300
	},
	{
		"id": "direct-0197",
		"job": "Dark Chaser",
		"sourceJob": "다크체이서",
		"name": "Sign of Death",
		"sourceName": "샤인 오브 데스",
		"skillId": 1802311,
		"skillIds": [
			1802311
		],
		"effectId": 31504026,
		"effectIds": [
			31504026
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2600,
		"perLevel": 520
	},
	{
		"id": "direct-0198",
		"job": "Dark Chaser",
		"sourceJob": "다크체이서",
		"name": "Triple Rip",
		"sourceName": "트리플 립",
		"skillId": 1802312,
		"skillIds": [
			1802312
		],
		"effectId": 31504029,
		"effectIds": [
			31504029
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6500,
		"perLevel": 1300
	},
	{
		"id": "direct-0199",
		"job": "Dark Chaser",
		"sourceJob": "다크체이서",
		"name": "Triple Cut",
		"sourceName": "트리플 컷",
		"skillId": 1802318,
		"skillIds": [
			1802318
		],
		"effectId": 21520608,
		"effectIds": [
			21520608
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0200",
		"job": "Dark Chaser",
		"sourceJob": "다크체이서",
		"name": "Confusion",
		"sourceName": "컨퓨전",
		"skillId": 1802313,
		"skillIds": [
			1802313
		],
		"effectId": 31504030,
		"effectIds": [
			31504030
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0201",
		"job": "Dark Chaser",
		"sourceJob": "다크체이서",
		"name": "Chain Whip",
		"sourceName": "체인 위핑",
		"skillId": null,
		"skillIds": [
			1802307,
			9990977
		],
		"effectId": 31004037,
		"effectIds": [
			31004037
		],
		"coefficientSource": "effect",
		"baseCoefficient": 9000,
		"perLevel": 1800
	},
	{
		"id": "direct-0202",
		"job": "Dark Chaser",
		"sourceJob": "다크체이서",
		"name": "Chain Swing",
		"sourceName": "체인 스윙",
		"skillId": 1802304,
		"skillIds": [
			1802304
		],
		"effectId": 31504022,
		"effectIds": [
			31504022
		],
		"coefficientSource": "effect",
		"baseCoefficient": 10000,
		"perLevel": 2000
	},
	{
		"id": "direct-0203",
		"job": "Dark Chaser",
		"sourceJob": "다크체이서",
		"name": "Chain Smash",
		"sourceName": "체인 스메싱",
		"skillId": null,
		"skillIds": [],
		"effectId": null,
		"effectIds": [],
		"coefficientSource": "fallback",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0204",
		"job": "Dark Chaser",
		"sourceJob": "다크체이서",
		"name": "Chain Burst",
		"sourceName": "체인 버스트",
		"skillId": null,
		"skillIds": [
			1802306,
			9990978
		],
		"effectId": 31004035,
		"effectIds": [
			31004035,
			31004036
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7500,
		"perLevel": 1500
	},
	{
		"id": "direct-0205",
		"job": "Shadow Walker",
		"sourceJob": "섀도우워커",
		"name": "[Infinity] Demolition",
		"sourceName": "[인피니티] 데몰리션",
		"skillId": 1802424,
		"skillIds": [
			1802424
		],
		"effectId": 14021484,
		"effectIds": [
			14021484
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 500
	},
	{
		"id": "direct-0206",
		"job": "Shadow Walker",
		"sourceJob": "섀도우워커",
		"name": "Double Pierce",
		"sourceName": "더블 피어스",
		"skillId": 1803301,
		"skillIds": [
			1803301
		],
		"effectId": 14021471,
		"effectIds": [
			14021471
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0207",
		"job": "Shadow Walker",
		"sourceJob": "섀도우워커",
		"name": "Lift Attack",
		"sourceName": "리프 어택",
		"skillId": 1803302,
		"skillIds": [
			1803302
		],
		"effectId": 31003307,
		"effectIds": [
			31003307
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0208",
		"job": "Shadow Walker",
		"sourceJob": "섀도우워커",
		"name": "[Magic Lance] Crush",
		"sourceName": "[매직랜스] 크러시",
		"skillId": 1803303,
		"skillIds": [
			1803303
		],
		"effectId": 21505250,
		"effectIds": [
			21505250
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0209",
		"job": "Shadow Walker",
		"sourceJob": "섀도우워커",
		"name": "[Magic Lance] Dark Blow",
		"sourceName": "[매직랜스] 다크 블로우",
		"skillId": 1803322,
		"skillIds": [
			1803322
		],
		"effectId": 14021478,
		"effectIds": [
			14021478
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6500,
		"perLevel": 1300
	},
	{
		"id": "direct-0210",
		"job": "Shadow Walker",
		"sourceJob": "섀도우워커",
		"name": "[Heavy Lance] Dark Blow",
		"sourceName": "[헤비랜스] 다크 블로우",
		"skillId": 1803322,
		"skillIds": [
			1803322
		],
		"effectId": 14021480,
		"effectIds": [
			14021480
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7500,
		"perLevel": 1500
	},
	{
		"id": "direct-0211",
		"job": "Shadow Walker",
		"sourceJob": "섀도우워커",
		"name": "[Magic Lance] Dark Burst",
		"sourceName": "[매직랜스] 다크 버스트",
		"skillId": 1803324,
		"skillIds": [
			1803324
		],
		"effectId": 14021476,
		"effectIds": [
			14021476
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0212",
		"job": "Shadow Walker",
		"sourceJob": "섀도우워커",
		"name": "[Heavy Lance] Dark Burst",
		"sourceName": "[헤비랜스] 다크 버스트",
		"skillId": 1803324,
		"skillIds": [
			1803324
		],
		"effectId": 14021482,
		"effectIds": [
			14021482
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7500,
		"perLevel": 1500
	},
	{
		"id": "direct-0213",
		"job": "Shadow Walker",
		"sourceJob": "섀도우워커",
		"name": "[Magic Lance] Dark Pierce",
		"sourceName": "[매직랜스] 다크 피어스",
		"skillId": 1803321,
		"skillIds": [
			1803321
		],
		"effectId": 14021474,
		"effectIds": [
			14021474
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0214",
		"job": "Shadow Walker",
		"sourceJob": "섀도우워커",
		"name": "[Heavy Lance] Dark Pierce",
		"sourceName": "[헤비랜스] 다크 피어스",
		"skillId": 1803321,
		"skillIds": [
			1803321
		],
		"effectId": 13015022,
		"effectIds": [
			13015022,
			14021700
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0215",
		"job": "Shadow Walker",
		"sourceJob": "섀도우워커",
		"name": "[Magic Lance] Spurt",
		"sourceName": "[매직랜스] 스퍼트",
		"skillId": 1803305,
		"skillIds": [
			1803305
		],
		"effectId": 13017180,
		"effectIds": [
			13017180
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0216",
		"job": "Shadow Walker",
		"sourceJob": "섀도우워커",
		"name": "[Heavy Lance] Spurt",
		"sourceName": "[헤비랜스] 스퍼트",
		"skillId": 1803305,
		"skillIds": [
			1803305
		],
		"effectId": 13017183,
		"effectIds": [
			13017183
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0217",
		"job": "Shadow Walker",
		"sourceJob": "섀도우워커",
		"name": "[Magic Lance] Dark Spirit",
		"sourceName": "[매직랜스] 다크 스피릿",
		"skillId": 1803323,
		"skillIds": [
			1803323
		],
		"effectId": 14021475,
		"effectIds": [
			14021475
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0218",
		"job": "Shadow Walker",
		"sourceJob": "섀도우워커",
		"name": "[Heavy Lance] Dark Spirit",
		"sourceName": "[헤비랜스] 다크 스피릿",
		"skillId": 1803323,
		"skillIds": [
			1803323
		],
		"effectId": 13015023,
		"effectIds": [
			13015023
		],
		"coefficientSource": "effect",
		"baseCoefficient": 10000,
		"perLevel": 2000
	},
	{
		"id": "direct-0219",
		"job": "Gatekeeper",
		"sourceJob": "게이트키퍼",
		"name": "[Infinity] Brutal Rings",
		"sourceName": "[인피니티] 브르탈 링",
		"skillId": 1802425,
		"skillIds": [
			1802425
		],
		"effectId": 13025218,
		"effectIds": [
			13025218
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 500
	},
	{
		"id": "direct-0220",
		"job": "Gatekeeper",
		"sourceJob": "게이트키퍼",
		"name": "Ring Slash",
		"sourceName": "링 슬래시",
		"skillId": 1803801,
		"skillIds": [
			1803801
		],
		"effectId": 13025221,
		"effectIds": [
			13025221
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0221",
		"job": "Gatekeeper",
		"sourceJob": "게이트키퍼",
		"name": "Rising Rings",
		"sourceName": "라이징 블레이드",
		"skillId": 1803802,
		"skillIds": [
			1803802
		],
		"effectId": 13025223,
		"effectIds": [
			13025223
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0222",
		"job": "Gatekeeper",
		"sourceJob": "게이트키퍼",
		"name": "Big Foot",
		"sourceName": "빅풋",
		"skillId": 1803807,
		"skillIds": [
			1803807
		],
		"effectId": 13025229,
		"effectIds": [
			13025229
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0223",
		"job": "Gatekeeper",
		"sourceJob": "게이트키퍼",
		"name": "Gates of Arcane",
		"sourceName": "아케인 게이트",
		"skillId": 1803804,
		"skillIds": [
			1803804
		],
		"effectId": 13025226,
		"effectIds": [
			13025226
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0224",
		"job": "Gatekeeper",
		"sourceJob": "게이트키퍼",
		"name": "Twirling Shot",
		"sourceName": "터닝 샷",
		"skillId": 1803806,
		"skillIds": [
			1803806
		],
		"effectId": 13025228,
		"effectIds": [
			13025228
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0225",
		"job": "Gatekeeper",
		"sourceJob": "게이트키퍼",
		"name": "Mystic Gate",
		"sourceName": "미스틱 게이트",
		"skillId": 1803811,
		"skillIds": [
			1803811
		],
		"effectId": 13111941,
		"effectIds": [
			13111941
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7500,
		"perLevel": 1500
	},
	{
		"id": "direct-0226",
		"job": "Sword Saint",
		"sourceJob": "검성",
		"name": "Battojutsu · Phantom Slash",
		"sourceName": "발도·귀신사냥",
		"skillId": null,
		"skillIds": [
			1804080,
			9990990
		],
		"effectId": null,
		"effectIds": [],
		"coefficientSource": "fallback",
		"baseCoefficient": 9000,
		"perLevel": 1600
	},
	{
		"id": "direct-0227",
		"job": "Sword Saint",
		"sourceJob": "검성",
		"name": "Battojutsu · Wave Slash",
		"sourceName": "발도·물결베기",
		"skillId": 1804070,
		"skillIds": [
			1804070
		],
		"effectId": 13017004,
		"effectIds": [
			13017004
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5200,
		"perLevel": 1040
	},
	{
		"id": "direct-0228",
		"job": "Sword Saint",
		"sourceJob": "검성",
		"name": "Battojutsu · Tempest Slash",
		"sourceName": "발도·폭풍참",
		"skillId": null,
		"skillIds": [
			1804060,
			9990992
		],
		"effectId": 13017021,
		"effectIds": [
			13017021
		],
		"coefficientSource": "effect",
		"baseCoefficient": 10000,
		"perLevel": 2000
	},
	{
		"id": "direct-0229",
		"job": "Sword Saint",
		"sourceJob": "검성",
		"name": "Sheathe · Misty Rain",
		"sourceName": "납도·안개비",
		"skillId": 1804100,
		"skillIds": [
			1804100
		],
		"effectId": 13016947,
		"effectIds": [
			13016947
		],
		"coefficientSource": "effect",
		"baseCoefficient": 15000,
		"perLevel": 2000
	},
	{
		"id": "direct-0230",
		"job": "Sword Saint",
		"sourceJob": "검성",
		"name": "Sheathe · Sun Shower",
		"sourceName": "납도·여우비",
		"skillId": 1804110,
		"skillIds": [
			1804110
		],
		"effectId": 13016947,
		"effectIds": [
			13016947
		],
		"coefficientSource": "effect",
		"baseCoefficient": 15000,
		"perLevel": 2000
	},
	{
		"id": "direct-0231",
		"job": "Sword Saint",
		"sourceJob": "검성",
		"name": "Battojutsu · Storm Slash",
		"sourceName": "납도·장대비",
		"skillId": null,
		"skillIds": [
			1804120,
			1804142,
			9990993
		],
		"effectId": 13016947,
		"effectIds": [
			13016947
		],
		"coefficientSource": "effect",
		"baseCoefficient": 15000,
		"perLevel": 2000
	},
	{
		"id": "direct-0232",
		"job": "Sword Saint",
		"sourceJob": "검성",
		"name": "Sheathe-Shower",
		"sourceName": "납도-소나기",
		"skillId": null,
		"skillIds": [
			1804120,
			1804142
		],
		"effectId": 13112037,
		"effectIds": [
			13112037
		],
		"coefficientSource": "effect",
		"baseCoefficient": 10000,
		"perLevel": 2000
	},
	{
		"id": "direct-0233",
		"job": "Sword Saint",
		"sourceJob": "검성",
		"name": "Dew Strike",
		"sourceName": "이슬 찌르기",
		"skillId": 1804000,
		"skillIds": [
			1804000
		],
		"effectId": 13017006,
		"effectIds": [
			13017006
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2200,
		"perLevel": 440
	},
	{
		"id": "direct-0234",
		"job": "Sword Saint",
		"sourceJob": "검성",
		"name": "Fallen Flower Dance",
		"sourceName": "낙화참",
		"skillId": 1804050,
		"skillIds": [
			1804050
		],
		"effectId": 13017007,
		"effectIds": [
			13017007
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2350,
		"perLevel": 470
	},
	{
		"id": "direct-0235",
		"job": "Sword Saint",
		"sourceJob": "검성",
		"name": "Flash Step",
		"sourceName": "섬광참",
		"skillId": 1804020,
		"skillIds": [
			1804020
		],
		"effectId": 13017008,
		"effectIds": [
			13017008
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0236",
		"job": "Sword Saint",
		"sourceJob": "검성",
		"name": "Sweeping Slash",
		"sourceName": "와류베기",
		"skillId": 1804040,
		"skillIds": [
			1804040
		],
		"effectId": 13017010,
		"effectIds": [
			13017010
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0237",
		"job": "Sword Saint",
		"sourceJob": "검성",
		"name": "Meteor Cleave",
		"sourceName": "유성 가르기",
		"skillId": 1804010,
		"skillIds": [
			1804010
		],
		"effectId": 13017107,
		"effectIds": [
			13017107
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3700,
		"perLevel": 740
	},
	{
		"id": "direct-0238",
		"job": "Sword Saint",
		"sourceJob": "검성",
		"name": "Maple Sweep",
		"sourceName": "단풍 쓸기",
		"skillId": 1804030,
		"skillIds": [
			1804030
		],
		"effectId": 13017009,
		"effectIds": [
			13017009
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4300,
		"perLevel": 860
	},
	{
		"id": "direct-0239",
		"job": "Highlander",
		"sourceJob": "하이랜더",
		"name": "Spiral Edition",
		"sourceName": "스파이럴 에디션",
		"skillId": 1000023,
		"skillIds": [
			1000023
		],
		"effectId": 21512903,
		"effectIds": [
			21512903
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3200,
		"perLevel": 640
	},
	{
		"id": "direct-0240",
		"job": "Highlander",
		"sourceJob": "하이랜더",
		"name": "Spiral Storm",
		"sourceName": "스파이럴 스톰",
		"skillId": 1001023,
		"skillIds": [
			1001023
		],
		"effectId": 21512912,
		"effectIds": [
			21512912
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3750,
		"perLevel": 750
	},
	{
		"id": "direct-0241",
		"job": "Highlander",
		"sourceJob": "하이랜더",
		"name": "Spiral Press",
		"sourceName": "스파이럴 프레스",
		"skillId": 1002023,
		"skillIds": [
			1002023
		],
		"effectId": 21512921,
		"effectIds": [
			21512921
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0242",
		"job": "Highlander",
		"sourceJob": "하이랜더",
		"name": "Spiral Rush",
		"sourceName": "스파이럴 러쉬",
		"skillId": 1010023,
		"skillIds": [
			1010023
		],
		"effectId": 21526003,
		"effectIds": [
			21526003
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0243",
		"job": "Highlander",
		"sourceJob": "하이랜더",
		"name": "Spiral Eruption",
		"sourceName": "스파이럴 이럽션",
		"skillId": 1003023,
		"skillIds": [
			1003023
		],
		"effectId": 21512932,
		"effectIds": [
			21512932
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0244",
		"job": "Highlander",
		"sourceJob": "하이랜더",
		"name": "Spiral Charge",
		"sourceName": "스파이럴 차지",
		"skillId": 1013023,
		"skillIds": [
			1013023
		],
		"effectId": 13111411,
		"effectIds": [
			13111411
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0245",
		"job": "Sword Dancer",
		"sourceJob": "소드댄서",
		"name": "Flashy Sword Play",
		"sourceName": "비연파천",
		"skillId": 1003024,
		"skillIds": [
			1003024
		],
		"effectId": 21513031,
		"effectIds": [
			21513031
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0246",
		"job": "Sword Dancer",
		"sourceJob": "소드댄서",
		"name": "Infinite Swordplay",
		"sourceName": "무한검진",
		"skillId": 1001024,
		"skillIds": [
			1001024
		],
		"effectId": 21513013,
		"effectIds": [
			21513013
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0247",
		"job": "Sword Dancer",
		"sourceJob": "소드댄서",
		"name": "Psionic Thrust",
		"sourceName": "멸천비검술",
		"skillId": 1000024,
		"skillIds": [
			1000024
		],
		"effectId": 21513001,
		"effectIds": [
			21513001
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0248",
		"job": "Sword Dancer",
		"sourceJob": "소드댄서",
		"name": "Sword Summon",
		"sourceName": "이기어검",
		"skillId": 1002024,
		"skillIds": [
			1002024
		],
		"effectId": 21513023,
		"effectIds": [
			21513023
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0249",
		"job": "Sword Dancer",
		"sourceJob": "소드댄서",
		"name": "Psionic Execution",
		"sourceName": "비연멸천공",
		"skillId": 1005024,
		"skillIds": [
			1005024
		],
		"effectId": 21513053,
		"effectIds": [
			21513053
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3750,
		"perLevel": 750
	},
	{
		"id": "direct-0250",
		"job": "Sword Dancer",
		"sourceJob": "소드댄서",
		"name": "Luminous Destruction",
		"sourceName": "비검열참",
		"skillId": 1011024,
		"skillIds": [
			1011024
		],
		"effectId": 21526132,
		"effectIds": [
			21526132
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0251",
		"job": "Terror Knight",
		"sourceJob": "테러나이트",
		"name": "Power Blitz",
		"sourceName": "파워블리츠",
		"skillId": 1000025,
		"skillIds": [
			1000025
		],
		"effectId": 25200862,
		"effectIds": [
			25200862
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1400
	},
	{
		"id": "direct-0252",
		"job": "Terror Knight",
		"sourceJob": "테러나이트",
		"name": "Strike",
		"sourceName": "스트라이크",
		"skillId": 2402603,
		"skillIds": [
			2402603
		],
		"effectId": 25200863,
		"effectIds": [
			25200863
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6600,
		"perLevel": 1320
	},
	{
		"id": "direct-0253",
		"job": "Terror Knight",
		"sourceJob": "테러나이트",
		"name": "Despair",
		"sourceName": "디스페어",
		"skillId": 1010025,
		"skillIds": [
			1010025
		],
		"effectId": 13016567,
		"effectIds": [
			13016567
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7500,
		"perLevel": 1500
	},
	{
		"id": "direct-0254",
		"job": "Terror Knight",
		"sourceJob": "테러나이트",
		"name": "Power Crash",
		"sourceName": "파워크래쉬",
		"skillId": 1002025,
		"skillIds": [
			1002025
		],
		"effectId": 25200866,
		"effectIds": [
			25200866
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0255",
		"job": "Terror Knight",
		"sourceJob": "테러나이트",
		"name": "Electric Drain",
		"sourceName": "일렉트릭 드레인",
		"skillId": 2402601,
		"skillIds": [
			2402601
		],
		"effectId": 25200869,
		"effectIds": [
			25200869,
			25200870
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0256",
		"job": "Terror Knight",
		"sourceJob": "테러나이트",
		"name": "Life Drain",
		"sourceName": "라이프드레인",
		"skillId": 1001025,
		"skillIds": [
			1001025
		],
		"effectId": 25200872,
		"effectIds": [
			25200872
		],
		"coefficientSource": "effect",
		"baseCoefficient": 1760,
		"perLevel": 352
	},
	{
		"id": "direct-0257",
		"job": "Terror Knight",
		"sourceJob": "테러나이트",
		"name": "Death Hand",
		"sourceName": "데스 헨드",
		"skillId": 1003025,
		"skillIds": [
			1003025
		],
		"effectId": 25200871,
		"effectIds": [
			25200871
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0258",
		"job": "Psykicker",
		"sourceJob": "사이키커",
		"name": "[Infighter] One-Two Punch",
		"sourceName": "[인파이터] 원투",
		"skillId": 2402706,
		"skillIds": [
			2402706
		],
		"effectId": 25200745,
		"effectIds": [
			25200745
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4900,
		"perLevel": 980
	},
	{
		"id": "direct-0259",
		"job": "Psykicker",
		"sourceJob": "사이키커",
		"name": "[Infighter] Uppercut",
		"sourceName": "[인파이터] 어퍼",
		"skillId": 1001026,
		"skillIds": [
			1001026
		],
		"effectId": 25200890,
		"effectIds": [
			25200890
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4900,
		"perLevel": 980
	},
	{
		"id": "direct-0260",
		"job": "Psykicker",
		"sourceJob": "사이키커",
		"name": "[Infighter] Uppercut [Second Motion]",
		"sourceName": "[인파이터] 어퍼 [2동작]",
		"skillId": 1001026,
		"skillIds": [
			1001026
		],
		"effectId": 25200890,
		"effectIds": [
			25200890
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4900,
		"perLevel": 980
	},
	{
		"id": "direct-0261",
		"job": "Psykicker",
		"sourceJob": "사이키커",
		"name": "[Infighter] Psychic Arts (Hook)",
		"sourceName": "[인파이터] 훅",
		"skillId": 1000026,
		"skillIds": [
			1000026
		],
		"effectId": 21513101,
		"effectIds": [
			21513101
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7500,
		"perLevel": 1500
	},
	{
		"id": "direct-0262",
		"job": "Psykicker",
		"sourceJob": "사이키커",
		"name": "[Infighter] Combination",
		"sourceName": "[인파이터] 콤비네이션",
		"skillId": 1005026,
		"skillIds": [
			1005026
		],
		"effectId": 21513141,
		"effectIds": [
			21513141
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1400
	},
	{
		"id": "direct-0263",
		"job": "Psykicker",
		"sourceJob": "사이키커",
		"name": "[Outfighter] Energy Wave",
		"sourceName": "[아웃파이터] 기공",
		"skillId": 2402705,
		"skillIds": [
			2402705
		],
		"effectId": 25200744,
		"effectIds": [
			25200744
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0264",
		"job": "Psykicker",
		"sourceJob": "사이키커",
		"name": "[Outfighter] Psychic Arts (Quake)",
		"sourceName": "[아웃파이터] 웨이브",
		"skillId": 1002026,
		"skillIds": [
			1002026
		],
		"effectId": 21513121,
		"effectIds": [
			21513121
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0265",
		"job": "Phantom Mage",
		"sourceJob": "팬텀메이지",
		"name": "Devil Scythe [Attack]",
		"sourceName": "데빌사이드 [어택]",
		"skillId": 1000027,
		"skillIds": [
			1000027
		],
		"effectId": 21513206,
		"effectIds": [
			21513206
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0266",
		"job": "Phantom Mage",
		"sourceJob": "팬텀메이지",
		"name": "Devil Scythe [Counter]",
		"sourceName": "데빌사이드 [카운터]",
		"skillId": 2402801,
		"skillIds": [
			2402801
		],
		"effectId": 25200761,
		"effectIds": [
			25200761
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0267",
		"job": "Phantom Mage",
		"sourceJob": "팬텀메이지",
		"name": "Devil Scythe [Triple]",
		"sourceName": "데빌사이드 [트리플]",
		"skillId": 2402803,
		"skillIds": [
			2402803
		],
		"effectId": 25200769,
		"effectIds": [
			25200769
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0268",
		"job": "Phantom Mage",
		"sourceJob": "팬텀메이지",
		"name": "Devil Scythe [Reap]",
		"sourceName": "데빌사이드 [립]",
		"skillId": 2402802,
		"skillIds": [
			2402802
		],
		"effectId": 25200765,
		"effectIds": [
			25200765
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0269",
		"job": "Phantom Mage",
		"sourceJob": "팬텀메이지",
		"name": "Devil Scythe [Bind]",
		"sourceName": "데빌사이드 [스틱]",
		"skillId": 1011027,
		"skillIds": [
			1011027
		],
		"effectId": 25200771,
		"effectIds": [
			25200771
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0270",
		"job": "Phantom Mage",
		"sourceJob": "팬텀메이지",
		"name": "Windmill",
		"sourceName": "윈드밀",
		"skillId": 1003027,
		"skillIds": [
			1003027
		],
		"effectId": 21513236,
		"effectIds": [
			21513236
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0271",
		"job": "Maestro",
		"sourceJob": "마에스트로",
		"name": "Largamente",
		"sourceName": "라르가멘테",
		"skillId": 1001028,
		"skillIds": [
			1001028
		],
		"effectId": 21513311,
		"effectIds": [
			21513311
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0272",
		"job": "Maestro",
		"sourceJob": "마에스트로",
		"name": "Grazioso",
		"sourceName": "그라치오조",
		"skillId": 1000028,
		"skillIds": [
			1000028
		],
		"effectId": 21513301,
		"effectIds": [
			21513301
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0273",
		"job": "Maestro",
		"sourceJob": "마에스트로",
		"name": "Feierlich",
		"sourceName": "파이어리히",
		"skillId": 1002028,
		"skillIds": [
			1002028
		],
		"effectId": 21513321,
		"effectIds": [
			21513321
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0274",
		"job": "Maestro",
		"sourceJob": "마에스트로",
		"name": "Crescendo",
		"sourceName": "크레센도",
		"skillId": 1005028,
		"skillIds": [
			1005028
		],
		"effectId": 21513351,
		"effectIds": [
			21513351
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0275",
		"job": "Maestro",
		"sourceJob": "마에스트로",
		"name": "Virtuoso",
		"sourceName": "비르투오소",
		"skillId": 1010028,
		"skillIds": [
			1010028
		],
		"effectId": 21526501,
		"effectIds": [
			21526501
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1400
	},
	{
		"id": "direct-0276",
		"job": "Maestro",
		"sourceJob": "마에스트로",
		"name": "Prestissimo",
		"sourceName": "프레스티시모",
		"skillId": 1003028,
		"skillIds": [
			1003028
		],
		"effectId": 21513331,
		"effectIds": [
			21513331
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0277",
		"job": "Rogue Master",
		"sourceJob": "로그마스터",
		"name": "[Transcendence] Shackle",
		"sourceName": "인법_교",
		"skillId": 2403004,
		"skillIds": [
			2403004
		],
		"effectId": 25200812,
		"effectIds": [
			25200812
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0278",
		"job": "Rogue Master",
		"sourceJob": "로그마스터",
		"name": "[Transcendence] Phantom",
		"sourceName": "인법_환",
		"skillId": 2403003,
		"skillIds": [
			2403003
		],
		"effectId": 21526601,
		"effectIds": [
			21526601
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0279",
		"job": "Rogue Master",
		"sourceJob": "로그마스터",
		"name": "[Transcendence] Thunder",
		"sourceName": "인법_뢰",
		"skillId": 2403002,
		"skillIds": [
			2403002
		],
		"effectId": 25200816,
		"effectIds": [
			25200816
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3800,
		"perLevel": 760
	},
	{
		"id": "direct-0280",
		"job": "Rogue Master",
		"sourceJob": "로그마스터",
		"name": "[Transcendence] Swift",
		"sourceName": "인법_속",
		"skillId": 2403001,
		"skillIds": [
			2403001
		],
		"effectId": 25200808,
		"effectIds": [
			25200808
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0281",
		"job": "Rogue Master",
		"sourceJob": "로그마스터",
		"name": "[Transcendence] False Phantom",
		"sourceName": "인법_무",
		"skillId": 1002029,
		"skillIds": [
			1002029
		],
		"effectId": 21513521,
		"effectIds": [
			21513521
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0282",
		"job": "Rogue Master",
		"sourceJob": "로그마스터",
		"name": "[Transcendence] Interruption",
		"sourceName": "인법_경",
		"skillId": 1000029,
		"skillIds": [
			1000029
		],
		"effectId": 21513501,
		"effectIds": [
			21513501,
			21513502
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0283",
		"job": "Judgment",
		"sourceJob": "저지먼트",
		"name": "Gear Slash",
		"sourceName": "기어 슬래시",
		"skillId": 1001030,
		"skillIds": [
			1001030
		],
		"effectId": 21513621,
		"effectIds": [
			21513621
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0284",
		"job": "Judgment",
		"sourceJob": "저지먼트",
		"name": "Roll Snipe",
		"sourceName": "롤 스나이핑",
		"skillId": 1005030,
		"skillIds": [
			1005030
		],
		"effectId": 21513651,
		"effectIds": [
			21513651
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0285",
		"job": "Judgment",
		"sourceJob": "저지먼트",
		"name": "Twister",
		"sourceName": "트위스터",
		"skillId": 2403101,
		"skillIds": [
			2403101
		],
		"effectId": 25200900,
		"effectIds": [
			25200900
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0286",
		"job": "Judgment",
		"sourceJob": "저지먼트",
		"name": "Snipe",
		"sourceName": "스나이핑",
		"skillId": 1000030,
		"skillIds": [
			1000030
		],
		"effectId": 21513601,
		"effectIds": [
			21513601
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1400
	},
	{
		"id": "direct-0287",
		"job": "Judgment",
		"sourceJob": "저지먼트",
		"name": "Flight Assault",
		"sourceName": "프라이트",
		"skillId": 1010030,
		"skillIds": [
			1010030
		],
		"effectId": 21526702,
		"effectIds": [
			21526702
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0288",
		"job": "Judgment",
		"sourceJob": "저지먼트",
		"name": "Trinity Force",
		"sourceName": "트리니티 포스",
		"skillId": 1004030,
		"skillIds": [
			1004030
		],
		"effectId": 21513641,
		"effectIds": [
			21513641
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0289",
		"job": "Judgment",
		"sourceJob": "저지먼트",
		"name": "Summary Judgment",
		"sourceName": "즉결심판",
		"skillId": 1006030,
		"skillIds": [
			1006030
		],
		"effectId": 21020689,
		"effectIds": [
			21020689
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3250,
		"perLevel": 650
	},
	{
		"id": "direct-0290",
		"job": "Judgment",
		"sourceJob": "저지먼트",
		"name": "Cruel Shot",
		"sourceName": "크루얼건",
		"skillId": 1011030,
		"skillIds": [
			1011030
		],
		"effectId": 21513641,
		"effectIds": [
			21513641
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0291",
		"job": "Judgment",
		"sourceJob": "저지먼트",
		"name": "J-31 Grenade",
		"sourceName": "J-31 그레네이드",
		"skillId": 1003030,
		"skillIds": [
			1003030
		],
		"effectId": 21505323,
		"effectIds": [
			21505323
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0292",
		"job": "Star Seeker",
		"sourceJob": "스타시커",
		"name": "DM-DR",
		"sourceName": "DM-DR",
		"skillId": 1005031,
		"skillIds": [
			1005031
		],
		"effectId": 21513452,
		"effectIds": [
			21513452
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0293",
		"job": "Star Seeker",
		"sourceJob": "스타시커",
		"name": "DM-GR",
		"sourceName": "DM-GR",
		"skillId": 1007031,
		"skillIds": [
			1007031
		],
		"effectId": 21513471,
		"effectIds": [
			21513471
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0294",
		"job": "Star Seeker",
		"sourceJob": "스타시커",
		"name": "DM-EMP",
		"sourceName": "DM-EMP",
		"skillId": 1011031,
		"skillIds": [
			1011031
		],
		"effectId": 21526941,
		"effectIds": [
			21526941
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0295",
		"job": "Star Seeker",
		"sourceJob": "스타시커",
		"name": "DS-DR",
		"sourceName": "DS-DR",
		"skillId": 2403201,
		"skillIds": [
			2403201
		],
		"effectId": 13111421,
		"effectIds": [
			13111421
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0296",
		"job": "Star Seeker",
		"sourceJob": "스타시커",
		"name": "DM-RS",
		"sourceName": "DM-RS",
		"skillId": 1804331,
		"skillIds": [
			1804331
		],
		"effectId": 81003617,
		"effectIds": [
			81003617
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0297",
		"job": "Jewel Star",
		"sourceJob": "쥬얼스타",
		"name": "Garnet [Red]",
		"sourceName": "가넷 [레드]",
		"skillId": 2406902,
		"skillIds": [
			2406902
		],
		"effectId": 25200837,
		"effectIds": [
			25200837
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0298",
		"job": "Jewel Star",
		"sourceJob": "쥬얼스타",
		"name": "Emerald [Green]",
		"sourceName": "에메랄드 [그린]",
		"skillId": 2406904,
		"skillIds": [
			2406904
		],
		"effectId": 13025488,
		"effectIds": [
			13025488
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0299",
		"job": "Jewel Star",
		"sourceJob": "쥬얼스타",
		"name": "Discovery [Green]",
		"sourceName": "디스커버리 [그린]",
		"skillId": 2406901,
		"skillIds": [
			2406901
		],
		"effectId": 25200840,
		"effectIds": [
			25200840
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1400
	},
	{
		"id": "direct-0300",
		"job": "Jewel Star",
		"sourceJob": "쥬얼스타",
		"name": "Amethyst [Purple]",
		"sourceName": "에메시스트 [퍼플]",
		"skillId": 2406903,
		"skillIds": [
			2406903
		],
		"effectId": 25200838,
		"effectIds": [
			25200838
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0301",
		"job": "Jewel Star",
		"sourceJob": "쥬얼스타",
		"name": "Phoenix [Rainbow]",
		"sourceName": "포에닉스 [레인보우]",
		"skillId": 2406908,
		"skillIds": [
			2406908
		],
		"effectId": 13111581,
		"effectIds": [
			13111581
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0302",
		"job": "Windia",
		"sourceJob": "윈디아",
		"name": "Wind Blade : Charge",
		"sourceName": "윈드 블레이드 : 차지",
		"skillId": 1803501,
		"skillIds": [
			1803501
		],
		"effectId": 13004883,
		"effectIds": [
			13004883
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0303",
		"job": "Windia",
		"sourceJob": "윈디아",
		"name": "Tail Wind : Charge",
		"sourceName": "테일 윈드 : 차지",
		"skillId": 1803503,
		"skillIds": [
			1803503
		],
		"effectId": 13004880,
		"effectIds": [
			13004880
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0304",
		"job": "Windia",
		"sourceJob": "윈디아",
		"name": "Wind Storm : Release",
		"sourceName": "윈드 스톰 : 릴리즈",
		"skillId": 1803505,
		"skillIds": [
			1803505
		],
		"effectId": 13004885,
		"effectIds": [
			13004885
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 400
	},
	{
		"id": "direct-0305",
		"job": "Windia",
		"sourceJob": "윈디아",
		"name": "Flying Attack : Charge",
		"sourceName": "플라잉 어택 : 차지",
		"skillId": 1803500,
		"skillIds": [
			1803500
		],
		"effectId": 13004882,
		"effectIds": [
			13004882
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0306",
		"job": "Windia",
		"sourceJob": "윈디아",
		"name": "Storm Shot : Release",
		"sourceName": "스톰 샷 : 릴리즈",
		"skillId": 1803502,
		"skillIds": [
			1803502
		],
		"effectId": 13004886,
		"effectIds": [
			13004886
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0307",
		"job": "Windia",
		"sourceJob": "윈디아",
		"name": "Gale : Charge",
		"sourceName": "게일 : 차지",
		"skillId": 1803506,
		"skillIds": [
			1803506
		],
		"effectId": 13004884,
		"effectIds": [
			13004884
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5500,
		"perLevel": 1100
	},
	{
		"id": "direct-0308",
		"job": "Windia",
		"sourceJob": "윈디아",
		"name": "Whirlwind : Release",
		"sourceName": "휠윈드 : 릴리즈",
		"skillId": 1803504,
		"skillIds": [
			1803504
		],
		"effectId": 13004887,
		"effectIds": [
			13004887
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0309",
		"job": "Rainia",
		"sourceJob": "레이니아",
		"name": "Swing Wave",
		"sourceName": "스윙웨이브",
		"skillId": 1803700,
		"skillIds": [
			1803700
		],
		"effectId": 13004980,
		"effectIds": [
			13004980
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0310",
		"job": "Rainia",
		"sourceJob": "레이니아",
		"name": "Aqua Shot",
		"sourceName": "아쿠아샷",
		"skillId": 1803707,
		"skillIds": [
			1803707
		],
		"effectId": 13004987,
		"effectIds": [
			13004987
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0311",
		"job": "Rainia",
		"sourceJob": "레이니아",
		"name": "Water Protection",
		"sourceName": "워터 프로텍트",
		"skillId": 1803703,
		"skillIds": [
			1803703
		],
		"effectId": 13004983,
		"effectIds": [
			13004983
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5000,
		"perLevel": 1000
	},
	{
		"id": "direct-0312",
		"job": "Rainia",
		"sourceJob": "레이니아",
		"name": "Big Wave",
		"sourceName": "빅웨이브",
		"skillId": 1803705,
		"skillIds": [
			1803705
		],
		"effectId": 13004985,
		"effectIds": [
			13004985
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0313",
		"job": "Rainia",
		"sourceJob": "레이니아",
		"name": "Water Cannon",
		"sourceName": "워터캐논",
		"skillId": 1803706,
		"skillIds": [
			1803706
		],
		"effectId": 13004986,
		"effectIds": [
			13004986
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0314",
		"job": "Rainia",
		"sourceJob": "레이니아",
		"name": "Maelstrom",
		"sourceName": "마엘스트롬",
		"skillId": 1803702,
		"skillIds": [
			1803702
		],
		"effectId": 13004982,
		"effectIds": [
			13004982
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4000,
		"perLevel": 800
	},
	{
		"id": "direct-0315",
		"job": "Dokkaebi",
		"sourceJob": "도깨비",
		"name": "[Infinity] Phantom Ascendance",
		"sourceName": "[인피니티] 환영귀화",
		"skillId": 1804200,
		"skillIds": [
			1804200
		],
		"effectId": 13014197,
		"effectIds": [
			13014197
		],
		"coefficientSource": "effect",
		"baseCoefficient": 2000,
		"perLevel": 500
	},
	{
		"id": "direct-0316",
		"job": "Dokkaebi",
		"sourceJob": "도깨비",
		"name": "Spirit Ascendance",
		"sourceName": "귀화",
		"skillId": 1804210,
		"skillIds": [
			1804210
		],
		"effectId": 13014190,
		"effectIds": [
			13014190
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3500,
		"perLevel": 700
	},
	{
		"id": "direct-0317",
		"job": "Dokkaebi",
		"sourceJob": "도깨비",
		"name": "Upheaval",
		"sourceName": "업화",
		"skillId": 1804270,
		"skillIds": [
			1804270
		],
		"effectId": 13014196,
		"effectIds": [
			13014196
		],
		"coefficientSource": "effect",
		"baseCoefficient": 7000,
		"perLevel": 1400
	},
	{
		"id": "direct-0318",
		"job": "Dokkaebi",
		"sourceJob": "도깨비",
		"name": "Clutch Shot",
		"sourceName": "클러치 히트",
		"skillId": 1804220,
		"skillIds": [
			1804220
		],
		"effectId": 13014191,
		"effectIds": [
			13014191
		],
		"coefficientSource": "effect",
		"baseCoefficient": 3300,
		"perLevel": 660
	},
	{
		"id": "direct-0319",
		"job": "Dokkaebi",
		"sourceJob": "도깨비",
		"name": "Home Run !",
		"sourceName": "홈 런 !",
		"skillId": 1804230,
		"skillIds": [
			1804230
		],
		"effectId": 13014192,
		"effectIds": [
			13014192
		],
		"coefficientSource": "effect",
		"baseCoefficient": 6000,
		"perLevel": 1200
	},
	{
		"id": "direct-0320",
		"job": "Dokkaebi",
		"sourceJob": "도깨비",
		"name": "Cycling Heatwave",
		"sourceName": "사이클링 히트",
		"skillId": 1804240,
		"skillIds": [
			1804240
		],
		"effectId": 13014193,
		"effectIds": [
			13014193
		],
		"coefficientSource": "effect",
		"baseCoefficient": 5300,
		"perLevel": 1060
	},
	{
		"id": "direct-0321",
		"job": "Dokkaebi",
		"sourceJob": "도깨비",
		"name": "Shapeshifting",
		"sourceName": "신출귀몰",
		"skillId": 1804250,
		"skillIds": [
			1804250
		],
		"effectId": 13014194,
		"effectIds": [
			13014194
		],
		"coefficientSource": "effect",
		"baseCoefficient": 4500,
		"perLevel": 900
	},
	{
		"id": "direct-0322",
		"job": "All Classes",
		"sourceJob": "직업 공용",
		"name": "[Awakening] Legend I",
		"sourceName": "[각성] 레전드 1",
		"skillId": null,
		"skillIds": [
			3802407,
			3802507,
			3802607,
			3802707,
			3802807,
			3802907,
			3803007,
			3803107,
			3803207,
			3803607,
			3803707,
			3803807,
			3803907,
			3804007,
			3804107,
			3804207,
			3804307,
			3804407,
			3804507,
			3804907,
			3805207,
			3805607,
			3806007,
			3806407,
			3806807,
			3806907,
			3807307,
			3807407,
			3807507,
			3807807,
			3808107,
			3808207,
			3808307
		],
		"effectId": 13014320,
		"effectIds": [
			13014320,
			13014321
		],
		"coefficientSource": "effect",
		"baseCoefficient": 39700,
		"perLevel": 300
	},
	{
		"id": "direct-0323",
		"job": "All Classes",
		"sourceJob": "직업 공용",
		"name": "Legend II",
		"sourceName": "레전드 2",
		"skillId": null,
		"skillIds": [
			3812407,
			3812507,
			3812607,
			3812707,
			3812807,
			3812907,
			3813007,
			3813107,
			3813207,
			3813607,
			3813707,
			3813807,
			3813907,
			3814007,
			3814107,
			3814207,
			3814307,
			3814407,
			3814507,
			3814907,
			3815207,
			3815607,
			3816007,
			3816407,
			3816807,
			3816907,
			3817307,
			3817407,
			3817507,
			3817807,
			3818107,
			3818207,
			3818307
		],
		"effectId": 13014320,
		"effectIds": [
			13014320,
			13014321
		],
		"coefficientSource": "effect",
		"baseCoefficient": 39700,
		"perLevel": 300
	},
	{
		"id": "direct-0324",
		"job": "All Classes",
		"sourceJob": "직업 공용",
		"name": "[Awakening] Core",
		"sourceName": "[각성] 코어",
		"skillId": null,
		"skillIds": [
			3802404,
			3802504,
			3802604,
			3802704,
			3802804,
			3802904,
			3803004,
			3803104,
			3803204,
			3803604,
			3803704,
			3803804,
			3803904,
			3804004,
			3804104,
			3804204,
			3804304,
			3804404,
			3804504,
			3804904,
			3805204,
			3805604,
			3806004,
			3806404,
			3806804,
			3806904,
			3807304,
			3807404,
			3807504,
			3807804,
			3808104,
			3808204,
			3808304
		],
		"effectId": 13111971,
		"effectIds": [
			13014258,
			13018138,
			13111971,
			13111972,
			13111973,
			13111974,
			13111977,
			13111978,
			13111981,
			13111982,
			13111986,
			13111988,
			13111989,
			13111990,
			13111992,
			13111993,
			13111995,
			13111996,
			13112000,
			13112031,
			13112034,
			13112049
		],
		"coefficientSource": "effect",
		"baseCoefficient": 29850,
		"perLevel": 150
	},
	{
		"id": "direct-0325",
		"job": "All Classes",
		"sourceJob": "직업 공용",
		"name": "Milky Way, Yukina Added Damage",
		"sourceName": "밀키웨이, 유키나 추가대미지",
		"skillId": null,
		"skillIds": [
			10501,
			11003
		],
		"effectId": null,
		"effectIds": [],
		"coefficientSource": "fallback",
		"baseCoefficient": 4000,
		"perLevel": 0
	}
]);

export const PLACEMENT_SKILLS = Object.freeze([
	{
		"id": "placement-0001",
		"job": "Hero [Greatsword]",
		"sourceJob": "히어로 (검)",
		"name": "Cross Slash",
		"sourceName": "십자베기",
		"skillId": 1107025,
		"skillIds": [
			1107025
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.1,
		"strengthPerLevel": 0.02,
		"totalBase": 1.2575,
		"totalPerLevel": 0.0425
	},
	{
		"id": "placement-0002",
		"job": "Hero [Spear]",
		"sourceJob": "히어로 (창)",
		"name": "Lightning Lance",
		"sourceName": "라이트닝 랜스",
		"skillId": 1212007,
		"skillIds": [
			1212007
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.2,
		"strengthPerLevel": 0.02,
		"totalBase": 1.4,
		"totalPerLevel": 0.05
	},
	{
		"id": "placement-0003",
		"job": "Blade Master",
		"sourceJob": "검호",
		"name": "Canine Blade",
		"sourceName": "케나인 블레이드",
		"skillId": 1210105,
		"skillIds": [
			1210105
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.1,
		"strengthPerLevel": 0.02,
		"totalBase": 1.305,
		"totalPerLevel": 0.0475
	},
	{
		"id": "placement-0004",
		"job": "Savior [Longsword]",
		"sourceJob": "세이버 (검)",
		"name": "Sword Breath",
		"sourceName": "소드브레스",
		"skillId": 1210004,
		"skillIds": [
			1210004
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.1,
		"strengthPerLevel": 0.02,
		"totalBase": 1.245,
		"totalPerLevel": 0.0475
	},
	{
		"id": "placement-0005",
		"job": "Savior [Mace]",
		"sourceJob": "세이버 (둔기)",
		"name": "Hammer Typhoon",
		"sourceName": "해머타이푼",
		"skillId": 1109406,
		"skillIds": [
			1109406
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.26,
		"strengthPerLevel": 0.02,
		"totalBase": 1.6225,
		"totalPerLevel": 0.0525
	},
	{
		"id": "placement-0006",
		"job": "Sefirot",
		"sourceJob": "세피로트",
		"name": "Earth Crash",
		"sourceName": "대지파열",
		"skillId": 1210002,
		"skillIds": [
			1210002
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.2,
		"strengthPerLevel": 0.02,
		"totalBase": 1.415,
		"totalPerLevel": 0.045
	},
	{
		"id": "placement-0007",
		"job": "Archmage",
		"sourceJob": "아크메이지",
		"name": "Ice Flank (Summon-Type)",
		"sourceName": "아이스 플랭크",
		"skillId": 2104104,
		"skillIds": [
			2104104
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.1,
		"strengthPerLevel": 0.02,
		"totalBase": 1.2,
		"totalPerLevel": 0.05
	},
	{
		"id": "placement-0008",
		"job": "Pop Star",
		"sourceJob": "파픈스타",
		"name": "Electric Wave",
		"sourceName": "일렉트릭 웨이브",
		"skillId": null,
		"skillIds": [],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.1,
		"strengthPerLevel": 0.02,
		"totalBase": 1.19,
		"totalPerLevel": 0.045
	},
	{
		"id": "placement-0009",
		"job": "Wind Stalker [Dagger]",
		"sourceJob": "윈드스토커 (단검)",
		"name": "Fan of Knives (Summon-Type)",
		"sourceName": "펜 오브 나이프",
		"skillId": 1107033,
		"skillIds": [
			1107033
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.14,
		"strengthPerLevel": 0.02,
		"totalBase": 1.315,
		"totalPerLevel": 0.0475
	},
	{
		"id": "placement-0010",
		"job": "Wind Stalker [Bow]",
		"sourceJob": "윈드스토커 (활)",
		"name": "Arrow Trap",
		"sourceName": "에로우 트랩",
		"skillId": 1210008,
		"skillIds": [
			1210008
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.2,
		"strengthPerLevel": 0.02,
		"totalBase": 1.415,
		"totalPerLevel": 0.0475
	},
	{
		"id": "placement-0011",
		"job": "Wind Stalker [Crossbow]",
		"sourceJob": "윈드스토커 (석궁)",
		"name": "Wide Shot",
		"sourceName": "와이드 샷",
		"skillId": 1105009,
		"skillIds": [
			1105009
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.1,
		"strengthPerLevel": 0.02,
		"totalBase": 1.2575,
		"totalPerLevel": 0.0425
	},
	{
		"id": "placement-0012",
		"job": "Der Freischütz",
		"sourceJob": "프라이쉬츠",
		"name": "Total Destruction",
		"sourceName": "디스트로이 홀",
		"skillId": 1108020,
		"skillIds": [
			1108020
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.22,
		"strengthPerLevel": 0.02,
		"totalBase": 1.51,
		"totalPerLevel": 0.05
	},
	{
		"id": "placement-0013",
		"job": "Swordian",
		"sourceJob": "소디언",
		"name": "Hyper Cannon",
		"sourceName": "하이퍼캐논",
		"skillId": 1212023,
		"skillIds": [
			1212023
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 82,
		"strengthBase": 1.24,
		"strengthPerLevel": 0.02,
		"totalBase": 1.5,
		"totalPerLevel": 0.05
	},
	{
		"id": "placement-0014",
		"job": "Soulless One",
		"sourceJob": "소울리스 원",
		"name": "Soul Master IV (Dark)",
		"sourceName": "소울 마스터4 (다크)",
		"skillId": 1210036,
		"skillIds": [
			1210036
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 162,
		"strengthBase": 1.26,
		"strengthPerLevel": 0.02,
		"totalBase": 1.6,
		"totalPerLevel": 0.0525
	},
	{
		"id": "placement-0015",
		"job": "Arc Master",
		"sourceJob": "아크마스터",
		"name": "Release Seal",
		"sourceName": "봉인해제",
		"skillId": null,
		"skillIds": [
			7001213,
			7001214
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.6,
		"strengthPerLevel": 0,
		"totalBase": 2.47,
		"totalPerLevel": 0
	},
	{
		"id": "placement-0016",
		"job": "Arc Master",
		"sourceJob": "아크마스터",
		"name": "Burst Card (Summon-Type)",
		"sourceName": "버스트 카드",
		"skillId": 2212004,
		"skillIds": [
			2212004
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.14,
		"strengthPerLevel": 0.02,
		"totalBase": 1.2675,
		"totalPerLevel": 0.0475
	},
	{
		"id": "placement-0017",
		"job": "Force Master",
		"sourceJob": "포스마스터",
		"name": "Sealed Monster",
		"sourceName": "봉인몬스터",
		"skillId": null,
		"skillIds": [],
		"coefficientSource": "fallback",
		"weaponCoefficient": 62,
		"strengthBase": 1.26,
		"strengthPerLevel": 0.02,
		"totalBase": 1.545,
		"totalPerLevel": 0.055
	},
	{
		"id": "placement-0018",
		"job": "Force Master",
		"sourceJob": "포스마스터",
		"name": "Special Kick (Summon-Type)",
		"sourceName": "스페셜 킥",
		"skillId": 1313250,
		"skillIds": [
			1313250
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.2,
		"strengthPerLevel": 0.02,
		"totalBase": 1.3825,
		"totalPerLevel": 0.0525
	},
	{
		"id": "placement-0019",
		"job": "Black Anima [Lantern]",
		"sourceJob": "흑영(옥)",
		"name": "Shadow of Destruction",
		"sourceName": "파괴의 그림자",
		"skillId": 1410056,
		"skillIds": [
			1410056
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.2,
		"strengthPerLevel": 0.02,
		"totalBase": 1.405,
		"totalPerLevel": 0.0475
	},
	{
		"id": "placement-0020",
		"job": "Black Anima [Katana]",
		"sourceJob": "흑영(도)",
		"name": "Shadow Blade",
		"sourceName": "그림자 칼날",
		"skillId": 1411056,
		"skillIds": [
			1411056
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.22,
		"strengthPerLevel": 0.02,
		"totalBase": 1.5025,
		"totalPerLevel": 0.0525
	},
	{
		"id": "placement-0021",
		"job": "Demigod [Divine]",
		"sourceJob": "데미갓(신성)",
		"name": "Gloria",
		"sourceName": "글로리아",
		"skillId": 1759107,
		"skillIds": [
			1759107
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 82,
		"strengthBase": 1.14,
		"strengthPerLevel": 0.02,
		"totalBase": 1.3175,
		"totalPerLevel": 0.0475
	},
	{
		"id": "placement-0022",
		"job": "Demigod [Rage]",
		"sourceJob": "데미갓(분노)",
		"name": "Gloria",
		"sourceName": "글로리아",
		"skillId": 1759107,
		"skillIds": [
			1759107
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.14,
		"strengthPerLevel": 0.02,
		"totalBase": 1.4675,
		"totalPerLevel": 0.0525
	},
	{
		"id": "placement-0023",
		"job": "Agni",
		"sourceJob": "아그니",
		"name": "Inferno",
		"sourceName": "인페르노",
		"skillId": 1801312,
		"skillIds": [
			1801312
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1,
		"strengthPerLevel": 0.02,
		"totalBase": 1.02,
		"totalPerLevel": 0.045
	},
	{
		"id": "placement-0024",
		"job": "Dark Chaser",
		"sourceJob": "다크체이서",
		"name": "Chain Burst (Summon-Type)",
		"sourceName": "체인버스트",
		"skillId": null,
		"skillIds": [
			1802306,
			9990978
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.2,
		"strengthPerLevel": 0.02,
		"totalBase": 1.41,
		"totalPerLevel": 0.05
	},
	{
		"id": "placement-0025",
		"job": "Shadow Walker",
		"sourceJob": "섀도우워커",
		"name": "Dark Spirit (Summon-Type)",
		"sourceName": "다크 스피릿",
		"skillId": 1803323,
		"skillIds": [
			1803323
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.14,
		"strengthPerLevel": 0.02,
		"totalBase": 1.3,
		"totalPerLevel": 0.05
	},
	{
		"id": "placement-0026",
		"job": "Gatekeeper",
		"sourceJob": "게이트키퍼",
		"name": "Twisted Rings",
		"sourceName": "트위스트 링",
		"skillId": 1803805,
		"skillIds": [
			1803805
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.1,
		"strengthPerLevel": 0.02,
		"totalBase": 1.15,
		"totalPerLevel": 0.052
	},
	{
		"id": "placement-0027",
		"job": "Sword Saint",
		"sourceJob": "검성",
		"name": "Battojutsu - Storm Slash",
		"sourceName": "납도 - 장대비",
		"skillId": null,
		"skillIds": [
			1804120,
			1804142,
			9990993
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 62,
		"strengthBase": 1.5,
		"strengthPerLevel": 0.02,
		"totalBase": 2.3,
		"totalPerLevel": 0
	},
	{
		"id": "placement-0028",
		"job": "Highlander",
		"sourceJob": "하이랜더",
		"name": "Spiral Summon",
		"sourceName": "스파이럴 서먼",
		"skillId": 1011023,
		"skillIds": [
			1011023
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 62,
		"strengthBase": 1.1,
		"strengthPerLevel": 0.02,
		"totalBase": 1.22,
		"totalPerLevel": 0.0475
	},
	{
		"id": "placement-0029",
		"job": "Sword Dancer",
		"sourceJob": "소드댄서",
		"name": "Ritualistic Dance",
		"sourceName": "화령검무",
		"skillId": 1010024,
		"skillIds": [
			1010024
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 62,
		"strengthBase": 1.2,
		"strengthPerLevel": 0.02,
		"totalBase": 1.4475,
		"totalPerLevel": 0.0525
	},
	{
		"id": "placement-0030",
		"job": "Terror Knight",
		"sourceJob": "테러나이트",
		"name": "Chaos Zone",
		"sourceName": "카오스존",
		"skillId": null,
		"skillIds": [
			1011025,
			2402606
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.2,
		"strengthPerLevel": 0.02,
		"totalBase": 1.47,
		"totalPerLevel": 0.05
	},
	{
		"id": "placement-0031",
		"job": "Psykicker",
		"sourceJob": "사이키커",
		"name": "Psychic Arts (Crack)",
		"sourceName": "사이킥 아츠 크랙",
		"skillId": 1010026,
		"skillIds": [
			1010026
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.2,
		"strengthPerLevel": 0.02,
		"totalBase": 1.4025,
		"totalPerLevel": 0.0475
	},
	{
		"id": "placement-0032",
		"job": "Phantom Mage",
		"sourceJob": "팬텀메이지",
		"name": "Spirit of the Reaper",
		"sourceName": "사신의 기운",
		"skillId": 1010027,
		"skillIds": [
			1010027
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.1,
		"strengthPerLevel": 0.02,
		"totalBase": 1.1925,
		"totalPerLevel": 0.0525
	},
	{
		"id": "placement-0033",
		"job": "Maestro",
		"sourceJob": "마에스트로",
		"name": "Passionato",
		"sourceName": "파쇼나토",
		"skillId": null,
		"skillIds": [
			1011028,
			1012028
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 62,
		"strengthBase": 1.1,
		"strengthPerLevel": 0.02,
		"totalBase": 1.255,
		"totalPerLevel": 0.045
	},
	{
		"id": "placement-0034",
		"job": "Judgment",
		"sourceJob": "저지먼트",
		"name": "Twister",
		"sourceName": "트위스터",
		"skillId": 2403101,
		"skillIds": [
			2403101
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 62,
		"strengthBase": 1.2,
		"strengthPerLevel": 0.02,
		"totalBase": 1.4675,
		"totalPerLevel": 0.0525
	},
	{
		"id": "placement-0035",
		"job": "Rogue Master",
		"sourceJob": "로그마스터",
		"name": "[Transcendence] Chaos",
		"sourceName": "인법 난",
		"skillId": 2403005,
		"skillIds": [
			2403005
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.1,
		"strengthPerLevel": 0.02,
		"totalBase": 1.255,
		"totalPerLevel": 0.045
	},
	{
		"id": "placement-0036",
		"job": "Star Seeker",
		"sourceJob": "스타시커",
		"name": "Elmei",
		"sourceName": "엘메이",
		"skillId": null,
		"skillIds": [],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.16,
		"strengthPerLevel": 0.02,
		"totalBase": 1.325,
		"totalPerLevel": 0.045
	},
	{
		"id": "placement-0037",
		"job": "Star Seeker",
		"sourceJob": "스타시커",
		"name": "Turret",
		"sourceName": "터렛",
		"skillId": null,
		"skillIds": [],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.1,
		"strengthPerLevel": 0.02,
		"totalBase": 1.24,
		"totalPerLevel": 0.0475
	},
	{
		"id": "placement-0038",
		"job": "Jewel Star",
		"sourceJob": "쥬얼스타",
		"name": "Magic Square",
		"sourceName": "매직스퀘어",
		"skillId": 2406905,
		"skillIds": [
			2406905
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.14,
		"strengthPerLevel": 0.02,
		"totalBase": 1.42,
		"totalPerLevel": 0.055
	},
	{
		"id": "placement-0039",
		"job": "Windia",
		"sourceJob": "윈디아",
		"name": "Wind Storm (Summon-Type)",
		"sourceName": "윈드스톰",
		"skillId": 1803505,
		"skillIds": [
			1803505
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.2,
		"strengthPerLevel": 0.02,
		"totalBase": 1.4,
		"totalPerLevel": 0.0475
	},
	{
		"id": "placement-0040",
		"job": "Rainia",
		"sourceJob": "레이니아",
		"name": "Water Bomb",
		"sourceName": "워터봄",
		"skillId": 1803704,
		"skillIds": [
			1803704
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.16,
		"strengthPerLevel": 0.02,
		"totalBase": 1.3,
		"totalPerLevel": 0.05
	},
	{
		"id": "placement-0041",
		"job": "Archmage",
		"sourceJob": "아크메이지",
		"name": "Sky Dragon",
		"sourceName": "천룡아",
		"skillId": 2106001,
		"skillIds": [
			2106001
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 82,
		"strengthBase": 1.3,
		"strengthPerLevel": 0.02,
		"totalBase": 1.62,
		"totalPerLevel": 0.06
	},
	{
		"id": "placement-0042",
		"job": "Dokkaebi",
		"sourceJob": "도깨비",
		"name": "Sorcery : Spirit Path",
		"sourceName": "요술 : 귀도",
		"skillId": null,
		"skillIds": [],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.3,
		"strengthPerLevel": 0,
		"totalBase": 1.71,
		"totalPerLevel": 0
	},
	{
		"id": "placement-0043",
		"job": "Dokkaebi",
		"sourceJob": "도깨비",
		"name": "Night of a Hundred Demons",
		"sourceName": "백귀야행",
		"skillId": 1804260,
		"skillIds": [
			1804260
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.2,
		"strengthPerLevel": 0.02,
		"totalBase": 1.435,
		"totalPerLevel": 0.055
	},
	{
		"id": "placement-0044",
		"job": "All Classes",
		"sourceJob": "직업 공용",
		"name": "Summon-Type Core",
		"sourceName": "설치형 코어",
		"skillId": null,
		"skillIds": [
			3802404,
			3802504,
			3802604,
			3802704,
			3802804,
			3802904,
			3803004,
			3803104,
			3803204,
			3803604,
			3803704,
			3803804,
			3803904,
			3804004,
			3804104,
			3804204,
			3804304,
			3804404,
			3804504,
			3804904,
			3805204,
			3805604,
			3806004,
			3806404,
			3806804,
			3806904,
			3807304,
			3807404,
			3807504,
			3807804,
			3808104,
			3808204,
			3808304
		],
		"coefficientSource": "fallback",
		"weaponCoefficient": 42,
		"strengthBase": 1.49,
		"strengthPerLevel": 0,
		"totalBase": 2.22,
		"totalPerLevel": 0
	},
	{
		"id": "placement-0045",
		"job": "All Classes",
		"sourceJob": "직업 공용",
		"name": "Weapon Hit Effect",
		"sourceName": "무기 타격효과",
		"skillId": null,
		"skillIds": [],
		"coefficientSource": "fallback",
		"weaponCoefficient": 202,
		"strengthBase": 1,
		"strengthPerLevel": 0,
		"totalBase": 1.01,
		"totalPerLevel": 0
	}
]);

export const DUNGEONS = Object.freeze([
	{
		"id": "wings-of-icarus",
		"name": "Wings of Icarus",
		"sourceName": "이카로스의 날개",
		"normalDefense": 223554,
		"bossDefense": 223554,
		"normalDmgReduction": 2187171,
		"bossDmgReduction": 4374342
	},
	{
		"id": "likimo-pelke",
		"name": "Likimo Pelke",
		"sourceName": "리키모 펠케",
		"normalDefense": 245909,
		"bossDefense": 223554,
		"normalDmgReduction": 2296529,
		"bossDmgReduction": 4593058
	},
	{
		"id": "amaranth-nova",
		"name": "Amaranth Nova",
		"sourceName": "아마란스 노바",
		"normalDefense": 234731,
		"bossDefense": 234731,
		"normalDmgReduction": 2526181,
		"bossDmgReduction": 5052362
	},
	{
		"id": "nornirs-tear",
		"name": "Nornir's Tear",
		"sourceName": "노르니르의 눈물",
		"normalDefense": 133421,
		"bossDefense": 133421,
		"normalDmgReduction": 1243169,
		"bossDmgReduction": 3082239
	},
	{
		"id": "pleroma",
		"name": "Pleroma",
		"sourceName": "플레로마",
		"normalDefense": 146763,
		"bossDefense": 161439,
		"normalDmgReduction": 1367485,
		"bossDmgReduction": 3082239
	},
	{
		"id": "emeraldia",
		"name": "Emeraldia",
		"sourceName": "에메랄디아",
		"normalDefense": 161439,
		"bossDefense": 161439,
		"normalDmgReduction": 1504233,
		"bossDmgReduction": 3309312
	},
	{
		"id": "tower-of-challenge-30",
		"name": "Tower of Challenge 30+",
		"sourceName": "[증명의탑] 30층 이상",
		"normalDefense": 34230,
		"bossDefense": 34230,
		"normalDmgReduction": 1459472,
		"bossDmgReduction": 1459472
	}
]);

export const SUMMONS = Object.freeze([
	{
		"id": "none",
		"name": "No summon",
		"sourceName": "없음",
		"bonuses": {}
	},
	{
		"id": "super-beast",
		"name": "Super Beast (Lustral)",
		"sourceName": "초신수",
		"bonuses": {
			"normalExtraDmgFlat": 50000,
			"fixedDmgFlat": 40000,
			"minDmgFlat": 50,
			"weaponAttrFlat": 500,
			"fixedDmgPercent": 5,
			"weaponAttrPercent": 5
		}
	},
	{
		"id": "super-beast-madness",
		"name": "Super Beast (Madness Potion)",
		"sourceName": "초신수(광기)",
		"bonuses": {
			"normalExtraDmgFlat": 50000,
			"fixedDmgFlat": 40000,
			"minDmgFlat": 50,
			"weaponAttrFlat": 500,
			"fixedDmgPercent": 5,
			"weaponAttrPercent": 5,
			"critDmgFlat": 300
		}
	},
	{
		"id": "beatrice",
		"name": "Beatrice",
		"sourceName": "베아트리체",
		"bonuses": {
			"minDmgFlat": 180,
			"maxDmgFlat": 180,
			"critDmgFlat": 180,
			"minDmgPercent": 2,
			"maxDmgPercent": 2,
			"critDmgPercent": 2
		}
	},
	{
		"id": "kardian",
		"name": "Kardian",
		"sourceName": "카르디안",
		"bonuses": {
			"strMagFlat": 10000,
			"normalDomination": 15,
			"normalExtraDmgFlat": 375000,
			"normalExtraDmgPercent": 60
		}
	},
	{
		"id": "erazer",
		"name": "Erazer",
		"sourceName": "이레이저",
		"bonuses": {
			"strMagFlat": 10000,
			"bossDomination": 15,
			"bossExtraDmgFlat": 375000,
			"bossExtraDmgPercent": 60
		}
	},
	{
		"id": "yunia",
		"name": "Yunia",
		"sourceName": "유니아",
		"bonuses": {
			"strMagFlat": 20000,
			"strMagPercent": 20
		}
	},
	{
		"id": "richring",
		"name": "Richring",
		"sourceName": "리치링",
		"bonuses": {
			"normalExtraDmgFlat": 25000,
			"bossExtraDmgFlat": 25000
		}
	},
	{
		"id": "aria",
		"name": "Aria",
		"sourceName": "아리아",
		"bonuses": {
			"critDmgFlat": 100
		}
	}
]);

export const DEFAULT_SPEC_INPUTS = Object.freeze({
	"strMagFlat": 914852,
	"strMagPercent": 443,
	"weaponAttrFlat": 8685,
	"weaponAttrPercent": 291,
	"critDmgFlat": 5260,
	"critDmgPercent": 41,
	"minDmgFlat": 4449,
	"minDmgPercent": 39,
	"maxDmgFlat": 5327,
	"maxDmgPercent": 36,
	"fixedDmgFlat": 390313,
	"fixedDmgPercent": 82,
	"normalExtraDmgFlat": 664341,
	"normalExtraDmgPercent": 14,
	"bossExtraDmgFlat": 601314,
	"bossExtraDmgPercent": 15,
	"normalDomination": 63.1,
	"bossDomination": 57.4,
	"penetration": 99,
	"placementCoreLevel": 19,
	"backAttackDmg": 242,
	"strMagEfficiency": 3,
	"physicalJob": true,
	"summonId": "super-beast"
});

export const DEFAULT_ENCHANT_OPTION = Object.freeze({
	"minDmg": 0,
	"maxDmg": 0,
	"critDmg": 0,
	"finalMinDmg": 0,
	"finalMaxDmg": 0,
	"finalCritDmg": 0,
	"strMagAll": 0,
	"strMagAllPercent": 0,
	"strMagEfficiency": 0,
	"weaponAttr": 0,
	"weaponAttrPercent": 0,
	"fixedDmg": 0,
	"fixedDmgPercent": 0,
	"normalDmgPercent": 0,
	"bossDmgPercent": 0,
	"normalDomination": 0,
	"bossDomination": 0,
	"backAttackDmg": 0,
	"directHitSkillLevel": 0,
	"placementSkillLevel": 0,
	"hpPercent": 0,
	"stamina": 0
});

export const DEFAULT_SPEC_CALCULATION_SETTINGS = Object.freeze({
	"useCustomDungeonStats": false,
	"customNormalDefense": 0,
	"customBossDefense": 0,
	"customNormalDmgReduction": 0,
	"customBossDmgReduction": 0,
	"damageMode": "average",
	"referenceStat": "crit",
	"backAttackRate": 0
});

export const DEFAULT_SPEC_SELECTIONS = Object.freeze({
	"jobId": "star-seeker",
	"directSkillId": "direct-0295",
	"directSkillLevel": 0,
	"placementSkillId": "placement-0036",
	"placementSkillLevel": 0,
	"dungeonId": "wings-of-icarus",
	"summonId": "super-beast"
});
