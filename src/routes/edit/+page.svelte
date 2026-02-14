<script lang="ts">
	import { page } from '$app/state';
	import {
		deletePresentation,
		getPresentationMd,
		savePresentationMd
	} from '$lib/stores/presentations';
	import Presentation from '$lib/components/presentation.svelte';
	import { goto } from '$app/navigation';

	let presentationId = $derived(page.url.searchParams.get('p'));
	let presentationMd = $derived(await getPresentationMd(presentationId));
	let isSaving = $state(false);
</script>

{#if presentationMd?.length > 0}
	<div class="flex h-screen flex-row gap-2">
		<div class="grow p-1">
			<div class="flex flex-row">
				<button
					class={`border border-black px-2 ${isSaving ? 'bg-slate-300' : ''}`}
					type="button"
					disabled={isSaving || !presentationId}
					onclick={async () => {
						if (presentationId) {
							isSaving = true;
							await Promise.all([
								savePresentationMd(presentationId, presentationMd),
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
				<div class="grow"></div>
				<button
					class={`border border-black px-2 ${isSaving ? 'bg-slate-300' : ''}`}
					type="button"
					onclick={async () => {
						if (presentationId && confirm('Are you sure you want to delete?')) {
							await deletePresentation(presentationId);
							goto('/');
						}
					}}>Delete</button
				>
			</div>
			<textarea class="h-[90vh] w-full border border-black p-0.5" bind:value={presentationMd}
			></textarea>
		</div>
		<div class="w-[50vw] overflow-y-auto border-l border-black">
			<Presentation {presentationMd} noKeyboard />
		</div>
	</div>
{:else}
	No such presentation. <a class="text-blue-800 underline" href="/">Go back</a>
{/if}
