<script lang="ts">
	import { page } from '$app/state';
	import {
		deletePresentation,
		getPresentationMd,
		savePresentationMd
	} from '$lib/stores/presentations';
	import Presentation from '$lib/components/presentation.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let presentationId = $derived(page.url.searchParams.get('p'));
	let presentationContent = $state('');
	let isSaving = $state(false);

	onMount(() => {
		const loadPresentation = async () => {
			const presentation = await getPresentationMd(presentationId);
			presentationContent = presentation.content;
		};

		loadPresentation();
	});
</script>

{#if presentationContent?.length > 0}
	<div class="flex h-screen flex-row gap-2">
		<div class="grow p-1">
			<div class="flex flex-row gap-2">
				<button
					class={`border border-black px-2 ${isSaving ? 'bg-slate-300' : ''}`}
					type="button"
					disabled={isSaving || !presentationId}
					onclick={async () => {
						if (presentationId) {
							isSaving = true;
							await Promise.all([
								savePresentationMd(presentationId, presentationContent),
								new Promise((res) => {
									setTimeout(() => {
										// minimum delay for feed back
										res(0);
									}, 100);
								})
							]);
							isSaving = false;
						}
					}}>Save</button
				>
				<a class="text-blue-800 underline" href={`/view?p=${presentationId}`}>View</a>
				<div class="grow"></div>
				<button
					class="border border-black px-2"
					type="button"
					onclick={async () => {
						if (presentationId && confirm('Are you sure you want to delete?')) {
							await deletePresentation(presentationId);
							goto('/');
						}
					}}>Delete</button
				>
			</div>
			<textarea class="h-[90vh] w-full border border-black p-0.5" bind:value={presentationContent}
			></textarea>
		</div>
		<div class="w-[50vw] overflow-y-auto border-l border-black">
			<Presentation presentationMd={presentationContent} noKeyboard />
		</div>
	</div>
{:else}
	No such presentation. <a class="text-blue-800 underline" href="/">Go back</a>
{/if}
