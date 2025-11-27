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
	
	// Constants for crop interaction
	const BORDER_THICKNESS = 4;
	const HITBOX_SIZE = 20;
	const MIN_CROP_SIZE = 50;
	
	// Get crop border coordinates in display space
	function getCropBorderCoords() {
		const info = getVideoDisplayInfo();
		if (!info) return null;
		
		const displayCropX = info.displayX + (cropX / info.scaleX);
		const displayCropY = info.displayY + (cropY / info.scaleY);
		const displayCropWidth = cropWidth / info.scaleX;
		const displayCropHeight = cropHeight / info.scaleY;
		
		const borderInnerLeft = displayCropX;
		const borderInnerRight = displayCropX + displayCropWidth;
		const borderInnerTop = displayCropY;
		const borderInnerBottom = displayCropY + displayCropHeight;
		const borderOuterLeft = borderInnerLeft - BORDER_THICKNESS;
		const borderOuterRight = borderInnerRight + BORDER_THICKNESS;
		const borderOuterTop = borderInnerTop - BORDER_THICKNESS;
		const borderOuterBottom = borderInnerBottom + BORDER_THICKNESS;
		
		const hitboxLeft = borderOuterLeft - HITBOX_SIZE;
		const hitboxRight = borderOuterRight + HITBOX_SIZE;
		const hitboxTop = borderOuterTop - HITBOX_SIZE;
		const hitboxBottom = borderOuterBottom + HITBOX_SIZE;
		
		return {
			borderInnerLeft,
			borderInnerRight,
			borderInnerTop,
			borderInnerBottom,
			hitboxLeft,
			hitboxRight,
			hitboxTop,
			hitboxBottom
		};
	}
	
	// Detect which interaction area the mouse is over
	function detectInteractionArea(mouseX: number, mouseY: number): 'corner' | 'edge' | 'inside' | 'outside' | null {
		const coords = getCropBorderCoords();
		if (!coords) return null;
		
		const { borderInnerLeft, borderInnerRight, borderInnerTop, borderInnerBottom } = coords;
		
		// Check if outside hitbox
		if (mouseX < coords.hitboxLeft || mouseX > coords.hitboxRight || 
			mouseY < coords.hitboxTop || mouseY > coords.hitboxBottom) {
			return 'outside';
		}
		
		// Check corners
		const cornerHitbox = HITBOX_SIZE;
		const isTopLeft = mouseX >= borderInnerLeft - cornerHitbox && mouseX <= borderInnerLeft + cornerHitbox &&
			mouseY >= borderInnerTop - cornerHitbox && mouseY <= borderInnerTop + cornerHitbox;
		const isTopRight = mouseX >= borderInnerRight - cornerHitbox && mouseX <= borderInnerRight + cornerHitbox &&
			mouseY >= borderInnerTop - cornerHitbox && mouseY <= borderInnerTop + cornerHitbox;
		const isBottomLeft = mouseX >= borderInnerLeft - cornerHitbox && mouseX <= borderInnerLeft + cornerHitbox &&
			mouseY >= borderInnerBottom - cornerHitbox && mouseY <= borderInnerBottom + cornerHitbox;
		const isBottomRight = mouseX >= borderInnerRight - cornerHitbox && mouseX <= borderInnerRight + cornerHitbox &&
			mouseY >= borderInnerBottom - cornerHitbox && mouseY <= borderInnerBottom + cornerHitbox;
		
		if (isTopLeft || isTopRight || isBottomLeft || isBottomRight) {
			return 'corner';
		}
		
		// Check edges
		const isTopEdge = mouseY >= borderInnerTop - HITBOX_SIZE && mouseY <= borderInnerTop + HITBOX_SIZE &&
			mouseX >= borderInnerLeft + cornerHitbox && mouseX <= borderInnerRight - cornerHitbox;
		const isBottomEdge = mouseY >= borderInnerBottom - HITBOX_SIZE && mouseY <= borderInnerBottom + HITBOX_SIZE &&
			mouseX >= borderInnerLeft + cornerHitbox && mouseX <= borderInnerRight - cornerHitbox;
		const isLeftEdge = mouseX >= borderInnerLeft - HITBOX_SIZE && mouseX <= borderInnerLeft + HITBOX_SIZE &&
			mouseY >= borderInnerTop + cornerHitbox && mouseY <= borderInnerBottom - cornerHitbox;
		const isRightEdge = mouseX >= borderInnerRight - HITBOX_SIZE && mouseX <= borderInnerRight + HITBOX_SIZE &&
			mouseY >= borderInnerTop + cornerHitbox && mouseY <= borderInnerBottom - cornerHitbox;
		
		if (isTopEdge || isBottomEdge || isLeftEdge || isRightEdge) {
			return 'edge';
		}
		
		// Check inside
		if (mouseX >= borderInnerLeft && mouseX <= borderInnerRight &&
			mouseY >= borderInnerTop && mouseY <= borderInnerBottom) {
			return 'inside';
		}
		
		return 'outside';
	}
	
	// Get resize handle based on mouse position
	function getResizeHandle(mouseX: number, mouseY: number): string | null {
		const coords = getCropBorderCoords();
		if (!coords) return null;
		
		const { borderInnerLeft, borderInnerRight, borderInnerTop, borderInnerBottom } = coords;
		const cornerHitbox = HITBOX_SIZE;
		
		// Check corners
		if (mouseX >= borderInnerLeft - cornerHitbox && mouseX <= borderInnerLeft + cornerHitbox &&
			mouseY >= borderInnerTop - cornerHitbox && mouseY <= borderInnerTop + cornerHitbox) {
			return 'nw';
		}
		if (mouseX >= borderInnerRight - cornerHitbox && mouseX <= borderInnerRight + cornerHitbox &&
			mouseY >= borderInnerTop - cornerHitbox && mouseY <= borderInnerTop + cornerHitbox) {
			return 'ne';
		}
		if (mouseX >= borderInnerLeft - cornerHitbox && mouseX <= borderInnerLeft + cornerHitbox &&
			mouseY >= borderInnerBottom - cornerHitbox && mouseY <= borderInnerBottom + cornerHitbox) {
			return 'sw';
		}
		if (mouseX >= borderInnerRight - cornerHitbox && mouseX <= borderInnerRight + cornerHitbox &&
			mouseY >= borderInnerBottom - cornerHitbox && mouseY <= borderInnerBottom + cornerHitbox) {
			return 'se';
		}
		
		// Check edges
		if (mouseY >= borderInnerTop - HITBOX_SIZE && mouseY <= borderInnerTop + HITBOX_SIZE &&
			mouseX >= borderInnerLeft + cornerHitbox && mouseX <= borderInnerRight - cornerHitbox) {
			return 'n';
		}
		if (mouseY >= borderInnerBottom - HITBOX_SIZE && mouseY <= borderInnerBottom + HITBOX_SIZE &&
			mouseX >= borderInnerLeft + cornerHitbox && mouseX <= borderInnerRight - cornerHitbox) {
			return 's';
		}
		if (mouseX >= borderInnerLeft - HITBOX_SIZE && mouseX <= borderInnerLeft + HITBOX_SIZE &&
			mouseY >= borderInnerTop + cornerHitbox && mouseY <= borderInnerBottom - cornerHitbox) {
			return 'w';
		}
		if (mouseX >= borderInnerRight - HITBOX_SIZE && mouseX <= borderInnerRight + HITBOX_SIZE &&
			mouseY >= borderInnerTop + cornerHitbox && mouseY <= borderInnerBottom - cornerHitbox) {
			return 'e';
		}
		
		return null;
	}
	
	// Get cursor style based on interaction area
	function getCursorForArea(area: 'corner' | 'edge' | 'inside' | 'outside' | null, mouseX: number, mouseY: number): string {
		if (!cropEnabled || area === 'outside' || area === null) return 'default';
		if (isDragging || isResizing) return 'grabbing';
		
		if (area === 'corner') {
			const handle = getResizeHandle(mouseX, mouseY);
			if (handle === 'nw' || handle === 'se') return 'nwse-resize';
			if (handle === 'ne' || handle === 'sw') return 'nesw-resize';
		}
		if (area === 'edge') {
			const handle = getResizeHandle(mouseX, mouseY);
			if (handle === 'n' || handle === 's') return 'ns-resize';
			if (handle === 'e' || handle === 'w') return 'ew-resize';
		}
		if (area === 'inside') return 'move';
		
		return 'default';
	}
	
	function handleMouseMoveForCursor(event: MouseEvent) {
		if (!cropEnabled || !videoElement || isDragging || isResizing) {
			currentCursor = 'default';
			return;
		}
		
		const rect = containerElement.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;
		
		const area = detectInteractionArea(mouseX, mouseY);
		currentCursor = getCursorForArea(area, mouseX, mouseY);
	}

	function startResize(handle: string, mouseX: number, mouseY: number) {
		isResizing = true;
		resizeHandle = handle;
		dragStartX = mouseX;
		dragStartY = mouseY;
		cropStartX = cropX;
		cropStartY = cropY;
		cropStartWidth = cropWidth;
		cropStartHeight = cropHeight;
	}
	
	function startDrag(mouseX: number, mouseY: number) {
		isDragging = true;
		dragStartX = mouseX;
		dragStartY = mouseY;
		cropStartX = cropX;
		cropStartY = cropY;
	}
	
	function handleMouseDown(event: MouseEvent) {
		if (!cropEnabled || !videoElement) return;
		
		const rect = containerElement.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;
		
		const area = detectInteractionArea(mouseX, mouseY);
		if (area === 'outside' || area === null) return;
		
		event.preventDefault();
		
		if (area === 'corner' || area === 'edge') {
			const handle = getResizeHandle(mouseX, mouseY);
			if (handle) {
				startResize(handle, mouseX, mouseY);
			}
		} else if (area === 'inside') {
			startDrag(mouseX, mouseY);
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
			newWidth = Math.max(MIN_CROP_SIZE, Math.min(info.naturalWidth - newX, newWidth));
			newHeight = Math.max(MIN_CROP_SIZE, Math.min(info.naturalHeight - newY, newHeight));
			
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
				<!-- Border inner edge aligns with crop area at displayX, displayY -->
				<!-- Hitbox extends hitboxSize inside and outside the border -->
				<!-- Wrapper div for hitbox area -->
				<div
					class="absolute pointer-events-auto"
					style="left: {displayX - BORDER_THICKNESS - HITBOX_SIZE}px; top: {displayY - BORDER_THICKNESS - HITBOX_SIZE}px; width: {displayWidth + BORDER_THICKNESS * 2 + HITBOX_SIZE * 2}px; height: {displayHeight + BORDER_THICKNESS * 2 + HITBOX_SIZE * 2}px; padding: {HITBOX_SIZE}px; box-sizing: border-box;"
				>
					<!-- Border div - inner edge aligns with crop area -->
					<div
						class="border-cyan-400 w-full h-full"
						style="border-width: {BORDER_THICKNESS}px; border-style: solid; box-shadow: 0 0 0 {BORDER_THICKNESS}px rgba(0, 0, 0, 0.3), 0 0 0 {BORDER_THICKNESS + 2}px rgba(6, 182, 212, 0.2); border-radius: 4px; box-sizing: border-box;"
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

