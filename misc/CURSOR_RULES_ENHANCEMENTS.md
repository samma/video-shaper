# Enhanced Cursor Rules - General Development Patterns

This document contains proven patterns and practices for efficient AI-assisted development. These rules are derived from successful projects and should be adapted to your specific codebase.

---

## 1. External Dependency Handling

When working with large external dependencies (WASM, binaries, CDN resources, large libraries):

**Build Configuration:**
- Exclude from bundling: Add to `optimizeDeps.exclude` in Vite/Webpack config or equivalent
- Prevent bundling issues with large files
- Example: `optimizeDeps: { exclude: ['@large-library/core'] }`

**Testing Strategy:**
- **Unit Tests**: Mock external dependencies for speed and determinism
  - Use `vi.mock()` (Vitest), `jest.mock()` (Jest), or equivalent mocking framework
  - Focus on testing your code logic, not external library behavior
  - Keep tests fast (< 5 seconds)
- **Integration Tests**: Use real dependencies to verify actual behavior
  - Test that external library integration works correctly
  - Verify initialization, configuration, and error handling
  - Test against real APIs/services when possible

**Self-Hosting Strategy:**
- Provide download scripts for all platforms:
  - PowerShell (`*.ps1`) for Windows
  - Bash (`*.sh`) for Linux/Mac
  - Node.js (`*.js`) as universal fallback
- Implement local-first loading with CDN fallback:
  ```typescript
  const localBaseURL = '/static/external-lib';
  const cdnBaseURL = 'https://cdn.example.com/lib';
  
  let baseURL: string;
  try {
    // Check if local files exist
    const response = await fetch(localBaseURL + '/check');
    if (response.ok) {
      baseURL = localBaseURL;
      console.log('[Service] Loading from local files (self-hosted)');
    } else {
      throw new Error('Local files not found');
    }
  } catch (error) {
    baseURL = cdnURL;
    console.log('[Service] Loading from CDN (fallback)');
  }
  ```
- Benefits: Works offline, resilient to CDN outages, better performance, long-term sustainability, privacy

**Version Management:**
- Pin versions in download scripts
- Document update process
- Keep version numbers in one place for easy updates

---

## 2. Test Report Generation

**Test Requirements:**
- Tests execute via single command: `npm test` | `cargo test` | `pytest` | `just test`
- Results written to structured file: `test-results.json` or equivalent
- Human-readable summary: `test-report.md` or `TEST_ANALYSIS.md`
- Tests are deterministic and reproducible
- Each test has clear pass/fail criteria

**Test Report Generation (REQUIRED):**
- Always generate dual-format reports:
  - **JSON format**: Machine-readable, parseable by AI (`test-results.json`)
  - **Markdown format**: Human-readable, quick status check (`test-analysis.md`)
- Chain report generation in test script: `test && generate-report`
- Reports must include:
  - Timestamp
  - Summary (total/passed/failed/skipped/duration)
  - Test details (name, status, duration, error messages)
  - Recommendations (next steps based on results)
- Reports persist to project root for easy access

**Test Script Pattern:**
```json
{
  "scripts": {
    "test": "vitest run && node scripts/generate-test-report.js",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:all": "npm test && npm run test:e2e"
  }
}
```

**Why Chain:**
- Single command does everything
- Reports always generated (no manual step)
- Fails fast if tests fail (report generation skipped)
- Consistent across all environments

---

## 3. Build Verification Pattern

After implementing features or before deployment:

1. **Run build command** - `npm run build` | `cargo build` | `python -m build`
2. **Verify build succeeds** - Check for errors, warnings, or failures
3. **Test production build** - `npm run preview` | `cargo run --release` | serve built artifacts
4. **Run E2E tests against production** - Test actual production build, not dev build
5. **Verify static assets** - Check that all assets load correctly
6. **Check bundle sizes** - Ensure sizes are reasonable and documented

**E2E Configuration Pattern:**
```typescript
// playwright.config.ts or equivalent
webServer: {
  command: 'npm run build && npm run preview',
  port: 4173
}
```

**Why Critical:**
- Dev builds may work but production builds fail
- Production optimizations can break features
- Static assets may not be included correctly
- Bundle sizes can grow unexpectedly

**After Every Major Change:**
- Build must succeed
- Production preview must work
- E2E tests must pass against production build

---

## 4. Incremental Development Pattern

When building new features, follow this strict order:

1. **Module-loading test** (< 1s)
   - Create `tests/unit/module-loading.test.ts` (or equivalent)
   - Verify test infrastructure works
   - Verify basic imports succeed
   - Catch syntax/import errors immediately

