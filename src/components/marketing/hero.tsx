import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
	return (
		<section className="relative overflow-hidden px-6 pb-24 pt-24">
			<div
				aria-hidden="true"
				className="pointer-events-none absolute left-1/2 top-[-14rem] size-[38rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent via-accent-violet to-accent-2 opacity-20 blur-3xl"
			/>

			<div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
				<span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-accent-soft">
					SSR + SEO
				</span>

				<h1 className="mt-8 font-display text-5xl font-bold leading-[1.05] tracking-tight text-fg sm:text-6xl">
					O portfólio que abre portas.
				</h1>

				<p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
					Crie, publique e exporte seu portfólio profissional em minutos. SSR, SEO técnico e três
					templates para você focar no que importa: sua história.
				</p>

				<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
					<Button asChild size="lg">
						<a href="/signup">
							Criar meu portfólio
							<ArrowRight aria-hidden="true" className="size-4" />
						</a>
					</Button>
					<Button asChild variant="secondary" size="lg">
						<a href="/bruce-wayne">
							<Play aria-hidden="true" className="size-4" />
							Ver demo
						</a>
					</Button>
				</div>
			</div>
		</section>
	);
}
