"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

export function RepeatableItem({
	title,
	badge,
	children,
	onMoveUp,
	onMoveDown,
	onRemove,
	canMoveUp,
	canMoveDown,
	removeLabel,
}: {
	title: string;
	badge?: string;
	children: ReactNode;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onRemove: () => void;
	canMoveUp: boolean;
	canMoveDown: boolean;
	removeLabel: string;
}): ReactElement {
	return (
		<article
			aria-label={title}
			className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-surface-3 p-4"
		>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-wrap items-center gap-2">
					{badge ? (
						<span className="font-mono text-xs font-bold leading-4 text-accent-soft">{badge}</span>
					) : null}
					<span className="text-xs font-medium leading-4 text-fg-dim">{title}</span>
				</div>
				<div className="flex items-center gap-1">
					<button
						aria-label={`Mover ${title} para cima`}
						className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3"
						disabled={!canMoveUp}
						onClick={onMoveUp}
						type="button"
					>
						<ChevronUp aria-hidden="true" className="size-4" />
					</button>
					<button
						aria-label={`Mover ${title} para baixo`}
						className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3"
						disabled={!canMoveDown}
						onClick={onMoveDown}
						type="button"
					>
						<ChevronDown aria-hidden="true" className="size-4" />
					</button>
					<button
						aria-label={removeLabel}
						className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs leading-4 text-muted transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-3"
						onClick={onRemove}
						type="button"
					>
						<Trash2 aria-hidden="true" className="size-3" />
						Remover
					</button>
				</div>
			</div>
			{children}
		</article>
	);
}
