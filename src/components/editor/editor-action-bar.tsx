"use client";

import { FileText, Loader2, Rocket } from "lucide-react";
import type { ReactElement } from "react";
import type { AutosaveStatus } from "./use-autosave";

const focusRing =
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2";

function statusLabel(status: AutosaveStatus): string {
	switch (status) {
		case "saving":
			return "Salvando rascunho...";
		case "saved":
			return "Rascunho sincronizado";
		case "error":
			return "Erro ao salvar rascunho";
		default:
			return "Rascunho sincronizado";
	}
}

export function EditorActionBar({
	status = "idle",
	onPublish,
	publishPending = false,
	isPublished = false,
}: {
	status?: AutosaveStatus;
	onPublish?: () => void;
	publishPending?: boolean;
	isPublished?: boolean;
}): ReactElement {
	return (
		<footer className="flex shrink-0 items-center justify-between border-t border-border/80 bg-surface-2 px-6 py-3.5">
			<span aria-live="polite" className="pl-2 text-xs leading-4 text-muted">
				{statusLabel(status)}
			</span>
			<div className="flex items-center gap-2.5">
				<button
					className={`inline-flex items-center gap-1.5 rounded-xl border border-border-strong px-3.5 py-2 text-xs font-medium leading-4 text-fg-soft transition-colors hover:bg-border/40 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
					disabled
					type="button"
				>
					<FileText aria-hidden="true" className="size-3 text-danger" />
					Exportar PDF
				</button>
				<button
					className={`inline-flex items-center gap-1.5 rounded-xl bg-accent-strong px-4 py-2 text-xs font-semibold leading-4 text-fg shadow-md shadow-accent-strong/20 transition-colors hover:bg-accent-strong/90 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
					disabled={publishPending}
					onClick={onPublish}
					type="button"
				>
					{publishPending ? (
						<Loader2 aria-hidden="true" className="size-3 animate-spin" />
					) : (
						<Rocket aria-hidden="true" className="size-3" />
					)}
					{isPublished ? "Atualizar publicação" : "Salvar e Publicar"}
				</button>
			</div>
		</footer>
	);
}
