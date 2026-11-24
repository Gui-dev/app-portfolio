import { ExternalLink } from "lucide-react";
import type { ReactElement, SVGProps } from "react";
import type { Project } from "@/lib/db/schema";
import { SectionHeading } from "./section-heading";

function GithubIcon(props: SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor" {...props}>
			<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.61-3.37-1.18-3.37-1.18-.46-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .26.18.58.69.48A10 10 0 0 0 12 2Z" />
		</svg>
	);
}

export function ProjectList({ projects }: { projects: Project[] }): ReactElement | null {
	if (projects.length === 0) {
		return null;
	}

	const ordered = [...projects].sort((a, b) => a.sortOrder - b.sortOrder);

	return (
		<section aria-labelledby="pf-projects-heading" className="pf-section">
			<SectionHeading id="pf-projects-heading">Projetos em Destaque</SectionHeading>
			<ul className="pf-project-grid">
				{ordered.map((project) => (
					<li key={project.id} className="pf-card pf-project-card">
						<div className="pf-project-body">
							<h3 className="pf-item-title pf-display">{project.name}</h3>
							{project.description ? <p className="pf-description">{project.description}</p> : null}
						</div>
						{project.tags.length > 0 ? (
							<ul aria-label={`Tags de ${project.name}`} className="pf-tag-list">
								{project.tags.map((tag) => (
									<li key={`${project.id}-${tag}`} className="pf-tag">
										{tag}
									</li>
								))}
							</ul>
						) : null}
						{project.repoUrl || project.demoUrl ? (
							<div className="pf-project-links">
								{project.repoUrl ? (
									<a
										href={project.repoUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="pf-project-link pf-accent"
										aria-label={`Repositório de ${project.name}`}
									>
										<GithubIcon aria-hidden="true" className="size-4" />
										<span>Repositório</span>
									</a>
								) : null}
								{project.demoUrl ? (
									<a
										href={project.demoUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="pf-project-link pf-accent"
										aria-label={`Demo de ${project.name}`}
									>
										<ExternalLink aria-hidden="true" className="size-4" />
										<span>Demo</span>
									</a>
								) : null}
							</div>
						) : null}
					</li>
				))}
			</ul>
		</section>
	);
}
