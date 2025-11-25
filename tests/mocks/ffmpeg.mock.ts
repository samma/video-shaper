import { vi } from 'vitest';

// Mock FFmpeg class for testing
export class MockFFmpeg {
	private callbacks: Map<string, Function> = new Map();

	on(event: string, callback: Function) {
		this.callbacks.set(event, callback);
	}

	async load() {
		// Simulate loading
		return Promise.resolve();
	}

	async writeFile() {
		return Promise.resolve();
	}

	async exec() {
		// Trigger progress callback if registered
		const progressCb = this.callbacks.get('progress');
		if (progressCb) {
			progressCb({ progress: 0.5, time: 5 });
		}
		return Promise.resolve();
	}

	async readFile() {
		return new Uint8Array([1, 2, 3, 4]);
	}

	async deleteFile() {
		return Promise.resolve();
	}
}

// Mock the @ffmpeg/ffmpeg module
vi.mock('@ffmpeg/ffmpeg', () => ({
	FFmpeg: MockFFmpeg
}));

// Mock @ffmpeg/util
vi.mock('@ffmpeg/util', () => ({
	toBlobURL: vi.fn((url: string) => Promise.resolve(url)),
	fetchFile: vi.fn((file: File) => Promise.resolve(new Uint8Array([1, 2, 3])))
}));

