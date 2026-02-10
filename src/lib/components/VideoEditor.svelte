<script lang="ts">
	import { onMount } from 'svelte';
	import FFmpegLoader from './FFmpegLoader.svelte';
	import FileUpload from './FileUpload.svelte';
	import VideoPreview from './VideoPreview.svelte';
	import TrimControls from './TrimControls.svelte';
	import CropControls from './CropControls.svelte';
	import CompressionControls from './CompressionControls.svelte';
	import FormatControls from './FormatControls.svelte';
	import ResolutionControls from './ResolutionControls.svelte';
	import AudioControls from './AudioControls.svelte';
	import ProcessButton from './ProcessButton.svelte';
	import type { FFmpegService } from '$lib/ffmpeg/FFmpegService';
	import { estimateOutputFileSize, formatFileSizeMB } from '$lib/utils/file-utils';
	import { buildErrorEventPath, trackEvent, type ProcessingContext } from '$lib/utils/error-analytics';

	// Props for customization
	export let defaultFeatures: {
		trim?: boolean;
		compress?: boolean;
		crop?: boolean;
		formatConversion?: boolean;
		resolutionScaling?: boolean;
		audioAdjustment?: boolean;
	} = {};

	export let showInfoCard: boolean = true;
	export let showBackButton: boolean = true;
	export let infoCardContent: 'full' | 'minimal' | 'none' = 'full';

	let ffmpegService: FFmpegService | null = null;
	let ffmpegError = '';
	let ffmpegLoading = false;
	let ffmpegLoadPromise: Promise<FFmpegService> | null = null;
	let ffmpegLoadResolve: ((service: FFmpegService) => void) | null = null;

	// Video state
	let selectedFile: File | null = null;
	let videoDuration: number = 0;
	let startTime: number = 0;
	let endTime: number = 0;
	let videoPreviewComponent: any = null;

	// Trim state - use default from props (defaults to false)
	let trimEnabled: boolean = defaultFeatures.trim ?? false;

	// Compression state - use default from props
	let compressionEnabled: boolean = defaultFeatures.compress ?? false;
	let crf: number = 23;

	// Crop state - use default from props
	let cropEnabled: boolean = defaultFeatures.crop ?? false;
	let cropX: number = 0;
	let cropY: number = 0;
	let cropWidth: number = 0;
	let cropHeight: number = 0;
	let aspectRatioLocked: boolean = false;
	let videoWidth: number = 0;
	let videoHeight: number = 0;

	// Format conversion state - use default from props
	let formatConversionEnabled: boolean = defaultFeatures.formatConversion ?? false;
	let outputFormat: string = 'mp4';
	let inputFormat: string = 'mp4';

	// Resolution scaling state - use default from props
	let resolutionScalingEnabled: boolean = defaultFeatures.resolutionScaling ?? false;
	let resolutionScale: number = 100;
	let targetResolution: string | null = null;

	// Audio state - use default from props
	let audioAdjustmentEnabled: boolean = defaultFeatures.audioAdjustment ?? false;
	let audioVolume: number = 100;

	// Processing state
	let processing: boolean = false;
	let processingProgress: number = 0;
	let processingStatus: string = '';
	let processingError: string = '';
	let processingWarning: string = '';
	let downloadSuccessMessage: string = '';
	let cancelRequested: boolean = false;
	
	// Error report consent state
	let pendingErrorReport: string | null = null; // the GoatCounter event path, held until user consents
	let errorReportSent: boolean = false;
	
	// Initial delay timeout for status message
	let initialDelayTimeout: ReturnType<typeof setTimeout> | null = null;

	// Detect iOS device
	function isIOS(): boolean {
		return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
			(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
	}

	// Format detection helper
	function getFileFormat(file: File): string {
		const extension = file.name.match(/\.[^/.]+$/)?.[0]?.toLowerCase() || '';
		const formatMap: Record<string, string> = {
			'.mp4': 'mp4',
			'.mov': 'mov',
			'.avi': 'avi',
			'.mkv': 'mkv',
			'.flv': 'flv'
		};
		return formatMap[extension] || 'mp4';
	}

	// Ensure dimension is even (required for H.264)
	function makeEven(value: number): number {
		return Math.floor(value / 2) * 2;
	}

	// Calculate scaled dimensions maintaining aspect ratio
	function calculateScaledDimensions(
		width: number,
		height: number,
		scalePercent: number,
		preset: string | null
	): { width: number; height: number } {
		if (width === 0 || height === 0) return { width: 0, height: 0 };

		const RESOLUTION_PRESETS = [
			{ label: '4K', value: '4k', width: 3840, height: 2160 },
			{ label: '1080p', value: '1080p', width: 1920, height: 1080 },
			{ label: '720p', value: '720p', width: 1280, height: 720 },
			{ label: '480p', value: '480p', width: 854, height: 480 },
			{ label: '360p', value: '360p', width: 640, height: 360 },
			{ label: '240p', value: '240p', width: 426, height: 240 }
		];

		const aspectRatio = width / height;
		let targetWidth: number;
		let targetHeight: number;

		if (preset) {
			const presetData = RESOLUTION_PRESETS.find(p => p.value === preset);
			if (presetData) {
				const widthRatio = presetData.width / width;
				const heightRatio = presetData.height / height;
				const scaleRatio = Math.min(widthRatio, heightRatio);

				targetWidth = width * scaleRatio;
				targetHeight = height * scaleRatio;
			} else {
				targetWidth = width * (scalePercent / 100);
				targetHeight = height * (scalePercent / 100);
			}
		} else {
			targetWidth = width * (scalePercent / 100);
			targetHeight = height * (scalePercent / 100);
		}

		targetWidth = makeEven(targetWidth);
		targetHeight = makeEven(targetHeight);

		if (targetWidth < 2) targetWidth = 2;
		if (targetHeight < 2) targetHeight = 2;

		return { width: targetWidth, height: targetHeight };
	}

	async function handleCancel() {
		cancelRequested = true;
		
		if (initialDelayTimeout !== null) {
			clearTimeout(initialDelayTimeout);
			initialDelayTimeout = null;
		}
		
		if (ffmpegService) {
			await ffmpegService.cancel();
		}
		processing = false;
		processingProgress = 0;
		processingStatus = '';
		processingError = '';
		processingWarning = '';
		pendingErrorReport = null;
		errorReportSent = false;
	}

	function handleSendErrorReport() {
		if (pendingErrorReport) {
			trackEvent(pendingErrorReport);
			errorReportSent = true;
			pendingErrorReport = null;
		}
	}

	function handleDismissWarning() {
		processingWarning = '';
	}

	function handleDismissSuccess() {
		downloadSuccessMessage = '';
	}

	// Computed: estimated output file size
	$: effectiveWidth = Math.round(cropEnabled && cropWidth > 0 ? cropWidth : videoWidth);
	$: effectiveHeight = Math.round(cropEnabled && cropHeight > 0 ? cropHeight : videoHeight);
	
	$: scaledDims = resolutionScalingEnabled && effectiveWidth > 0 && effectiveHeight > 0
		? calculateScaledDimensions(effectiveWidth, effectiveHeight, resolutionScale, targetResolution)
		: { width: effectiveWidth, height: effectiveHeight };

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
			cropEnabled && cropHeight > 0 ? cropHeight : undefined,
			formatConversionEnabled && outputFormat !== inputFormat ? outputFormat : undefined,
			resolutionScalingEnabled && scaledDims.width > 0 ? scaledDims.width : undefined,
			resolutionScalingEnabled && scaledDims.height > 0 ? scaledDims.height : undefined,
			audioAdjustmentEnabled && audioVolume === 0
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
		if (ffmpegLoadResolve) {
			ffmpegLoadResolve(service);
			ffmpegLoadResolve = null;
			ffmpegLoadPromise = null;
		}
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
		// Push state to browser history so back button works
		history.pushState({ editing: true }, '');
		// Reset FFmpeg service
		ffmpegService = null;
		ffmpegError = '';
		ffmpegLoadPromise = new Promise((resolve) => {
			ffmpegLoadResolve = resolve;
		});
		// Detect and set input format
		inputFormat = getFileFormat(file);
		outputFormat = inputFormat;
		// Reset trim times
		startTime = 0;
		endTime = 0;
		// Apply default features (trim defaults to false unless specified)
		trimEnabled = defaultFeatures.trim ?? false;
		compressionEnabled = defaultFeatures.compress ?? false;
		cropEnabled = defaultFeatures.crop ?? false;
		formatConversionEnabled = defaultFeatures.formatConversion ?? false;
		resolutionScalingEnabled = defaultFeatures.resolutionScaling ?? false;
		audioAdjustmentEnabled = defaultFeatures.audioAdjustment ?? false;
		
		processingError = '';
		processingWarning = '';
		videoDuration = 0;
		crf = 23;
		cropX = 0;
		cropY = 0;
		cropWidth = 0;
		cropHeight = 0;
		aspectRatioLocked = false;
		videoWidth = 0;
		videoHeight = 0;
		resolutionScale = 100;
		targetResolution = null;
		audioVolume = 100;
		downloadSuccessMessage = '';
	}

	function goBack() {
		selectedFile = null;
		ffmpegService = null;
		ffmpegError = '';
		ffmpegLoadPromise = null;
		ffmpegLoadResolve = null;
	}

	onMount(() => {
		const handlePopState = (event: PopStateEvent) => {
			if (selectedFile) {
				goBack();
			}
		};

		window.addEventListener('popstate', handlePopState);

		return () => {
			window.removeEventListener('popstate', handlePopState);
		};
	});

	function handleDurationLoad(duration: number) {
		videoDuration = duration;
		endTime = duration;
	}

	function handleVideoMetadataLoad(width: number, height: number) {
		videoWidth = width;
		videoHeight = height;
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
			cropX = 0;
			cropY = 0;
			cropWidth = videoWidth;
			cropHeight = videoHeight;
		} else if (!enabled) {
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
			aspectRatioLocked = false;
			return;
		}
		
		aspectRatioLocked = true;
		
		const currentCenterX = cropX + cropWidth / 2;
		const currentCenterY = cropY + cropHeight / 2;
		
		let newWidth: number;
		let newHeight: number;
		
		if (aspectRatio > videoWidth / videoHeight) {
			newHeight = Math.min(videoHeight, cropHeight);
			newWidth = newHeight * aspectRatio;
		} else {
			newWidth = Math.min(videoWidth, cropWidth);
			newHeight = newWidth / aspectRatio;
		}
		
		if (newWidth > videoWidth) {
			newWidth = videoWidth;
			newHeight = newWidth / aspectRatio;
		}
		if (newHeight > videoHeight) {
			newHeight = videoHeight;
			newWidth = newHeight * aspectRatio;
		}
		
		let newX = currentCenterX - newWidth / 2;
		let newY = currentCenterY - newHeight / 2;
		
		newX = Math.max(0, Math.min(videoWidth - newWidth, newX));
		newY = Math.max(0, Math.min(videoHeight - newHeight, newY));
		
		cropX = newX;
		cropY = newY;
		cropWidth = newWidth;
		cropHeight = newHeight;
	}

	async function handleProcess() {
		if (!selectedFile) return;

		processingError = '';
		pendingErrorReport = null;
		errorReportSent = false;
		cancelRequested = false;
		downloadSuccessMessage = '';
		processing = true;
		processingProgress = 0;
		processingStatus = '';

		if (!ffmpegService) {
			if (ffmpegLoading && ffmpegLoadPromise) {
				processingStatus = 'Loading video processor...';
				try {
					await ffmpegLoadPromise;
					if (!ffmpegService) {
						processingError = 'Failed to load video processor';
						processing = false;
						return;
					}
				} catch (error) {
					processingError = 'Failed to load video processor';
					processing = false;
					return;
				}
			} else {
				processingError = 'Video processor not available';
				processing = false;
				return;
			}
		}

		processingWarning = '';
		if (compressionEnabled) {
			const fileSizeMB = selectedFile.size / (1024 * 1024);
			const processedDuration = trimEnabled ? (endTime - startTime) : videoDuration;
			const originalDuration = videoDuration;
			const estimatedProcessedSizeMB = (fileSizeMB * processedDuration) / originalDuration;

			if (fileSizeMB > 100 || estimatedProcessedSizeMB > 50) {
				const durationLabel = trimEnabled ? 'trimmed' : 'full video';
				processingWarning =
					`Large file detected (${formatFileSizeMB(selectedFile.size)} original, ` +
					`~${formatFileSizeMB(estimatedProcessedSizeMB * 1024 * 1024)} ${durationLabel}). ` +
					`Compression may fail or take a very long time due to browser memory limits.`;
			}
		}

		if (initialDelayTimeout !== null) {
			clearTimeout(initialDelayTimeout);
		}

		initialDelayTimeout = setTimeout(() => {
			if (processingProgress === 0 && processing) {
				if (!processingStatus || processingStatus === '') {
					processingStatus = 'Analyzing video...';
				}
			}
		}, 2000);

		try {
			// Test hook: add ?testerror=true to the URL to simulate a processing error
			if (typeof window !== 'undefined' && window.location.search.includes('testerror=true')) {
				throw new Error('Simulated processing error for testing');
			}

			ffmpegService.onStatus((status) => {
				processingStatus = status;
				if (initialDelayTimeout !== null) {
					clearTimeout(initialDelayTimeout);
					initialDelayTimeout = null;
				}
			});

			ffmpegService.onProgress((progress) => {
				processingProgress = progress.ratio;
				
				if (progress.status) {
					processingStatus = progress.status;
					if (initialDelayTimeout !== null) {
						clearTimeout(initialDelayTimeout);
						initialDelayTimeout = null;
					}
				}
				
				if (progress.ratio > 0 && initialDelayTimeout !== null) {
					clearTimeout(initialDelayTimeout);
					initialDelayTimeout = null;
				}
			});

			const trimOptions: any = {
				startTime: trimEnabled ? startTime : 0,
				duration: trimEnabled ? (endTime - startTime) : videoDuration,
				compressionEnabled,
				crf
			};

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

			if (formatConversionEnabled && outputFormat !== inputFormat) {
				trimOptions.outputFormat = outputFormat;
			}

			const effectiveWidth = cropEnabled && cropWidth > 0 ? cropWidth : videoWidth;
			const effectiveHeight = cropEnabled && cropHeight > 0 ? cropHeight : videoHeight;
			
			if (resolutionScalingEnabled && effectiveWidth > 0 && effectiveHeight > 0) {
				const scaledDims = calculateScaledDimensions(
					effectiveWidth,
					effectiveHeight,
					resolutionScale,
					targetResolution
				);
				
				if (scaledDims.width !== effectiveWidth || scaledDims.height !== effectiveHeight) {
					trimOptions.scale = {
						width: scaledDims.width,
						height: scaledDims.height,
						maintainAspectRatio: true
					};
				}
			}

			if (audioAdjustmentEnabled && audioVolume !== 100) {
				trimOptions.audioVolume = audioVolume;
			}

			const trimmedBlob = await ffmpegService.trimVideo(selectedFile, trimOptions);

			const originalName = selectedFile.name;
			const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
			const outputExt = formatConversionEnabled && outputFormat !== inputFormat 
				? `.${outputFormat}` 
				: (originalName.match(/\.[^/.]+$/) || ['.mp4'])[0];
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
			const downloadFilename = `${nameWithoutExt}-${timestamp}${outputExt}`;

			const downloadUrl = URL.createObjectURL(trimmedBlob);
			const a = document.createElement('a');
			a.href = downloadUrl;
			a.download = downloadFilename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			
			setTimeout(() => {
				URL.revokeObjectURL(downloadUrl);
			}, 100);

			processingProgress = 1;
			processingStatus = 'Complete';
			
			// Track successful video processing (simple count, no metadata)
			trackEvent('video-process-success');
			
			if (isIOS()) {
				downloadSuccessMessage = 'Video downloaded! On iPhone/iPad: Tap the download icon (↓) in Safari\'s address bar to view, or find it in Files app > Downloads folder.';
			} else {
				downloadSuccessMessage = 'Video downloaded! Check your browser\'s download folder.';
			}
			
			setTimeout(() => {
				downloadSuccessMessage = '';
			}, 12000);
		} catch (error) {
			// If the user requested cancellation, ignore the error entirely
			if (cancelRequested) {
				processingError = '';
				pendingErrorReport = null;
				errorReportSent = false;
			} else {
				const errorMessage = error instanceof Error ? error.message : 'Failed to process video';
				processingError = errorMessage;
				
				// Prepare error report but do NOT send it yet — wait for user consent
				const errorContext: ProcessingContext = {
					features: {
						trim: trimEnabled,
						compress: compressionEnabled,
						crop: cropEnabled,
						formatConversion: formatConversionEnabled && outputFormat !== inputFormat,
						resolutionScaling: resolutionScalingEnabled,
						audioAdjustment: audioAdjustmentEnabled && audioVolume !== 100
					},
					inputFormat,
					outputFormat: formatConversionEnabled ? outputFormat : inputFormat,
					fileSizeBytes: selectedFile?.size ?? 0,
					durationSeconds: trimEnabled ? (endTime - startTime) : videoDuration
				};
				pendingErrorReport = buildErrorEventPath(error instanceof Error ? error : errorMessage, errorContext);
				errorReportSent = false;
				console.error('Processing error:', error);
			}
		} finally {
			if (initialDelayTimeout !== null) {
				clearTimeout(initialDelayTimeout);
				initialDelayTimeout = null;
			}
			processing = false;
		}
	}
