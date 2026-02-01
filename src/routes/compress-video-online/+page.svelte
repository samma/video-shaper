<script lang="ts">
	import LandingPage from '$lib/components/landing/LandingPage.svelte';
	import { landingPages } from '$lib/data/landing-pages';

	const config = landingPages['compress-video-online'];
</script>

<LandingPage {config} />
