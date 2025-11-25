<script lang="ts">
	import { formatTime } from '$lib/utils/time-utils';

	export let duration: number = 0;
	export let startTime: number = 0;
	export let endTime: number = 0;
	// eslint-disable-next-line no-unused-vars
	export let onStartChange: (time: number) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onEndChange: (time: number) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onSeek: (time: number) => void = () => {};

	let containerElement: HTMLDivElement;
	let isDraggingStart = false;
	let isDraggingEnd = false;
	let isDraggingRange = false;

	$: startPercent = duration > 0 ? (startTime / duration) * 100 : 0;
	$: endPercent = duration > 0 ? (endTime / duration) * 100 : 100;
	$: rangeWidth = endPercent - startPercent;

	function getTimeFromPosition(clientX: number): number {
		if (!containerElement) return 0;
		const rect = containerElement.getBoundingClientRect();
		const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
		return (percent / 100) * duration;
	}

	function handleMouseDown(event: MouseEvent, handle: 'start' | 'end' | 'range') {
		event.preventDefault();

		if (handle === 'start') {
			isDraggingStart = true;
		} else if (handle === 'end') {
			isDraggingEnd = true;
		} else {
			isDraggingRange = true;
		}

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	}

	function handleTouchStart(event: TouchEvent, handle: 'start' | 'end' | 'range') {
		event.preventDefault();

		if (handle === 'start') {
			isDraggingStart = true;
		} else if (handle === 'end') {
			isDraggingEnd = true;
		} else {
			isDraggingRange = true;
		}

		document.addEventListener('touchmove', handleTouchMove, { passive: false });
		document.addEventListener('touchend', handleTouchEnd);
	}

	function handleMouseMove(event: MouseEvent) {
		if (!containerElement) return;
		event.preventDefault();

		const rect = containerElement.getBoundingClientRect();
		const percent = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
		const newTime = (percent / 100) * duration;

		if (isDraggingStart) {
			const newStart = Math.max(0, Math.min(newTime, endTime - 0.1));
			if (Math.abs(newStart - startTime) > 0.01) {
				onStartChange(newStart);
				onSeek(newStart);
			}
		} else if (isDraggingEnd) {
			const newEnd = Math.max(startTime + 0.1, Math.min(newTime, duration));
			if (Math.abs(newEnd - endTime) > 0.01) {
				onEndChange(newEnd);
				onSeek(newEnd);
			}
		} else if (isDraggingRange) {
			const rangeDuration = endTime - startTime;
			const newStart = Math.max(0, Math.min(newTime - rangeDuration / 2, duration - rangeDuration));
			const newEnd = newStart + rangeDuration;
			if (newEnd <= duration && Math.abs(newStart - startTime) > 0.01) {
				onStartChange(newStart);
				onEndChange(newEnd);
			}
		}
	}

	function handleTouchMove(event: TouchEvent) {
		if (!containerElement) return;
		event.preventDefault();

		const touch = event.touches[0];
		const rect = containerElement.getBoundingClientRect();
		const percent = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
		const newTime = (percent / 100) * duration;

		if (isDraggingStart) {
			const newStart = Math.max(0, Math.min(newTime, endTime - 0.1));
			if (Math.abs(newStart - startTime) > 0.01) {
				onStartChange(newStart);
				onSeek(newStart);
			}
		} else if (isDraggingEnd) {
			const newEnd = Math.max(startTime + 0.1, Math.min(newTime, duration));
			if (Math.abs(newEnd - endTime) > 0.01) {
				onEndChange(newEnd);
				onSeek(newEnd);
			}
		} else if (isDraggingRange) {
			const rangeDuration = endTime - startTime;
			const newStart = Math.max(0, Math.min(newTime - rangeDuration / 2, duration - rangeDuration));
			const newEnd = newStart + rangeDuration;
			if (newEnd <= duration && Math.abs(newStart - startTime) > 0.01) {
				onStartChange(newStart);
				onEndChange(newEnd);
			}
		}
	}

	function handleMouseUp() {
		isDraggingStart = false;
		isDraggingEnd = false;
		isDraggingRange = false;
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}

	function handleTouchEnd() {
		isDraggingStart = false;
		isDraggingEnd = false;
		isDraggingRange = false;
		document.removeEventListener('touchmove', handleTouchMove);
		document.removeEventListener('touchend', handleTouchEnd);
	}

	function handleClick(event: MouseEvent | KeyboardEvent) {
		// Don't handle clicks if we just finished dragging
		if (isDraggingStart || isDraggingEnd || isDraggingRange) return;
		if (!containerElement) return;
		
		// Don't handle clicks on handles or range area
		const target = event.target as HTMLElement;
		if (target.closest('[aria-label*="time"]') || target.closest('[aria-label*="range"]')) {
			return;
		}

		const clientX = 'clientX' in event ? event.clientX : containerElement.offsetWidth / 2;
		const time = getTimeFromPosition(clientX);
		if (time < startTime) {
			onStartChange(Math.max(0, time));
		} else if (time > endTime) {
			onEndChange(Math.min(duration, time));
		} else {
			// Click in the middle - move the range
			const rangeDuration = endTime - startTime;
			const newStart = Math.max(0, Math.min(time - rangeDuration / 2, duration - rangeDuration));
			onStartChange(newStart);
			onEndChange(newStart + rangeDuration);
		}
	}
