<script lang="ts">
	import type { LandingPageConfig } from '$lib/types/landing';
	import SEOHead from './SEOHead.svelte';
	import HeroSection from './HeroSection.svelte';
	import FAQSection from './FAQSection.svelte';
	import VideoEditor from '../VideoEditor.svelte';

	export let config: LandingPageConfig;

	let hasProcessed = false;
</script>

<SEOHead {config} />

<div class="min-h-screen bg-gray-900 p-3 sm:p-4">
	<main class="max-w-4xl mx-auto py-4 sm:py-8">
		<HeroSection {config} />

		{#if config.primaryFeature === 'privacy'}
			<div class="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-6 text-center">
				<div class="bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-3 sm:py-4">
					<svg class="w-5 h-5 sm:w-6 sm:h-6 text-teal-400 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
					</svg>
					<p class="text-white text-xs sm:text-sm font-semibold leading-tight">Video stays<br/>on your device</p>
				</div>
				<div class="bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-3 sm:py-4">
					<svg class="w-5 h-5 sm:w-6 sm:h-6 text-teal-400 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
					</svg>
					<p class="text-white text-xs sm:text-sm font-semibold leading-tight">No server.<br/>No account.</p>
				</div>
				<div class="bg-gray-800/60 border border-gray-700 rounded-xl px-3 py-3 sm:py-4">
					<svg class="w-5 h-5 sm:w-6 sm:h-6 text-teal-400 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
					</svg>
					<p class="text-white text-xs sm:text-sm font-semibold leading-tight">Open source.<br/>Verify yourself.</p>
				</div>
			</div>
		{/if}

		<VideoEditor
			defaultFeatures={config.defaultFeatures}
			showInfoCard={true}
			infoCardContent="minimal"
			showBackButton={true}
			bind:hasProcessed
		/>

		{#if hasProcessed}
			<div class="mt-4 sm:mt-6 bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-5">
				<h2 class="text-base font-semibold text-gray-200 mb-1">Share this tool</h2>
				<p class="text-gray-400 text-sm">
					Know someone who needs to edit a video privately? Send them this link: <a href="https://video.shaper.samma.no/" class="text-teal-400 hover:text-teal-300 underline">https://video.shaper.samma.no/</a>
				</p>
			</div>
		{/if}

		{#if config.primaryFeature === 'privacy'}
			<div class="mt-8 sm:mt-12">
				<h2 class="text-xl sm:text-2xl font-bold text-white mb-1">What you can do</h2>
				<p class="text-gray-400 text-sm mb-5">All features work together in a single pass — no re-uploading between steps.</p>
				<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
					<div class="bg-gray-800 border border-gray-700 rounded-xl p-4">
						<div class="flex items-center gap-2.5 mb-2">
							<svg class="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span class="font-semibold text-white text-sm">Trim</span>
						</div>
						<p class="text-gray-400 text-xs leading-relaxed">Cut to exact start and end timestamps with frame-accurate precision.</p>
					</div>
					<div class="bg-gray-800 border border-gray-700 rounded-xl p-4">
						<div class="flex items-center gap-2.5 mb-2">
							<svg class="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 5a1 1 0 011-1h4a1 1 0 010 2H6.414l7.293 7.293a1 1 0 01-1.414 1.414L5 7.414V10a1 1 0 01-2 0V5zM20 19a1 1 0 01-1 1h-4a1 1 0 010-2h2.586l-7.293-7.293a1 1 0 011.414-1.414L19 16.586V14a1 1 0 012 0v5z" />
							</svg>
							<span class="font-semibold text-white text-sm">Crop</span>
						</div>
						<p class="text-gray-400 text-xs leading-relaxed">Reframe to 9:16, 1:1, 16:9 or any custom area. Remove borders.</p>
					</div>
					<div class="bg-gray-800 border border-gray-700 rounded-xl p-4">
						<div class="flex items-center gap-2.5 mb-2">
							<svg class="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
							<span class="font-semibold text-white text-sm">Compress</span>
						</div>
						<p class="text-gray-400 text-xs leading-relaxed">Lower bitrate to shrink file size. Preview estimated output before processing.</p>
					</div>
					<div class="bg-gray-800 border border-gray-700 rounded-xl p-4">
						<div class="flex items-center gap-2.5 mb-2">
							<svg class="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
							</svg>
							<span class="font-semibold text-white text-sm">Convert</span>
						</div>
						<p class="text-gray-400 text-xs leading-relaxed">Change format between MP4, MOV, AVI, MKV, FLV. Fix iPhone HEVC compatibility.</p>
					</div>
					<div class="bg-gray-800 border border-gray-700 rounded-xl p-4">
						<div class="flex items-center gap-2.5 mb-2">
							<svg class="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
							</svg>
							<span class="font-semibold text-white text-sm">Resize</span>
						</div>
						<p class="text-gray-400 text-xs leading-relaxed">Scale resolution down to 720p, 480p or a custom percentage to cut file size.</p>
					</div>
					<div class="bg-gray-800 border border-gray-700 rounded-xl p-4">
						<div class="flex items-center gap-2.5 mb-2">
							<svg class="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15.536 8.464a5 5 0 010 7.072M12 6a7.975 7.975 0 015.657 2.343m0 0a8 8 0 010 11.314M12 6a7.975 7.975 0 00-5.657 2.343m0 0a8 8 0 000 11.314M12 6v12" />
							</svg>
							<span class="font-semibold text-white text-sm">Audio</span>
						</div>
						<p class="text-gray-400 text-xs leading-relaxed">Adjust volume from 0–200%, or mute entirely to remove the audio track.</p>
					</div>
				</div>
			</div>
		{/if}

		<FAQSection faqs={config.faqs} />

		<!-- Related Tools -->
		<div class="mt-8 pt-6 border-t border-gray-700">
			<h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 text-center">Related tools</h2>
			<div class="flex flex-wrap justify-center gap-2 mb-6">
				<a href="/compress-video-online/" class="px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs sm:text-sm transition-colors border border-gray-600 hover:border-teal-500">
					Compress
				</a>
				<a href="/convert-video-format/" class="px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs sm:text-sm transition-colors border border-gray-600 hover:border-teal-500">
					Convert format
				</a>
				<a href="/reduce-video-size/" class="px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs sm:text-sm transition-colors border border-gray-600 hover:border-teal-500">
					Reduce size
				</a>
				<a href="/trim-video-online/" class="px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs sm:text-sm transition-colors border border-gray-600 hover:border-teal-500">
					Trim
				</a>
				<a href="/crop-video-online/" class="px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs sm:text-sm transition-colors border border-gray-600 hover:border-teal-500">
					Crop
				</a>
			</div>
			<div class="text-center">
				<a
					href="/"
					class="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors text-sm"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
					Back to Video Shaper (all features)
				</a>
			</div>
		</div>
	</main>
</div>
