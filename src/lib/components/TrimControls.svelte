<script lang="ts">
	import TimelineSlider from './TimelineSlider.svelte';

	export let trimEnabled: boolean = true;
	export let duration: number = 0;
	export let startTime: number = 0;
	export let endTime: number = 0;
	export let disabled: boolean = false;
	// eslint-disable-next-line no-unused-vars
	export let onTrimToggle: (enabled: boolean) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onStartChange: (time: number) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onEndChange: (time: number) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onSeek: (time: number) => void = () => {};

	let previousTrimEnabled = trimEnabled;
	
	function handleToggle() {
		if (disabled) return;
		const previousState = trimEnabled;
		trimEnabled = !trimEnabled;
		previousTrimEnabled = previousState;
		onTrimToggle(trimEnabled);
		
		// When enabling trim, reset to full video range
		if (!previousState && trimEnabled && duration > 0) {
			onStartChange(0);
			onEndChange(duration);
		}
	}

	$: if (duration > 0 && endTime === 0) {
		endTime = duration;
		onEndChange(duration);
	}
	
	// Reset to full range when trim becomes enabled (from external change)
	$: {
		if (trimEnabled && !previousTrimEnabled && duration > 0) {
			onStartChange(0);
			onEndChange(duration);
		}
		// Update tracking variable after checking
		previousTrimEnabled = trimEnabled;
	}
</script>

<div class="trim-controls bg-gray-700/50 rounded-lg p-4 sm:p-5 border border-gray-600/50 {disabled ? 'opacity-60' : ''}">
	<div class="space-y-4">
		<div class="flex items-center justify-between mb-2">
			<h3 class="text-lg font-semibold text-gray-200">Trim Video</h3>
			<button
				on:click={handleToggle}
				disabled={disabled}
				class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors
					{trimEnabled ? 'bg-teal-600' : 'bg-gray-600'}
					{disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}"
				role="switch"
				aria-checked={trimEnabled}
				aria-label="Toggle trim"
				aria-disabled={disabled}
			>
				<span
					class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform
						{trimEnabled ? 'translate-x-6' : 'translate-x-1'}"
				></span>
			</button>
		</div>

		{#if trimEnabled}
			<!-- Timeline Slider - Primary Interface -->
			<div>
				<TimelineSlider
					{duration}
					bind:startTime
					bind:endTime
					{disabled}
					{onStartChange}
					{onEndChange}
					{onSeek}
				/>
			</div>
		{:else}
			<p class="text-sm text-gray-400">Enable trimming to select a specific time range</p>
		{/if}
	</div>
</div>

