import { error } from '@sveltejs/kit';
import { asset } from '$app/paths';
import { translateScenarios } from '$lib/scenario-guide.js';
import type { ScenarioGuide, ScenarioTranslation } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const [response, translationResponse] = await Promise.all([
		fetch(asset('/data/scenario/index.json')),
		fetch(asset('/data/scenario/en.json'))
	]);
	if (!response.ok || !translationResponse.ok) error(503, 'The scenario guide could not be loaded. Please try again.');
	const guide = (await response.json()) as ScenarioGuide;
	const translation = (await translationResponse.json()) as ScenarioTranslation;
	return { guide, englishQuests: translateScenarios(guide.quests, translation.strings) };
};
