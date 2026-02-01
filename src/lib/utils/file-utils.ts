/**
 * Format file size in bytes to human-readable string
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format file size in MB (for display purposes)
 */
export function formatFileSizeMB(bytes: number): string {
	const mb = bytes / (1024 * 1024);
	return Math.round(mb * 10) / 10 + ' MB';
}

/**
 * Estimate output file size after trimming and compression
 * @param originalSizeBytes Original file size in bytes
 * @param originalDuration Original video duration in seconds
 * @param trimmedDuration Trimmed video duration in seconds
 * @param compressionEnabled Whether compression is enabled
 * @param crf Constant Rate Factor (18-28)
 * @param originalWidth Original video width in pixels
 * @param originalHeight Original video height in pixels
 * @param cropWidth Cropped video width in pixels
 * @param cropHeight Cropped video height in pixels
 * @param outputFormat Output format (e.g., 'mp4', 'mov', 'avi', 'mkv', 'flv')
 * @param scaleWidth Scaled output width in pixels
 * @param scaleHeight Scaled output height in pixels
 * @param removeAudio Whether audio is being removed
 * @returns Estimated file size in bytes
 */
export function estimateOutputFileSize(
	originalSizeBytes: number,
	originalDuration: number,
	trimmedDuration: number,
	compressionEnabled: boolean,
	crf: number = 23,
	originalWidth?: number,
	originalHeight?: number,
	cropWidth?: number,
	cropHeight?: number,
	outputFormat?: string,
	scaleWidth?: number,
	scaleHeight?: number,
	removeAudio?: boolean
): number {
	if (originalDuration === 0) return 0;

	// Base estimate: proportional to duration
	let estimatedSize = (originalSizeBytes * trimmedDuration) / originalDuration;

	// Determine the effective dimensions (after crop, before scale)
	let effectiveWidth = originalWidth || 0;
	let effectiveHeight = originalHeight || 0;

	// Account for cropping (reduced pixel count = smaller file)
	if (
		originalWidth &&
		originalHeight &&
		cropWidth &&
		cropHeight &&
		cropWidth > 0 &&
		cropHeight > 0 &&
		originalWidth > 0 &&
		originalHeight > 0
	) {
		effectiveWidth = cropWidth;
		effectiveHeight = cropHeight;
		const originalArea = originalWidth * originalHeight;
		const croppedArea = cropWidth * cropHeight;
		const areaRatio = croppedArea / originalArea;
		estimatedSize = estimatedSize * areaRatio;
	}

	// Account for resolution scaling (reduced pixel count = smaller file)
	if (
		scaleWidth &&
		scaleHeight &&
		scaleWidth > 0 &&
		scaleHeight > 0 &&
		effectiveWidth > 0 &&
		effectiveHeight > 0
	) {
		const scaledArea = scaleWidth * scaleHeight;
		const effectiveArea = effectiveWidth * effectiveHeight;
		const scaleRatio = scaledArea / effectiveArea;
		estimatedSize = estimatedSize * scaleRatio;
	}

	if (compressionEnabled) {
		// CRF compression ratio estimation
		// Lower CRF = higher quality = larger file
		// Higher CRF = lower quality = smaller file
		// Rough approximation: CRF 18 ≈ 100%, CRF 23 ≈ 60%, CRF 28 ≈ 30%
		const compressionRatio = Math.max(0.2, Math.min(1.0, 1.0 - (crf - 18) * 0.07));
		estimatedSize = estimatedSize * compressionRatio;
	}

	// Account for format differences
	// Some formats are more or less efficient than others
	if (outputFormat) {
		const formatMultipliers: Record<string, number> = {
			'avi': 1.1,   // AVI may be slightly larger
			'mov': 1.05,  // MOV may be slightly larger
			'mp4': 1.0,   // MP4 is the baseline
			'mkv': 1.0,   // MKV similar to MP4
			'flv': 1.0    // FLV similar to MP4
		};
		const multiplier = formatMultipliers[outputFormat.toLowerCase()] || 1.0;
		estimatedSize = estimatedSize * multiplier;
	}

	// Account for audio removal (audio typically ~5-10% of file size)
	if (removeAudio) {
		estimatedSize = estimatedSize * 0.92; // Reduce by ~8% for audio removal
	}

	return Math.max(0, estimatedSize);
}

/**
 * Check if file size exceeds recommended limit
 */
export function isFileTooLarge(file: File, maxSizeMB: number = 500): boolean {
	const fileSizeMB = file.size / (1024 * 1024);
	return fileSizeMB > maxSizeMB;
}

