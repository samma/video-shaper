// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
	testDir: 'tests/e2e',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	use: {
		baseURL: 'http://localhost:4173'
	}
});
