"use client";

import { FileText, Rocket } from "lucide-react";
import type { ReactElement } from "react";

const focusRing =
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2";

export function EditorActionBar(): ReactElement {
	return (
		<footer className="flex shrink-0 items-center justify-between border-t border-border/80 bg-surface-2 px-6 py-3.5">
			<span className="pl-2 text-xs leading-4 text-muted">Rascunho sincronizado</span>
			<div className="flex items-center gap-2.5">
				<button
					className={`inline-flex items-center gap-1.5 rounded-xl border border-border-strong px-3.5 py-2 text-xs font-medium leading-4 text-fg-soft transition-colors hover:bg-border/40 ${focusRing}`}
					type="button"
				>
					<FileText aria-hidden="true" className="size-3 text-danger" />
					Exportar PDF
				</button>
				<button
					className={`inline-flex items-center gap-1.5 rounded-xl bg-accent-strong px-4 py-2 text-xs font-semibold leading-4 text-fg shadow-md shadow-accent-strong/20 transition-colors hover:bg-accent-strong/90 ${focusRing}`}
					type="button"
				>
					<Rocket aria-hidden="true" className="size-3" />
					Salvar e Publicar
				</button>
			</div>
		</footer>
	);
}
