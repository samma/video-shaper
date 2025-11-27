<script lang="ts">
	import { page } from '$app/stores';
	
	$: status = $page.status;
	$: message = status === 404 ? 'Page not found' : 'Something went wrong';
</script>

<div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
	<div class="text-center">
		<h1 class="text-4xl font-bold text-white mb-4">{status}</h1>
		<p class="text-gray-300 mb-8">{message}</p>
		<a href="/" class="text-teal-400 hover:text-teal-300 underline">Go home</a>
	</div>
</div>

