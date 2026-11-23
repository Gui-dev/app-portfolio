import { describe, expect, it } from "vitest";
import { assertTestDatabaseUrl } from "./test-guard";

describe("assertTestDatabaseUrl", () => {
	it("should pass when active and test URLs point at the same _test database", () => {
		expect(() =>
			assertTestDatabaseUrl(
				"postgres://user:pass@localhost:5432/foliocraft_test",
				"postgres://other:secret@localhost:5432/foliocraft_test",
			),
		).not.toThrow();
	});

	it("should throw when active URL points at foliocraft while test URL is foliocraft_test", () => {
		expect(() =>
			assertTestDatabaseUrl(
				"postgres://u:p@localhost:5432/foliocraft_test",
				"postgres://u:p@localhost:5432/foliocraft",
			),
		).toThrow(/foliocraft_test/);
	});

	it("should throw when active URL is missing", () => {
		expect(() =>
			assertTestDatabaseUrl("postgres://u:p@localhost:5432/foliocraft_test", undefined),
		).toThrow(/active DATABASE_URL is missing/);
	});

	it("should throw when test URL does not end with _test", () => {
		expect(() =>
			assertTestDatabaseUrl(
				"postgres://u:p@localhost:5432/foliocraft",
				"postgres://u:p@localhost:5432/foliocraft",
			),
		).toThrow(/must end with "_test"/);
	});
});
