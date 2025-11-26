<script lang="ts">
	import TimelineSlider from './TimelineSlider.svelte';

	export let duration: number = 0;
	export let startTime: number = 0;
	export let endTime: number = 0;
	export let disabled: boolean = false;
	// eslint-disable-next-line no-unused-vars
	export let onStartChange: (time: number) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onEndChange: (time: number) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onSeek: (time: number) => void = () => {};

	$: if (duration > 0 && endTime === 0) {
		endTime = duration;
		onEndChange(duration);
	}
</script>

<div class="trim-controls space-y-4">
	<h3 class="text-lg font-semibold text-gray-200 mb-2">Trim Video</h3>

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
</div>

