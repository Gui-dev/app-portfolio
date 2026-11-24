import type { ExperienceKind } from "@/lib/db/schema";

export const EXPERIENCE_KINDS: Record<ExperienceKind, { label: string }> = {
	formal: { label: "Emprego Formal" },
	freelance: { label: "Freelance" },
	"open-source": { label: "Open Source" },
	academic: { label: "Acadêmico" },
	volunteer: { label: "Voluntário" },
};
