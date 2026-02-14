<script lang="ts">
	import MarkdownIt from 'markdown-it';

	interface Props {
		slideId?: string | number;
		topGap?: number;
		fontSizePercent?: number;
		slideMd: string;
	}

	let { slideId, slideMd, fontSizePercent = 180, topGap = 0 }: Props = $props();
	let fontSizeStyle = $derived(`font-size: ${fontSizePercent}%;`);
	let titleSlideStyle = $derived(slideId === 0 ? 'padding-top: 25vh; text-align: center;' : '');

	const md = new MarkdownIt().disable(['link', 'autolink', 'linkify']);
</script>

<div
	id={`slide-${slideId}`}
	class={`markdown-body border p-16 ${slideId === 0 ? 'first-slide' : ''}`}
	style={`height: calc(100vh - ${topGap}px);${fontSizeStyle}${titleSlideStyle}`}
>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html md.render(slideMd)}
</div>

<style>
	.first-slide :global h1 {
		font-size: 5em;
	}
</style>
