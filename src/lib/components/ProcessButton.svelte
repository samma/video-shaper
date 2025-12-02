<script lang="ts">
	// eslint-disable-next-line no-unused-vars
	export let onProcess: () => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onCancel: () => void = () => {};
	export let processing: boolean = false;
	export let progress: number = 0;
	export let disabled: boolean = false;
	export let status: string = '';

	$: buttonDisabled = disabled || processing;
</script>

<div class="flex gap-2">
	{#if processing}
		<button
			on:click={onCancel}
			class="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base text-white bg-red-600 hover:bg-red-500 active:bg-red-700 transition-all flex items-center justify-center gap-2"
		>
			<svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
			<span>Cancel</span>
		</button>
		<button
			disabled
			class="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base text-white bg-teal-500 cursor-wait transition-all"
		>
			<span class="flex flex-col items-center justify-center gap-1">
				<span class="flex items-center justify-center gap-2">
					<svg class="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
							fill="none"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<span>Processing... {Math.round(progress * 100)}%</span>
				</span>
				{#if status}
					<span class="text-xs text-teal-100 opacity-90 font-normal">{status}</span>
				{/if}
			</span>
		</button>
	{:else}
		<button
			on:click={onProcess}
			disabled={buttonDisabled}
			class="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base text-white transition-all flex items-center justify-center gap-2
				{buttonDisabled
				? 'bg-gray-600 cursor-not-allowed text-gray-400'
				: 'bg-teal-600 hover:bg-teal-500 active:bg-teal-700'}"
		>
			<svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
			</svg>
			<span>Process Video</span>
		</button>
	{/if}
</div>

