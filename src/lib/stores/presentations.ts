import localforage from 'localforage';
import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const PRESENTATION_LIST_KEY = 'NICK_PRESENTATION_LIST';
const PRESENTATION_MD_PREFIX = 'NICK_PRESENTATION_MD';

export type PresentationItem = {
	id: string;
	filename: string;
	name: string;
};

export const presentationListStore = writable<PresentationItem[]>([]);

if (browser) {
	const loadPresentationList = async () => {
		try {
			const temp = await localforage.getItem(PRESENTATION_LIST_KEY);
			if (typeof temp !== 'string') {
				return;
			}

			const unknownPresentation = JSON.parse(temp);

			presentationListStore.set(unknownPresentation);
		} catch (e) {
			console.error('error when getting presentation list', e);
		}
	};

	loadPresentationList();

	presentationListStore.subscribe((newList) => {
		localforage.setItem(PRESENTATION_LIST_KEY, JSON.stringify(newList));
	});
}

export function getPresentationMdKey(presentationId: string) {
	return `${PRESENTATION_MD_PREFIX}_${presentationId}`;
}

export async function getPresentationMd(presentationId: string | null) {
	if (!presentationId) {
		return '';
	}

	const temp = await localforage.getItem(getPresentationMdKey(presentationId));
	if (typeof temp !== 'string') {
		return '';
	}

	return temp;
}

export function savePresentationMd(presentationId: string, md: string) {
	return localforage.setItem(getPresentationMdKey(presentationId), md);
}