2. **Unit test** (< 5s)
   - Write test for individual function/class
   - Test should fail initially (TDD)
   - Focus on one function at a time

3. **Implement feature** (minimal code)
   - Write minimal code to pass test
   - Don't over-engineer
   - Keep it simple

4. **Integration test** (< 30s)
   - Test with real dependencies
   - Verify external integrations work
   - Test error handling

5. **E2E test** (< 2min)
   - Test full user workflow
   - Test in real browser/environment
   - Verify UI interactions work

6. **Run all tests**
   - Verify nothing broke
   - Check test reports
   - Fix any failures before proceeding

**Rules:**
- Never skip steps
- Never proceed with failing tests
- Each step must pass before moving to next
- Run tests after every code change

---

## 5. Cross-Platform Scripts

When providing utility scripts (downloads, setup, etc.):

**Required Formats:**
- **PowerShell** (`*.ps1`) - For Windows users
- **Bash** (`*.sh`) - For Linux/Mac users  
- **Node.js** (`*.js`) - Universal fallback, works everywhere

**Script Organization:**
```
scripts/
├── download-asset.js      # Universal Node.js version
├── download-asset.ps1     # Windows PowerShell version
└── download-asset.sh      # Linux/Mac Bash version
```

**Documentation Requirements:**
- Clear instructions for each platform
- Prerequisites listed (Node.js version, permissions, etc.)
- Example usage for each script
- Troubleshooting section

**Best Practices:**
- Keep scripts simple and focused
- Use consistent naming across platforms
- Handle errors gracefully
- Provide clear output messages
- Make scripts idempotent (safe to run multiple times)

---

## 6. Self-Hosting Strategy

For external dependencies (CDN resources, large libraries):

**Implementation Pattern:**
```typescript
// Service initialization
const localBaseURL = '/static/external-lib';
const cdnBaseURL = 'https://cdn.example.com/lib';

let baseURL: string;
try {
  // Check if local files exist
  const response = await fetch(localBaseURL + '/check');
  if (response.ok) {
    baseURL = localBaseURL;
    console.log('[Service] Loading from local files (self-hosted)');
  } else {
    throw new Error('Local files not found');
  }
} catch (error) {
  baseURL = cdnBaseURL;
  console.log('[Service] Loading from CDN (fallback)');
}
```

**Benefits:**
- ✅ Works offline after initial load
- ✅ Resilient to CDN outages
- ✅ Better performance (same origin, no CORS)
- ✅ Long-term sustainability (independent of external services)
- ✅ Privacy (no external requests)

**Download Scripts:**
- Provide scripts to download assets to `static/` directory (or equivalent)
- Version pinning in scripts
- Clear documentation on how to update versions
- Verification step to ensure downloads succeeded

---

## 7. Module Loading Tests Template

**Required:** Every project must have a module-loading test as the first test.

**Location:** `tests/unit/module-loading.test.ts` (or equivalent for your test framework)

**Template (Vitest/Jest):**
```typescript
import { describe, it, expect } from 'vitest';

describe('Module Loading Tests', () => {
  it('should load without errors', () => {
    // This test verifies that the test file itself loads
    expect(true).toBe(true);
  });

  it('should be able to import test utilities', () => {
    // Verify test framework is available
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
  });

  // Add more basic imports as needed
  it('should be able to import core modules', async () => {
    // Import your main modules to catch syntax errors
    // Example:
    // const { MyService } = await import('$lib/services/MyService');
    // expect(MyService).toBeDefined();
  });
});
```

**Template (Python/pytest):**
```python
import pytest

def test_module_loading():
    """Verify that test infrastructure works."""
    assert True

def test_test_utilities_available():
    """Verify test framework is available."""
    assert pytest is not None
    assert callable(pytest.raises)
```

