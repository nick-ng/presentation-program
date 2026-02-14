<script lang="ts">
	import { page } from '$app/state';
	import { getPresentationMd } from '$lib/stores/presentations';
	import Presentation from '$lib/components/presentation.svelte';

	let presentationId = $derived(page.url.searchParams.get('p'));
	let presentationMd = $derived(await getPresentationMd(presentationId));
</script>

{#if presentationMd?.length > 0}
	<Presentation {presentationMd} />
{/if}
