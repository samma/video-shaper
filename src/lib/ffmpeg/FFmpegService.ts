import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import type { FFmpegProgress, TrimOptions, FFmpegLoadStatus } from './types';

export class FFmpegService {
	private ffmpeg: FFmpeg;
	private loadStatus: FFmpegLoadStatus = 'unloaded';
	private loadProgress: number = 0;
	private onProgressCallback?: (progress: FFmpegProgress) => void;
	private isCancelled: boolean = false;

	constructor() {
		this.ffmpeg = new FFmpeg();
	}

	/**
	 * Initialize ffmpeg.wasm - loads the WebAssembly binary
	 * This is ~31MB and should be called only once
	 */
	async initialize(): Promise<void> {
		if (this.loadStatus === 'loaded') {
			return;
		}

		if (this.loadStatus === 'loading') {
			throw new Error('FFmpeg is already loading');
		}

		try {
			this.loadStatus = 'loading';
			this.loadProgress = 0;

			// Set up progress logging
			this.ffmpeg.on('log', ({ message }) => {
				console.log('[FFmpeg]', message);
			});

			this.ffmpeg.on('progress', ({ progress, time }) => {
				if (this.onProgressCallback) {
					this.onProgressCallback({ ratio: progress, time });
				}
			});

			// Load the WebAssembly binary from CDN
			const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

			await this.ffmpeg.load({
				coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
				wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
			});

			this.loadStatus = 'loaded';
			this.loadProgress = 1;
		} catch (error) {
			this.loadStatus = 'error';
			console.error('Failed to load FFmpeg:', error);
			throw new Error(`Failed to initialize FFmpeg: ${error}`);
		}
	}

