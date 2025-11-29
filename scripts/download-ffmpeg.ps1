# PowerShell script to download FFmpeg.wasm core files for self-hosting
# This ensures the app works even if unpkg.com is unavailable

$VERSION = "0.12.6"
$BASE_URL = "https://unpkg.com/@ffmpeg/core@${VERSION}/dist/esm"
$OUTPUT_DIR = "static/ffmpeg-core"

Write-Host "Downloading FFmpeg.wasm core files (version ${VERSION})..." -ForegroundColor Cyan

# Create output directory
if (-not (Test-Path $OUTPUT_DIR)) {
    New-Item -ItemType Directory -Path $OUTPUT_DIR | Out-Null
}

# Download files
Write-Host "Downloading ffmpeg-core.js..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "${BASE_URL}/ffmpeg-core.js" -OutFile "${OUTPUT_DIR}/ffmpeg-core.js"

Write-Host "Downloading ffmpeg-core.wasm..." -ForegroundColor Yellow
Invoke-WebRequest -Uri "${BASE_URL}/ffmpeg-core.wasm" -OutFile "${OUTPUT_DIR}/ffmpeg-core.wasm"

Write-Host "Downloading ffmpeg-core.worker.js (if exists)..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri "${BASE_URL}/ffmpeg-core.worker.js" -OutFile "${OUTPUT_DIR}/ffmpeg-core.worker.js"
} catch {
    Write-Host "Worker file not found, skipping..." -ForegroundColor Gray
}

Write-Host "✅ FFmpeg.wasm files downloaded successfully!" -ForegroundColor Green
Write-Host "Files are now in ${OUTPUT_DIR}/" -ForegroundColor Green
Write-Host ""
Write-Host "The app will now use these local files instead of CDN." -ForegroundColor Cyan
Write-Host "Make sure to commit these files to your repository." -ForegroundColor Cyan




