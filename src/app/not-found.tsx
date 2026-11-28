import Link from "next/link";
import type { ReactElement } from "react";

export default function NotFound(): ReactElement {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-bg px-6 text-center">
			<p className="font-mono text-sm uppercase tracking-[0.2em] text-accent-soft">404</p>
			<h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">Página não encontrada</h1>
			<p className="max-w-md text-sm leading-relaxed text-muted">
				O endereço que você procura não existe ou não está mais disponível.
			</p>
			<Link
				className="rounded-xl bg-accent-strong px-5 py-3 text-sm font-semibold text-fg transition-colors hover:bg-accent-strong/90"
				href="/"
			>
				Voltar para o início
			</Link>
		</main>
	);
}
