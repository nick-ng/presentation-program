<script lang="ts">
	import { onMount } from 'svelte';
	import { playLinePromise, splitPresentation, sleep } from '$lib/utils';
	import { optionsStore } from '$lib/stores/options';
	import Slide from '$lib/components/slide.svelte';
	import Youtube from './youtube.svelte';

	interface Props {
		presentationMd: string;
		noKeyboard?: boolean;
		enableExtras?: boolean;
	}

	let { presentationMd, noKeyboard, enableExtras }: Props = $props();
	let currentSlide = $state(0);
	let showOptions = $state(false);
	let voices: ReturnType<typeof speechSynthesis.getVoices> = $state([]);
	let chosenVoice = $derived(voices.find((v) => v.voiceURI === $optionsStore.voiceUri));
	let presentationState = $state('stand-by');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let youtubePlayer: any = $state(null);

	let slides = $derived(splitPresentation(presentationMd));

	const scrollSlides = (slideIndex: number) => {
		const nextEl = document.getElementById(`slide-${slideIndex}`);

		if (nextEl) {
			nextEl.scrollIntoView({ behavior: 'smooth' });
		}
	};

	const playSlides = async () => {
		if (!chosenVoice) {
			alert('No voice chosen');
			return;
		}

		if (youtubePlayer && youtubePlayer.getPlayerState() !== 1) {
			youtubePlayer.playVideo();
			youtubePlayer.setVolume(0);
		}

		presentationState = 'playing';
		let playingSlide = currentSlide;
		while (playingSlide < slides.length) {
			const phrase = slides[playingSlide]?.tts;
			if (!phrase) {
				await sleep(5000);
				continue;
			}

			await sleep(300);
			await playLinePromise({
				phrase,
				pitch: 1,
				rate: 1,
				voice: chosenVoice,
				volume: $optionsStore.volume
			});

			if (presentationState === 'stop' || presentationState === 'paused') {
				return;
			}

			await sleep(300);

			playingSlide = playingSlide + 1;
			currentSlide = playingSlide;
			scrollSlides(currentSlide);
		}

		presentationState = 'stop';
	};

	onMount(() => {
		const loadVoices = () => {
			voices = speechSynthesis.getVoices();
		};

		loadVoices();
		speechSynthesis.addEventListener('voiceschanged', loadVoices);

		const handleKeyup = (event: KeyboardEvent) => {
			if (noKeyboard) {
				return;
			}
			switch (event.key) {
				case 'ArrowRight': {
					if (currentSlide < slides.length - 1) {
						currentSlide = currentSlide + 1;
					}

					scrollSlides(currentSlide);
					break;
				}
				case 'ArrowLeft': {
					if (currentSlide > 0) {
						currentSlide = currentSlide - 1;
					}

					scrollSlides(currentSlide);
					break;
				}
				case 'l': {
					playSlides();
					break;
				}
				case 'k': {
					speechSynthesis.cancel();
					presentationState = 'paused';
					break;
				}
				case ' ': {
					event.preventDefault();
					playSlides();
					break;
				}
				case ',': {
					showOptions = !showOptions;
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
			speechSynthesis.removeEventListener('voiceschanged', loadVoices);
		};
	});
</script>

<div class="relative flex flex-row">
	{#if enableExtras && showOptions}
		<div class="fixed top-2 left-2 border border-black p-2">
			<h3 class="font-bold">Options</h3>
			<label>
				<input type="checkbox" bind:checked={$optionsStore.showSubwaySurfers} /> Subway Surfers</label
			>
		</div>
	{/if}
	<div class="max-h-[100vh] grow overflow-y-auto">
		{#if presentationMd.length > 0}
			{#each slides as slide, i (i)}
				<Slide slideId={i} slideMd={slide.md} />
			{/each}
		{/if}
	</div>
	{#if enableExtras && $optionsStore.showSubwaySurfers}
		<div class="h-screen w-[45vh]">
			<Youtube bind:player={youtubePlayer} initialVideoId="zZ7AimPACzc" />
		</div>
	{/if}
</div>
