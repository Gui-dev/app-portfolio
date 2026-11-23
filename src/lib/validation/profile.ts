import { z } from "zod";
import { validateSlug } from "@/lib/slug";
import { emptyOrHttpUrl } from "@/lib/urls";

const SLUG_INVALID_MESSAGE = "Escolha um slug válido.";
const SORT_ORDER_INVALID_MESSAGE = "Ordenação inválida.";
const MAX_120_MESSAGE = "Máximo de 120 caracteres.";
const MAX_160_MESSAGE = "Máximo de 160 caracteres.";
const MAX_600_MESSAGE = "Máximo de 600 caracteres.";
const MAX_1000_MESSAGE = "Máximo de 1000 caracteres.";
const MAX_2000_MESSAGE = "Máximo de 2000 caracteres.";
const MAX_60_MESSAGE = "Máximo de 60 caracteres.";

const isValidSlug = (value: string) => validateSlug(value).ok;

const sortOrderSchema = z
	.number({ message: SORT_ORDER_INVALID_MESSAGE })
	.int(SORT_ORDER_INVALID_MESSAGE)
	.min(0, SORT_ORDER_INVALID_MESSAGE)
	.default(0);

const experienceKindSchema = z.enum(
	["formal", "freelance", "open-source", "academic", "volunteer"],
	{ message: "Tipo de experiência inválido." },
);

const templateSchema = z.enum(["minimal", "developer", "modern"], {
	message: "Template inválido.",
});
const colorModeSchema = z.enum(["light", "dark"], { message: "Modo de cor inválido." });
const monogramStyleSchema = z.enum(["gradient", "solid", "outline"], {
	message: "Estilo de monograma inválido.",
});

export const experienceDraftSchema = z.object({
	kind: experienceKindSchema,
	role: z.string().max(120, MAX_120_MESSAGE),
	company: z.string().max(120, MAX_120_MESSAGE),
	period: z.string().max(120, MAX_120_MESSAGE),
	description: z.string().max(1000, MAX_1000_MESSAGE),
	sortOrder: sortOrderSchema,
});

export const projectDraftSchema = z.object({
	name: z.string().max(120, MAX_120_MESSAGE),
	description: z.string().max(600, MAX_600_MESSAGE),
	repoUrl: emptyOrHttpUrl.default(""),
	demoUrl: emptyOrHttpUrl.default(""),
	tags: z.array(z.string().max(60, MAX_60_MESSAGE)).max(20, "Máximo de 20 tags.").default([]),
	sortOrder: sortOrderSchema,
});

const slugDraftSchema = z
	.string()
	.default("")
	.refine((value) => value === "" || isValidSlug(value), {
		message: SLUG_INVALID_MESSAGE,
	});

export const ProfileDraftSchema = z.object({
	fullName: z.string().max(120, MAX_120_MESSAGE).default(""),
	headline: z.string().max(160, MAX_160_MESSAGE).default(""),
	bio: z.string().max(2000, MAX_2000_MESSAGE).default(""),
	location: z.string().max(120, MAX_120_MESSAGE).default(""),
	contactEmail: z.email("Informe um e-mail válido."),
	githubUrl: emptyOrHttpUrl.default(""),
	linkedinUrl: emptyOrHttpUrl.default(""),
	monogramStyle: monogramStyleSchema.default("gradient"),
	template: templateSchema.default("modern"),
	colorMode: colorModeSchema.default("dark"),
	slug: slugDraftSchema,
	experiences: z.array(experienceDraftSchema).max(20, "Máximo de 20 experiências.").default([]),
	projects: z.array(projectDraftSchema).max(20, "Máximo de 20 projetos.").default([]),
	skills: z
		.array(z.string().trim().min(1, "Informe uma habilidade válida.").max(60, MAX_60_MESSAGE))
		.max(100, "Máximo de 100 habilidades.")
		.default([]),
});

export const publishableProfileSchema = ProfileDraftSchema.extend({
	fullName: z.string().min(1, "Informe seu nome completo.").max(120, MAX_120_MESSAGE),
	slug: z.string().refine((value) => value !== "" && isValidSlug(value), {
		message: SLUG_INVALID_MESSAGE,
	}),
});

export type ProfileDraft = z.infer<typeof ProfileDraftSchema>;
export type PublishableProfile = z.infer<typeof publishableProfileSchema>;
