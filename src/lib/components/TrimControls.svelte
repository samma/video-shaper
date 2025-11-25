<script lang="ts">
	import { formatTime } from '$lib/utils/time-utils';
	import TimelineSlider from './TimelineSlider.svelte';

	export let duration: number = 0;
	export let startTime: number = 0;
	export let endTime: number = 0;
	// eslint-disable-next-line no-unused-vars
	export let onStartChange: (time: number) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onEndChange: (time: number) => void = () => {};

	$: if (duration > 0 && endTime === 0) {
		endTime = duration;
		onEndChange(duration);
	}

	$: trimDuration = endTime - startTime;
</script>

<div class="trim-controls space-y-4">
	<h3 class="text-lg font-semibold text-gray-800 mb-2">Trim Video</h3>

	<!-- Timeline Slider - Primary Interface -->
	<div class="mb-4">
		<TimelineSlider
			{duration}
			bind:startTime
			bind:endTime
			{onStartChange}
			{onEndChange}
		/>
	</div>

	<!-- Summary -->
	<div class="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
		<p class="text-sm sm:text-base text-blue-800">
			<span class="font-semibold">Output duration:</span>
			<span class="ml-2">{formatTime(trimDuration)}</span>
		</p>
	</div>
</div>

