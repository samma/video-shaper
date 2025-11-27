<script lang="ts">
	// eslint-disable-next-line no-unused-vars
	export let onFileSelect: (file: File) => void;
	export let accept = 'video/*';
	export let disabled = false;

	let isDragging = false;
	let fileInput: HTMLInputElement;
	let errorMessage: string = '';

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (!disabled) {
			isDragging = true;
		}
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		if (disabled) return;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.type.startsWith('video/')) {
				errorMessage = '';
				onFileSelect(file);
			} else {
				errorMessage = 'Please select a video file';
				setTimeout(() => (errorMessage = ''), 5000);
			}
		}
	}

	function handleFileInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (files && files.length > 0) {
			const file = files[0];
			if (file.type.startsWith('video/')) {
				errorMessage = '';
				onFileSelect(file);
			} else {
				errorMessage = 'Please select a video file';
				setTimeout(() => (errorMessage = ''), 5000);
			}
		}
	}

	function handleClick() {
		if (!disabled) {
			fileInput.click();
		}
	}
</script>

<div
	class="file-upload border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors
		{isDragging
		? 'border-teal-500 bg-teal-900/30'
		: 'border-gray-600 hover:border-gray-500 bg-gray-700'}
		{disabled ? 'opacity-50 cursor-not-allowed' : ''}"
	on:dragover={handleDragOver}
	on:dragleave={handleDragLeave}
	on:drop={handleDrop}
	on:click={handleClick}
	on:keypress={(e) => e.key === 'Enter' && handleClick()}
	role="button"
	tabindex="0"
>
	<input
		bind:this={fileInput}
		type="file"
		{accept}
		on:change={handleFileInput}
		class="hidden"
		{disabled}
	/>

	<div class="text-gray-300">
		<svg
			class="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4"
			stroke="currentColor"
			fill="none"
			viewBox="0 0 48 48"
			aria-hidden="true"
		>
			<path
				d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		<p class="text-base sm:text-lg font-medium mb-1">
			{isDragging ? 'Drop video here' : 'Click to select or drag and drop'}
		</p>
		<p class="text-xs sm:text-sm text-gray-400">Supports: MP4, WebM, MOV, AVI, and more</p>
		{#if errorMessage}
			<p class="text-xs sm:text-sm text-red-400 mt-2 font-medium">{errorMessage}</p>
		{/if}
	</div>
</div>