</script>

<div class="timeline-slider w-full">
	<div class="mb-2 flex justify-between text-xs text-gray-600">
		<span>{formatTime(startTime)}</span>
		<span class="font-semibold text-blue-600">{formatTime(endTime - startTime)}</span>
		<span>{formatTime(endTime)}</span>
	</div>

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div
		bind:this={containerElement}
		class="relative h-12 cursor-pointer select-none"
		on:click={handleClick}
		aria-label="Video timeline"
	>
		<!-- Background track -->
		<div class="absolute inset-0 rounded-full bg-gray-200"></div>

		<!-- Selected range -->
		<div
			class="absolute top-0 h-full rounded-full bg-blue-500 {isDraggingStart || isDraggingEnd || isDraggingRange ? '' : 'transition-all'}"
			style="left: {startPercent}%; width: {rangeWidth}%"
		></div>

		<!-- Start handle -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="absolute top-1/2 h-8 w-8 sm:h-10 sm:w-10 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-3 border-blue-600 bg-white shadow-lg z-10 transition-transform hover:scale-110 active:cursor-grabbing active:scale-125 {isDraggingStart ? '' : 'transition-all'}"
			style="left: {startPercent}%"
			on:mousedown={(e) => {
				e.stopPropagation();
				handleMouseDown(e, 'start');
			}}
			on:touchstart={(e) => {
				e.stopPropagation();
				handleTouchStart(e, 'start');
			}}
			aria-label="Start time: {formatTime(startTime)}"
		>
			<div class="absolute inset-0 flex items-center justify-center">
				<div class="h-3 w-1 bg-blue-600 rounded"></div>
			</div>
		</div>

		<!-- End handle -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="absolute top-1/2 h-8 w-8 sm:h-10 sm:w-10 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-3 border-blue-600 bg-white shadow-lg z-10 transition-transform hover:scale-110 active:cursor-grabbing active:scale-125 {isDraggingEnd ? '' : 'transition-all'}"
			style="left: {endPercent}%"
			on:mousedown={(e) => {
				e.stopPropagation();
				handleMouseDown(e, 'end');
			}}
			on:touchstart={(e) => {
				e.stopPropagation();
				handleTouchStart(e, 'end');
			}}
			aria-label="End time: {formatTime(endTime)}"
		>
			<div class="absolute inset-0 flex items-center justify-center">
				<div class="h-3 w-1 bg-blue-600 rounded"></div>
			</div>
		</div>

		<!-- Draggable range area -->
		{#if rangeWidth > 5}
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<div
				class="absolute top-0 h-full cursor-move z-0"
				style="left: {startPercent}%; width: {rangeWidth}%"
				on:mousedown={(e) => {
					e.stopPropagation();
					handleMouseDown(e, 'range');
				}}
				on:touchstart={(e) => {
					e.stopPropagation();
					handleTouchStart(e, 'range');
				}}
				aria-label="Move trim range"
			></div>
		{/if}
	</div>

	<!-- Time markers (optional, for better UX) -->
	{#if duration > 0}
		<div class="mt-1 flex justify-between text-[10px] text-gray-400">
			<span>0:00</span>
			<span>{formatTime(duration / 2)}</span>
			<span>{formatTime(duration)}</span>
		</div>
	{/if}
</div>

<style>
	.timeline-slider {
		touch-action: none;
	}
</style>

