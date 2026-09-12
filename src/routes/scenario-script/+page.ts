import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	redirect(308, `${resolve('/scenario')}${url.search}`);
};
