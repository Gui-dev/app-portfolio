import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { resetDatabase } from "@/lib/db/test-helpers";
import { createProfile, deleteUsers } from "../../../tests/e2e/helpers/db";

describe("e2e database fixtures", () => {
	const originalPath = process.env.PATH;
	const emails: string[] = [];

	beforeEach(async () => {
		await resetDatabase();
	});

	afterAll(() => {
		process.env.PATH = originalPath;
	});

	it("should create fixtures without relying on the podman binary", async () => {
		process.env.PATH = "/nonexistent";
		const email = "fixture-no-podman@example.com";
		emails.push(email);

		const fixture = await createProfile({ email, fullName: "Fixture Wayne" });

		const rows = await db.select().from(profiles).where(eq(profiles.slug, fixture.slug));
		expect(rows).toHaveLength(1);
		expect(rows[0]?.fullName).toBe("Fixture Wayne");

		process.env.PATH = originalPath;
		await deleteUsers(emails);
	});
});
