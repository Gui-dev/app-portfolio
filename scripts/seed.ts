import "dotenv/config";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
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
import { ProfileDraftSchema, publishableProfileSchema } from "@/lib/validation/profile";

const DEMO_PASSWORD = "foliocraft-demo";

const bruceInput = {
	fullName: "Bruce Wayne",
	headline: "CEO da Wayne Enterprises & Filantropo Tech",
	bio: "Lidero a Wayne Enterprises com foco em inovação, segurança e impacto social. Construo produtos digitais que protegem pessoas e aproximam a tecnologia de quem precisa dela.",
	location: "Gotham City • Remoto",
	contactEmail: "bruce@wayne.dev",
	githubUrl: "https://github.com/bruce-wayne",
	linkedinUrl: "https://www.linkedin.com/in/bruce-wayne",
	monogramStyle: "gradient",
	template: "modern",
	colorMode: "dark",
	slug: "bruce-wayne",
	experiences: [
		{
			kind: "formal",
			role: "CEO",
			company: "Wayne Enterprises",
			period: "2005 — Presente",
			description:
				"Defino a estratégia de inovação do grupo e conecto engenharia, segurança e produto para entregar serviços confiáveis.",
			sortOrder: 0,
		},
		{
			kind: "volunteer",
			role: "Filantropo",
			company: "Fundação Wayne",
			period: "2010 — Presente",
			description:
				"Apoio iniciativas de educação tecnológica e segurança comunitária em Gotham City.",
			sortOrder: 1,
		},
	],
	projects: [
		{
			name: "Wayne Tech Radar",
			description:
				"Painel interativo que acompanha iniciativas de segurança e inovação da empresa.",
			repoUrl: "https://github.com/bruce-wayne/wayne-tech-radar",
			demoUrl: "https://example.com/wayne-tech-radar",
			tags: ["Next.js", "Segurança", "Dados"],
			sortOrder: 0,
		},
		{
			name: "Gotham Safe Streets",
			description:
				"Projeto comunitário que mapeia rotas seguras e compartilha alertas em tempo real.",
			repoUrl: "https://github.com/bruce-wayne/gotham-safe-streets",
			demoUrl: "https://example.com/gotham-safe-streets",
			tags: ["Estratégia", "Impacto", "Next.js"],
			sortOrder: 1,
		},
	],
	skills: ["Estratégia", "Segurança", "Next.js", "Liderança", "Drizzle ORM"],
};

const clarkInput = {
	fullName: "Clark Kent",
	headline: "Jornalista em formação",
	bio: "Rascunho de perfil para demonstrar que páginas não publicadas retornam 404.",
	location: "Metrópole • Remoto",
	contactEmail: "clark@wayne.dev",
	githubUrl: "",
	linkedinUrl: "",
	monogramStyle: "gradient",
	template: "modern",
	colorMode: "dark",
	slug: "clark-kent",
	experiences: [],
	projects: [],
	skills: [],
};

type DemoProfile = {
	email: string;
	name: string;
	draft: ReturnType<typeof ProfileDraftSchema.parse>;
	isPublished: boolean;
};

