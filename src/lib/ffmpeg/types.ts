export interface FFmpegProgress {
	ratio: number; // 0 to 1
	time?: number; // current time in seconds
}

export interface TrimOptions {
	startTime: number; // in seconds
	duration: number; // in seconds
	compressionEnabled?: boolean; // whether to apply compression
	crf?: number; // Constant Rate Factor (18-28, lower = higher quality)
}

export interface FFmpegError {
	message: string;
	code?: string;
}

export type FFmpegLoadStatus = 'unloaded' | 'loading' | 'loaded' | 'error';

