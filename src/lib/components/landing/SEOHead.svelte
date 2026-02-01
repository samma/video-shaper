<script lang="ts">
	import type { LandingPageConfig } from '$lib/types/landing';

	export let config: LandingPageConfig;
	
	const baseUrl = 'https://video.shaper.samma.no';
	$: canonicalUrl = `${baseUrl}${config.canonicalPath}`;
	$: ogImage = `${baseUrl}/og-image.png`;
</script>

<svelte:head>
	<title>{config.title}</title>
	<meta name="description" content={config.metaDescription} />
	<link rel="canonical" href={canonicalUrl} />
	
	<!-- Open Graph -->
	<meta property="og:title" content={config.title} />
	<meta property="og:description" content={config.metaDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:alt" content="{config.h1} - Video Shaper" />
	<meta property="og:site_name" content="Video Shaper" />
	<meta property="og:locale" content="en_US" />
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={config.title} />
	<meta name="twitter:description" content={config.metaDescription} />
	<meta name="twitter:image" content={ogImage} />
	
	<!-- Additional SEO -->
	<meta name="robots" content="index, follow" />

	<!-- FAQ Schema.org structured data -->
	{@html `<script type="application/ld+json">
	{
		"@context": "https://schema.org",
		"@type": "FAQPage",
		"mainEntity": [
			${config.faqs
				.map(
					(faq) => `{
				"@type": "Question",
				"name": ${JSON.stringify(faq.question)},
				"acceptedAnswer": {
					"@type": "Answer",
					"text": ${JSON.stringify(faq.answer)}
				}
			}`
				)
				.join(',\n\t\t\t')}
		]
	}
	</script>`}
</svelte:head>
