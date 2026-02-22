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
	<p class="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-5">
		{config.introParagraph}
	</p>

	{#if config.bestFor && config.bestFor.length > 0}
		<div class="flex flex-wrap justify-center gap-2">
			{#each config.bestFor as item}
				<span class="inline-flex items-center gap-1.5 bg-gray-800 border border-gray-700 hover:border-teal-600 rounded-full px-3.5 py-1.5 text-xs sm:text-sm text-gray-300 transition-colors">
					<svg class="w-3.5 h-3.5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
					</svg>
					{item}
				</span>
			{/each}
		</div>
	{/if}
</div>
