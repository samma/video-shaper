<script lang="ts">
	import { formatTime } from '$lib/utils/time-utils';

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

	function handleStartTimeChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const newStart = Math.max(0, Math.min(parseFloat(target.value) || 0, endTime - 1));
		startTime = newStart;
		onStartChange(newStart);
	}

	function handleEndTimeChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const newEnd = Math.max(startTime + 1, Math.min(parseFloat(target.value) || duration, duration));
		endTime = newEnd;
		onEndChange(newEnd);
	}
</script>

<div class="trim-controls space-y-4">
	<h3 class="text-lg font-semibold text-gray-800">Trim Video</h3>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="start-time" class="block text-sm font-medium text-gray-700 mb-1">
				Start Time
			</label>
			<input
				id="start-time"
				type="number"
				min="0"
				max={endTime - 1}
				step="0.1"
				value={startTime.toFixed(1)}
				on:input={handleStartTimeChange}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
			/>
			<p class="text-xs text-gray-500 mt-1">{formatTime(startTime)}</p>
		</div>

		<div>
			<label for="end-time" class="block text-sm font-medium text-gray-700 mb-1"> End Time </label>
			<input
				id="end-time"
				type="number"
				min={startTime + 1}
				max={duration}
				step="0.1"
				value={endTime.toFixed(1)}
				on:input={handleEndTimeChange}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
			/>
			<p class="text-xs text-gray-500 mt-1">{formatTime(endTime)}</p>
		</div>
	</div>

	<div class="bg-blue-50 border border-blue-200 rounded-md p-3">
		<p class="text-sm text-blue-800">
			<span class="font-semibold">Output duration:</span>
			{formatTime(trimDuration)}
		</p>
	</div>
</div>

