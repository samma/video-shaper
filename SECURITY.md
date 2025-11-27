# Security Policy

## Supported Versions

We actively support the latest version of Video Shaper. Security updates will be applied to the current version.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Open a private security advisory on GitHub (recommended) or email: samma@samma.no
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Considerations

Video Shaper processes videos entirely in the browser:
- Videos never leave your device
- No server-side processing
- No data is transmitted to external servers (except for loading ffmpeg.wasm on first visit)
- Uses WebAssembly for client-side video processing

### Known Limitations

- Large files (>100MB) may cause browser memory issues
- Processing performance depends on device capabilities
- Browser memory limits may affect very large videos

## Security Best Practices

When using Video Shaper:
- Use modern, up-to-date browsers
- Be aware of browser memory limitations
- Process videos in smaller segments if needed

## Response Time

We aim to respond to security reports within 48 hours and provide updates on the status of the vulnerability.

