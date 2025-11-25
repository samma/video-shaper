export interface FFmpegProgress {
	ratio: number; // 0 to 1
	time?: number; // current time in seconds
}

export interface TrimOptions {
	startTime: number; // in seconds
	duration: number; // in seconds
}

export interface FFmpegError {
	message: string;
	code?: string;
}

export type FFmpegLoadStatus = 'unloaded' | 'loading' | 'loaded' | 'error';

