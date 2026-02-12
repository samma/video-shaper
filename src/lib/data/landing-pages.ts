import type { LandingPageConfig } from '$lib/types/landing';

export const landingPages: Record<string, LandingPageConfig> = {
	'trim-video-online': {
		slug: 'trim-video-online',
		title: 'Free Online Video Trimmer - No Upload Required | Video Shaper',
		metaDescription:
			'Trim and cut videos online for free without uploading. Select exact timestamps, preview cuts instantly. 100% private - videos never leave your device.',
		keywords: 'trim video online, cut video online, video trimmer, free video cutter, trim video without upload, online video trimmer, video clip cutter, shorten video online, private video trimmer',
		canonicalPath: '/trim-video-online/',
		h1: 'Free Online Video Trimmer',
		tagline: 'Cut videos to exact timestamps - no upload, 100% private',
		introParagraph:
			'Trim your videos instantly without uploading to any server. Select your start and end points with frame-accurate precision, preview your selection in real-time, and download the trimmed clip. Your video never leaves your device - all processing happens right in your browser.',
		primaryFeature: 'trim',
		defaultFeatures: {
			trim: true
		},
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
			}
		]
	},

	'compress-video-online': {
		slug: 'compress-video-online',
		title: 'Compress Video Online Free - No Upload Required | Video Shaper',
		metaDescription:
			'Reduce video file size online for free without uploading. Adjustable quality settings, instant preview. 100% private - videos never leave your device.',
		keywords: 'compress video online, video compressor, reduce video size, shrink video file, free video compression, compress video without upload, video file reducer, online video compressor',
		canonicalPath: '/compress-video-online/',
		h1: 'Free Online Video Compressor',
		tagline: 'Reduce video file size - no upload, 100% private',
		introParagraph:
			'Compress videos in your browser without uploading. Adjust the quality slider to balance file size and quality. The estimated output size shows before you process.',
		primaryFeature: 'compress',
		defaultFeatures: {
			compress: true
		},
		faqs: [
			{
				question: 'How much can I reduce my video file size?',
				answer:
					'Typically 50-90% depending on quality settings and the original video. Use the quality slider to balance size and quality. The estimated output size shows before you process.'
			},
			{
				question: 'Will compression reduce video quality?',
				answer:
					'Yes, but moderate settings (CRF 23-28) often show no visible loss for sharing on social media or messaging. Adjust the slider to find your preferred balance.'
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
		keywords: 'crop video online, video cropper, resize video frame, change aspect ratio, crop video for instagram, crop video for tiktok, free video cropper, crop video without upload',
		canonicalPath: '/crop-video-online/',
		h1: 'Free Online Video Cropper',
		tagline: 'Crop and resize video frames - no upload, 100% private',
		introParagraph:
			'Crop your videos to any size or aspect ratio directly in your browser. Remove unwanted borders, adjust the frame, or prepare videos for different platforms like Instagram, TikTok, or YouTube. Visual crop controls make it easy to select exactly the area you want.',
		primaryFeature: 'crop',
		defaultFeatures: {
			crop: true
		},
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
			'Convert videos between MP4, MOV, AVI, MKV, FLV formats online for free without uploading. 100% private - videos never leave your device.',
		keywords: 'convert video format, video converter online, mp4 converter, mov to mp4, avi to mp4, mkv converter, free video converter, convert video without upload, change video format',
		canonicalPath: '/convert-video-format/',
		h1: 'Free Online Video Converter',
		tagline: 'Convert between video formats - no upload, 100% private',
		introParagraph:
			'Convert your videos between popular formats including MP4, MOV, AVI, MKV, and FLV - all in your browser without uploading. Perfect for compatibility issues or when you need a specific format for editing, sharing, or playback.',
		primaryFeature: 'convert',
		defaultFeatures: {
			formatConversion: true
		},
		faqs: [
			{
				question: 'What video formats can I convert between?',
				answer:
					'You can convert between MP4, MOV, AVI, MKV, and FLV formats. MP4 is the most widely compatible format and is recommended for sharing. MOV is preferred for Apple devices and professional editing software.'
			},
			{
				question: 'Will converting affect video quality?',
				answer:
					'Converting between formats requires re-encoding, which can affect quality slightly. For best results, avoid converting multiple times. If you need to preserve maximum quality, consider keeping the original format when possible.'
			},
			{
				question: 'Why would I need to convert video format?',
				answer:
					"Common reasons include: compatibility with specific devices or software, reducing file size (some formats compress better), meeting upload requirements for websites, or preparing files for video editing software that prefers certain formats."
			},
			{
				question: 'How long does format conversion take?',
				answer:
					'Conversion time depends on video length, resolution, and your device. Browser-based processing is 3-5x slower than native software. Short clips convert in seconds, while longer videos may take several minutes. Progress is shown during processing.'
			}
		]
	},

	'reduce-video-size': {
		slug: 'reduce-video-size',
		title: 'Reduce Video File Size Online Free - No Upload | Video Shaper',
		metaDescription:
			'Reduce video file size online for free without uploading. Compression and resolution options. 100% private - videos never leave your device.',
		keywords: 'reduce video size, shrink video file, make video smaller, reduce video file size, compress video for email, video size reducer, free video reducer, reduce video without upload',
		canonicalPath: '/reduce-video-size/',
		h1: 'Reduce Video File Size Online',
		tagline: 'Shrink video files quickly - no upload, 100% private',
		introParagraph:
			"Shrink your video for storage or email. Use compression, reduce resolution, or both. The estimated output size shows before you process.",
		primaryFeature: 'resize',
		defaultFeatures: {
			compress: true,
			resolutionScaling: true
		},
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
					'Email limits attachments to ~25MB. Try: reduce resolution to 720p or 480p, enable compression, and trim to essentials. The estimated size shows before you process.'
			},
			{
				question: 'Will reducing size affect video quality?',
				answer:
					'Yes. Lower resolution shrinks dimensions; compression reduces quality. For sharing, moderate reduction is usually fine. For archival use, keep original quality.'
			}
		]
	},

	'smaller-video': {
		slug: 'smaller-video',
		title: 'Make Video Smaller Online Free - No Upload | Video Shaper',
		metaDescription:
			'Make your video file smaller online for free without uploading. Easy compression and resize tools. 100% private - videos never leave your device.',
		keywords: 'make video smaller, smaller video file, shrink video, video too large, reduce video mb, compress video size, make video file smaller, video shrink online',
		canonicalPath: '/smaller-video/',
		h1: 'Make Video Smaller',
		tagline: 'Quickly shrink your video file - no upload required',
		introParagraph:
			"Need a smaller video to share? Compress quality, reduce resolution, or both. See the estimated size before you download. Everything happens in your browser — your video stays private.",
		primaryFeature: 'resize',
		defaultFeatures: {
			compress: true,
			resolutionScaling: true
		},
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
				question: 'My video is too big to send - what should I do?',
				answer:
					'Trim unnecessary parts, reduce resolution to 720p or lower, and enable compression. Email is ~25MB; messaging apps are 8-16MB. The estimated size shows before you process.'
			}
		]
	},

	'video-too-big': {
		slug: 'video-too-big',
		title: "Video Too Big? Shrink It Free Online - No Upload | Video Shaper",
		metaDescription:
			"Video too big for email, WhatsApp or Discord? Shrink it for free without uploading. 100% private - videos never leave your device.",
		keywords: 'video too big, video file too large, video too big for email, video too big for whatsapp, video too big for discord, shrink large video, reduce big video file, compress large video',
		canonicalPath: '/video-too-big/',
		h1: 'Video Too Big?',
		tagline: "Shrink your video to fit any size limit - free and private",
		introParagraph:
			"Can't send that video? Shrink it to fit email (25MB), WhatsApp (16MB), or Discord (8MB). Use compression and resolution tools. Your video never leaves your device.",
		primaryFeature: 'resize',
		defaultFeatures: {
			compress: true,
			resolutionScaling: true
		},
		faqs: [
			{
				question: 'My video is too big for email - how do I fix it?',
				answer:
					'Email limits attachments to ~25MB. Trim, set resolution to 720p or 480p, and enable compression. Watch the estimated size until it is under 25MB.'
			},
			{
				question: "Why won't WhatsApp let me send my video?",
				answer:
					"WhatsApp limits videos to ~16MB. Lower resolution to 480p, enable compression, and trim to essentials. The estimated size helps you hit the target."
			},
			{
				question: 'How do I reduce video size for Discord?',
				answer:
					'Discord free accounts limit uploads to 8MB. Use low resolution (480p or below), high compression, and trim to short clips.'
			},
			{
				question: 'Can I make my video smaller without losing too much quality?',
				answer:
					"Yes. Start with resolution: 1080p to 720p cuts size in half with minimal visible difference. Add light compression. Avoid extreme settings unless you need the smallest file."
			}
		]
	},

	'private-video-editor': {
		slug: 'private-video-editor',
		title: 'Private Video Editor - Edit Without Uploading | Video Shaper',
		metaDescription:
			'Edit videos with complete privacy - no uploads, no servers. Trim, crop, compress, convert in your browser. Videos never leave your device.',
		keywords: 'private video editor, no upload video editor, offline video editor, secure video editor, browser video editor, local video processing, video editor no server, confidential video editing',
		canonicalPath: '/private-video-editor/',
		h1: 'Private Video Editor',
		tagline: 'Edit videos with complete privacy - nothing leaves your device',
		introParagraph:
			"Worried about uploading personal videos to online editors? With Video Shaper, you don't have to. Every edit - trimming, cropping, compressing, converting - happens entirely in your browser. Your videos are never uploaded to any server, never stored in any cloud, and never seen by anyone but you.",
		primaryFeature: 'privacy',
		defaultFeatures: {},
		faqs: [
			{
				question: 'How can video editing work without uploading?',
				answer:
					'Video Shaper uses WebAssembly (WASM) technology to run FFmpeg, a professional video processing library, directly in your browser. When you select a video, it stays on your device. All processing uses your computer\'s CPU and memory. The result downloads directly to your device. No internet upload ever occurs.'
			},
			{
				question: 'Is this really private? How can I be sure?',
				answer:
					"You can verify this yourself: open your browser's developer tools (F12), go to the Network tab, and watch while processing. You'll see no video data being uploaded. The only network requests are for loading the application itself. Your video data stays completely local."
			},
			{
				question: 'What about the 30MB download when I select a video?',
				answer:
					"That's the FFmpeg processing engine downloading to your browser — not your video uploading. It runs locally and is cached for future visits."
			},
			{
				question: 'Why should I trust this over other online editors?',
				answer:
					'Most online video editors upload your files to their servers for processing. This means your personal videos pass through their systems. Video Shaper is different - the code runs in your browser, not on a server. This is verifiable, open-source, and technically incapable of accessing your videos remotely.'
			},
			{
				question: 'Does this work offline?',
				answer:
					'Once the application is loaded and cached (including the FFmpeg binary), you can process videos without an internet connection. This is another benefit of client-side processing - no server means no internet required for the actual video editing.'
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
