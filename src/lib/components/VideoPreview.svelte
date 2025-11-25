<script lang="ts">
	import { onMount } from 'svelte';

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

</div>

