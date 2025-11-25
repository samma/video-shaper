import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import type { FFmpegProgress, TrimOptions, FFmpegLoadStatus } from './types';

export class FFmpegService {
	private ffmpeg: FFmpeg;
	private loadStatus: FFmpegLoadStatus = 'unloaded';
	private loadProgress: number = 0;
	private onProgressCallback?: (progress: FFmpegProgress) => void;

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
		if (this.loadStatus !== 'loaded') {
			throw new Error('FFmpeg is not loaded. Call initialize() first.');
		}

		try {
			// Write input file to FFmpeg's virtual filesystem
			const inputName = 'input.mp4';
			const outputName = 'output.mp4';

			await this.ffmpeg.writeFile(inputName, await fetchFile(file));

			// Run FFmpeg command to trim video
			// -ss: start time, -t: duration, -c copy: copy codec (fast, no re-encoding)
			await this.ffmpeg.exec([
				'-i',
				inputName,
				'-ss',
				options.startTime.toString(),
				'-t',
				options.duration.toString(),
				'-c',
				'copy',
				outputName
			]);

			// Read the output file
			const data = await this.ffmpeg.readFile(outputName);

			// Clean up
			await this.ffmpeg.deleteFile(inputName);
			await this.ffmpeg.deleteFile(outputName);

			// Convert to Blob
			return new Blob([data], { type: 'video/mp4' });
		} catch (error) {
			console.error('Failed to trim video:', error);
			throw new Error(`Failed to trim video: ${error}`);
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

