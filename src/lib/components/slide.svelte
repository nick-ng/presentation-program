<script lang="ts">
	import { sleep } from '$lib/utils';
	import MarkdownIt from 'markdown-it';
	import { onMount } from 'svelte';
	import { optionsStore } from '$lib/stores/options';

	interface Props {
		slideId?: string | number;
		slideMd: string;
	}

	const BASE_FONT_SIZE_PERCENT = 200;
	const BASE_WIDTH_PX = 1920;

	let { slideId, slideMd }: Props = $props();
	let thisEl: HTMLDivElement | undefined = $state();
	let actualFontSizePercent = $state(BASE_FONT_SIZE_PERCENT);
	let shrink = $state(0);
	let fontSizeStyle = $derived(`font-size: ${actualFontSizePercent}%;`);

	const md = new MarkdownIt().disable(['link', 'autolink', 'linkify']);

	const adjustFontSize = async () => {
		for (let i = 0; i < 10; i++) {
			const sleepTime = 20 << i;
			await sleep(sleepTime);
			if (!thisEl) {
				continue;
			}

			const documentRects = document.body.getClientRects();
			const rects = thisEl.getClientRects();
			if (!documentRects[0] || !rects[0]) {
				continue;
			}

			const subway = $optionsStore.showSubwaySurfers ? documentRects[0].height * 0.45 : 0;
			const availWidth = documentRects[0].width - subway;
			const availHeight = window.screen.availHeight;

			const aspectRatio = availWidth / availHeight;

			const targetHeight = rects[0].width / aspectRatio;
			const actualHeight = Math.min(availHeight, targetHeight);
			shrink = availHeight - actualHeight;

			const autoFontSize = (rects[0].width / BASE_WIDTH_PX) * BASE_FONT_SIZE_PERCENT;
			actualFontSizePercent = autoFontSize;
			return;
		}
	};

	onMount(() => {
		adjustFontSize();

		window.addEventListener('resize', adjustFontSize);

		return () => {
			window.removeEventListener('resize', adjustFontSize);
		};
	});
</script>

<div
	id={`slide-${slideId}`}
	bind:this={thisEl}
	class={`markdown-body slide border-b ${slideId === 0 ? 'first-slide' : ''}`}
	style={`height: calc(100vh - ${shrink}px);${fontSizeStyle}`}
>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html md.render(slideMd)}
</div>

<style>
	.slide {
		padding: 3.5em;
	}

	.slide :global ul {
		list-style-type: disc;
	}

	.slide :global ol {
		list-style-type: decimal;
	}

	.slide :global li {
		margin-top: 1em;
		margin-bottom: 1em;
	}

	.first-slide {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
	}
	.first-slide :global h1 {
		font-size: 5em;
	}
</style>
