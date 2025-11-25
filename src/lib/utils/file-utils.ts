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
 * Check if file size exceeds recommended limit
 */
export function isFileTooLarge(file: File, maxSizeMB: number = 500): boolean {
	const fileSizeMB = file.size / (1024 * 1024);
	return fileSizeMB > maxSizeMB;
}

