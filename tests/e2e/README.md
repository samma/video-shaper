# E2E Tests

End-to-end tests using Playwright.

## Requirements

- Node.js 18.19 or higher
- Playwright browsers installed: `npx playwright install chromium`

## Running Tests

```bash
npm run test:e2e
```

## Test Files

- `trim-workflow.spec.ts` - Tests the complete video trimming workflow
- `error-handling.spec.ts` - Tests error handling scenarios

## Note

These tests require a built and running preview server. The Playwright config automatically starts the preview server before running tests.

