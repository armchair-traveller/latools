import BookOpenTextIcon from '@lucide/svelte/icons/book-open-text';
import CircleDollarSignIcon from '@lucide/svelte/icons/circle-dollar-sign';
import HouseIcon from '@lucide/svelte/icons/house';
import PercentIcon from '@lucide/svelte/icons/percent';
import ScanSearchIcon from '@lucide/svelte/icons/scan-search';
import ShoppingBasketIcon from '@lucide/svelte/icons/shopping-basket';

export const toolNavigation = [
	{
		key: 'home',
		index: '00',
		label: 'Tool library',
		description: 'Overview & shortcuts',
		verb: 'Explore',
		context: 'Community utility shelf',
		href: '/',
		icon: HouseIcon,
		accent: '#b65332',
		soft: '#f5dfd3',
		deep: '#71301c',
		image: '/npc/741.png'
	},
	{
		key: 'dungeon',
		index: '01',
		label: 'Dungeon earnings',
		description: 'Ely · clears · buffs',
		verb: 'Estimate',
		context: 'Run economics',
		href: '/dungeon-earnings',
		icon: CircleDollarSignIcon,
		accent: '#1d8167',
		soft: '#dcefe8',
		deep: '#115342',
		image: '/npc/724.png'
	},
	{
		key: 'flash-sale',
		index: '02',
		label: 'Flash sale ranking',
		description: 'Bundles · Ely per LTC',
		verb: 'Compare',
		context: 'Offer value tracker',
		href: '/flash-sale',
		icon: PercentIcon,
		accent: '#8c50b8',
		soft: '#ede2f5',
		deep: '#583078',
		image: '/npc/826.png'
	},
	{
		key: 'exchange',
		index: '03',
		label: 'Event exchange',
		description: 'Rewards · value per point',
		verb: 'Rank',
		context: 'Reward optimiser',
		href: '/event-exchange',
		icon: ShoppingBasketIcon,
		accent: '#c45e32',
		soft: '#f6e0d5',
		deep: '#7f381d',
		image: '/npc/749.png'
	},
	{
		key: 'scenario',
		index: '04',
		label: 'Scenario scripts',
		description: 'Stories · dialogue · archive',
		verb: 'Read',
		context: 'Story archive',
		href: '/scenario-script',
		icon: BookOpenTextIcon,
		accent: '#3e72b7',
		soft: '#dfe9f7',
		deep: '#234d83',
		image: '/npc/1605.png'
	},
	{
		key: 'specification',
		index: '05',
		label: 'Specification analyzer',
		description: 'Stats · enchants · skills',
		verb: 'Analyze',
		context: 'Character modelling',
		href: '/spec-analyzer',
		icon: ScanSearchIcon,
		accent: '#5361c8',
		soft: '#e5e8fb',
		deep: '#2f388c',
		image: '/npc/856.png'
	}
] as const;

export const toolCount = toolNavigation.length;
export const lastToolIndex = toolNavigation[toolNavigation.length - 1].index;

export function getActiveTool(pathname: string) {
	return (
		toolNavigation.find((tool) =>
			tool.href === '/'
				? pathname === tool.href
				: pathname === tool.href || pathname.startsWith(`${tool.href}/`)
		) ?? toolNavigation[0]
	);
}
