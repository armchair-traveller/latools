import type { DialogueLine, Story, StoryMeta, StoryStep, StoryType } from './scenario-script-types';

export function scenarioScriptText(value: string, playerName?: string): string;
export function scriptSpeakerName(line: DialogueLine, playerName?: string, language?: 'en' | 'ko'): string;
export function scriptLevel(story: StoryMeta): string;
export function filterScriptStories(stories: StoryMeta[], filters?: { query?: string; type?: 'all' | StoryType; chapter?: string | number }): StoryMeta[];
export function selectScriptStory(stories: StoryMeta[], requestedId: string | null): StoryMeta | undefined;
export function selectScriptStep(story: Story, requestedId: string | null): StoryStep | undefined;
