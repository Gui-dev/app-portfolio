import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
			<div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-6">
				<div className="flex items-center gap-3">
					<span
						aria-hidden="true"
						className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-violet font-display text-lg font-bold text-fg shadow-lg shadow-accent/20"
					>
						F
					</span>
					<div className="flex flex-col">
						<span className="font-display text-lg font-bold tracking-tight text-fg">
							FolioCraft
						</span>
						<span className="text-xs text-muted">Gerador de portfólio & currículo</span>
					</div>
					<Badge variant="accent" className="ml-2 hidden sm:inline-flex">
						SSR + SEO
					</Badge>
				</div>

				<nav aria-label="Navegação principal" className="flex items-center gap-4">
					<a href="/explore" className="text-sm text-muted transition-colors hover:text-fg">
						Explore
					</a>
					<a href="/login" className="text-sm text-muted transition-colors hover:text-fg">
						Login
					</a>
					<Button asChild size="sm">
						<a href="/signup">Criar meu portfólio</a>
					</Button>
				</nav>
			</div>
		</header>
	);
}
