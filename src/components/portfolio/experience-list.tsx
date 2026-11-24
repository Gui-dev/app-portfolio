import type { ReactElement } from "react";
import type { Experience } from "@/lib/db/schema";
import { EXPERIENCE_KINDS } from "@/lib/experience-kinds";
import { SectionHeading } from "./section-heading";

export function ExperienceList({
	experiences,
}: {
	experiences: Experience[];
}): ReactElement | null {
	if (experiences.length === 0) {
		return null;
	}

	const ordered = [...experiences].sort((a, b) => a.sortOrder - b.sortOrder);

	return (
		<section aria-labelledby="pf-experience-heading" className="pf-section">
			<SectionHeading id="pf-experience-heading">Experiência Profissional</SectionHeading>
			<ul className="pf-experience-list">
				{ordered.map((experience) => (
					<li key={experience.id} className="pf-card pf-experience-card">
						<div className="pf-experience-header">
							<div className="pf-experience-title">
								<h3 className="pf-item-title pf-display">{experience.role}</h3>
								<p className="pf-company pf-accent">{experience.company}</p>
							</div>
							<div className="pf-experience-meta">
								<span className="pf-kind-badge">{EXPERIENCE_KINDS[experience.kind].label}</span>
								{experience.period ? <span className="pf-period">{experience.period}</span> : null}
							</div>
						</div>
						{experience.description ? (
							<p className="pf-description">{experience.description}</p>
						) : null}
					</li>
				))}
			</ul>
		</section>
	);
}
