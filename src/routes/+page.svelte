<script lang="ts">
	import FFmpegLoader from '$lib/components/FFmpegLoader.svelte';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import VideoPreview from '$lib/components/VideoPreview.svelte';
	import TrimControls from '$lib/components/TrimControls.svelte';
	import CompressionControls from '$lib/components/CompressionControls.svelte';
	import ProcessButton from '$lib/components/ProcessButton.svelte';
	import type { FFmpegService } from '$lib/ffmpeg/FFmpegService';
	import { estimateOutputFileSize, formatFileSizeMB } from '$lib/utils/file-utils';

	let title = 'Video Shaper';
	let ffmpegService: FFmpegService | null = null;
	let ffmpegError = '';

	// Video state
	let selectedFile: File | null = null;
	let videoDuration: number = 0;
	let startTime: number = 0;
	let endTime: number = 0;
	let videoPreviewComponent: any = null;

	// Compression state
	let compressionEnabled: boolean = false;
	let crf: number = 23;

	// Processing state
	let processing: boolean = false;
	let processingProgress: number = 0;
	let processingError: string = '';

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
	}

	// Computed: estimated output file size
	$: estimatedSize = selectedFile && videoDuration > 0
		? estimateOutputFileSize(
			selectedFile.size,
			videoDuration,
			endTime - startTime,
			compressionEnabled,
			crf
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

	function handleFileSelect(file: File) {
		selectedFile = file;
		// Reset trim times
		startTime = 0;
		endTime = 0;
		processingError = '';
		videoDuration = 0; // Reset duration to show loading state
		// Reset compression
		compressionEnabled = false;
		crf = 23;
	}

	function handleDurationLoad(duration: number) {
		videoDuration = duration;
		endTime = duration;
		// Warning will automatically hide when videoDuration > 0
	}

	async function handleProcess() {
		if (!ffmpegService || !selectedFile) return;

		// Warn about large files with compression
		if (compressionEnabled) {
			const fileSizeMB = selectedFile.size / (1024 * 1024);
			const trimmedDuration = endTime - startTime;
			const originalDuration = videoDuration;
			const estimatedTrimmedSizeMB = (fileSizeMB * trimmedDuration) / originalDuration;

			// Warn if file is large (either original or trimmed portion)
			if (fileSizeMB > 100 || estimatedTrimmedSizeMB > 50) {
				const message =
					`Large file detected (${formatFileSizeMB(selectedFile.size)} original, ` +
					`~${formatFileSizeMB(estimatedTrimmedSizeMB * 1024 * 1024)} trimmed). ` +
					`Compression may fail or take a very long time due to browser memory limits. ` +
					`Continue anyway?`;
				if (!confirm(message)) {
					return;
				}
			}
		}

		processing = true;
		processingProgress = 0;
		processingError = '';

		try {
			// Set up progress tracking
			ffmpegService.onProgress((progress) => {
				processingProgress = progress.ratio;
			});

			// Trim the video
			const trimmedBlob = await ffmpegService.trimVideo(selectedFile, {
				startTime,
				duration: endTime - startTime,
				compressionEnabled,
				crf
			});

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

<div class="min-h-screen bg-gray-900 p-3 sm:p-4">
	<div class="max-w-4xl mx-auto py-4 sm:py-8">
		<h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-4 sm:mb-8">
			{title}
		</h1>

		<div class="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
			<FFmpegLoader onReady={handleFFmpegReady} onError={handleFFmpegError}>
				{#if !selectedFile}
					<FileUpload onFileSelect={handleFileSelect} disabled={processing} />

					<!-- Information Card -->
					<div class="mt-4 sm:mt-6 bg-gray-700 rounded-lg p-4 sm:p-6 border border-gray-600">
						<div class="space-y-3 text-sm sm:text-base text-gray-300">
							<p>
								<strong class="text-cyan-400">Video Shaper</strong> is a client-side video editor that runs entirely in your browser. 
								All processing happens on your device - videos never leave your computer.
							</p>
							
							<div>
								<p class="font-semibold text-gray-200 mb-1">Features:</p>
								<ul class="list-disc list-inside space-y-1 ml-2 text-gray-300">
									<li>Trim videos to specific time ranges</li>
									<li>Compress videos to reduce file size</li>
									<li>Real-time preview of trim selection</li>
									<li>No server uploads - 100% client-side processing</li>
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
					<div class="mt-3 sm:mt-4 bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
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
												<a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline">GPL v3</a> 
												and <a href="https://www.gnu.org/licenses/lgpl-3.0.html" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline">LGPL v3</a>. 
												FFmpeg is used via <a href="https://github.com/ffmpegwasm/ffmpeg.wasm" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline">ffmpeg.wasm</a> 
												(MIT License).
											</li>
											<li>
												<strong class="text-gray-300">Svelte & SvelteKit</strong> - Licensed under 
												<a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline">MIT License</a>.
											</li>
											<li>
												<strong class="text-gray-300">TailwindCSS</strong> - Licensed under 
												<a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline">MIT License</a>.
											</li>
											<li>
												<strong class="text-gray-300">Vite</strong> - Licensed under 
												<a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline">MIT License</a>.
											</li>
											<li>
												<strong class="text-gray-300">TypeScript</strong> - Licensed under 
												<a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline">Apache License 2.0</a>.
											</li>
											<li>
												<strong class="text-gray-300">Playwright</strong> - Licensed under 
												<a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline">Apache License 2.0</a>.
											</li>
											<li>
												<strong class="text-gray-300">Vitest</strong> - Licensed under 
												<a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline">MIT License</a>.
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
						/>

						<TrimControls
							duration={videoDuration}
							bind:startTime
							bind:endTime
							onStartChange={(time) => (startTime = time)}
							onEndChange={(time) => (endTime = time)}
							onSeek={seekVideo}
						/>

						<CompressionControls
							bind:compressionEnabled
							bind:crf
							onCompressionToggle={(enabled) => (compressionEnabled = enabled)}
							onCrfChange={(value) => (crf = value)}
						/>

						{#if estimatedSize > 0}
							<div class="bg-gray-700 rounded-lg p-3 sm:p-4">
								<div class="flex items-center justify-between">
									<span class="text-gray-300 text-sm sm:text-base">Estimated Output Size:</span>
									<span class="text-cyan-400 font-semibold text-base sm:text-lg">
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

						<ProcessButton
							onProcess={handleProcess}
							onCancel={handleCancel}
							{processing}
							progress={processingProgress}
							disabled={!ffmpegService || videoDuration === 0}
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
	</div>
</div>
