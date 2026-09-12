/** Keep the stored source untouched; decode game text line breaks only for display. */
export function scenarioText(value) {
	return value.replace(/\\+r\\+n|\\+n/g, '\n');
}

export function scenarioLevel(quest) {
	return quest.ultraLevel > 0
		? `Super Lv. ${quest.ultraLevel.toLocaleString('en-US')}`
		: `Lv. ${quest.level.toLocaleString('en-US')}`;
}

function searchableText(value) {
	if (typeof value === 'string') return value;
	if (Array.isArray(value)) return value.map(searchableText).join(' ');
	if (value && typeof value === 'object') return Object.values(value).map(searchableText).join(' ');
	return '';
}

export function createScenarioSearch(quests, alternateQuests = []) {
	const alternate = new Map(alternateQuests.map((quest) => [quest.id, searchableText(quest)]));
	return new Map(quests.map((quest) => [quest.id, `${searchableText(quest)} ${alternate.get(quest.id) ?? ''}`.normalize('NFKC').toLocaleLowerCase()]));
}

/** Exact source-string keys prevent revised Korean text from reusing an unrelated translation. */
export function missingScenarioTranslations(quests, translations) {
	const missing = new Set();
	function visit(value) {
		if (typeof value === 'string' && /[가-힣]/.test(value)) {
			if (!Object.hasOwn(translations, value) || typeof translations[value] !== 'string' ||
				!translations[value].trim() || /[가-힣]/.test(translations[value])) missing.add(value);
		} else if (Array.isArray(value)) value.forEach(visit);
		else if (value && typeof value === 'object') Object.values(value).forEach(visit);
	}
	visit(quests);
	return [...missing];
}

export function translateScenarios(quests, translations) {
	const missing = missingScenarioTranslations(quests, translations);
	if (missing.length) throw new Error(`Missing English translations for ${missing.length} scenario strings.`);
	function translate(value) {
		if (typeof value === 'string') return Object.hasOwn(translations, value) ? translations[value] : value;
		if (Array.isArray(value)) return value.map(translate);
		if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, translate(entry)]));
		return value;
	}
	return translate(quests);
}

export function filterScenarios(quests, searchIndex, { query = '', type = 'all', chapter = 'all' } = {}) {
	const terms = query.normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
	return quests.filter((quest) =>
		(type === 'all' || quest.type === type) &&
		(chapter === 'all' || String(quest.chapter) === chapter) &&
		terms.every((term) => searchIndex.get(quest.id)?.includes(term))
	);
}

/** Resolve both shared scenarios and individual steps, including on a fresh visit. */
export function scenarioSelection(hash, quests) {
	const match = /^#(quest|step)-(\d+)$/.exec(hash);
	if (!match) return null;
	const id = Number(match[2]);
	const quest = match[1] === 'quest'
		? quests.find((entry) => entry.id === id)
		: quests.find((entry) => entry.steps.some((step) => step.id === id));
	return quest ? { questId: quest.id, stepId: match[1] === 'step' ? id : null } : null;
}
