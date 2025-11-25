<script lang="ts">
	import { onMount } from 'svelte';
	import { formatTime } from '$lib/utils/time-utils';

	export let videoFile: File;
	export let currentTime: number = 0;
	export let duration: number = 0;
	// eslint-disable-next-line no-unused-vars
	export let onTimeUpdate: (time: number) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onDurationLoad: (duration: number) => void = () => {};

	let videoElement: HTMLVideoElement;
	let videoUrl: string;

	function handleKeyPress(event: KeyboardEvent) {
		if (!videoElement) return;

		// Only handle if video is focused or document is focused
		if (event.target instanceof HTMLInputElement) return;

		switch (event.key) {
			case ' ':
				event.preventDefault();
				if (videoElement.paused) {
					videoElement.play();
				} else {
					videoElement.pause();
				}
				break;
			case 'ArrowLeft':
				event.preventDefault();
				videoElement.currentTime = Math.max(0, videoElement.currentTime - 5);
				break;
			case 'ArrowRight':
				event.preventDefault();
				videoElement.currentTime = Math.min(
					videoElement.duration,
					videoElement.currentTime + 5
				);
				break;
		}
	}

	onMount(() => {
		videoUrl = URL.createObjectURL(videoFile);
		window.addEventListener('keydown', handleKeyPress);
		return () => {
			URL.revokeObjectURL(videoUrl);
			window.removeEventListener('keydown', handleKeyPress);
		};
	});

	function handleLoadedMetadata() {
		if (videoElement) {
			duration = videoElement.duration;
			onDurationLoad(duration);
		}
	}

	function handleTimeUpdate() {
		if (videoElement) {
			currentTime = videoElement.currentTime;
			onTimeUpdate(currentTime);
		}
	}

	function handleSeek(time: number) {
		if (videoElement) {
			videoElement.currentTime = time;
		}
	}

	export function seekTo(time: number) {
		handleSeek(time);
	}
</script>

<div class="video-preview">
	<div class="bg-black rounded-lg overflow-hidden">
		<!-- svelte-ignore a11y-media-has-caption -->
		<video
			bind:this={videoElement}
			src={videoUrl}
			controls
			class="w-full"
			on:loadedmetadata={handleLoadedMetadata}
			on:timeupdate={handleTimeUpdate}
		>
			Your browser does not support video playback.
		</video>
	</div>

	<div class="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 text-center">
		{#if duration}
			<div class="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
				<span>Duration: {formatTime(duration)}</span>
				<span class="hidden sm:inline">|</span>
				<span>Current: {formatTime(currentTime)}</span>
			</div>
			<span class="text-[10px] sm:text-xs text-gray-400 mt-1 block">
				(Space: play/pause, ←→: seek)
			</span>
		{:else}
			Loading video...
		{/if}
	</div>
</div>

