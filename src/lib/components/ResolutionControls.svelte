<script lang="ts">
	import InfoTooltip from './InfoTooltip.svelte';

	export let resolutionScalingEnabled: boolean = false;
	export let resolutionScale: number = 100; // Percentage (100 = original)
	export let targetResolution: string | null = null; // Preset name or null for custom
	export let originalWidth: number = 0;
	export let originalHeight: number = 0;
	export let disabled: boolean = false;
	// eslint-disable-next-line no-unused-vars
	export let onResolutionScalingToggle: (enabled: boolean) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onResolutionScaleChange: (scale: number) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onTargetResolutionChange: (preset: string | null) => void = () => {};

	const RESOLUTION_PRESETS = [
		{ label: '4K', value: '4k', width: 3840, height: 2160 },
		{ label: '1080p', value: '1080p', width: 1920, height: 1080 },
		{ label: '720p', value: '720p', width: 1280, height: 720 },
		{ label: '480p', value: '480p', width: 854, height: 480 },
		{ label: '360p', value: '360p', width: 640, height: 360 },
		{ label: '240p', value: '240p', width: 426, height: 240 }
	];

	const MIN_SCALE = 10; // Minimum 10% to avoid too small videos
	const MAX_SCALE = 200; // Maximum 200% for upscaling

	// Ensure dimension is even (required for H.264)
	function makeEven(value: number): number {
		return Math.floor(value / 2) * 2;
	}

	// Calculate scaled dimensions maintaining aspect ratio
	function calculateScaledDimensions(
		width: number,
		height: number,
		scalePercent: number,
		preset: string | null
	): { width: number; height: number } {
		if (width === 0 || height === 0) return { width: 0, height: 0 };

		const aspectRatio = width / height;
		let targetWidth: number;
		let targetHeight: number;

		if (preset) {
			// Use preset dimensions
			const presetData = RESOLUTION_PRESETS.find(p => p.value === preset);
			if (presetData) {
				// Fit to preset while maintaining aspect ratio
				// Use the dimension that results in smaller size to fit within preset
				const widthRatio = presetData.width / width;
				const heightRatio = presetData.height / height;
				const scaleRatio = Math.min(widthRatio, heightRatio);

				targetWidth = width * scaleRatio;
				targetHeight = height * scaleRatio;
			} else {
				// Fallback to percentage
				targetWidth = width * (scalePercent / 100);
				targetHeight = height * (scalePercent / 100);
			}
		} else {
			// Use percentage
			targetWidth = width * (scalePercent / 100);
			targetHeight = height * (scalePercent / 100);
		}

		// Ensure both dimensions are even
		targetWidth = makeEven(targetWidth);
		targetHeight = makeEven(targetHeight);

		// Ensure minimum size
		if (targetWidth < 2) targetWidth = 2;
		if (targetHeight < 2) targetHeight = 2;

		return { width: targetWidth, height: targetHeight };
	}

	function handleToggle() {
		if (disabled) return;
		resolutionScalingEnabled = !resolutionScalingEnabled;
		onResolutionScalingToggle(resolutionScalingEnabled);
		
		// When enabling, default to 100% if not already set
		if (resolutionScalingEnabled && resolutionScale === 100 && !targetResolution) {
			// Keep at 100%
		}
	}

	function handleSliderChange(event: Event) {
		if (disabled) return;
		const target = event.target as HTMLInputElement;
		const newScale = parseFloat(target.value);
		resolutionScale = newScale;
		onResolutionScaleChange(newScale);
		// Clear preset when slider is moved
		if (targetResolution !== null) {
			targetResolution = null;
			onTargetResolutionChange(null);
		}
	}

	function handlePresetSelect(preset: string) {
		if (disabled) return;
		targetResolution = preset;
		onTargetResolutionChange(preset);
		
		// Calculate percentage for this preset
		if (originalWidth > 0 && originalHeight > 0) {
			const presetData = RESOLUTION_PRESETS.find(p => p.value === preset);
			if (presetData) {
				const widthRatio = presetData.width / originalWidth;
				const heightRatio = presetData.height / originalHeight;
				const scaleRatio = Math.min(widthRatio, heightRatio);
				const newScale = Math.round(scaleRatio * 100);
				resolutionScale = newScale;
				onResolutionScaleChange(newScale);
			}
		}
	}

	$: scaledDimensions = resolutionScalingEnabled && originalWidth > 0 && originalHeight > 0
		? calculateScaledDimensions(originalWidth, originalHeight, resolutionScale, targetResolution)
		: { width: 0, height: 0 };

	$: isResolutionDifferent = resolutionScalingEnabled && 
		(scaledDimensions.width !== originalWidth || scaledDimensions.height !== originalHeight);
