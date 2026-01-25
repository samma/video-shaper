<script lang="ts">
	import InfoTooltip from './InfoTooltip.svelte';

	export let formatConversionEnabled: boolean = false;
	export let outputFormat: string = 'mp4';
	export let inputFormat: string = 'mp4';
	export let disabled: boolean = false;
	// eslint-disable-next-line no-unused-vars
	export let onFormatConversionToggle: (enabled: boolean) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onOutputFormatChange: (format: string) => void = () => {};

	const VIDEO_FORMATS = [
		{ label: 'MP4', value: 'mp4', mimeType: 'video/mp4' },
		{ label: 'MOV', value: 'mov', mimeType: 'video/quicktime' },
		{ label: 'AVI', value: 'avi', mimeType: 'video/x-msvideo' },
		{ label: 'MKV', value: 'mkv', mimeType: 'video/x-matroska' },
		{ label: 'FLV', value: 'flv', mimeType: 'video/x-flv' }
	];

	function handleToggle() {
		if (disabled) return;
		formatConversionEnabled = !formatConversionEnabled;
		onFormatConversionToggle(formatConversionEnabled);
		
		// When enabling format conversion, default to MP4 if not already set
		if (formatConversionEnabled && !outputFormat) {
			outputFormat = 'mp4';
			onOutputFormatChange('mp4');
		}
	}

	function handleFormatChange(event: Event) {
		if (disabled) return;
		const target = event.target as HTMLSelectElement;
		outputFormat = target.value;
		onOutputFormatChange(target.value);
	}

	$: isFormatDifferent = formatConversionEnabled && outputFormat !== inputFormat;
	$: currentFormatLabel = VIDEO_FORMATS.find(f => f.value === inputFormat)?.label || inputFormat.toUpperCase();
	$: outputFormatLabel = VIDEO_FORMATS.find(f => f.value === outputFormat)?.label || outputFormat.toUpperCase();
</script>

<div class="format-controls bg-gray-700/50 rounded-lg p-4 sm:p-5 border border-gray-600/50 {disabled ? 'opacity-60' : ''}">
	<div class="space-y-4">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-lg font-semibold text-gray-200">Format Conversion</h3>
			<div class="flex items-center gap-2">
				<InfoTooltip
					content="Convert your video to a different format. When enabled, you can select from MP4, MOV, AVI, MKV, or FLV formats. Format conversion requires re-encoding the video, which may take longer than preserving the original format."
					position="top"
				/>
				<button
					on:click={handleToggle}
					disabled={disabled}
					class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors
						{formatConversionEnabled ? 'bg-teal-600' : 'bg-gray-600'}
						{disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}"
					role="switch"
					aria-checked={formatConversionEnabled}
					aria-label="Toggle format conversion"
					aria-disabled={disabled}
				>
					<span
						class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform
							{formatConversionEnabled ? 'translate-x-6' : 'translate-x-1'}"
					></span>
				</button>
			</div>
		</div>

		{#if formatConversionEnabled}
			<div class="space-y-3">
				<div class="flex items-center justify-between text-sm">
					<span class="text-gray-300">
						Input Format: <span class="text-teal-400">{currentFormatLabel}</span>
					</span>
					{#if isFormatDifferent}
						<span class="text-gray-400">
							→ <span class="text-teal-400">{outputFormatLabel}</span>
						</span>
					{/if}
				</div>

				<div class="space-y-2">
					<label for="format-select" class="block text-sm text-gray-300">
						Output Format:
					</label>
					<select
						id="format-select"
						bind:value={outputFormat}
						on:change={handleFormatChange}
						disabled={disabled}
						class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-200
							{disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-gray-500 focus:border-teal-500 focus:outline-none'}
							text-sm sm:text-base"
						aria-label="Select output format"
						aria-disabled={disabled}
					>
						{#each VIDEO_FORMATS as format}
							<option value={format.value} selected={outputFormat === format.value}>
								{format.label}
							</option>
						{/each}
					</select>
				</div>

				{#if !isFormatDifferent}
					<p class="text-xs text-gray-400">
						Output format matches input format. No conversion will occur.
					</p>
				{/if}
			</div>
		{:else}
			<p class="text-sm text-gray-400">Enable format conversion to change the video file format</p>
		{/if}
	</div>
</div>

