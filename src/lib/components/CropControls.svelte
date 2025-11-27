<script lang="ts">
	export let cropEnabled: boolean = false;
	export let aspectRatioLocked: boolean = false;
	export let disabled: boolean = false;
	export let cropWidth: number = 0;
	export let cropHeight: number = 0;
	// eslint-disable-next-line no-unused-vars
	export let onCropToggle: (enabled: boolean) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onAspectRatioLockToggle: (locked: boolean) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onPresetSelect: (aspectRatio: number | null) => void = () => {};

	const ASPECT_RATIO_PRESETS = [
		{ label: '16:9', value: 16 / 9 },
		{ label: '9:16', value: 9 / 16 },
		{ label: '1:1', value: 1 },
		{ label: '4:3', value: 4 / 3 },
		{ label: '3:4', value: 3 / 4 }
	];

	function handleToggle() {
		if (disabled) return;
		cropEnabled = !cropEnabled;
		onCropToggle(cropEnabled);
	}

	function handleAspectRatioLockToggle() {
		if (disabled) return;
		aspectRatioLocked = !aspectRatioLocked;
		onAspectRatioLockToggle(aspectRatioLocked);
	}

	function handlePresetSelect(preset: { label: string; value: number }) {
		if (disabled) return;
		onPresetSelect(preset.value);
	}

	function handleCustomPreset() {
		if (disabled) return;
		onPresetSelect(null); // null means custom/free-form
	}

	$: currentAspectRatio = cropWidth > 0 && cropHeight > 0 ? (cropWidth / cropHeight).toFixed(2) : '0.00';
</script>

<div class="crop-controls space-y-4 {disabled ? 'opacity-60' : ''}">
	<div class="flex items-center justify-between mb-2">
		<h3 class="text-lg font-semibold text-gray-200">Crop Video</h3>
		<button
			on:click={handleToggle}
			disabled={disabled}
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors
				{cropEnabled ? 'bg-teal-600' : 'bg-gray-600'}
				{disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}"
			role="switch"
			aria-checked={cropEnabled}
			aria-label="Toggle crop"
			aria-disabled={disabled}
		>
			<span
				class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform
					{cropEnabled ? 'translate-x-6' : 'translate-x-1'}"
			></span>
		</button>
	</div>

	{#if cropEnabled}
		<div class="space-y-3">
			<div class="flex items-center justify-between text-sm">
				<span class="text-gray-300">
					Dimensions: {cropWidth > 0 ? Math.round(cropWidth) : '0'} × {cropHeight > 0 ? Math.round(cropHeight) : '0'}px
				</span>
				<span class="text-gray-400">
					Aspect Ratio: {currentAspectRatio}
				</span>
			</div>

			<!-- Aspect Ratio Lock Toggle -->
			<div class="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
				<label class="text-sm text-gray-300 cursor-pointer" for="aspect-lock">
					Lock Aspect Ratio
				</label>
				<button
					id="aspect-lock"
					on:click={handleAspectRatioLockToggle}
					disabled={disabled}
					class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors
						{aspectRatioLocked ? 'bg-cyan-600' : 'bg-gray-600'}
						{disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}"
					role="switch"
					aria-checked={aspectRatioLocked}
					aria-label="Toggle aspect ratio lock"
				>
					<span
						class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform
							{aspectRatioLocked ? 'translate-x-5' : 'translate-x-1'}"
					></span>
				</button>
			</div>

			<!-- Aspect Ratio Presets -->
			<div class="space-y-2">
				<div class="text-sm text-gray-300">Aspect Ratio Presets:</div>
				<div class="flex flex-wrap gap-2">
					{#each ASPECT_RATIO_PRESETS as preset}
						<button
							on:click={() => handlePresetSelect(preset)}
							disabled={disabled}
							class="px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors
								{disabled ? 'border-gray-600 text-gray-500 cursor-not-allowed' : 'border-gray-600 text-gray-300 hover:border-cyan-500 hover:text-cyan-400 active:bg-gray-700'}"
						>
							{preset.label}
						</button>
					{/each}
					<button
						on:click={handleCustomPreset}
						disabled={disabled}
						class="px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors
							{disabled ? 'border-gray-600 text-gray-500 cursor-not-allowed' : 'border-gray-600 text-gray-300 hover:border-cyan-500 hover:text-cyan-400 active:bg-gray-700'}"
					>
						Custom
					</button>
				</div>
			</div>

			<p class="text-xs text-gray-400 mt-2">
				Drag the handles on the video preview to adjust the crop area
			</p>
		</div>
	{:else}
		<p class="text-sm text-gray-400">Enable crop to adjust video dimensions</p>
	{/if}
</div>