</script>

<div class="resolution-controls bg-gray-700/50 rounded-lg p-4 sm:p-5 border border-gray-600/50 {disabled ? 'opacity-60' : ''}">
	<div class="space-y-4">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-lg font-semibold text-gray-200">Resolution Scaling</h3>
			<div class="flex items-center gap-2">
				<InfoTooltip
					content="Reduce or increase video resolution to change file size. Lower resolution means smaller files but lower quality. The aspect ratio is always maintained. Use the slider for custom scaling or select a preset resolution."
					position="top"
				/>
				<button
					on:click={handleToggle}
					disabled={disabled}
					class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors
						{resolutionScalingEnabled ? 'bg-teal-600' : 'bg-gray-600'}
						{disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}"
					role="switch"
					aria-checked={resolutionScalingEnabled}
					aria-label="Toggle resolution scaling"
					aria-disabled={disabled}
				>
					<span
						class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform
							{resolutionScalingEnabled ? 'translate-x-6' : 'translate-x-1'}"
					></span>
				</button>
			</div>
		</div>

		{#if resolutionScalingEnabled}
			<div class="space-y-3">
				{#if originalWidth > 0 && originalHeight > 0}
					<div class="flex items-center justify-between text-sm">
						<span class="text-gray-300">
							Original: <span class="text-teal-400">{Math.round(originalWidth)} × {Math.round(originalHeight)}</span>
						</span>
						{#if isResolutionDifferent}
							<span class="text-gray-400">
								→ <span class="text-teal-400">{Math.round(scaledDimensions.width)} × {Math.round(scaledDimensions.height)}</span>
							</span>
						{/if}
					</div>
				{/if}

				<!-- Percentage Slider -->
				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<label for="resolution-slider" class="text-gray-300">
							Scale: {resolutionScale}%
						</label>
						{#if targetResolution}
							<span class="text-xs text-gray-400">
								Preset: {RESOLUTION_PRESETS.find(p => p.value === targetResolution)?.label || targetResolution}
							</span>
						{:else}
							<span class="text-xs text-gray-400">Custom</span>
						{/if}
					</div>
					<div class="relative">
						<div class="relative">
							<input
								id="resolution-slider"
								type="range"
								min={MIN_SCALE}
								max={MAX_SCALE}
								step="1"
								value={resolutionScale}
								on:input={handleSliderChange}
								disabled={disabled}
								class="w-full h-2 bg-gray-700 rounded-lg appearance-none slider-teal {disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}"
								aria-label="Resolution scale percentage"
								aria-disabled={disabled}
							/>
							<!-- Visual handle indicator overlay -->
							<div class="absolute top-1/2 pointer-events-none slider-handle-indicator" style="left: calc({(resolutionScale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE) * 100}% - 16px);">
								<div class="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-teal-600 bg-gray-800 shadow-lg flex items-center justify-center">
									<div class="h-2.5 w-0.5 bg-teal-600 rounded"></div>
								</div>
							</div>
						</div>
						<div class="flex justify-between text-xs text-gray-500 mt-1">
							<span>{MIN_SCALE}%</span>
							<span>100%</span>
							<span>{MAX_SCALE}%</span>
						</div>
					</div>
				</div>

				<!-- Preset Buttons -->
				<div class="space-y-2">
					<div class="text-sm text-gray-300">Preset Resolutions:</div>
					<div class="flex flex-wrap gap-2">
						{#each RESOLUTION_PRESETS as preset}
							<button
								on:click={() => handlePresetSelect(preset.value)}
								disabled={disabled}
								class="px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors
									{targetResolution === preset.value
										? 'border-teal-500 bg-teal-900/30 text-teal-400'
										: 'border-gray-600 text-gray-300 hover:border-teal-500 hover:text-teal-400'}
									{disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:bg-gray-700'}"
							>
								{preset.label}
							</button>
						{/each}
						<button
							on:click={() => {
								targetResolution = null;
								onTargetResolutionChange(null);
							}}
							disabled={disabled}
							class="px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors
								{targetResolution === null
									? 'border-teal-500 bg-teal-900/30 text-teal-400'
									: 'border-gray-600 text-gray-300 hover:border-teal-500 hover:text-teal-400'}
								{disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:bg-gray-700'}"
						>
							Custom
						</button>
					</div>
				</div>

				{#if !isResolutionDifferent && originalWidth > 0}
					<p class="text-xs text-gray-400">
						Target resolution matches original. No scaling will occur.
					</p>
				{/if}
			</div>
		{:else}
			<p class="text-sm text-gray-400">Enable resolution scaling to change video dimensions</p>
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