async function seedDemoProfile(demo: DemoProfile): Promise<void> {
	const [existingUser] = await db
		.select({ id: user.id })
		.from(user)
		.where(eq(user.email, demo.email))
		.limit(1);
	const userId = existingUser?.id ?? crypto.randomUUID();

	const [slugOwner] = await db
		.select({ userId: profiles.userId })
		.from(profiles)
		.where(eq(profiles.slug, demo.draft.slug))
		.limit(1);
	const [historyOwner] = await db
		.select({ userId: profiles.userId })
		.from(slugHistory)
		.innerJoin(profiles, eq(slugHistory.profileId, profiles.id))
		.where(eq(slugHistory.slug, demo.draft.slug))
		.limit(1);
	const foreignOwner = [slugOwner, historyOwner].find(
		(owner) => owner !== undefined && owner.userId !== userId,
	);
	if (foreignOwner) {
		throw new Error(
			`Cannot seed demo profile: slug "${demo.draft.slug}" is owned by another user (${foreignOwner.userId}).`,
		);
	}

	const password = await hashPassword(DEMO_PASSWORD);
	const now = new Date();

	await db.transaction(async (tx) => {
		await tx
			.insert(user)
			.values({
				id: userId,
				name: demo.name,
				email: demo.email,
				emailVerified: true,
			})
			.onConflictDoUpdate({
				target: user.email,
				set: { name: demo.name, emailVerified: true, updatedAt: now },
			});

		const [existingAccount] = await tx
			.select({ id: account.id })
			.from(account)
			.where(and(eq(account.userId, userId), eq(account.providerId, "credential")))
			.limit(1);
		if (existingAccount) {
			await tx
				.update(account)
				.set({ accountId: userId, password, updatedAt: now })
				.where(eq(account.id, existingAccount.id));
		} else {
			await tx.insert(account).values({
				id: crypto.randomUUID(),
				userId,
				providerId: "credential",
				accountId: userId,
				password,
			});
		}

		const [existingProfile] = await tx
			.select({ id: profiles.id })
			.from(profiles)
			.where(eq(profiles.userId, userId))
			.limit(1);
		const profileId = existingProfile?.id ?? crypto.randomUUID();
		const profileValues = {
			userId,
			slug: demo.draft.slug,
			fullName: demo.draft.fullName,
			headline: demo.draft.headline,
			bio: demo.draft.bio,
			location: demo.draft.location,
			contactEmail: demo.draft.contactEmail,
			githubUrl: demo.draft.githubUrl,
			linkedinUrl: demo.draft.linkedinUrl,
			monogramStyle: demo.draft.monogramStyle,
			template: demo.draft.template,
			colorMode: demo.draft.colorMode,
			isPublished: demo.isPublished,
			publishedAt: demo.isPublished ? now : null,
			updatedAt: now,
		};
		await tx
			.insert(profiles)
			.values({ id: profileId, ...profileValues })
			.onConflictDoUpdate({ target: profiles.userId, set: profileValues });

		await tx.delete(experiences).where(eq(experiences.profileId, profileId));
		if (demo.draft.experiences.length > 0) {
			await tx.insert(experiences).values(
				demo.draft.experiences.map((experience) => ({
					profileId,
					kind: experience.kind,
					role: experience.role,
					company: experience.company,
					period: experience.period,
					description: experience.description,
					sortOrder: experience.sortOrder,
				})),
			);
		}

		await tx.delete(projects).where(eq(projects.profileId, profileId));
		if (demo.draft.projects.length > 0) {
			await tx.insert(projects).values(
				demo.draft.projects.map((project) => ({
					profileId,
					name: project.name,
					description: project.description,
					repoUrl: project.repoUrl,
					demoUrl: project.demoUrl,
					tags: project.tags,
					sortOrder: project.sortOrder,
				})),
			);
		}

		await tx.delete(skills).where(eq(skills.profileId, profileId));
		if (demo.draft.skills.length > 0) {
			await tx.insert(skills).values(
				demo.draft.skills.map((name, index) => ({
					profileId,
					name,
					sortOrder: index,
				})),
			);
		}
	});
}

/** Seeds the two demo accounts and profiles. Safe to import; idempotent to run. */
export async function seedDemoData(): Promise<void> {
	const demos: DemoProfile[] = [
		{
			email: "bruce@wayne.dev",
			name: "Bruce Wayne",
			draft: publishableProfileSchema.parse(bruceInput),
			isPublished: true,
		},
		{
			email: "clark@wayne.dev",
			name: "Clark Kent",
			draft: ProfileDraftSchema.parse(clarkInput),
			isPublished: false,
		},
	];

	for (const demo of demos) {
		await seedDemoProfile(demo);
	}
}

const isDirectRun =
	process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
	seedDemoData()
		.then(() => {
			console.log("Seed complete: 2 users, 1 published profile, 1 draft profile.");
			process.exit(0);
		})
		.catch((error: unknown) => {
			console.error("Seed failed:", error);
			process.exit(1);
		});
}
