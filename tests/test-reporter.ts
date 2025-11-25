import fs from 'fs';
import path from 'path';

export interface TestResult {
	name: string;
	status: 'passed' | 'failed' | 'skipped';
	duration: number;
	error?: string;
}

export interface TestReport {
	timestamp: string;
	summary: {
		total: number;
		passed: number;
		failed: number;
		skipped: number;
		duration: number;
	};
	tests: TestResult[];
}

export function generateTestReport(report: TestReport): void {
	// Generate JSON report
	const jsonPath = path.join(process.cwd(), 'test-results.json');
	fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

	// Generate Markdown report
	const mdPath = path.join(process.cwd(), 'test-analysis.md');
	const markdown = generateMarkdownReport(report);
	fs.writeFileSync(mdPath, markdown);
}

function generateMarkdownReport(report: TestReport): string {
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

	return md;
}
