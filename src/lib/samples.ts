import type { ProfileDraft } from "@/lib/validation/profile";

export const BEGINNER_SAMPLES: ReadonlyArray<ProfileDraft["experiences"][number]> = [
	{
		kind: "freelance",
		role: "Desenvolvedor Front-end Freelance",
		company: "Projetos para pequenos negócios",
		period: "2024 — Atual",
		description:
			"Desenvolvi landing pages e sites institucionais com foco em performance, acessibilidade e SEO, entregando projetos completos do briefing à publicação.",
		sortOrder: 0,
	},
	{
		kind: "open-source",
		role: "Contribuidor Open Source",
		company: "Projetos da comunidade",
		period: "2023 — Atual",
		description:
			"Contribuí com correções de bugs, melhorias de documentação e revisão de pull requests, colaborando com mantenedores em fluxos de trabalho com Git.",
		sortOrder: 1,
	},
	{
		kind: "academic",
		role: "Projeto Acadêmico em Desenvolvimento Web",
		company: "Universidade / Curso Técnico",
		period: "2023 — 2024",
		description:
			"Construí uma aplicação web completa como projeto final, aplicando boas práticas de versionamento, testes e organização de código em equipe.",
		sortOrder: 2,
	},
];
