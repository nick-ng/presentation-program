<script lang="ts">
	import type { PresentationItem } from '$lib/stores/presentations';

	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		presentationListStore,
		getPresentationMd,
		savePresentationMd
	} from '$lib/stores/presentations';
	import { optionsStore } from '$lib/stores/options';
	import { playLinePromise } from '$lib/utils';
	import Presentation from '$lib/components/presentation.svelte';

	let presentationId = $derived(page.url.searchParams.get('p'));
	let presentationMd = $derived(await getPresentationMd(presentationId));
	let voices: ReturnType<typeof speechSynthesis.getVoices> = $state([]);
	let languages = $derived(
		[
			...voices.reduce((prev, curr) => {
				prev.add(curr.lang);
				return prev;
			}, new Set())
		].sort()
	);
	let language = $state('');
	let filteredVoices = $derived(voices.filter((v) => !language || v.lang === language));
	let chosenVoice = $derived(voices.find((v) => v.voiceURI === $optionsStore.voiceUri));

	onMount(() => {
		const loadVoices = () => {
			voices = speechSynthesis.getVoices();
		};

		loadVoices();

		speechSynthesis.addEventListener('voiceschanged', loadVoices);

		return () => {
			speechSynthesis.removeEventListener('voiceschanged', loadVoices);
		};
	});
</script>

<div class="flex flex-row">
	<div class="self-start p-1">
		<div>
			<label
				>Language
				<select class="border border-black px-0.5 py-1" bind:value={language}>
					<option value="">All</option>
					{#each languages as language (language)}
						<option value={language}>{language}</option>
					{/each}
				</select>
			</label>
		</div>
		<div>
			<select class="border border-black px-0.5 py-1" bind:value={$optionsStore.voiceUri}>
				<option>Choose a voice ({filteredVoices.length})</option>
				{#each filteredVoices as voice (voice.voiceURI)}
					<option value={voice.voiceURI}>{voice.name} - {voice.lang}</option>
				{/each}
			</select>
			<button
				class="border border-black px-1"
				type="button"
				onclick={() => {
					if (chosenVoice) {
						playLinePromise({
							phrase: `Hello, I am ${chosenVoice.name}`,
							pitch: 1,
							rate: 1,
							volume: $optionsStore.volume,
							voice: chosenVoice
						});
					}
				}}
			>
				Test
			</button>
		</div>
		<div>
			<label>
				Volume
				<input
					class="border border-black px-0.5 text-right"
					type="number"
					bind:value={$optionsStore.volume}
				/>
			</label>
		</div>
		<div>
			<label>
				Upload
				<input
					class="border border-black px-0.5"
					type="file"
					accept=".md"
					onchange={async (event) => {
						const files = event.currentTarget.files;
						if (files === null || files.length === 0) {
							console.error('no files selected');
							return;
						}

						const file = files[0];

						const text = await file.text();
						const newPresentationItem: PresentationItem = {
							id: Date.now().toString(),
							filename: file.name,
							name: file.name
						};
						$presentationListStore = $presentationListStore.concat([newPresentationItem]);

						await savePresentationMd(newPresentationItem.id, text);

						goto(`/?p=${newPresentationItem.id}`);
					}}
				/>
			</label>
		</div>
		<div>
			<button
				class="border border-black px-2"
				type="button"
				onclick={async () => {
					const id = Date.now().toString();
					const newPresentationItem: PresentationItem = {
						id,
						filename: `${id}.md`,
						name: id
					};
					$presentationListStore = $presentationListStore.concat([newPresentationItem]);

					await savePresentationMd(
						newPresentationItem.id,
						'# New Presentation\n\nClick on "Edit" to begin\n\n[comment]: #slide-break\n\n## Second Slide\n\nMore text goes here'
					);

					goto(`/?p=${newPresentationItem.id}`);
				}}>New</button
			>
		</div>
		<div>
			{#each $presentationListStore as presentationItem (presentationItem.id)}
				<div class="my-1">
					<a class="text-blue-800 underline" href={`/?p=${presentationItem.id}`}
						>{presentationItem.name} - {presentationItem.id}</a
					>
					<a class="text-blue-800 underline" href={`/edit?p=${presentationItem.id}`}>Edit</a>
					<a class="text-blue-800 underline" href={`/view?p=${presentationItem.id}`}>Present</a>
				</div>
			{/each}
		</div>
	</div>
	<div class="max-h-screen grow overflow-y-auto">
		{#if presentationMd?.length > 0}
			<Presentation {presentationMd} />
		{/if}
	</div>
</div>
