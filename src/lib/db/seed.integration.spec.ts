import { verifyPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import {
	account,
	experiences,
	profiles,
	projects,
	skills,
	slugHistory,
	user,
} from "@/lib/db/schema";
import { resetDatabase } from "@/lib/db/test-helpers";
import { seedDemoData } from "../../../scripts/seed";

const DEMO_PASSWORD = "foliocraft-demo";

async function snapshot() {
	const [users, accounts, allProfiles, allExperiences, allProjects, allSkills, history] =
		await Promise.all([
			db.select().from(user).orderBy(user.email),
			db.select().from(account).orderBy(account.userId),
			db.select().from(profiles).orderBy(profiles.slug),
			db.select().from(experiences).orderBy(experiences.sortOrder),
			db.select().from(projects).orderBy(projects.sortOrder),
			db.select().from(skills).orderBy(skills.sortOrder),
			db.select().from(slugHistory),
		]);
	return {
		userIds: users.map((row) => row.id),
		userEmails: users.map((row) => row.email),
		accountIds: accounts.map((row) => row.id),
		profileIds: allProfiles.map((row) => row.id),
		slugs: allProfiles.map((row) => row.slug),
		experienceEntries: allExperiences.map((row) => [row.role, row.company, row.sortOrder]),
		projectEntries: allProjects.map((row) => [row.name, row.tags.join(","), row.sortOrder]),
		skillNames: allSkills.map((row) => row.name),
		childCounts: [allExperiences.length, allProjects.length, allSkills.length],
		historyIds: history.map((row) => row.id),
	};
}

describe("seedDemoData", () => {
	beforeEach(async () => {
		await resetDatabase();
	});

	it("should create verified demo users with usable credential hashes", async () => {
		await seedDemoData();

		const users = await db.select().from(user).orderBy(user.email);
		expect(users.map((row) => row.email)).toEqual(["bruce@wayne.dev", "clark@wayne.dev"]);
		expect(users.every((row) => row.emailVerified)).toBe(true);

		const accounts = await db.select().from(account).orderBy(account.userId);
		expect(accounts).toHaveLength(2);
		expect(accounts.every((row) => row.providerId === "credential")).toBe(true);
		for (const row of accounts) {
			expect(row.password).toBeTruthy();
			expect(row.password).not.toBe(DEMO_PASSWORD);
			expect(await verifyPassword({ hash: row.password ?? "", password: DEMO_PASSWORD })).toBe(
				true,
			);
		}
	});

	it("should create a published Bruce profile and a Clark draft with pt-BR content", async () => {
		await seedDemoData();

		const allProfiles = await db.select().from(profiles).orderBy(profiles.slug);
		expect(allProfiles.map((row) => row.slug)).toEqual(["bruce-wayne", "clark-kent"]);
		const [bruce, clark] = allProfiles;
		expect(bruce?.isPublished).toBe(true);
		expect(bruce?.publishedAt?.getTime()).toBeLessThanOrEqual(Date.now());
		expect(bruce?.fullName).toBe("Bruce Wayne");
		expect(bruce?.location).toBe("Gotham City • Remoto");
		expect(bruce?.contactEmail).toBe("bruce@wayne.dev");
		expect(bruce?.template).toBe("modern");
		expect(bruce?.colorMode).toBe("dark");
		expect(bruce?.monogramStyle).toBe("gradient");
		expect(bruce?.githubUrl).toContain("github.com");
		expect(bruce?.linkedinUrl).toContain("linkedin.com");
		expect(bruce?.headline).toMatch(/CEO|Filantropo/);
		expect(bruce?.bio).toMatch(/[áéíóúâêôãõç]/);
		expect(clark?.isPublished).toBe(false);
		expect(clark?.publishedAt).toBeNull();

		const bruceExperiences = await db
			.select()
			.from(experiences)
			.where(eq(experiences.profileId, bruce?.id ?? ""));
		expect(bruceExperiences).toHaveLength(2);
		const bruceProjects = await db
			.select()
			.from(projects)
			.where(eq(projects.profileId, bruce?.id ?? ""));
		expect(bruceProjects).toHaveLength(2);
		expect(bruceProjects.every((row) => row.tags.length > 0)).toBe(true);
		const bruceSkills = await db
			.select()
			.from(skills)
			.where(eq(skills.profileId, bruce?.id ?? ""));
		expect(bruceSkills.length).toBeGreaterThanOrEqual(3);
		expect(bruceSkills.map((row) => row.name)).toEqual(
			expect.arrayContaining(["Estratégia", "Segurança", "Next.js"]),
		);
	});

	it("should be idempotent when run twice", async () => {
		await seedDemoData();
		const first = await snapshot();

		await seedDemoData();
		const second = await snapshot();

		expect(second).toEqual(first);
	});

	it("should refuse to overwrite a demo slug owned by another user", async () => {
		const ownerId = crypto.randomUUID();
		await db.insert(user).values({
			id: ownerId,
			name: "Other Owner",
			email: "other-owner@example.com",
		});
		await db.insert(profiles).values({
			userId: ownerId,
			slug: "bruce-wayne",
			fullName: "Other Owner",
			contactEmail: "other-owner@example.com",
		});

		await expect(seedDemoData()).rejects.toThrow(/bruce-wayne/);
	});

	it("should refuse to seed a slug escrowed in history by another profile", async () => {
		const ownerId = crypto.randomUUID();
		await db.insert(user).values({
			id: ownerId,
			name: "History Owner",
			email: "history-owner@example.com",
		});
		const [ownerProfile] = await db
			.insert(profiles)
			.values({
				userId: ownerId,
				slug: "history-owner",
				fullName: "History Owner",
				contactEmail: "history-owner@example.com",
			})
			.returning();
		await db.insert(slugHistory).values({
			profileId: ownerProfile?.id ?? "",
			slug: "bruce-wayne",
		});

		await expect(seedDemoData()).rejects.toThrow(/bruce-wayne/);
	});
});
