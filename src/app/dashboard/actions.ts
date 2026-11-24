"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { getProfileForUser, isSlugAvailable } from "@/lib/db/queries";
import {
	experiences,
	type ProfileWithRelations,
	profiles,
	projects,
	skills,
	slugHistory,
} from "@/lib/db/schema";
import { normalizeSlug, validateSlug } from "@/lib/slug";
import {
	type ProfileDraft,
	ProfileDraftSchema,
	publishableProfileSchema,
} from "@/lib/validation/profile";

export type ActionFieldErrors = Partial<Record<string, string>>;

export type SaveProfileDraftResult =
	| { ok: true; profile: ProfileWithRelations }
	| { ok: false; fieldErrors?: ActionFieldErrors; error?: string };

export type PublishProfileResult =
	| { ok: true; profile: ProfileWithRelations }
	| { ok: false; fieldErrors?: ActionFieldErrors; error?: string };

async function requireSessionUser() {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user) {
		throw new Error("Unauthorized");
	}
	return session.user;
}

function draftFromProfile(profile: ProfileWithRelations): ProfileDraft {
	return {
		fullName: profile.fullName ?? "",
		headline: profile.headline ?? "",
		bio: profile.bio ?? "",
		location: profile.location ?? "",
		contactEmail: profile.contactEmail ?? "",
		githubUrl: profile.githubUrl ?? "",
		linkedinUrl: profile.linkedinUrl ?? "",
		monogramStyle: profile.monogramStyle,
		template: profile.template,
		colorMode: profile.colorMode,
		slug: profile.slug ?? "",
		experiences: profile.experiences.map((e) => ({
			kind: e.kind,
			role: e.role,
			company: e.company,
			period: e.period,
			description: e.description,
			sortOrder: e.sortOrder,
		})),
		projects: profile.projects.map((p) => ({
			name: p.name,
			description: p.description,
			repoUrl: p.repoUrl ?? "",
			demoUrl: p.demoUrl ?? "",
			tags: p.tags,
			sortOrder: p.sortOrder,
		})),
		skills: profile.skills.map((s) => s.name),
	};
}

function zodFieldErrors(error: {
	issues: Array<{ path: PropertyKey[]; message: string }>;
}): ActionFieldErrors {
	const fieldErrors: ActionFieldErrors = {};
	for (const issue of error.issues) {
		const key = issue.path[0];
		if (typeof key === "string" && !fieldErrors[key]) {
			fieldErrors[key] = issue.message;
		}
	}
	return fieldErrors;
}

async function loadProfileByUserId(userId: string): Promise<ProfileWithRelations | null> {
	return getProfileForUser(userId);
}

async function nextAvailableSlug(base: string, forProfileId?: string): Promise<string | null> {
	const normalized = normalizeSlug(base);
	if (!normalized) return null;
	let candidate = normalized;
	if ((await isSlugAvailable(candidate, { forProfileId })) && validateSlug(candidate).ok) {
		return candidate;
	}
	for (let i = 2; i < 200; i += 1) {
		const suffix = `-${i}`;
		const trimmed = normalized.slice(0, Math.max(3, 30 - suffix.length)).replace(/-+$/g, "");
		candidate = `${trimmed}${suffix}`;
		const validation = validateSlug(candidate);
		if (!validation.ok) continue;
		if (await isSlugAvailable(candidate, { forProfileId })) return candidate;
	}
	return null;
}

export async function ensureProfileForUser(
	userId: string,
	email: string,
	name?: string | null,
): Promise<ProfileWithRelations> {
	const existing = await loadProfileByUserId(userId);
	if (existing) return existing;

	const localPart = email.split("@")[0] ?? "user";
	const base = normalizeSlug(localPart) || "user";
	const slug = await nextAvailableSlug(base);
	if (!slug) {
		throw new Error("Unable to allocate slug");
	}

	await db.insert(profiles).values({
		userId,
		slug,
		fullName: name?.trim() || null,
		contactEmail: email,
		isPublished: false,
	});

	const created = await loadProfileByUserId(userId);
	if (!created) {
		throw new Error("Profile creation failed");
	}
	return created;
}

