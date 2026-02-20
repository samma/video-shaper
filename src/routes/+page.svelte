<script lang="ts">
	import VideoEditor from '$lib/components/VideoEditor.svelte';

	// Accordion state for FAQ and Disclaimer (shown below editor when no file selected)
	let limitationsExpanded: boolean = false;
	let disclaimerExpanded: boolean = false;
</script>

<svelte:head>
	<title>Free Video Shaper - No Upload Required | Client-Side Editor</title>
	<meta name="description" content="Free browser video editor: trim, crop, compress, convert formats, scale resolution, adjust audio. No uploads - 100% private." />
	<meta name="keywords" content="free video editor, online video editor, trim video, crop video, compress video, convert video format, resize video, scale video resolution, mute video, remove audio, adjust volume, video trimmer, video cropper, video converter, browser video editor, client-side video editor, no upload video editor, private video editor" />
	
	<!-- Open Graph -->
	<meta property="og:title" content="Free Video Shaper - No Upload Required | Client-Side Editor" />
	<meta property="og:description" content="Free browser video editor: trim, crop, compress, convert formats, scale resolution, adjust audio. Videos never leave your device - 100% private." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://video.shaper.samma.no/" />
	<meta property="og:image" content="https://video.shaper.samma.no/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Free Video Shaper - Browser-based video editor interface" />
	<meta property="og:site_name" content="Video Shaper" />
	<meta property="og:locale" content="en_US" />
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Free Video Shaper - No Upload Required" />
	<meta name="twitter:description" content="Free browser video editor: trim, crop, compress, convert formats, scale resolution, adjust audio. Videos never leave your device - 100% private." />
	<meta name="twitter:image" content="https://video.shaper.samma.no/og-image.png" />
	
	<!-- Additional SEO -->
	<meta name="robots" content="index, follow" />
	<meta name="author" content="Video Shaper" />
	<link rel="canonical" href="https://video.shaper.samma.no/" />
	
	<!-- Structured Data -->
	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "WebApplication",
		"name": "Video Shaper",
		"description": "Free browser video editor: trim, crop, compress, convert formats, scale resolution, adjust audio. Videos never leave your device - 100% client-side processing.",
		"url": "https://video.shaper.samma.no",
		"applicationCategory": "MultimediaApplication",
		"operatingSystem": "Web Browser",
		"offers": {
			"@type": "Offer",
			"price": "0"
		},
		"isAccessibleForFree": true,
		"browserRequirements": "Requires a modern browser with WebAssembly support",
		"featureList": [
			"Trim Videos",
			"Crop Videos",
			"Compress Videos",
			"Convert Video Formats",
			"Scale Video Resolution",
			"Adjust Audio Volume",
			"100% Client-Side Processing",
			"No Uploads Required",
			"Privacy-First"
		]
	}
	</script>`}
</svelte:head>

<div class="min-h-screen bg-gray-900 p-3 sm:p-4">
	<main id="main-content" class="max-w-4xl mx-auto py-4 sm:py-8">
		<div class="text-center mb-6 sm:mb-8">
			<h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
				Free video editor in your browser — no uploads, 100% private
			</h1>
			<p class="text-teal-300 text-sm sm:text-base md:text-lg font-semibold mb-4 tracking-wide">
				Trim, crop, compress, and convert video on your device. Great for WhatsApp/Discord/email size limits, aspect ratios, and format conversions.
			</p>
		</div>

		<VideoEditor 
			showInfoCard={true}
			infoCardContent="full"
			showBackButton={true}
		/>

		<!-- FAQ Card (Collapsible) - shown below the editor card -->
		<div class="mt-4 sm:mt-6 bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
			<button
				on:click={() => (limitationsExpanded = !limitationsExpanded)}
				class="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-gray-600 transition-colors"
				aria-expanded={limitationsExpanded}
				aria-controls="faq-content"
			>
				<h2 class="text-base sm:text-lg font-semibold text-gray-200">Frequently Asked Questions</h2>
				<svg
					class="w-5 h-5 text-gray-400 transition-transform {limitationsExpanded ? 'rotate-180' : ''}"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			
			{#if limitationsExpanded}
				<div id="faq-content" class="px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
					<div class="space-y-4 text-sm sm:text-base">
						<div class="text-gray-300">
							<h3 class="font-semibold text-gray-200 mb-1">How does video editing work without uploading?</h3>
							<p class="text-gray-400">
								Video Shaper uses WebAssembly (WASM) technology to run FFmpeg, a powerful video processing library, directly in your browser. 
								When you select a video file, it's loaded into your browser's memory using the File API - no network upload occurs. 
								All video processing (<strong class="text-teal-400">trimming</strong>, <strong class="text-teal-400">cropping</strong>, <strong class="text-teal-400">compression</strong>, <strong class="text-teal-400">format conversion</strong>, <strong class="text-teal-400">resolution scaling</strong>, <strong class="text-teal-400">audio removal</strong>, encoding) happens locally on your device using your computer's CPU and memory. 
								The processed video is then downloaded directly from your browser. This means your videos never leave your device and are never sent to any server. 
								No mobile data or internet bandwidth is used for video processing - everything happens offline once the app is loaded.
							</p>
						</div>

						<div class="text-gray-300">
							<h3 class="font-semibold text-gray-200 mb-1">What video formats are supported?</h3>
							<p class="text-gray-400">
								Video Shaper supports common video formats including MP4, MOV, AVI, MKV, FLV, and more. 
								The app uses ffmpeg.wasm which supports most video codecs. For best compatibility, MP4 files are recommended. 
								You can also convert videos between different formats using the format conversion feature.
							</p>
						</div>

						<div class="text-gray-300">
							<h3 class="font-semibold text-gray-200 mb-1">Can I convert videos to different formats?</h3>
							<p class="text-gray-400">
								Yes! Video Shaper includes a format conversion feature that allows you to convert videos between different formats. 
								You can convert to MP4, MOV, AVI, MKV, or FLV formats. Format conversion requires re-encoding the video, 
								which may take longer than preserving the original format, but it's useful when you need a specific format for compatibility.
							</p>
						</div>

						<div class="text-gray-300">
							<h3 class="font-semibold text-gray-200 mb-1">Can I reduce video resolution to save space?</h3>
							<p class="text-gray-400">
								Yes! Video Shaper includes a resolution scaling feature that allows you to reduce (or increase) video resolution while maintaining the aspect ratio. 
								Reducing resolution significantly decreases file size - for example, reducing to 50% resolution (half width and height) results in approximately 25% of the original file size. 
								You can use the percentage slider for custom scaling or select from preset resolutions like 1080p, 720p, 480p, etc. 
								This is especially useful for creating smaller files for sharing or storage while maintaining acceptable quality.
							</p>
						</div>

						<div class="text-gray-300">
							<h3 class="font-semibold text-gray-200 mb-1">Can I adjust the audio volume in videos?</h3>
							<p class="text-gray-400">
								Yes! Video Shaper includes an audio control feature that allows you to adjust the volume level from 0% to 200%. 
								You can reduce volume (e.g., 50%), keep it at the original level (100%), or boost it (up to 200%). 
								Setting volume to 0% completely removes the audio track, which is useful for creating silent videos or removing unwanted background noise. 
								Removing audio also slightly reduces the file size.
							</p>
						</div>

						<div class="text-gray-300">
							<h3 class="font-semibold text-gray-200 mb-1">Why can't I view videos directly on iPhone/iPad Safari?</h3>
							<p class="text-gray-400">
								iOS Safari has limitations with playing videos directly from blob URLs (temporary browser URLs). When you try to "view" a processed video in Safari, it may not play properly. 
								This is a known Safari limitation, not an issue with Video Shaper. <strong class="text-teal-400">The solution is to download the video</strong> - tap the download icon (↓) in Safari's address bar after processing, 
								or find the file in the Files app under Downloads. Downloaded videos play perfectly in the Photos app, Files app, or any video player on your device.
							</p>
						</div>

						<div class="text-gray-300">
							<h3 class="font-semibold text-gray-200 mb-1">Why is processing slow?</h3>
							<p class="text-gray-400">
								Video processing runs entirely in your browser using WebAssembly, which is 3-5x slower than native video editors. 
								This is the trade-off for complete privacy - your videos never leave your device. For faster processing, 
								trim to shorter segments (under 10 seconds) and avoid compression when possible.
							</p>
						</div>

						<div class="text-gray-300">
							<h3 class="font-semibold text-gray-200 mb-1">What are the file size limits?</h3>
							<p class="text-gray-400">
								Large videos (>100MB) may cause memory issues, especially with compression enabled. 
								Very large output files (>20MB) may fail to download due to browser memory limits. 
								For best results, keep trimmed segments under 10 seconds when using compression, or disable compression for larger files.
							</p>
						</div>

						<div class="text-gray-300">
							<h3 class="font-semibold text-gray-200 mb-1">Is my video data private?</h3>
							<p class="text-gray-400">
								Yes! All processing happens entirely in your browser. Videos never leave your computer and are never uploaded to any server. 
								The app downloads ffmpeg.wasm (~31MB) on first visit, but this is cached for future use.
							</p>
						</div>

						<div class="text-gray-300">
							<h3 class="font-semibold text-gray-200 mb-1">What is tracked?</h3>
							<p class="text-gray-400">
								This site uses <a href="https://www.goatcounter.com/" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">GoatCounter</a>, 
								a privacy-friendly analytics service. GoatCounter does not track personal data, 
								does not use cookies for tracking, and does not create unique user identifiers. It collects basic page view statistics 
								(such as page paths, referrers, and browser information). When a video is processed successfully, we record a simple success count — no details about the video or features used. 
								If processing fails, you will be shown exactly what data would be sent and asked for your explicit consent before any error report is transmitted. 
								Error reports include only the error category (e.g. "memory"), features used, format, approximate size/duration range, and browser family. 
								All values are bucketed into broad ranges — no exact file sizes, durations, filenames, 
								or video content is ever collected.
							</p>
						</div>

						<div class="text-gray-300">
							<h3 class="font-semibold text-gray-200 mb-1">Why does compression sometimes fail?</h3>
							<p class="text-gray-400">
								Compression requires significant browser memory. Very large videos or high-resolution files (like 4K) can exceed browser memory limits. 
								If compression fails, try: trimming to a shorter segment, using higher compression (move slider left), or disabling compression entirely. 
								The app will show helpful error messages if issues occur.
							</p>
						</div>

						<div class="text-gray-300">
							<h3 class="font-semibold text-gray-200 mb-1">Why is there a 30MB download when I select a video?</h3>
							<p class="text-gray-400">
								Video Shaper uses FFmpeg, a powerful video processing library, to handle all video operations (trimming, cropping, compression). 
								FFmpeg is compiled to WebAssembly (WASM) format so it can run entirely in your browser - this is what enables 100% client-side processing with no uploads. 
								The ~30MB download contains the FFmpeg WebAssembly binary and starts automatically when you select a video. 
								The download happens silently in the background, so you can start editing immediately while it loads. 
								If you click "Process Video" before the download completes, the app will wait for it to finish. 
								Your browser caches this file, so subsequent visits won't require re-downloading. The download only happens after you select a video, not when you first visit the page, 
								so you can explore the site without any downloads.
							</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Share this tool -->
		<div class="mt-4 sm:mt-6 bg-gray-700 rounded-lg border border-gray-600 p-4 sm:p-6">
			<h2 class="text-base sm:text-lg font-semibold text-gray-200 mb-2">Share this tool</h2>
			<p class="text-gray-400 text-sm">
				Know someone who needs to edit a video privately? Send them this link: <a href="https://video.shaper.samma.no/" class="text-teal-400 hover:text-teal-300 underline">https://video.shaper.samma.no/</a>
			</p>
		</div>

		<!-- Disclaimer Card (Collapsible) -->
		<div class="mt-4 sm:mt-6 bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
			<button
				on:click={() => (disclaimerExpanded = !disclaimerExpanded)}
				class="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-gray-600 transition-colors"
				aria-expanded={disclaimerExpanded}
				aria-controls="disclaimer-content"
			>
				<h2 class="text-base sm:text-lg font-semibold text-gray-200">Disclaimer</h2>
				<svg
					class="w-5 h-5 text-gray-400 transition-transform {disclaimerExpanded ? 'rotate-180' : ''}"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			
			{#if disclaimerExpanded}
				<div id="disclaimer-content" class="px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
					<div class="text-xs sm:text-sm text-gray-400 leading-relaxed space-y-4">
						<div>
							<p>
								This service is provided "as is" without warranty of any kind. 
								Video Shaper processes videos entirely in your browser and does not guarantee successful processing for all video formats or sizes. 
								Users are responsible for backing up their original files. The developers are not liable for any data loss, corruption, or other issues 
								that may occur during video processing. Use at your own risk.
							</p>
							<p class="mt-3 text-gray-500 italic">
								This project was coded 100% with Cursor using the Composer 1 model.
							</p>
						</div>

						<div class="border-t border-gray-600 pt-4 mb-4">
							<h3 class="font-semibold text-gray-300 mb-3">Project License</h3>
							<p class="text-gray-400">
								Video Shaper is free software licensed under the 
								<a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">GNU General Public License v3.0</a> 
								or later. You are free to use, modify, and distribute this software under the terms of the GPL.
								Source code is available on <a href="https://github.com/samma/video-shaper" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">GitHub</a>.
							</p>
						</div>

						<div class="border-t border-gray-600 pt-4">
							<h3 class="font-semibold text-gray-300 mb-3">Third-Party Licenses</h3>
							<p class="mb-3">
								Video Shaper uses the following open-source libraries and tools. Their respective licenses are listed below:
							</p>
							<ul class="space-y-2 ml-4 list-disc">
								<li>
									<strong class="text-gray-300">FFmpeg</strong> - Licensed under 
									<a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">GPL v3</a> 
									and <a href="https://www.gnu.org/licenses/lgpl-3.0.html" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">LGPL v3</a>. 
									FFmpeg is used via <a href="https://github.com/ffmpegwasm/ffmpeg.wasm" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">ffmpeg.wasm</a> 
									(MIT License).
								</li>
								<li>
									<strong class="text-gray-300">Svelte & SvelteKit</strong> - Licensed under 
									<a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">MIT License</a>.
								</li>
								<li>
									<strong class="text-gray-300">TailwindCSS</strong> - Licensed under 
									<a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">MIT License</a>.
								</li>
								<li>
									<strong class="text-gray-300">Vite</strong> - Licensed under 
									<a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">MIT License</a>.
								</li>
								<li>
									<strong class="text-gray-300">TypeScript</strong> - Licensed under 
									<a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">Apache License 2.0</a>.
								</li>
								<li>
									<strong class="text-gray-300">Playwright</strong> - Licensed under 
									<a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">Apache License 2.0</a>.
								</li>
								<li>
									<strong class="text-gray-300">Vitest</strong> - Licensed under 
									<a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">MIT License</a>.
								</li>
								<li>
									<strong class="text-gray-300">GoatCounter</strong> - Privacy-friendly web analytics. 
									See <a href="https://www.goatcounter.com/" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">GoatCounter.com</a> 
									and <a href="https://github.com/arp242/goatcounter" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">GitHub repository</a> for license information.
								</li>
							</ul>
							<p class="mt-4 text-gray-500 italic">
								For complete license information, please refer to the LICENSE files in each library's repository or the node_modules directory.
							</p>
						</div>

						<div class="border-t border-gray-600 pt-4">
							<p class="text-gray-400">
								Page available on <a href="https://vs.samma.no" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">vs.samma.no</a> and <a href="https://video.shaper.samma.no" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">video.shaper.samma.no</a>.
							</p>
							<p class="text-gray-400 mt-2">
								Source code available on <a href="https://github.com/samma/video-shaper" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">GitHub</a>.
							</p>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</main>
</div>
