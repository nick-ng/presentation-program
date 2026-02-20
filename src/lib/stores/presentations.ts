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

export async function getPresentationMd(
	presentationId: string | null,
	presentationSource: string | null = null
): Promise<{ title: string; content: string }> {
	if (!presentationId) {
		return { title: '', content: '# Error\n\nNo presentation ID provided' };
	}

	switch (presentationSource) {
		case 'nickng': {
			try {
				const res = await fetch(`https://nick.ng/api/markdown-document/uri/${presentationId}`, {
					mode: 'cors'
				});

				const resJson = await res.json();
				console.log('resJson.content', resJson.content);

				return {
					title: resJson.title,
					content: resJson.content
				};
			} catch (err) {
				if (err instanceof Error) {
					return {
						title: 'Error',
						content: '# Error\n\nCould not get presentation.\n\n```\n' + err + '\n```'
					};
				}
			}
			break;
		}
		default: {
			const temp = await localforage.getItem(getPresentationMdKey(presentationId));
			if (typeof temp !== 'string') {
				return { title: '', content: '# Error\n\nPresentation not found' };
			}

			return { title: '', content: temp };
		}
	}

	return {
		title: 'Unreachable',
		content: '# Unreachable\n\nThis part of the code should be unreachable'
	};
}

export function savePresentationMd(presentationId: string, md: string) {
	return localforage.setItem(getPresentationMdKey(presentationId), md);
}

export function deletePresentation(presentationId: string) {
	presentationListStore.update((prev) => {
		return prev.filter((p) => p.id !== presentationId);
	});
	return localforage.removeItem(getPresentationMdKey(presentationId));
}
