"use client";

import { X } from "lucide-react";
import { type KeyboardEvent, type ReactElement, useState } from "react";

const INITIAL_SKILLS = [
	"TypeScript",
	"React",
	"Next.js",
	"Node.js",
	"Tailwind CSS",
	"PostgreSQL",
	"GraphQL",
	"Docker",
	"AWS",
	"SSR / SSG",
	"SEO Técnico",
];

export function SkillsTab(): ReactElement {
	const [skills, setSkills] = useState<string[]>(INITIAL_SKILLS);
	const [inputValue, setInputValue] = useState("");

	const addSkill = () => {
		const trimmed = inputValue.trim();
		if (trimmed.length === 0) return;
		const duplicate = skills.some((skill) => skill.toLowerCase() === trimmed.toLowerCase());
		if (duplicate) {
			setInputValue("");
			return;
		}
		setSkills((current) => [...current, trimmed]);
		setInputValue("");
	};

	const removeSkill = (name: string) => {
		setSkills((current) => current.filter((skill) => skill.toLowerCase() !== name.toLowerCase()));
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter") return;
		event.preventDefault();
		addSkill();
	};

	return (
		<div className="flex w-full flex-col gap-5">
			<header className="flex h-10 flex-col">
				<h2 className="font-display text-base font-bold leading-6 text-fg">Stack & Habilidades</h2>
				<p className="text-xs leading-4 text-muted">
					Digite uma tecnologia e pressione Enter para adicionar ao seu currículo.
				</p>
			</header>

			<div className="flex h-[42px] gap-2">
				<input
					aria-label="Nova habilidade"
					className="h-[42px] min-w-0 flex-1 rounded-xl border border-border bg-surface-3 px-[14px] py-[11px] text-sm leading-5 text-fg placeholder:text-fg-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
					onChange={(event) => setInputValue(event.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Ex: Next.js, Docker, GraphQL, Tailwind CSS..."
					type="text"
					value={inputValue}
				/>
				<button
					className="inline-flex h-[42px] w-24 shrink-0 items-center justify-center rounded-xl bg-accent-strong px-4 py-[10.5px] text-sm font-medium leading-5 text-white transition-colors hover:bg-accent-strong/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
					onClick={addSkill}
					type="button"
				>
					Adicionar
				</button>
			</div>

			<section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-3 p-4">
				<p className="text-xs font-medium leading-4 text-muted">
					Habilidades ativas (clique no × para remover):
				</p>
				<div className="flex flex-wrap gap-2">
					{skills.map((skill) => (
						<button
							aria-label={`Remover ${skill}`}
							className="inline-flex h-[30px] items-center gap-2 rounded-xl border border-border-strong bg-bg px-3 py-1.5 text-xs font-medium leading-4 text-fg-soft transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3"
							key={skill}
							onClick={() => removeSkill(skill)}
							type="button"
						>
							<span>{skill}</span>
							<X aria-hidden="true" className="size-3 text-muted" />
						</button>
					))}
				</div>
			</section>
		</div>
	);
}
