import { defineConfig } from "@playwright/test";

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: false,
	retries: process.env.CI ? 1 : 0,
	use: {
		baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
		trace: "retain-on-failure",
		launchOptions: executablePath ? { executablePath, args: ["--no-sandbox"] } : undefined,
	},
	webServer: {
		command: "pnpm dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
