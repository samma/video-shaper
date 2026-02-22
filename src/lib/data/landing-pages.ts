import type { LandingPageConfig } from '$lib/types/landing';

export const landingPages: Record<string, LandingPageConfig> = {
	'trim-video-online': {
		slug: 'trim-video-online',
		title: 'Trim Video Online Free - No Upload Required | Video Shaper',
		metaDescription:
			'Trim and cut videos online for free without uploading. Select exact timestamps, preview cuts instantly. 100% private - videos never leave your device.',
		keywords:
			'trim video online, cut video online, video trimmer, free video cutter, trim video without upload, online video trimmer, video clip cutter, shorten video online, private video trimmer',
		canonicalPath: '/trim-video-online/',
		h1: 'Trim video online — cut to exact timestamps (no upload)',
		tagline: 'Select start and end points, preview, download. Your video stays on your device.',
		introParagraph:
			'Trim your videos instantly without uploading to any server. Select your start and end points with frame-accurate precision, preview your selection in real-time, and download the trimmed clip. Your video never leaves your device — all processing happens right in your browser.',
		primaryFeature: 'trim',
		defaultFeatures: {
			trim: true
		},
		bestFor: [
			'Cutting out a specific clip from a longer video',
			'Removing silent intros or outros before sharing',
			'Shortening a video for WhatsApp, email, or social media',
			'Quick trims without installing any software'
		],
		notFor: [
			'Multi-cut editing with many separate clips',
			'Adding transitions or text overlays',
			'Very large files on low-end devices (may run slowly)'
		],
		faqs: [
			{
				question: 'How do I trim a video online without uploading?',
				answer:
					"Select your video with the file picker above. All processing happens in your browser. Set start and end times with the timeline slider, then click 'Process Video' to download."
			},
			{
				question: 'What video formats can I trim?',
				answer:
					'You can trim MP4, MOV, AVI, MKV, and FLV video files. MP4 is recommended for best compatibility. The trimmed video will be saved in the same format as the original unless you enable format conversion.'
			},
			{
				question: 'Is there a file size limit for trimming?',
				answer:
					'There is no strict limit, but very large files (over 500MB) may cause memory issues in some browsers. For best results with large files, consider trimming shorter segments. The processing happens in your browser, so performance depends on your device.'
			},
			{
				question: 'Can I preview my trim selection before processing?',
				answer:
					'Yes. The timeline slider sets start and end points; the video player previews the result in real time as you adjust.'
			},
			{
				question: 'How do I shorten an iPhone video before sending?',
				answer:
					'Select your MOV or HEVC file from your iPhone, set the start and end trim points using the slider, then click Process Video. The trimmed clip downloads directly. You can also enable format conversion to MP4 at the same time for better compatibility.'
			}
		]
	},

	'compress-video-online': {
		slug: 'compress-video-online',
		title: 'Compress Video Online Free - No Upload Required | Video Shaper',
		metaDescription:
			'Compress video online for free without uploading. Reduce file size while keeping it private — no uploads, 100% browser-based processing.',
		keywords:
			'compress video online, video compressor, reduce video size, shrink video file, free video compression, compress video without upload, video file reducer, online video compressor',
		canonicalPath: '/compress-video-online/',
		h1: 'Compress video online — but keep it private (no uploads)',
		tagline:
			'Reduce file size by lowering bitrate, resolution, or audio quality. The video stays on your device.',
		introParagraph:
			'Compress videos in your browser without uploading. Adjust the quality slider to balance file size and quality — fast (smallest size), balanced (good quality, medium size), or quality-first (larger file, best look). The estimated output size updates before you process, so you know exactly what you will get.',
		primaryFeature: 'compress',
		defaultFeatures: {
			compress: true
		},
		bestFor: [
			'Making a video small enough for WhatsApp, Discord, or email',
			'Reducing file size before sharing on social media',
			'Compressing iPhone/HEVC videos for broader compatibility',
			'Quick compression without installing any software'
		],
		notFor: [
			'Professional broadcast-quality output',
			'Very large files on low-end devices (may run slowly)',
			'Lossless compression — some quality reduction always occurs'
		],
		faqs: [
			{
				question: 'How do I compress a video without losing quality?',
				answer:
					"You can't compress without any loss, but you can reduce size while keeping it visually similar. Use the balanced preset (CRF 23–28) — the difference is usually invisible for sharing on social media or messaging apps. Move the slider left only if you need a much smaller file and can accept lower quality."
			},
			{
				question: 'How much can I reduce my video file size?',
				answer:
					'Typically 50–90% depending on quality settings and the original video. Use the quality slider to balance size and quality. The estimated output size shows before you process.'
			},
			{
				question: "What's the best format for small videos?",
				answer:
					'MP4 with H.264 encoding gives the best combination of small file size and broad compatibility — it plays on Windows, Android, iOS, and the web. If file size is the top priority and compatibility is less critical, H.265/HEVC is smaller but not supported everywhere.'
			},
			{
				question: 'Why does compression take long?',
				answer:
					'Browser-based processing uses your device CPU via WebAssembly, which is 3–5× slower than native software. Short clips compress in seconds; longer or high-resolution videos may take a few minutes. Trimming to the essential portion first significantly speeds things up.'
			},
			{
				question: 'Why does compression sometimes fail?',
				answer:
					'Compression needs significant browser memory. For large or 4K videos: trim to a shorter segment first, increase compression, or reduce resolution. Very large files may exceed browser limits.'
			},
			{
				question: 'Is my video private when compressing?',
				answer:
					'Yes. All compression happens in your browser. Nothing is uploaded to any server.'
			}
		]
	},

	'crop-video-online': {
		slug: 'crop-video-online',
		title: 'Crop Video Online Free - No Upload Required | Video Shaper',
		metaDescription:
			'Crop and resize video frame online for free without uploading. Adjust aspect ratio, remove borders. 100% private - videos never leave your device.',
		keywords:
			'crop video online, video cropper, resize video frame, change aspect ratio, crop video for instagram, crop video for tiktok, free video cropper, crop video without upload',
		canonicalPath: '/crop-video-online/',
		h1: 'Crop video online — any aspect ratio, no upload',
		tagline:
			'Remove borders, crop to 9:16 / 1:1 / 16:9, or draw a custom frame. Processed in your browser.',
		introParagraph:
			'Crop your videos to any size or aspect ratio directly in your browser. Remove unwanted borders, adjust the frame, or prepare videos for different platforms like Instagram, TikTok, or YouTube. Visual crop controls make it easy to select exactly the area you want.',
		primaryFeature: 'crop',
		defaultFeatures: {
			crop: true
		},
		bestFor: [
			'Cropping to 9:16 vertical for TikTok, Instagram Reels, or YouTube Shorts',
			'Cropping to 1:1 square for Instagram feed posts',
			'Removing unwanted borders or black bars from a video',
			'Reframing footage for a different platform without re-recording'
		],
		notFor: [
			'Professional multi-track editing or effects',
			'Upscaling cropped content to higher resolution',
			'Very large files on low-end devices (may run slowly)'
		],
		faqs: [
			{
				question: 'How do I crop a video to a specific aspect ratio?',
				answer:
					'Enable the crop feature and select from preset aspect ratios (16:9, 9:16, 1:1, 4:3, etc.) or drag the crop handles to create a custom selection. The aspect ratio lock ensures your selection maintains the chosen ratio as you resize.'
			},
			{
				question: 'Can I crop videos for Instagram or TikTok?',
				answer:
					'Yes! Use the 9:16 vertical preset for Instagram Reels, TikTok, or YouTube Shorts. Use 1:1 square for Instagram feed posts. The crop preview shows exactly how your video will look after processing.'
			},
			{
				question: 'Will cropping affect video quality?',
				answer:
					'Cropping itself preserves the original quality of the remaining area. However, if you crop a small portion and then scale it up, it may appear lower quality. For best results, start with high-resolution source video.'
			},
			{
				question: 'Can I combine cropping with other features?',
				answer:
					'Yes! You can crop, trim, compress, and convert format all in one operation. Enable the features you need, adjust the settings, and process once to get your final video.'
			}
		]
	},

	'convert-video-format': {
		slug: 'convert-video-format',
		title: 'Convert Video Format Online Free - No Upload | Video Shaper',
		metaDescription:
			'Convert MOV/HEVC to MP4 and other formats online for free without uploading. Fix compatibility issues on Windows, Android, and the web — 100% private.',
		keywords:
			'convert video format, video converter online, mp4 converter, mov to mp4, hevc to mp4, avi to mp4, mkv converter, free video converter, convert video without upload, change video format',
		canonicalPath: '/convert-video-format/',
		h1: 'Convert video format (MOV/HEVC → MP4) in your browser',
		tagline:
			'Fix "can\'t play this file" problems and improve compatibility for Windows, Android, and web uploads — without uploading your video.',
		introParagraph:
			'Convert your videos between popular formats including MP4, MOV, AVI, MKV, and FLV — all in your browser without uploading. iPhone videos (HEVC/MOV) often fail to play on Windows or Android; converting to MP4 (H.264) fixes this instantly.',
		primaryFeature: 'convert',
		defaultFeatures: {
			formatConversion: true
		},
		bestFor: [
			'Converting iPhone HEVC or MOV videos to MP4 for Windows or Android',
			'Fixing "can\'t play this file" errors on non-Apple devices',
			'Preparing videos for web uploads that require MP4',
			'Converting between formats without uploading to a cloud service'
		],
		notFor: [
			'Lossless format conversion — re-encoding always involves some quality change',
			'Converting very long videos on slow devices',
			'Professional grading workflows that require specific codecs'
		],
		faqs: [
			{
				question: 'How do I convert iPhone video to MP4?',
				answer:
					"Select your iPhone video (MOV or HEVC file), enable Format Conversion, and choose MP4 as the output. Click Process Video and download the result. MP4 with H.264 plays on virtually every device, including Windows and Android."
			},
			{
				question: 'What is HEVC and why does it fail on some devices?',
				answer:
					'HEVC (H.265) is the codec iPhone uses by default for video. It produces smaller files than the older H.264 standard but is not supported by all devices and software. Older Windows PCs, many Android phones, and some web platforms cannot play HEVC without additional codecs. Converting to MP4/H.264 resolves these compatibility issues.'
			},
			{
				question: 'Which format works everywhere?',
				answer:
					'MP4 with H.264 encoding is the safest choice — it plays on Windows, macOS, iOS, Android, and in web browsers. If you need the smallest file and your audience is on modern devices, HEVC/H.265 is more efficient but less compatible.'
			},
			{
				question: 'What video formats can I convert between?',
				answer:
					'You can convert between MP4, MOV, AVI, MKV, and FLV formats. MP4 is the most widely compatible format and is recommended for sharing. MOV is preferred for Apple devices and professional editing software.'
			},
			{
				question: 'How long does format conversion take?',
				answer:
					'Conversion time depends on video length, resolution, and your device. Browser-based processing is 3–5× slower than native software. Short clips convert in seconds, while longer videos may take several minutes. Progress is shown during processing.'
			}
		]
	},

	'reduce-video-size': {
		slug: 'reduce-video-size',
		title: 'Reduce Video File Size Online Free - No Upload | Video Shaper',
		metaDescription:
			'Reduce video file size online for free without uploading. Compression and resolution options. 100% private - videos never leave your device.',
		keywords:
			'reduce video size, shrink video file, make video smaller, reduce video file size, compress video for email, video size reducer, free video reducer, reduce video without upload',
		canonicalPath: '/reduce-video-size/',
		h1: 'Reduce video file size online — no upload required',
		tagline:
			'Lower resolution, compress quality, or both. See the estimated size before you download.',
		introParagraph:
			'Shrink your video for storage, email, or sharing. Use compression, reduce resolution, or both. The estimated output size updates as you adjust settings, so you know what you will get before processing.',
		primaryFeature: 'resize',
		defaultFeatures: {
			compress: true,
			resolutionScaling: true
		},
		bestFor: [
			'Fitting a video under an email attachment limit (typically 25 MB)',
			'Reducing file size before uploading to a website',
			'Freeing up storage space on your device',
			'Making a video small enough for messaging apps'
		],
		notFor: [
			'Lossless size reduction — some quality reduction is expected',
			'Professional archival use (keep the original for that)',
			'Very large files on low-end devices (may run slowly)'
		],
		faqs: [
			{
				question: 'What is the best way to reduce video file size?',
				answer:
					'1) Trim to keep only what you need. 2) Reduce resolution (e.g., 1080p to 720p). 3) Enable compression. Combining these can cut size by 90% or more.'
			},
			{
				question: 'How much smaller can I make my video?',
				answer:
					'It depends on the original video and your settings. Reducing resolution to 50% alone cuts size by ~75%. Adding compression reduces it further. The estimated size shows before you process.'
			},
			{
				question: "Why won't my video fit in an email attachment?",
				answer:
					'Email limits attachments to ~25 MB. Try: reduce resolution to 720p or 480p, enable compression, and trim to essentials. The estimated size shows before you process.'
			},
			{
				question: 'Will reducing size affect video quality?',
				answer:
					'Yes. Lower resolution shrinks dimensions; compression reduces quality. For sharing, moderate reduction is usually fine. For archival use, keep the original quality.'
			}
		]
	},

	'smaller-video': {
		slug: 'smaller-video',
		title: 'Make Video Smaller Online Free - No Upload | Video Shaper',
		metaDescription:
			'Make your video file smaller online for free without uploading. Easy compression and resize tools. 100% private - videos never leave your device.',
		keywords:
			'make video smaller, smaller video file, shrink video, video too large, reduce video mb, compress video size, make video file smaller, video shrink online',
		canonicalPath: '/smaller-video/',
		h1: 'Make video smaller — quick and private, no upload',
		tagline:
			'Compress, reduce resolution, or both. Everything stays on your device.',
		introParagraph:
			'Need a smaller video to share? Compress quality, reduce resolution, or both. See the estimated size before you download. Everything happens in your browser — your video stays private.',
		primaryFeature: 'resize',
		defaultFeatures: {
			compress: true,
			resolutionScaling: true
		},
		bestFor: [
			'Quickly shrinking a video before texting or emailing',
			'Reducing file size to fit a platform upload limit',
			'Trimming and compressing in one step'
		],
		notFor: [
			'Lossless reduction — compression always reduces some quality',
			'Very large files on low-end devices (may run slowly)'
		],
		faqs: [
			{
				question: 'How do I make my video smaller?',
				answer:
					"Select your video, then enable 'Compression' and/or 'Resolution Scaling'. Move the slider toward 'Smaller File' or pick 720p/480p. The estimated size updates as you adjust."
			},
			{
				question: 'What is the fastest way to shrink a video?',
				answer:
					"The quickest significant reduction comes from lowering resolution. Dropping from 1080p to 720p reduces file size by about 50% with minimal quality loss. If you need even smaller, add compression or reduce resolution further."
			},
			{
				question: 'How small can I make my video?',
				answer:
					'With aggressive settings (low resolution + high compression), you can reduce videos by 90% or more. However, very small files will have noticeable quality loss. Find the balance that works for your needs using the preview and estimated size.'
			},
			{
				question: 'My video is too big to send — what should I do?',
				answer:
					'Trim unnecessary parts, reduce resolution to 720p or lower, and enable compression. Email is ~25 MB; messaging apps are 8–16 MB. The estimated size shows before you process.'
			}
		]
	},

	'video-too-big': {
		slug: 'video-too-big',
		title: 'Video Too Big to Send? Shrink It Free — No Upload | Video Shaper',
		metaDescription:
			'Video too big for WhatsApp, Discord, or email? Shrink it free in your browser without uploading. Fit common size limits — 100% private.',
		keywords:
			'video too big, video file too large, video too big for email, video too big for whatsapp, video too big for discord, shrink large video, reduce big video file, compress large video',
		canonicalPath: '/video-too-big/',
		h1: 'Video too big to send? Shrink it in your browser (no upload)',
		tagline:
			'Make videos fit WhatsApp, Discord, email, and more — processed locally on your device.',
		introParagraph:
			"Can't send that video? Reduce resolution, compress quality, or trim it — all in your browser. Common size limits: email attachments are typically 10–25 MB, WhatsApp is ~16 MB, Discord free accounts allow up to 8 MB, and Slack varies by plan. Adjust the settings until the estimated size is under your target, then download.",
		primaryFeature: 'resize',
		defaultFeatures: {
			compress: true,
			resolutionScaling: true
		},
		bestFor: [
			'Shrinking a video under the WhatsApp 16 MB limit',
			'Getting a video under 8 MB for Discord free accounts',
			'Fitting a video in a 25 MB email attachment',
			'Reducing an iPhone video to share on Android or Windows'
		],
		notFor: [
			'Lossless compression — some quality reduction is expected',
			'Very large files (>500 MB) on low-end devices',
			'Professional archival use (keep the original for that)'
		],
		faqs: [
			{
				question: 'How do I compress a video under 25 MB?',
				answer:
					'Enable Resolution Scaling (try 720p or 480p) and Compression, then watch the estimated output size as you adjust. For most videos, 720p + moderate compression gets well under 25 MB. If you need even smaller, trim away unnecessary parts first.'
			},
			{
				question: 'How do I shrink an iPhone video for WhatsApp?',
				answer:
					"Select your iPhone video (MOV or HEVC), enable Resolution Scaling and Compression, and aim for an estimated size under 16 MB. You can also enable Format Conversion to MP4 so the video plays reliably on Android. The file never leaves your device."
			},
			{
				question: 'Why is my video still big after compressing?',
				answer:
					"Compression alone reduces bitrate, but high-resolution videos still produce large files. The most effective step is lowering resolution — dropping from 1080p to 720p typically cuts size by ~50% before compression. Combine resolution reduction with compression and, if needed, trim to the essential portion."
			},
			{
				question: 'My video is too big for email — how do I fix it?',
				answer:
					'Email limits attachments to ~25 MB. Trim, set resolution to 720p or 480p, and enable compression. Watch the estimated size until it is under 25 MB.'
			},
			{
				question: "Why won't WhatsApp let me send my video?",
				answer:
					"WhatsApp limits videos to ~16 MB. Lower resolution to 480p, enable compression, and trim to essentials. The estimated size helps you hit the target."
			},
			{
				question: 'How do I reduce video size for Discord?',
				answer:
					'Discord free accounts limit uploads to 8 MB. Use low resolution (480p or below), high compression, and trim to short clips.'
			}
		]
	},

	'private-video-editor': {
		slug: 'private-video-editor',
		title: 'Private Video Editor — Videos Never Leave Your Device | Video Shaper',
		metaDescription:
			'Edit videos privately in your browser — no uploads, no account, no servers. Trim, crop, compress, and convert video files locally. 100% verifiable privacy.',
		keywords:
			'private video editor, no upload video editor, offline video editor, secure video editor, browser video editor, local video processing, video editor no server, confidential video editing',
		canonicalPath: '/private-video-editor/',
		h1: 'Private video editor — videos never leave your device',
		tagline: 'Everything happens locally in your browser. No accounts. No uploads.',
		introParagraph:
			'Every edit — trimming, cropping, compressing, converting — runs entirely in your browser. Your video is never sent to any server.',
		primaryFeature: 'privacy',
		defaultFeatures: {},
		bestFor: [
			'No uploads, ever',
			'No account required',
			'Verifiable in DevTools',
			'Works offline',
		],
		faqs: [
			{
				question: 'How can video editing work without uploading?',
				answer:
					"Video Shaper uses WebAssembly (WASM) technology to run FFmpeg, a professional video processing library, directly in your browser. When you select a video, it stays on your device. All processing uses your computer's CPU and memory. The result downloads directly to your device. No internet upload ever occurs."
			},
			{
				question: 'Is this really private? How can I be sure?',
				answer:
					"You can verify this yourself: open your browser's developer tools (F12), go to the Network tab, and watch while processing. You'll see no video data being uploaded. The only network requests are for loading the application itself. Your video data stays completely local."
			},
			{
				question: 'What about the 30 MB download when I select a video?',
				answer:
					"That's the FFmpeg processing engine downloading to your browser — not your video uploading. It runs locally and is cached for future visits."
			},
			{
				question: 'Why should I trust this over other online editors?',
				answer:
					'Most online video editors upload your files to their servers for processing. This means your personal videos pass through their systems. Video Shaper is different — the code runs in your browser, not on a server. This is verifiable, open-source, and technically incapable of accessing your videos remotely.'
			},
			{
				question: 'Does this work offline?',
				answer:
					'Once the application is loaded and cached (including the FFmpeg binary), you can process videos without an internet connection. This is another benefit of client-side processing — no server means no internet required for the actual video editing.'
			},
			{
				question: 'What data do you collect?',
				answer:
					'We do not upload or store your video files — ever. We use GoatCounter for basic anonymous page analytics (page views and referrers, no personal data, no cookies). If video processing fails, you are shown an opt-in error report before anything is sent; it contains only broad categories (error type, features used, approximate size/duration ranges, browser) and no video content, filenames, or exact file sizes.'
			},
			{
				question: 'What happens if processing fails? Is any data sent?',
				answer:
					'If an error occurs, you are shown exactly what would be sent and must approve before anything is transmitted. The report includes only broad categories: error type, features used, format, approximate size and duration ranges, and browser. No filenames, exact sizes, or video content. You can see it and decline.'
			}
		]
	}
};

// Helper function to get config by slug
export function getLandingPageConfig(slug: string): LandingPageConfig | undefined {
	return landingPages[slug];
}

// Get all slugs (useful for sitemap generation)
export function getAllLandingPageSlugs(): string[] {
	return Object.keys(landingPages);
}
