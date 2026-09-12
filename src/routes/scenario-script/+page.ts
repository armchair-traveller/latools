import { error } from '@sveltejs/kit';
import { asset } from '$app/paths';
import { selectScriptStep, selectScriptStory } from '$lib/scenario-script.js';
import type { ArchiveIndex, Story } from '$lib/scenario-script-types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
	const language = url.searchParams.get('lang') === 'ko' ? 'ko' : 'en';
	const response = await fetch(asset('/data/scenario-script/index.json'));
	if (!response.ok) error(503, 'The scenario archive could not be loaded. Please try again.');
	const archive = (await response.json()) as ArchiveIndex;
	const selected = selectScriptStory(archive.index, url.searchParams.get('story'));
	if (!selected) error(503, 'The scenario archive is empty. Please try again later.');
	const translationPending = language === 'en' && archive.translation && !archive.translation.completeStoryIds.includes(selected.id);
	if (translationPending) {
		const story: Story = { ...selected, source: '', updated: '', steps: [] };
		return { archive, story, language, stepId: 0, translationPending: true };
	}
	const directory = language === 'ko' ? 'ko/stories' : 'stories';
	const storyResponse = await fetch(asset(`/data/scenario-script/${directory}/${selected.id}.json`));
	if (!storyResponse.ok) error(503, 'This scenario script could not be loaded. Please try again.');
	const story = (await storyResponse.json()) as Story;
	const step = selectScriptStep(story, url.searchParams.get('step'));
	if (!step || story.id !== selected.id) error(503, 'This scenario script is unavailable. Please try again later.');
	return { archive, story, language, stepId: step.id, translationPending: false };
};
