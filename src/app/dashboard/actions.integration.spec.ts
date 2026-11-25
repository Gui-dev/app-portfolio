import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db/client";
import { profiles, slugHistory, user } from "@/lib/db/schema";
import { resetDatabase } from "@/lib/db/test-helpers";
import type { ProfileDraft } from "@/lib/validation/profile";

const sessionState = vi.hoisted(() => ({
	user: null as { id: string; email: string; name: string; emailVerified: boolean } | null,
}));

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
	revalidatePath: vi.fn(),
	revalidateTag: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
	auth: {
		api: {
			getSession: vi.fn(async () => (sessionState.user ? { user: sessionState.user } : null)),
		},
	},
}));

vi.mock("next/headers", () => ({
	headers: vi.fn(async () => new Headers()),
}));

vi.mock("next/cache", () => ({
	revalidatePath,
	revalidateTag,
}));

import {
	ensureProfileForUser,
	publishProfile,
	saveProfileDraft,
	unpublishProfile,
} from "./actions";

async function seedUser(overrides: Partial<typeof user.$inferInsert> = {}) {
	const id = overrides.id ?? crypto.randomUUID();
	const row = {
		id,
		name: "Test User",
		email: `${id}@example.com`,
		emailVerified: true,
		...overrides,
	};
	await db.insert(user).values(row);
	sessionState.user = {
		id: row.id,
		email: row.email,
		name: row.name,
		emailVerified: row.emailVerified ?? true,
	};
	return row;
}

function makeDraft(overrides: Partial<ProfileDraft> = {}): ProfileDraft {
	return {
		fullName: "Bruce Wayne",
		headline: "Vigilante",
		bio: "I am Batman.",
		location: "Gotham",
		contactEmail: "bruce@wayne.dev",
		githubUrl: "https://github.com/brucewayne",
		linkedinUrl: "https://linkedin.com/in/brucewayne",
		monogramStyle: "gradient",
		template: "modern",
		colorMode: "dark",
		slug: "bruce-wayne",
		experiences: [],
		projects: [],
		skills: [],
		...overrides,
	};
}

