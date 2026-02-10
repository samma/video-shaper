# Video Shaper

A client-side video editor that runs entirely in your browser. Trim, crop, compress, convert formats, scale resolution, and adjust audio - all without uploading videos to any server.

## Features

- **100% Client-Side Processing** - Videos never leave your computer
- **No Server Costs** - All processing happens in your browser using ffmpeg.wasm
- **Trim Videos** - Select specific time ranges with an intuitive timeline slider
- **Crop Videos** - Adjust frame dimensions and aspect ratio with visual crop controls
- **Compress Videos** - Reduce file size with adjustable quality settings
- **Convert Formats** - Convert videos between MP4, MOV, AVI, MKV, and FLV formats
- **Scale Resolution** - Reduce or increase video resolution while maintaining aspect ratio
- **Adjust Audio** - Change audio volume levels (0-200%)
- **Simple Interface** - Easy-to-use controls with video preview
- **Privacy-First** - No uploads, no transfers, complete privacy
- **Consent-Based Error Reporting** - If processing fails, users see the exact data before choosing to send an anonymous report

## Tech Stack

- **SvelteKit** - Modern web framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **ffmpeg.wasm** - Client-side video processing
- **Vitest** - Unit/integration testing
- **Playwright** - E2E testing

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run E2E tests (requires Node.js 18.19+)
npm run test:e2e

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Digital Ocean App Platform

1. Connect your GitHub repository to Digital Ocean App Platform
2. Configure build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Node Version:** 18.x or higher
3. Deploy!

The app will automatically deploy on every push to your main branch.

### Manual Deployment

1. Build the app: `npm run build`
2. Upload the contents of the `build/` directory to your static hosting service
3. Ensure your server serves `index.html` for all routes (SPA routing)

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with WebAssembly support

## Limitations

- Large files (>500MB) may cause memory issues
- Processing is slower than native ffmpeg (3-5x)
- Initial load downloads ~31MB (ffmpeg.wasm)

## Analytics & Error Reporting

Video Shaper uses [GoatCounter](https://www.goatcounter.com/), a privacy-friendly analytics service. GoatCounter does not use cookies, does not track personal data, and does not create user identifiers.

**Success events** are sent automatically as a simple count (`video-process-success`) with no metadata about the video, features, or user.

**Error reports** require explicit user consent. When processing fails, users are shown the exact data that would be sent and must click a button to approve it. Error reports include only:
- Error category (e.g. `memory`, `filesystem`, `abort`, `unknown`)
- Features enabled (e.g. `compress+trim`)
- Video format (e.g. `mp4`)
- File size bucket (e.g. `50-100MB`)
- Duration bucket (e.g. `1-3min`)
- Browser family (e.g. `Chrome`)
- OS family (e.g. `Windows`)

No filenames, exact file sizes, video content, or personal information is ever collected. The implementation is in `src/lib/utils/error-analytics.ts`.

## License

Video Shaper is free software licensed under the **GNU General Public License v3.0 or later** (GPL-3.0-or-later).

You are free to use, modify, and distribute this software under the terms of the GPL. See the [LICENSE](LICENSE) file for details.

This project uses FFmpeg (via ffmpeg.wasm) which is also licensed under GPL/LGPL. See the [LICENSES](LICENSES/) folder for third-party license texts.

## Contact

For questions, security issues, or contributions, please contact samma@samma.no or open an issue on GitHub.


