<script lang="ts">
	import type { LandingPageConfig } from '$lib/types/landing';

	export let config: LandingPageConfig;
</script>

<div class="text-center mb-6 sm:mb-8">
	<h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
		{config.h1}
	</h1>
	<p class="text-teal-300 text-sm sm:text-base md:text-lg font-semibold mb-4 tracking-wide">
		{config.tagline}
	</p>
	<p class="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
		{config.introParagraph}
	</p>
</div>
