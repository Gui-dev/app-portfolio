import { spawnSync } from "node:child_process";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import { db } from "@/lib/db/client";

function testUrl(): string {
	const url = process.env.DATABASE_TEST_URL;
	if (!url) {
		throw new Error("DATABASE_TEST_URL is required for integration tests.");
	}
	const parsed = new URL(url);
	const dbName = parsed.pathname.slice(1);
	if (!dbName.endsWith("_test")) {
		throw new Error(
			`Refusing to use database "${dbName}": test database name must end with "_test".`,
		);
	}
	return url;
}

export async function ensureTestDatabase(): Promise<void> {
	const url = testUrl();
	const parsed = new URL(url);
	const dbName = parsed.pathname.slice(1);
	const adminUrl = new URL(url);
	adminUrl.pathname = "/postgres";

	const admin = postgres(adminUrl.toString(), { max: 1 });
	try {
		const rows = await admin<{ exists: boolean }[]>`
			SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = ${dbName}) AS exists
		`;
		if (!rows[0]?.exists) {
			await admin.unsafe(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
		}
	} finally {
		await admin.end();
	}
}

export async function migrateTestDatabase(): Promise<void> {
	const url = testUrl();
	const result = spawnSync("pnpm", ["exec", "drizzle-kit", "migrate"], {
		cwd: process.cwd(),
		env: { ...process.env, DATABASE_URL: url },
		encoding: "utf8",
	});
	if (result.status !== 0) {
		throw new Error(
			`drizzle-kit migrate failed (status ${String(result.status)}):\n${result.stdout}\n${result.stderr}`,
		);
	}
}

export async function resetDatabase(): Promise<void> {
	testUrl();
	await db.execute(
		sql`TRUNCATE TABLE "slug_history", "skills", "projects", "experiences", "profiles", "session", "account", "verification", "user" RESTART IDENTITY CASCADE`,
	);
}
