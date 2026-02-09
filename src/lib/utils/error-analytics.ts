/**
 * Privacy-safe error analytics for GoatCounter.
 * 
 * Design principles:
 * - NEVER include raw error messages (could theoretically contain filenames or paths)
 * - NEVER include exact file sizes or durations (could identify specific files)
 * - NEVER include full user agent strings (fingerprinting risk)
 * - ONLY include bucketed/categorized technical metadata
 * - All data points are coarse enough that they describe a CLASS of problem, not a specific user
 */

/** Error categories - exhaustive classification of known failure modes */
type ErrorCategory = 'memory' | 'filesystem' | 'abort' | 'load' | 'format' | 'cancelled' | 'unknown';

/** Classify an error message into a safe category */
function classifyError(errorMessage: string): ErrorCategory {
	const msg = errorMessage.toLowerCase();

	if (msg.includes('cancel')) return 'cancelled';
	if (msg.includes('out of memory') || msg.includes('cannot allocate') || msg.includes('allocation failed')) return 'memory';
	if (msg.includes('abort') || msg.includes('aborted') || msg.includes('killed')) return 'abort';
	if (msg.includes('memory') || msg.includes('too large')) return 'memory';
	if (msg.includes('fs error') || msg.includes('filesystem') || msg.includes('enoent') || msg.includes('eexist') || msg.includes('eacces') || msg.includes('errnoerror')) return 'filesystem';
	if (msg.includes('failed to load') || msg.includes('failed to initialize') || msg.includes('not available') || msg.includes('not supported')) return 'load';
	if (msg.includes('unexpected file data') || msg.includes('invalid crop') || msg.includes('format')) return 'format';

	return 'unknown';
}

/** Bucket a file size in MB into a coarse, non-identifying range */
function bucketFileSize(bytes: number): string {
	const mb = bytes / (1024 * 1024);
	if (mb < 5) return '<5MB';
	if (mb < 25) return '5-25MB';
	if (mb < 50) return '25-50MB';
	if (mb < 100) return '50-100MB';
	if (mb < 250) return '100-250MB';
	if (mb < 500) return '250-500MB';
	return '>500MB';
}

/** Bucket a duration in seconds into a coarse range */
function bucketDuration(seconds: number): string {
	if (seconds < 15) return '<15s';
	if (seconds < 60) return '15-60s';
	if (seconds < 180) return '1-3min';
	if (seconds < 600) return '3-10min';
	if (seconds < 1800) return '10-30min';
	return '>30min';
}

/** Extract a minimal, safe browser family name */
function getBrowserFamily(): string {
	if (typeof navigator === 'undefined') return 'unknown';
	const ua = navigator.userAgent;
	if (ua.includes('Firefox')) return 'Firefox';
	if (ua.includes('Edg/')) return 'Edge';
	if (ua.includes('Chrome')) return 'Chrome';
	if (ua.includes('Safari')) return 'Safari';
	return 'Other';
}

/** Extract a minimal, safe OS family name */
function getOSFamily(): string {
	if (typeof navigator === 'undefined') return 'unknown';
	const ua = navigator.userAgent;
	if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) return 'iOS';
	if (ua.includes('Android')) return 'Android';
	if (ua.includes('Windows')) return 'Windows';
	if (ua.includes('Mac OS')) return 'macOS';
	if (ua.includes('Linux')) return 'Linux';
	if (ua.includes('CrOS')) return 'ChromeOS';
	return 'Other';
}

/** Context about what the user was trying to do (no personal data) */
export interface ProcessingContext {
	/** Which features were enabled */
	features: {
		trim: boolean;
		compress: boolean;
		crop: boolean;
		formatConversion: boolean;
		resolutionScaling: boolean;
		audioAdjustment: boolean;
	};
	/** Input file format (mp4, mov, etc.) */
	inputFormat: string;
	/** Output file format (mp4, mov, etc.) */
	outputFormat: string;
	/** Input file size in bytes */
	fileSizeBytes: number;
	/** Video duration in seconds */
	durationSeconds: number;
}

