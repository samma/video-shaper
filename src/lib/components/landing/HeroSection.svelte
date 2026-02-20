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

	{#if config.bestFor || config.notFor}
		<div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
			{#if config.bestFor}
				<div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
					<h2 class="text-sm font-semibold text-green-400 uppercase tracking-wide mb-3">Best for</h2>
					<ul class="space-y-2">
						{#each config.bestFor as item}
							<li class="flex items-start gap-2 text-sm text-gray-300">
								<span class="text-green-400 mt-0.5 shrink-0">✓</span>
								<span>{item}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if config.notFor}
				<div class="bg-gray-800 border border-gray-700 rounded-lg p-4">
					<h2 class="text-sm font-semibold text-red-400 uppercase tracking-wide mb-3">Not for</h2>
					<ul class="space-y-2">
						{#each config.notFor as item}
							<li class="flex items-start gap-2 text-sm text-gray-300">
								<span class="text-red-400 mt-0.5 shrink-0">✗</span>
								<span>{item}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}
</div>
