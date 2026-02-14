<script lang="ts">
	import { onMount } from 'svelte';
	import { splitPresentation } from '$lib/utils';
	import Slide from '$lib/components/slide.svelte';

	interface Props {
		presentationMd: string;
		fontSizePercent?: number;
		topGap?: number;
	}

	let { presentationMd, fontSizePercent = 180, topGap = 0 }: Props = $props();
	let currentPage = $state(0);

	let slides = $derived(splitPresentation(presentationMd));

	onMount(() => {
		const handleKeyup = (event: KeyboardEvent) => {
			switch (event.key) {
				case 'ArrowRight': {
					if (currentPage < slides.length) {
						currentPage = currentPage + 1;
					}

					const nextEl = document.getElementById(`slide-${currentPage}`);

					if (nextEl) {
						nextEl.scrollIntoView({ behavior: 'smooth' });
					}
					break;
				}
				case 'ArrowLeft': {
					if (currentPage > 0) {
						currentPage = currentPage - 1;
					}

					const nextEl = document.getElementById(`slide-${currentPage}`);

					if (nextEl) {
						nextEl.scrollIntoView({ behavior: 'smooth' });
					}
					break;
				}
				case ' ': {
					console.log('start automatic');
					break;
				}
				default: {
					console.info('no action associated with key:', event.key);
				}
			}
		};

		document.addEventListener('keyup', handleKeyup);

		return () => {
			document.removeEventListener('keyup', handleKeyup);
		};
	});
</script>

{#if presentationMd.length > 0}
	{#each slides as slide, i (i)}
		<Slide slideId={i} slideMd={slide} {fontSizePercent} {topGap} />
	{/each}
	<div>End</div>
{/if}
