<script lang="ts">
	export let compressionEnabled: boolean = false;
	export let crf: number = 23; // Default CRF value (balanced quality/size)
	// eslint-disable-next-line no-unused-vars
	export let onCompressionToggle: (enabled: boolean) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onCrfChange: (crf: number) => void = () => {};

	const MIN_CRF = 18; // Higher quality, larger file
	const MAX_CRF = 28; // Lower quality, smaller file

	function handleToggle() {
		compressionEnabled = !compressionEnabled;
		onCompressionToggle(compressionEnabled);
	}

	function handleSliderChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const sliderValue = parseFloat(target.value);
		// Invert: slider goes from low quality (left) to high quality (right)
		// So when slider is at MIN_CRF, use MAX_CRF, and vice versa
		const invertedCrf = MAX_CRF + MIN_CRF - sliderValue;
		crf = invertedCrf;
		onCrfChange(invertedCrf);
	}

	// Invert CRF for display in slider (slider shows low->high, but CRF is high->low)
	$: sliderValue = MAX_CRF + MIN_CRF - crf;

	function getQualityLabel(crfValue: number): string {
		if (crfValue <= 20) return 'High';
		if (crfValue <= 23) return 'Medium';
		if (crfValue <= 26) return 'Low';
		return 'Very Low';
	}
</script>

<div class="compression-controls space-y-4">
	<div class="flex items-center justify-between mb-2">
		<h3 class="text-lg font-semibold text-gray-200">Compression</h3>
		<button
			on:click={handleToggle}
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors
				{compressionEnabled ? 'bg-teal-600' : 'bg-gray-600'}"
			role="switch"
			aria-checked={compressionEnabled}
			aria-label="Toggle compression"
		>
			<span
				class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform
					{compressionEnabled ? 'translate-x-6' : 'translate-x-1'}"
			></span>
		</button>
	</div>

	{#if compressionEnabled}
		<div class="space-y-3">
			<div class="flex items-center justify-center text-sm">
				<span class="text-gray-300">Quality: {getQualityLabel(crf)}</span>
			</div>

			<div class="relative">
				<input
					type="range"
					min={MIN_CRF}
					max={MAX_CRF}
					step="1"
					value={sliderValue}
					on:input={handleSliderChange}
					class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-cyan"
					aria-label="Compression quality"
				/>
				<div class="flex justify-between text-xs text-gray-500 mt-1">
					<span>Small File</span>
					<span>High Quality</span>
				</div>
			</div>
		</div>
	{:else}
		<p class="text-sm text-gray-400">Enable compression to reduce file size</p>
	{/if}
</div>

<style>
	.slider-cyan::-webkit-slider-thumb {
		appearance: none;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #06b6d4; /* cyan-500 */
		cursor: pointer;
		border: 2px solid #111827; /* gray-900 */
	}

	.slider-cyan::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #06b6d4; /* cyan-500 */
		cursor: pointer;
		border: 2px solid #111827; /* gray-900 */
	}

	.slider-cyan::-moz-range-track {
		background: #374151; /* gray-700 */
	}
</style>

