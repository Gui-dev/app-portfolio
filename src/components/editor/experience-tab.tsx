"use client";

import { ChevronDown, Lightbulb, Plus, Trash2 } from "lucide-react";
import { type ReactElement, useId, useState } from "react";

export type ExperienceKind = "formal" | "freelance" | "open-source" | "academic" | "volunteer";

export type ExperienceDraft = {
	id: string;
	kind: ExperienceKind;
	role: string;
	company: string;
	period: string;
	description: string;
};

const KIND_LABELS: Record<ExperienceKind, string> = {
	formal: "Emprego Formal",
	freelance: "Freelance",
	"open-source": "Open Source",
	academic: "Projeto Acadêmico",
	volunteer: "Voluntariado",
};

const KIND_ORDER: ExperienceKind[] = [
	"formal",
	"freelance",
	"open-source",
	"academic",
	"volunteer",
];

const initialExperiences: ExperienceDraft[] = [
	{
		id: "initial-1",
		kind: "formal",
		role: "Senior Frontend Engineer",
		company: "Nubank (Nu Pagamentos)",
		period: "2024 — Atual",
		description:
			"Liderança técnica na arquitetura de micro-frontends em React/TypeScript, melhorando o Core Web Vitals (LCP) em 38% e mantendo o Design System interno.",
	},
	{
		id: "initial-2",
		kind: "formal",
		role: "Desenvolvedor Fullstack Pleno",
		company: "Vtex",
		period: "2021 — 2024",
		description:
			"Desenvolvimento de APIs de alta vazão em Node.js e GraphQL e interfaces de checkout utilizadas por milhares de e-commerces na América Latina.",
	},
];

function createFirstJobExamples(): ExperienceDraft[] {
	return [
		{
			id: crypto.randomUUID(),
			kind: "freelance",
			role: "Desenvolvedor Freelance",
			company: "Projetos Autônomos",
			period: "2023 — Atual",
			description:
				"Desenvolvimento de landing pages e dashboards em Next.js para pequenos negócios, com foco em performance e SEO.",
		},
		{
			id: crypto.randomUUID(),
			kind: "open-source",
			role: "Contribuidor Open Source",
			company: "Comunidade Next.js",
			period: "2023 — Atual",
			description:
				"Contribuições em bibliotecas de UI e documentação, revisão de pull requests e correções de acessibilidade.",
		},
		{
			id: crypto.randomUUID(),
			kind: "academic",
			role: "Pesquisador Acadêmico",
			company: "TCC — Sistemas de Informação",
			period: "2022 — 2023",
			description:
				"Pesquisa aplicada em visualização de dados, resultando em um protótipo funcional apresentado na banca.",
		},
	];
}

function createEmptyExperience(kind: ExperienceKind): ExperienceDraft {
	return {
		id: crypto.randomUUID(),
		kind,
		role: "",
		company: "",
		period: "",
		description: "",
	};
}

function formatBadge(index: number): string {
	return `#${String(index + 1).padStart(2, "0")}`;
}

function KindSelect({
	id,
	value,
	onChange,
	ariaLabel,
	className,
}: {
	id?: string;
	value: ExperienceKind;
	onChange: (kind: ExperienceKind) => void;
	ariaLabel: string;
	className?: string;
}): ReactElement {
	return (
		<div className={`relative ${className ?? ""}`}>
			<select
				aria-label={ariaLabel}
				className="h-[26px] w-full appearance-none rounded-lg border border-border-strong bg-bg px-[14px] pr-[26px] py-1 text-[11px] font-medium leading-[14px] text-fg-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3"
				id={id}
				onChange={(event) => onChange(event.target.value as ExperienceKind)}
				value={value}
			>
				{KIND_ORDER.map((kind) => (
					<option key={kind} value={kind}>
						{KIND_LABELS[kind]}
					</option>
				))}
			</select>
			<ChevronDown
				aria-hidden="true"
				className="pointer-events-none absolute right-2 top-1/2 size-[10px] -translate-y-1/2 text-fg-soft"
			/>
		</div>
	);
}

function ExperienceCard({
	experience,
	index,
	onKindChange,
	onFieldChange,
	onRemove,
}: {
	experience: ExperienceDraft;
	index: number;
	onKindChange: (kind: ExperienceKind) => void;
	onFieldChange: (field: "role" | "company" | "period" | "description", value: string) => void;
	onRemove: () => void;
}): ReactElement {
	const baseId = useId();
	const ids = {
		role: `${baseId}-role`,
		company: `${baseId}-company`,
		period: `${baseId}-period`,
		description: `${baseId}-description`,
		kind: `${baseId}-kind`,
	};
	const badge = formatBadge(index);
	const labelClass = "mb-1 block text-[11px] font-medium leading-[16.5px] text-fg-subtle";
	const fieldClass =
		"h-[34px] w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs leading-4 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3";
	const textareaClass =
		"min-h-[50px] w-full resize-none rounded-xl border border-border bg-bg px-3 py-2 text-xs leading-4 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3";

	return (
		<article
			aria-label={`Experiência ${badge}`}
			className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-surface-3 p-4"
		>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-wrap items-center gap-2">
					<span className="font-mono text-xs font-bold leading-4 text-accent-soft">{badge}</span>
					<KindSelect
						ariaLabel={`Tipo da experiência ${index + 1}`}
						className="w-full sm:w-[205px]"
						id={ids.kind}
						onChange={onKindChange}
						value={experience.kind}
					/>
				</div>
				<button
					aria-label={`Remover experiência ${badge.slice(1)}`}
					className="inline-flex items-center gap-1.5 text-xs leading-4 text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3"
					onClick={onRemove}
					type="button"
				>
					<Trash2 aria-hidden="true" className="size-3" />
					Remover
				</button>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<div>
					<label className={labelClass} htmlFor={ids.role}>
						Cargo ou Papel Exercido
					</label>
					<input
						className={fieldClass}
						id={ids.role}
						onChange={(event) => onFieldChange("role", event.target.value)}
						type="text"
						value={experience.role}
					/>
				</div>
				<div>
					<label className={labelClass} htmlFor={ids.company}>
						Empresa, Projeto ou Instituição
					</label>
					<input
						className={fieldClass}
						id={ids.company}
						onChange={(event) => onFieldChange("company", event.target.value)}
						type="text"
						value={experience.company}
					/>
				</div>
			</div>

			<div>
				<label className={labelClass} htmlFor={ids.period}>
					Período
				</label>
				<input
					className={fieldClass}
					id={ids.period}
					onChange={(event) => onFieldChange("period", event.target.value)}
					type="text"
					value={experience.period}
				/>
			</div>

			<div>
				<label className={labelClass} htmlFor={ids.description}>
					Entregas e Resultados (Foque no impacto técnico)
				</label>
				<textarea
					className={textareaClass}
					id={ids.description}
					onChange={(event) => onFieldChange("description", event.target.value)}
					value={experience.description}
				/>
			</div>
		</article>
	);
}

