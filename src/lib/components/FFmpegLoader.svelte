<script lang="ts">
	import { onMount } from 'svelte';
	import { FFmpegService } from '$lib/ffmpeg/FFmpegService';

	// eslint-disable-next-line no-unused-vars
	export let onReady: (service: FFmpegService) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onError: (error: Error) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onLoadingChange: (isLoading: boolean) => void = () => {};
	export let silent: boolean = false; // Hide progress bar when true

	let loadStatus: 'checking' | 'unsupported' | 'loading' | 'loaded' | 'error' = 'checking';
	let errorMessage = '';
	let service: FFmpegService;
	let loadProgress: number = 0;

	// Notify parent when loading state changes
	$: {
		const loading = loadStatus === 'checking' || loadStatus === 'loading';
		onLoadingChange(loading);
	}

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
			loadProgress = 0;
			service = new FFmpegService();
			
			// Set up load progress callback
			service.onLoadProgress((progress) => {
				loadProgress = progress;
			});
			
			await service.initialize();
			loadStatus = 'loaded';
			loadProgress = 1;
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
		<div class="text-center p-4 mb-4">
			<div class="text-gray-300">Checking browser compatibility...</div>
		</div>
		<slot />
	{:else if loadStatus === 'unsupported'}
		<div class="bg-red-900 border border-red-700 rounded-lg p-3 sm:p-4 text-center mb-4">
			<div class="text-red-200 font-semibold text-sm sm:text-base mb-2">Browser Not Supported</div>
			<div class="text-red-300 text-xs sm:text-sm">
				Your browser does not support WebAssembly. Please use a modern browser like Chrome,
				Firefox, Safari, or Edge.
			</div>
		</div>
	{:else if loadStatus === 'loading'}
		{#if !silent}
			<div class="text-center p-4 sm:p-6 mb-4 bg-gray-700 rounded-lg border border-gray-600">
				<div class="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-teal-400 mb-3"></div>
				<div class="text-gray-200 font-medium text-sm sm:text-base mb-3">Loading video processor...</div>
				
				<!-- Progress Bar -->
				<div class="w-full bg-gray-600 rounded-full h-2 mb-2">
					<div 
						class="bg-teal-400 h-2 rounded-full transition-all duration-300 ease-out"
						style="width: {Math.round(loadProgress * 100)}%"
					></div>
				</div>
				
				<div class="text-gray-400 text-xs sm:text-sm">
					{#if sessionStorage.getItem('ffmpeg-loaded') === 'true'}
						Loading from cache... {Math.round(loadProgress * 100)}%
					{:else}
						This may take a moment (~31MB download) - {Math.round(loadProgress * 100)}%
					{/if}
				</div>
			</div>
		{/if}
		<slot />
	{:else if loadStatus === 'error'}
		<div class="bg-red-900 border border-red-700 rounded-lg p-3 sm:p-4 text-center mb-4">
			<div class="text-red-200 font-semibold text-sm sm:text-base mb-2">Failed to Load</div>
			<div class="text-red-300 text-xs sm:text-sm">{errorMessage}</div>
		</div>
		<slot />
	{:else if loadStatus === 'loaded'}
		<slot />
	{/if}
</div>

