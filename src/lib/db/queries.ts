import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import type { ProfileCard, ProfileWithRelations } from "@/lib/db/schema";
import { profiles, slugHistory } from "@/lib/db/schema";

export async function getProfileForUser(userId: string): Promise<ProfileWithRelations | null> {
	const profile = await db.query.profiles.findFirst({
		where: eq(profiles.userId, userId),
		with: {
			experiences: { orderBy: (experiences) => [asc(experiences.sortOrder)] },
			projects: { orderBy: (projects) => [asc(projects.sortOrder)] },
			skills: { orderBy: (skills) => [asc(skills.sortOrder)] },
		},
	});
	return profile ?? null;
}

export async function getPublicProfileBySlug(slug: string): Promise<ProfileWithRelations | null> {
	const profile = await db.query.profiles.findFirst({
		where: and(eq(profiles.slug, slug), eq(profiles.isPublished, true)),
		with: {
			experiences: { orderBy: (experiences) => [asc(experiences.sortOrder)] },
			projects: { orderBy: (projects) => [asc(projects.sortOrder)] },
			skills: { orderBy: (skills) => [asc(skills.sortOrder)] },
		},
	});
	return profile ?? null;
}

export async function listPublishedProfiles(opts: {
	page: number;
	pageSize?: number;
}): Promise<{ items: ProfileCard[]; total: number }> {
	const pageSize = opts.pageSize ?? 12;
	const offset = (opts.page - 1) * pageSize;
	const where = and(eq(profiles.isPublished, true), sql`${profiles.slug} IS NOT NULL`);

	const [rows, countRows] = await Promise.all([
		db.query.profiles.findMany({
			where,
			orderBy: [desc(profiles.publishedAt), asc(profiles.fullName)],
			limit: pageSize,
			offset,
			with: {
				skills: { orderBy: (skills) => [asc(skills.sortOrder)] },
			},
		}),
		db.select({ count: sql<number>`count(*)::int` }).from(profiles).where(where),
	]);

	const items: ProfileCard[] = rows.map((row) => ({
		slug: row.slug ?? "",
		fullName: row.fullName,
		headline: row.headline,
		skills: row.skills.map((skill) => skill.name),
	}));

	return { items, total: countRows[0]?.count ?? 0 };
}

export async function resolveSlugRedirect(slug: string): Promise<string | null> {
	const rows = await db
		.select({ currentSlug: profiles.slug })
		.from(slugHistory)
		.innerJoin(profiles, eq(slugHistory.profileId, profiles.id))
		.where(and(eq(slugHistory.slug, slug), eq(profiles.isPublished, true)))
		.limit(1);

	return rows[0]?.currentSlug ?? null;
}

export async function isSlugAvailable(
	slug: string,
	opts?: { forProfileId?: string },
): Promise<boolean> {
	const profileOwnerCondition = opts?.forProfileId
		? and(eq(profiles.slug, slug), ne(profiles.id, opts.forProfileId))
		: eq(profiles.slug, slug);
	const historyOwnerCondition = opts?.forProfileId
		? and(eq(slugHistory.slug, slug), ne(slugHistory.profileId, opts.forProfileId))
		: eq(slugHistory.slug, slug);

	const [profileRows, historyRows] = await Promise.all([
		db.select({ id: profiles.id }).from(profiles).where(profileOwnerCondition).limit(1),
		db.select({ id: slugHistory.id }).from(slugHistory).where(historyOwnerCondition).limit(1),
	]);

	return profileRows.length === 0 && historyRows.length === 0;
}
