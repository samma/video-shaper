/**
 * Format seconds to MM:SS or HH:MM:SS format
 */
export function formatTime(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) {
		return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
	}
	return `${mins}:${String(secs).padStart(2, '0')}`;
}

