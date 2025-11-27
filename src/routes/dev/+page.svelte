<script lang="ts">
	import { onMount } from 'svelte';
	
	// Mock data for the UI variations
	let mockVideoDuration = 120; // 2 minutes
	let mockStartTime = 30;
	let mockEndTime = 90;
	let mockTrimEnabled = true;
	let mockCropEnabled = false;
	let mockCompressionEnabled = false;
	let mockCrf = 23;
	
	onMount(() => {
		// This is just a visual comparison page, no real functionality needed
	});
</script>

<svelte:head>
	<title>UI Design Variations - Video Shaper Dev</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 p-4">
	<div class="max-w-7xl mx-auto">
		<header class="mb-8 text-center">
			<h1 class="text-3xl font-bold text-white mb-2">UI Design Variations</h1>
			<p class="text-gray-400 mb-4">Three different approaches to the video editing interface</p>
			<a href="/" class="text-teal-400 hover:text-teal-300 text-sm underline">← Back to main page</a>
		</header>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
			<!-- Variation 1: Minimalist/Clean -->
			<div class="bg-gray-800 rounded-lg p-6 border-2 border-teal-500/30 shadow-lg">
				<div class="mb-4 pb-3 border-b border-gray-600">
					<h2 class="text-xl font-semibold text-white mb-1">Variation 1: Minimalist</h2>
					<p class="text-sm text-gray-400">Clean, spacious design with subtle borders</p>
				</div>
				<div class="space-y-6">
					<!-- Header -->
					<div class="text-center">
						<h3 class="text-2xl font-bold text-white mb-1">Free Video Shaper</h3>
						<p class="text-sm text-teal-300">Trim, Crop and Compress videos for free</p>
					</div>

					<!-- Video Preview Area -->
					<div class="bg-black rounded-lg aspect-video flex items-center justify-center border border-gray-700">
						<div class="text-center">
							<svg class="w-12 h-12 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
							<span class="text-gray-500 text-xs block">Video Preview</span>
						</div>
					</div>

					<!-- Controls - Minimalist Style -->
					<div class="space-y-4">
						<!-- Trim Control -->
						<div class="pb-4 border-b border-gray-700">
							<div class="flex items-center justify-between mb-3">
								<span class="text-sm font-medium text-gray-300">Trim</span>
								<label class="relative inline-flex items-center cursor-pointer">
									<input type="checkbox" checked={mockTrimEnabled} class="sr-only peer" />
									<div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
								</label>
							</div>
							<div class="h-2 bg-gray-700 rounded-full relative">
								<div class="h-full bg-teal-600 rounded-full" style="width: 50%; margin-left: 25%;"></div>
								<div class="absolute top-0 left-[25%] w-1 h-full bg-teal-600"></div>
								<div class="absolute top-0 left-[75%] w-1 h-full bg-teal-600"></div>
							</div>
							<div class="flex justify-between mt-1 text-xs text-gray-400">
								<span>0:30</span>
								<span>1:30</span>
							</div>
						</div>

						<!-- Crop Control -->
						<div class="pb-4 border-b border-gray-700">
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm font-medium text-gray-300">Crop</span>
								<label class="relative inline-flex items-center cursor-pointer">
									<input type="checkbox" checked={mockCropEnabled} class="sr-only peer" />
									<div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
								</label>
							</div>
							<p class="text-xs text-gray-500">Enable to select crop area</p>
						</div>

						<!-- Compression Control -->
						<div>
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm font-medium text-gray-300">Compress</span>
								<label class="relative inline-flex items-center cursor-pointer">
									<input type="checkbox" checked={mockCompressionEnabled} class="sr-only peer" />
									<div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
								</label>
							</div>
							<p class="text-xs text-gray-500">Reduce file size</p>
						</div>
					</div>

					<!-- Process Button -->
					<button class="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
						Process Video
					</button>
				</div>
			</div>

			<!-- Variation 2: Card-based/Modern -->
			<div class="bg-gray-800 rounded-lg p-6 border-2 border-teal-500/30 shadow-lg">
				<div class="mb-4 pb-3 border-b border-gray-600">
					<h2 class="text-xl font-semibold text-white mb-1">Variation 2: Card-based</h2>
					<p class="text-sm text-gray-400">Each control in its own card with clear separation</p>
				</div>
				<div class="space-y-4">
					<!-- Header -->
					<div class="text-center pb-4 border-b border-gray-700">
						<h3 class="text-2xl font-bold text-white mb-1">Free Video Shaper</h3>
						<p class="text-sm text-teal-300">Trim, Crop and Compress videos for free</p>
					</div>

					<!-- Video Preview Card -->
					<div class="bg-gray-700 rounded-lg p-3 border border-gray-600">
						<div class="bg-black rounded-lg aspect-video flex items-center justify-center border border-gray-700">
							<div class="text-center">
								<svg class="w-12 h-12 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
								</svg>
								<span class="text-gray-500 text-xs block">Video Preview</span>
							</div>
						</div>
					</div>

					<!-- Trim Card -->
					<div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
						<div class="flex items-center justify-between mb-3">
							<h4 class="text-base font-semibold text-white">Trim Video</h4>
							<label class="relative inline-flex items-center cursor-pointer">
								<input type="checkbox" checked={mockTrimEnabled} class="sr-only peer" />
								<div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
							</label>
						</div>
						<div class="h-2 bg-gray-800 rounded-full relative">
							<div class="h-full bg-teal-600 rounded-full" style="width: 50%; margin-left: 25%;"></div>
							<div class="absolute top-0 left-[25%] w-1 h-full bg-teal-600"></div>
							<div class="absolute top-0 left-[75%] w-1 h-full bg-teal-600"></div>
						</div>
						<div class="flex justify-between mt-2 text-xs text-gray-400">
							<span>0:30</span>
							<span>1:30</span>
						</div>
					</div>

					<!-- Crop Card -->
					<div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
						<div class="flex items-center justify-between">
							<div>
								<h4 class="text-base font-semibold text-white mb-1">Crop Video</h4>
								<p class="text-xs text-gray-400">Select area to crop</p>
							</div>
							<label class="relative inline-flex items-center cursor-pointer">
								<input type="checkbox" checked={mockCropEnabled} class="sr-only peer" />
								<div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
							</label>
						</div>
					</div>

					<!-- Compression Card -->
					<div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
						<div class="flex items-center justify-between">
							<div>
								<h4 class="text-base font-semibold text-white mb-1">Compress Video</h4>
								<p class="text-xs text-gray-400">Reduce file size</p>
							</div>
							<label class="relative inline-flex items-center cursor-pointer">
								<input type="checkbox" checked={mockCompressionEnabled} class="sr-only peer" />
								<div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
							</label>
						</div>
					</div>

					<!-- Process Button Card -->
					<div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
						<button class="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
							Process Video
						</button>
					</div>
				</div>
			</div>

			<!-- Variation 3: Compact/Tabs -->
			<div class="bg-gray-800 rounded-lg p-6 border-2 border-purple-500/30 shadow-lg">
				<div class="mb-4 pb-3 border-b border-gray-600">
					<h2 class="text-xl font-semibold text-white mb-1">Variation 3: Compact</h2>
					<p class="text-sm text-gray-400">Space-efficient with grouped controls</p>
				</div>
				<div class="space-y-4">
					<!-- Header -->
					<div class="text-center">
						<h3 class="text-xl font-bold text-white mb-1">Free Video Shaper</h3>
						<p class="text-xs text-teal-300">Trim, Crop and Compress videos for free</p>
					</div>

					<!-- Video Preview -->
					<div class="bg-black rounded-lg aspect-video flex items-center justify-center border border-gray-700">
						<div class="text-center">
							<svg class="w-10 h-10 mx-auto mb-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
							</svg>
							<span class="text-gray-500 text-xs block">Video Preview</span>
						</div>
					</div>

					<!-- Controls Group -->
					<div class="bg-gray-700 rounded-lg p-3 border border-gray-600">
						<!-- Trim -->
						<div class="flex items-center justify-between mb-3 pb-3 border-b border-gray-600">
							<div class="flex-1">
								<div class="flex items-center gap-2 mb-1">
									<span class="text-sm font-medium text-white">Trim</span>
									<label class="relative inline-flex items-center cursor-pointer">
										<input type="checkbox" checked={mockTrimEnabled} class="sr-only peer" />
										<div class="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
									</label>
								</div>
								<div class="h-1.5 bg-gray-800 rounded-full relative">
									<div class="h-full bg-teal-600 rounded-full" style="width: 50%; margin-left: 25%;"></div>
									<div class="absolute top-0 left-[25%] w-0.5 h-full bg-teal-600"></div>
									<div class="absolute top-0 left-[75%] w-0.5 h-full bg-teal-600"></div>
								</div>
								<div class="flex justify-between mt-1 text-xs text-gray-500">
									<span>0:30</span>
									<span>1:30</span>
								</div>
							</div>
						</div>

						<!-- Crop & Compress Row -->
						<div class="grid grid-cols-2 gap-3">
							<div>
								<div class="flex items-center justify-between mb-1">
									<span class="text-xs font-medium text-gray-300">Crop</span>
									<label class="relative inline-flex items-center cursor-pointer">
										<input type="checkbox" checked={mockCropEnabled} class="sr-only peer" />
										<div class="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
									</label>
								</div>
								<p class="text-xs text-gray-500">Select area</p>
							</div>
							<div>
								<div class="flex items-center justify-between mb-1">
									<span class="text-xs font-medium text-gray-300">Compress</span>
									<label class="relative inline-flex items-center cursor-pointer">
										<input type="checkbox" checked={mockCompressionEnabled} class="sr-only peer" />
										<div class="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
									</label>
								</div>
								<p class="text-xs text-gray-500">Reduce size</p>
							</div>
						</div>
					</div>

					<!-- Process Button -->
					<button class="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm">
						Process Video
					</button>
				</div>
			</div>
		</div>

		<!-- Design Notes -->
		<div class="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-4xl mx-auto">
			<h2 class="text-xl font-semibold text-white mb-4">Design Notes</h2>
			<div class="space-y-4 text-sm text-gray-300">
				<div>
					<h3 class="font-semibold text-gray-200 mb-2">Variation 1: Minimalist</h3>
					<ul class="list-disc list-inside space-y-1 text-gray-400 ml-2">
						<li>Clean separation with subtle borders</li>
						<li>More white space for breathing room</li>
						<li>Focus on content hierarchy</li>
						<li>Best for: Users who prefer simplicity</li>
					</ul>
				</div>
				<div>
					<h3 class="font-semibold text-gray-200 mb-2">Variation 2: Card-based</h3>
					<ul class="list-disc list-inside space-y-1 text-gray-400 ml-2">
						<li>Each control in its own card</li>
						<li>Clear visual separation</li>
						<li>More structured and organized</li>
						<li>Best for: Users who prefer clear organization</li>
					</ul>
				</div>
				<div>
					<h3 class="font-semibold text-gray-200 mb-2">Variation 3: Compact</h3>
					<ul class="list-disc list-inside space-y-1 text-gray-400 ml-2">
						<li>Space-efficient layout</li>
						<li>Grouped controls in single card</li>
						<li>Smaller elements, more content visible</li>
						<li>Best for: Users on smaller screens or who prefer density</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>

