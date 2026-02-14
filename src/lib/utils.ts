export function splitPresentation(fullPresentation: string): string[] {
	const slides = fullPresentation.split(/^\[comment\]: #slide-break\w*$/gm);

	return slides;
}
