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
	// Local state for smooth handle updates during drag
	let localCropX = cropX;
	let localCropY = cropY;
	let localCropWidth = cropWidth;
	let localCropHeight = cropHeight;
	
	// Sync local state from props when not dragging (reactive)
	$: if (!isDragging && !isResizing && (localCropX !== cropX || localCropY !== cropY || localCropWidth !== cropWidth || localCropHeight !== cropHeight)) {
		localCropX = cropX;
		localCropY = cropY;
		localCropWidth = cropWidth;
		localCropHeight = cropHeight;
	}

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

	let currentCursor: string = 'default';
	
	function getCursorStyle(): string {
		if (!cropEnabled) return 'default';
		if (isDragging || isResizing) return 'grabbing';
		return currentCursor;
	}
	
	function handleMouseMoveForCursor(event: MouseEvent) {
		if (!cropEnabled || !videoElement || isDragging || isResizing) {
			currentCursor = 'default';
			return;
		}
		
		const rect = containerElement.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;
		
		const info = getVideoDisplayInfo();
		if (!info) {
			currentCursor = 'default';
			return;
		}
		
		const displayCropX = info.displayX + (cropX / info.scaleX);
		const displayCropY = info.displayY + (cropY / info.scaleY);
		const displayCropWidth = cropWidth / info.scaleX;
		const displayCropHeight = cropHeight / info.scaleY;
		
		// Border inner edge aligns with crop area, hitbox extends inside and outside
		const borderThickness = 4;
		const hitboxSize = 20;
		const borderInnerLeft = displayCropX;
		const borderInnerRight = displayCropX + displayCropWidth;
		const borderInnerTop = displayCropY;
		const borderInnerBottom = displayCropY + displayCropHeight;
		const borderOuterLeft = borderInnerLeft - borderThickness;
		const borderOuterRight = borderInnerRight + borderThickness;
		const borderOuterTop = borderInnerTop - borderThickness;
		const borderOuterBottom = borderInnerBottom + borderThickness;
		
		// Hitbox extends hitboxSize inside and outside the border
		const hitboxLeft = borderOuterLeft - hitboxSize;
		const hitboxRight = borderOuterRight + hitboxSize;
		const hitboxTop = borderOuterTop - hitboxSize;
		const hitboxBottom = borderOuterBottom + hitboxSize;
		
		// Determine cursor based on position relative to border edges
		const cornerHitbox = hitboxSize;
		// Check corners (relative to border inner edges)
		if ((mouseX >= borderInnerLeft - cornerHitbox && mouseX <= borderInnerLeft + cornerHitbox && mouseY >= borderInnerTop - cornerHitbox && mouseY <= borderInnerTop + cornerHitbox) ||
			(mouseX >= borderInnerRight - cornerHitbox && mouseX <= borderInnerRight + cornerHitbox && mouseY >= borderInnerBottom - cornerHitbox && mouseY <= borderInnerBottom + cornerHitbox)) {
			currentCursor = 'nwse-resize';
		} else if ((mouseX >= borderInnerRight - cornerHitbox && mouseX <= borderInnerRight + cornerHitbox && mouseY >= borderInnerTop - cornerHitbox && mouseY <= borderInnerTop + cornerHitbox) ||
			(mouseX >= borderInnerLeft - cornerHitbox && mouseX <= borderInnerLeft + cornerHitbox && mouseY >= borderInnerBottom - cornerHitbox && mouseY <= borderInnerBottom + cornerHitbox)) {
			currentCursor = 'nesw-resize';
		} else if ((mouseY >= borderInnerTop - hitboxSize && mouseY <= borderInnerTop + hitboxSize && mouseX >= borderInnerLeft + cornerHitbox && mouseX <= borderInnerRight - cornerHitbox) ||
			(mouseY >= borderInnerBottom - hitboxSize && mouseY <= borderInnerBottom + hitboxSize && mouseX >= borderInnerLeft + cornerHitbox && mouseX <= borderInnerRight - cornerHitbox)) {
			currentCursor = 'ns-resize';
		} else if ((mouseX >= borderInnerLeft - hitboxSize && mouseX <= borderInnerLeft + hitboxSize && mouseY >= borderInnerTop + cornerHitbox && mouseY <= borderInnerBottom - cornerHitbox) ||
			(mouseX >= borderInnerRight - hitboxSize && mouseX <= borderInnerRight + hitboxSize && mouseY >= borderInnerTop + cornerHitbox && mouseY <= borderInnerBottom - cornerHitbox)) {
			currentCursor = 'ew-resize';
		} else if (mouseX >= borderInnerLeft && mouseX <= borderInnerRight &&
			mouseY >= borderInnerTop && mouseY <= borderInnerBottom) {
			currentCursor = 'move';
		} else {
			currentCursor = 'default';
		}
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
		
		// Border inner edge aligns with crop area, hitbox extends inside and outside
		const borderThickness = 4;
		const hitboxSize = 20;
		const borderInnerLeft = displayCropX;
		const borderInnerRight = displayCropX + displayCropWidth;
		const borderInnerTop = displayCropY;
		const borderInnerBottom = displayCropY + displayCropHeight;
		
		// Hitbox extends hitboxSize inside and outside the border
		const hitboxLeft = borderInnerLeft - borderThickness - hitboxSize;
		const hitboxRight = borderInnerRight + borderThickness + hitboxSize;
		const hitboxTop = borderInnerTop - borderThickness - hitboxSize;
		const hitboxBottom = borderInnerBottom + borderThickness + hitboxSize;
		
		// Check if mouse is within hitbox area
		if (mouseX < hitboxLeft || mouseX > hitboxRight || mouseY < hitboxTop || mouseY > hitboxBottom) {
			return; // Outside hitbox
		}
		
		// Check corners first (they take priority) - relative to border inner edges
		const cornerHitbox = hitboxSize;
		if (mouseX >= borderInnerLeft - cornerHitbox && mouseX <= borderInnerLeft + cornerHitbox && 
			mouseY >= borderInnerTop - cornerHitbox && mouseY <= borderInnerTop + cornerHitbox) {
			// Top-left corner
			isResizing = true;
			resizeHandle = 'nw';
			dragStartX = mouseX;
			dragStartY = mouseY;
			cropStartX = cropX;
			cropStartY = cropY;
			cropStartWidth = cropWidth;
			cropStartHeight = cropHeight;
			event.preventDefault();
			return;
		}
		if (mouseX >= borderInnerRight - cornerHitbox && mouseX <= borderInnerRight + cornerHitbox && 
			mouseY >= borderInnerTop - cornerHitbox && mouseY <= borderInnerTop + cornerHitbox) {
			// Top-right corner
			isResizing = true;
			resizeHandle = 'ne';
			dragStartX = mouseX;
			dragStartY = mouseY;
			cropStartX = cropX;
			cropStartY = cropY;
			cropStartWidth = cropWidth;
			cropStartHeight = cropHeight;
			event.preventDefault();
			return;
		}
		if (mouseX >= borderInnerLeft - cornerHitbox && mouseX <= borderInnerLeft + cornerHitbox && 
			mouseY >= borderInnerBottom - cornerHitbox && mouseY <= borderInnerBottom + cornerHitbox) {
			// Bottom-left corner
			isResizing = true;
			resizeHandle = 'sw';
			dragStartX = mouseX;
			dragStartY = mouseY;
			cropStartX = cropX;
			cropStartY = cropY;
			cropStartWidth = cropWidth;
			cropStartHeight = cropHeight;
			event.preventDefault();
			return;
		}
		if (mouseX >= borderInnerRight - cornerHitbox && mouseX <= borderInnerRight + cornerHitbox && 
			mouseY >= borderInnerBottom - cornerHitbox && mouseY <= borderInnerBottom + cornerHitbox) {
			// Bottom-right corner
			isResizing = true;
			resizeHandle = 'se';
			dragStartX = mouseX;
			dragStartY = mouseY;
			cropStartX = cropX;
			cropStartY = cropY;
			cropStartWidth = cropWidth;
			cropStartHeight = cropHeight;
			event.preventDefault();
			return;
		}
		
		// Check edges (excluding corner areas) - relative to border inner edges
		if (mouseY >= borderInnerTop - hitboxSize && mouseY <= borderInnerTop + hitboxSize && 
			mouseX >= borderInnerLeft + cornerHitbox && mouseX <= borderInnerRight - cornerHitbox) {
			// Top edge
			isResizing = true;
			resizeHandle = 'n';
			dragStartX = mouseX;
			dragStartY = mouseY;
			cropStartX = cropX;
			cropStartY = cropY;
			cropStartWidth = cropWidth;
			cropStartHeight = cropHeight;
			event.preventDefault();
			return;
		}
		if (mouseY >= borderInnerBottom - hitboxSize && mouseY <= borderInnerBottom + hitboxSize && 
			mouseX >= borderInnerLeft + cornerHitbox && mouseX <= borderInnerRight - cornerHitbox) {
			// Bottom edge
			isResizing = true;
			resizeHandle = 's';
			dragStartX = mouseX;
			dragStartY = mouseY;
			cropStartX = cropX;
			cropStartY = cropY;
			cropStartWidth = cropWidth;
			cropStartHeight = cropHeight;
			event.preventDefault();
			return;
		}
		if (mouseX >= borderInnerLeft - hitboxSize && mouseX <= borderInnerLeft + hitboxSize && 
			mouseY >= borderInnerTop + cornerHitbox && mouseY <= borderInnerBottom - cornerHitbox) {
			// Left edge
			isResizing = true;
			resizeHandle = 'w';
			dragStartX = mouseX;
			dragStartY = mouseY;
			cropStartX = cropX;
			cropStartY = cropY;
			cropStartWidth = cropWidth;
			cropStartHeight = cropHeight;
			event.preventDefault();
			return;
		}
		if (mouseX >= borderInnerRight - hitboxSize && mouseX <= borderInnerRight + hitboxSize && 
			mouseY >= borderInnerTop + cornerHitbox && mouseY <= borderInnerBottom - cornerHitbox) {
			// Right edge
			isResizing = true;
			resizeHandle = 'e';
			dragStartX = mouseX;
			dragStartY = mouseY;
			cropStartX = cropX;
			cropStartY = cropY;
			cropStartWidth = cropWidth;
			cropStartHeight = cropHeight;
			event.preventDefault();
			return;
		}
		
		// Check if clicking inside crop area (for dragging)
		if (
			mouseX >= borderInnerLeft &&
			mouseX <= borderInnerRight &&
			mouseY >= borderInnerTop &&
			mouseY <= borderInnerBottom
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
			const constrainedX = Math.max(0, Math.min(info.naturalWidth - localCropWidth, newX));
			const constrainedY = Math.max(0, Math.min(info.naturalHeight - localCropHeight, newY));
			
			// Update local state immediately for smooth rendering (before parent callback)
			localCropX = constrainedX;
			localCropY = constrainedY;
			
			// Call parent callback synchronously - local state already updated for immediate rendering
			onCropChange(constrainedX, constrainedY, localCropWidth, localCropHeight);
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
			
			// Update local state immediately for smooth rendering (before parent callback)
			localCropX = newX;
			localCropY = newY;
			localCropWidth = newWidth;
			localCropHeight = newHeight;
			
			// Call parent callback synchronously - local state already updated for immediate rendering
			onCropChange(newX, newY, newWidth, newHeight);
		}
	}

	function handleMouseUp() {
		isDragging = false;
		isResizing = false;
		resizeHandle = null;
		// Sync local state with props after drag ends
		localCropX = cropX;
		localCropY = cropY;
		localCropWidth = cropWidth;
		localCropHeight = cropHeight;
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
		class="bg-black rounded-lg relative {cropEnabled ? 'overflow-visible' : 'overflow-hidden'}"
		style="cursor: {isDragging || isResizing ? 'grabbing' : currentCursor};"
		on:mousedown={handleMouseDown}
		on:mousemove={handleMouseMoveForCursor}
		role={cropEnabled ? 'application' : undefined}
		aria-label={cropEnabled ? 'Video preview with crop controls' : undefined}
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
				{@const currentCropX = isDragging || isResizing ? localCropX : cropX}
				{@const currentCropY = isDragging || isResizing ? localCropY : cropY}
				{@const currentCropWidth = isDragging || isResizing ? localCropWidth : cropWidth}
				{@const currentCropHeight = isDragging || isResizing ? localCropHeight : cropHeight}
				{@const displayX = info.displayX + (currentCropX / info.scaleX)}
				{@const displayY = info.displayY + (currentCropY / info.scaleY)}
				{@const displayWidth = currentCropWidth / info.scaleX}
				{@const displayHeight = currentCropHeight / info.scaleY}
				
				<!-- Crop rectangle border with large hitbox - border inner edge aligns with crop area -->
				{@const hitboxSize = 20}
				{@const borderThickness = 4}
				<!-- Border inner edge aligns with crop area at displayX, displayY -->
				<!-- Hitbox extends hitboxSize inside and outside the border -->
				<!-- Wrapper div for hitbox area -->
				<div
					class="absolute pointer-events-auto"
					style="left: {displayX - borderThickness - hitboxSize}px; top: {displayY - borderThickness - hitboxSize}px; width: {displayWidth + borderThickness * 2 + hitboxSize * 2}px; height: {displayHeight + borderThickness * 2 + hitboxSize * 2}px; padding: {hitboxSize}px; box-sizing: border-box;"
				>
					<!-- Border div - inner edge aligns with crop area -->
					<div
						class="border-cyan-400 w-full h-full"
						style="border-width: {borderThickness}px; border-style: solid; box-shadow: 0 0 0 {borderThickness}px rgba(0, 0, 0, 0.3), 0 0 0 {borderThickness + 2}px rgba(6, 182, 212, 0.2); border-radius: 4px; box-sizing: border-box;"
					></div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.video-preview {
		position: relative;
	}
</style>

