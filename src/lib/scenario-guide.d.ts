import type { ScenarioQuest, ScenarioType } from './types';

export function scenarioText(value: string): string;
export function scenarioLevel(quest: ScenarioQuest): string;
export function createScenarioSearch(quests: ScenarioQuest[], alternateQuests?: ScenarioQuest[]): Map<number, string>;
export function missingScenarioTranslations(quests: ScenarioQuest[], translations: Record<string, string>): string[];
export function translateScenarios(quests: ScenarioQuest[], translations: Record<string, string>): ScenarioQuest[];
export function filterScenarios(
	quests: ScenarioQuest[],
	searchIndex: Map<number, string>,
	filters?: { query?: string; type?: ScenarioType | 'all'; chapter?: string }
): ScenarioQuest[];
export function scenarioSelection(hash: string, quests: ScenarioQuest[]): { questId: number; stepId: number | null } | null;
