<script lang="ts">
	// eslint-disable-next-line no-unused-vars
	export let onProcess: () => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onCancel: () => void = () => {};
	export let processing: boolean = false;
	export let progress: number = 0;
	export let disabled: boolean = false;

	$: buttonDisabled = disabled || processing;
</script>

<div class="flex gap-2">
	{#if processing}
		<button
			on:click={onCancel}
			class="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base text-white bg-red-600 hover:bg-red-500 active:bg-red-700 transition-all"
		>
			Cancel
		</button>
		<button
			disabled
			class="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base text-white bg-teal-500 cursor-wait transition-all"
		>
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
				<span>Processing... {(progress * 100).toFixed(1)}%</span>
			</span>
		</button>
	{:else}
		<button
			on:click={onProcess}
			disabled={buttonDisabled}
			class="w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base text-white transition-all
				{buttonDisabled
				? 'bg-gray-600 cursor-not-allowed text-gray-400'
				: 'bg-teal-600 hover:bg-teal-500 active:bg-teal-700'}"
		>
			Process Video
		</button>
	{/if}
</div>

