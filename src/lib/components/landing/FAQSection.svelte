<script lang="ts">
	import type { FAQ } from '$lib/types/landing';

	export let faqs: FAQ[];
	
	let expandedIndex: number | null = null;
	
	function toggleFaq(index: number) {
		expandedIndex = expandedIndex === index ? null : index;
	}
</script>

<div class="mt-8 sm:mt-12">
	<h2 class="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Frequently Asked Questions</h2>
	
	<div class="space-y-3">
		{#each faqs as faq, index}
			<div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
				<button
					on:click={() => toggleFaq(index)}
					class="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-gray-750 transition-colors"
					aria-expanded={expandedIndex === index}
				>
					<h3 class="text-sm sm:text-base font-semibold text-gray-200 pr-4">{faq.question}</h3>
					<svg
						class="w-5 h-5 text-gray-400 transition-transform flex-shrink-0 {expandedIndex === index ? 'rotate-180' : ''}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>
				
				{#if expandedIndex === index}
					<div class="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
						<p class="text-gray-400 text-sm sm:text-base leading-relaxed">{faq.answer}</p>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
