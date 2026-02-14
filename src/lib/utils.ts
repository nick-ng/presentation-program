export function splitPresentation(fullPresentation: string): { md: string; tts: string }[] {
	const temp = fullPresentation.split(/^\[comment\]: #slide-break\w*$/gm);

	const slides = temp.map((t) => {
		const matches = t.match(/^\[comment\]: #tts (.+)$/m);
		const tts = (matches && matches[1]) || '';

		return {
			md: t,
			tts: tts
		};
	});

	return slides;
}

type PlayLineArg = {
	phrase: string;
	voice: ReturnType<typeof speechSynthesis.getVoices>[number] | null;
	volume: number;
	rate: number;
	pitch: number;
};

export function playLine({
	phrase,
	voice,
	volume,
	rate,
	pitch
}: PlayLineArg): SpeechSynthesisUtterance {
	const utterance = new SpeechSynthesisUtterance(phrase);

	if (voice) {
		utterance.voice = voice;
	}

	utterance.rate = rate;
	utterance.volume = volume;
	utterance.pitch = pitch;

	speechSynthesis.speak(utterance);

	return utterance;
}

export function playLinePromise(playLineArg: PlayLineArg): Promise<void> {
	const utterance = playLine(playLineArg);
	return new Promise((res, rej) => {
		utterance.addEventListener('end', () => {
			res();
		});

		utterance.addEventListener('error', (err) => {
			rej(err);
		});
	});
}

export function sleep(ms: number) {
	return new Promise((res) => {
		setTimeout(() => {
			res(ms);
		}, ms);
	});
}
