"use client";

import { Plus, Trash2 } from "lucide-react";
import { type ReactElement, useId, useState } from "react";

type ProjectDraft = {
	id: string;
	name: string;
	technologies: string;
	description: string;
	repo: string;
	demo: string;
};

const initialProjects: ProjectDraft[] = [
	{
		id: "initial-1",
		name: "PulseMetrics SaaS",
		technologies: "Next.js, TypeScript, Tailwind, PostgreSQL",
		description:
			"Plataforma de analytics em tempo real com ingestão de eventos via Edge Functions e dashboards interativos.",
		repo: "github.com/lucasalmeida/pulse-metrics",
		demo: "pulsemetrics.app",
	},
	{
		id: "initial-2",
		name: "UI Kit Accessible",
		technologies: "React, ARIA, Vite, Storybook",
		description:
			"Biblioteca de componentes React headless focada em acessibilidade (WAI-ARIA) e zero runtime CSS.",
		repo: "github.com/lucasalmeida/ui-kit",
		demo: "uikit-docs.dev",
	},
];

function createEmptyProject(): ProjectDraft {
	return {
		id: crypto.randomUUID(),
		name: "",
		technologies: "",
		description: "",
		repo: "",
		demo: "",
	};
}

function formatNumber(index: number): string {
	return String(index + 1).padStart(2, "0");
}

function ProjectCard({
	project,
	index,
	onFieldChange,
	onRemove,
}: {
	project: ProjectDraft;
	index: number;
	onFieldChange: (
		field: "name" | "technologies" | "description" | "repo" | "demo",
		value: string,
	) => void;
	onRemove: () => void;
}): ReactElement {
	const baseId = useId();
	const ids = {
		name: `${baseId}-name`,
		technologies: `${baseId}-technologies`,
		description: `${baseId}-description`,
		repo: `${baseId}-repo`,
		demo: `${baseId}-demo`,
	};
	const number = formatNumber(index);
	const labelClass = "mb-1 block text-[11px] font-medium leading-[16.5px] text-fg-subtle";
	const fieldClass =
		"h-[34px] w-full rounded-xl border border-border bg-bg px-3 py-2 text-xs leading-4 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3";
	const textareaClass =
		"min-h-[50px] w-full resize-none rounded-xl border border-border bg-bg px-3 py-2 text-xs leading-4 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3";

	return (
		<article
			aria-label={`Projeto #${number}`}
			className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-surface-3 p-4"
		>
			<div className="flex h-4 items-center justify-between">
				<span className="font-mono text-xs font-bold leading-4 text-accent-soft">
					Projeto #{number}
				</span>
				<button
					aria-label={`Remover projeto ${number}`}
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
					<label className={labelClass} htmlFor={ids.name}>
						Nome do Projeto
					</label>
					<input
						className={fieldClass}
						id={ids.name}
						onChange={(event) => onFieldChange("name", event.target.value)}
						type="text"
						value={project.name}
					/>
				</div>
				<div>
					<label className={labelClass} htmlFor={ids.technologies}>
						Tecnologias (separadas por vírgula)
					</label>
					<input
						className={fieldClass}
						id={ids.technologies}
						onChange={(event) => onFieldChange("technologies", event.target.value)}
						type="text"
						value={project.technologies}
					/>
				</div>
			</div>

			<div>
				<label className={labelClass} htmlFor={ids.description}>
					Descrição curta
				</label>
				<textarea
					className={textareaClass}
					id={ids.description}
					onChange={(event) => onFieldChange("description", event.target.value)}
					value={project.description}
				/>
			</div>

			<div className="grid gap-3 sm:grid-cols-2">
				<div>
					<label className={labelClass} htmlFor={ids.repo}>
						Link Repositório
					</label>
					<input
						className={fieldClass}
						id={ids.repo}
						onChange={(event) => onFieldChange("repo", event.target.value)}
						type="text"
						value={project.repo}
					/>
				</div>
				<div>
					<label className={labelClass} htmlFor={ids.demo}>
						Link Demo Ao Vivo
					</label>
					<input
						className={fieldClass}
						id={ids.demo}
						onChange={(event) => onFieldChange("demo", event.target.value)}
						type="text"
						value={project.demo}
					/>
				</div>
			</div>
		</article>
	);
}

export function ProjectsTab(): ReactElement {
	const [projects, setProjects] = useState<ProjectDraft[]>(initialProjects);

	const updateProject = (
		id: string,
		field: "name" | "technologies" | "description" | "repo" | "demo",
		value: string,
	) => {
		setProjects((current) =>
			current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
		);
	};

	return (
		<div className="flex w-full flex-col gap-4">
			<header className="flex h-10 items-center justify-between">
				<div className="flex flex-col">
					<h2 className="font-display text-base font-bold leading-6 text-fg">
						Projetos em Destaque
					</h2>
					<p className="text-xs leading-4 text-muted">
						Mostre seus melhores trabalhos com tags de tecnologias e links.
					</p>
				</div>
				<button
					className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl bg-accent-strong px-[14px] py-2 text-xs font-medium leading-4 text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
					onClick={() => setProjects((current) => [...current, createEmptyProject()])}
					type="button"
				>
					<Plus aria-hidden="true" className="size-3" />
					Novo Projeto
				</button>
			</header>

			<div className="flex flex-col gap-4">
				{projects.map((project, index) => (
					<ProjectCard
						index={index}
						key={project.id}
						onFieldChange={(field, value) => updateProject(project.id, field, value)}
						onRemove={() =>
							setProjects((current) => current.filter((item) => item.id !== project.id))
						}
						project={project}
					/>
				))}
			</div>
		</div>
	);
}