/**
 * Build a privacy-safe GoatCounter event path for an error.
 * 
 * Example output:
 *   "video-process-error/memory/compress+trim/mp4-to-mp4/50-100MB/1-3min/Chrome/Windows"
 * 
 * Every component is either:
 * - A fixed category from a known set (no free-form text)
 * - A bucketed numeric range (not exact values)
 * - A coarse browser/OS family (not a full user agent)
 */
export function buildErrorEventPath(
	error: Error | string,
	context: ProcessingContext
): string {
	const errorMessage = typeof error === 'string' ? error : error.message;

	// 1. Error category (from fixed set)
	const category = classifyError(errorMessage);

	// 2. Active features (from fixed set of known feature names)
	const activeFeatures: string[] = [];
	if (context.features.trim) activeFeatures.push('trim');
	if (context.features.compress) activeFeatures.push('compress');
	if (context.features.crop) activeFeatures.push('crop');
	if (context.features.formatConversion) activeFeatures.push('convert');
	if (context.features.resolutionScaling) activeFeatures.push('scale');
	if (context.features.audioAdjustment) activeFeatures.push('audio');
	const featuresStr = activeFeatures.length > 0 ? activeFeatures.join('+') : 'none';

	// 3. Format info (from fixed set of known formats)
	const knownFormats = ['mp4', 'mov', 'avi', 'mkv', 'flv'];
	const safeInputFormat = knownFormats.includes(context.inputFormat) ? context.inputFormat : 'other';
	const safeOutputFormat = knownFormats.includes(context.outputFormat) ? context.outputFormat : 'other';
	const formatStr = safeInputFormat === safeOutputFormat
		? safeInputFormat
		: `${safeInputFormat}-to-${safeOutputFormat}`;

	// 4. Bucketed file size
	const sizeBucket = bucketFileSize(context.fileSizeBytes);

	// 5. Bucketed duration
	const durationBucket = bucketDuration(context.durationSeconds);

	// 6. Browser and OS family
	const browser = getBrowserFamily();
	const os = getOSFamily();

	return `video-process-error/${category}/${featuresStr}/${formatStr}/${sizeBucket}/${durationBucket}/${browser}/${os}`;
}

/**
 * Build a privacy-safe GoatCounter event path for a successful processing.
 * Same bucketing and privacy rules apply.
 */
export function buildSuccessEventPath(context: ProcessingContext): string {
	const activeFeatures: string[] = [];
	if (context.features.trim) activeFeatures.push('trim');
	if (context.features.compress) activeFeatures.push('compress');
	if (context.features.crop) activeFeatures.push('crop');
	if (context.features.formatConversion) activeFeatures.push('convert');
	if (context.features.resolutionScaling) activeFeatures.push('scale');
	if (context.features.audioAdjustment) activeFeatures.push('audio');
	const featuresStr = activeFeatures.length > 0 ? activeFeatures.join('+') : 'none';

	const knownFormats = ['mp4', 'mov', 'avi', 'mkv', 'flv'];
	const safeInputFormat = knownFormats.includes(context.inputFormat) ? context.inputFormat : 'other';
	const safeOutputFormat = knownFormats.includes(context.outputFormat) ? context.outputFormat : 'other';
	const formatStr = safeInputFormat === safeOutputFormat
		? safeInputFormat
		: `${safeInputFormat}-to-${safeOutputFormat}`;

	const sizeBucket = bucketFileSize(context.fileSizeBytes);
	const durationBucket = bucketDuration(context.durationSeconds);

	return `video-process-success/${featuresStr}/${formatStr}/${sizeBucket}/${durationBucket}`;
}

/**
 * Send an analytics event to GoatCounter (if available).
 * This is a fire-and-forget operation that never throws.
 */
export function trackEvent(path: string): void {
	try {
		if (typeof window !== 'undefined' && (window as any).goatcounter?.count) {
			(window as any).goatcounter.count({
				path,
				event: true
			});
		}
	} catch {
		// Analytics should never break the app
	}
}
