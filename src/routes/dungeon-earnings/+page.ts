import { error } from '@sveltejs/kit';
import type {
	DungeonEarningsCatalog,
	DungeonEarningsIndex,
	DungeonEarningsSnapshot
} from '$lib/types';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const [catalogResponse, indexResponse] = await Promise.all([
		fetch('/data/dungeon-earnings/catalog.json'),
		fetch('/data/dungeon-earnings/index.json')
	]);

	if (!catalogResponse.ok || !indexResponse.ok) {
		error(503, 'The dungeon earnings data could not be loaded.');
	}

	const catalog = (await catalogResponse.json()) as DungeonEarningsCatalog;
	const index = (await indexResponse.json()) as DungeonEarningsIndex;
	const currentSnapshot = index.snapshots.find(
		(snapshot) => snapshot.id === index.currentSnapshotId
	);

	if (!currentSnapshot) {
		error(500, 'The current dungeon earnings price snapshot is not configured.');
	}

	const snapshotResponse = await fetch(currentSnapshot.path);
	if (!snapshotResponse.ok) {
		error(503, 'The current dungeon earnings price snapshot could not be loaded.');
	}

	const snapshot = (await snapshotResponse.json()) as DungeonEarningsSnapshot;
	if (snapshot.id !== currentSnapshot.id || snapshot.marketId !== catalog.market.id) {
		error(500, 'The dungeon earnings price snapshot does not match the catalog.');
	}

	return { catalog, index, snapshot };
};
