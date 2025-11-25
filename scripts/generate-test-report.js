import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Read Vitest JSON output
const jsonPath = path.join(rootDir, 'test-results.json');

if (!fs.existsSync(jsonPath)) {
	console.log('No test results found. Tests may not have run yet.');
	process.exit(0);
}

const vitestResults = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Transform to our format
const report = {
	timestamp: new Date().toISOString(),
	summary: {
		total: vitestResults.numTotalTests || 0,
		passed: vitestResults.numPassedTests || 0,
		failed: vitestResults.numFailedTests || 0,
		skipped: vitestResults.numPendingTests || 0,
		duration:
			vitestResults.testResults?.reduce((sum, r) => sum + (r.perfStats?.runtime || 0), 0) || 0
	},
	tests: []
};

// Extract test details
if (vitestResults.testResults) {
	vitestResults.testResults.forEach((fileResult) => {
		if (fileResult.assertionResults) {
			fileResult.assertionResults.forEach((test) => {
				report.tests.push({
					name: `${fileResult.name} > ${test.fullName || test.title}`,
					status:
						test.status === 'passed' ? 'passed' : test.status === 'failed' ? 'failed' : 'skipped',
					duration: test.duration || 0,
					error: test.failureMessages?.join('\n')
				});
			});
		}
	});
}

// Generate Markdown report
const { summary } = report;
const status = summary.failed === 0 ? '✅ PASSED' : '❌ FAILED';

let md = `# Test Analysis Report\n\n`;
md += `**Status:** ${status}\n`;
md += `**Timestamp:** ${report.timestamp}\n\n`;
md += `## Summary\n\n`;
md += `- **Total Tests:** ${summary.total}\n`;
md += `- **Passed:** ${summary.passed}\n`;
md += `- **Failed:** ${summary.failed}\n`;
md += `- **Skipped:** ${summary.skipped}\n`;
md += `- **Duration:** ${(summary.duration / 1000).toFixed(2)}s\n\n`;

if (summary.failed > 0) {
	md += `## Failed Tests\n\n`;
	const failed = report.tests.filter((t) => t.status === 'failed');
	failed.forEach((test) => {
		md += `### ${test.name}\n\n`;
		md += `\`\`\`\n${test.error || 'Unknown error'}\n\`\`\`\n\n`;
	});
}

if (summary.passed > 0) {
	md += `## Passed Tests\n\n`;
	const passed = report.tests.filter((t) => t.status === 'passed');
	passed.forEach((test) => {
		md += `- ${test.name} (${test.duration}ms)\n`;
	});
	md += `\n`;
}

md += `## Recommendations\n\n`;
if (summary.failed > 0) {
	md += `- Fix ${summary.failed} failing test(s) before proceeding\n`;
} else {
	md += `- All tests passing! Safe to proceed to next stage.\n`;
}

// Write markdown report
const mdPath = path.join(rootDir, 'test-analysis.md');
fs.writeFileSync(mdPath, md);

console.log(`\n📊 Test reports generated:`);
console.log(`   - test-results.json`);
console.log(`   - test-analysis.md`);
console.log(`\n${status}\n`);
