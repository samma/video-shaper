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

					<!-- Limitations Card -->
					<div class="mt-4 sm:mt-6 bg-gray-700 rounded-lg p-4 sm:p-6 border border-gray-600">
						<h2 class="text-lg sm:text-xl font-semibold text-gray-200 mb-3">Important Limitations</h2>
						
						<div class="space-y-2 text-sm sm:text-base text-gray-300">
							<ul class="list-disc list-inside space-y-2 ml-2">
								<li>Large videos (>100MB) may cause memory issues, especially with compression</li>
								<li>Processing is slower than native video editors (3-5x)</li>
								<li>Very large output files (>20MB) may fail to download due to browser memory limits</li>
								<li>For best results, trim to segments under 10 seconds when using compression</li>
								<li>Initial load downloads ~31MB (ffmpeg.wasm) - cached after first visit</li>
							</ul>
						</div>
					</div>

					<!-- Disclaimer Card -->
					<div class="mt-4 sm:mt-6 bg-gray-700 rounded-lg p-4 sm:p-6 border border-gray-600">
						<h2 class="text-lg sm:text-xl font-semibold text-gray-200 mb-3">Disclaimer</h2>
						
						<div class="text-xs sm:text-sm text-gray-400 leading-relaxed">
							<p>
								This service is provided "as is" without warranty of any kind. 
								Video Shaper processes videos entirely in your browser and does not guarantee successful processing for all video formats or sizes. 
								Users are responsible for backing up their original files. The developers are not liable for any data loss, corruption, or other issues 
								that may occur during video processing. Use at your own risk.
							</p>
						</div>
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
