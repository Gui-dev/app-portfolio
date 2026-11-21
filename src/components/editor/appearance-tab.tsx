"use client";

import { Moon, Sun } from "lucide-react";
import { type ReactElement, useId, useState } from "react";

type TemplateId = "minimal" | "developer" | "modern";
type ColorMode = "light" | "dark";

type TemplateOption = {
	id: TemplateId;
	name: string;
	description: string;
	nameClassName: string;
};

const TEMPLATE_OPTIONS: TemplateOption[] = [
	{
		id: "minimal",
		name: "Minimal",
		description: "Editorial, tipografia serifada e divisórias limpas.",
		nameClassName: "font-serif font-semibold",
	},
	{
		id: "developer",
		name: "Developer",
		description: "Estética terminal, JetBrains Mono e destaque Emerald.",
		nameClassName: "font-mono font-bold",
	},
	{
		id: "modern",
		name: "Modern",
		description: "SaaS moderno, cards elevados e acentos Indigo.",
		nameClassName: "font-display font-bold",
	},
];

const CARD_FOCUS =
	"has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg";

function TemplatePreview({ template }: { template: TemplateId }): ReactElement {
	if (template === "minimal") {
		return (
			<div
				aria-hidden="true"
				className="flex h-16 flex-col justify-between rounded-xl border border-template-minimal-border bg-template-minimal-surface p-2.5"
			>
				<div className="h-2 w-[45%] rounded bg-template-minimal-ink" />
				<div className="flex flex-col gap-1">
					<div className="h-1 w-full rounded bg-template-minimal-line" />
					<div className="h-1 w-3/4 rounded bg-template-minimal-line" />
				</div>
			</div>
		);
	}

	if (template === "developer") {
		return (
			<div
				aria-hidden="true"
				className="flex h-16 flex-col justify-between rounded-xl border border-template-developer-border bg-template-developer-surface p-2.5"
			>
				<div className="flex items-center gap-1">
					<span className="size-2 rounded-full bg-success-soft" />
					<div className="h-2 w-[45%] rounded bg-success-soft/80" />
				</div>
				<div className="flex flex-col gap-1">
					<span className="font-mono text-[8px] leading-3 text-template-developer-comment">
						{"// fullstack.ts"}
					</span>
					<div className="h-1 w-2/3 rounded bg-template-developer-line" />
				</div>
			</div>
		);
	}

	return (
		<div
			aria-hidden="true"
			className="flex h-16 flex-col justify-between rounded-xl border border-accent/30 bg-[linear-gradient(162deg,var(--color-template-modern-glow)_0%,var(--color-inset)_50%,var(--color-template-modern-deep)_100%)] p-2.5"
		>
			<div className="h-2 w-[45%] rounded bg-accent-soft" />
			<div className="flex gap-1.5">
				<div className="h-4 w-[48%] rounded border border-white/10 bg-white/10" />
				<div className="h-4 w-[48%] rounded border border-white/10 bg-white/10" />
			</div>
		</div>
	);
}

export function AppearanceTab(): ReactElement {
	const [template, setTemplate] = useState<TemplateId>("modern");
	const [colorMode, setColorMode] = useState<ColorMode>("dark");
	const templateLabelId = useId();
	const colorModeLabelId = useId();

	return (
		<div className="flex w-full flex-col gap-6">
			<header className="flex flex-col">
				<h2 className="font-display text-base font-bold leading-6 text-fg">
					Personalização Visual do Portfólio
				</h2>
				<p className="text-xs leading-4 text-muted">
					Escolha a identidade visual da sua página pública e o esquema de cores padrão.
				</p>
			</header>

			<section className="flex flex-col gap-3">
				<h3 className="text-xs font-semibold leading-4 text-muted" id={templateLabelId}>
					1. Escolha o Template
				</h3>
				<div
					aria-labelledby={templateLabelId}
					className="grid gap-[14px] sm:grid-cols-3"
					role="radiogroup"
				>
					{TEMPLATE_OPTIONS.map((option) => {
						const selected = template === option.id;
						return (
							<label
								className={`flex h-[173.75px] cursor-pointer flex-col gap-3 rounded-2xl border bg-surface-3 p-4 transition-colors ${CARD_FOCUS} ${
									selected
										? "border-accent shadow-md shadow-accent/10"
										: "border-border hover:border-border-strong"
								}`}
								key={option.id}
							>
								<input
									checked={selected}
									className="sr-only"
									name="template"
									onChange={() => setTemplate(option.id)}
									type="radio"
									value={option.id}
								/>
								<TemplatePreview template={option.id} />
								<div className="flex h-5 items-center justify-between gap-2">
									<span className={`text-sm leading-5 text-fg ${option.nameClassName}`}>
										{option.name}
									</span>
									{selected ? (
										<span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold leading-5 text-accent">
											Ativo
										</span>
									) : null}
								</div>
								<p className="text-[11px] leading-[17.88px] text-muted">{option.description}</p>
							</label>
						);
					})}
				</div>
			</section>

			<section className="flex flex-col gap-3 pt-2">
				<h3 className="text-xs font-semibold leading-4 text-muted" id={colorModeLabelId}>
					2. Esquema de Cores do Portfólio
				</h3>
				<div
					aria-labelledby={colorModeLabelId}
					className="grid gap-3 sm:grid-cols-2"
					role="radiogroup"
				>
					<label
						className={`flex h-[68px] cursor-pointer items-center gap-3 rounded-2xl border bg-surface-3 p-[14px] transition-colors ${CARD_FOCUS} ${
							colorMode === "light" ? "border-accent" : "border-border hover:border-border-strong"
						}`}
					>
						<input
							checked={colorMode === "light"}
							className="sr-only"
							name="color-mode"
							onChange={() => setColorMode("light")}
							type="radio"
							value="light"
						/>
						<span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-appearance-light-bg">
							<Sun aria-hidden="true" className="size-4 text-appearance-light-icon" />
						</span>
						<span className="flex min-w-0 flex-col">
							<span className="text-xs font-bold leading-4 text-fg">Light Mode</span>
							<span className="text-[11px] leading-[16.5px] text-fg-subtle">Claro e luminoso</span>
						</span>
					</label>

					<label
						className={`flex h-[68px] cursor-pointer items-center gap-3 rounded-2xl border bg-surface-3 p-[14px] transition-colors ${CARD_FOCUS} ${
							colorMode === "dark" ? "border-accent" : "border-border hover:border-border-strong"
						}`}
					>
						<input
							checked={colorMode === "dark"}
							className="sr-only"
							name="color-mode"
							onChange={() => setColorMode("dark")}
							type="radio"
							value="dark"
						/>
						<span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/15">
							<Moon aria-hidden="true" className="size-4 text-accent-soft" />
						</span>
						<span className="flex min-w-0 flex-col">
							<span className="text-xs font-bold leading-4 text-fg">Dark Mode</span>
							<span className="text-[11px] leading-[16.5px] text-fg-subtle">
								Sofisticado e noturno
							</span>
						</span>
					</label>
				</div>
			</section>
		</div>
	);
}
