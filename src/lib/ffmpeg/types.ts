export interface FFmpegProgress {
	ratio: number; // 0 to 1
	time?: number; // current time in seconds
}

export interface CropOptions {
	x: number; // top-left x coordinate in pixels
	y: number; // top-left y coordinate in pixels
	width: number; // crop width in pixels
	height: number; // crop height in pixels
	aspectRatioLocked?: boolean; // whether aspect ratio is locked
	aspectRatio?: number; // aspect ratio (width/height) when locked
}

export interface TrimOptions {
	startTime: number; // in seconds
	duration: number; // in seconds
	compressionEnabled?: boolean; // whether to apply compression
	crf?: number; // Constant Rate Factor (18-28, lower = higher quality)
	crop?: CropOptions; // optional crop settings
}

export interface FFmpegError {
	message: string;
	code?: string;
}

export type FFmpegLoadStatus = 'unloaded' | 'loading' | 'loaded' | 'error';

