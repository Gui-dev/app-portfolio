import type { ReactElement } from "react";
import { cn } from "@/lib/cn";
import type { ProfileWithRelations } from "@/lib/db/schema";
import { templateStyle } from "@/lib/template";
import { ExperienceList } from "./experience-list";
import { Monogram } from "./monogram";
import { ProjectList } from "./project-list";
import { SkillList } from "./skill-list";
import { ContactRow, SocialLinks } from "./social-links";

export function PortfolioPage({
	profile,
	className,
}: {
	profile: ProfileWithRelations;
	className?: string;
}): ReactElement {
	const fullName = profile.fullName ?? "";
	const headline = profile.headline ?? "";
	const bio = profile.bio ?? "";
	const ariaLabel = fullName ? `Portfólio de ${fullName}` : "Portfólio";
	const year = new Date().getFullYear();

	return (
		<article
			aria-label={ariaLabel}
			className={cn("pf-root", className)}
			data-template={profile.template}
			data-mode={profile.colorMode}
			style={templateStyle(profile.template, profile.colorMode)}
		>
			<div className="pf-container">
				<header className="pf-hero pf-section">
					<Monogram name={profile.fullName} style={profile.monogramStyle} />
					<div className="pf-hero-copy">
						{fullName ? <h1 className="pf-name pf-display">{fullName}</h1> : null}
						{headline ? <p className="pf-headline">{headline}</p> : null}
						<ContactRow location={profile.location} contactEmail={profile.contactEmail} />
					</div>
				</header>

				{bio || profile.githubUrl || profile.linkedinUrl ? (
					<div className="pf-intro pf-section">
						{bio ? <p className="pf-bio">{bio}</p> : null}
						<SocialLinks githubUrl={profile.githubUrl} linkedinUrl={profile.linkedinUrl} />
					</div>
				) : null}

				<SkillList skills={profile.skills} />
				<ExperienceList experiences={profile.experiences} />
				<ProjectList projects={profile.projects} />

				<footer aria-label="Rodapé do portfólio" className="pf-footer" role="contentinfo">
					<div className="pf-footer-divider" aria-hidden="true" />
					<div className="pf-footer-content">
						<p className="pf-footer-copy">
							© {year}
							{fullName ? ` ${fullName}` : ""}
						</p>
						<p className="pf-footer-brand no-print">Gerado com FolioCraft</p>
					</div>
				</footer>
			</div>
		</article>
	);
}
