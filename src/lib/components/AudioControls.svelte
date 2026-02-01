<script lang="ts">
	import InfoTooltip from './InfoTooltip.svelte';

	export let audioAdjustmentEnabled: boolean = false;
	export let volume: number = 100; // Volume percentage (0 = mute, 100 = original, 200 = 2x)
	export let disabled: boolean = false;
	// eslint-disable-next-line no-unused-vars
	export let onAudioAdjustmentToggle: (enabled: boolean) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onVolumeChange: (volume: number) => void = () => {};

	const MIN_VOLUME = 0;
	const MAX_VOLUME = 200;

	const VOLUME_PRESETS = [
		{ label: 'Mute', value: 0 },
		{ label: '50%', value: 50 },
		{ label: '100%', value: 100 },
		{ label: '150%', value: 150 },
		{ label: '200%', value: 200 }
	];

	function handleToggle() {
		if (disabled) return;
		audioAdjustmentEnabled = !audioAdjustmentEnabled;
		onAudioAdjustmentToggle(audioAdjustmentEnabled);
		
		// When enabling, keep at current volume (defaults to 100%)
	}

	function handleSliderChange(event: Event) {
		if (disabled) return;
		const target = event.target as HTMLInputElement;
		const newVolume = parseFloat(target.value);
		volume = newVolume;
		onVolumeChange(newVolume);
	}

	function handlePresetSelect(presetValue: number) {
		if (disabled) return;
		volume = presetValue;
		onVolumeChange(presetValue);
	}

	function getVolumeLabel(vol: number): string {
		if (vol === 0) return 'Muted';
		if (vol < 50) return 'Very Quiet';
		if (vol < 100) return 'Quiet';
		if (vol === 100) return 'Original';
		if (vol <= 150) return 'Louder';
		return 'Very Loud';
	}

	$: isMuted = volume === 0;
	$: isVolumeChanged = audioAdjustmentEnabled && volume !== 100;
</script>

<div class="audio-controls bg-gray-700/50 rounded-lg p-4 sm:p-5 border border-gray-600/50 {disabled ? 'opacity-60' : ''}">
	<div class="space-y-4">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-lg font-semibold text-gray-200">Audio</h3>
			<div class="flex items-center gap-2">
				<InfoTooltip
					content="Adjust the audio volume in the output video. Set to 0% to completely remove audio (mute), or increase above 100% to boost volume. Removing audio also reduces file size slightly."
					position="top"
				/>
				<button
					on:click={handleToggle}
					disabled={disabled}
					class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors
						{audioAdjustmentEnabled ? 'bg-teal-600' : 'bg-gray-600'}
						{disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}"
					role="switch"
					aria-checked={audioAdjustmentEnabled}
					aria-label="Toggle audio adjustment"
					aria-disabled={disabled}
				>
					<span
						class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform
							{audioAdjustmentEnabled ? 'translate-x-6' : 'translate-x-1'}"
					></span>
				</button>
			</div>
		</div>

		{#if audioAdjustmentEnabled}
			<div class="space-y-3">
				<!-- Volume Status -->
				<div class="flex items-center justify-between text-sm">
					<div class="flex items-center gap-2">
						{#if isMuted}
							<svg class="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clip-rule="evenodd" />
							</svg>
							<span class="text-gray-400">Audio will be removed</span>
						{:else if volume < 100}
							<svg class="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.293 3.707 1 1 0 01-1.414-1.414A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.293-2.293 1 1 0 010-1.414z" clip-rule="evenodd" />
							</svg>
							<span class="text-gray-300">Volume reduced to <span class="text-teal-400">{volume}%</span></span>
						{:else if volume === 100}
							<svg class="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd" />
							</svg>
							<span class="text-gray-300">Original volume</span>
						{:else}
							<svg class="w-5 h-5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clip-rule="evenodd" />
							</svg>
							<span class="text-gray-300">Volume boosted to <span class="text-teal-400">{volume}%</span></span>
						{/if}
					</div>
					<span class="text-xs text-gray-400">{getVolumeLabel(volume)}</span>
				</div>

				<!-- Volume Slider -->
				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<label for="volume-slider" class="text-gray-300">
							Volume: {volume}%
						</label>
					</div>
					<div class="relative">
						<div class="relative">
							<input
								id="volume-slider"
								type="range"
								min={MIN_VOLUME}
								max={MAX_VOLUME}
								step="1"
								value={volume}
								on:input={handleSliderChange}
								disabled={disabled}
								class="w-full h-2 bg-gray-700 rounded-lg appearance-none slider-teal {disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}"
								aria-label="Volume percentage"
								aria-disabled={disabled}
							/>
							<!-- Visual handle indicator overlay -->
							<div class="absolute top-1/2 pointer-events-none slider-handle-indicator" style="left: calc({(volume - MIN_VOLUME) / (MAX_VOLUME - MIN_VOLUME) * 100}% - 16px);">
								<div class="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-teal-600 bg-gray-800 shadow-lg flex items-center justify-center">
									<div class="h-2.5 w-0.5 bg-teal-600 rounded"></div>
								</div>
							</div>
						</div>
						<div class="flex justify-between text-xs text-gray-500 mt-1">
							<span>Mute</span>
							<span>100%</span>
							<span>200%</span>
						</div>
					</div>
				</div>

				<!-- Preset Buttons -->
				<div class="space-y-2">
					<div class="text-sm text-gray-300">Presets:</div>
					<div class="flex flex-wrap gap-2">
						{#each VOLUME_PRESETS as preset}
							<button
								on:click={() => handlePresetSelect(preset.value)}
								disabled={disabled}
								class="px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors
									{volume === preset.value
										? 'border-teal-500 bg-teal-900/30 text-teal-400'
										: 'border-gray-600 text-gray-300 hover:border-teal-500 hover:text-teal-400'}
									{disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:bg-gray-700'}"
							>
								{preset.label}
							</button>
						{/each}
					</div>
				</div>

				{#if !isVolumeChanged}
					<p class="text-xs text-gray-400">
						Volume is at original level. No audio adjustment will occur.
					</p>
				{/if}
			</div>
		{:else}
			<p class="text-sm text-gray-400">Enable to adjust audio volume level</p>
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
