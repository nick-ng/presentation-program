import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const OPTIONS_KEY = 'NICK_PRESENTATION_OPTIONS';

export type OptionsType = {
	voiceUri: string;
	volume: number;
	showSubwaySurfers: boolean;
};

export const optionsStore = writable<OptionsType>({
	voiceUri: '',
	volume: 0.5,
	showSubwaySurfers: false
});

if (browser) {
	const loadOptions = () => {
		try {
			const temp = localStorage.getItem(OPTIONS_KEY);
			if (typeof temp !== 'string') {
				return;
			}

			const unknownOptions = JSON.parse(temp);

			optionsStore.update((prev) => ({ ...prev, ...unknownOptions }));
		} catch (e) {
			console.error('error when getting options', e);
		}
	};

	loadOptions();

	optionsStore.subscribe((newOptions) => {
		localStorage.setItem(OPTIONS_KEY, JSON.stringify(newOptions));
	});
}
