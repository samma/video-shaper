<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	export let content: string;
	export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';

	let showTooltip = false;
	let tooltipElement: HTMLDivElement;
	let buttonElement: HTMLButtonElement;
	let isMobile = false;
	let clickOutsideListener: ((event: MouseEvent) => void) | null = null;

	onMount(() => {
		checkMobile();
	});

	function handleMouseEnter() {
		if (!isMobile) {
			showTooltip = true;
		}
	}

	function handleMouseLeave() {
		if (!isMobile) {
			showTooltip = false;
		}
	}

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		// On mobile, toggle on click
		if (isMobile) {
			showTooltip = !showTooltip;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (
			tooltipElement &&
			buttonElement &&
			!tooltipElement.contains(event.target as Node) &&
			!buttonElement.contains(event.target as Node)
		) {
			showTooltip = false;
		}
	}

	const MOBILE_BREAKPOINT = 640; // Tailwind's sm breakpoint
	
	function checkMobile() {
		isMobile = window.innerWidth < MOBILE_BREAKPOINT;
	}

	// Properly manage click outside listener for mobile
	$: if (showTooltip && isMobile) {
		// Remove existing listener if any
		if (clickOutsideListener) {
			document.removeEventListener('click', clickOutsideListener);
		}
		// Add new listener
		clickOutsideListener = handleClickOutside;
		setTimeout(() => {
			document.addEventListener('click', clickOutsideListener!);
		}, 0);
	} else {
		// Remove listener when tooltip is hidden
		if (clickOutsideListener) {
			document.removeEventListener('click', clickOutsideListener);
			clickOutsideListener = null;
		}
	}

	onDestroy(() => {
		if (clickOutsideListener) {
			document.removeEventListener('click', clickOutsideListener);
		}
	});
</script>

<svelte:window on:resize={checkMobile} />

<div class="relative inline-block" on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
	<button
		bind:this={buttonElement}
		type="button"
		on:click={handleClick}
		class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 hover:bg-gray-500 text-gray-300 hover:text-white transition-colors focus:outline-none active:bg-gray-600"
		aria-label="More information"
	>
		<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
			<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
		</svg>
	</button>

	{#if showTooltip}
		<div
			bind:this={tooltipElement}
			class="absolute z-50 w-64 p-3 text-sm text-gray-200 bg-gray-800 border border-gray-600 rounded-lg shadow-lg
				{position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' : ''}
				{position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' : ''}
				{position === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' : ''}
				{position === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2' : ''}
				sm:w-72"
			role="tooltip"
		>
			<div class="whitespace-normal">{content}</div>
			<!-- Arrow -->
			<div
				class="absolute w-2 h-2 bg-gray-800 border-gray-600 transform rotate-45
					{position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1 border-r border-b' : ''}
					{position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l border-t' : ''}
					{position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1 border-r border-t' : ''}
					{position === 'right' ? 'right-full top-1/2 -translate-y-1/2 -mr-1 border-l border-b' : ''}"
			></div>
		</div>
	{/if}
</div>