export function ExperienceTab(): ReactElement {
	const [experiences, setExperiences] = useState<ExperienceDraft[]>(initialExperiences);
	const [addKind, setAddKind] = useState<"" | ExperienceKind>("");

	const addExperience = (kind: ExperienceKind) => {
		setExperiences((current) => [...current, createEmptyExperience(kind)]);
	};

	const updateExperience = (id: string, updater: (draft: ExperienceDraft) => ExperienceDraft) => {
		setExperiences((current) => current.map((item) => (item.id === id ? updater(item) : item)));
	};

	return (
		<div className="flex w-full max-w-[743px] flex-col gap-5">
			<header className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-col">
					<h2 className="font-display text-base font-bold leading-6 text-fg">
						Experiência & Vivência Prática
					</h2>
					<p className="text-xs leading-4 text-muted">
						Adicione empregos formais, freelas, open source ou projetos acadêmicos.
					</p>
				</div>

				<div className="inline-flex h-8 items-stretch">
					<button
						className="inline-flex h-8 w-[100px] items-center justify-center gap-1.5 rounded-l-xl rounded-r-none bg-accent-strong px-[14px] py-2 text-xs font-medium leading-4 text-white focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
						onClick={() => addExperience("formal")}
						type="button"
					>
						<Plus aria-hidden="true" className="size-3" />
						Adicionar
					</button>
					<div className="relative h-8 w-[31px]">
						<select
							aria-label="Adicionar experiência de outro tipo"
							className="h-8 w-[31px] appearance-none rounded-l-none rounded-r-xl border border-accent/40 bg-accent-deep text-transparent focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
							onChange={(event) => {
								const next = event.target.value as ExperienceKind | "";
								if (!next) return;
								addExperience(next);
								setAddKind("");
							}}
							value={addKind}
						>
							<option value="" />
							{KIND_ORDER.map((kind) => (
								<option key={kind} value={kind}>
									{KIND_LABELS[kind]}
								</option>
							))}
						</select>
						<ChevronDown
							aria-hidden="true"
							className="pointer-events-none absolute left-1/2 top-1/2 size-[10px] -translate-x-1/2 -translate-y-1/2 text-white"
						/>
					</div>
				</div>
			</header>

			<section className="flex flex-col gap-3 rounded-2xl border border-accent-soft/20 bg-gradient-to-r from-accent/10 via-accent-sky/10 to-success/10 p-4">
				<div className="flex gap-3">
					<span className="relative grid size-8 shrink-0 place-items-center rounded-xl bg-accent-soft/15">
						<span className="absolute top-[2px]">
							<Lightbulb aria-hidden="true" className="size-[14px] text-accent-soft" />
						</span>
					</span>
					<div className="flex flex-col gap-0.5">
						<p className="text-xs font-bold leading-4 text-fg">
							Procurando o primeiro emprego na área?
						</p>
						<p className="text-xs leading-[19.5px] text-fg-dim">
							Sem experiência CLT? Sem problemas! Recrutadores valorizam{" "}
							<strong className="font-bold">
								Freelas, Contribuições Open Source, Projetos Acadêmicos (TCC/Bootcamp)
							</strong>{" "}
							e Voluntariado.
						</p>
					</div>
				</div>
				<div className="flex flex-wrap items-center justify-between gap-2 border-t border-accent/10 pt-1">
					<p className="text-[11px] leading-[16.5px] text-muted">Quer ver como fica na prática?</p>
					<button
						className="inline-flex h-[30px] items-center justify-center rounded-xl border border-accent/30 bg-surface-3 px-3 py-1.5 text-xs font-semibold leading-4 text-accent-pale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3"
						onClick={() => setExperiences((current) => [...current, ...createFirstJobExamples()])}
						type="button"
					>
						✨ Carregar Perfil Primeiro Emprego
					</button>
				</div>
			</section>

			<div className="flex flex-col gap-4">
				{experiences.map((experience, index) => (
					<ExperienceCard
						experience={experience}
						index={index}
						key={experience.id}
						onFieldChange={(field, value) =>
							updateExperience(experience.id, (current) => ({ ...current, [field]: value }))
						}
						onKindChange={(kind) =>
							updateExperience(experience.id, (current) => ({ ...current, kind }))
						}
						onRemove={() =>
							setExperiences((current) => current.filter((item) => item.id !== experience.id))
						}
					/>
				))}
			</div>
		</div>
	);
}
