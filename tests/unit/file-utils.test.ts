import { describe, it, expect } from 'vitest';
import {
	formatFileSize,
	formatFileSizeMB,
	estimateOutputFileSize,
	isFileTooLarge
} from '../../src/lib/utils/file-utils';

describe('file-utils', () => {
	describe('formatFileSize', () => {
		it('should format bytes correctly', () => {
			expect(formatFileSize(0)).toBe('0 Bytes');
			expect(formatFileSize(1024)).toBe('1 KB');
			expect(formatFileSize(1024 * 1024)).toBe('1 MB');
			expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
		});

		it('should handle decimal values', () => {
			const result = formatFileSize(1536); // 1.5 KB
			expect(result).toContain('KB');
		});
	});

	describe('formatFileSizeMB', () => {
		it('should format file size in MB', () => {
			const mb = 1024 * 1024;
			expect(formatFileSizeMB(mb)).toBe('1 MB');
			expect(formatFileSizeMB(mb * 2.5)).toBe('2.5 MB');
		});
	});

	describe('estimateOutputFileSize', () => {
		const originalSize = 100 * 1024 * 1024; // 100 MB
		const originalDuration = 60; // 60 seconds

		it('should estimate size proportionally to duration', () => {
			const trimmedDuration = 30; // 30 seconds (half)
			const estimated = estimateOutputFileSize(
				originalSize,
				originalDuration,
				trimmedDuration,
				false
			);
			expect(estimated).toBeCloseTo(originalSize / 2, 0);
		});

		it('should account for compression', () => {
			const trimmedDuration = 30;
			const withoutCompression = estimateOutputFileSize(
				originalSize,
				originalDuration,
				trimmedDuration,
				false
			);
			const withCompression = estimateOutputFileSize(
				originalSize,
				originalDuration,
				trimmedDuration,
				true,
				23 // CRF 23
			);
			expect(withCompression).toBeLessThan(withoutCompression);
		});

		it('should account for cropping', () => {
			const trimmedDuration = 30;
			const originalWidth = 1920;
			const originalHeight = 1080;
			const cropWidth = 960; // Half width
			const cropHeight = 540; // Half height
			
			const withoutCrop = estimateOutputFileSize(
				originalSize,
				originalDuration,
				trimmedDuration,
				false
			);
			const withCrop = estimateOutputFileSize(
				originalSize,
				originalDuration,
				trimmedDuration,
				false,
				23,
				originalWidth,
				originalHeight,
				cropWidth,
				cropHeight
			);
			
			// Cropped area is 1/4 of original (half width * half height)
			expect(withCrop).toBeCloseTo(withoutCrop / 4, 0);
		});

		it('should account for both cropping and compression', () => {
			const trimmedDuration = 30;
			const originalWidth = 1920;
			const originalHeight = 1080;
			const cropWidth = 960;
			const cropHeight = 540;
			
			const withBoth = estimateOutputFileSize(
				originalSize,
				originalDuration,
				trimmedDuration,
				true,
				23,
				originalWidth,
				originalHeight,
				cropWidth,
				cropHeight
			);
			
			// Should be smaller than original
			expect(withBoth).toBeLessThan(originalSize);
			expect(withBoth).toBeGreaterThan(0);
		});

		it('should return 0 for zero duration', () => {
			const estimated = estimateOutputFileSize(
				originalSize,
				originalDuration,
				0,
				false
			);
			expect(estimated).toBe(0);
		});

		it('should handle edge case: crop larger than original', () => {
			const trimmedDuration = 30;
			const estimated = estimateOutputFileSize(
				originalSize,
				originalDuration,
				trimmedDuration,
				false,
				23,
				1920,
				1080,
				3000, // Larger than original
				2000
			);
			// Should still return a valid estimate (clamped to original)
			expect(estimated).toBeGreaterThan(0);
		});
	});

	describe('isFileTooLarge', () => {
		it('should detect files over the limit', () => {
			// Create a mock file with size property (avoiding large string creation)
			const largeFile = { size: 600 * 1024 * 1024 } as File;
			expect(isFileTooLarge(largeFile, 500)).toBe(true);
		});

		it('should allow files under the limit', () => {
			const smallFile = { size: 100 * 1024 * 1024 } as File;
			expect(isFileTooLarge(smallFile, 500)).toBe(false);
		});

		it('should use custom limit', () => {
			const file = { size: 200 * 1024 * 1024 } as File;
			expect(isFileTooLarge(file, 100)).toBe(true);
			expect(isFileTooLarge(file, 300)).toBe(false);
		});
	});
});

