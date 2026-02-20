<script lang="ts">
	import { page } from '$app/state';
	import { getPresentationMd } from '$lib/stores/presentations';
	import Presentation from '$lib/components/presentation.svelte';

	let presentationId = $derived(page.url.searchParams.get('p'));
	let presentationSource = $derived(page.url.searchParams.get('s'));
	let presentationMd = $derived(await getPresentationMd(presentationId, presentationSource));
</script>

{#if presentationMd.content?.length > 0}
	<Presentation presentationMd={presentationMd.content} enableExtras />
{/if}
