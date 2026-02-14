<script lang="ts">
	import Presentation from '$lib/components/presentation.svelte';

	let fileText = $state('');
</script>

<div class="flex flex-row">
	<div class="self-start">
		<h1>Presentation Program</h1>
		<input
			class="border border-black"
			type="file"
			accept=".md"
			onchange={async (event) => {
				const files = event.currentTarget.files;
				if (files === null || files.length === 0) {
					console.error('no files selected');
					return;
				}

				const file = files[0];

				const text = await file.text();
				fileText = text;
			}}
		/>
	</div>
	<div class="max-h-screen grow overflow-y-auto">
		{#if fileText.length > 0}
			<Presentation presentationMd={fileText} fontSizePercent={80} />
		{/if}
	</div>
</div>
