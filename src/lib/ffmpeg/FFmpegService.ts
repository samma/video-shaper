import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import type { FFmpegProgress, TrimOptions, FFmpegLoadStatus, CropOptions } from './types';

// Enable debug logging only in development or when explicitly enabled
const DEBUG_ENABLED = typeof window !== 'undefined' && 
	(window.location.search.includes('debug=true') || import.meta.env.DEV);

function debugLog(...args: any[]) {
	if (DEBUG_ENABLED) {
		console.log('[FFmpeg] [DEBUG]', ...args);
	}
}

function debugError(...args: any[]) {
	if (DEBUG_ENABLED) {
		console.error('[FFmpeg] [DEBUG]', ...args);
	}
}

/**
 * Parse FFmpeg log message to extract a simplified status message
 */
function parseStatusFromLog(message: string): string | null {
	const msg = message.toLowerCase();
	
	// Detect frame encoding progress
	if (msg.includes('frame=') || msg.includes('fps=')) {
		return 'Encoding video...';
	}
	
	// Detect compression/encoding start
	if (msg.includes('encoding') || msg.includes('stream #0')) {
		return 'Compressing video...';
	}
	
	// Detect muxing/finalization
	if (msg.includes('muxing') || msg.includes('moving the moov atom') || msg.includes('faststart')) {
		return 'Finalizing...';
	}
	
	// Detect file operations
	if (msg.includes('input') || msg.includes('output')) {
		return 'Processing...';
	}
	
	return null;
}

export class FFmpegService {
	private ffmpeg: FFmpeg;
	private loadStatus: FFmpegLoadStatus = 'unloaded';
	private loadProgress: number = 0;
	private onProgressCallback?: (progress: FFmpegProgress) => void;
	private onStatusCallback?: (status: string) => void;
	private isCancelled: boolean = false;
	private currentStatus: string = '';

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

			// Set up progress logging with enhanced error detection
			let secondPassStarted = false;
			this.ffmpeg.on('log', ({ message }) => {
				console.log('[FFmpeg]', message);
				
				// Parse status from log message
				const parsedStatus = parseStatusFromLog(message);
				if (parsedStatus && this.onStatusCallback) {
					this.currentStatus = parsedStatus;
					this.onStatusCallback(parsedStatus);
				}
				
				// Detect second pass start
				if (message.includes('Starting second pass') || message.includes('moving the moov atom')) {
					secondPassStarted = true;
					debugLog('Second pass detected - monitoring for issues...');
				}
				
				// Detect abort messages
				if (message.includes('Aborted') || message.includes('abort')) {
					debugError('Abort detected in log message:', message);
					if (secondPassStarted) {
						debugError('Abort occurred during second pass (faststart moov atom relocation)');
					}
				}
			});

			this.ffmpeg.on('progress', ({ progress, time }) => {
				if (this.onProgressCallback) {
					this.onProgressCallback({ 
						ratio: progress, 
						time,
						status: this.currentStatus || undefined
					});
				}
			});

			// Try to load from local files first (self-hosted), fallback to CDN
			// This ensures the app works even if unpkg.com is unavailable
			const localBaseURL = '/ffmpeg-core';
			const cdnBaseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
			
			let coreURL: string;
			let wasmURL: string;
			
			// Check if local files exist by attempting to fetch them
			try {
				const localCoreResponse = await fetch(`${localBaseURL}/ffmpeg-core.js`, { method: 'HEAD' });
				if (localCoreResponse.ok) {
					// Local files exist, use them
					coreURL = await toBlobURL(`${localBaseURL}/ffmpeg-core.js`, 'text/javascript');
					wasmURL = await toBlobURL(`${localBaseURL}/ffmpeg-core.wasm`, 'application/wasm');
					console.log('[FFmpeg] Loading from local files (self-hosted)');
				} else {
					throw new Error('Local files not found');
				}
			} catch (error) {
				// Local files not available, fallback to CDN
				console.warn('[FFmpeg] Local files not found, falling back to CDN');
				coreURL = await toBlobURL(`${cdnBaseURL}/ffmpeg-core.js`, 'text/javascript');
				wasmURL = await toBlobURL(`${cdnBaseURL}/ffmpeg-core.wasm`, 'application/wasm');
			}

