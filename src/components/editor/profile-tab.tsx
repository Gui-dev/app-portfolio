"use client";

import { type ReactElement, useId, useState } from "react";

type AvatarStyle = "indigo" | "emerald" | "mono";

type ProfileDraft = {
	name: string;
	slug: string;
	headline: string;
	bio: string;
	location: string;
	email: string;
	github: string;
	linkedin: string;
};

const initialDraft: ProfileDraft = {
	name: "Lucas Almeida",
	slug: "lucas-almeida",
	headline: "Engenheiro de Software Fullstack • React, Next.js & Node.js",
	bio: "Especialista em construir aplicações web escaláveis, rápidas e acessíveis. Apaixonado por arquitetura limpa, Design Systems e experiências de usuário memoráveis.",
	location: "São Paulo, SP • Remoto",
	email: "lucas.almeida@dev.io",
	github: "github.com/lucasalmeida",
	linkedin: "linkedin.com/in/lucasalmeida",
};

const avatarStyles: ReadonlyArray<{ id: AvatarStyle; label: string; swatch: string }> = [
	{
		id: "indigo",
		label: "Indigo/Cyan",
		swatch: "bg-gradient-to-br from-accent-strong to-accent-cyan",
	},
	{
		id: "emerald",
		label: "Emerald Dev",
		swatch: "bg-gradient-to-br from-accent-emerald to-accent-teal",
	},
	{
		id: "mono",
		label: "Monocromático",
		swatch: "bg-fg-soft",
	},
];

const labelClass = "mb-1.5 block text-xs font-medium leading-4 text-fg-dim";
const inputClass =
	"h-[42px] w-full rounded-xl border border-border bg-surface-3 px-[14px] py-[10px] text-sm leading-5 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";
const textareaClass =
	"min-h-[82px] w-full resize-none rounded-xl border border-border bg-surface-3 px-[14px] py-[10px] text-sm leading-5 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) {
		return "??";
	}
	return parts
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
}

export function ProfileTab(): ReactElement {
	const [draft, setDraft] = useState<ProfileDraft>(initialDraft);
	const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>("indigo");
	const baseId = useId();
	const ids = {
		name: `${baseId}-name`,
		slug: `${baseId}-slug`,
		headline: `${baseId}-headline`,
		bio: `${baseId}-bio`,
		location: `${baseId}-location`,
		email: `${baseId}-email`,
		github: `${baseId}-github`,
		linkedin: `${baseId}-linkedin`,
	};

	const initials = getInitials(draft.name);
	const previewClass =
		avatarStyle === "indigo"
			? "bg-gradient-to-br from-accent-strong to-accent-cyan text-fg"
			: avatarStyle === "emerald"
				? "bg-gradient-to-br from-accent-emerald to-accent-teal text-fg"
				: "bg-fg-soft text-bg";

	return (
		<div className="flex flex-col gap-5">
			<header className="flex min-h-10 flex-col">
				<h2 className="font-display text-base font-bold leading-6 text-fg">
					Informações Pessoais & SEO
				</h2>
				<p className="text-xs leading-4 text-muted">
					Estes dados alimentam o cabeçalho do portfólio e as meta tags OpenGraph.
				</p>
			</header>

			<section className="flex w-full flex-col items-center gap-4 rounded-2xl border border-border bg-surface-3 p-4 sm:flex-row">
				<div
					aria-label={`Monograma ${initials}`}
					className={`grid size-16 shrink-0 place-items-center rounded-2xl font-display text-xl font-bold leading-7 shadow-sm ${previewClass}`}
					role="img"
				>
					{initials}
				</div>
				<div className="flex w-full flex-1 flex-col gap-2">
					<p className="text-xs font-medium leading-4 text-fg-dim">Estilo do Avatar / Monograma</p>
					{/* biome-ignore lint/a11y/useSemanticElements: brief requires a div with role="group" */}
					<div aria-label="Estilo do avatar" className="flex flex-wrap gap-2" role="group">
						{avatarStyles.map((style) => (
							<button
								aria-pressed={avatarStyle === style.id}
								className="inline-flex items-center gap-1.5 rounded-xl border border-border-strong bg-border px-3 py-1.5 text-xs font-medium leading-4 text-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
								key={style.id}
								onClick={() => setAvatarStyle(style.id)}
								type="button"
							>
								<span aria-hidden="true" className={`size-3 rounded-full ${style.swatch}`} />
								{style.label}
							</button>
						))}
					</div>
				</div>
			</section>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label className={labelClass} htmlFor={ids.name}>
						Nome Completo
					</label>
					<input
						className={inputClass}
						id={ids.name}
						onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
						type="text"
						value={draft.name}
					/>
				</div>
				<div>
					<label className={labelClass} htmlFor={ids.slug}>
						Slug Público (/seunome)
					</label>
					<div className="flex h-[38px] items-center rounded-xl border border-border bg-inset px-3 py-[10px] focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-bg">
						<span aria-hidden="true" className="font-mono text-xs leading-4 text-muted">
							/
						</span>
						<input
							className="ml-1 w-full bg-transparent font-mono text-xs leading-4 text-accent-soft focus:outline-none"
							id={ids.slug}
							onChange={(event) =>
								setDraft((current) => ({ ...current, slug: event.target.value }))
							}
							type="text"
							value={draft.slug}
						/>
					</div>
				</div>
			</div>

			<div>
				<label className={labelClass} htmlFor={ids.headline}>
					Cargo / Headline
				</label>
				<input
					className={inputClass}
					id={ids.headline}
					onChange={(event) =>
						setDraft((current) => ({ ...current, headline: event.target.value }))
					}
					type="text"
					value={draft.headline}
				/>
			</div>

			<div>
				<label className={labelClass} htmlFor={ids.bio}>
					Bio Resumida
				</label>
				<textarea
					className={textareaClass}
					id={ids.bio}
					onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))}
					value={draft.bio}
				/>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label className={labelClass} htmlFor={ids.location}>
						Localização
					</label>
					<input
						className={inputClass}
						id={ids.location}
						onChange={(event) =>
							setDraft((current) => ({ ...current, location: event.target.value }))
						}
						type="text"
						value={draft.location}
					/>
				</div>
				<div>
					<label className={labelClass} htmlFor={ids.email}>
						E-mail de Contato
					</label>
					<input
						className={inputClass}
						id={ids.email}
						onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
						type="text"
						value={draft.email}
					/>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div>
					<label className={labelClass} htmlFor={ids.github}>
						GitHub (usuário)
					</label>
					<input
						className={inputClass}
						id={ids.github}
						onChange={(event) =>
							setDraft((current) => ({ ...current, github: event.target.value }))
						}
						type="text"
						value={draft.github}
					/>
				</div>
				<div>
					<label className={labelClass} htmlFor={ids.linkedin}>
						LinkedIn
					</label>
					<input
						className={inputClass}
						id={ids.linkedin}
						onChange={(event) =>
							setDraft((current) => ({ ...current, linkedin: event.target.value }))
						}
						type="text"
						value={draft.linkedin}
					/>
				</div>
			</div>
		</div>
	);
}
