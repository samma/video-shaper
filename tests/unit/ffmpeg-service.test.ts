import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock FFmpeg before importing the service
vi.mock('@ffmpeg/ffmpeg', () => ({
	FFmpeg: class MockFFmpeg {
		on() {}
		async load() {}
		async writeFile() {}
		async exec() {}
		async readFile() {
			return new Uint8Array([1, 2, 3, 4]);
		}
		async deleteFile() {}
	}
}));

vi.mock('@ffmpeg/util', () => ({
	toBlobURL: vi.fn((url: string) => Promise.resolve(url)),
	fetchFile: vi.fn(() => Promise.resolve(new Uint8Array([1, 2, 3])))
}));

import { FFmpegService } from '../../src/lib/ffmpeg/FFmpegService';

describe('FFmpegService Module Loading', () => {
	it('should import FFmpegService class', () => {
		expect(FFmpegService).toBeDefined();
		expect(typeof FFmpegService).toBe('function');
	});

	it('should be able to instantiate FFmpegService', () => {
		const service = new FFmpegService();
		expect(service).toBeInstanceOf(FFmpegService);
	});

	it('should have isSupported static method', () => {
		expect(typeof FFmpegService.isSupported).toBe('function');
	});

	it('should check WebAssembly support', () => {
		const isSupported = FFmpegService.isSupported();
		// In jsdom environment, WebAssembly might not be available
		expect(typeof isSupported).toBe('boolean');
	});
});

describe('FFmpegService Instance Methods', () => {
	let service: FFmpegService;

	beforeEach(() => {
		service = new FFmpegService();
	});

	it('should start with unloaded status', () => {
		expect(service.isLoaded()).toBe(false);
		expect(service.getLoadStatus()).toBe('unloaded');
	});

	it('should have zero load progress initially', () => {
		expect(service.getLoadProgress()).toBe(0);
	});

	it('should have initialize method', () => {
		expect(typeof service.initialize).toBe('function');
	});

	it('should have trimVideo method', () => {
		expect(typeof service.trimVideo).toBe('function');
	});

	it('should have onProgress method', () => {
		expect(typeof service.onProgress).toBe('function');
	});

	it('should auto-initialize when trimVideo is called without initialization', async () => {
		const mockFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
		// trimVideo should auto-initialize and succeed (with mocked FFmpeg)
		const result = await service.trimVideo(mockFile, { startTime: 0, duration: 10 });
		expect(result).toBeInstanceOf(Blob);
		expect(service.isLoaded()).toBe(true);
	});
});

