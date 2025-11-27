<script lang="ts">
	export let compressionEnabled: boolean = false;
	export let crf: number = 23; // Default CRF value (balanced quality/size)
	export let disabled: boolean = false;
	// eslint-disable-next-line no-unused-vars
	export let onCompressionToggle: (enabled: boolean) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onCrfChange: (crf: number) => void = () => {};

	const MIN_CRF = 18; // Higher quality, larger file
	const MAX_CRF = 28; // Lower quality, smaller file

	function handleToggle() {
		if (disabled) return;
		const wasEnabled = compressionEnabled;
		compressionEnabled = !compressionEnabled;
		onCompressionToggle(compressionEnabled);
		
		// When enabling compression, reset slider to middle (CRF 23)
		if (!wasEnabled && compressionEnabled) {
			const middleCrf = 23; // Balanced quality/size
			crf = middleCrf;
			onCrfChange(middleCrf);
		}
	}

	function handleSliderChange(event: Event) {
		if (disabled) return;
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

<div class="compression-controls bg-gray-700/50 rounded-lg p-4 sm:p-5 border border-gray-600/50 {disabled ? 'opacity-60' : ''}">
	<div class="space-y-4">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-lg font-semibold text-gray-200">Compression</h3>
			<button
				on:click={handleToggle}
				disabled={disabled}
				class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors
					{compressionEnabled ? 'bg-teal-600' : 'bg-gray-600'}
					{disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}"
				role="switch"
				aria-checked={compressionEnabled}
				aria-label="Toggle compression"
				aria-disabled={disabled}
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
				<div class="relative">
					<input
						type="range"
						min={MIN_CRF}
						max={MAX_CRF}
						step="1"
						value={sliderValue}
						on:input={handleSliderChange}
						disabled={disabled}
						class="w-full h-2 bg-gray-700 rounded-lg appearance-none slider-teal {disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}"
						aria-label="Compression quality"
						aria-disabled={disabled}
					/>
					<!-- Visual handle indicator overlay -->
					<div class="absolute top-1/2 pointer-events-none slider-handle-indicator" style="left: calc({(sliderValue - MIN_CRF) / (MAX_CRF - MIN_CRF) * 100}% - 16px);">
						<div class="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-teal-600 bg-gray-800 shadow-lg flex items-center justify-center">
							<div class="h-2.5 w-0.5 bg-teal-600 rounded"></div>
						</div>
					</div>
				</div>
				<div class="flex justify-between text-xs text-gray-500 mt-1">
					<span>Smaller File</span>
					<span>Better Quality</span>
				</div>
			</div>
		</div>
		{:else}
			<p class="text-sm text-gray-400">Enable compression to reduce file size</p>
		{/if}
	</div>
</div>

<style>
	.slider-teal::-webkit-slider-thumb {
		appearance: none;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: transparent;
		cursor: pointer;
		border: none;
		position: relative;
		z-index: 10;
	}

	@media (min-width: 640px) {
		.slider-teal::-webkit-slider-thumb {
			width: 40px;
			height: 40px;
		}
	}

	.slider-teal::-moz-range-thumb {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: transparent;
		cursor: pointer;
		border: none;
		position: relative;
		z-index: 10;
	}

	@media (min-width: 640px) {
		.slider-teal::-moz-range-thumb {
			width: 40px;
			height: 40px;
		}
	}

	.slider-teal::-moz-range-track {
		background: #374151; /* gray-700 */
	}

	.slider-handle-indicator {
		transform: translateY(-50%);
		transition: left 0.1s ease;
	}
</style>

