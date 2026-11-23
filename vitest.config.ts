import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
	},
	test: {
		// Vitest 5 only allows passWithNoTests at the root level; it is here so
		// the integration project (empty until the database task lands) is
		// tolerated.
		passWithNoTests: true,
		projects: [
			{
				test: {
					name: "unit",
					environment: "node",
					include: ["src/**/*.spec.ts"],
					exclude: ["**/node_modules/**", "src/**/*.integration.spec.ts"],
					setupFiles: ["./vitest.setup.ts"],
				},
			},
			{
				plugins: [react()],
				test: {
					name: "dom",
					environment: "jsdom",
					include: ["src/**/*.spec.tsx"],
					setupFiles: ["./vitest.setup.ts"],
				},
			},
			{
				test: {
					name: "integration",
					environment: "node",
					include: ["src/**/*.integration.spec.ts"],
					setupFiles: ["./vitest.integration.setup.ts"],
					fileParallelism: false,
				},
			},
		],
	},
});
