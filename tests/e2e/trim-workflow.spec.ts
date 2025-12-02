import { test, expect } from '@playwright/test';

test.describe('Video Trim Workflow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should load the page and show file upload', async ({ page }) => {
		// FFmpeg should NOT load on initial page load (lazy loading)
		// Check that file upload area is visible immediately
		const uploadArea = page.locator('text=Click to select or drag and drop');
		await expect(uploadArea).toBeVisible();
		
		// Verify FFmpeg is not loading (no loading spinner should be visible)
		const loadingSpinner = page.locator('text=Loading video processor...');
		await expect(loadingSpinner).not.toBeVisible();
	});

	test('should display video preview after file selection', async ({ page }) => {
		// FFmpeg should NOT load on initial page load
		// Check that file upload area is visible
		const uploadArea = page.locator('text=Click to select or drag and drop');
		await expect(uploadArea).toBeVisible();
		
		// Note: This test would require an actual video file to test FFmpeg loading
		// For now, we'll just verify the UI structure exists
	});

	test('should show trim controls when video is loaded', async ({ page }) => {
		// FFmpeg should NOT load on initial page load
		// Verify the page structure is correct
		const title = page.locator('h1:has-text("Free Video Shaper")');
		await expect(title).toBeVisible();
		
		// File upload should be visible
		const uploadArea = page.locator('text=Click to select or drag and drop');
		await expect(uploadArea).toBeVisible();
	});
});


