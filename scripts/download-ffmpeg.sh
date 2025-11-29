#!/bin/bash
# Script to download FFmpeg.wasm core files for self-hosting
# This ensures the app works even if unpkg.com is unavailable

set -e

VERSION="0.12.6"
BASE_URL="https://unpkg.com/@ffmpeg/core@${VERSION}/dist/esm"
OUTPUT_DIR="static/ffmpeg-core"

echo "Downloading FFmpeg.wasm core files (version ${VERSION})..."

# Create output directory
mkdir -p "${OUTPUT_DIR}"

# Download files
echo "Downloading ffmpeg-core.js..."
curl -L "${BASE_URL}/ffmpeg-core.js" -o "${OUTPUT_DIR}/ffmpeg-core.js"

echo "Downloading ffmpeg-core.wasm..."
curl -L "${BASE_URL}/ffmpeg-core.wasm" -o "${OUTPUT_DIR}/ffmpeg-core.wasm"

echo "Downloading ffmpeg-core.worker.js (if exists)..."
curl -L "${BASE_URL}/ffmpeg-core.worker.js" -o "${OUTPUT_DIR}/ffmpeg-core.worker.js" || echo "Worker file not found, skipping..."

echo "✅ FFmpeg.wasm files downloaded successfully!"
echo "Files are now in ${OUTPUT_DIR}/"
echo ""
echo "The app will now use these local files instead of CDN."
echo "Make sure to commit these files to your repository."




