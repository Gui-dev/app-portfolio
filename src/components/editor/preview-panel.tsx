"use client";

import { Download, ExternalLink, Lock, Monitor, Moon, Smartphone, Sun } from "lucide-react";
import { type ReactElement, useState } from "react";
import { PortfolioPage } from "@/components/portfolio/portfolio-page";
import type { ColorMode, ProfileWithRelations } from "@/lib/db/schema";
import { TEMPLATES } from "@/lib/template";

type Viewport = "desktop" | "mobile";

export function PreviewPanel({
	profile,
	publicSlug,
	onColorModeChange,
}: {
	profile: ProfileWithRelations;
	publicSlug: string;
	onColorModeChange?: (mode: ColorMode) => void;
}): ReactElement {
	const [viewport, setViewport] = useState<Viewport>("desktop");
	const isLight = profile.colorMode === "light";

	return (
		<aside aria-label="Prévia do portfólio" className="flex h-full flex-col bg-canvas">
			<div className="flex items-center justify-between gap-2 border-b border-border bg-surface-2/90 px-4 py-3 backdrop-blur-[24px]">
				<div className="flex items-center gap-2">
					<span className="text-xs font-semibold uppercase leading-4 tracking-[0.6px] text-muted">
						Prévia ao vivo
					</span>
					<span className="rounded-md bg-accent/10 px-2 py-0.5 font-mono text-[11px] font-medium leading-[16.5px] text-accent-soft">
						{TEMPLATES[profile.template].name}
					</span>
				</div>
				<div role="toolbar" aria-label="Controles da prévia" className="flex items-center gap-2">
					<div className="flex items-center gap-[6px] rounded-xl border border-border bg-inset p-1">
						<button
							type="button"
							aria-label="Visualização desktop"
							aria-pressed={viewport === "desktop"}
							onClick={() => setViewport("desktop")}
							className={`flex h-6 items-center rounded-lg px-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
								viewport === "desktop"
									? "border border-border bg-border text-fg shadow-sm"
									: "border border-transparent bg-transparent text-muted"
							}`}
						>
							<Monitor aria-hidden="true" className="size-3" />
						</button>
						<button
							type="button"
							aria-label="Visualização mobile"
							aria-pressed={viewport === "mobile"}
							onClick={() => setViewport("mobile")}
							className={`flex h-6 items-center rounded-lg px-[8.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
								viewport === "mobile"
									? "border border-border bg-border text-fg shadow-sm"
									: "border border-transparent bg-transparent text-muted"
							}`}
						>
							<Smartphone aria-hidden="true" className="size-3" />
						</button>
					</div>
					<button
						type="button"
						aria-label={`Tema da prévia: ${isLight ? "Claro" : "Escuro"} — alternar`}
						aria-pressed={isLight}
						onClick={() => onColorModeChange?.(isLight ? "dark" : "light")}
						className="flex items-center gap-1.5 rounded-xl border border-border bg-inset px-3 py-1.5 text-xs font-medium leading-4 text-fg-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
					>
						{isLight ? (
							<Sun aria-hidden="true" className="size-3 text-accent-soft" />
						) : (
							<Moon aria-hidden="true" className="size-3 text-accent-soft" />
						)}
						<span>{isLight ? "Claro" : "Escuro"}</span>
					</button>
					<button
						type="button"
						disabled
						className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-inset px-3 py-1.5 text-xs font-medium leading-4 text-fg-dim disabled:cursor-not-allowed disabled:opacity-60"
					>
						<Download aria-hidden="true" className="size-3" />
						Baixar PDF
					</button>
				</div>
			</div>

			<div className="flex min-h-0 flex-1 items-start justify-center bg-canvas p-6">
				<div
					className={`flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl shadow-black/25 ${
						viewport === "desktop" ? "w-full" : "w-full max-w-[390px]"
					}`}
				>
					<div className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-surface-3 px-[14px] py-[10px]">
						<div className="flex shrink-0 items-center gap-1.5">
							<span aria-hidden="true" className="size-2.5 rounded-full bg-danger-soft" />
							<span aria-hidden="true" className="size-2.5 rounded-full bg-warning" />
							<span aria-hidden="true" className="size-2.5 rounded-full bg-success-soft" />
						</div>
						<div className="flex min-w-0 flex-1 justify-center">
							<div className="flex w-full min-w-0 max-w-[320px] items-center justify-center gap-2 rounded-lg border border-border bg-bg p-1">
								<Lock aria-hidden="true" className="size-[9px] shrink-0 text-success" />
								<span className="truncate font-mono text-[11px] leading-[16.5px]">
									<span className="text-muted">foliocraft.app/</span>
									<span className="font-bold text-fg-soft">{publicSlug}</span>
								</span>
							</div>
						</div>
						<ExternalLink aria-hidden="true" className="size-2.5 shrink-0 text-muted" />
					</div>
					<div className="min-h-0 flex-1 overflow-auto bg-bg">
						<PortfolioPage profile={profile} />
					</div>
				</div>
			</div>
		</aside>
	);
}
