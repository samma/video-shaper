<script lang="ts">
	import { onMount } from 'svelte';

	export let videoFile: File;
	export let currentTime: number = 0;
	export let duration: number = 0;
	// eslint-disable-next-line no-unused-vars
	export let onTimeUpdate: (time: number) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onDurationLoad: (duration: number) => void = () => {};

	// Crop props
	export let cropEnabled: boolean = false;
	export let cropX: number = 0;
	export let cropY: number = 0;
	export let cropWidth: number = 0;
	export let cropHeight: number = 0;
	export let aspectRatioLocked: boolean = false;
	// These are used internally for calculations but passed from parent
	// eslint-disable-next-line no-unused-vars
	export let videoWidth: number = 0;
	// eslint-disable-next-line no-unused-vars
	export let videoHeight: number = 0;
	// eslint-disable-next-line no-unused-vars
	export let onCropChange: (x: number, y: number, width: number, height: number) => void = () => {};
	// eslint-disable-next-line no-unused-vars
	export let onVideoMetadataLoad: (width: number, height: number) => void = () => {};

	let videoElement: HTMLVideoElement;
	let videoUrl: string;
	let containerElement: HTMLDivElement;
	let isDragging = false;
	let isResizing = false;
	let resizeHandle: string | null = null;
	let dragStartX = 0;
	let dragStartY = 0;
	let cropStartX = 0;
	let cropStartY = 0;
	let cropStartWidth = 0;
	let cropStartHeight = 0;

	function handleKeyPress(event: KeyboardEvent) {
		if (!videoElement) return;

		// Only handle if video is focused or document is focused
		if (event.target instanceof HTMLInputElement) return;

		switch (event.key) {
			case ' ':
				event.preventDefault();
				if (videoElement.paused) {
					videoElement.play();
				} else {
					videoElement.pause();
				}
				break;
			case 'ArrowLeft':
				event.preventDefault();
				videoElement.currentTime = Math.max(0, videoElement.currentTime - 5);
				break;
			case 'ArrowRight':
				event.preventDefault();
				videoElement.currentTime = Math.min(
					videoElement.duration,
					videoElement.currentTime + 5
				);
				break;
		}
	}

	onMount(() => {
		videoUrl = URL.createObjectURL(videoFile);
		window.addEventListener('keydown', handleKeyPress);
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		return () => {
			URL.revokeObjectURL(videoUrl);
			window.removeEventListener('keydown', handleKeyPress);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		};
	});

	function handleLoadedMetadata() {
		if (videoElement) {
			duration = videoElement.duration;
			onDurationLoad(duration);
			// Get video dimensions and notify parent
			const naturalWidth = videoElement.videoWidth;
			const naturalHeight = videoElement.videoHeight;
			onVideoMetadataLoad(naturalWidth, naturalHeight);
			// Initialize crop to full video size if not set
			if (cropEnabled && cropWidth === 0 && cropHeight === 0) {
				onCropChange(0, 0, naturalWidth, naturalHeight);
			}
		}
	}

	// Get video display dimensions and scale factor
	function getVideoDisplayInfo() {
		if (!videoElement || !containerElement) return null;
		const rect = containerElement.getBoundingClientRect();
		const videoRect = videoElement.getBoundingClientRect();
		const naturalWidth = videoElement.videoWidth;
		const naturalHeight = videoElement.videoHeight;
		
		if (naturalWidth === 0 || naturalHeight === 0) return null;
		
		const scaleX = naturalWidth / videoRect.width;
		const scaleY = naturalHeight / videoRect.height;
		
		return {
			displayX: videoRect.left - rect.left,
			displayY: videoRect.top - rect.top,
			displayWidth: videoRect.width,
			displayHeight: videoRect.height,
			naturalWidth,
			naturalHeight,
			scaleX,
			scaleY
		};
	}

	// Convert display coordinates to video coordinates
	function displayToVideo(displayX: number, displayY: number) {
		const info = getVideoDisplayInfo();
		if (!info) return { x: 0, y: 0 };
		
		const videoX = (displayX - info.displayX) * info.scaleX;
		const videoY = (displayY - info.displayY) * info.scaleY;
		
		return {
			x: Math.max(0, Math.min(info.naturalWidth, videoX)),
			y: Math.max(0, Math.min(info.naturalHeight, videoY))
		};
	}

	// Convert video coordinates to display coordinates
	function videoToDisplay(videoX: number, videoY: number) {
		const info = getVideoDisplayInfo();
		if (!info) return { x: 0, y: 0 };
		
		const displayX = info.displayX + (videoX / info.scaleX);
		const displayY = info.displayY + (videoY / info.scaleY);
		
		return { x: displayX, y: displayY };
	}

	function handleMouseDown(event: MouseEvent) {
		if (!cropEnabled || !videoElement) return;
		
		const rect = containerElement.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;
		
		const info = getVideoDisplayInfo();
		if (!info) return;
		
		const displayCropX = info.displayX + (cropX / info.scaleX);
		const displayCropY = info.displayY + (cropY / info.scaleY);
		const displayCropWidth = cropWidth / info.scaleX;
		const displayCropHeight = cropHeight / info.scaleY;
		
		// Check if clicking on a resize handle
		const handleSize = 12;
		const handles = {
			nw: { x: displayCropX, y: displayCropY },
			ne: { x: displayCropX + displayCropWidth, y: displayCropY },
			sw: { x: displayCropX, y: displayCropY + displayCropHeight },
			se: { x: displayCropX + displayCropWidth, y: displayCropY + displayCropHeight },
			n: { x: displayCropX + displayCropWidth / 2, y: displayCropY },
			s: { x: displayCropX + displayCropWidth / 2, y: displayCropY + displayCropHeight },
			w: { x: displayCropX, y: displayCropY + displayCropHeight / 2 },
			e: { x: displayCropX + displayCropWidth, y: displayCropY + displayCropHeight / 2 }
		};
		
		for (const [handle, pos] of Object.entries(handles)) {
			const dist = Math.sqrt(Math.pow(mouseX - pos.x, 2) + Math.pow(mouseY - pos.y, 2));
			if (dist < handleSize) {
				isResizing = true;
				resizeHandle = handle;
				dragStartX = mouseX;
				dragStartY = mouseY;
				cropStartX = cropX;
				cropStartY = cropY;
				cropStartWidth = cropWidth;
				cropStartHeight = cropHeight;
				event.preventDefault();
				return;
			}
		}
		
		// Check if clicking inside crop area (for dragging)
		if (
			mouseX >= displayCropX &&
			mouseX <= displayCropX + displayCropWidth &&
			mouseY >= displayCropY &&
			mouseY <= displayCropY + displayCropHeight
		) {
			isDragging = true;
			dragStartX = mouseX;
			dragStartY = mouseY;
			cropStartX = cropX;
			cropStartY = cropY;
			event.preventDefault();
		}
	}

	function handleMouseMove(event: MouseEvent) {
		if (!cropEnabled || !videoElement) return;
		
		const info = getVideoDisplayInfo();
		if (!info) return;
		
		const rect = containerElement.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;
		const deltaX = mouseX - dragStartX;
		const deltaY = mouseY - dragStartY;
		
		if (isDragging) {
			// Drag the entire crop area
			const newX = cropStartX + deltaX * info.scaleX;
			const newY = cropStartY + deltaY * info.scaleY;
			
			// Constrain to video bounds
			const constrainedX = Math.max(0, Math.min(info.naturalWidth - cropWidth, newX));
			const constrainedY = Math.max(0, Math.min(info.naturalHeight - cropHeight, newY));
			
			onCropChange(constrainedX, constrainedY, cropWidth, cropHeight);
		} else if (isResizing && resizeHandle) {
			// Resize crop area
			let newX = cropStartX;
			let newY = cropStartY;
			let newWidth = cropStartWidth;
			let newHeight = cropStartHeight;
			
			const deltaVideoX = deltaX * info.scaleX;
			const deltaVideoY = deltaY * info.scaleY;
			
			// Handle different resize handles
			if (resizeHandle.includes('n')) {
				newY = cropStartY + deltaVideoY;
				newHeight = cropStartHeight - deltaVideoY;
			}
			if (resizeHandle.includes('s')) {
				newHeight = cropStartHeight + deltaVideoY;
			}
			if (resizeHandle.includes('w')) {
				newX = cropStartX + deltaVideoX;
				newWidth = cropStartWidth - deltaVideoX;
			}
			if (resizeHandle.includes('e')) {
				newWidth = cropStartWidth + deltaVideoX;
			}
			
			// Maintain aspect ratio if locked
			if (aspectRatioLocked && cropStartWidth > 0 && cropStartHeight > 0) {
				const aspectRatio = cropStartWidth / cropStartHeight;
				if (resizeHandle.includes('n') || resizeHandle.includes('s')) {
					newWidth = newHeight * aspectRatio;
					if (resizeHandle.includes('w') || resizeHandle.includes('nw') || resizeHandle.includes('sw')) {
						newX = cropStartX + cropStartWidth - newWidth;
					}
				} else {
					newHeight = newWidth / aspectRatio;
					if (resizeHandle.includes('n') || resizeHandle.includes('nw') || resizeHandle.includes('ne')) {
						newY = cropStartY + cropStartHeight - newHeight;
					}
				}
			}
			
			// Constrain to video bounds and minimum size
			const minSize = 50;
			newWidth = Math.max(minSize, Math.min(info.naturalWidth - newX, newWidth));
			newHeight = Math.max(minSize, Math.min(info.naturalHeight - newY, newHeight));
			
			if (newX < 0) {
				newWidth += newX;
				newX = 0;
			}
			if (newY < 0) {
				newHeight += newY;
				newY = 0;
			}
			if (newX + newWidth > info.naturalWidth) {
				newWidth = info.naturalWidth - newX;
			}
			if (newY + newHeight > info.naturalHeight) {
				newHeight = info.naturalHeight - newY;
			}
			
			onCropChange(newX, newY, newWidth, newHeight);
		}
	}

	function handleMouseUp() {
		isDragging = false;
		isResizing = false;
		resizeHandle = null;
	}

	// Update crop when aspect ratio preset is selected
	$: if (cropEnabled && aspectRatioLocked && cropWidth > 0 && cropHeight > 0) {
		// This will be handled by the parent component
	}

	function handleTimeUpdate() {
		if (videoElement) {
			currentTime = videoElement.currentTime;
			onTimeUpdate(currentTime);
		}
	}

	function handleSeek(time: number) {
		if (videoElement) {
			videoElement.currentTime = time;
		}
	}

	export function seekTo(time: number) {
		handleSeek(time);
	}
