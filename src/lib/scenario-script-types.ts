export type StoryType = 'main' | 'sub';

export interface StoryMeta {
	id: number;
	type: StoryType;
	chapter: number;
	order: number;
	name: string;
	originalName?: string;
	level: number;
	ultraLevel?: number;
	stepCount: number;
	lineCount: number;
}

export interface DialogueChoice {
	text: string;
	goto?: number;
	lines?: DialogueLine[];
}

export interface DialogueLine {
	id: number;
	speaker?: string;
	speakerName?: string;
	text: string;
	choices?: DialogueChoice[];
}

export interface StoryScene {
	id: number;
	lines: DialogueLine[];
}

export interface StoryStep {
	id: number;
	name: string;
	objective?: string;
	scenes: StoryScene[];
}

export interface Story {
	id: number;
	name: string;
	type: StoryType;
	chapter: number;
	order: number;
	source: string;
	updated: string;
	steps: StoryStep[];
}

export interface ArchiveIndex {
	index: StoryMeta[];
	speakers: Record<string, number>;
	chapters: Record<string, string>;
	generatedAt?: string;
	sourceUrl?: string;
	translation?: { complete: boolean; completeStoryIds: number[] };
}
