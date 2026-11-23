import { z } from "zod";
import { validateSlug } from "@/lib/slug";
import { emptyOrHttpUrl } from "@/lib/urls";

const experienceKindSchema = z.enum(
	["formal", "freelance", "open-source", "academic", "volunteer"],
	{ message: "Tipo de experiência inválido." },
);

const templateSchema = z.enum(["minimal", "developer", "modern"]);
const colorModeSchema = z.enum(["light", "dark"]);
const monogramStyleSchema = z.enum(["gradient", "solid", "outline"]);

export const experienceDraftSchema = z.object({
	kind: experienceKindSchema,
	role: z.string().max(120),
	company: z.string().max(120),
	period: z.string().max(120),
	description: z.string().max(1000),
	sortOrder: z.number().int().min(0).default(0),
});

export const projectDraftSchema = z.object({
	name: z.string().max(120),
	description: z.string().max(600),
	repoUrl: emptyOrHttpUrl.default(""),
	demoUrl: emptyOrHttpUrl.default(""),
	tags: z.array(z.string().max(60)).max(20).default([]),
	sortOrder: z.number().int().min(0).default(0),
});

const slugDraftSchema = z
	.string()
	.default("")
	.refine((value) => value === "" || validateSlug(value).ok, {
		message: "Escolha um slug válido.",
	});

export const ProfileDraftSchema = z.object({
	fullName: z.string().max(120).default(""),
	headline: z.string().max(160).default(""),
	bio: z.string().max(2000).default(""),
	location: z.string().max(120).default(""),
	contactEmail: z.email("Informe um e-mail válido."),
	githubUrl: emptyOrHttpUrl.default(""),
	linkedinUrl: emptyOrHttpUrl.default(""),
	monogramStyle: monogramStyleSchema.default("gradient"),
	template: templateSchema.default("modern"),
	colorMode: colorModeSchema.default("dark"),
	slug: slugDraftSchema,
	experiences: z.array(experienceDraftSchema).max(20, "Máximo de 20 experiências.").default([]),
	projects: z.array(projectDraftSchema).max(20).default([]),
	skills: z
		.array(z.string().trim().min(1).max(60))
		.max(100, "Máximo de 100 habilidades.")
		.default([]),
});

export const publishableProfileSchema = ProfileDraftSchema.extend({
	fullName: z.string().min(1, "Informe seu nome completo.").max(120),
	slug: z.string().refine((value) => value !== "" && validateSlug(value).ok, {
		message: "Escolha um slug válido.",
	}),
});

export type ProfileDraft = z.infer<typeof ProfileDraftSchema>;
export type PublishableProfile = z.infer<typeof publishableProfileSchema>;
