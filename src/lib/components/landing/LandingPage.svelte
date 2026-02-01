<script lang="ts">
	import type { LandingPageConfig } from '$lib/types/landing';
	import SEOHead from './SEOHead.svelte';
	import HeroSection from './HeroSection.svelte';
	import FAQSection from './FAQSection.svelte';
	import VideoEditor from '../VideoEditor.svelte';

	export let config: LandingPageConfig;
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
		/>

		<FAQSection faqs={config.faqs} />

		<!-- Link back to main app -->
		<div class="mt-8 pt-6 border-t border-gray-700 text-center">
			<p class="text-gray-400 text-sm mb-3">
				Need more features? Video Shaper also supports cropping, format conversion, resolution scaling, and audio adjustment.
			</p>
			<a
				href="/"
				class="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors font-medium"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Back to Video Shaper (all features)
			</a>
		</div>
	</main>
</div>