describe("dashboard actions", () => {
	beforeEach(async () => {
		await resetDatabase();
		revalidatePath.mockClear();
		revalidateTag.mockClear();
		sessionState.user = null;
	});

	it("should create a draft profile on first save", async () => {
		const u = await seedUser();
		const result = await saveProfileDraft(makeDraft());
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.profile.userId).toBe(u.id);
		expect(result.profile.fullName).toBe("Bruce Wayne");
		expect(result.profile.slug).toBe("bruce-wayne");
		expect(result.profile.isPublished).toBe(false);
	});

	it("should update the profile and its children", async () => {
		await seedUser();
		await saveProfileDraft(
			makeDraft({
				experiences: [
					{
						kind: "formal",
						role: "CEO",
						company: "Wayne Enterprises",
						period: "2010 - Now",
						description: "Running things.",
						sortOrder: 0,
					},
				],
				projects: [
					{
						name: "Batmobile",
						description: "A car.",
						repoUrl: "https://github.com/bruce/batmobile",
						demoUrl: "",
						tags: ["car"],
						sortOrder: 0,
					},
				],
				skills: ["TypeScript", "React"],
			}),
		);

		const result = await saveProfileDraft(
			makeDraft({
				headline: "Updated",
				experiences: [],
				projects: [
					{
						name: "Batwing",
						description: "A plane.",
						repoUrl: "",
						demoUrl: "https://batwing.dev",
						tags: ["plane"],
						sortOrder: 0,
					},
				],
				skills: ["Go"],
			}),
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.profile.headline).toBe("Updated");
		expect(result.profile.experiences).toHaveLength(0);
		expect(result.profile.projects).toHaveLength(1);
		expect(result.profile.projects[0]?.name).toBe("Batwing");
		expect(result.profile.skills.map((s) => s.name)).toEqual(["Go"]);
	});

	it("should return a field error when the slug is taken", async () => {
		const owner = await seedUser({ id: "owner", email: "owner@example.com" });
		await db.insert(profiles).values({
			userId: owner.id,
			slug: "taken-slug",
			fullName: "Owner",
			contactEmail: owner.email,
		});

		await seedUser({ id: "other", email: "other@example.com" });
		const result = await saveProfileDraft(makeDraft({ slug: "taken-slug" }));
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.fieldErrors?.slug).toBeTruthy();
	});

	it("should record the previous slug when the slug changes", async () => {
		const u = await seedUser();
		await saveProfileDraft(makeDraft({ slug: "old-slug" }));
		await saveProfileDraft(makeDraft({ slug: "new-slug" }));

		const rows = await db.select().from(slugHistory);
		expect(rows.some((r) => r.slug === "old-slug")).toBe(true);
		const profile = await db.query.profiles.findFirst({ where: (p, { eq }) => eq(p.userId, u.id) });
		expect(profile?.slug).toBe("new-slug");
	});

	it("should remove the history row when reclaiming the own old slug", async () => {
		await seedUser();
		await saveProfileDraft(makeDraft({ slug: "first-slug" }));
		await saveProfileDraft(makeDraft({ slug: "second-slug" }));
		const result = await saveProfileDraft(makeDraft({ slug: "first-slug" }));
		expect(result.ok).toBe(true);

		const rows = await db.select().from(slugHistory);
		expect(rows.some((r) => r.slug === "first-slug")).toBe(false);
		expect(rows.some((r) => r.slug === "second-slug")).toBe(true);
	});

	it("should reject unauthenticated calls", async () => {
		sessionState.user = null;
		await expect(saveProfileDraft(makeDraft())).rejects.toThrow();
		await expect(publishProfile()).rejects.toThrow();
		await expect(unpublishProfile()).rejects.toThrow();
	});

	it("should refuse to publish without a full name", async () => {
		await seedUser();
		await saveProfileDraft(makeDraft({ fullName: "", slug: "bruce-wayne" }));
		const result = await publishProfile();
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.fieldErrors?.fullName || result.error).toBeTruthy();
	});

	it("should set publishedAt and revalidate on publish", async () => {
		await seedUser();
		await saveProfileDraft(makeDraft({ fullName: "Bruce Wayne", slug: "bruce-wayne" }));
		revalidatePath.mockClear();
		const result = await publishProfile();
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.profile.isPublished).toBe(true);
		expect(result.profile.publishedAt).toBeInstanceOf(Date);
		expect(revalidatePath).toHaveBeenCalledWith("/bruce-wayne");
		expect(revalidatePath).toHaveBeenCalledWith("/explore");
		expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
	});

	it("should create a profile idempotently with ensureProfileForUser", async () => {
		const u = await seedUser({ email: "lucas.almeida@example.com", name: "Lucas Almeida" });
		const first = await ensureProfileForUser(u.id, u.email, u.name);
		const second = await ensureProfileForUser(u.id, u.email, u.name);
		expect(first.id).toBe(second.id);
		expect(first.slug).toBeTruthy();
	});

	it("should return the same profile for concurrent ensureProfileForUser calls", async () => {
		const u = await seedUser({
			email: "concurrent.user@example.com",
			name: "Concurrent User",
		});
		const results = await Promise.all([
			ensureProfileForUser(u.id, u.email, u.name),
			ensureProfileForUser(u.id, u.email, u.name),
			ensureProfileForUser(u.id, u.email, u.name),
		]);

		expect(new Set(results.map((profile) => profile.id)).size).toBe(1);
		const rows = await db.select().from(profiles).where(eq(profiles.userId, u.id));
		expect(rows).toHaveLength(1);
	});

	it("should suffix slug on collision in ensureProfileForUser", async () => {
		const owner = await seedUser({ id: "owner", email: "owner@example.com", name: "Owner" });
		await db.insert(profiles).values({
			userId: owner.id,
			slug: "lucas-almeida",
			fullName: "Owner",
			contactEmail: owner.email,
		});
		const u = await seedUser({
			id: "lucas",
			email: "lucas.almeida@example.com",
			name: "Lucas Almeida",
		});
		const profile = await ensureProfileForUser(u.id, u.email, u.name);
		expect(profile.slug).toBe("lucas-almeida-2");
	});

	it("should reject ensureProfileForUser for another user", async () => {
		const a = await seedUser({ id: "user-a", email: "a@example.com" });
		await seedUser({ id: "user-b", email: "b@example.com" });
		sessionState.user = { id: "user-b", email: "b@example.com", name: "B", emailVerified: true };
		await expect(ensureProfileForUser(a.id, a.email, a.name)).rejects.toThrow("Unauthorized");
	});

	it("should unpublish profile and revalidate", async () => {
		await seedUser();
		await saveProfileDraft(makeDraft({ slug: "bruce-wayne", fullName: "Bruce Wayne" }));
		await publishProfile();
		revalidatePath.mockClear();
		const result = await unpublishProfile();
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.profile.isPublished).toBe(false);
		expect(result.profile.publishedAt).toBeNull();
		expect(revalidatePath).toHaveBeenCalledWith("/bruce-wayne");
		expect(revalidatePath).toHaveBeenCalledWith("/explore");
		expect(revalidatePath).toHaveBeenCalledWith("/sitemap.xml");
	});

	it("should persist draft changes before publish uses them", async () => {
		await seedUser();
		await saveProfileDraft(makeDraft({ slug: "bruce-wayne", fullName: "Bruce Wayne" }));
		const save = await saveProfileDraft(
			makeDraft({ slug: "bruce-wayne", fullName: "Bruce Wayne", headline: "Novo headline" }),
		);
		expect(save.ok).toBe(true);
		const result = await publishProfile();
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.profile.headline).toBe("Novo headline");
		expect(result.profile.isPublished).toBe(true);
	});

	it("should return slug field error when save hits unique conflict", async () => {
		const owner = await seedUser({ id: "owner", email: "owner@example.com" });
		await seedUser({ id: "me", email: "me@example.com" });
		await db.insert(profiles).values({
			userId: owner.id,
			slug: "taken-conflict",
			fullName: "Owner",
			contactEmail: owner.email,
		});
		const result = await saveProfileDraft(
			makeDraft({ slug: "taken-conflict", fullName: "Bruce Wayne" }),
		);
		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.fieldErrors?.slug).toBeTruthy();
	});

	it("should persist children with visual order", async () => {
		await seedUser();
		const result = await saveProfileDraft(
			makeDraft({
				experiences: [
					{
						kind: "formal",
						role: "Segundo",
						company: "B",
						period: "2024",
						description: "B",
						sortOrder: 1,
					},
					{
						kind: "freelance",
						role: "Primeiro",
						company: "A",
						period: "2023",
						description: "A",
						sortOrder: 0,
					},
				],
				projects: [
					{
						name: "Projeto 2",
						description: "Dois",
						repoUrl: "",
						demoUrl: "",
						tags: ["B"],
						sortOrder: 1,
					},
					{
						name: "Projeto 1",
						description: "Um",
						repoUrl: "",
						demoUrl: "",
						tags: ["A"],
						sortOrder: 0,
					},
				],
				skills: ["TypeScript", "React"],
			}),
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.profile.experiences.map((e) => [e.role, e.sortOrder])).toEqual([
			["Primeiro", 0],
			["Segundo", 1],
		]);
		expect(result.profile.projects.map((p) => [p.name, p.sortOrder])).toEqual([
			["Projeto 1", 0],
			["Projeto 2", 1],
		]);
		expect(result.profile.skills.map((s) => [s.name, s.sortOrder])).toEqual([
			["TypeScript", 0],
			["React", 1],
		]);
	});

	it("should persist experience kind", async () => {
		await seedUser();
		const result = await saveProfileDraft(
			makeDraft({
				experiences: [
					{
						kind: "open-source",
						role: "Contribuidor",
						company: "Comunidade",
						period: "2024",
						description: "OSS",
						sortOrder: 0,
					},
				],
			}),
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.profile.experiences[0]?.kind).toBe("open-source");
	});

	it("should delete children removed from payload", async () => {
		await seedUser();
		await saveProfileDraft(
			makeDraft({
				experiences: [
					{
						kind: "formal",
						role: "Manter",
						company: "A",
						period: "2024",
						description: "A",
						sortOrder: 0,
					},
					{
						kind: "freelance",
						role: "Remover",
						company: "B",
						period: "2024",
						description: "B",
						sortOrder: 1,
					},
				],
				projects: [
					{
						name: "Manter",
						description: "A",
						repoUrl: "",
						demoUrl: "",
						tags: [],
						sortOrder: 0,
					},
					{
						name: "Remover",
						description: "B",
						repoUrl: "",
						demoUrl: "",
						tags: [],
						sortOrder: 1,
					},
				],
				skills: ["React", "Remover"],
			}),
		);

		const result = await saveProfileDraft(
			makeDraft({
				experiences: [
					{
						kind: "formal",
						role: "Manter",
						company: "A",
						period: "2024",
						description: "A",
						sortOrder: 0,
					},
				],
				projects: [
					{
						name: "Manter",
						description: "A",
						repoUrl: "",
						demoUrl: "",
						tags: [],
						sortOrder: 0,
					},
				],
				skills: ["React"],
			}),
		);

		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.profile.experiences.map((e) => e.role)).toEqual(["Manter"]);
		expect(result.profile.projects.map((p) => p.name)).toEqual(["Manter"]);
		expect(result.profile.skills.map((s) => s.name)).toEqual(["React"]);
	});

	it("should reject 21 projects", async () => {
		await seedUser();
		const result = await saveProfileDraft(
			makeDraft({
				projects: Array.from({ length: 21 }, (_, i) => ({
					name: `Projeto ${i}`,
					description: "Desc",
					repoUrl: "",
					demoUrl: "",
					tags: [],
					sortOrder: i,
				})),
			}),
		);

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.fieldErrors?.projects).toBeTruthy();
	});

	it("should reject unknown experience kind", async () => {
		await seedUser();
		const result = await saveProfileDraft(
			makeDraft({
				experiences: [
					{
						kind: "unknown" as never,
						role: "Role",
						company: "Company",
						period: "2024",
						description: "Desc",
						sortOrder: 0,
					},
				],
			}),
		);

		expect(result.ok).toBe(false);
		if (result.ok) return;
		expect(result.fieldErrors?.experiences || result.error).toBeTruthy();
	});
});