			await this.ffmpeg.load({
				coreURL,
				wasmURL
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
		this.currentStatus = '';

		const inputName = 'input.mp4';
		const outputName = 'output.mp4';
		let command: string[] = [];

		try {
			// Check if cancelled before starting
			if (this.isCancelled) {
				throw new Error('Operation cancelled');
			}

			// Clean up any existing files from previous operations
			// This prevents FS errors from leftover files
			try {
				await this.ffmpeg.deleteFile(inputName);
			} catch (e) {
				// File doesn't exist, which is fine
				debugLog('Input file does not exist (expected for first run)');
			}
			try {
				await this.ffmpeg.deleteFile(outputName);
			} catch (e) {
				// File doesn't exist, which is fine
				debugLog('Output file does not exist (expected for first run)');
			}

			// Notify status: loading file
			if (this.onStatusCallback) {
				this.currentStatus = 'Loading file...';
				this.onStatusCallback(this.currentStatus);
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

			// Add crop filter if crop options are provided
			let videoFilters: string[] = [];
			if (options.crop) {
				const crop = options.crop;
				// Validate crop coordinates (ensure they're within reasonable bounds)
				const cropX = Math.max(0, Math.floor(crop.x));
				const cropY = Math.max(0, Math.floor(crop.y));
				const cropWidth = Math.max(1, Math.floor(crop.width));
				const cropHeight = Math.max(1, Math.floor(crop.height));
				
				// Validate crop dimensions are positive
				if (cropWidth <= 0 || cropHeight <= 0) {
					throw new Error(`Invalid crop dimensions: width=${cropWidth}, height=${cropHeight}`);
				}
				
				// FFmpeg crop filter: crop=width:height:x:y
				videoFilters.push(`crop=${cropWidth}:${cropHeight}:${cropX}:${cropY}`);
			}

			// Apply video filters if any
			if (videoFilters.length > 0) {
				command.push('-vf', videoFilters.join(','));
			}

			if (options.compressionEnabled && options.crf !== undefined) {
				// Validate CRF value
				const crfValue = Math.max(18, Math.min(28, options.crf));
				
				// Decide if we can use faststart
				// faststart requires a second pass that reads the entire file into memory
				// For large files or long segments, this can cause memory issues
				const inputFileMB = file.size / (1024 * 1024);
				const trimmedDuration = options.duration;
				// Skip faststart if: input > 50MB OR trimmed segment > 10 seconds
				// This avoids the second-pass memory issue for larger compressions
				const useFaststart = inputFileMB < 50 && trimmedDuration <= 10;
				
				// Apply compression with CRF - optimized for memory efficiency
				// -c:v libx264: use H.264 codec
				// -crf: Constant Rate Factor (18-28, lower = higher quality)
				// -preset ultrafast: fastest encoding (lowest memory usage)
				// -tune fastdecode: optimize for faster decoding (lower memory)
				// -threads 1: single thread (less memory overhead)
				// -c:a copy: copy audio without re-encoding
				// -movflags +faststart: optimize for web playback (only for smaller files)
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
					'copy'
				);
				
				// Only add faststart for smaller files to avoid second-pass memory issues
				if (useFaststart) {
					command.push('-movflags', '+faststart');
				} else {
					debugLog(`Skipping faststart to avoid memory issues (input: ${inputFileMB.toFixed(1)}MB, duration: ${trimmedDuration.toFixed(1)}s)`);
				}
			} else {
				// Copy codec (fast, no re-encoding)
				// BUT: if crop is enabled, we must re-encode, so use libx264 instead
				if (options.crop) {
					// Crop requires re-encoding, so use a fast preset
					command.push(
						'-c:v',
						'libx264',
						'-preset',
						'ultrafast',
						'-crf',
						'23', // Default quality when compression not explicitly enabled
						'-c:a',
						'copy'
					);
				} else {
					// No crop, can use codec copy (fastest)
					command.push('-c', 'copy');
				}
			}

			// Add -y flag to overwrite output file if it exists
			command.push('-y', outputName);

			console.log('[FFmpeg] Executing command:', command.join(' '));
			debugLog('Input file size:', (file.size / (1024 * 1024)).toFixed(2), 'MB');
			debugLog('Trim duration:', options.duration.toFixed(2), 'seconds');
			debugLog('Compression enabled:', options.compressionEnabled);
			if (options.compressionEnabled) {
				debugLog('CRF value:', options.crf);
			}
			if (options.crop) {
				debugLog('Crop:', `x=${options.crop.x}, y=${options.crop.y}, w=${options.crop.width}, h=${options.crop.height}`);
			}
			
			// Log memory info if available
			if (DEBUG_ENABLED && 'memory' in performance && (performance as any).memory) {
				const memInfo = (performance as any).memory;
				debugLog('Browser memory - Used:', (memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2), 'MB, Total:', (memInfo.totalJSHeapSize / 1024 / 1024).toFixed(2), 'MB, Limit:', (memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2), 'MB');
			}
			
			// Check if cancelled before executing
			if (this.isCancelled) {
				await this.ffmpeg.deleteFile(inputName);
				throw new Error('Operation cancelled');
			}

			// Execute FFmpeg command
			// Note: We can't easily interrupt exec() mid-operation, but the cancellation
			// flag will prevent further operations and cleanup will happen in catch block
			const execStartTime = Date.now();
			debugLog('Starting exec() at', new Date().toISOString());
			
			const execPromise = this.ffmpeg.exec(command);
			
			// If cancelled during execution, we'll handle it in the catch block
			try {
				await execPromise;
				const execDuration = Date.now() - execStartTime;
				debugLog('exec() completed successfully after', (execDuration / 1000).toFixed(2), 'seconds');
			} catch (execError) {
				const execDuration = Date.now() - execStartTime;
				debugError('exec() failed after', (execDuration / 1000).toFixed(2), 'seconds');
				debugError('exec() error type:', typeof execError);
				debugError('exec() error constructor:', execError?.constructor?.name);
				debugError('exec() error:', execError);
				if (execError instanceof Error) {
					debugError('exec() error message:', execError.message);
					debugError('exec() error stack:', execError.stack);
				}
				// Re-throw to be caught by outer catch
				throw execError;
			}

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
				debugLog('Attempting to read output file:', outputName);
				const readStartTime = Date.now();
				const fileData = await this.ffmpeg.readFile(outputName);
				const readDuration = Date.now() - readStartTime;
				
				// Handle both Uint8Array and string (FileData can be either)
				if (fileData instanceof Uint8Array) {
					data = fileData;
				} else if (typeof fileData === 'string') {
					// Convert base64 string to Uint8Array if needed
					const binaryString = atob(fileData);
					const bytes = new Uint8Array(binaryString.length);
					for (let i = 0; i < binaryString.length; i++) {
						bytes[i] = binaryString.charCodeAt(i);
					}
					data = bytes;
				} else {
					throw new Error('Unexpected file data type from FFmpeg readFile');
				}
				
				debugLog('Successfully read output file, size:', (data.length / 1024 / 1024).toFixed(2), 'MB, took', (readDuration / 1000).toFixed(2), 'seconds');
			} catch (readError) {
				debugError('readFile() error type:', typeof readError);
				debugError('readFile() error constructor:', readError?.constructor?.name);
				debugError('readFile() error:', readError);
				if (readError instanceof Error) {
					debugError('readFile() error message:', readError.message);
					debugError('readFile() error stack:', readError.stack);
					debugError('readFile() error name:', readError.name);
				}
				// Log all properties of the error object
				if (DEBUG_ENABLED && readError && typeof readError === 'object') {
					debugError('readFile() error properties:', Object.keys(readError));
					for (const key in readError) {
						debugError(`readFile() error.${key}:`, (readError as any)[key]);
					}
				}
				
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

			// Convert to Blob (data is already Uint8Array at this point)
			// Create a new Uint8Array to ensure compatibility with Blob constructor
			// This works around FFmpeg's ArrayBufferLike type incompatibility
			const blobData = new Uint8Array(data);
			return new Blob([blobData], { type: 'video/mp4' });
		} catch (error) {
			// Enhanced error logging (only in debug mode)
			if (DEBUG_ENABLED) {
				debugError('========== ERROR DETAILS ==========');
				debugError('Error type:', typeof error);
				debugError('Error constructor:', error?.constructor?.name);
				debugError('Error value:', error);
				
				if (error instanceof Error) {
					debugError('Error name:', error.name);
					debugError('Error message:', error.message);
					debugError('Error stack:', error.stack);
				}
				
				// Log all properties of the error object
				if (error && typeof error === 'object') {
					debugError('Error object keys:', Object.keys(error));
					for (const key in error) {
						try {
							debugError(`error.${key}:`, (error as any)[key]);
						} catch (e) {
							debugError(`error.${key}: [unable to log]`);
						}
					}
				}
				
				// Log memory info if available
				if ('memory' in performance && (performance as any).memory) {
					const memInfo = (performance as any).memory;
					debugError('Browser memory at error - Used:', (memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2), 'MB, Total:', (memInfo.totalJSHeapSize / 1024 / 1024).toFixed(2), 'MB, Limit:', (memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2), 'MB');
				}
				
				debugError('====================================');
			}
			
			const errorMessage = error instanceof Error ? error.message : String(error);
			const errorString = errorMessage.toLowerCase();
			console.error('Failed to trim video:', error);
			console.error('FFmpeg command that failed:', command.join(' '));
			
			// Clean up files on error
			try {
				await this.ffmpeg.deleteFile(inputName);
				await this.ffmpeg.deleteFile(outputName);
			} catch (cleanupError) {
				debugError('Cleanup error:', cleanupError);
				// Ignore cleanup errors
			}
			
			// Check for FS/filesystem errors
			if (
				errorString.includes('fs error') ||
				errorString.includes('errnoerror') ||
				errorString.includes('filesystem') ||
				errorString.includes('enoent') ||
				errorString.includes('eexist') ||
				errorString.includes('eacces')
			) {
				const cropInfo = options.crop 
					? ` (crop: ${options.crop.width}x${options.crop.height} at ${options.crop.x},${options.crop.y})`
					: '';
				throw new Error(
					`File system error during processing${cropInfo}. ` +
					`This may occur if files from a previous operation weren't cleaned up properly. ` +
					`Please try again, or refresh the page if the issue persists.`
				);
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
	 * Set callback for status message updates
	 */
	onStatus(callback: (status: string) => void): void {
		this.onStatusCallback = callback;
	}

	/**
	 * Cancel the current video processing operation
	 * Uses terminate() to immediately stop FFmpeg processing, then reinitializes
	 * the FFmpeg instance so it can be used again.
	 */
	async cancel(): Promise<void> {
		this.isCancelled = true;
		console.log('[FFmpeg] Cancel requested - terminating FFmpeg process...');
		
		try {
			// Terminate the FFmpeg process immediately
			await this.ffmpeg.terminate();
			console.log('[FFmpeg] FFmpeg process terminated');
			
			// Reinitialize FFmpeg so it can be used again
			this.loadStatus = 'unloaded';
			await this.initialize();
			console.log('[FFmpeg] FFmpeg reinitialized and ready for next operation');
		} catch (error) {
			console.error('[FFmpeg] Error during cancel:', error);
			// Even if reinitialize fails, mark as unloaded so next operation will retry
			this.loadStatus = 'unloaded';
		}
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

