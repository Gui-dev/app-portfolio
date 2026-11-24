import { ExternalLink } from "lucide-react";
import type { ReactElement } from "react";
import type { Project } from "@/lib/db/schema";
import { GithubIcon } from "./icons";
import { SectionHeading } from "./section-heading";

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
										<GithubIcon aria-hidden="true" className="pf-icon size-4" />
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
										<ExternalLink aria-hidden="true" className="pf-icon size-4" />
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
