<script lang="ts">
	import { onMount } from 'svelte';
	import { FFmpegService } from '$lib/ffmpeg/FFmpegService';

	// eslint-disable-next-line no-unused-vars
	export let onReady: (service: FFmpegService) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onError: (error: Error) => void = () => {};

	let loadStatus: 'checking' | 'unsupported' | 'loading' | 'loaded' | 'error' = 'checking';
	let errorMessage = '';
	let service: FFmpegService;

	onMount(async () => {
		// Check if WebAssembly is supported
		if (!FFmpegService.isSupported()) {
			loadStatus = 'unsupported';
			const error = new Error(
				'Your browser does not support WebAssembly, which is required for video processing.'
			);
			onError(error);
			return;
		}

		// Check if FFmpeg is already cached
		const cached = sessionStorage.getItem('ffmpeg-loaded');
		if (cached === 'true') {
			loadStatus = 'loading';
			// Still need to initialize, but user knows it's cached
		}

		try {
			loadStatus = 'loading';
			service = new FFmpegService();
			await service.initialize();
			loadStatus = 'loaded';
			sessionStorage.setItem('ffmpeg-loaded', 'true');
			onReady(service);
		} catch (error) {
			loadStatus = 'error';
			errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			onError(error instanceof Error ? error : new Error('Failed to load FFmpeg'));
		}
	});
</script>

<div class="ffmpeg-loader">
	{#if loadStatus === 'checking'}
		<div class="text-center p-4">
			<div class="text-gray-600">Checking browser compatibility...</div>
		</div>
	{:else if loadStatus === 'unsupported'}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
			<div class="text-red-800 font-semibold mb-2">Browser Not Supported</div>
			<div class="text-red-600 text-sm">
				Your browser does not support WebAssembly. Please use a modern browser like Chrome,
				Firefox, Safari, or Edge.
			</div>
		</div>
	{:else if loadStatus === 'loading'}
		<div class="text-center p-4">
			<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
			<div class="text-gray-700 font-medium">Loading video processor...</div>
			<div class="text-gray-500 text-sm mt-1">
				{#if sessionStorage.getItem('ffmpeg-loaded') === 'true'}
					Loading from cache...
				{:else}
					This may take a moment (~31MB download)
				{/if}
			</div>
		</div>
	{:else if loadStatus === 'error'}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
			<div class="text-red-800 font-semibold mb-2">Failed to Load</div>
			<div class="text-red-600 text-sm">{errorMessage}</div>
		</div>
	{:else if loadStatus === 'loaded'}
		<slot />
	{/if}
</div>

