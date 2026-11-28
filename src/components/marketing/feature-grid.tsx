import { FileDown, Palette, Search } from "lucide-react";

const features = [
	{
		icon: Search,
		title: "SEO técnico",
		description:
			"Metadata, JSON-LD e páginas estáticas com ISR para seu perfil aparecer nas buscas.",
	},
	{
		icon: Palette,
		title: "Temas",
		description: "Três templates editoriais, com versões claras e escuras e troca em um clique.",
	},
	{
		icon: FileDown,
		title: "PDF",
		description: "Exporte um currículo fiel à sua página pública, pronto para compartilhar.",
	},
];

export function FeatureGrid() {
	return (
		<section
			aria-labelledby="features-title"
			className="border-t border-border bg-surface/40 px-6 py-20"
		>
			<div className="mx-auto max-w-6xl">
				<h2 id="features-title" className="font-display text-3xl font-bold text-fg">
					Tudo para sua história brilhar
				</h2>
				<p className="mt-3 max-w-2xl text-muted">
					Do primeiro rascunho ao PDF final, cada detalhe foi pensado para valorizar o seu trabalho.
				</p>

				<div className="mt-12 grid gap-6 md:grid-cols-3">
					{features.map(({ icon: Icon, title, description }) => (
						<article key={title} className="rounded-2xl border border-border bg-surface p-6">
							<span className="grid size-11 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent-soft">
								<Icon aria-hidden="true" className="size-5" />
							</span>
							<h3 className="mt-5 font-display text-xl font-semibold text-fg">{title}</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
