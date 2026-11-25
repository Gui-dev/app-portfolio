"use client";

import { Lightbulb } from "lucide-react";
import type { ReactElement } from "react";

export function BeginnerHelper({ onLoad }: { onLoad: () => void }): ReactElement {
	return (
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
					onClick={onLoad}
					type="button"
				>
					✨ Carregar Perfil Primeiro Emprego
				</button>
			</div>
		</section>
	);
}
