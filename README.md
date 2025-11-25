# Video Shaper

A client-side video editor that runs entirely in your browser. Trim videos without uploading them to any server.

## Features

- **100% Client-Side Processing** - Videos never leave your computer
- **No Server Costs** - All processing happens in your browser using ffmpeg.wasm
- **Simple Interface** - Easy-to-use trim controls with video preview
- **Keyboard Shortcuts** - Space to play/pause, arrow keys to seek

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

## License

MIT


