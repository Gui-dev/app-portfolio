"use client";

import { Copy, Layers, Moon, Sun } from "lucide-react";
import { type ReactElement, useState } from "react";

const focusRing =
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

export function EditorHeader({ publicSlug }: { publicSlug: string }): ReactElement {
	const [isLight, setIsLight] = useState(false);

	function copyPublicUrl() {
		void navigator.clipboard?.writeText?.(`https://foliocraft.app/${publicSlug}`);
	}

	return (
		<header className="flex w-full items-center justify-between border-b border-border/80 bg-bg/80 px-6 py-4 backdrop-blur-[8px]">
			<div className="flex items-center gap-3">
				<span
					aria-hidden="true"
					className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-violet text-fg"
				>
					<Layers aria-hidden="true" className="size-[18px]" />
				</span>
				<div className="flex flex-col">
					<div className="flex items-center gap-2">
						<span className="font-display text-[18px] font-bold leading-7 tracking-[-0.45px] text-fg">
							FolioCraft
						</span>
						<span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 font-mono text-[10px] font-normal uppercase leading-[15px] tracking-[0.5px] text-accent-soft">
							SSR + SEO
						</span>
					</div>
					<span className="text-xs leading-4 text-muted">Gerador de Portfólio & Currículo</span>
				</div>
			</div>

			<div className="flex items-center gap-3">
				<div className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-1.5">
					<span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-success" />
					<span className="whitespace-nowrap font-mono text-xs leading-4">
						<span className="text-fg/80">foliocraft.app/</span>
						<span className="font-bold text-accent-soft">{publicSlug}</span>
					</span>
					<button
						aria-label="Copiar link do portfólio"
						className={`ml-1 rounded-md text-muted transition-colors hover:text-fg ${focusRing}`}
						onClick={copyPublicUrl}
						type="button"
					>
						<Copy aria-hidden="true" className="size-3" />
					</button>
				</div>
				<button
					aria-label="Alternar tema do editor"
					aria-pressed={isLight}
					className={`grid size-9 shrink-0 place-items-center rounded-xl border border-border text-fg/80 transition-colors hover:text-fg ${focusRing}`}
					onClick={() => setIsLight((current) => !current)}
					type="button"
				>
					{isLight ? (
						<Moon aria-hidden="true" className="size-4" />
					) : (
						<Sun aria-hidden="true" className="size-4" />
					)}
				</button>
			</div>
		</header>
	);
}
