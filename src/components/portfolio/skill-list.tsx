import type { ReactElement } from "react";
import type { Skill } from "@/lib/db/schema";
import { SectionHeading } from "./section-heading";

export function SkillList({ skills }: { skills: Skill[] }): ReactElement | null {
	if (skills.length === 0) {
		return null;
	}

	const ordered = [...skills].sort((a, b) => a.sortOrder - b.sortOrder);

	return (
		<section aria-labelledby="pf-skills-heading" className="pf-section">
			<SectionHeading id="pf-skills-heading">Stack &amp; Tecnologias</SectionHeading>
			<ul aria-label="Habilidades" className="pf-skill-list">
				{ordered.map((skill) => (
					<li key={skill.id} className="pf-skill-pill">
						{skill.name}
					</li>
				))}
			</ul>
		</section>
	);
}