**Template (Rust):**
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_module_loading() {
        // Verify that test infrastructure works
        assert!(true);
    }
}
```

**Why Critical:**
- Catches syntax errors before feature tests run
- Validates test infrastructure works
- Fastest possible feedback (< 1s)
- Prevents "all tests pass but app won't load" scenarios

---

## 8. Test Script Chaining Pattern

**Test Script Pattern:**
```json
{
  "scripts": {
    "test": "vitest run && node scripts/generate-test-report.js",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:all": "npm test && npm run test:e2e"
  }
}
```

**Alternative Patterns:**

**Python (pytest):**
```json
{
  "scripts": {
    "test": "pytest --json-report --json-report-file=test-results.json && python scripts/generate_test_report.py"
  }
}
```

**Rust (cargo):**
```toml
[package]
[scripts]
test = "cargo test -- --test-threads=1 && cargo run --bin generate-test-report"
```

**Why Chain:**
- Single command does everything
- Reports always generated (no manual step)
- Fails fast if tests fail (report generation skipped)
- Consistent across all environments

---

## 9. Working Together Effectively

### Communication Patterns

**When User Requests Changes:**
1. Understand the requirement fully before coding
2. Ask clarifying questions only when essential
3. Provide validation steps after implementation
4. Explain the "why" behind decisions, not just "what"

**When AI Proposes Changes:**
1. Show minimal diffs, not entire files
2. Reference files by path when possible
3. Provide exact commands to verify changes
4. List potential risks and mitigations
5. Identify follow-up work needed

**Feedback Loop:**
- User provides: requirements, current state, acceptance criteria
- AI provides: implementation, validation steps, risk analysis, follow-up checklist
- Both review: test results, logs, debug dumps

### Session Continuity

**At Start of Session:**
1. Read latest test analysis report
2. Read latest session log (if exists)
3. Read any debug dumps from previous errors
4. Identify current state and any pending issues
5. Continue from where previous session left off

**During Session:**
1. Run tests after every code change
2. Read test output files to verify results
3. Generate debug dumps when uncertain about state
4. Log significant actions and decisions

**At End of Session:**
1. Ensure all tests pass
2. Generate final test report
3. Document any known issues or TODOs
4. Leave project in working state

---

## 10. Test-Driven Development Workflow

**Complete TDD Cycle:**

1. **Red** - Write failing test
   - Start with module-loading test if new module
   - Write unit test for specific behavior
   - Run test → should fail

2. **Green** - Make test pass
   - Write minimal code to pass test
   - Don't over-engineer
   - Run test → should pass

3. **Refactor** - Improve code
   - Clean up implementation
   - Improve readability
   - Run tests → should still pass

4. **Repeat** - Next feature
   - Move to next test
   - Follow same cycle

**Rules:**
- Never write code without a failing test first
- Never skip the refactor step
- Keep tests passing at all times
- One test at a time

---

## 11. Error Handling and Debugging

**When Tests Fail:**
1. Read test output file (`test-results.json`)
2. Identify failing test and error message
3. Generate debug dump if state is unclear
4. Read relevant log files for context
5. Fix issue and re-run tests
6. Add regression test if bug was found

**When Features Break:**
1. Read latest log file
2. Find error timestamp and context
3. Execute debug-dump command
4. Read debug snapshot file
5. Analyze state + logs to identify root cause
6. Implement fix + regression test
7. Verify with tests

**Debug Tools:**
- `get-state` / `getState()` - Export current application state
- `debug-dump` - Comprehensive snapshot (state + logs + metrics + errors)
- `state-diff` - Compare two states to see what changed

**All debug commands return structured format:**
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation completed successfully",
  "error": null
}
```

---

## Summary of Key Principles

### Core Principles
- **Autonomous Verification** - AI can verify without user intervention
- **Structured Output** - Parseable formats (JSON + Markdown)
- **Test Hierarchy** - Module-loading → Unit → Integration → E2E
- **External Dependencies** - Mock for speed, real for verification
- **Self-Hosting** - Long-term sustainability
- **Cross-Platform** - Works everywhere

### Workflow Principles
- **Test First** - Module-loading test before anything else
- **Incremental** - One step at a time, verify each step
- **Continuous** - Run tests after every change
- **Production-Ready** - Test production builds, not just dev builds

### Communication Principles
- **Explicit Contracts** - Clear requirements and acceptance criteria
- **Structured Feedback** - Test results, logs, debug dumps
- **Session Continuity** - Pick up where previous session left off
- **Minimal Diffs** - Show only what changed

---

## Implementation Checklist

When starting a new project, ensure:

- [ ] Module-loading test created (`tests/unit/module-loading.test.ts` or equivalent)
- [ ] Test report generation script created (`scripts/generate-test-report.js` or equivalent)
- [ ] Test script chains report generation (`"test": "framework run && generate-report"`)
- [ ] External dependencies excluded from bundling (if applicable)
- [ ] Mock strategy for unit tests (if external dependencies exist)
- [ ] Integration tests use real dependencies (if external dependencies exist)
- [ ] Self-hosting scripts provided (PowerShell, Bash, Node.js or equivalent)
- [ ] Build verification automated (E2E tests against production build)
- [ ] Cross-platform scripts documented
- [ ] Logging system implemented (if needed)
- [ ] Debug dump system implemented (if needed)

---

**Remember:** These patterns are guidelines. Adapt them to your specific project needs while maintaining the core principles of autonomous verification, persistent feedback, and structured output.
