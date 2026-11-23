/**
 * Pure guard for integration test database safety. No imports from @/lib/env,
 * @/lib/db/client, or next.
 */
export function assertTestDatabaseUrl(testUrl: string, activeUrl: string | undefined): void {
	if (!activeUrl) {
		throw new Error("Refusing to reset database: active DATABASE_URL is missing.");
	}

	let active: URL;
	let test: URL;
	try {
		active = new URL(activeUrl);
	} catch {
		throw new Error("Refusing to reset database: active DATABASE_URL is not a valid URL.");
	}
	try {
		test = new URL(testUrl);
	} catch {
		throw new Error("Refusing to reset database: DATABASE_TEST_URL is not a valid URL.");
	}

	const testDbName = test.pathname.slice(1);
	if (!testDbName.endsWith("_test")) {
		throw new Error(
			`Refusing to reset database: test database name "${testDbName}" must end with "_test".`,
		);
	}

	const activeDbName = active.pathname.slice(1);
	const sameHost = active.hostname === test.hostname;
	const samePort = (active.port || "5432") === (test.port || "5432");
	const sameDb = activeDbName === testDbName;
	if (!sameHost || !samePort || !sameDb) {
		throw new Error(
			`Refusing to reset database: active DATABASE_URL points to "${active.hostname}:${active.port || "5432"}/${activeDbName}", but DATABASE_TEST_URL points to "${test.hostname}:${test.port || "5432"}/${testDbName}".`,
		);
	}
}