</script>

<div class="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 md:p-8">
	{#if !selectedFile}
		<FileUpload onFileSelect={handleFileSelect} disabled={processing} />

		{#if showInfoCard && infoCardContent === 'full'}
			<!-- Information Card -->
			<div class="mt-4 sm:mt-6 bg-gray-700 rounded-lg p-4 sm:p-6 border border-gray-600">
				<div class="space-y-3 text-sm sm:text-base text-gray-300">
					<p>
						<strong class="text-teal-400">Video Shaper</strong> is a completely <strong class="text-teal-400">free</strong> video editor that runs entirely in your browser. 
						<strong class="text-teal-400">Trim</strong>, <strong class="text-teal-400">crop</strong>, <strong class="text-teal-400">compress</strong>, <strong class="text-teal-400">convert</strong>, <strong class="text-teal-400">resize</strong>, and <strong class="text-teal-400">adjust audio</strong> in videos with complete privacy—all processing happens on your device, and videos never leave your computer.
					</p>
					
					<div>
						<p class="font-semibold text-gray-200 mb-1">Features:</p>
						<ul class="list-disc list-inside space-y-1 ml-2 text-gray-300">
							<li>Trim videos to specific time ranges</li>
							<li>Crop videos to adjust frame and aspect ratio</li>
							<li>Compress videos to reduce file size</li>
							<li>Convert videos between formats (MP4, MOV, AVI, MKV, FLV)</li>
							<li>Reduce video resolution to decrease file size</li>
							<li>Adjust audio volume levels (including mute)</li>
							<li>Real-time preview of trim selection</li>
							<li>No uploads required - 100% client-side processing</li>
						</ul>
					</div>
				</div>
			</div>
		{:else if showInfoCard && infoCardContent === 'minimal'}
			<!-- Minimal info card for landing pages -->
			<div class="mt-4 sm:mt-6 bg-gray-700 rounded-lg p-4 border border-gray-600">
				<p class="text-sm sm:text-base text-gray-300">
					<strong class="text-teal-400">100% Private</strong> - Videos never leave your device. All processing happens in your browser.
				</p>
			</div>
		{/if}
	{:else}
		<!-- Load FFmpeg silently in background when file is selected -->
		<FFmpegLoader onReady={handleFFmpegReady} onError={handleFFmpegError} onLoadingChange={handleFFmpegLoadingChange} silent={true} />

		<!-- Back button -->
		{#if showBackButton}
			<button
				on:click={goBack}
				class="mb-4 flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
				aria-label="Go back to file selection"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				<span class="text-sm font-medium">Back</span>
			</button>
		{/if}

		<!-- Editor -->
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
					processingWarning = '';
				}}
				onCrfChange={(value) => (crf = value)}
			/>

			<FormatControls
				bind:formatConversionEnabled
				bind:outputFormat
				{inputFormat}
				disabled={processing}
				onFormatConversionToggle={(enabled) => {
					formatConversionEnabled = enabled;
				}}
				onOutputFormatChange={(format) => {
					outputFormat = format;
				}}
			/>

			<ResolutionControls
				bind:resolutionScalingEnabled
				bind:resolutionScale
				bind:targetResolution
				originalWidth={cropEnabled && cropWidth > 0 ? cropWidth : videoWidth}
				originalHeight={cropEnabled && cropHeight > 0 ? cropHeight : videoHeight}
				disabled={processing}
				onResolutionScalingToggle={(enabled) => {
					resolutionScalingEnabled = enabled;
				}}
				onResolutionScaleChange={(scale) => {
					resolutionScale = scale;
				}}
				onTargetResolutionChange={(preset) => {
					targetResolution = preset;
				}}
			/>

			<AudioControls
				bind:audioAdjustmentEnabled
				bind:volume={audioVolume}
				disabled={processing}
				onAudioAdjustmentToggle={(enabled) => {
					audioAdjustmentEnabled = enabled;
				}}
				onVolumeChange={(vol) => {
					audioVolume = vol;
				}}
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
							<p class="text-yellow-300 text-xs sm:text-sm">{processingWarning}</p>
						</div>
						<button
							on:click={handleDismissWarning}
							class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs sm:text-sm font-semibold rounded transition-colors flex-shrink-0 flex items-center gap-1.5"
							aria-label="Hide warning"
						>
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
							<span>Hide</span>
						</button>
					</div>
				</div>
			{/if}

			<ProcessButton
				onProcess={handleProcess}
				onCancel={handleCancel}
				{processing}
				progress={processingProgress}
				status={processingStatus}
				disabled={videoDuration === 0}
			/>

			{#if processingError}
				<div class="bg-red-900/60 border border-red-700 rounded-lg p-4 sm:p-5">
					<div class="flex items-start gap-3">
						<svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
						</svg>
						<div class="flex-1 min-w-0">
							<p class="text-red-200 font-semibold text-sm sm:text-base">Processing failed</p>
							<p class="text-red-300 text-xs sm:text-sm mt-1">{processingError}</p>
							
							{#if pendingErrorReport}
								<!-- Consent prompt: only sent if user explicitly agrees -->
								<div class="mt-3 pt-3 border-t border-red-800/50">
									<p class="text-gray-300 text-xs sm:text-sm">
										Would you like to send a brief, anonymous error report to help fix this issue? 
										Here is exactly what will be sent — nothing more:
									</p>
									<code class="block mt-2 px-3 py-2 bg-gray-900/80 border border-gray-700 rounded text-xs text-gray-300 break-all select-all">{pendingErrorReport}</code>
									<p class="mt-1.5 text-gray-500 text-xs">
										No filenames, video content, or personal information is included.
									</p>
									<button
										on:click={handleSendErrorReport}
										class="mt-2 px-4 py-1.5 bg-teal-700 hover:bg-teal-600 text-white text-xs sm:text-sm font-medium rounded transition-colors inline-flex items-center gap-1.5"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										Send error report
									</button>
								</div>
							{:else if errorReportSent}
								<div class="mt-3 pt-3 border-t border-red-800/50">
									<p class="text-teal-400 text-xs sm:text-sm flex items-center gap-1.5">
										<svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
											<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
										</svg>
										Thank you! Report sent. This helps improve Video Shaper for everyone.
									</p>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			{#if downloadSuccessMessage}
				<div class="bg-green-900/50 border border-green-700 rounded-lg p-3 sm:p-4">
					<div class="flex items-start gap-3">
						<svg class="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
						</svg>
						<div class="flex-1">
							<p class="text-green-200 font-semibold text-sm sm:text-base mb-1">Download Complete</p>
							<p class="text-green-300 text-xs sm:text-sm">{downloadSuccessMessage}</p>
						</div>
						<button
							on:click={handleDismissSuccess}
							class="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs sm:text-sm font-semibold rounded transition-colors flex-shrink-0 flex items-center gap-1.5"
							aria-label="Hide success message"
						>
							<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
							<span>Hide</span>
						</button>
					</div>
				</div>
			{/if}

			<!-- File info card at bottom -->
			<div class="bg-gray-700 rounded-lg p-3 sm:p-4 border border-gray-600">
				<div class="flex items-center justify-between">
					<div class="min-w-0 flex-1">
						<p class="text-xs sm:text-sm text-gray-400 mb-1">Current video</p>
						<p class="text-sm sm:text-base text-gray-300 truncate" title={selectedFile?.name}>
							{selectedFile?.name}
						</p>
					</div>
					<button
						on:click={goBack}
						class="ml-4 px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 bg-teal-700 hover:bg-teal-600 text-white border border-teal-600"
						disabled={processing}
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						<span>Edit another video</span>
					</button>
				</div>
			</div>
		</div>

		{#if ffmpegError}
			<div class="mt-4 bg-red-900/50 border border-red-700 rounded-lg p-3 sm:p-4 text-center">
				<p class="text-red-200 font-semibold text-sm sm:text-base mb-1">Failed to Load Video Processor</p>
				<p class="text-red-300 text-xs sm:text-sm">{ffmpegError}</p>
			</div>
		{/if}
	{/if}
</div>
