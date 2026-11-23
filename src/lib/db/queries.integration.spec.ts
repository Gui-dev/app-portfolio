import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/lib/db/client";
import { experiences, profiles, skills, slugHistory, user } from "@/lib/db/schema";
import { resetDatabase } from "@/lib/db/test-helpers";
import {
	getPublicProfileBySlug,
	isSlugAvailable,
	listPublishedProfiles,
	resolveSlugRedirect,
} from "./queries";

async function seedUser(id = crypto.randomUUID()) {
	await db.insert(user).values({
		id,
		name: "Test User",
		email: `${id}@example.com`,
	});
	return id;
}

async function seedProfile(overrides: Partial<typeof profiles.$inferInsert> = {}) {
	const userId = overrides.userId ?? (await seedUser());
	const [profile] = await db
		.insert(profiles)
		.values({
			userId,
			fullName: "Bruce Wayne",
			headline: "Vigilante",
			contactEmail: "bruce@wayne.dev",
			isPublished: false,
			...overrides,
		})
		.returning();
	if (!profile) throw new Error("Failed to seed profile");
	return profile;
}

describe("profile queries", () => {
	beforeEach(async () => {
		await resetDatabase();
	});

	it("should not return a draft by public slug", async () => {
		await seedProfile({ slug: "bruce-wayne", isPublished: false });
		const result = await getPublicProfileBySlug("bruce-wayne");
		expect(result).toBeNull();
	});

	it("should return experiences ordered by sort_order", async () => {
		const profile = await seedProfile({ slug: "bruce-wayne", isPublished: true });
		await db.insert(experiences).values([
			{
				profileId: profile.id,
				kind: "formal",
				role: "Second",
				company: "Wayne",
				period: "2024",
				description: "Desc",
				sortOrder: 1,
			},
			{
				profileId: profile.id,
				kind: "formal",
				role: "First",
				company: "Wayne",
				period: "2023",
				description: "Desc",
				sortOrder: 0,
			},
		]);

		const result = await getPublicProfileBySlug("bruce-wayne");
		expect(result?.experiences.map((experience) => experience.role)).toEqual(["First", "Second"]);
	});

	it("should paginate published profiles by 12", async () => {
		let newestProfileId = "";
		for (let i = 0; i < 13; i += 1) {
			const profile = await seedProfile({
				slug: `profile-${String(i).padStart(2, "0")}`,
				fullName: `Profile ${String(i).padStart(2, "0")}`,
				isPublished: true,
				publishedAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i)),
			});
			if (i === 12) newestProfileId = profile.id;
		}

		await db.insert(skills).values([
			{ profileId: newestProfileId, name: "Third", sortOrder: 2 },
			{ profileId: newestProfileId, name: "First", sortOrder: 0 },
			{ profileId: newestProfileId, name: "Second", sortOrder: 1 },
		]);

		const page1 = await listPublishedProfiles({ page: 1 });
		const page2 = await listPublishedProfiles({ page: 2 });

		expect(page1.items).toHaveLength(12);
		expect(page1.total).toBe(13);
		expect(page2.items).toHaveLength(1);
		expect(page1.items[0]).toMatchObject({
			slug: "profile-12",
			fullName: "Profile 12",
			headline: "Vigilante",
			skills: ["First", "Second", "Third"],
		});
		expect(page2.items[0]?.slug).toBe("profile-00");
	});

	it("should resolve an old slug only when the target is published", async () => {
		const draft = await seedProfile({ slug: "current-draft", isPublished: false });
		await db.insert(slugHistory).values({ profileId: draft.id, slug: "old-draft" });

		const published = await seedProfile({ slug: "current-published", isPublished: true });
		await db.insert(slugHistory).values({ profileId: published.id, slug: "old-published" });

		await expect(resolveSlugRedirect("old-draft")).resolves.toBeNull();
		await expect(resolveSlugRedirect("old-published")).resolves.toBe("current-published");
	});

	it("should consider a slug unavailable when taken by another profile", async () => {
		await seedProfile({ slug: "taken-slug", isPublished: false });
		await expect(isSlugAvailable("taken-slug")).resolves.toBe(false);
	});

	it("should allow the current profile to keep its own slug", async () => {
		const profile = await seedProfile({ slug: "my-slug", isPublished: false });
		await expect(isSlugAvailable("my-slug", { forProfileId: profile.id })).resolves.toBe(true);
	});
});
