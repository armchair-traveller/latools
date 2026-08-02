import type { ArchiveIndex } from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const response = await fetch('/data/index.json');

	if (!response.ok) {
		throw new Error('The story index could not be loaded.');
	}

	return {
		archive: (await response.json()) as ArchiveIndex
	};
};
