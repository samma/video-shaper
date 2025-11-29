#!/usr/bin/env node
/**
 * Cross-platform script to download FFmpeg.wasm core files for self-hosting
 * This ensures the app works even if unpkg.com is unavailable
 */

import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const VERSION = '0.12.6';
const BASE_URL = `https://unpkg.com/@ffmpeg/core@${VERSION}/dist/esm`;
const OUTPUT_DIR = 'static/ffmpeg-core';

const files = [
	{ name: 'ffmpeg-core.js', type: 'text/javascript' },
	{ name: 'ffmpeg-core.wasm', type: 'application/wasm' },
	{ name: 'ffmpeg-core.worker.js', type: 'text/javascript', optional: true }
];

async function downloadFile(url, outputPath) {
	const response = await fetch(url);
	if (!response.ok) {
		if (response.status === 404) {
			return false; // File doesn't exist
		}
		throw new Error(`Failed to download ${url}: ${response.statusText}`);
	}
	
	const fileStream = createWriteStream(outputPath);
	const reader = response.body.getReader();
	
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		fileStream.write(Buffer.from(value));
	}
	
	fileStream.end();
	return true;
}

async function main() {
	console.log(`Downloading FFmpeg.wasm core files (version ${VERSION})...\n`);

	// Create output directory
	await mkdir(OUTPUT_DIR, { recursive: true });

	for (const file of files) {
		const url = `${BASE_URL}/${file.name}`;
		const outputPath = `${OUTPUT_DIR}/${file.name}`;
		
		try {
			console.log(`Downloading ${file.name}...`);
			const success = await downloadFile(url, outputPath);
			
			if (success) {
				console.log(`✅ ${file.name} downloaded successfully\n`);
			} else if (file.optional) {
				console.log(`⚠️  ${file.name} not found (optional, skipping)\n`);
			} else {
				throw new Error(`${file.name} not found and is required`);
			}
		} catch (error) {
			if (file.optional) {
				console.log(`⚠️  Failed to download ${file.name} (optional, skipping): ${error.message}\n`);
			} else {
				console.error(`❌ Failed to download ${file.name}: ${error.message}`);
				process.exit(1);
			}
		}
	}

	console.log('✅ FFmpeg.wasm files downloaded successfully!');
	console.log(`Files are now in ${OUTPUT_DIR}/\n`);
	console.log('The app will now use these local files instead of CDN.');
	console.log('Make sure to commit these files to your repository.');
}

main().catch(error => {
	console.error('Error:', error);
	process.exit(1);
});




