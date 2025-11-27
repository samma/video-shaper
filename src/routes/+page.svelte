<script lang="ts">
	import FFmpegLoader from '$lib/components/FFmpegLoader.svelte';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import VideoPreview from '$lib/components/VideoPreview.svelte';
	import TrimControls from '$lib/components/TrimControls.svelte';
	import CropControls from '$lib/components/CropControls.svelte';
	import CompressionControls from '$lib/components/CompressionControls.svelte';
	import ProcessButton from '$lib/components/ProcessButton.svelte';
	import type { FFmpegService } from '$lib/ffmpeg/FFmpegService';
	import { estimateOutputFileSize, formatFileSizeMB } from '$lib/utils/file-utils';

	let title = 'Free Video Shaper';
	let ffmpegService: FFmpegService | null = null;
	let ffmpegError = '';
	let ffmpegLoading = false;

	// Video state
	let selectedFile: File | null = null;
	let videoDuration: number = 0;
	let startTime: number = 0;
	let endTime: number = 0;
	let videoPreviewComponent: any = null;

	// Trim state
	let trimEnabled: boolean = true; // Enabled by default

	// Compression state
	let compressionEnabled: boolean = false;
	let crf: number = 23;

	// Crop state
	let cropEnabled: boolean = false;
	let cropX: number = 0;
	let cropY: number = 0;
	let cropWidth: number = 0;
	let cropHeight: number = 0;
	let aspectRatioLocked: boolean = false;
	let videoWidth: number = 0;
	let videoHeight: number = 0;

	// Processing state
	let processing: boolean = false;
	let processingProgress: number = 0;
	let processingError: string = '';
	let processingWarning: string = '';

	// Accordion state
	let limitationsExpanded: boolean = false;
	let disclaimerExpanded: boolean = false;

	function handleCancel() {
		if (ffmpegService) {
			ffmpegService.cancel();
		}
		processing = false;
		processingProgress = 0;
		processingError = 'Operation cancelled';
		processingWarning = '';
	}

	function handleProceedWithWarning() {
		processingWarning = '';
		handleProcess();
	}

	function handleDismissWarning() {
		processingWarning = '';
	}

	// Computed: estimated output file size
	$: estimatedSize = selectedFile && videoDuration > 0
		? estimateOutputFileSize(
			selectedFile.size,
			videoDuration,
			trimEnabled ? (endTime - startTime) : videoDuration,
			compressionEnabled,
			crf,
			videoWidth,
			videoHeight,
			cropEnabled && cropWidth > 0 ? cropWidth : undefined,
			cropEnabled && cropHeight > 0 ? cropHeight : undefined
		)
		: 0;

	function seekVideo(time: number) {
		if (videoPreviewComponent) {
			videoPreviewComponent.seekTo(time);
		}
	}

	function handleFFmpegReady(service: FFmpegService) {
		ffmpegService = service;
		console.log('FFmpeg is ready!');
	}

	function handleFFmpegError(error: Error) {
		ffmpegError = error.message;
		console.error('FFmpeg error:', error);
	}

	function handleFFmpegLoadingChange(isLoading: boolean) {
		ffmpegLoading = isLoading;
	}

	function handleFileSelect(file: File) {
		selectedFile = file;
		// Reset trim times
		startTime = 0;
		endTime = 0;
		trimEnabled = true; // Reset to enabled
		processingError = '';
		processingWarning = '';
		videoDuration = 0; // Reset duration to show loading state
		// Reset compression
		compressionEnabled = false;
		crf = 23;
		// Reset crop
		cropEnabled = false;
		cropX = 0;
		cropY = 0;
		cropWidth = 0;
		cropHeight = 0;
		aspectRatioLocked = false;
		videoWidth = 0;
		videoHeight = 0;
	}

	function handleDurationLoad(duration: number) {
		videoDuration = duration;
		endTime = duration;
		// Warning will automatically hide when videoDuration > 0
	}

	function handleVideoMetadataLoad(width: number, height: number) {
		videoWidth = width;
		videoHeight = height;
		// Initialize crop to full video size if enabled
		if (cropEnabled && cropWidth === 0 && cropHeight === 0) {
			cropX = 0;
			cropY = 0;
			cropWidth = width;
			cropHeight = height;
		}
	}

	function handleCropChange(x: number, y: number, width: number, height: number) {
		cropX = x;
		cropY = y;
		cropWidth = width;
		cropHeight = height;
	}

	function handleCropToggle(enabled: boolean) {
		cropEnabled = enabled;
		if (enabled && videoWidth > 0 && videoHeight > 0 && cropWidth === 0) {
			// Initialize to full video size
			cropX = 0;
			cropY = 0;
			cropWidth = videoWidth;
			cropHeight = videoHeight;
		} else if (!enabled) {
			// Reset crop
			cropX = 0;
			cropY = 0;
			cropWidth = 0;
			cropHeight = 0;
		}
	}

	function handleAspectRatioLockToggle(locked: boolean) {
		aspectRatioLocked = locked;
	}

	function handlePresetSelect(aspectRatio: number | null) {
		if (!cropEnabled || videoWidth === 0 || videoHeight === 0) return;
		
		if (aspectRatio === null) {
			// Custom - unlock aspect ratio
			aspectRatioLocked = false;
			return;
		}
		
		// Apply preset aspect ratio
		aspectRatioLocked = true;
		
		// Calculate new crop dimensions maintaining center point
		const currentCenterX = cropX + cropWidth / 2;
		const currentCenterY = cropY + cropHeight / 2;
		
		let newWidth: number;
		let newHeight: number;
		
		if (aspectRatio > videoWidth / videoHeight) {
			// Preset is wider than video - fit to height
			newHeight = Math.min(videoHeight, cropHeight);
			newWidth = newHeight * aspectRatio;
		} else {
			// Preset is taller than video - fit to width
			newWidth = Math.min(videoWidth, cropWidth);
			newHeight = newWidth / aspectRatio;
		}
		
		// Constrain to video bounds
		if (newWidth > videoWidth) {
			newWidth = videoWidth;
			newHeight = newWidth / aspectRatio;
		}
		if (newHeight > videoHeight) {
			newHeight = videoHeight;
			newWidth = newHeight * aspectRatio;
		}
		
		// Center the crop area
		let newX = currentCenterX - newWidth / 2;
		let newY = currentCenterY - newHeight / 2;
		
		// Constrain to video bounds
		newX = Math.max(0, Math.min(videoWidth - newWidth, newX));
		newY = Math.max(0, Math.min(videoHeight - newHeight, newY));
		
		cropX = newX;
		cropY = newY;
		cropWidth = newWidth;
		cropHeight = newHeight;
	}

	async function handleProcess() {
		if (!ffmpegService || !selectedFile) return;

		// Check for warnings about large files with compression
		processingWarning = '';
		if (compressionEnabled) {
			const fileSizeMB = selectedFile.size / (1024 * 1024);
			const processedDuration = trimEnabled ? (endTime - startTime) : videoDuration;
			const originalDuration = videoDuration;
			const estimatedProcessedSizeMB = (fileSizeMB * processedDuration) / originalDuration;

			// Warn if file is large (either original or processed portion)
			if (fileSizeMB > 100 || estimatedProcessedSizeMB > 50) {
				const durationLabel = trimEnabled ? 'trimmed' : 'full video';
				processingWarning =
					`Large file detected (${formatFileSizeMB(selectedFile.size)} original, ` +
					`~${formatFileSizeMB(estimatedProcessedSizeMB * 1024 * 1024)} ${durationLabel}). ` +
					`Compression may fail or take a very long time due to browser memory limits.`;
				return; // Don't proceed, show warning instead
			}
		}

		// Clear any previous warnings/errors and proceed
		processingWarning = '';
		processingError = '';
		processing = true;
		processingProgress = 0;

		try {
			// Set up progress tracking
			ffmpegService.onProgress((progress) => {
				processingProgress = progress.ratio;
			});

			// Build trim options with optional crop
			const trimOptions: any = {
				startTime: trimEnabled ? startTime : 0,
				duration: trimEnabled ? (endTime - startTime) : videoDuration,
				compressionEnabled,
				crf
			};

			// Add crop options if enabled
			if (cropEnabled && cropWidth > 0 && cropHeight > 0) {
				trimOptions.crop = {
					x: cropX,
					y: cropY,
					width: cropWidth,
					height: cropHeight,
					aspectRatioLocked,
					aspectRatio: cropWidth / cropHeight
				};
			}

			// Trim the video
			const trimmedBlob = await ffmpegService.trimVideo(selectedFile, trimOptions);

			// Download the result
			const downloadUrl = URL.createObjectURL(trimmedBlob);
			const a = document.createElement('a');
			a.href = downloadUrl;
			a.download = `trimmed-${selectedFile.name}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(downloadUrl);

			processingProgress = 1;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to process video';
			// Don't show error if it was cancelled
			if (!errorMessage.includes('cancelled')) {
				processingError = errorMessage;
			} else {
				processingError = '';
			}
			console.error('Processing error:', error);
		} finally {
			processing = false;
		}
	}
</script>

<svelte:head>
	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "WebApplication",
		"name": "Free Video Shaper",
		"description": "Free browser-based video editor for trimming, cropping, and compressing videos. No uploads required - videos are processed entirely in your browser and never leave your device.",
		"url": "https://video.shaper.samma.no",
		"applicationCategory": "MultimediaApplication",
		"operatingSystem": "Web Browser",
		"offers": {
			"@type": "Offer",
			"price": "0",
			"priceCurrency": "USD"
		},
		"featureList": [
			"Trim videos",
			"Crop videos",
			"Compress videos",
			"100% client-side processing",
			"No uploads required",
			"No data transfers",
			"Complete privacy - videos never leave your device"
		]
	}
	</script>`}
</svelte:head>

<div class="min-h-screen bg-gray-900 p-3 sm:p-4">
	<main id="main-content" class="max-w-4xl mx-auto py-4 sm:py-8">
		<h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-2 sm:mb-3">
			{title}
		</h1>
		<p class="text-center text-teal-300 text-sm sm:text-base md:text-lg font-medium mb-4 sm:mb-8 tracking-wide">
			Trim, Crop and Compress videos for free • No Uploads • No Transfers • 100% Private
		</p>

		<div class="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
			<FFmpegLoader onReady={handleFFmpegReady} onError={handleFFmpegError} onLoadingChange={handleFFmpegLoadingChange}>
				{#if !selectedFile}
					{#if !ffmpegLoading}
						<FileUpload onFileSelect={handleFileSelect} disabled={processing} />
					{/if}

					<!-- Information Card -->
					<div class="mt-4 sm:mt-6 bg-gray-700 rounded-lg p-4 sm:p-6 border border-gray-600">
						<div class="space-y-3 text-sm sm:text-base text-gray-300">
							<p>
								<strong class="text-teal-400">Video Shaper</strong> is a completely <strong class="text-teal-400">free</strong> video editor that runs entirely in your browser. 
								You can <strong class="text-teal-400">trim</strong>, <strong class="text-teal-400">crop</strong>, and <strong class="text-teal-400">compress</strong> videos. 
								All processing happens on your device - videos never leave your computer.
							</p>
							
							<div>
								<p class="font-semibold text-gray-200 mb-1">Features:</p>
								<ul class="list-disc list-inside space-y-1 ml-2 text-gray-300">
									<li>Trim videos to specific time ranges</li>
									<li>Crop videos to adjust frame and aspect ratio</li>
									<li>Compress videos to reduce file size</li>
									<li>Real-time preview of trim selection</li>
									<li>No uploads required - 100% client-side processing</li>
								</ul>
							</div>
						</div>
					</div>

					<!-- FAQ Card (Collapsible) -->
					<div class="mt-4 sm:mt-6 bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
						<button
							on:click={() => (limitationsExpanded = !limitationsExpanded)}
							class="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-gray-600 transition-colors"
							aria-expanded={limitationsExpanded}
							aria-controls="faq-content"
						>
							<h2 class="text-base sm:text-lg font-semibold text-gray-200">Frequently Asked Questions</h2>
							<svg
								class="w-5 h-5 text-gray-400 transition-transform {limitationsExpanded ? 'rotate-180' : ''}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</button>
						
						{#if limitationsExpanded}
							<div id="faq-content" class="px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
								<div class="space-y-4 text-sm sm:text-base">
									<div class="text-gray-300">
										<h3 class="font-semibold text-gray-200 mb-1">How can you edit videos without uploading them?</h3>
										<p class="text-gray-400">
											Video Shaper uses WebAssembly (WASM) technology to run FFmpeg, a powerful video processing library, directly in your browser. 
											When you select a video file, it's loaded into your browser's memory using the File API - no network upload occurs. 
											All video processing (<strong class="text-teal-400">trimming</strong>, <strong class="text-teal-400">cropping</strong>, <strong class="text-teal-400">compression</strong>, encoding) happens locally on your device using your computer's CPU and memory. 
											The processed video is then downloaded directly from your browser. This means your videos never leave your device and are never sent to any server. 
											No mobile data or internet bandwidth is used for video processing - everything happens offline once the app is loaded.
										</p>
									</div>

									<div class="text-gray-300">
										<h3 class="font-semibold text-gray-200 mb-1">What video formats are supported?</h3>
										<p class="text-gray-400">
											Video Shaper supports common video formats including MP4, WebM, MOV, AVI, and more. 
											The app uses ffmpeg.wasm which supports most video codecs. For best compatibility, MP4 files are recommended.
										</p>
									</div>

									<div class="text-gray-300">
										<h3 class="font-semibold text-gray-200 mb-1">Why is processing slow?</h3>
										<p class="text-gray-400">
											Video processing runs entirely in your browser using WebAssembly, which is 3-5x slower than native video editors. 
											This is the trade-off for complete privacy - your videos never leave your device. For faster processing, 
											trim to shorter segments (under 10 seconds) and avoid compression when possible.
										</p>
									</div>

									<div class="text-gray-300">
										<h3 class="font-semibold text-gray-200 mb-1">What are the file size limits?</h3>
										<p class="text-gray-400">
											Large videos (>100MB) may cause memory issues, especially with compression enabled. 
											Very large output files (>20MB) may fail to download due to browser memory limits. 
											For best results, keep trimmed segments under 10 seconds when using compression, or disable compression for larger files.
										</p>
									</div>

									<div class="text-gray-300">
										<h3 class="font-semibold text-gray-200 mb-1">Is my video data private?</h3>
										<p class="text-gray-400">
											Yes! All processing happens entirely in your browser. Videos never leave your computer and are never uploaded to any server. 
											The app downloads ffmpeg.wasm (~31MB) on first visit, but this is cached for future use.
										</p>
									</div>

									<div class="text-gray-300">
										<h3 class="font-semibold text-gray-200 mb-1">What is tracked?</h3>
										<p class="text-gray-400">
											This site uses <a href="https://www.goatcounter.com/" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">GoatCounter</a>, 
											a privacy-friendly analytics service, to simply count how many people visit the page. GoatCounter does not track personal data, 
											does not use cookies for tracking, and does not create unique user identifiers. It only collects basic page view statistics 
											(such as page paths, referrers, and browser information) to help understand site usage. No video data or personal information is tracked.
										</p>
									</div>

									<div class="text-gray-300">
										<h3 class="font-semibold text-gray-200 mb-1">Why does compression sometimes fail?</h3>
										<p class="text-gray-400">
											Compression requires significant browser memory. Very large videos or high-resolution files (like 4K) can exceed browser memory limits. 
											If compression fails, try: trimming to a shorter segment, using higher compression (move slider left), or disabling compression entirely. 
											The app will show helpful error messages if issues occur.
										</p>
									</div>
								</div>
							</div>
						{/if}
					</div>

					<!-- Disclaimer Card (Collapsible) -->
					<div class="mt-4 sm:mt-6 bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
						<button
							on:click={() => (disclaimerExpanded = !disclaimerExpanded)}
							class="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-gray-600 transition-colors"
							aria-expanded={disclaimerExpanded}
							aria-controls="disclaimer-content"
						>
							<h2 class="text-base sm:text-lg font-semibold text-gray-200">Disclaimer</h2>
							<svg
								class="w-5 h-5 text-gray-400 transition-transform {disclaimerExpanded ? 'rotate-180' : ''}"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
							</svg>
						</button>
						
						{#if disclaimerExpanded}
							<div id="disclaimer-content" class="px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
								<div class="text-xs sm:text-sm text-gray-400 leading-relaxed space-y-4">
									<div>
										<p>
											This service is provided "as is" without warranty of any kind. 
											Video Shaper processes videos entirely in your browser and does not guarantee successful processing for all video formats or sizes. 
											Users are responsible for backing up their original files. The developers are not liable for any data loss, corruption, or other issues 
											that may occur during video processing. Use at your own risk.
										</p>
									</div>

									<div class="border-t border-gray-600 pt-4">
										<h3 class="font-semibold text-gray-300 mb-3">Third-Party Licenses</h3>
										<p class="mb-3">
											Video Shaper uses the following open-source libraries and tools. Their respective licenses are listed below:
										</p>
										<ul class="space-y-2 ml-4 list-disc">
											<li>
												<strong class="text-gray-300">FFmpeg</strong> - Licensed under 
												<a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">GPL v3</a> 
												and <a href="https://www.gnu.org/licenses/lgpl-3.0.html" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">LGPL v3</a>. 
												FFmpeg is used via <a href="https://github.com/ffmpegwasm/ffmpeg.wasm" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">ffmpeg.wasm</a> 
												(MIT License).
											</li>
											<li>
												<strong class="text-gray-300">Svelte & SvelteKit</strong> - Licensed under 
												<a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">MIT License</a>.
											</li>
											<li>
												<strong class="text-gray-300">TailwindCSS</strong> - Licensed under 
												<a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">MIT License</a>.
											</li>
											<li>
												<strong class="text-gray-300">Vite</strong> - Licensed under 
												<a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">MIT License</a>.
											</li>
											<li>
												<strong class="text-gray-300">TypeScript</strong> - Licensed under 
												<a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">Apache License 2.0</a>.
											</li>
											<li>
												<strong class="text-gray-300">Playwright</strong> - Licensed under 
												<a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">Apache License 2.0</a>.
											</li>
											<li>
												<strong class="text-gray-300">Vitest</strong> - Licensed under 
												<a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">MIT License</a>.
											</li>
											<li>
												<strong class="text-gray-300">GoatCounter</strong> - Privacy-friendly web analytics. 
												See <a href="https://www.goatcounter.com/" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">GoatCounter.com</a> 
												and <a href="https://github.com/arp242/goatcounter" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">GitHub repository</a> for license information.
											</li>
										</ul>
										<p class="mt-4 text-gray-500 italic">
											For complete license information, please refer to the LICENSE files in each library's repository or the node_modules directory.
										</p>
									</div>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<div class="space-y-4 sm:space-y-6">
						<VideoPreview
							bind:this={videoPreviewComponent}
							videoFile={selectedFile}
							onDurationLoad={handleDurationLoad}
							onVideoMetadataLoad={handleVideoMetadataLoad}
							{cropEnabled}
							{cropX}
							{cropY}
							{cropWidth}
							{cropHeight}
							{aspectRatioLocked}
							onCropChange={handleCropChange}
						/>

						<TrimControls
							bind:trimEnabled
							duration={videoDuration}
							bind:startTime
							bind:endTime
							disabled={processing}
							onTrimToggle={(enabled) => (trimEnabled = enabled)}
							onStartChange={(time) => (startTime = time)}
							onEndChange={(time) => (endTime = time)}
							onSeek={seekVideo}
						/>

						<CropControls
							bind:cropEnabled
							bind:aspectRatioLocked
							disabled={processing}
							cropWidth={cropWidth}
							cropHeight={cropHeight}
							onCropToggle={handleCropToggle}
							onAspectRatioLockToggle={handleAspectRatioLockToggle}
							onPresetSelect={handlePresetSelect}
						/>

						<CompressionControls
							bind:compressionEnabled
							bind:crf
							disabled={processing}
							onCompressionToggle={(enabled) => {
								compressionEnabled = enabled;
								processingWarning = ''; // Clear warning when compression is toggled
							}}
							onCrfChange={(value) => (crf = value)}
						/>

						{#if estimatedSize > 0}
							<div class="bg-gray-700 rounded-lg p-3 sm:p-4">
								<div class="flex items-center justify-between">
									<span class="text-gray-300 text-sm sm:text-base">Estimated Output Size:</span>
									<span class="text-teal-400 font-semibold text-base sm:text-lg">
										~{formatFileSizeMB(estimatedSize)}
									</span>
								</div>
								{#if selectedFile}
									<div class="mt-2 text-xs sm:text-sm text-gray-400">
										Original: {formatFileSizeMB(selectedFile.size)} • 
										Reduction: {Math.round((1 - estimatedSize / selectedFile.size) * 100)}%
									</div>
								{/if}
							</div>
						{/if}

						{#if processingWarning}
							<div class="bg-yellow-900/50 border border-yellow-700 rounded-lg p-3 sm:p-4 mb-4">
								<div class="flex items-start gap-3">
									<svg class="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
									</svg>
									<div class="flex-1">
										<p class="text-yellow-200 font-semibold text-sm sm:text-base mb-1">Warning</p>
										<p class="text-yellow-300 text-xs sm:text-sm mb-3">{processingWarning}</p>
										<div class="flex gap-2">
											<button
												on:click={handleProceedWithWarning}
												class="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-semibold rounded transition-colors"
											>
												Continue Anyway
											</button>
											<button
												on:click={handleDismissWarning}
												class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-semibold rounded transition-colors"
											>
												Cancel
											</button>
										</div>
									</div>
								</div>
							</div>
						{/if}

						<ProcessButton
							onProcess={handleProcess}
							onCancel={handleCancel}
							{processing}
							progress={processingProgress}
							disabled={!ffmpegService || videoDuration === 0 || !!processingWarning}
						/>

						{#if processingError}
							<div class="bg-red-900 border border-red-700 rounded-lg p-3 sm:p-4 text-center">
								<p class="text-red-200 font-semibold text-sm sm:text-base">Error</p>
								<p class="text-red-300 text-xs sm:text-sm mt-1">{processingError}</p>
							</div>
						{/if}

						<button
							on:click={() => (selectedFile = null)}
							class="w-full py-2 sm:py-2.5 px-4 text-sm sm:text-base border border-gray-600 rounded-lg text-gray-200 hover:bg-gray-700 active:bg-gray-600 transition-colors"
							disabled={processing}
						>
							Select Different Video
						</button>
					</div>
				{/if}
			</FFmpegLoader>

			{#if ffmpegError}
				<div class="mt-4 text-center text-red-400 text-sm">
					Error: {ffmpegError}
				</div>
			{/if}
		</div>
	</main>
</div>
