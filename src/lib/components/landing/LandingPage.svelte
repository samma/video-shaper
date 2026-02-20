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

		<VideoEditor
			defaultFeatures={config.defaultFeatures}
			showInfoCard={true}
			infoCardContent="minimal"
			showBackButton={true}
			bind:hasProcessed
		/>

		{#if hasProcessed}
			<div class="mt-4 sm:mt-6 bg-gray-700 rounded-lg border border-gray-600 p-4 sm:p-5">
				<h2 class="text-base font-semibold text-gray-200 mb-1">Share this tool</h2>
				<p class="text-gray-400 text-sm">
					Know someone who needs to edit a video privately? Send them this link: <a href="https://video.shaper.samma.no/" class="text-teal-400 hover:text-teal-300 underline">https://video.shaper.samma.no/</a>
				</p>
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
