import type { ReactElement } from "react";
import { Monogram } from "@/components/portfolio/monogram";
import type { ProfileCard } from "@/lib/db/schema";

export const EXPLORE_PAGE_SIZE = 12;

function pageHref(page: number): string {
	return page === 1 ? "/explore" : `/explore/page/${page}`;
}

export function ExploreList({
	items,
	page,
	totalPages,
}: {
	items: ProfileCard[];
	page: number;
	totalPages: number;
}): ReactElement {
	return (
		<section className="mx-auto max-w-6xl px-6 py-16">
			<div className="mb-10 flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="font-mono text-xs uppercase tracking-widest text-accent-soft">
						Vitrine FolioCraft
					</p>
					<h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-fg">
						Explore portfólios
					</h1>
					<p className="mt-2 text-muted">Conheça perfis publicados por quem usa o FolioCraft.</p>
				</div>
				<span className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted">
					Página {page} de {Math.max(totalPages, 1)}
				</span>
			</div>

			{items.length === 0 ? (
				<p className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">
					Nenhum portfólio publicado ainda. Volte em breve!
				</p>
			) : (
				<ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{items.map((profile) => (
						<li key={profile.slug}>
							<a
								href={`/${profile.slug}`}
								className="flex h-full flex-col gap-5 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent"
							>
								<Monogram name={profile.fullName} style={profile.monogramStyle} />
								<div className="flex flex-col gap-2">
									<h2 className="font-display text-xl font-semibold text-fg">
										{profile.fullName || "Perfil FolioCraft"}
									</h2>
									<p className="text-sm text-muted">{profile.headline}</p>
								</div>
								{profile.skills.length > 0 ? (
									<ul className="mt-auto flex flex-wrap gap-2">
										{profile.skills.slice(0, 3).map((skill) => (
											<li
												key={skill}
												className="rounded-full border border-border px-3 py-1 text-xs text-fg-soft"
											>
												{skill}
											</li>
										))}
									</ul>
								) : null}
							</a>
						</li>
					))}
				</ul>
			)}

			{totalPages > 1 ? (
				<nav aria-label="Paginação" className="mt-12 flex items-center justify-between gap-4">
					{page > 1 ? (
						<a
							href={pageHref(page - 1)}
							className="rounded-xl border border-border px-4 py-2 text-sm text-fg-soft hover:border-accent"
						>
							Página {page - 1}
						</a>
					) : (
						<span />
					)}
					{page < totalPages ? (
						<a
							href={pageHref(page + 1)}
							className="rounded-xl border border-border px-4 py-2 text-sm text-fg-soft hover:border-accent"
						>
							Página {page + 1}
						</a>
					) : (
						<span />
					)}
				</nav>
			) : null}
		</section>
	);
}
