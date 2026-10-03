// Public reference data from https://latale.wiki/tools/spec-analyzer, retrieved 2026-10-03.
// Source bundles: 0yzpm1nj2syg9.js, 1513ulejjkm_5.js, 419nsmuct826j.js.
export const DEFAULT_BASE_STATS = {
  "strMagPlus": 914852,
  "strMagPercent": 443,
  "weaponAttrPlus": 8685,
  "weaponAttrPercent": 291,
  "critDmgPlus": 5260,
  "critDmgPercent": 41,
  "minDmgPlus": 4449,
  "minDmgPercent": 39,
  "maxDmgPlus": 5327,
  "maxDmgPercent": 36,
  "fixedDmgPlus": 390313,
  "fixedDmgPercent": 82,
  "normalExtraDmgPlus": 664341,
  "normalExtraDmgPercent": 14,
  "bossExtraDmgPlus": 601314,
  "bossExtraDmgPercent": 15,
  "normalDomination": 63.1,
  "bossDomination": 57.4,
  "penetration": 99,
  "placementCoreLevel": 19,
  "backAttackDmg": 242,
  "strMagEfficiency": 3,
  "isPhysicalJob": true
};

export const DEFAULT_ENCHANT_OPTION = {
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
};

export const DEFAULT_SPEC_CALCULATION_SETTINGS = {
  "useCustomDungeonStats": false,
  "customNormalDefense": 0,
  "customBossDefense": 0,
  "customNormalDmgReduction": 0,
  "customBossDmgReduction": 0,
  "damageMode": "average",
  "referenceStat": "crit",
  "backAttackRate": 0,
  "useCustomDirectHitCoef": false,
  "customDirectHitCoef": 0,
  "useCustomPlacementCoefs": false,
  "customPlacementWeaponAttrCoef": 0,
  "customPlacementStrMagMult": 0,
  "customPlacementTotalMult": 0
};

