import { describe, expect, it } from "vitest";
import { parseEnv } from "./env-schema";

const validEnv = {
	DATABASE_URL: "postgresql://foliocraft:foliocraft@localhost:5432/foliocraft",
	DATABASE_TEST_URL: "postgresql://foliocraft:foliocraft@localhost:5432/foliocraft_test",
	BETTER_AUTH_SECRET: "0123456789abcdef0123456789abcdef",
	BETTER_AUTH_URL: "http://localhost:3000",
	SMTP_HOST: "localhost",
	SMTP_FROM: "FolioCraft <no-reply@foliocraft.local>",
	NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

describe("envSchema", () => {
	it("should reject a missing DATABASE_URL", () => {
		const { DATABASE_URL: _missing, ...withoutDatabaseUrl } = validEnv;

		expect(() => parseEnv(withoutDatabaseUrl)).toThrow(
			expect.objectContaining({ name: "ZodError" }),
		);
	});

	it("should default SMTP_PORT to 1025", () => {
		const parsed = parseEnv(validEnv);

		expect(parsed.SMTP_PORT).toBe(1025);
	});
});