	/**
	 * Trim a video file to a specific time range
	 */
	async trimVideo(file: File, options: TrimOptions): Promise<Blob> {
		// Ensure FFmpeg is loaded - re-initialize if needed
		if (this.loadStatus !== 'loaded') {
			console.log('[FFmpeg] FFmpeg not loaded, re-initializing...');
			await this.initialize();
		}

		// Reset cancellation flag
		this.isCancelled = false;

		const inputName = 'input.mp4';
		const outputName = 'output.mp4';
		let command: string[] = [];

		try {
			// Check if cancelled before starting
			if (this.isCancelled) {
				throw new Error('Operation cancelled');
			}

			// Write input file to FFmpeg's virtual filesystem
			await this.ffmpeg.writeFile(inputName, await fetchFile(file));

			// Check again after file write
			if (this.isCancelled) {
				await this.ffmpeg.deleteFile(inputName);
				throw new Error('Operation cancelled');
			}

			// Build FFmpeg command
			command = [
				'-i',
				inputName,
				'-ss',
				options.startTime.toString(),
				'-t',
				options.duration.toString()
			];

			if (options.compressionEnabled && options.crf !== undefined) {
				// Validate CRF value
				const crfValue = Math.max(18, Math.min(28, options.crf));
				
				// Apply compression with CRF - optimized for memory efficiency
				// -c:v libx264: use H.264 codec
				// -crf: Constant Rate Factor (18-28, lower = higher quality)
				// -preset ultrafast: fastest encoding (lowest memory usage)
				// -tune fastdecode: optimize for faster decoding (lower memory)
				// -threads 1: single thread (less memory overhead)
				// -c:a copy: copy audio without re-encoding
				// -movflags +faststart: optimize for web playback
				// Note: Removed -profile:v and -level restrictions to support high-resolution videos
				// FFmpeg will auto-detect appropriate profile/level based on input
				command.push(
					'-c:v',
					'libx264',
					'-crf',
					crfValue.toString(),
					'-preset',
					'ultrafast',
					'-tune',
					'fastdecode',
					'-threads',
					'1',
					'-c:a',
					'copy',
					'-movflags',
					'+faststart'
				);
			} else {
				// Copy codec (fast, no re-encoding)
				command.push('-c', 'copy');
			}

			// Add -y flag to overwrite output file if it exists
			command.push('-y', outputName);

			console.log('[FFmpeg] Executing command:', command.join(' '));
			
			// Check if cancelled before executing
			if (this.isCancelled) {
				await this.ffmpeg.deleteFile(inputName);
				throw new Error('Operation cancelled');
			}

			// Execute FFmpeg command
			// Note: We can't easily interrupt exec() mid-operation, but the cancellation
			// flag will prevent further operations and cleanup will happen in catch block
			const execPromise = this.ffmpeg.exec(command);
			
			// If cancelled during execution, we'll handle it in the catch block
			await execPromise;

			// Small delay to ensure file is fully written and finalized
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Check if cancelled after execution completes
			if (this.isCancelled) {
				try {
					await this.ffmpeg.deleteFile(inputName);
					await this.ffmpeg.deleteFile(outputName);
				} catch (cleanupError) {
					// Ignore cleanup errors
				}
				throw new Error('Operation cancelled');
			}

			// Read the output file with better error handling
			let data: Uint8Array;
			try {
				data = await this.ffmpeg.readFile(outputName);
			} catch (readError) {
				const readErrorMsg = readError instanceof Error ? readError.message : String(readError);
				const readErrorLower = readErrorMsg.toLowerCase();
				
				// Check for abort/memory errors during file read
				if (
					readErrorLower.includes('abort') ||
					readErrorLower.includes('memory') ||
					readErrorLower.includes('allocation')
				) {
					const trimmedDuration = options.duration;
					const estimatedOutputMB = options.compressionEnabled
						? (file.size * (trimmedDuration / (file.size / (1024 * 1024) / 0.1))) * 0.6 / (1024 * 1024)
						: (file.size * trimmedDuration) / (file.size / (1024 * 1024) / 0.1) / (1024 * 1024);
					
					throw new Error(
						`Output file too large to process (estimated ${estimatedOutputMB.toFixed(1)}MB). ` +
						`The compressed output exceeded browser memory limits. ` +
						`Try: 1) Trim to a shorter segment, 2) Use higher compression (move slider left), or 3) Disable compression.`
					);
				}
				// Re-throw other read errors
				throw readError;
			}

			// Clean up
			await this.ffmpeg.deleteFile(inputName);
			await this.ffmpeg.deleteFile(outputName);

			// Convert to Blob
			return new Blob([data], { type: 'video/mp4' });
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			const errorString = errorMessage.toLowerCase();
			console.error('Failed to trim video:', error);
			console.error('FFmpeg command that failed:', command.join(' '));
			
			// Clean up files on error
			try {
				await this.ffmpeg.deleteFile(inputName);
				await this.ffmpeg.deleteFile(outputName);
			} catch (cleanupError) {
				// Ignore cleanup errors
			}
			
			// Check for memory-related errors and abort errors
			if (
				errorString.includes('memory') ||
				errorString.includes('out of memory') ||
				errorString.includes('cannot allocate memory') ||
				errorString.includes('allocation') ||
				errorString.includes('abort') ||
				errorString.includes('aborted') ||
				errorString.includes('killed')
			) {
				const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
				const trimmedDuration = options.duration;
				
				// Provide more specific error message based on when the error occurred
				if (errorString.includes('abort') || errorString.includes('aborted')) {
					throw new Error(
						`Processing aborted - output file too large (${fileSizeMB}MB input, ~${(trimmedDuration * 10).toFixed(1)}s trimmed). ` +
						`Browser memory limits prevent reading large output files. ` +
						`Try: 1) Trim to a shorter segment (< 5 seconds), 2) Use higher compression (move slider left), or 3) Disable compression.`
					);
				} else {
					throw new Error(
						`Video too large for compression (${fileSizeMB}MB). ` +
						`Try trimming to a shorter segment first, or disable compression for large files. ` +
						`Browser memory limits prevent processing very large videos with compression.`
					);
				}
			}
			
			throw new Error(`Failed to process video: ${errorMessage}`);
		}
	}

	/**
	 * Get current load progress (0 to 1)
	 */
	getLoadProgress(): number {
		return this.loadProgress;
	}

	/**
	 * Check if FFmpeg is loaded and ready
	 */
	isLoaded(): boolean {
		return this.loadStatus === 'loaded';
	}

	/**
	 * Get current load status
	 */
	getLoadStatus(): FFmpegLoadStatus {
		return this.loadStatus;
	}

	/**
	 * Set callback for processing progress
	 */
	onProgress(callback: (progress: FFmpegProgress) => void): void {
		this.onProgressCallback = callback;
	}

	/**
	 * Cancel the current video processing operation
	 * Note: We don't call terminate() as it permanently destroys the FFmpeg instance.
	 * Instead, we rely on the cancellation flag which is checked at key points.
	 */
	cancel(): void {
		this.isCancelled = true;
		console.log('[FFmpeg] Cancel requested - operation will stop at next checkpoint');
	}

	/**
	 * Check if browser supports WebAssembly
	 */
	static isSupported(): boolean {
		try {
			if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
				const module = new WebAssembly.Module(
					Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
				);
				if (module instanceof WebAssembly.Module) {
					return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
				}
			}
		} catch (e) {
			// WebAssembly not supported
		}
		return false;
	}
}

