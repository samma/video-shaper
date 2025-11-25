# Deployment Guide - Digital Ocean App Platform

This guide walks you through deploying Video Shaper to Digital Ocean App Platform.

## Prerequisites

- Digital Ocean account
- GitHub repository with your code
- Node.js 18.x or higher (for local testing)

## Step 1: Prepare Your Repository

Ensure your repository has:
- ✅ `package.json` with build scripts
- ✅ `svelte.config.js` configured for static adapter
- ✅ `build/` directory generated (run `npm run build` locally to verify)

## Step 2: Create App on Digital Ocean

1. Log in to [Digital Ocean](https://cloud.digitalocean.com)
2. Navigate to **Apps** → **Create App**
3. Connect your GitHub repository
4. Select the repository and branch (usually `main`)

## Step 3: Configure Build Settings

Digital Ocean will auto-detect SvelteKit, but verify these settings:

### Build Settings:
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Node Version:** 18.x or higher

### Environment Variables:
None required for basic deployment.

### Run Command:
Leave empty (static site, no server needed)

## Step 4: Review and Deploy

1. Review your app configuration
2. Click **Create Resources**
3. Wait for deployment to complete (~2-5 minutes)

## Step 5: Verify Deployment

1. Visit your app URL (provided by Digital Ocean)
2. Verify FFmpeg loads successfully
3. Test video upload and trimming

## Step 6: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic, ~5 minutes)

## Troubleshooting

### Build Fails
- Check Node.js version (must be 18.x+)
- Verify `npm run build` works locally
- Check build logs in Digital Ocean dashboard

### App Doesn't Load
- Verify output directory is `build`
- Check that `index.html` exists in build output
- Review runtime logs in Digital Ocean dashboard

### FFmpeg Doesn't Load
- Check browser console for errors
- Verify CDN access (unpkg.com) is not blocked
- Check network requests in browser dev tools

## Continuous Deployment

Digital Ocean automatically deploys on every push to your main branch. To disable:

1. Go to **Settings** → **App-Level Settings**
2. Toggle **Auto Deploy** off

## Cost Estimate

- **Free Tier:** $0/month (with usage limits)
- **Basic Plan:** ~$5/month (recommended for production)
- **Bandwidth:** Included (only serves static files, ~50MB per user first visit)

## Support

For issues specific to:
- **Digital Ocean:** [Digital Ocean Support](https://www.digitalocean.com/support)
- **SvelteKit:** [SvelteKit Docs](https://kit.svelte.dev)
- **ffmpeg.wasm:** [ffmpeg.wasm GitHub](https://github.com/ffmpegwasm/ffmpeg.wasm)


