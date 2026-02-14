<script lang="ts">
	import type { PresentationItem } from '$lib/stores/presentations';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		presentationListStore,
		getPresentationMd,
		savePresentationMd
	} from '$lib/stores/presentations';
	import Presentation from '$lib/components/presentation.svelte';

	let presentationId = $derived(page.url.searchParams.get('p'));
	let presentationMd = $derived(await getPresentationMd(presentationId));
</script>

<div class="flex flex-row">
	<div class="self-start p-1">
		<p>Upload</p>
		<input
			class="border border-black"
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
		<div>
			{#each $presentationListStore as presentationItem (presentationItem.id)}
				<div class="my-1">
					<a class="text-blue-800 underline" href={`/?p=${presentationItem.id}`}
						>{presentationItem.name} - {presentationItem.id}</a
					>
					<a class="text-blue-800 underline" href={`/view?p=${presentationItem.id}`}>Present</a>
				</div>
			{/each}
		</div>
	</div>
	<div class="max-h-screen grow overflow-y-auto">
		{#if presentationMd?.length > 0}
			<Presentation {presentationMd} fontSizePercent={80} />
		{/if}
	</div>
</div>
