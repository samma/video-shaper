# Self-Hosting Guide

This guide explains how to make Video Shaper completely self-contained and independent of external CDNs.

## Current External Dependencies

1. **FFmpeg.wasm** - Currently loaded from `unpkg.com` CDN (~31MB)
2. **GoatCounter Analytics** - Loaded from external CDN (non-critical, already non-blocking)

## Making FFmpeg.wasm Self-Hosted

### Step 1: Download FFmpeg Core Files

**On Windows (PowerShell):**
```powershell
.\scripts\download-ffmpeg.ps1
```

**On Linux/Mac (Bash):**
```bash
chmod +x scripts/download-ffmpeg.sh
./scripts/download-ffmpeg.sh
```

This will download the FFmpeg.wasm core files to `static/ffmpeg-core/`:
- `ffmpeg-core.js` (~2MB)
- `ffmpeg-core.wasm` (~29MB)

### Step 2: Commit Files to Repository

```bash
git add static/ffmpeg-core/
git commit -m "Add self-hosted FFmpeg.wasm core files"
git push
```

### Step 3: Verify Self-Hosting

After deployment, the app will:
1. **First try** to load FFmpeg from `/ffmpeg-core/` (local files)
2. **Fallback** to `unpkg.com` CDN if local files are not found

You can verify this by:
1. Checking browser console - should see `[FFmpeg] Loading from local files (self-hosted)`
2. Disabling internet and testing - app should still work

## Benefits of Self-Hosting

✅ **Reliability** - App works even if unpkg.com is down  
✅ **Performance** - Files served from your own domain (faster, same origin)  
✅ **Privacy** - No external CDN requests  
✅ **Longevity** - App will work indefinitely, independent of external services  
✅ **Offline Capability** - Can work offline after initial load  

## File Sizes

The FFmpeg.wasm files add ~31MB to your repository:
- `ffmpeg-core.js` - ~2MB
- `ffmpeg-core.wasm` - ~29MB

**Note:** These are binary files, so Git LFS is recommended for large repositories, but not required for smaller projects.

## Updating FFmpeg Version

To update to a newer version of FFmpeg.wasm:

1. Update the version in `scripts/download-ffmpeg.js`, `scripts/download-ffmpeg.sh`, or `scripts/download-ffmpeg.ps1`
2. Update the version in `src/lib/ffmpeg/FFmpegService.ts` (line 120)
3. Run the download script again: `npm run download-ffmpeg`
4. Test thoroughly
5. Commit and deploy

## GoatCounter Analytics

GoatCounter is already non-blocking (async script). If it fails to load, the app continues to work normally. The script includes error handling to prevent any issues.

To completely remove analytics:
1. Remove the `<script>` tag from `src/app.html`
2. Remove GoatCounter references from the disclaimer in `src/routes/+page.svelte`

## Complete Independence Checklist

- [x] FFmpeg.wasm can be self-hosted (with CDN fallback)
- [x] GoatCounter is non-blocking and fails gracefully
- [x] All other dependencies are bundled in the build
- [x] Static site - no server dependencies
- [x] Works offline after initial load

## Troubleshooting

### FFmpeg Still Loading from CDN

- Check that files exist in `static/ffmpeg-core/`
- Verify files are committed to repository
- Check build output includes the files
- Clear browser cache

### Build Size Too Large

The FFmpeg files (~31MB) are served separately, not bundled. They're loaded on-demand, so they don't affect initial page load time.

### CDN Fallback Not Working

If local files fail and CDN is also unavailable, the app will show an error message. This is expected behavior - the app cannot function without FFmpeg.wasm.




