<script lang="ts">
	import FFmpegLoader from '$lib/components/FFmpegLoader.svelte';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import VideoPreview from '$lib/components/VideoPreview.svelte';
	import TrimControls from '$lib/components/TrimControls.svelte';
	import ProcessButton from '$lib/components/ProcessButton.svelte';
	import type { FFmpegService } from '$lib/ffmpeg/FFmpegService';
	import { formatFileSize, isFileTooLarge } from '$lib/utils/file-utils';

	let title = 'Video Shaper';
	let ffmpegService: FFmpegService | null = null;
	let ffmpegError = '';

	// Video state
	let selectedFile: File | null = null;
	let videoDuration: number = 0;
	let startTime: number = 0;
	let endTime: number = 0;

	// Processing state
	let processing: boolean = false;
	let processingProgress: number = 0;
	let processingError: string = '';

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

		// Warn about large files
		if (isFileTooLarge(file, 100)) {
			alert(
				`Warning: Large file detected (${formatFileSize(file.size)}). Processing may take longer and use significant memory.`
			);
		}
	}

	function handleDurationLoad(duration: number) {
		videoDuration = duration;
		endTime = duration;
	}

	async function handleProcess() {
		if (!ffmpegService || !selectedFile) return;

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
				duration: endTime - startTime
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
			processingError = error instanceof Error ? error.message : 'Failed to process video';
			console.error('Processing error:', error);
		} finally {
			processing = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50 p-3 sm:p-4">
	<div class="max-w-4xl mx-auto py-4 sm:py-8">
		<h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4 sm:mb-8">
			{title}
		</h1>

		<div class="bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
			<FFmpegLoader onReady={handleFFmpegReady} onError={handleFFmpegError}>
				{#if !selectedFile}
					<FileUpload onFileSelect={handleFileSelect} disabled={processing} />
				{:else}
					<div class="space-y-4 sm:space-y-6">
						<VideoPreview
							videoFile={selectedFile}
							onDurationLoad={handleDurationLoad}
						/>

						<TrimControls
							duration={videoDuration}
							bind:startTime
							bind:endTime
							onStartChange={(time) => (startTime = time)}
							onEndChange={(time) => (endTime = time)}
						/>

						<ProcessButton
							onProcess={handleProcess}
							{processing}
							progress={processingProgress}
							disabled={!ffmpegService || videoDuration === 0}
						/>

						{#if processingError}
							<div class="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 text-center">
								<p class="text-red-800 font-semibold text-sm sm:text-base">Error</p>
								<p class="text-red-600 text-xs sm:text-sm mt-1">{processingError}</p>
							</div>
						{/if}

						<button
							on:click={() => (selectedFile = null)}
							class="w-full py-2 sm:py-2.5 px-4 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
							disabled={processing}
						>
							Select Different Video
						</button>
					</div>
				{/if}
			</FFmpegLoader>

			{#if ffmpegError}
				<div class="mt-4 text-center text-red-600 text-sm">
					Error: {ffmpegError}
				</div>
			{/if}
		</div>
	</div>
</div>
