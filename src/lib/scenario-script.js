/** Substitute as literal text: character names may contain dollar signs or markup. */
export function scenarioScriptText(value, playerName = '') {
	const name = playerName.trim() || 'Adventurer';
	return value.replace(/\\+r\\+n|\\+n/g, '\n').replace(/%s/gi, () => name);
}

export function scriptSpeakerName(line, playerName = '', language = 'en') {
	const speaker = language === 'ko' ? line.speaker : line.speakerName;
	if (!line.speaker?.trim()) return language === 'ko' ? '내레이션' : 'Narrator';
	return scenarioScriptText(speaker?.trim() || 'Unknown', playerName);
}

export function scriptLevel(story) {
	return story.ultraLevel > 0
		? `Super Lv. ${story.ultraLevel.toLocaleString('en-US')}`
		: `Lv. ${story.level.toLocaleString('en-US')}`;
}

export function filterScriptStories(stories, { query = '', type = 'all', chapter = 'all' } = {}) {
	const terms = query.normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
	return stories.filter((story) => {
		const text = `${story.name} ${story.originalName ?? ''}`.normalize('NFKC').toLocaleLowerCase();
		return (type === 'all' || story.type === type) &&
			(chapter === 'all' || String(story.chapter) === String(chapter)) &&
			terms.every((term) => text.includes(term));
	});
}

/** Resolve IDs through the catalog before constructing any file paths. */
export function selectScriptStory(stories, requestedId) {
	return stories.find((story) => String(story.id) === requestedId) ?? stories[0];
}

export function selectScriptStep(story, requestedId) {
	return story.steps.find((step) => String(step.id) === requestedId) ?? story.steps[0];
}