export async function saveProfileDraft(input: ProfileDraft): Promise<SaveProfileDraftResult> {
	const user = await requireSessionUser();
	const parsed = ProfileDraftSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
	}
	const draft = parsed.data;
	const normalizedSlug = draft.slug ? normalizeSlug(draft.slug) : "";

	if (normalizedSlug) {
		const slugValidation = validateSlug(normalizedSlug);
		if (!slugValidation.ok) {
			return { ok: false, fieldErrors: { slug: "Escolha um slug válido." } };
		}
	}

	const result = await db.transaction(async (tx) => {
		let profile = await tx.query.profiles.findFirst({
			where: eq(profiles.userId, user.id),
		});

		if (!profile) {
			const base = normalizedSlug || normalizeSlug(user.email.split("@")[0] ?? "user") || "user";
			if (normalizedSlug) {
				const available = await isSlugAvailable(normalizedSlug);
				if (!available) {
					return { ok: false, fieldErrors: { slug: "Este slug já está em uso." } } as const;
				}
			}
			const allocated = normalizedSlug || (await nextAvailableSlug(base));
			if (!allocated) {
				return { ok: false, error: "Não foi possível gerar um slug." } as const;
			}
			const [created] = await tx
				.insert(profiles)
				.values({
					userId: user.id,
					slug: allocated,
					fullName: draft.fullName || user.name || null,
					headline: draft.headline || null,
					bio: draft.bio || null,
					location: draft.location || null,
					contactEmail: draft.contactEmail,
					githubUrl: draft.githubUrl || null,
					linkedinUrl: draft.linkedinUrl || null,
					monogramStyle: draft.monogramStyle,
					template: draft.template,
					colorMode: draft.colorMode,
				})
				.returning();
			profile = created;
		}

		if (!profile) return { ok: false, error: "Perfil não encontrado." } as const;

		const oldSlug = profile.slug;
		let nextSlug = oldSlug;

		if (normalizedSlug) {
			if (normalizedSlug !== oldSlug) {
				const available = await isSlugAvailable(normalizedSlug, { forProfileId: profile.id });
				if (!available) {
					return { ok: false, fieldErrors: { slug: "Este slug já está em uso." } } as const;
				}
				// reclaim own old slug: remove history row for that slug owned by this profile
				await tx
					.delete(slugHistory)
					.where(and(eq(slugHistory.profileId, profile.id), eq(slugHistory.slug, normalizedSlug)));

				if (oldSlug) {
					// record previous slug in history; remove any stale row for oldSlug (should not exist for others due availability)
					await tx.delete(slugHistory).where(eq(slugHistory.slug, oldSlug));
					await tx.insert(slugHistory).values({ profileId: profile.id, slug: oldSlug });
				}
				nextSlug = normalizedSlug;
			}
		}

		await tx
			.update(profiles)
			.set({
				slug: nextSlug,
				fullName: draft.fullName || null,
				headline: draft.headline || null,
				bio: draft.bio || null,
				location: draft.location || null,
				contactEmail: draft.contactEmail,
				githubUrl: draft.githubUrl || null,
				linkedinUrl: draft.linkedinUrl || null,
				monogramStyle: draft.monogramStyle,
				template: draft.template,
				colorMode: draft.colorMode,
			})
			.where(eq(profiles.id, profile.id));

		await tx.delete(experiences).where(eq(experiences.profileId, profile.id));
		if (draft.experiences.length > 0) {
			await tx.insert(experiences).values(
				draft.experiences.map((e, index) => ({
					profileId: profile.id,
					kind: e.kind,
					role: e.role,
					company: e.company,
					period: e.period,
					description: e.description,
					sortOrder: e.sortOrder ?? index,
				})),
			);
		}

		await tx.delete(projects).where(eq(projects.profileId, profile.id));
		if (draft.projects.length > 0) {
			await tx.insert(projects).values(
				draft.projects.map((p, index) => ({
					profileId: profile.id,
					name: p.name,
					description: p.description,
					repoUrl: p.repoUrl || null,
					demoUrl: p.demoUrl || null,
					tags: p.tags,
					sortOrder: p.sortOrder ?? index,
				})),
			);
		}

		await tx.delete(skills).where(eq(skills.profileId, profile.id));
		if (draft.skills.length > 0) {
			await tx.insert(skills).values(
				draft.skills.map((name, index) => ({
					profileId: profile.id,
					name,
					sortOrder: index,
				})),
			);
		}

		return { ok: true as const, profileId: profile.id };
	});

	if (!result.ok) return result;

	const saved = await db.query.profiles.findFirst({
		where: eq(profiles.id, result.profileId),
		with: {
			experiences: { orderBy: (e) => [asc(e.sortOrder)] },
			projects: { orderBy: (p) => [asc(p.sortOrder)] },
			skills: { orderBy: (s) => [asc(s.sortOrder)] },
		},
	});
	if (!saved) return { ok: false, error: "Perfil não encontrado." };
	return { ok: true, profile: saved };
}

export async function publishProfile(): Promise<PublishProfileResult> {
	const user = await requireSessionUser();
	const profile = await loadProfileByUserId(user.id);
	if (!profile) {
		return { ok: false, error: "Perfil não encontrado." };
	}
	const draft = draftFromProfile(profile);
	const parsed = publishableProfileSchema.safeParse(draft);
	if (!parsed.success) {
		return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
	}

	const slug = normalizeSlug(parsed.data.slug);
	const available = await isSlugAvailable(slug, { forProfileId: profile.id });
	if (!available) {
		return { ok: false, fieldErrors: { slug: "Este slug já está em uso." } };
	}

	await db
		.update(profiles)
		.set({
			isPublished: true,
			publishedAt: new Date(),
			slug,
		})
		.where(eq(profiles.id, profile.id));

	revalidatePath(`/${slug}`);
	revalidatePath("/explore");
	revalidatePath("/sitemap.xml");

	const updated = await loadProfileByUserId(user.id);
	if (!updated) return { ok: false, error: "Perfil não encontrado." };
	return { ok: true, profile: updated };
}

export async function unpublishProfile(): Promise<PublishProfileResult> {
	const user = await requireSessionUser();
	const profile = await loadProfileByUserId(user.id);
	if (!profile) return { ok: false, error: "Perfil não encontrado." };
	const slug = profile.slug;

	await db
		.update(profiles)
		.set({ isPublished: false, publishedAt: null })
		.where(eq(profiles.id, profile.id));

	if (slug) {
		revalidatePath(`/${slug}`);
	}
	revalidatePath("/explore");
	revalidatePath("/sitemap.xml");

	const updated = await loadProfileByUserId(user.id);
	if (!updated) return { ok: false, error: "Perfil não encontrado." };
	return { ok: true, profile: updated };
}