export const directHitSkills = [
  {
    "id": "direct-0001",
    "skillId": 1802401,
    "skillIds": [
      1802401
    ],
    "effectId": 21508502,
    "effectIds": [
      21508502
    ],
    "job": "히어로 (검)",
    "name": "[인피니티] 데드·앤드",
    "internalName": "[인피니티] 데드ㆍ엔드",
    "legacyNames": [
      "[인피니티] 데드·앤드"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0002",
    "skillId": 1107005,
    "skillIds": [
      1107005
    ],
    "effectId": 21505921,
    "effectIds": [
      21505921
    ],
    "job": "히어로 (검)",
    "name": "크로스 크랙",
    "internalName": "크로스 크랙",
    "legacyNames": [
      "크로스 크랙"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1500,
    "levelIncrease": 300
  },
  {
    "id": "direct-0003",
    "skillId": 1107015,
    "skillIds": [
      1107015
    ],
    "effectId": 21406721,
    "effectIds": [
      21406721
    ],
    "job": "히어로 (검)",
    "name": "표풍일식",
    "internalName": "표풍일식",
    "legacyNames": [
      "표풍일식"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7500,
    "levelIncrease": 1500
  },
  {
    "id": "direct-0004",
    "skillId": 1212005,
    "skillIds": [
      1212005
    ],
    "effectId": 21520201,
    "effectIds": [
      21520201
    ],
    "job": "히어로 (검)",
    "name": "광풍참",
    "internalName": "광풍참",
    "legacyNames": [
      "광풍참"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0005",
    "skillId": 1210005,
    "skillIds": [
      1210005
    ],
    "effectId": 21520001,
    "effectIds": [
      21520001
    ],
    "job": "히어로 (검)",
    "name": "승천격",
    "internalName": "승천격",
    "legacyNames": [
      "승천격"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0006",
    "skillId": 1105005,
    "skillIds": [
      1105005
    ],
    "effectId": 21501322,
    "effectIds": [
      21501322
    ],
    "job": "히어로 (검)",
    "name": "미티어 웨이브",
    "internalName": "미티어 웨이브",
    "legacyNames": [
      "미티어 웨이브"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0007",
    "skillId": 1109505,
    "skillIds": [
      1109505
    ],
    "effectId": 22511301,
    "effectIds": [
      22511301
    ],
    "job": "히어로 (검)",
    "name": "천패처황참",
    "internalName": "천패처황참",
    "legacyNames": [
      "천패처황참"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1400
  },
  {
    "id": "direct-0008",
    "skillId": 1211005,
    "skillIds": [
      1211005
    ],
    "effectId": 21520101,
    "effectIds": [
      21520101
    ],
    "job": "히어로 (검)",
    "name": "천파협란",
    "internalName": "천파협란",
    "legacyNames": [
      "천파협란"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0009",
    "skillId": 1802402,
    "skillIds": [
      1802402
    ],
    "effectId": 21508602,
    "effectIds": [
      21508602
    ],
    "job": "히어로 (창)",
    "name": "[인피니티] 백화요란",
    "internalName": "[인피니티] 백화요란",
    "legacyNames": [
      "[인피니티] 백화요란"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0010",
    "skillId": 1105017,
    "skillIds": [
      1105017
    ],
    "effectId": 21503421,
    "effectIds": [
      21503421
    ],
    "job": "히어로 (창)",
    "name": "선풍",
    "internalName": "선풍",
    "legacyNames": [
      "선풍"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0011",
    "skillId": 1106007,
    "skillIds": [
      1106007
    ],
    "effectId": 21504321,
    "effectIds": [
      21504321
    ],
    "job": "히어로 (창)",
    "name": "버스터 랜스",
    "internalName": "버스터 랜스",
    "legacyNames": [
      "버스터 랜스"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0012",
    "skillId": 1105007,
    "skillIds": [
      1105007
    ],
    "effectId": 21501521,
    "effectIds": [
      21501521
    ],
    "job": "히어로 (창)",
    "name": "허리케인 랜스",
    "internalName": "허리케인 랜스",
    "legacyNames": [
      "허리케인 랜스"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0013",
    "skillId": 1109107,
    "skillIds": [
      1109107
    ],
    "effectId": 21509912,
    "effectIds": [
      21509912
    ],
    "job": "히어로 (창)",
    "name": "창룡 풍",
    "internalName": "창룡 풍(風)",
    "legacyNames": [
      "창룡 풍"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0014",
    "skillId": 1211007,
    "skillIds": [
      1211007
    ],
    "effectId": 21520401,
    "effectIds": [
      21520401
    ],
    "job": "히어로 (창)",
    "name": "추진격",
    "internalName": "추진격",
    "legacyNames": [
      "추진격"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3000,
    "levelIncrease": 600
  },
  {
    "id": "direct-0015",
    "skillId": 1210007,
    "skillIds": [
      1210007
    ],
    "effectId": 21520302,
    "effectIds": [
      21520302
    ],
    "job": "히어로 (창)",
    "name": "파워 스파이크",
    "internalName": "파워스파이크",
    "legacyNames": [
      "파워 스파이크"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0016",
    "skillId": 1109207,
    "skillIds": [
      1109207
    ],
    "effectId": 21511501,
    "effectIds": [
      21511501
    ],
    "job": "히어로 (창)",
    "name": "창룡 뢰",
    "internalName": "창룡 뢰(雷)",
    "legacyNames": [
      "창룡 뢰"
    ],
    "coefficientSource": "effect",
    "baseCoef": 9000,
    "levelIncrease": 1800
  },
  {
    "id": "direct-0017",
    "skillId": 1107027,
    "skillIds": [
      1107027
    ],
    "effectId": 22506912,
    "effectIds": [
      22506912
    ],
    "job": "히어로 (창)",
    "name": "헤비 랜스",
    "internalName": "헤비 랜스",
    "legacyNames": [
      "헤비 랜스"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3005,
    "levelIncrease": 601
  },
  {
    "id": "direct-0018",
    "skillId": 1107017,
    "skillIds": [
      1107017
    ],
    "effectId": 22516911,
    "effectIds": [
      22516911
    ],
    "job": "히어로 (창)",
    "name": "창룡승격",
    "internalName": "창룡승격",
    "legacyNames": [
      "창룡승격"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1400
  },
  {
    "id": "direct-0019",
    "skillId": 1802403,
    "skillIds": [
      1802403
    ],
    "effectId": 21508702,
    "effectIds": [
      21508702
    ],
    "job": "검호",
    "name": "[인피니티] 파라노이아",
    "internalName": "[인피니티] 파라노이아",
    "legacyNames": [
      "[인피니티] 파라노이아"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0020",
    "skillId": 1210101,
    "skillIds": [
      1210101
    ],
    "effectId": 21533205,
    "effectIds": [
      21533205
    ],
    "job": "검호",
    "name": "승천난무",
    "internalName": "승천난무",
    "legacyNames": [
      "승천난무"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0021",
    "skillId": 1210102,
    "skillIds": [
      1210102
    ],
    "effectId": 21533209,
    "effectIds": [
      21533209
    ],
    "job": "검호",
    "name": "무쌍난무",
    "internalName": "무쌍난무",
    "legacyNames": [
      "무쌍난무"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0022",
    "skillId": 1210021,
    "skillIds": [
      1210021
    ],
    "effectId": 21520701,
    "effectIds": [
      21520701
    ],
    "job": "검호",
    "name": "소울 블레이드",
    "internalName": "소울 블레이드",
    "legacyNames": [
      "소울 블레이드"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0023",
    "skillId": 1109021,
    "skillIds": [
      1109021
    ],
    "effectId": 21511202,
    "effectIds": [
      21511202
    ],
    "job": "검호",
    "name": "크로스 블레이드",
    "internalName": "크로스 블레이드",
    "legacyNames": [
      "크로스 블레이드"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0024",
    "skillId": 1210103,
    "skillIds": [
      1210103
    ],
    "effectId": 21533211,
    "effectIds": [
      21533211
    ],
    "job": "검호",
    "name": "스피릿",
    "internalName": "스피릿",
    "legacyNames": [
      "스피릿"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0025",
    "skillId": 1210105,
    "skillIds": [
      1210105
    ],
    "effectId": 13111412,
    "effectIds": [
      13111412
    ],
    "job": "검호",
    "name": "케나인 블레이드",
    "internalName": "케나인 블레이드",
    "legacyNames": [
      "케나인 블레이드"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0026",
    "skillId": 1802404,
    "skillIds": [
      1802404
    ],
    "effectId": 21508801,
    "effectIds": [
      21508801,
      21508802
    ],
    "job": "세이버 (검)",
    "name": "[인피니티]",
    "internalName": "[인피니티] 마제스틱 펜타그마",
    "legacyNames": [
      "[인피니티]"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0027",
    "skillId": 1105004,
    "skillIds": [
      1105004
    ],
    "effectId": 24501211,
    "effectIds": [
      24501211
    ],
    "job": "세이버 (검)",
    "name": "W.브레이크",
    "internalName": "W.브레이크",
    "legacyNames": [
      "W.브레이크"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2250,
    "levelIncrease": 450
  },
  {
    "id": "direct-0028",
    "skillId": 1107014,
    "skillIds": [
      1107014
    ],
    "effectId": 24506612,
    "effectIds": [
      24506612
    ],
    "job": "세이버 (검)",
    "name": "래퍼드해쉬",
    "internalName": "래퍼드해쉬",
    "legacyNames": [
      "래퍼드해쉬"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4350,
    "levelIncrease": 870
  },
  {
    "id": "direct-0029",
    "skillId": 1210004,
    "skillIds": [
      1210004
    ],
    "effectId": 21520801,
    "effectIds": [
      21520801
    ],
    "job": "세이버 (검)",
    "name": "소드브레스",
    "internalName": "소드 브레스",
    "legacyNames": [
      "소드브레스"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0030",
    "skillId": 1107004,
    "skillIds": [
      1107004
    ],
    "effectId": 21505821,
    "effectIds": [
      21505821
    ],
    "job": "세이버 (검)",
    "name": "데스 블로우",
    "internalName": "데스블로우",
    "legacyNames": [
      "데스 블로우"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0031",
    "skillId": 1106101,
    "skillIds": [
      1106101
    ],
    "effectId": 24502101,
    "effectIds": [
      24502101
    ],
    "job": "세이버 (검)",
    "name": "스플래쉬 펀트",
    "internalName": "스플래쉬 펀트",
    "legacyNames": [
      "스플래쉬 펀트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0032",
    "skillId": 1211102,
    "skillIds": [
      1211102
    ],
    "effectId": 14021425,
    "effectIds": [
      14021425
    ],
    "job": "세이버 (검)",
    "name": "쉴드차지",
    "internalName": "쉴드 차지 [둔기]",
    "legacyNames": [
      "쉴드차지"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3000,
    "levelIncrease": 600
  },
  {
    "id": "direct-0033",
    "skillId": 1106102,
    "skillIds": [
      1106102
    ],
    "effectId": 24502111,
    "effectIds": [
      24502111
    ],
    "job": "세이버 (검)",
    "name": "쉴드부메랑",
    "internalName": "쉴드 부메랑 [한손검]",
    "legacyNames": [
      "쉴드부메랑"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0034",
    "skillId": 1109304,
    "skillIds": [
      1109304
    ],
    "effectId": 24507611,
    "effectIds": [
      24507611
    ],
    "job": "세이버 (검)",
    "name": "가드러쉬",
    "internalName": "가드 러쉬",
    "legacyNames": [
      "가드러쉬"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3200,
    "levelIncrease": 640
  },
  {
    "id": "direct-0035",
    "skillId": 1802406,
    "skillIds": [
      1802406
    ],
    "effectId": 21509501,
    "effectIds": [
      21509501,
      21509511
    ],
    "job": "세이버 (둔기)",
    "name": "[인피니티] 헤븐앤헬",
    "internalName": "[인피니티] 헤븐 앤 헬",
    "legacyNames": [
      "[인피니티] 헤븐앤헬"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5200,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0036",
    "skillId": 1211101,
    "skillIds": [
      1211101
    ],
    "effectId": 14021423,
    "effectIds": [
      14021423
    ],
    "job": "세이버 (둔기)",
    "name": "더블 히트",
    "internalName": "더블 히트",
    "legacyNames": [
      "더블 히트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0037",
    "skillId": 1211103,
    "skillIds": [
      1211103
    ],
    "effectId": 14021424,
    "effectIds": [
      14021424
    ],
    "job": "세이버 (둔기)",
    "name": "카운터 샷",
    "internalName": "카운터 샷",
    "legacyNames": [
      "카운터 샷"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1400
  },
  {
    "id": "direct-0038",
    "skillId": 1211102,
    "skillIds": [
      1211102
    ],
    "effectId": 14021425,
    "effectIds": [
      14021425
    ],
    "job": "세이버 (둔기)",
    "name": "쉴드 차지",
    "internalName": "쉴드 차지 [둔기]",
    "legacyNames": [
      "쉴드 차지"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3000,
    "levelIncrease": 600
  },
  {
    "id": "direct-0039",
    "skillId": 1106202,
    "skillIds": [
      1106202
    ],
    "effectId": 23502111,
    "effectIds": [
      23502111
    ],
    "job": "세이버 (둔기)",
    "name": "쉴드 부메랑",
    "internalName": "쉴드 부메랑 [둔기]",
    "legacyNames": [
      "쉴드 부메랑"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2400,
    "levelIncrease": 480
  },
  {
    "id": "direct-0040",
    "skillId": 1211006,
    "skillIds": [
      1211006
    ],
    "effectId": 21521202,
    "effectIds": [
      21521202
    ],
    "job": "세이버 (둔기)",
    "name": "갓 버스트",
    "internalName": "갓 버스트",
    "legacyNames": [
      "갓 버스트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0041",
    "skillId": 1802407,
    "skillIds": [
      1802407
    ],
    "effectId": 24507812,
    "effectIds": [
      24507812
    ],
    "job": "세이버 (둔기)",
    "name": "해머 크래쉬",
    "internalName": "해머 크래쉬",
    "legacyNames": [
      "해머 크래쉬"
    ],
    "coefficientSource": "effect",
    "baseCoef": 10000,
    "levelIncrease": 2000
  },
  {
    "id": "direct-0042",
    "skillId": null,
    "skillIds": [
      1210006
    ],
    "effectId": null,
    "effectIds": [],
    "job": "세이버 (둔기)",
    "name": "파워 그라인드",
    "internalName": null,
    "legacyNames": [
      "파워 그라인드"
    ],
    "coefficientSource": "fallback",
    "baseCoef": 5750,
    "levelIncrease": 1050
  },
  {
    "id": "direct-0043",
    "skillId": 1211104,
    "skillIds": [
      1211104
    ],
    "effectId": 14021427,
    "effectIds": [
      14021427
    ],
    "job": "세이버 (둔기)",
    "name": "파워 밤",
    "internalName": "파워 밤",
    "legacyNames": [
      "파워 밤"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3250,
    "levelIncrease": 650
  },
  {
    "id": "direct-0044",
    "skillId": 1802408,
    "skillIds": [
      1802408
    ],
    "effectId": 21509602,
    "effectIds": [
      21509602
    ],
    "job": "세피로트",
    "name": "[인피니티]",
    "internalName": "[인피니티] 환야마랑권",
    "legacyNames": [
      "[인피니티]"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0045",
    "skillId": 1106012,
    "skillIds": [
      1106012
    ],
    "effectId": 21504623,
    "effectIds": [
      21504623
    ],
    "job": "세피로트",
    "name": "철산고",
    "internalName": "철산고",
    "legacyNames": [
      "철산고"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0046",
    "skillId": 1107012,
    "skillIds": [
      1107012
    ],
    "effectId": 21506421,
    "effectIds": [
      21506421
    ],
    "job": "세피로트",
    "name": "쌍장타",
    "internalName": "쌍장타",
    "legacyNames": [
      "쌍장타"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0047",
    "skillId": null,
    "skillIds": [
      1100109
    ],
    "effectId": null,
    "effectIds": [],
    "job": "세피로트",
    "name": "돌려차기",
    "internalName": null,
    "legacyNames": [
      "돌려차기"
    ],
    "coefficientSource": "fallback",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0048",
    "skillId": 1100112,
    "skillIds": [
      1100112
    ],
    "effectId": 24502001,
    "effectIds": [
      24502001
    ],
    "job": "세피로트",
    "name": "슬라이딩 킥",
    "internalName": "슬라이딩 킥",
    "legacyNames": [
      "슬라이딩 킥"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0049",
    "skillId": 1106002,
    "skillIds": [
      1106002
    ],
    "effectId": 24503811,
    "effectIds": [
      24503811
    ],
    "job": "세피로트",
    "name": "에네르기 파",
    "internalName": "에네르기파",
    "legacyNames": [
      "에네르기 파"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6500,
    "levelIncrease": 1300
  },
  {
    "id": "direct-0050",
    "skillId": 1100110,
    "skillIds": [
      1100110
    ],
    "effectId": 24501010,
    "effectIds": [
      24501010
    ],
    "job": "세피로트",
    "name": "참영권",
    "internalName": "참영권",
    "legacyNames": [
      "참영권"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0051",
    "skillId": 1104001,
    "skillIds": [
      1104001
    ],
    "effectId": 24600011,
    "effectIds": [
      24600011
    ],
    "job": "세피로트",
    "name": "호열각",
    "internalName": "호열각",
    "legacyNames": [
      "호열각"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5750,
    "levelIncrease": 1150
  },
  {
    "id": "direct-0052",
    "skillId": 1106001,
    "skillIds": [
      1106001
    ],
    "effectId": 24503711,
    "effectIds": [
      24503711
    ],
    "job": "세피로트",
    "name": "반월각",
    "internalName": "반월각",
    "legacyNames": [
      "반월각"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2750,
    "levelIncrease": 550
  },
  {
    "id": "direct-0053",
    "skillId": 1101101,
    "skillIds": [
      1101101
    ],
    "effectId": 24600901,
    "effectIds": [
      24600901,
      24600902
    ],
    "job": "세피로트",
    "name": "승룡권",
    "internalName": "승룡권",
    "legacyNames": [
      "승룡권"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3000,
    "levelIncrease": 600
  },
  {
    "id": "direct-0054",
    "skillId": 1210002,
    "skillIds": [
      1210002
    ],
    "effectId": 21521301,
    "effectIds": [
      21521301
    ],
    "job": "세피로트",
    "name": "대지파열",
    "internalName": "대지파열",
    "legacyNames": [
      "대지파열"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4350,
    "levelIncrease": 870
  },
  {
    "id": "direct-0055",
    "skillId": 1107001,
    "skillIds": [
      1107001
    ],
    "effectId": 24505511,
    "effectIds": [
      24505511
    ],
    "job": "세피로트",
    "name": "천룡각",
    "internalName": "천룡각",
    "legacyNames": [
      "천룡각"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1400
  },
  {
    "id": "direct-0056",
    "skillId": 1100111,
    "skillIds": [
      1100111
    ],
    "effectId": 24501020,
    "effectIds": [
      24501020
    ],
    "job": "세피로트",
    "name": "환영각",
    "internalName": "환영각",
    "legacyNames": [
      "환영각"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0057",
    "skillId": 1212002,
    "skillIds": [
      1212002
    ],
    "effectId": 21521501,
    "effectIds": [
      21521501
    ],
    "job": "세피로트",
    "name": "선풍각",
    "internalName": "선풍각",
    "legacyNames": [
      "선풍각"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1900,
    "levelIncrease": 380
  },
  {
    "id": "direct-0058",
    "skillId": 1802409,
    "skillIds": [
      1802409
    ],
    "effectId": 21509401,
    "effectIds": [
      21509401,
      21509402
    ],
    "job": "아크메이지",
    "name": "[인피니티] 플레임뱅가드",
    "internalName": "[인피니티] 플레임 뱅가드",
    "legacyNames": [
      "[인피니티] 플레임뱅가드"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0059",
    "skillId": 2107006,
    "skillIds": [
      2107006
    ],
    "effectId": 24511711,
    "effectIds": [
      24511711
    ],
    "job": "아크메이지",
    "name": "헤일스톤",
    "internalName": "헤일스톤",
    "legacyNames": [
      "헤일스톤"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1500,
    "levelIncrease": 300
  },
  {
    "id": "direct-0060",
    "skillId": 2104104,
    "skillIds": [
      2104104
    ],
    "effectId": 24502011,
    "effectIds": [
      24502011
    ],
    "job": "아크메이지",
    "name": "아이스플랭크",
    "internalName": "아이스 플랭크",
    "legacyNames": [
      "아이스플랭크"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0061",
    "skillId": 2008006,
    "skillIds": [
      2008006
    ],
    "effectId": 21509411,
    "effectIds": [
      21509411
    ],
    "job": "아크메이지",
    "name": "세스티라티나",
    "internalName": "세스티 라티나",
    "legacyNames": [
      "세스티라티나"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0062",
    "skillId": 2211003,
    "skillIds": [
      2211003
    ],
    "effectId": 21522301,
    "effectIds": [
      21522301
    ],
    "job": "아크메이지",
    "name": "환염초래",
    "internalName": "환염초래",
    "legacyNames": [
      "환염초래"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2400,
    "levelIncrease": 480
  },
  {
    "id": "direct-0063",
    "skillId": 2211103,
    "skillIds": [
      2211103
    ],
    "effectId": 24510811,
    "effectIds": [
      24510811
    ],
    "job": "아크메이지",
    "name": "화염지옥",
    "internalName": "화염지옥",
    "legacyNames": [
      "화염지옥"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3750,
    "levelIncrease": 750
  },
  {
    "id": "direct-0064",
    "skillId": 2210003,
    "skillIds": [
      2210003
    ],
    "effectId": 21522102,
    "effectIds": [
      21522102
    ],
    "job": "아크메이지",
    "name": "파이어월",
    "internalName": "파이어 월",
    "legacyNames": [
      "파이어월"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0065",
    "skillId": 2105002,
    "skillIds": [
      2105002
    ],
    "effectId": 25500412,
    "effectIds": [
      25500412
    ],
    "job": "아크메이지",
    "name": "사이클론커터",
    "internalName": "사이클론 커터",
    "legacyNames": [
      "사이클론커터"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1200,
    "levelIncrease": 240
  },
  {
    "id": "direct-0066",
    "skillId": 2106002,
    "skillIds": [
      2106002
    ],
    "effectId": 25500712,
    "effectIds": [
      25500712
    ],
    "job": "아크메이지",
    "name": "에어봄",
    "internalName": "에어 봄",
    "legacyNames": [
      "에어봄"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0067",
    "skillId": 2107002,
    "skillIds": [
      2107002
    ],
    "effectId": 25501512,
    "effectIds": [
      25501512
    ],
    "job": "아크메이지",
    "name": "토네이도스윙",
    "internalName": "토네이도 스윙",
    "legacyNames": [
      "토네이도스윙"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1300,
    "levelIncrease": 260
  },
  {
    "id": "direct-0068",
    "skillId": 2104001,
    "skillIds": [
      2104001
    ],
    "effectId": 24510011,
    "effectIds": [
      24510011
    ],
    "job": "아크메이지",
    "name": "어스퀘이크",
    "internalName": "어스 퀘이크",
    "legacyNames": [
      "어스퀘이크"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0069",
    "skillId": 2105001,
    "skillIds": [
      2105001
    ],
    "effectId": 24500311,
    "effectIds": [
      24500311
    ],
    "job": "아크메이지",
    "name": "스톤스피어",
    "internalName": "스톤 스피어",
    "legacyNames": [
      "스톤스피어"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0070",
    "skillId": 2106001,
    "skillIds": [
      2106001
    ],
    "effectId": 24500611,
    "effectIds": [
      24500611
    ],
    "job": "아크메이지",
    "name": "천룡아",
    "internalName": "천룡아",
    "legacyNames": [
      "천룡아"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1400
  },
  {
    "id": "direct-0071",
    "skillId": 1802410,
    "skillIds": [
      1802410
    ],
    "effectId": 21509301,
    "effectIds": [
      21509301
    ],
    "job": "파픈스타",
    "name": "[인피니티] 세븐사인",
    "internalName": "[인피니티] 세븐 사인",
    "legacyNames": [
      "[인피니티] 세븐사인"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0072",
    "skillId": 3101013,
    "skillIds": [
      3101013
    ],
    "effectId": 24512601,
    "effectIds": [
      24512601
    ],
    "job": "파픈스타",
    "name": "악마의연주",
    "internalName": "악마의 연주",
    "legacyNames": [
      "악마의연주"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4300,
    "levelIncrease": 860
  },
  {
    "id": "direct-0073",
    "skillId": 3001016,
    "skillIds": [
      3001016
    ],
    "effectId": 21510511,
    "effectIds": [
      21510511
    ],
    "job": "파픈스타",
    "name": "메가데스",
    "internalName": "메가데스",
    "legacyNames": [
      "메가데스"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0074",
    "skillId": 1108000,
    "skillIds": [
      1108000
    ],
    "effectId": 24509401,
    "effectIds": [
      24509401
    ],
    "job": "파픈스타",
    "name": "괴성의연주",
    "internalName": "괴성의 연주",
    "legacyNames": [
      "괴성의연주"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0075",
    "skillId": 3001019,
    "skillIds": [
      3001019
    ],
    "effectId": 14021365,
    "effectIds": [
      14021365
    ],
    "job": "파픈스타",
    "name": "악마의소리",
    "internalName": "악마의 소리",
    "legacyNames": [
      "악마의소리"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0076",
    "skillId": 1108001,
    "skillIds": [
      1108001
    ],
    "effectId": 24509501,
    "effectIds": [
      24509501
    ],
    "job": "파픈스타",
    "name": "음표의나락",
    "internalName": "음표의 나락",
    "legacyNames": [
      "음표의나락"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0077",
    "skillId": 3101023,
    "skillIds": [
      3101023
    ],
    "effectId": 24061201,
    "effectIds": [
      24061201
    ],
    "job": "파픈스타",
    "name": "일렉트릭쇼크",
    "internalName": "일렉트릭 쇼크",
    "legacyNames": [
      "일렉트릭쇼크"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6500,
    "levelIncrease": 1300
  },
  {
    "id": "direct-0078",
    "skillId": 1802411,
    "skillIds": [
      1802411
    ],
    "effectId": 21509002,
    "effectIds": [
      21509002
    ],
    "job": "윈드스토커 (단검)",
    "name": "[인피니티] 카니발매드니스",
    "internalName": "[인피니티] 카니발 매드니스",
    "legacyNames": [
      "[인피니티] 카니발매드니스"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0079",
    "skillId": 1107033,
    "skillIds": [
      1107033
    ],
    "effectId": 24506110,
    "effectIds": [
      24506110
    ],
    "job": "윈드스토커 (단검)",
    "name": "팬오브나이프",
    "internalName": "펜 오브 나이프",
    "legacyNames": [
      "팬오브나이프"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0080",
    "skillId": 1106013,
    "skillIds": [
      1106013
    ],
    "effectId": 21504721,
    "effectIds": [
      21504721
    ],
    "job": "윈드스토커 (단검)",
    "name": "만천화우",
    "internalName": "만천화우",
    "legacyNames": [
      "만천화우"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6500,
    "levelIncrease": 1300
  },
  {
    "id": "direct-0081",
    "skillId": 1210003,
    "skillIds": [
      1210003
    ],
    "effectId": 21518501,
    "effectIds": [
      21518501
    ],
    "job": "윈드스토커 (단검)",
    "name": "크레이지스로우",
    "internalName": "크레이지 스로우",
    "legacyNames": [
      "크레이지스로우"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0082",
    "skillId": 1107023,
    "skillIds": [
      1107023
    ],
    "effectId": 24506010,
    "effectIds": [
      24506010
    ],
    "job": "윈드스토커 (단검)",
    "name": "블리츠",
    "internalName": "블리츠",
    "legacyNames": [
      "블리츠"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5750,
    "levelIncrease": 1150
  },
  {
    "id": "direct-0083",
    "skillId": 1109003,
    "skillIds": [
      1109003
    ],
    "effectId": 21510601,
    "effectIds": [
      21510601
    ],
    "job": "윈드스토커 (단검)",
    "name": "삼중살",
    "internalName": "삼중살",
    "legacyNames": [
      "삼중살"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0084",
    "skillId": 1104013,
    "skillIds": [
      1104013
    ],
    "effectId": 24512111,
    "effectIds": [
      24512111
    ],
    "job": "윈드스토커 (단검)",
    "name": "소리비도",
    "internalName": "소리비도",
    "legacyNames": [
      "소리비도"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0085",
    "skillId": 1107003,
    "skillIds": [
      1107003
    ],
    "effectId": 24505711,
    "effectIds": [
      24505711
    ],
    "job": "윈드스토커 (단검)",
    "name": "다크프레닉",
    "internalName": "다크프레닉",
    "legacyNames": [
      "다크프레닉"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0086",
    "skillId": 1106003,
    "skillIds": [
      1106003
    ],
    "effectId": 21503922,
    "effectIds": [
      21503922
    ],
    "job": "윈드스토커 (단검)",
    "name": "매스커레이드",
    "internalName": "매스커레이드",
    "legacyNames": [
      "매스커레이드"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6500,
    "levelIncrease": 1300
  },
  {
    "id": "direct-0087",
    "skillId": 1802413,
    "skillIds": [
      1802413
    ],
    "effectId": 21509701,
    "effectIds": [
      21509701
    ],
    "job": "윈드스토커 (석궁)",
    "name": "[인피니티] 혜성난뢰",
    "internalName": "[인피니티] 혜성난뢰",
    "legacyNames": [
      "[인피니티] 혜성난뢰"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0088",
    "skillId": 1211009,
    "skillIds": [
      1211009
    ],
    "effectId": 21519101,
    "effectIds": [
      21519101
    ],
    "job": "윈드스토커 (석궁)",
    "name": "이스케이프샷",
    "internalName": "이스케이프 샷",
    "legacyNames": [
      "이스케이프샷"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0089",
    "skillId": 1106009,
    "skillIds": [
      1106009
    ],
    "effectId": 24504511,
    "effectIds": [
      24504511
    ],
    "job": "윈드스토커 (석궁)",
    "name": "갤럭티카매그넘",
    "internalName": "갤럭티카매그넘",
    "legacyNames": [
      "갤럭티카매그넘"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0090",
    "skillId": 1107009,
    "skillIds": [
      1107009
    ],
    "effectId": 24506311,
    "effectIds": [
      24506311
    ],
    "job": "윈드스토커 (석궁)",
    "name": "다크스피어스",
    "internalName": "다크스피어스",
    "legacyNames": [
      "다크스피어스"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0091",
    "skillId": null,
    "skillIds": [
      1109009
    ],
    "effectId": null,
    "effectIds": [],
    "job": "윈드스토커 (석궁)",
    "name": "프레임 샤워",
    "internalName": null,
    "legacyNames": [
      "프레임 샤워"
    ],
    "coefficientSource": "fallback",
    "baseCoef": 3750,
    "levelIncrease": 750
  },
  {
    "id": "direct-0092",
    "skillId": 1105009,
    "skillIds": [
      1105009
    ],
    "effectId": 24601711,
    "effectIds": [
      24601711
    ],
    "job": "윈드스토커 (석궁)",
    "name": "와이드 샷",
    "internalName": "와이드 샷",
    "legacyNames": [
      "와이드 샷"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0093",
    "skillId": 1104009,
    "skillIds": [
      1104009
    ],
    "effectId": 24600811,
    "effectIds": [
      24600811
    ],
    "job": "윈드스토커 (석궁)",
    "name": "스트림 샷",
    "internalName": "스트림 샷",
    "legacyNames": [
      "스트림 샷"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0094",
    "skillId": 1108019,
    "skillIds": [
      1108019
    ],
    "effectId": 24508321,
    "effectIds": [
      24508321
    ],
    "job": "윈드스토커 (석궁)",
    "name": "로커스트",
    "internalName": "로커스트",
    "legacyNames": [
      "로커스트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1400,
    "levelIncrease": 280
  },
  {
    "id": "direct-0095",
    "skillId": 1210009,
    "skillIds": [
      1210009
    ],
    "effectId": 21519001,
    "effectIds": [
      21519001
    ],
    "job": "윈드스토커 (석궁)",
    "name": "카운터 어택",
    "internalName": "카운터 어택",
    "legacyNames": [
      "카운터 어택"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0096",
    "skillId": 1106019,
    "skillIds": [
      1106019
    ],
    "effectId": 24505311,
    "effectIds": [
      24505311
    ],
    "job": "윈드스토커 (석궁)",
    "name": "리미터해제",
    "internalName": "리미터해제",
    "legacyNames": [
      "리미터해제"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6500,
    "levelIncrease": 1300
  },
  {
    "id": "direct-0097",
    "skillId": 1802412,
    "skillIds": [
      1802412
    ],
    "effectId": 21508901,
    "effectIds": [
      21508901,
      21508902
    ],
    "job": "윈드스토커 (활)",
    "name": "[인피니티] 레이 블래스트",
    "internalName": "[인피니티] 레이 블래스트",
    "legacyNames": [
      "[인피니티] 레이 블래스트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2800,
    "levelIncrease": 400
  },
  {
    "id": "direct-0098",
    "skillId": 1109908,
    "skillIds": [
      1109908
    ],
    "effectId": 21512702,
    "effectIds": [
      21512702
    ],
    "job": "윈드스토커 (활)",
    "name": "애로우붐",
    "internalName": "애로우 붐",
    "legacyNames": [
      "애로우붐"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0099",
    "skillId": 1105008,
    "skillIds": [
      1105008
    ],
    "effectId": 24501611,
    "effectIds": [
      24501611
    ],
    "job": "윈드스토커 (활)",
    "name": "스톰애로우",
    "internalName": "스톰 애로우",
    "legacyNames": [
      "스톰애로우"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0100",
    "skillId": 1104018,
    "skillIds": [
      1104018
    ],
    "effectId": 24502611,
    "effectIds": [
      24502611
    ],
    "job": "윈드스토커 (활)",
    "name": "버드헌팅",
    "internalName": "버드헌팅",
    "legacyNames": [
      "버드헌팅"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0101",
    "skillId": 1108008,
    "skillIds": [
      1108008
    ],
    "effectId": 24508215,
    "effectIds": [
      24508215
    ],
    "job": "윈드스토커 (활)",
    "name": "샤이닝 애로우",
    "internalName": "샤이닝 애로우",
    "legacyNames": [
      "샤이닝 애로우"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0102",
    "skillId": null,
    "skillIds": [
      1006038
    ],
    "effectId": null,
    "effectIds": [],
    "job": "윈드스토커 (활)",
    "name": "에로우 샷",
    "internalName": null,
    "legacyNames": [
      "에로우 샷"
    ],
    "coefficientSource": "fallback",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0103",
    "skillId": 1105100,
    "skillIds": [
      1105100
    ],
    "effectId": 24503610,
    "effectIds": [
      24503610
    ],
    "job": "윈드스토커 (활)",
    "name": "백스텝 에로우",
    "internalName": "백스텝 애로우",
    "legacyNames": [
      "백스텝 에로우"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0104",
    "skillId": 1106018,
    "skillIds": [
      1106018
    ],
    "effectId": 21505221,
    "effectIds": [
      21505221
    ],
    "job": "윈드스토커 (활)",
    "name": "갓버드피니시",
    "internalName": "갓버드피니시",
    "legacyNames": [
      "갓버드피니시"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2750,
    "levelIncrease": 550
  },
  {
    "id": "direct-0105",
    "skillId": 1802414,
    "skillIds": [
      1802414
    ],
    "effectId": 21509102,
    "effectIds": [
      21509102
    ],
    "job": "프라이쉬츠",
    "name": "[인피니티] 팬텀파우스트",
    "internalName": "[인피니티] 팬텀 파우스트",
    "legacyNames": [
      "[인피니티] 팬텀파우스트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0106",
    "skillId": 1105020,
    "skillIds": [
      1105020
    ],
    "effectId": 21507712,
    "effectIds": [
      21507712
    ],
    "job": "프라이쉬츠",
    "name": "게틀링",
    "internalName": "개틀링",
    "legacyNames": [
      "게틀링"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0107",
    "skillId": 1106020,
    "skillIds": [
      1106020
    ],
    "effectId": 21511001,
    "effectIds": [
      21511001
    ],
    "job": "프라이쉬츠",
    "name": "쇼타임",
    "internalName": "쇼 타임",
    "legacyNames": [
      "쇼타임"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0108",
    "skillId": 1100420,
    "skillIds": [
      1100420
    ],
    "effectId": 14021772,
    "effectIds": [
      14021772
    ],
    "job": "프라이쉬츠",
    "name": "연사",
    "internalName": "연사",
    "legacyNames": [
      "연사"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0109",
    "skillId": 1103020,
    "skillIds": [
      1103020
    ],
    "effectId": 24507601,
    "effectIds": [
      24507601
    ],
    "job": "프라이쉬츠",
    "name": "플래틱느와르",
    "internalName": "플래틱 느와르",
    "legacyNames": [
      "플래틱느와르"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0110",
    "skillId": 1100520,
    "skillIds": [
      1100520
    ],
    "effectId": 14021774,
    "effectIds": [
      14021774
    ],
    "job": "프라이쉬츠",
    "name": "난사",
    "internalName": "난사",
    "legacyNames": [
      "난사"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0111",
    "skillId": 1100820,
    "skillIds": [
      1100820
    ],
    "effectId": 14021776,
    "effectIds": [
      14021776
    ],
    "job": "프라이쉬츠",
    "name": "스탭백",
    "internalName": "스텝 백",
    "legacyNames": [
      "스탭백"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0112",
    "skillId": 1100320,
    "skillIds": [
      1100320
    ],
    "effectId": 14021777,
    "effectIds": [
      14021777
    ],
    "job": "프라이쉬츠",
    "name": "속사",
    "internalName": "속사",
    "legacyNames": [
      "속사"
    ],
    "coefficientSource": "effect",
    "baseCoef": 500,
    "levelIncrease": 500
  },
  {
    "id": "direct-0113",
    "skillId": 1100620,
    "skillIds": [
      1100620
    ],
    "effectId": 14021775,
    "effectIds": [
      14021775
    ],
    "job": "프라이쉬츠",
    "name": "골든샷",
    "internalName": "골든 샷",
    "legacyNames": [
      "골든샷"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7500,
    "levelIncrease": 1500
  },
  {
    "id": "direct-0114",
    "skillId": 1210020,
    "skillIds": [
      1210020
    ],
    "effectId": 21518301,
    "effectIds": [
      21518301
    ],
    "job": "프라이쉬츠",
    "name": "아포칼립스",
    "internalName": "아포칼립스",
    "legacyNames": [
      "아포칼립스"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2300,
    "levelIncrease": 460
  },
  {
    "id": "direct-0115",
    "skillId": 1101022,
    "skillIds": [
      1101022
    ],
    "effectId": 24508401,
    "effectIds": [
      24508401
    ],
    "job": "소디언",
    "name": "미스틸테인",
    "internalName": "미스텔테인",
    "legacyNames": [
      "미스틸테인"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0116",
    "skillId": 1103022,
    "skillIds": [
      1103022
    ],
    "effectId": 24508431,
    "effectIds": [
      24508431
    ],
    "job": "소디언",
    "name": "라이키리",
    "internalName": "라이키리",
    "legacyNames": [
      "라이키리"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0117",
    "skillId": 1212026,
    "skillIds": [
      1212026
    ],
    "effectId": 14021851,
    "effectIds": [
      14021851
    ],
    "job": "소디언",
    "name": "라이트닝",
    "internalName": "라이트닝",
    "legacyNames": [
      "라이트닝"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0118",
    "skillId": 1102022,
    "skillIds": [
      1102022
    ],
    "effectId": 24508421,
    "effectIds": [
      24508421
    ],
    "job": "소디언",
    "name": "가에보르그",
    "internalName": "가에보르그",
    "legacyNames": [
      "가에보르그"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0119",
    "skillId": 1109022,
    "skillIds": [
      1109022
    ],
    "effectId": 24508531,
    "effectIds": [
      24508531
    ],
    "job": "소디언",
    "name": "발칸",
    "internalName": "발칸",
    "legacyNames": [
      "발칸"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3600,
    "levelIncrease": 720
  },
  {
    "id": "direct-0120",
    "skillId": 1210022,
    "skillIds": [
      1210022
    ],
    "effectId": 21517701,
    "effectIds": [
      21517701
    ],
    "job": "소디언",
    "name": "라이즈 빔",
    "internalName": "라이즈 빔",
    "legacyNames": [
      "라이즈 빔"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0121",
    "skillId": 1802416,
    "skillIds": [
      1802416
    ],
    "effectId": 21517001,
    "effectIds": [
      21517001
    ],
    "job": "소울리스 원",
    "name": "[인피니티]",
    "internalName": "[인피니티] 드래곤해저드",
    "legacyNames": [
      "[인피니티]"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0122",
    "skillId": 1100033,
    "skillIds": [
      1100033
    ],
    "effectId": 14023012,
    "effectIds": [
      14023012
    ],
    "job": "소울리스 원",
    "name": "와일드 소울",
    "internalName": "와일드 소울",
    "legacyNames": [
      "와일드 소울"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0123",
    "skillId": 1106033,
    "skillIds": [
      1106033
    ],
    "effectId": 14023018,
    "effectIds": [
      14023018
    ],
    "job": "소울리스 원",
    "name": "자이언트 소울",
    "internalName": "자이언트 소울",
    "legacyNames": [
      "자이언트 소울"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0124",
    "skillId": 1210037,
    "skillIds": [
      1210037
    ],
    "effectId": 14023019,
    "effectIds": [
      14023019
    ],
    "job": "소울리스 원",
    "name": "스위프트 소울",
    "internalName": "스위프트 소울",
    "legacyNames": [
      "스위프트 소울"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0125",
    "skillId": 1101033,
    "skillIds": [
      1101033
    ],
    "effectId": 14023013,
    "effectIds": [
      14023013
    ],
    "job": "소울리스 원",
    "name": "소울 마스터 1",
    "internalName": "소울 마스터 I",
    "legacyNames": [
      "소울 마스터 1"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7250,
    "levelIncrease": 1450
  },
  {
    "id": "direct-0126",
    "skillId": 1102033,
    "skillIds": [
      1102033
    ],
    "effectId": 14023014,
    "effectIds": [
      14023014
    ],
    "job": "소울리스 원",
    "name": "소울 마스터 2",
    "internalName": "소울 마스터 II",
    "legacyNames": [
      "소울 마스터 2"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0127",
    "skillId": 1210036,
    "skillIds": [
      1210036
    ],
    "effectId": 14023017,
    "effectIds": [
      14023017
    ],
    "job": "소울리스 원",
    "name": "소울 마스터 3",
    "internalName": "소울 마스터 IV",
    "legacyNames": [
      "소울 마스터 3"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6500,
    "levelIncrease": 1300
  },
  {
    "id": "direct-0128",
    "skillId": 1210036,
    "skillIds": [
      1210036
    ],
    "effectId": 14023017,
    "effectIds": [
      14023017
    ],
    "job": "소울리스 원",
    "name": "소울 마스터 4",
    "internalName": "소울 마스터 IV",
    "legacyNames": [
      "소울 마스터 4"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6500,
    "levelIncrease": 1300
  },
  {
    "id": "direct-0129",
    "skillId": 1802417,
    "skillIds": [
      1802417
    ],
    "effectId": 21532701,
    "effectIds": [
      21532701
    ],
    "job": "아크마스터",
    "name": "[인피니티] 갤럭시워",
    "internalName": "[인피니티] 갤럭시 워",
    "legacyNames": [
      "[인피니티] 갤럭시워"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0130",
    "skillId": 2212004,
    "skillIds": [
      2212004
    ],
    "effectId": 21532101,
    "effectIds": [
      21532101
    ],
    "job": "아크마스터",
    "name": "버스트카드",
    "internalName": "버스트 카드",
    "legacyNames": [
      "버스트카드"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0131",
    "skillId": 2212005,
    "skillIds": [
      2212005
    ],
    "effectId": 21505313,
    "effectIds": [
      21505313
    ],
    "job": "아크마스터",
    "name": "썬더볼트",
    "internalName": "썬더볼트",
    "legacyNames": [
      "썬더볼트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0132",
    "skillId": 2212007,
    "skillIds": [
      2212007
    ],
    "effectId": 21532501,
    "effectIds": [
      21532501
    ],
    "job": "아크마스터",
    "name": "샤이닝덱",
    "internalName": "샤이닝 덱",
    "legacyNames": [
      "샤이닝덱"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0133",
    "skillId": 1311147,
    "skillIds": [
      1311147
    ],
    "effectId": 21505319,
    "effectIds": [
      21505319
    ],
    "job": "아크마스터",
    "name": "프리덤라이트",
    "internalName": "프리덤 라이트",
    "legacyNames": [
      "프리덤라이트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0134",
    "skillId": 1310048,
    "skillIds": [
      1310048
    ],
    "effectId": 21532801,
    "effectIds": [
      21532801
    ],
    "job": "아크마스터",
    "name": "리플렉션",
    "internalName": "리플렉션",
    "legacyNames": [
      "리플렉션"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0135",
    "skillId": 1313048,
    "skillIds": [
      1313048
    ],
    "effectId": 21533103,
    "effectIds": [
      21533103
    ],
    "job": "아크마스터",
    "name": "트윙클",
    "internalName": "트윙클",
    "legacyNames": [
      "트윙클"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0136",
    "skillId": 1311052,
    "skillIds": [
      1311052
    ],
    "effectId": 21536401,
    "effectIds": [
      21536401
    ],
    "job": "아크마스터",
    "name": "일리미네이트",
    "internalName": "일리미네이트",
    "legacyNames": [
      "일리미네이트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1001
  },
  {
    "id": "direct-0137",
    "skillId": 1311049,
    "skillIds": [
      1311049
    ],
    "effectId": 21533301,
    "effectIds": [
      21533301
    ],
    "job": "아크마스터",
    "name": "히든카드",
    "internalName": "히든 카드",
    "legacyNames": [
      "히든카드"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2250,
    "levelIncrease": 450
  },
  {
    "id": "direct-0138",
    "skillId": 1310049,
    "skillIds": [
      1310049
    ],
    "effectId": 21533203,
    "effectIds": [
      21533203
    ],
    "job": "아크마스터",
    "name": "와일드카드",
    "internalName": "와일드 카드",
    "legacyNames": [
      "와일드카드"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0139",
    "skillId": 1802418,
    "skillIds": [
      1802418
    ],
    "effectId": 21535901,
    "effectIds": [
      21535901,
      21535902
    ],
    "job": "포스마스터",
    "name": "[인피니티] 배니쉬먼트",
    "internalName": "[인피니티] 배니쉬먼트",
    "legacyNames": [
      "[인피니티] 배니쉬먼트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0140",
    "skillId": 1311446,
    "skillIds": [
      1311446
    ],
    "effectId": 21535301,
    "effectIds": [
      21535301
    ],
    "job": "포스마스터",
    "name": "[♣] 서클볼",
    "internalName": "[♣] 서클볼",
    "legacyNames": [
      "[♣] 서클볼"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3800,
    "levelIncrease": 760
  },
  {
    "id": "direct-0141",
    "skillId": 1310053,
    "skillIds": [
      1310053
    ],
    "effectId": 21021553,
    "effectIds": [
      21021553
    ],
    "job": "포스마스터",
    "name": "[♣] 다크니스덱",
    "internalName": "[♣] 다크니스 덱",
    "legacyNames": [
      "[♣] 다크니스덱"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0142",
    "skillId": 1310052,
    "skillIds": [
      1310052
    ],
    "effectId": 21536301,
    "effectIds": [
      21536301
    ],
    "job": "포스마스터",
    "name": "[♣] 타임브레이크",
    "internalName": "[♣] 타임브레이크",
    "legacyNames": [
      "[♣] 타임브레이크"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1500,
    "levelIncrease": 300
  },
  {
    "id": "direct-0143",
    "skillId": 1310250,
    "skillIds": [
      1310250
    ],
    "effectId": 21535505,
    "effectIds": [
      21535505
    ],
    "job": "포스마스터",
    "name": "[♠] 어퍼컷",
    "internalName": "[♠] 어퍼컷",
    "legacyNames": [
      "[♠] 어퍼컷"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0144",
    "skillId": 1312546,
    "skillIds": [
      1312546
    ],
    "effectId": 21535211,
    "effectIds": [
      21535211
    ],
    "job": "포스마스터",
    "name": "[♠] 레이본",
    "internalName": "[♠] 레이본",
    "legacyNames": [
      "[♠] 레이본"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0145",
    "skillId": 1313250,
    "skillIds": [
      1313250
    ],
    "effectId": 21535701,
    "effectIds": [
      21535701
    ],
    "job": "포스마스터",
    "name": "[♠] 스페셜킥",
    "internalName": "[♠] 스페셜 킥",
    "legacyNames": [
      "[♠] 스페셜킥"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0146",
    "skillId": 1310056,
    "skillIds": [
      1310056
    ],
    "effectId": 21021559,
    "effectIds": [
      21021559
    ],
    "job": "포스마스터",
    "name": "[◆] 힛앤러쉬",
    "internalName": "[◆] 힛 앤 러쉬",
    "legacyNames": [
      "[◆] 힛앤러쉬"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4250,
    "levelIncrease": 900
  },
  {
    "id": "direct-0147",
    "skillId": 1311051,
    "skillIds": [
      1311051
    ],
    "effectId": 21536001,
    "effectIds": [
      21536001
    ],
    "job": "포스마스터",
    "name": "[◆] 크럼블",
    "internalName": "[◆] 크럼블",
    "legacyNames": [
      "[◆] 크럼블"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1400
  },
  {
    "id": "direct-0148",
    "skillId": 1802420,
    "skillIds": [
      1802420
    ],
    "effectId": 27802501,
    "effectIds": [
      27802501,
      27802511
    ],
    "job": "흑영(도)",
    "name": "[인피니티] 그림자 일격",
    "internalName": "[인피니티] 그림자 일격",
    "legacyNames": [
      "[인피니티] 그림자 일격"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2400,
    "levelIncrease": 600
  },
  {
    "id": "direct-0149",
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
    "job": "흑영(도)",
    "name": "[초식] 1~3",
    "internalName": null,
    "legacyNames": [
      "[초식] 1~3"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3000,
    "levelIncrease": 600
  },
  {
    "id": "direct-0150",
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
    "job": "흑영(도)",
    "name": "[초식] 4~8",
    "internalName": null,
    "legacyNames": [
      "[초식] 4~8"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0151",
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
    "job": "흑영(도)",
    "name": "[초식] 9~12",
    "internalName": null,
    "legacyNames": [
      "[초식] 9~12"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4250,
    "levelIncrease": 850
  },
  {
    "id": "direct-0152",
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
    "job": "흑영(도)",
    "name": "[연식] 1~4",
    "internalName": null,
    "legacyNames": [
      "[연식] 1~4"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0153",
    "skillId": 1411056,
    "skillIds": [
      1411056
    ],
    "effectId": 13017230,
    "effectIds": [
      13017230
    ],
    "job": "흑영(도)",
    "name": "그림자 칼날",
    "internalName": "그림자 칼날",
    "legacyNames": [
      "그림자 칼날"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0154",
    "skillId": 1414055,
    "skillIds": [
      1414055
    ],
    "effectId": 27801801,
    "effectIds": [
      27801801
    ],
    "job": "흑영(도)",
    "name": "그림자 찢기",
    "internalName": "그림자 찢기",
    "legacyNames": [
      "그림자 찢기"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7500,
    "levelIncrease": 1500
  },
  {
    "id": "direct-0155",
    "skillId": 1416055,
    "skillIds": [
      1416055
    ],
    "effectId": 27802001,
    "effectIds": [
      27802001
    ],
    "job": "흑영(도)",
    "name": "그림자 검",
    "internalName": "그림자 검",
    "legacyNames": [
      "그림자 검"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0156",
    "skillId": 1417055,
    "skillIds": [
      1417055
    ],
    "effectId": 27802101,
    "effectIds": [
      27802101
    ],
    "job": "흑영(도)",
    "name": "그림자 춤",
    "internalName": "그림자 춤",
    "legacyNames": [
      "그림자 춤"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4250,
    "levelIncrease": 850
  },
  {
    "id": "direct-0157",
    "skillId": 1411060,
    "skillIds": [
      1411060
    ],
    "effectId": 13016323,
    "effectIds": [
      13016323
    ],
    "job": "흑영(도)",
    "name": "그림자 돌풍",
    "internalName": "그림자 돌풍",
    "legacyNames": [
      "그림자 돌풍"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0158",
    "skillId": 1411155,
    "skillIds": [
      1411155
    ],
    "effectId": 13111935,
    "effectIds": [
      13111935
    ],
    "job": "흑영(도)",
    "name": "그림자 암습",
    "internalName": "그림자 암습",
    "legacyNames": [
      "그림자 암습"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0159",
    "skillId": 1802419,
    "skillIds": [
      1802419
    ],
    "effectId": 27802412,
    "effectIds": [
      27802412
    ],
    "job": "흑영(옥)",
    "name": "[인피니티] 소멸의 그림자",
    "internalName": "[인피니티] 소멸의 그림자",
    "legacyNames": [
      "[인피니티] 소멸의 그림자"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0160",
    "skillId": 1410055,
    "skillIds": [
      1410055
    ],
    "effectId": 27801401,
    "effectIds": [
      27801401
    ],
    "job": "흑영(옥)",
    "name": "칠흑의 그림자",
    "internalName": "칠흑의 그림자",
    "legacyNames": [
      "칠흑의 그림자"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0161",
    "skillId": 1411055,
    "skillIds": [
      1411055
    ],
    "effectId": 27801501,
    "effectIds": [
      27801501
    ],
    "job": "흑영(옥)",
    "name": "매혹의 그림자",
    "internalName": "매혹의 그림자",
    "legacyNames": [
      "매혹의 그림자"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0162",
    "skillId": 1413055,
    "skillIds": [
      1413055
    ],
    "effectId": 27801701,
    "effectIds": [
      27801701
    ],
    "job": "흑영(옥)",
    "name": "경직의 그림자",
    "internalName": "경직의 그림자",
    "legacyNames": [
      "경직의 그림자"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0163",
    "skillId": 1412055,
    "skillIds": [
      1412055
    ],
    "effectId": 27801601,
    "effectIds": [
      27801601,
      27801611
    ],
    "job": "흑영(옥)",
    "name": "분노의 그림자",
    "internalName": "분노의 그림자",
    "legacyNames": [
      "분노의 그림자"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0164",
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
    "job": "데미갓(신성)",
    "name": "[인피니티] 지비누",
    "internalName": "[인피니티] 지비누",
    "legacyNames": [
      "[인피니티] 지비누"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0165",
    "skillId": 1759103,
    "skillIds": [
      1759103
    ],
    "effectId": 25901138,
    "effectIds": [
      25901138
    ],
    "job": "데미갓(신성)",
    "name": "란샤르",
    "internalName": "란사르",
    "legacyNames": [
      "란샤르"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0166",
    "skillId": 1759106,
    "skillIds": [
      1759106
    ],
    "effectId": 25901143,
    "effectIds": [
      25901143
    ],
    "job": "데미갓(신성)",
    "name": "퓨리아",
    "internalName": "퓨리아",
    "legacyNames": [
      "퓨리아"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0167",
    "skillId": 1759107,
    "skillIds": [
      1759107
    ],
    "effectId": 21505300,
    "effectIds": [
      21505300
    ],
    "job": "데미갓(신성)",
    "name": "글로리아",
    "internalName": "글로리아",
    "legacyNames": [
      "글로리아"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1400
  },
  {
    "id": "direct-0168",
    "skillId": 1759105,
    "skillIds": [
      1759105
    ],
    "effectId": 21505293,
    "effectIds": [
      21505293
    ],
    "job": "데미갓(신성)",
    "name": "코르타르",
    "internalName": "코르타르",
    "legacyNames": [
      "코르타르"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0169",
    "skillId": 1760101,
    "skillIds": [
      1760101
    ],
    "effectId": 25901156,
    "effectIds": [
      25901156
    ],
    "job": "데미갓(신성)",
    "name": "후이나",
    "internalName": "후이나",
    "legacyNames": [
      "후이나"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0170",
    "skillId": 1760102,
    "skillIds": [
      1760102
    ],
    "effectId": 25901158,
    "effectIds": [
      25901158
    ],
    "job": "데미갓(신성)",
    "name": "마타르",
    "internalName": "마타르",
    "legacyNames": [
      "마타르"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0171",
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
    "job": "데미갓(분노)",
    "name": "[인피니티] 지비누",
    "internalName": "[인피니티] 지비누",
    "legacyNames": [
      "[인피니티] 지비누"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0172",
    "skillId": 1759103,
    "skillIds": [
      1759103
    ],
    "effectId": 25901137,
    "effectIds": [
      25901137
    ],
    "job": "데미갓(분노)",
    "name": "란샤르",
    "internalName": "란사르",
    "legacyNames": [
      "란샤르"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0173",
    "skillId": 1759106,
    "skillIds": [
      1759106
    ],
    "effectId": 25901142,
    "effectIds": [
      25901142
    ],
    "job": "데미갓(분노)",
    "name": "퓨리아",
    "internalName": "퓨리아",
    "legacyNames": [
      "퓨리아"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0174",
    "skillId": 1759107,
    "skillIds": [
      1759107
    ],
    "effectId": 25901145,
    "effectIds": [
      25901145
    ],
    "job": "데미갓(분노)",
    "name": "글로리아",
    "internalName": "글로리아",
    "legacyNames": [
      "글로리아"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0175",
    "skillId": 1759105,
    "skillIds": [
      1759105
    ],
    "effectId": 25901140,
    "effectIds": [
      25901140
    ],
    "job": "데미갓(분노)",
    "name": "코르타르",
    "internalName": "코르타르",
    "legacyNames": [
      "코르타르"
    ],
    "coefficientSource": "effect",
    "baseCoef": 8000,
    "levelIncrease": 1600
  },
  {
    "id": "direct-0176",
    "skillId": 1760101,
    "skillIds": [
      1760101
    ],
    "effectId": 25901156,
    "effectIds": [
      25901156
    ],
    "job": "데미갓(분노)",
    "name": "후이나",
    "internalName": "후이나",
    "legacyNames": [
      "후이나"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0177",
    "skillId": 1759109,
    "skillIds": [
      1759109
    ],
    "effectId": 25901149,
    "effectIds": [
      25901149
    ],
    "job": "데미갓(분노)",
    "name": "크렌치",
    "internalName": "크렌치",
    "legacyNames": [
      "크렌치"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0178",
    "skillId": 1760102,
    "skillIds": [
      1760102
    ],
    "effectId": 25901147,
    "effectIds": [
      25901147
    ],
    "job": "데미갓(분노)",
    "name": "마타르",
    "internalName": "마타르",
    "legacyNames": [
      "마타르"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0179",
    "skillId": 1802422,
    "skillIds": [
      1802422
    ],
    "effectId": 30500311,
    "effectIds": [
      30500311,
      30501311
    ],
    "job": "아그니",
    "name": "[인피니티] 멜트 다운",
    "internalName": "[인피니티] 멜트 다운",
    "legacyNames": [
      "[인피니티] 멜트 다운"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0180",
    "skillId": 1801301,
    "skillIds": [
      1801301
    ],
    "effectId": 30501301,
    "effectIds": [
      30501301
    ],
    "job": "아그니",
    "name": "기간틱 스윙",
    "internalName": "기간틱 스윙",
    "legacyNames": [
      "기간틱 스윙"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3000,
    "levelIncrease": 600
  },
  {
    "id": "direct-0181",
    "skillId": 1801302,
    "skillIds": [
      1801302
    ],
    "effectId": 30500302,
    "effectIds": [
      30500302
    ],
    "job": "아그니",
    "name": "기간틱 슬래시",
    "internalName": "기간틱 슬래시",
    "legacyNames": [
      "기간틱 슬래시"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3050,
    "levelIncrease": 610
  },
  {
    "id": "direct-0182",
    "skillId": 1801303,
    "skillIds": [
      1801303
    ],
    "effectId": 30501303,
    "effectIds": [
      30501303
    ],
    "job": "아그니",
    "name": "기간틱 스트라이크",
    "internalName": "기간틱 스트라이크",
    "legacyNames": [
      "기간틱 스트라이크"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7500,
    "levelIncrease": 1500
  },
  {
    "id": "direct-0183",
    "skillId": 1801304,
    "skillIds": [
      1801304
    ],
    "effectId": 30500304,
    "effectIds": [
      30500304
    ],
    "job": "아그니",
    "name": "기간틱 버스터",
    "internalName": "기간틱 버스터",
    "legacyNames": [
      "기간틱 버스터"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0184",
    "skillId": 1801315,
    "skillIds": [
      1801315
    ],
    "effectId": 30500305,
    "effectIds": [
      30500305
    ],
    "job": "아그니",
    "name": "기간틱 러시",
    "internalName": "기간틱 러시",
    "legacyNames": [
      "기간틱 러시"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0185",
    "skillId": 1801305,
    "skillIds": [
      1801305
    ],
    "effectId": 30500306,
    "effectIds": [
      30500306
    ],
    "job": "아그니",
    "name": "플레임 스트라이크",
    "internalName": "플레임 스트라이크",
    "legacyNames": [
      "플레임 스트라이크"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 400
  },
  {
    "id": "direct-0186",
    "skillId": 1801306,
    "skillIds": [
      1801306
    ],
    "effectId": 30500307,
    "effectIds": [
      30500307
    ],
    "job": "아그니",
    "name": "플레임 샷",
    "internalName": "플레임 샷",
    "legacyNames": [
      "플레임 샷"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1200,
    "levelIncrease": 240
  },
  {
    "id": "direct-0187",
    "skillId": 1801307,
    "skillIds": [
      1801307
    ],
    "effectId": 30501308,
    "effectIds": [
      30501308
    ],
    "job": "아그니",
    "name": "프레임 버스터",
    "internalName": "플레임 버스터",
    "legacyNames": [
      "프레임 버스터"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6500,
    "levelIncrease": 1300
  },
  {
    "id": "direct-0188",
    "skillId": 1801308,
    "skillIds": [
      1801308
    ],
    "effectId": 30500309,
    "effectIds": [
      30500309
    ],
    "job": "아그니",
    "name": "마그마 블래스트",
    "internalName": "마그마 블래스트",
    "legacyNames": [
      "마그마 블래스트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0189",
    "skillId": 1801309,
    "skillIds": [
      1801309
    ],
    "effectId": 30500310,
    "effectIds": [
      30500310
    ],
    "job": "아그니",
    "name": "마그마 스피어",
    "internalName": "마그마 스피어",
    "legacyNames": [
      "마그마 스피어"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0190",
    "skillId": 1801312,
    "skillIds": [
      1801312
    ],
    "effectId": 30500313,
    "effectIds": [
      30500313
    ],
    "job": "아그니",
    "name": "인페르노",
    "internalName": "인페르노",
    "legacyNames": [
      "인페르노"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0191",
    "skillId": 1802423,
    "skillIds": [
      1802423
    ],
    "effectId": 31504033,
    "effectIds": [
      31504033,
      31504034
    ],
    "job": "다크체이서",
    "name": "[인피니티] 블레이징",
    "internalName": "[인피니티] 블레이징",
    "legacyNames": [
      "[인피니티] 블레이징"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0192",
    "skillId": 1802301,
    "skillIds": [
      1802301
    ],
    "effectId": 31004017,
    "effectIds": [
      31004017
    ],
    "job": "다크체이서",
    "name": "카리온 어퍼",
    "internalName": "카리온 어퍼",
    "legacyNames": [
      "카리온 어퍼"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1500,
    "levelIncrease": 210
  },
  {
    "id": "direct-0193",
    "skillId": 1802303,
    "skillIds": [
      1802303
    ],
    "effectId": 31004018,
    "effectIds": [
      31004018
    ],
    "job": "다크체이서",
    "name": "카리온 슬래시",
    "internalName": "카리온 슬래시",
    "legacyNames": [
      "카리온 슬래시"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1500,
    "levelIncrease": 210
  },
  {
    "id": "direct-0194",
    "skillId": 1802302,
    "skillIds": [
      1802302
    ],
    "effectId": 31004020,
    "effectIds": [
      31004020
    ],
    "job": "다크체이서",
    "name": "카리온 피어스",
    "internalName": "카리온 피어스",
    "legacyNames": [
      "카리온 피어스"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1400,
    "levelIncrease": 196
  },
  {
    "id": "direct-0195",
    "skillId": 1802308,
    "skillIds": [
      1802308
    ],
    "effectId": 31504021,
    "effectIds": [
      31504021
    ],
    "job": "다크체이서",
    "name": "런지",
    "internalName": "런지",
    "legacyNames": [
      "런지"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6250,
    "levelIncrease": 1250
  },
  {
    "id": "direct-0196",
    "skillId": 1802310,
    "skillIds": [
      1802310
    ],
    "effectId": 31504025,
    "effectIds": [
      31504025
    ],
    "job": "다크체이서",
    "name": "데들리 샷",
    "internalName": "데들리 샷",
    "legacyNames": [
      "데들리 샷"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6500,
    "levelIncrease": 1300
  },
  {
    "id": "direct-0197",
    "skillId": 1802311,
    "skillIds": [
      1802311
    ],
    "effectId": 31504026,
    "effectIds": [
      31504026
    ],
    "job": "다크체이서",
    "name": "샤인 오브 데스",
    "internalName": "사인 오브 데스",
    "legacyNames": [
      "샤인 오브 데스"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2600,
    "levelIncrease": 520
  },
  {
    "id": "direct-0198",
    "skillId": 1802312,
    "skillIds": [
      1802312
    ],
    "effectId": 31504029,
    "effectIds": [
      31504029
    ],
    "job": "다크체이서",
    "name": "트리플 립",
    "internalName": "트리플 립",
    "legacyNames": [
      "트리플 립"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6500,
    "levelIncrease": 1300
  },
  {
    "id": "direct-0199",
    "skillId": 1802318,
    "skillIds": [
      1802318
    ],
    "effectId": 21520608,
    "effectIds": [
      21520608
    ],
    "job": "다크체이서",
    "name": "트리플 컷",
    "internalName": "트리플 컷",
    "legacyNames": [
      "트리플 컷"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0200",
    "skillId": 1802313,
    "skillIds": [
      1802313
    ],
    "effectId": 31504030,
    "effectIds": [
      31504030
    ],
    "job": "다크체이서",
    "name": "컨퓨전",
    "internalName": "컨퓨전",
    "legacyNames": [
      "컨퓨전"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0201",
    "skillId": null,
    "skillIds": [
      1802307,
      9990977
    ],
    "effectId": 31004037,
    "effectIds": [
      31004037
    ],
    "job": "다크체이서",
    "name": "체인 위핑",
    "internalName": null,
    "legacyNames": [
      "체인 위핑"
    ],
    "coefficientSource": "effect",
    "baseCoef": 9000,
    "levelIncrease": 1800
  },
  {
    "id": "direct-0202",
    "skillId": 1802304,
    "skillIds": [
      1802304
    ],
    "effectId": 31504022,
    "effectIds": [
      31504022
    ],
    "job": "다크체이서",
    "name": "체인 스윙",
    "internalName": "체인 스윙",
    "legacyNames": [
      "체인 스윙"
    ],
    "coefficientSource": "effect",
    "baseCoef": 10000,
    "levelIncrease": 2000
  },
  {
    "id": "direct-0203",
    "skillId": null,
    "skillIds": [],
    "effectId": null,
    "effectIds": [],
    "job": "다크체이서",
    "name": "체인 스메싱",
    "internalName": null,
    "legacyNames": [
      "체인 스메싱"
    ],
    "coefficientSource": "fallback",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0204",
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
    "job": "다크체이서",
    "name": "체인 버스트",
    "internalName": null,
    "legacyNames": [
      "체인 버스트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7500,
    "levelIncrease": 1500
  },
  {
    "id": "direct-0205",
    "skillId": 1802424,
    "skillIds": [
      1802424
    ],
    "effectId": 14021484,
    "effectIds": [
      14021484
    ],
    "job": "섀도우워커",
    "name": "[인피니티] 데몰리션",
    "internalName": "[인피니티] 데몰리션",
    "legacyNames": [
      "[인피니티] 데몰리션"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0206",
    "skillId": 1803301,
    "skillIds": [
      1803301
    ],
    "effectId": 14021471,
    "effectIds": [
      14021471
    ],
    "job": "섀도우워커",
    "name": "더블 피어스",
    "internalName": "더블 피어스",
    "legacyNames": [
      "더블 피어스"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0207",
    "skillId": 1803302,
    "skillIds": [
      1803302
    ],
    "effectId": 31003307,
    "effectIds": [
      31003307
    ],
    "job": "섀도우워커",
    "name": "리프 어택",
    "internalName": "리프 어택",
    "legacyNames": [
      "리프 어택"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0208",
    "skillId": 1803303,
    "skillIds": [
      1803303
    ],
    "effectId": 21505250,
    "effectIds": [
      21505250
    ],
    "job": "섀도우워커",
    "name": "[매직랜스] 크러시",
    "internalName": "크러시",
    "legacyNames": [
      "[매직랜스] 크러시"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0209",
    "skillId": 1803322,
    "skillIds": [
      1803322
    ],
    "effectId": 14021478,
    "effectIds": [
      14021478
    ],
    "job": "섀도우워커",
    "name": "[매직랜스] 다크 블로우",
    "internalName": "다크 블로우",
    "legacyNames": [
      "[매직랜스] 다크 블로우"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6500,
    "levelIncrease": 1300
  },
  {
    "id": "direct-0210",
    "skillId": 1803322,
    "skillIds": [
      1803322
    ],
    "effectId": 14021480,
    "effectIds": [
      14021480
    ],
    "job": "섀도우워커",
    "name": "[헤비랜스] 다크 블로우",
    "internalName": "다크 블로우",
    "legacyNames": [
      "[헤비랜스] 다크 블로우"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7500,
    "levelIncrease": 1500
  },
  {
    "id": "direct-0211",
    "skillId": 1803324,
    "skillIds": [
      1803324
    ],
    "effectId": 14021476,
    "effectIds": [
      14021476
    ],
    "job": "섀도우워커",
    "name": "[매직랜스] 다크 버스트",
    "internalName": "다크 버스트",
    "legacyNames": [
      "[매직랜스] 다크 버스트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0212",
    "skillId": 1803324,
    "skillIds": [
      1803324
    ],
    "effectId": 14021482,
    "effectIds": [
      14021482
    ],
    "job": "섀도우워커",
    "name": "[헤비랜스] 다크 버스트",
    "internalName": "다크 버스트",
    "legacyNames": [
      "[헤비랜스] 다크 버스트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7500,
    "levelIncrease": 1500
  },
  {
    "id": "direct-0213",
    "skillId": 1803321,
    "skillIds": [
      1803321
    ],
    "effectId": 14021474,
    "effectIds": [
      14021474
    ],
    "job": "섀도우워커",
    "name": "[매직랜스] 다크 피어스",
    "internalName": "다크 피어스",
    "legacyNames": [
      "[매직랜스] 다크 피어스"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0214",
    "skillId": 1803321,
    "skillIds": [
      1803321
    ],
    "effectId": 13015022,
    "effectIds": [
      13015022,
      14021700
    ],
    "job": "섀도우워커",
    "name": "[헤비랜스] 다크 피어스",
    "internalName": "다크 피어스",
    "legacyNames": [
      "[헤비랜스] 다크 피어스"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0215",
    "skillId": 1803305,
    "skillIds": [
      1803305
    ],
    "effectId": 13017180,
    "effectIds": [
      13017180
    ],
    "job": "섀도우워커",
    "name": "[매직랜스] 스퍼트",
    "internalName": "스퍼트",
    "legacyNames": [
      "[매직랜스] 스퍼트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0216",
    "skillId": 1803305,
    "skillIds": [
      1803305
    ],
    "effectId": 13017183,
    "effectIds": [
      13017183
    ],
    "job": "섀도우워커",
    "name": "[헤비랜스] 스퍼트",
    "internalName": "스퍼트",
    "legacyNames": [
      "[헤비랜스] 스퍼트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0217",
    "skillId": 1803323,
    "skillIds": [
      1803323
    ],
    "effectId": 14021475,
    "effectIds": [
      14021475
    ],
    "job": "섀도우워커",
    "name": "[매직랜스] 다크 스피릿",
    "internalName": "다크 스피릿",
    "legacyNames": [
      "[매직랜스] 다크 스피릿"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0218",
    "skillId": 1803323,
    "skillIds": [
      1803323
    ],
    "effectId": 13015023,
    "effectIds": [
      13015023
    ],
    "job": "섀도우워커",
    "name": "[헤비랜스] 다크 스피릿",
    "internalName": "다크 스피릿",
    "legacyNames": [
      "[헤비랜스] 다크 스피릿"
    ],
    "coefficientSource": "effect",
    "baseCoef": 10000,
    "levelIncrease": 2000
  },
  {
    "id": "direct-0219",
    "skillId": 1802425,
    "skillIds": [
      1802425
    ],
    "effectId": 13025218,
    "effectIds": [
      13025218
    ],
    "job": "게이트키퍼",
    "name": "[인피니티] 브르탈 링",
    "internalName": "[인피니티] 브루탈 링",
    "legacyNames": [
      "[인피니티] 브르탈 링"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0220",
    "skillId": 1803801,
    "skillIds": [
      1803801
    ],
    "effectId": 13025221,
    "effectIds": [
      13025221
    ],
    "job": "게이트키퍼",
    "name": "링 슬래시",
    "internalName": "링 슬래시",
    "legacyNames": [
      "링 슬래시"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0221",
    "skillId": 1803802,
    "skillIds": [
      1803802
    ],
    "effectId": 13025223,
    "effectIds": [
      13025223
    ],
    "job": "게이트키퍼",
    "name": "라이징 블레이드",
    "internalName": "라이징 블레이드",
    "legacyNames": [
      "라이징 블레이드"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0222",
    "skillId": 1803807,
    "skillIds": [
      1803807
    ],
    "effectId": 13025229,
    "effectIds": [
      13025229
    ],
    "job": "게이트키퍼",
    "name": "빅풋",
    "internalName": "빅풋",
    "legacyNames": [
      "빅풋"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0223",
    "skillId": 1803804,
    "skillIds": [
      1803804
    ],
    "effectId": 13025226,
    "effectIds": [
      13025226
    ],
    "job": "게이트키퍼",
    "name": "아케인 게이트",
    "internalName": "아케인 게이트",
    "legacyNames": [
      "아케인 게이트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0224",
    "skillId": 1803806,
    "skillIds": [
      1803806
    ],
    "effectId": 13025228,
    "effectIds": [
      13025228
    ],
    "job": "게이트키퍼",
    "name": "터닝 샷",
    "internalName": "터닝 샷",
    "legacyNames": [
      "터닝 샷"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0225",
    "skillId": 1803811,
    "skillIds": [
      1803811
    ],
    "effectId": 13111941,
    "effectIds": [
      13111941
    ],
    "job": "게이트키퍼",
    "name": "미스틱 게이트",
    "internalName": "미스틱 게이트",
    "legacyNames": [
      "미스틱 게이트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7500,
    "levelIncrease": 1500
  },
  {
    "id": "direct-0226",
    "skillId": null,
    "skillIds": [
      1804080,
      9990990
    ],
    "effectId": null,
    "effectIds": [],
    "job": "검성",
    "name": "발도·귀신사냥",
    "internalName": null,
    "legacyNames": [
      "발도·귀신사냥"
    ],
    "coefficientSource": "fallback",
    "baseCoef": 9000,
    "levelIncrease": 1600
  },
  {
    "id": "direct-0227",
    "skillId": 1804070,
    "skillIds": [
      1804070
    ],
    "effectId": 13017004,
    "effectIds": [
      13017004
    ],
    "job": "검성",
    "name": "발도·물결베기",
    "internalName": "발도 · 물결베기",
    "legacyNames": [
      "발도·물결베기"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5200,
    "levelIncrease": 1040
  },
  {
    "id": "direct-0228",
    "skillId": null,
    "skillIds": [
      1804060,
      9990992
    ],
    "effectId": 13017021,
    "effectIds": [
      13017021
    ],
    "job": "검성",
    "name": "발도·폭풍참",
    "internalName": null,
    "legacyNames": [
      "발도·폭풍참"
    ],
    "coefficientSource": "effect",
    "baseCoef": 10000,
    "levelIncrease": 2000
  },
  {
    "id": "direct-0229",
    "skillId": 1804100,
    "skillIds": [
      1804100
    ],
    "effectId": 13016947,
    "effectIds": [
      13016947
    ],
    "job": "검성",
    "name": "납도·안개비",
    "internalName": "납도 · 안개비",
    "legacyNames": [
      "납도·안개비"
    ],
    "coefficientSource": "effect",
    "baseCoef": 15000,
    "levelIncrease": 2000
  },
  {
    "id": "direct-0230",
    "skillId": 1804110,
    "skillIds": [
      1804110
    ],
    "effectId": 13016947,
    "effectIds": [
      13016947
    ],
    "job": "검성",
    "name": "납도·여우비",
    "internalName": "납도 · 여우비",
    "legacyNames": [
      "납도·여우비"
    ],
    "coefficientSource": "effect",
    "baseCoef": 15000,
    "levelIncrease": 2000
  },
  {
    "id": "direct-0231",
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
    "job": "검성",
    "name": "납도·장대비",
    "internalName": null,
    "legacyNames": [
      "납도·장대비"
    ],
    "coefficientSource": "effect",
    "baseCoef": 15000,
    "levelIncrease": 2000
  },
  {
    "id": "direct-0232",
    "skillId": null,
    "skillIds": [
      1804120,
      1804142
    ],
    "effectId": 13112037,
    "effectIds": [
      13112037
    ],
    "job": "검성",
    "name": "납도-소나기",
    "internalName": null,
    "legacyNames": [
      "납도-소나기"
    ],
    "coefficientSource": "effect",
    "baseCoef": 10000,
    "levelIncrease": 2000
  },
  {
    "id": "direct-0233",
    "skillId": 1804000,
    "skillIds": [
      1804000
    ],
    "effectId": 13017006,
    "effectIds": [
      13017006
    ],
    "job": "검성",
    "name": "이슬 찌르기",
    "internalName": "이슬 찌르기",
    "legacyNames": [
      "이슬 찌르기"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2200,
    "levelIncrease": 440
  },
  {
    "id": "direct-0234",
    "skillId": 1804050,
    "skillIds": [
      1804050
    ],
    "effectId": 13017007,
    "effectIds": [
      13017007
    ],
    "job": "검성",
    "name": "낙화참",
    "internalName": "낙화참",
    "legacyNames": [
      "낙화참"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2350,
    "levelIncrease": 470
  },
  {
    "id": "direct-0235",
    "skillId": 1804020,
    "skillIds": [
      1804020
    ],
    "effectId": 13017008,
    "effectIds": [
      13017008
    ],
    "job": "검성",
    "name": "섬광참",
    "internalName": "섬광참",
    "legacyNames": [
      "섬광참"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0236",
    "skillId": 1804040,
    "skillIds": [
      1804040
    ],
    "effectId": 13017010,
    "effectIds": [
      13017010
    ],
    "job": "검성",
    "name": "와류베기",
    "internalName": "와류베기",
    "legacyNames": [
      "와류베기"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0237",
    "skillId": 1804010,
    "skillIds": [
      1804010
    ],
    "effectId": 13017107,
    "effectIds": [
      13017107
    ],
    "job": "검성",
    "name": "유성 가르기",
    "internalName": "유성 가르기",
    "legacyNames": [
      "유성 가르기"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3700,
    "levelIncrease": 740
  },
  {
    "id": "direct-0238",
    "skillId": 1804030,
    "skillIds": [
      1804030
    ],
    "effectId": 13017009,
    "effectIds": [
      13017009
    ],
    "job": "검성",
    "name": "단풍 쓸기",
    "internalName": "단풍 쓸기",
    "legacyNames": [
      "단풍 쓸기"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4300,
    "levelIncrease": 860
  },
  {
    "id": "direct-0239",
    "skillId": 1000023,
    "skillIds": [
      1000023
    ],
    "effectId": 21512903,
    "effectIds": [
      21512903
    ],
    "job": "하이랜더",
    "name": "스파이럴 에디션",
    "internalName": "스파이럴 에디션",
    "legacyNames": [
      "스파이럴 에디션"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3200,
    "levelIncrease": 640
  },
  {
    "id": "direct-0240",
    "skillId": 1001023,
    "skillIds": [
      1001023
    ],
    "effectId": 21512912,
    "effectIds": [
      21512912
    ],
    "job": "하이랜더",
    "name": "스파이럴 스톰",
    "internalName": "스파이럴 스톰",
    "legacyNames": [
      "스파이럴 스톰"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3750,
    "levelIncrease": 750
  },
  {
    "id": "direct-0241",
    "skillId": 1002023,
    "skillIds": [
      1002023
    ],
    "effectId": 21512921,
    "effectIds": [
      21512921
    ],
    "job": "하이랜더",
    "name": "스파이럴 프레스",
    "internalName": "스파이럴 프레스",
    "legacyNames": [
      "스파이럴 프레스"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0242",
    "skillId": 1010023,
    "skillIds": [
      1010023
    ],
    "effectId": 21526003,
    "effectIds": [
      21526003
    ],
    "job": "하이랜더",
    "name": "스파이럴 러쉬",
    "internalName": "스파이럴 러쉬",
    "legacyNames": [
      "스파이럴 러쉬"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0243",
    "skillId": 1003023,
    "skillIds": [
      1003023
    ],
    "effectId": 21512932,
    "effectIds": [
      21512932
    ],
    "job": "하이랜더",
    "name": "스파이럴 이럽션",
    "internalName": "스파이럴 이럽션",
    "legacyNames": [
      "스파이럴 이럽션"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0244",
    "skillId": 1013023,
    "skillIds": [
      1013023
    ],
    "effectId": 13111411,
    "effectIds": [
      13111411
    ],
    "job": "하이랜더",
    "name": "스파이럴 차지",
    "internalName": "스파이럴 차지",
    "legacyNames": [
      "스파이럴 차지"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0245",
    "skillId": 1003024,
    "skillIds": [
      1003024
    ],
    "effectId": 21513031,
    "effectIds": [
      21513031
    ],
    "job": "소드댄서",
    "name": "비연파천",
    "internalName": "비연파천",
    "legacyNames": [
      "비연파천"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0246",
    "skillId": 1001024,
    "skillIds": [
      1001024
    ],
    "effectId": 21513013,
    "effectIds": [
      21513013
    ],
    "job": "소드댄서",
    "name": "무한검진",
    "internalName": "무한검진",
    "legacyNames": [
      "무한검진"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0247",
    "skillId": 1000024,
    "skillIds": [
      1000024
    ],
    "effectId": 21513001,
    "effectIds": [
      21513001
    ],
    "job": "소드댄서",
    "name": "멸천비검술",
    "internalName": "멸천비검술",
    "legacyNames": [
      "멸천비검술"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0248",
    "skillId": 1002024,
    "skillIds": [
      1002024
    ],
    "effectId": 21513023,
    "effectIds": [
      21513023
    ],
    "job": "소드댄서",
    "name": "이기어검",
    "internalName": "이기어검",
    "legacyNames": [
      "이기어검"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0249",
    "skillId": 1005024,
    "skillIds": [
      1005024
    ],
    "effectId": 21513053,
    "effectIds": [
      21513053
    ],
    "job": "소드댄서",
    "name": "비연멸천공",
    "internalName": "비연멸천공",
    "legacyNames": [
      "비연멸천공"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3750,
    "levelIncrease": 750
  },
  {
    "id": "direct-0250",
    "skillId": 1011024,
    "skillIds": [
      1011024
    ],
    "effectId": 21526132,
    "effectIds": [
      21526132
    ],
    "job": "소드댄서",
    "name": "비검열참",
    "internalName": "비검열참",
    "legacyNames": [
      "비검열참"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0251",
    "skillId": 1000025,
    "skillIds": [
      1000025
    ],
    "effectId": 25200862,
    "effectIds": [
      25200862
    ],
    "job": "테러나이트",
    "name": "파워블리츠",
    "internalName": "파워블리츠",
    "legacyNames": [
      "파워블리츠"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1400
  },
  {
    "id": "direct-0252",
    "skillId": 2402603,
    "skillIds": [
      2402603
    ],
    "effectId": 25200863,
    "effectIds": [
      25200863
    ],
    "job": "테러나이트",
    "name": "스트라이크",
    "internalName": "스트라이크",
    "legacyNames": [
      "스트라이크"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6600,
    "levelIncrease": 1320
  },
  {
    "id": "direct-0253",
    "skillId": 1010025,
    "skillIds": [
      1010025
    ],
    "effectId": 13016567,
    "effectIds": [
      13016567
    ],
    "job": "테러나이트",
    "name": "디스페어",
    "internalName": "디스페어",
    "legacyNames": [
      "디스페어"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7500,
    "levelIncrease": 1500
  },
  {
    "id": "direct-0254",
    "skillId": 1002025,
    "skillIds": [
      1002025
    ],
    "effectId": 25200866,
    "effectIds": [
      25200866
    ],
    "job": "테러나이트",
    "name": "파워크래쉬",
    "internalName": "파워 크래쉬",
    "legacyNames": [
      "파워크래쉬"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0255",
    "skillId": 2402601,
    "skillIds": [
      2402601
    ],
    "effectId": 25200869,
    "effectIds": [
      25200869,
      25200870
    ],
    "job": "테러나이트",
    "name": "일렉트릭 드레인",
    "internalName": "일렉트릭 드레인",
    "legacyNames": [
      "일렉트릭 드레인"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0256",
    "skillId": 1001025,
    "skillIds": [
      1001025
    ],
    "effectId": 25200872,
    "effectIds": [
      25200872
    ],
    "job": "테러나이트",
    "name": "라이프드레인",
    "internalName": "라이프드레인",
    "legacyNames": [
      "라이프드레인"
    ],
    "coefficientSource": "effect",
    "baseCoef": 1760,
    "levelIncrease": 352
  },
  {
    "id": "direct-0257",
    "skillId": 1003025,
    "skillIds": [
      1003025
    ],
    "effectId": 25200871,
    "effectIds": [
      25200871
    ],
    "job": "테러나이트",
    "name": "데스 헨드",
    "internalName": "데스 핸드",
    "legacyNames": [
      "데스 헨드"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0258",
    "skillId": 2402706,
    "skillIds": [
      2402706
    ],
    "effectId": 25200745,
    "effectIds": [
      25200745
    ],
    "job": "사이키커",
    "name": "[인파이터] 원투",
    "internalName": "[인파이터] 원투",
    "legacyNames": [
      "[인파이터] 원투"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4900,
    "levelIncrease": 980
  },
  {
    "id": "direct-0259",
    "skillId": 1001026,
    "skillIds": [
      1001026
    ],
    "effectId": 25200890,
    "effectIds": [
      25200890
    ],
    "job": "사이키커",
    "name": "[인파이터] 어퍼",
    "internalName": "[인파이터] 어퍼",
    "legacyNames": [
      "[인파이터] 어퍼"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4900,
    "levelIncrease": 980
  },
  {
    "id": "direct-0260",
    "skillId": 1001026,
    "skillIds": [
      1001026
    ],
    "effectId": 25200890,
    "effectIds": [
      25200890
    ],
    "job": "사이키커",
    "name": "[인파이터] 어퍼 [2동작]",
    "internalName": "[인파이터] 어퍼",
    "legacyNames": [
      "[인파이터] 어퍼 [2동작]"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4900,
    "levelIncrease": 980
  },
  {
    "id": "direct-0261",
    "skillId": 1000026,
    "skillIds": [
      1000026
    ],
    "effectId": 21513101,
    "effectIds": [
      21513101
    ],
    "job": "사이키커",
    "name": "[인파이터] 훅",
    "internalName": "[인파이터] 훅",
    "legacyNames": [
      "[인파이터] 훅"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7500,
    "levelIncrease": 1500
  },
  {
    "id": "direct-0262",
    "skillId": 1005026,
    "skillIds": [
      1005026
    ],
    "effectId": 21513141,
    "effectIds": [
      21513141
    ],
    "job": "사이키커",
    "name": "[인파이터] 콤비네이션",
    "internalName": "[인파이터] 콤비네이션",
    "legacyNames": [
      "[인파이터] 콤비네이션"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1400
  },
  {
    "id": "direct-0263",
    "skillId": 2402705,
    "skillIds": [
      2402705
    ],
    "effectId": 25200744,
    "effectIds": [
      25200744
    ],
    "job": "사이키커",
    "name": "[아웃파이터] 기공",
    "internalName": "[아웃파이터] 기공",
    "legacyNames": [
      "[아웃파이터] 기공"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0264",
    "skillId": 1002026,
    "skillIds": [
      1002026
    ],
    "effectId": 21513121,
    "effectIds": [
      21513121
    ],
    "job": "사이키커",
    "name": "[아웃파이터] 웨이브",
    "internalName": "[아웃파이터] 웨이브",
    "legacyNames": [
      "[아웃파이터] 웨이브"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0265",
    "skillId": 1000027,
    "skillIds": [
      1000027
    ],
    "effectId": 21513206,
    "effectIds": [
      21513206
    ],
    "job": "팬텀메이지",
    "name": "데빌사이드 [어택]",
    "internalName": "데빌사이드 [어택]",
    "legacyNames": [
      "데빌사이드 [어택]"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0266",
    "skillId": 2402801,
    "skillIds": [
      2402801
    ],
    "effectId": 25200761,
    "effectIds": [
      25200761
    ],
    "job": "팬텀메이지",
    "name": "데빌사이드 [카운터]",
    "internalName": "데빌사이드 [카운터]",
    "legacyNames": [
      "데빌사이드 [카운터]"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0267",
    "skillId": 2402803,
    "skillIds": [
      2402803
    ],
    "effectId": 25200769,
    "effectIds": [
      25200769
    ],
    "job": "팬텀메이지",
    "name": "데빌사이드 [트리플]",
    "internalName": "데빌사이드 [트리플]",
    "legacyNames": [
      "데빌사이드 [트리플]"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0268",
    "skillId": 2402802,
    "skillIds": [
      2402802
    ],
    "effectId": 25200765,
    "effectIds": [
      25200765
    ],
    "job": "팬텀메이지",
    "name": "데빌사이드 [립]",
    "internalName": "데빌사이드 [립]",
    "legacyNames": [
      "데빌사이드 [립]"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0269",
    "skillId": 1011027,
    "skillIds": [
      1011027
    ],
    "effectId": 25200771,
    "effectIds": [
      25200771
    ],
    "job": "팬텀메이지",
    "name": "데빌사이드 [스틱]",
    "internalName": "데빌사이드 [스틱]",
    "legacyNames": [
      "데빌사이드 [스틱]"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0270",
    "skillId": 1003027,
    "skillIds": [
      1003027
    ],
    "effectId": 21513236,
    "effectIds": [
      21513236
    ],
    "job": "팬텀메이지",
    "name": "윈드밀",
    "internalName": "윈드밀 [風]",
    "legacyNames": [
      "윈드밀"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0271",
    "skillId": 1001028,
    "skillIds": [
      1001028
    ],
    "effectId": 21513311,
    "effectIds": [
      21513311
    ],
    "job": "마에스트로",
    "name": "라르가멘테",
    "internalName": "라르가멘테",
    "legacyNames": [
      "라르가멘테"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0272",
    "skillId": 1000028,
    "skillIds": [
      1000028
    ],
    "effectId": 21513301,
    "effectIds": [
      21513301
    ],
    "job": "마에스트로",
    "name": "그라치오조",
    "internalName": "그라치오조",
    "legacyNames": [
      "그라치오조"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0273",
    "skillId": 1002028,
    "skillIds": [
      1002028
    ],
    "effectId": 21513321,
    "effectIds": [
      21513321
    ],
    "job": "마에스트로",
    "name": "파이어리히",
    "internalName": "파이어리히",
    "legacyNames": [
      "파이어리히"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0274",
    "skillId": 1005028,
    "skillIds": [
      1005028
    ],
    "effectId": 21513351,
    "effectIds": [
      21513351
    ],
    "job": "마에스트로",
    "name": "크레센도",
    "internalName": "크레센도",
    "legacyNames": [
      "크레센도"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0275",
    "skillId": 1010028,
    "skillIds": [
      1010028
    ],
    "effectId": 21526501,
    "effectIds": [
      21526501
    ],
    "job": "마에스트로",
    "name": "비르투오소",
    "internalName": "비르투오소",
    "legacyNames": [
      "비르투오소"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1400
  },
  {
    "id": "direct-0276",
    "skillId": 1003028,
    "skillIds": [
      1003028
    ],
    "effectId": 21513331,
    "effectIds": [
      21513331
    ],
    "job": "마에스트로",
    "name": "프레스티시모",
    "internalName": "프레스티시모",
    "legacyNames": [
      "프레스티시모"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0277",
    "skillId": 2403004,
    "skillIds": [
      2403004
    ],
    "effectId": 25200812,
    "effectIds": [
      25200812
    ],
    "job": "로그마스터",
    "name": "인법_교",
    "internalName": "인법_교(攪)",
    "legacyNames": [
      "인법_교"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0278",
    "skillId": 2403003,
    "skillIds": [
      2403003
    ],
    "effectId": 21526601,
    "effectIds": [
      21526601
    ],
    "job": "로그마스터",
    "name": "인법_환",
    "internalName": "인법_환(幻)",
    "legacyNames": [
      "인법_환"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0279",
    "skillId": 2403002,
    "skillIds": [
      2403002
    ],
    "effectId": 25200816,
    "effectIds": [
      25200816
    ],
    "job": "로그마스터",
    "name": "인법_뢰",
    "internalName": "인법_뢰(雷)",
    "legacyNames": [
      "인법_뢰"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3800,
    "levelIncrease": 760
  },
  {
    "id": "direct-0280",
    "skillId": 2403001,
    "skillIds": [
      2403001
    ],
    "effectId": 25200808,
    "effectIds": [
      25200808
    ],
    "job": "로그마스터",
    "name": "인법_속",
    "internalName": "인법_속(速)",
    "legacyNames": [
      "인법_속"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0281",
    "skillId": 1002029,
    "skillIds": [
      1002029
    ],
    "effectId": 21513521,
    "effectIds": [
      21513521
    ],
    "job": "로그마스터",
    "name": "인법_무",
    "internalName": "인법_무(誣)",
    "legacyNames": [
      "인법_무"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0282",
    "skillId": 1000029,
    "skillIds": [
      1000029
    ],
    "effectId": 21513501,
    "effectIds": [
      21513501,
      21513502
    ],
    "job": "로그마스터",
    "name": "인법_경",
    "internalName": "인법_경(絅)",
    "legacyNames": [
      "인법_경"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0283",
    "skillId": 1001030,
    "skillIds": [
      1001030
    ],
    "effectId": 21513621,
    "effectIds": [
      21513621
    ],
    "job": "저지먼트",
    "name": "기어 슬래시",
    "internalName": "기어 슬래시",
    "legacyNames": [
      "기어 슬래시"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0284",
    "skillId": 1005030,
    "skillIds": [
      1005030
    ],
    "effectId": 21513651,
    "effectIds": [
      21513651
    ],
    "job": "저지먼트",
    "name": "롤 스나이핑",
    "internalName": "롤 스나이핑",
    "legacyNames": [
      "롤 스나이핑"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0285",
    "skillId": 2403101,
    "skillIds": [
      2403101
    ],
    "effectId": 25200900,
    "effectIds": [
      25200900
    ],
    "job": "저지먼트",
    "name": "트위스터",
    "internalName": "트위스터",
    "legacyNames": [
      "트위스터"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0286",
    "skillId": 1000030,
    "skillIds": [
      1000030
    ],
    "effectId": 21513601,
    "effectIds": [
      21513601
    ],
    "job": "저지먼트",
    "name": "스나이핑",
    "internalName": "스나이핑",
    "legacyNames": [
      "스나이핑"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1400
  },
  {
    "id": "direct-0287",
    "skillId": 1010030,
    "skillIds": [
      1010030
    ],
    "effectId": 21526702,
    "effectIds": [
      21526702
    ],
    "job": "저지먼트",
    "name": "프라이트",
    "internalName": "프라이트",
    "legacyNames": [
      "프라이트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0288",
    "skillId": 1004030,
    "skillIds": [
      1004030
    ],
    "effectId": 21513641,
    "effectIds": [
      21513641
    ],
    "job": "저지먼트",
    "name": "트리니티 포스",
    "internalName": "트리니티 포스",
    "legacyNames": [
      "트리니티 포스"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0289",
    "skillId": 1006030,
    "skillIds": [
      1006030
    ],
    "effectId": 21020689,
    "effectIds": [
      21020689
    ],
    "job": "저지먼트",
    "name": "즉결심판",
    "internalName": "즉결심판",
    "legacyNames": [
      "즉결심판"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3250,
    "levelIncrease": 650
  },
  {
    "id": "direct-0290",
    "skillId": 1011030,
    "skillIds": [
      1011030
    ],
    "effectId": 21513641,
    "effectIds": [
      21513641
    ],
    "job": "저지먼트",
    "name": "크루얼건",
    "internalName": "크루얼건",
    "legacyNames": [
      "크루얼건"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0291",
    "skillId": 1003030,
    "skillIds": [
      1003030
    ],
    "effectId": 21505323,
    "effectIds": [
      21505323
    ],
    "job": "저지먼트",
    "name": "J-31 그레네이드",
    "internalName": "J-31 그레네이드",
    "legacyNames": [
      "J-31 그레네이드"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0292",
    "skillId": 1005031,
    "skillIds": [
      1005031
    ],
    "effectId": 21513452,
    "effectIds": [
      21513452
    ],
    "job": "스타시커",
    "name": "DM-DR",
    "internalName": "DM-DR",
    "legacyNames": [
      "DM-DR"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0293",
    "skillId": 1007031,
    "skillIds": [
      1007031
    ],
    "effectId": 21513471,
    "effectIds": [
      21513471
    ],
    "job": "스타시커",
    "name": "DM-GR",
    "internalName": "DM-GR",
    "legacyNames": [
      "DM-GR"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0294",
    "skillId": 1011031,
    "skillIds": [
      1011031
    ],
    "effectId": 21526941,
    "effectIds": [
      21526941
    ],
    "job": "스타시커",
    "name": "DM-EMP",
    "internalName": "DM-EMP",
    "legacyNames": [
      "DM-EMP"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0295",
    "skillId": 2403201,
    "skillIds": [
      2403201
    ],
    "effectId": 13111421,
    "effectIds": [
      13111421
    ],
    "job": "스타시커",
    "name": "DS-DR",
    "internalName": "DS-DR",
    "legacyNames": [
      "DS-DR"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0296",
    "skillId": 1804331,
    "skillIds": [
      1804331
    ],
    "effectId": 81003617,
    "effectIds": [
      81003617
    ],
    "job": "스타시커",
    "name": "DM-RS",
    "internalName": "DM-RS",
    "legacyNames": [
      "DM-RS"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0297",
    "skillId": 2406902,
    "skillIds": [
      2406902
    ],
    "effectId": 25200837,
    "effectIds": [
      25200837
    ],
    "job": "쥬얼스타",
    "name": "가넷 [레드]",
    "internalName": "가넷 [레드]",
    "legacyNames": [
      "가넷 [레드]"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0298",
    "skillId": 2406904,
    "skillIds": [
      2406904
    ],
    "effectId": 13025488,
    "effectIds": [
      13025488
    ],
    "job": "쥬얼스타",
    "name": "에메랄드 [그린]",
    "internalName": "에메랄드 [그린]",
    "legacyNames": [
      "에메랄드 [그린]"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0299",
    "skillId": 2406901,
    "skillIds": [
      2406901
    ],
    "effectId": 25200840,
    "effectIds": [
      25200840
    ],
    "job": "쥬얼스타",
    "name": "디스커버리 [그린]",
    "internalName": "디스커버리 [그린]",
    "legacyNames": [
      "디스커버리 [그린]"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1400
  },
  {
    "id": "direct-0300",
    "skillId": 2406903,
    "skillIds": [
      2406903
    ],
    "effectId": 25200838,
    "effectIds": [
      25200838
    ],
    "job": "쥬얼스타",
    "name": "에메시스트 [퍼플]",
    "internalName": "에메시스트 [퍼플]",
    "legacyNames": [
      "에메시스트 [퍼플]"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0301",
    "skillId": 2406908,
    "skillIds": [
      2406908
    ],
    "effectId": 13111581,
    "effectIds": [
      13111581
    ],
    "job": "쥬얼스타",
    "name": "포에닉스 [레인보우]",
    "internalName": "포에닉스 [레인보우]",
    "legacyNames": [
      "포에닉스 [레인보우]"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0302",
    "skillId": 1803501,
    "skillIds": [
      1803501
    ],
    "effectId": 13004883,
    "effectIds": [
      13004883
    ],
    "job": "윈디아",
    "name": "윈드 블레이드 : 차지",
    "internalName": "윈드 블레이드 : 차지",
    "legacyNames": [
      "윈드 블레이드 : 차지"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0303",
    "skillId": 1803503,
    "skillIds": [
      1803503
    ],
    "effectId": 13004880,
    "effectIds": [
      13004880
    ],
    "job": "윈디아",
    "name": "테일 윈드 : 차지",
    "internalName": "테일 윈드 : 차지",
    "legacyNames": [
      "테일 윈드 : 차지"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0304",
    "skillId": 1803505,
    "skillIds": [
      1803505
    ],
    "effectId": 13004885,
    "effectIds": [
      13004885
    ],
    "job": "윈디아",
    "name": "윈드 스톰 : 릴리즈",
    "internalName": "윈드 스톰 : 릴리즈",
    "legacyNames": [
      "윈드 스톰 : 릴리즈"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 400
  },
  {
    "id": "direct-0305",
    "skillId": 1803500,
    "skillIds": [
      1803500
    ],
    "effectId": 13004882,
    "effectIds": [
      13004882
    ],
    "job": "윈디아",
    "name": "플라잉 어택 : 차지",
    "internalName": "플라잉 어택 : 차지",
    "legacyNames": [
      "플라잉 어택 : 차지"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0306",
    "skillId": 1803502,
    "skillIds": [
      1803502
    ],
    "effectId": 13004886,
    "effectIds": [
      13004886
    ],
    "job": "윈디아",
    "name": "스톰 샷 : 릴리즈",
    "internalName": "스톰 샷 : 릴리즈",
    "legacyNames": [
      "스톰 샷 : 릴리즈"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0307",
    "skillId": 1803506,
    "skillIds": [
      1803506
    ],
    "effectId": 13004884,
    "effectIds": [
      13004884
    ],
    "job": "윈디아",
    "name": "게일 : 차지",
    "internalName": "게일 : 차지",
    "legacyNames": [
      "게일 : 차지"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5500,
    "levelIncrease": 1100
  },
  {
    "id": "direct-0308",
    "skillId": 1803504,
    "skillIds": [
      1803504
    ],
    "effectId": 13004887,
    "effectIds": [
      13004887
    ],
    "job": "윈디아",
    "name": "휠윈드 : 릴리즈",
    "internalName": "휠윈드 : 릴리즈",
    "legacyNames": [
      "휠윈드 : 릴리즈"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0309",
    "skillId": 1803700,
    "skillIds": [
      1803700
    ],
    "effectId": 13004980,
    "effectIds": [
      13004980
    ],
    "job": "레이니아",
    "name": "스윙웨이브",
    "internalName": "스윙 웨이브",
    "legacyNames": [
      "스윙웨이브"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0310",
    "skillId": 1803707,
    "skillIds": [
      1803707
    ],
    "effectId": 13004987,
    "effectIds": [
      13004987
    ],
    "job": "레이니아",
    "name": "아쿠아샷",
    "internalName": "아쿠아 샷",
    "legacyNames": [
      "아쿠아샷"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0311",
    "skillId": 1803703,
    "skillIds": [
      1803703
    ],
    "effectId": 13004983,
    "effectIds": [
      13004983
    ],
    "job": "레이니아",
    "name": "워터 프로텍트",
    "internalName": "워터 프로텍트",
    "legacyNames": [
      "워터 프로텍트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5000,
    "levelIncrease": 1000
  },
  {
    "id": "direct-0312",
    "skillId": 1803705,
    "skillIds": [
      1803705
    ],
    "effectId": 13004985,
    "effectIds": [
      13004985
    ],
    "job": "레이니아",
    "name": "빅웨이브",
    "internalName": "빅 웨이브",
    "legacyNames": [
      "빅웨이브"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0313",
    "skillId": 1803706,
    "skillIds": [
      1803706
    ],
    "effectId": 13004986,
    "effectIds": [
      13004986
    ],
    "job": "레이니아",
    "name": "워터캐논",
    "internalName": "워터 캐논",
    "legacyNames": [
      "워터캐논"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0314",
    "skillId": 1803702,
    "skillIds": [
      1803702
    ],
    "effectId": 13004982,
    "effectIds": [
      13004982
    ],
    "job": "레이니아",
    "name": "마엘스트롬",
    "internalName": "마엘스트롬",
    "legacyNames": [
      "마엘스트롬"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4000,
    "levelIncrease": 800
  },
  {
    "id": "direct-0315",
    "skillId": 1804200,
    "skillIds": [
      1804200
    ],
    "effectId": 13014197,
    "effectIds": [
      13014197
    ],
    "job": "도깨비",
    "name": "[인피니티] 환영귀화",
    "internalName": "[인피니티] 환영귀화",
    "legacyNames": [
      "[인피니티] 환영귀화"
    ],
    "coefficientSource": "effect",
    "baseCoef": 2000,
    "levelIncrease": 500
  },
  {
    "id": "direct-0316",
    "skillId": 1804210,
    "skillIds": [
      1804210
    ],
    "effectId": 13014190,
    "effectIds": [
      13014190
    ],
    "job": "도깨비",
    "name": "귀화",
    "internalName": "귀화",
    "legacyNames": [
      "귀화"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3500,
    "levelIncrease": 700
  },
  {
    "id": "direct-0317",
    "skillId": 1804270,
    "skillIds": [
      1804270
    ],
    "effectId": 13014196,
    "effectIds": [
      13014196
    ],
    "job": "도깨비",
    "name": "업화",
    "internalName": "업화",
    "legacyNames": [
      "업화"
    ],
    "coefficientSource": "effect",
    "baseCoef": 7000,
    "levelIncrease": 1400
  },
  {
    "id": "direct-0318",
    "skillId": 1804220,
    "skillIds": [
      1804220
    ],
    "effectId": 13014191,
    "effectIds": [
      13014191
    ],
    "job": "도깨비",
    "name": "클러치 히트",
    "internalName": "클러치 히트",
    "legacyNames": [
      "클러치 히트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 3300,
    "levelIncrease": 660
  },
  {
    "id": "direct-0319",
    "skillId": 1804230,
    "skillIds": [
      1804230
    ],
    "effectId": 13014192,
    "effectIds": [
      13014192
    ],
    "job": "도깨비",
    "name": "홈 런 !",
    "internalName": "홈 런 !",
    "legacyNames": [
      "홈 런 !"
    ],
    "coefficientSource": "effect",
    "baseCoef": 6000,
    "levelIncrease": 1200
  },
  {
    "id": "direct-0320",
    "skillId": 1804240,
    "skillIds": [
      1804240
    ],
    "effectId": 13014193,
    "effectIds": [
      13014193
    ],
    "job": "도깨비",
    "name": "사이클링 히트",
    "internalName": "사이클링 히트",
    "legacyNames": [
      "사이클링 히트"
    ],
    "coefficientSource": "effect",
    "baseCoef": 5300,
    "levelIncrease": 1060
  },
  {
    "id": "direct-0321",
    "skillId": 1804250,
    "skillIds": [
      1804250
    ],
    "effectId": 13014194,
    "effectIds": [
      13014194
    ],
    "job": "도깨비",
    "name": "신출귀몰",
    "internalName": "신출귀몰",
    "legacyNames": [
      "신출귀몰"
    ],
    "coefficientSource": "effect",
    "baseCoef": 4500,
    "levelIncrease": 900
  },
  {
    "id": "direct-0322",
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
    "job": "직업 공용",
    "name": "[각성] 레전드 1",
    "internalName": null,
    "legacyNames": [
      "[각성] 레전드 1"
    ],
    "coefficientSource": "effect",
    "baseCoef": 39700,
    "levelIncrease": 300
  },
  {
    "id": "direct-0323",
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
    "job": "직업 공용",
    "name": "레전드 2",
    "internalName": null,
    "legacyNames": [
      "레전드 2"
    ],
    "coefficientSource": "effect",
    "baseCoef": 39700,
    "levelIncrease": 300
  },
  {
    "id": "direct-0324",
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
    "job": "직업 공용",
    "name": "[각성] 코어",
    "internalName": null,
    "legacyNames": [
      "[각성] 코어"
    ],
    "coefficientSource": "effect",
    "baseCoef": 29850,
    "levelIncrease": 150
  },
  {
    "id": "direct-0325",
    "skillId": null,
    "skillIds": [
      10501,
      11003
    ],
    "effectId": null,
    "effectIds": [],
    "job": "직업 공용",
    "name": "밀키웨이, 유키나 추가대미지",
    "internalName": null,
    "legacyNames": [
      "밀키웨이, 유키나 추가대미지"
    ],
    "coefficientSource": "fallback",
    "baseCoef": 4000,
    "levelIncrease": 0
  }
];

export const placementSkills = [
  {
    "id": "placement-0001",
    "skillId": 1107025,
    "skillIds": [
      1107025
    ],
    "attackEffectIds": [
      81007241
    ],
    "summonEffectIds": [],
    "summonStatIds": [],
    "job": "히어로 (검)",
    "name": "십자베기",
    "internalNames": [
      "십자베기"
    ],
    "legacyNames": [
      "십자베기"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "fallback",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.2575,
    "levelTotalMult": 0.0425,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.1,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0002",
    "skillId": 1212007,
    "skillIds": [
      1212007
    ],
    "attackEffectIds": [
      21505240
    ],
    "summonEffectIds": [
      81006186
    ],
    "summonStatIds": [
      16016
    ],
    "job": "히어로 (창)",
    "name": "라이트닝 랜스",
    "internalNames": [
      "라이트닝 랜스"
    ],
    "legacyNames": [
      "라이트닝 랜스"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.4,
    "levelTotalMult": 0.05,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.2,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0003",
    "skillId": 1210105,
    "skillIds": [
      1210105
    ],
    "attackEffectIds": [
      13111764
    ],
    "summonEffectIds": [
      13111369
    ],
    "summonStatIds": [
      16011
    ],
    "job": "검호",
    "name": "케나인 블레이드",
    "internalNames": [
      "케나인 블레이드"
    ],
    "legacyNames": [
      "케나인 블레이드"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.305,
    "levelTotalMult": 0.0475,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.1,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0004",
    "skillId": 1210004,
    "skillIds": [
      1210004
    ],
    "attackEffectIds": [
      13025826
    ],
    "summonEffectIds": [
      13111374
    ],
    "summonStatIds": [
      16011
    ],
    "job": "세이버 (검)",
    "name": "소드브레스",
    "internalNames": [
      "소드 브레스"
    ],
    "legacyNames": [
      "소드브레스"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.245,
    "levelTotalMult": 0.0475,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.1,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0005",
    "skillId": 1109406,
    "skillIds": [
      1109406
    ],
    "attackEffectIds": [
      21505235
    ],
    "summonEffectIds": [
      81007456
    ],
    "summonStatIds": [
      16019
    ],
    "job": "세이버 (둔기)",
    "name": "해머타이푼",
    "internalNames": [
      "해머 타이푼"
    ],
    "legacyNames": [
      "해머타이푼"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.6225,
    "levelTotalMult": 0.0525,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.26,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0006",
    "skillId": 1210002,
    "skillIds": [
      1210002
    ],
    "attackEffectIds": [
      21505239
    ],
    "summonEffectIds": [
      81006195
    ],
    "summonStatIds": [
      16016
    ],
    "job": "세피로트",
    "name": "대지파열",
    "internalNames": [
      "대지파열"
    ],
    "legacyNames": [
      "대지파열"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.415,
    "levelTotalMult": 0.045,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.2,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0007",
    "skillId": 2104104,
    "skillIds": [
      2104104
    ],
    "attackEffectIds": [
      81007230
    ],
    "summonEffectIds": [
      81007625
    ],
    "summonStatIds": [
      16011
    ],
    "job": "아크메이지",
    "name": "아이스 플랭크",
    "internalNames": [
      "아이스 플랭크"
    ],
    "legacyNames": [
      "아이스 플랭크"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.2,
    "levelTotalMult": 0.05,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.1,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0008",
    "skillId": null,
    "skillIds": [],
    "attackEffectIds": [
      32000116
    ],
    "summonEffectIds": [],
    "summonStatIds": [],
    "job": "파픈스타",
    "name": "일렉트릭 웨이브",
    "internalNames": [],
    "legacyNames": [
      "일렉트릭 웨이브"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "fallback",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.19,
    "levelTotalMult": 0.045,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.1,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0009",
    "skillId": 1107033,
    "skillIds": [
      1107033
    ],
    "attackEffectIds": [
      81007233
    ],
    "summonEffectIds": [
      81006266
    ],
    "summonStatIds": [
      16013
    ],
    "job": "윈드스토커 (단검)",
    "name": "펜 오브 나이프",
    "internalNames": [
      "펜 오브 나이프"
    ],
    "legacyNames": [
      "펜 오브 나이프"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.315,
    "levelTotalMult": 0.0475,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.14,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0010",
    "skillId": 1210008,
    "skillIds": [
      1210008
    ],
    "attackEffectIds": [
      81007235
    ],
    "summonEffectIds": [
      81006268
    ],
    "summonStatIds": [
      16016
    ],
    "job": "윈드스토커 (활)",
    "name": "에로우 트랩",
    "internalNames": [
      "애로우 트랩"
    ],
    "legacyNames": [
      "에로우 트랩"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.415,
    "levelTotalMult": 0.0475,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.2,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0011",
    "skillId": 1105009,
    "skillIds": [
      1105009
    ],
    "attackEffectIds": [
      13111811
    ],
    "summonEffectIds": [
      13111553
    ],
    "summonStatIds": [
      16011
    ],
    "job": "윈드스토커 (석궁)",
    "name": "와이드 샷",
    "internalNames": [
      "와이드 샷"
    ],
    "legacyNames": [
      "와이드 샷"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.2575,
    "levelTotalMult": 0.0425,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.1,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0012",
    "skillId": 1108020,
    "skillIds": [
      1108020
    ],
    "attackEffectIds": [
      21111024
    ],
    "summonEffectIds": [
      14021724
    ],
    "summonStatIds": [
      16017
    ],
    "job": "프라이쉬츠",
    "name": "디스트로이 홀",
    "internalNames": [
      "디스트로이 홀"
    ],
    "legacyNames": [
      "디스트로이 홀"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.51,
    "levelTotalMult": 0.05,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.22,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0013",
    "skillId": 1212023,
    "skillIds": [
      1212023
    ],
    "attackEffectIds": [
      81007716
    ],
    "summonEffectIds": [],
    "summonStatIds": [],
    "job": "소디언",
    "name": "하이퍼캐논",
    "internalNames": [
      "하이퍼 캐논"
    ],
    "legacyNames": [
      "하이퍼캐논"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "fallback",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.5,
    "levelTotalMult": 0.05,
    "weaponAttrCoef": 82,
    "baseStrMagMult": 1.24,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0014",
    "skillId": 1210036,
    "skillIds": [
      1210036
    ],
    "attackEffectIds": [
      13111818
    ],
    "summonEffectIds": [
      13111560
    ],
    "summonStatIds": [
      16019
    ],
    "job": "소울리스 원",
    "name": "소울 마스터4 (다크)",
    "internalNames": [
      "소울 마스터 IV"
    ],
    "legacyNames": [
      "소울 마스터4 (다크)"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.6,
    "levelTotalMult": 0.0525,
    "weaponAttrCoef": 162,
    "baseStrMagMult": 1.26,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0015",
    "skillId": null,
    "skillIds": [
      7001213,
      7001214
    ],
    "attackEffectIds": [
      32000109
    ],
    "summonEffectIds": [],
    "summonStatIds": [],
    "job": "아크마스터",
    "name": "봉인해제",
    "internalNames": [
      "봉인해제 [A 덱]",
      "봉인해제 [B 덱]"
    ],
    "legacyNames": [
      "봉인해제"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "fallback",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 2.47,
    "levelTotalMult": 0,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.6,
    "levelStrMagMult": 0
  },
  {
    "id": "placement-0016",
    "skillId": 2212004,
    "skillIds": [
      2212004
    ],
    "attackEffectIds": [
      13016317
    ],
    "summonEffectIds": [
      13016347
    ],
    "summonStatIds": [
      16013
    ],
    "job": "아크마스터",
    "name": "버스트 카드",
    "internalNames": [
      "버스트 카드"
    ],
    "legacyNames": [
      "버스트 카드"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.2675,
    "levelTotalMult": 0.0475,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.14,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0017",
    "skillId": null,
    "skillIds": [],
    "attackEffectIds": [
      13025580
    ],
    "summonEffectIds": [],
    "summonStatIds": [],
    "job": "포스마스터",
    "name": "봉인몬스터",
    "internalNames": [],
    "legacyNames": [
      "봉인몬스터"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "fallback",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.545,
    "levelTotalMult": 0.055,
    "weaponAttrCoef": 62,
    "baseStrMagMult": 1.26,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0018",
    "skillId": 1313250,
    "skillIds": [
      1313250
    ],
    "attackEffectIds": [
      13111760
    ],
    "summonEffectIds": [
      13111365
    ],
    "summonStatIds": [
      16016
    ],
    "job": "포스마스터",
    "name": "스페셜 킥",
    "internalNames": [
      "[♠] 스페셜 킥"
    ],
    "legacyNames": [
      "스페셜 킥"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.3825,
    "levelTotalMult": 0.0525,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.2,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0019",
    "skillId": 1410056,
    "skillIds": [
      1410056
    ],
    "attackEffectIds": [
      27152601
    ],
    "summonEffectIds": [
      13111879
    ],
    "summonStatIds": [
      16016
    ],
    "job": "흑영(옥)",
    "name": "파괴의 그림자",
    "internalNames": [
      "파괴의 그림자"
    ],
    "legacyNames": [
      "파괴의 그림자"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.405,
    "levelTotalMult": 0.0475,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.2,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0020",
    "skillId": 1411056,
    "skillIds": [
      1411056
    ],
    "attackEffectIds": [
      27152701
    ],
    "summonEffectIds": [
      13016310
    ],
    "summonStatIds": [
      16017
    ],
    "job": "흑영(도)",
    "name": "그림자 칼날",
    "internalNames": [
      "그림자 칼날"
    ],
    "legacyNames": [
      "그림자 칼날"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.5025,
    "levelTotalMult": 0.0525,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.22,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0021",
    "skillId": 1759107,
    "skillIds": [
      1759107
    ],
    "attackEffectIds": [
      13025907
    ],
    "summonEffectIds": [
      13016510
    ],
    "summonStatIds": [
      16013
    ],
    "job": "데미갓(신성)",
    "name": "글로리아",
    "internalNames": [
      "글로리아"
    ],
    "legacyNames": [
      "글로리아"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.3175,
    "levelTotalMult": 0.0475,
    "weaponAttrCoef": 82,
    "baseStrMagMult": 1.14,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0022",
    "skillId": 1759107,
    "skillIds": [
      1759107
    ],
    "attackEffectIds": [
      13017288
    ],
    "summonEffectIds": [
      13016510
    ],
    "summonStatIds": [
      16013
    ],
    "job": "데미갓(분노)",
    "name": "글로리아",
    "internalNames": [
      "글로리아"
    ],
    "legacyNames": [
      "글로리아"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.4675,
    "levelTotalMult": 0.0525,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.14,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0023",
    "skillId": 1801312,
    "skillIds": [
      1801312
    ],
    "attackEffectIds": [
      21505229
    ],
    "summonEffectIds": [
      81006247
    ],
    "summonStatIds": [
      16006
    ],
    "job": "아그니",
    "name": "인페르노",
    "internalNames": [
      "인페르노"
    ],
    "legacyNames": [
      "인페르노"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.02,
    "levelTotalMult": 0.045,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0024",
    "skillId": null,
    "skillIds": [
      1802306,
      9990978
    ],
    "attackEffectIds": [
      21505226
    ],
    "summonEffectIds": [
      13025841
    ],
    "summonStatIds": [
      16016
    ],
    "job": "다크체이서",
    "name": "체인버스트",
    "internalNames": [
      "체인 버스트",
      "체인 버스트"
    ],
    "legacyNames": [
      "체인버스트"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.41,
    "levelTotalMult": 0.05,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.2,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0025",
    "skillId": 1803323,
    "skillIds": [
      1803323
    ],
    "attackEffectIds": [
      21505225
    ],
    "summonEffectIds": [
      13025438
    ],
    "summonStatIds": [
      16013
    ],
    "job": "섀도우워커",
    "name": "다크 스피릿",
    "internalNames": [
      "다크 스피릿"
    ],
    "legacyNames": [
      "다크 스피릿"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.3,
    "levelTotalMult": 0.05,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.14,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0026",
    "skillId": 1803805,
    "skillIds": [
      1803805
    ],
    "attackEffectIds": [
      13025293
    ],
    "summonEffectIds": [],
    "summonStatIds": [],
    "job": "게이트키퍼",
    "name": "트위스트 링",
    "internalNames": [
      "트위스트 링"
    ],
    "legacyNames": [
      "트위스트 링"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "fallback",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.15,
    "levelTotalMult": 0.052,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.1,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0027",
    "skillId": null,
    "skillIds": [
      1804120,
      1804142,
      9990993
    ],
    "attackEffectIds": [
      13017059
    ],
    "summonEffectIds": [
      13017060
    ],
    "summonStatIds": [
      16031
    ],
    "job": "검성",
    "name": "납도 - 장대비",
    "internalNames": [
      "납도 · 장대비",
      "납도 · 장대비",
      "납도 · 장대비"
    ],
    "legacyNames": [
      "납도 - 장대비"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 2.3,
    "levelTotalMult": 0,
    "weaponAttrCoef": 62,
    "baseStrMagMult": 1.5,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0028",
    "skillId": 1011023,
    "skillIds": [
      1011023
    ],
    "attackEffectIds": [
      21026045
    ],
    "summonEffectIds": [
      13014128
    ],
    "summonStatIds": [
      16011
    ],
    "job": "하이랜더",
    "name": "스파이럴 서먼",
    "internalNames": [
      "스파이럴 서먼"
    ],
    "legacyNames": [
      "스파이럴 서먼"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.22,
    "levelTotalMult": 0.0475,
    "weaponAttrCoef": 62,
    "baseStrMagMult": 1.1,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0029",
    "skillId": 1010024,
    "skillIds": [
      1010024
    ],
    "attackEffectIds": [
      25200735
    ],
    "summonEffectIds": [
      13025981
    ],
    "summonStatIds": [
      16016
    ],
    "job": "소드댄서",
    "name": "화령검무",
    "internalNames": [
      "화령검무"
    ],
    "legacyNames": [
      "화령검무"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.4475,
    "levelTotalMult": 0.0525,
    "weaponAttrCoef": 62,
    "baseStrMagMult": 1.2,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0030",
    "skillId": null,
    "skillIds": [
      1011025,
      2402606
    ],
    "attackEffectIds": [
      25200885
    ],
    "summonEffectIds": [],
    "summonStatIds": [],
    "job": "테러나이트",
    "name": "카오스존",
    "internalNames": [
      "카오스 존",
      "카오스 존 [각성]"
    ],
    "legacyNames": [
      "카오스존"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "fallback",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.47,
    "levelTotalMult": 0.05,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.2,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0031",
    "skillId": 1010026,
    "skillIds": [
      1010026
    ],
    "attackEffectIds": [
      13111823
    ],
    "summonEffectIds": [
      25200659
    ],
    "summonStatIds": [
      16016
    ],
    "job": "사이키커",
    "name": "사이킥 아츠 크랙",
    "internalNames": [
      "사이킥아츠-크랙"
    ],
    "legacyNames": [
      "사이킥 아츠 크랙"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.4025,
    "levelTotalMult": 0.0475,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.2,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0032",
    "skillId": 1010027,
    "skillIds": [
      1010027
    ],
    "attackEffectIds": [
      25200772
    ],
    "summonEffectIds": [
      25200633
    ],
    "summonStatIds": [
      16011
    ],
    "job": "팬텀메이지",
    "name": "사신의 기운",
    "internalNames": [
      "사신의 기운"
    ],
    "legacyNames": [
      "사신의 기운"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.1925,
    "levelTotalMult": 0.0525,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.1,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0033",
    "skillId": null,
    "skillIds": [
      1011028,
      1012028
    ],
    "attackEffectIds": [
      25200797
    ],
    "summonEffectIds": [],
    "summonStatIds": [],
    "job": "마에스트로",
    "name": "파쇼나토",
    "internalNames": [
      "[소환] 파쇼나토",
      "[소환] 파쇼나토 트리오"
    ],
    "legacyNames": [
      "파쇼나토"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "fallback",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.255,
    "levelTotalMult": 0.045,
    "weaponAttrCoef": 62,
    "baseStrMagMult": 1.1,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0034",
    "skillId": 2403101,
    "skillIds": [
      2403101
    ],
    "attackEffectIds": [],
    "summonEffectIds": [
      13025598
    ],
    "summonStatIds": [
      16016
    ],
    "job": "저지먼트",
    "name": "트위스터",
    "internalNames": [
      "트위스터"
    ],
    "legacyNames": [
      "트위스터"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "fallback",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.4675,
    "levelTotalMult": 0.0525,
    "weaponAttrCoef": 62,
    "baseStrMagMult": 1.2,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0035",
    "skillId": 2403005,
    "skillIds": [
      2403005
    ],
    "attackEffectIds": [
      13111766
    ],
    "summonEffectIds": [
      13111371
    ],
    "summonStatIds": [
      16011
    ],
    "job": "로그마스터",
    "name": "인법 난",
    "internalNames": [
      "인법_난(亂)"
    ],
    "legacyNames": [
      "인법 난"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.255,
    "levelTotalMult": 0.045,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.1,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0036",
    "skillId": null,
    "skillIds": [],
    "attackEffectIds": [
      13014378
    ],
    "summonEffectIds": [
      13111950
    ],
    "summonStatIds": [
      16014
    ],
    "job": "스타시커",
    "name": "엘메이",
    "internalNames": [],
    "legacyNames": [
      "엘메이"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.325,
    "levelTotalMult": 0.045,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.16,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0037",
    "skillId": 2403202,
    "skillIds": [
      2403202
    ],
    "attackEffectIds": [
      25200830
    ],
    "summonEffectIds": [
      81017691
    ],
    "summonStatIds": [
      16011
    ],
    "job": "스타시커",
    "name": "터렛",
    "internalNames": [
      "DS-MT"
    ],
    "legacyNames": [
      "터렛"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.24,
    "levelTotalMult": 0.0475,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.1,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0038",
    "skillId": 2406905,
    "skillIds": [
      2406905
    ],
    "attackEffectIds": [
      13004349
    ],
    "summonEffectIds": [
      21505360
    ],
    "summonStatIds": [
      16013
    ],
    "job": "쥬얼스타",
    "name": "매직스퀘어",
    "internalNames": [
      "매직 스퀘어 [퍼플]"
    ],
    "legacyNames": [
      "매직스퀘어"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.42,
    "levelTotalMult": 0.055,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.14,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0039",
    "skillId": 1803505,
    "skillIds": [
      1803505
    ],
    "attackEffectIds": [
      13004936
    ],
    "summonEffectIds": [
      13004948
    ],
    "summonStatIds": [
      16016
    ],
    "job": "윈디아",
    "name": "윈드스톰",
    "internalNames": [
      "윈드 스톰 : 릴리즈"
    ],
    "legacyNames": [
      "윈드스톰"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.4,
    "levelTotalMult": 0.0475,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.2,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0040",
    "skillId": 1803704,
    "skillIds": [
      1803704
    ],
    "attackEffectIds": [
      13004996
    ],
    "summonEffectIds": [],
    "summonStatIds": [],
    "job": "레이니아",
    "name": "워터봄",
    "internalNames": [
      "워터 봄"
    ],
    "legacyNames": [
      "워터봄"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "fallback",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.3,
    "levelTotalMult": 0.05,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.16,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0041",
    "skillId": 2106001,
    "skillIds": [
      2106001
    ],
    "attackEffectIds": [
      13014724
    ],
    "summonEffectIds": [
      13014720
    ],
    "summonStatIds": [
      16021
    ],
    "job": "아크메이지",
    "name": "천룡아",
    "internalNames": [
      "천룡아"
    ],
    "legacyNames": [
      "천룡아"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.62,
    "levelTotalMult": 0.06,
    "weaponAttrCoef": 82,
    "baseStrMagMult": 1.3,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0042",
    "skillId": null,
    "skillIds": [],
    "attackEffectIds": [],
    "summonEffectIds": [],
    "summonStatIds": [],
    "job": "도깨비",
    "name": "요술 : 귀도",
    "internalNames": [],
    "legacyNames": [
      "요술 : 귀도"
    ],
    "coefficientSource": "fallback",
    "coefficientSources": {
      "weaponAttr": "fallback",
      "strMag": "fallback",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.71,
    "levelTotalMult": 0,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.3,
    "levelStrMagMult": 0
  },
  {
    "id": "placement-0043",
    "skillId": 1804260,
    "skillIds": [
      1804260
    ],
    "attackEffectIds": [
      13014285
    ],
    "summonEffectIds": [
      13014278
    ],
    "summonStatIds": [
      16016
    ],
    "job": "도깨비",
    "name": "백귀야행",
    "internalNames": [
      "백귀야행"
    ],
    "legacyNames": [
      "백귀야행"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "summonStat",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.435,
    "levelTotalMult": 0.055,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.2,
    "levelStrMagMult": 0.02
  },
  {
    "id": "placement-0044",
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
      3808304,
      3812404,
      3812504,
      3812604,
      3812704,
      3812804,
      3812904,
      3813004,
      3813104,
      3813204,
      3813604,
      3813704,
      3813804,
      3813904,
      3814004,
      3814104,
      3814204,
      3814304,
      3814404,
      3814504,
      3814904,
      3815204,
      3815604,
      3816004,
      3816404,
      3816804,
      3816904,
      3817304,
      3817404,
      3817504,
      3817804,
      3818104,
      3818204,
      3818304
    ],
    "attackEffectIds": [],
    "summonEffectIds": [],
    "summonStatIds": [],
    "job": "직업 공용",
    "name": "설치형 코어",
    "internalNames": [
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 I 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】",
      "【 코어 II 】"
    ],
    "legacyNames": [
      "설치형 코어"
    ],
    "coefficientSource": "fallback",
    "coefficientSources": {
      "weaponAttr": "fallback",
      "strMag": "fallback",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 2.22,
    "levelTotalMult": 0,
    "weaponAttrCoef": 42,
    "baseStrMagMult": 1.49,
    "levelStrMagMult": 0
  },
  {
    "id": "placement-0045",
    "skillId": null,
    "skillIds": [],
    "attackEffectIds": [
      71000257
    ],
    "summonEffectIds": [],
    "summonStatIds": [],
    "job": "직업 공용",
    "name": "무기 타격효과",
    "internalNames": [],
    "legacyNames": [
      "무기 타격효과"
    ],
    "coefficientSource": "hybrid",
    "coefficientSources": {
      "weaponAttr": "effect",
      "strMag": "fallback",
      "total": "fallback"
    },
    "skillLevel": 0,
    "baseTotalMult": 1.01,
    "levelTotalMult": 0,
    "weaponAttrCoef": 202,
    "baseStrMagMult": 1,
    "levelStrMagMult": 0
  }
];

export const dungeons = [
  {
    "name": "이카로스의 날개",
    "normalDefense": 2187171,
    "bossDefense": 4374342,
    "normalDmgReduction": 2187171,
    "bossDmgReduction": 4374342,
    "normalGuard": 53,
    "bossGuard": 80,
    "normalElasticity": 600,
    "bossElasticity": 700
  },
  {
    "name": "리키모 펠케",
    "normalDefense": 2296529,
    "bossDefense": 4593058,
    "normalDmgReduction": 2296529,
    "bossDmgReduction": 4593058,
    "normalGuard": 53,
    "bossGuard": 80,
    "normalElasticity": 600,
    "bossElasticity": 700
  },
  {
    "name": "아마란스 노바",
    "normalDefense": 2526181,
    "bossDefense": 5052362,
    "normalDmgReduction": 2526181,
    "bossDmgReduction": 5052362,
    "normalGuard": 53,
    "bossGuard": 80,
    "normalElasticity": 600,
    "bossElasticity": 700
  },
  {
    "name": "노르니르의 눈물",
    "normalDefense": 133421,
    "bossDefense": 133421,
    "normalDmgReduction": 1243169,
    "bossDmgReduction": 3082239
  },
  {
    "name": "플레로마",
    "normalDefense": 146763,
    "bossDefense": 161439,
    "normalDmgReduction": 1367485,
    "bossDmgReduction": 3082239
  },
  {
    "name": "에메랄디아",
    "normalDefense": 1504233,
    "bossDefense": 3309312,
    "normalDmgReduction": 1504233,
    "bossDmgReduction": 3309312,
    "normalGuard": 53,
    "bossGuard": 80,
    "normalElasticity": 600,
    "bossElasticity": 700
  },
  {
    "name": "[증명의탑] 30층 이상",
    "normalDefense": 34230,
    "bossDefense": 34230,
    "normalDmgReduction": 1459472,
    "bossDmgReduction": 1459472
  }
];

export const specSummons = [
  {
    "name": "없음",
    "bonuses": {}
  },
  {
    "name": "초신수",
    "bonuses": {
      "normalExtraDmgPlus": 50000,
      "fixedDmgPlus": 40000,
      "minDmgPlus": 50,
      "weaponAttrPlus": 500,
      "fixedDmgPercent": 5,
      "weaponAttrPercent": 5
    }
  },
  {
    "name": "초신수(광기)",
    "bonuses": {
      "normalExtraDmgPlus": 50000,
      "fixedDmgPlus": 40000,
      "minDmgPlus": 50,
      "weaponAttrPlus": 500,
      "fixedDmgPercent": 5,
      "weaponAttrPercent": 5,
      "critDmgPlus": 300
    }
  },
  {
    "name": "베아트리체",
    "bonuses": {
      "minDmgPlus": 180,
      "maxDmgPlus": 180,
      "critDmgPlus": 180,
      "minDmgPercent": 2,
      "maxDmgPercent": 2,
      "critDmgPercent": 2
    }
  },
  {
    "name": "카르디안",
    "bonuses": {
      "strMagPlus": 10000,
      "normalDomination": 15,
      "normalExtraDmgPlus": 375000,
      "normalExtraDmgPercent": 60
    }
  },
  {
    "name": "이레이저",
    "bonuses": {
      "strMagPlus": 10000,
      "bossDomination": 15,
      "bossExtraDmgPlus": 375000,
      "bossExtraDmgPercent": 60
    }
  },
  {
    "name": "유니아",
    "bonuses": {
      "strMagPlus": 20000,
      "strMagPercent": 20
    }
  },
  {
    "name": "리치링",
    "bonuses": {
      "normalExtraDmgPlus": 25000,
      "bossExtraDmgPlus": 25000
    }
  },
  {
    "name": "아리아",
    "bonuses": {
      "critDmgPlus": 100
    }
  }
];

export const jobs = [
  "검성",
  "검호",
  "게이트키퍼",
  "다크체이서",
  "데미갓(분노)",
  "데미갓(신성)",
  "도깨비",
  "레이니아",
  "로그마스터",
  "마에스트로",
  "사이키커",
  "섀도우워커",
  "세이버 (검)",
  "세이버 (둔기)",
  "세피로트",
  "소드댄서",
  "소디언",
  "소울리스 원",
  "스타시커",
  "아그니",
  "아이돌",
  "아크마스터",
  "아크메이지",
  "윈드스토커 (단검)",
  "윈드스토커 (석궁)",
  "윈드스토커 (활)",
  "윈디아",
  "저지먼트",
  "쥬얼스타",
  "직업 공용",
  "테러나이트",
  "파픈스타",
  "팬텀메이지",
  "포스마스터",
  "프라이쉬츠",
  "하이랜더",
  "흑영(도)",
  "흑영(옥)",
  "히어로 (검)",
  "히어로 (창)"
];

export const sourceMetadata = {
  "url": "https://latale.wiki/tools/spec-analyzer",
  "retrievedOn": "2026-10-03",
  "skills": {
    "description": "스펙 계산기 스킬 계수",
    "directTotal": 325,
    "directGenerated": 318,
    "directFallback": 7,
    "directIdLinked": 324,
    "placementTotal": 45,
    "placementGenerated": 0,
    "placementHybrid": 43,
    "placementFallback": 2,
    "placementWeaponGenerated": 42,
    "placementStrMagGenerated": 33,
    "placementTotalGenerated": 0,
    "placementIdLinked": 40,
    "placementCandidateSkills": 205,
    "placementCandidateVariants": 293,
    "placementCandidateBaseVariants": 100,
    "placementCandidateAwakening1Variants": 189,
    "placementCandidateAwakening2Variants": 4,
    "placementCandidateMappedSkills": 23,
    "placementCandidateUnmappedSkills": 193,
    "placementCandidateMappedVariants": 23,
    "placementCandidateUnmappedVariants": 270
  },
  "dungeons": {
    "source": "기준 자료",
    "description": "damage-test의 기본 4단계 몬스터 수치가 있는 던전은 해당 값, 나머지는 기존 대표값",
    "count": 7,
    "selectionPolicy": {
      "regularDungeons": "일반은 배치된 고유 전투 몬스터의 최빈 방어 수치 조합, 보스는 최종 보스를 나타내는 최대 피해감소 조합",
      "proofTower": "30층 이상 구간은 기존 계산 의미를 유지하기 위해 35층을 대표값으로 사용"
    }
  }
};