</script>

<div class="video-preview">
	<div
		bind:this={containerElement}
		class="bg-black rounded-lg overflow-hidden relative"
		on:mousedown={handleMouseDown}
		role={cropEnabled ? 'application' : undefined}
		aria-label={cropEnabled ? 'Video preview with crop controls' : undefined}
		style="cursor: {cropEnabled && (isDragging || isResizing) ? 'grabbing' : cropEnabled ? 'default' : 'default'};"
	>
		<!-- svelte-ignore a11y-media-has-caption -->
		<video
			bind:this={videoElement}
			src={videoUrl}
			controls
			class="w-full"
			on:loadedmetadata={handleLoadedMetadata}
			on:timeupdate={handleTimeUpdate}
		>
			Your browser does not support video playback.
		</video>

		{#if cropEnabled && cropWidth > 0 && cropHeight > 0}
			{@const info = getVideoDisplayInfo()}
			{#if info}
				{@const displayX = info.displayX + (cropX / info.scaleX)}
				{@const displayY = info.displayY + (cropY / info.scaleY)}
				{@const displayWidth = cropWidth / info.scaleX}
				{@const displayHeight = cropHeight / info.scaleY}
				
				<!-- Crop overlay (darkened area outside crop) -->
				<div
					class="absolute pointer-events-none"
					style="left: {info.displayX}px; top: {info.displayY}px; width: {info.displayWidth}px; height: {info.displayHeight}px;"
				>
					<!-- Top overlay -->
					<div
						class="absolute bg-black bg-opacity-60"
						style="left: 0; top: 0; width: 100%; height: {displayY - info.displayY}px;"
					></div>
					<!-- Bottom overlay -->
					<div
						class="absolute bg-black bg-opacity-60"
						style="left: 0; top: {displayY - info.displayY + displayHeight}px; width: 100%; height: {info.displayHeight - (displayY - info.displayY + displayHeight)}px;"
					></div>
					<!-- Left overlay -->
					<div
						class="absolute bg-black bg-opacity-60"
						style="left: 0; top: {displayY - info.displayY}px; width: {displayX - info.displayX}px; height: {displayHeight}px;"
					></div>
					<!-- Right overlay -->
					<div
						class="absolute bg-black bg-opacity-60"
						style="left: {displayX - info.displayX + displayWidth}px; top: {displayY - info.displayY}px; width: {info.displayWidth - (displayX - info.displayX + displayWidth)}px; height: {displayHeight}px;"
					></div>
				</div>

				<!-- Crop rectangle border -->
				<div
					class="absolute border-2 border-cyan-400 pointer-events-none"
					style="left: {displayX}px; top: {displayY}px; width: {displayWidth}px; height: {displayHeight}px;"
				></div>

				<!-- Resize handles -->
				{#each [
					{ id: 'nw', x: displayX, y: displayY },
					{ id: 'ne', x: displayX + displayWidth, y: displayY },
					{ id: 'sw', x: displayX, y: displayY + displayHeight },
					{ id: 'se', x: displayX + displayWidth, y: displayY + displayHeight },
					{ id: 'n', x: displayX + displayWidth / 2, y: displayY },
					{ id: 's', x: displayX + displayWidth / 2, y: displayY + displayHeight },
					{ id: 'w', x: displayX, y: displayY + displayHeight / 2 },
					{ id: 'e', x: displayX + displayWidth, y: displayY + displayHeight / 2 }
				] as handle}
					<div
						class="absolute w-3 h-3 bg-cyan-400 border-2 border-gray-900 rounded-full cursor-{handle.id}-resize pointer-events-auto"
						style="left: {handle.x - 6}px; top: {handle.y - 6}px;"
					></div>
				{/each}
			{/if}
		{/if}
	</div>
</div>

<style>
	.cursor-nw-resize {
		cursor: nw-resize;
	}
	.cursor-ne-resize {
		cursor: ne-resize;
	}
	.cursor-sw-resize {
		cursor: sw-resize;
	}
	.cursor-se-resize {
		cursor: se-resize;
	}
	.cursor-n-resize {
		cursor: n-resize;
	}
	.cursor-s-resize {
		cursor: s-resize;
	}
	.cursor-w-resize {
		cursor: w-resize;
	}
	.cursor-e-resize {
		cursor: e-resize;
	}
</style>

