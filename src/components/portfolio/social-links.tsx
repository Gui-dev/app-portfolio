import { Mail, MapPin } from "lucide-react";
import type { ReactElement, SVGProps } from "react";
import { GithubIcon } from "./icons";

function LinkedinIcon(props: SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor" {...props}>
			<path d="M6.94 8.5a1.56 1.56 0 1 1 0-3.12 1.56 1.56 0 0 1 0 3.12ZM5.6 9.9h2.68V19H5.6V9.9Zm4.36 0h2.56v1.24h.04c.36-.68 1.23-1.4 2.53-1.4 2.71 0 3.21 1.78 3.21 4.1V19h-2.68v-4.57c0-1.09-.02-2.49-1.52-2.49-1.52 0-1.75 1.19-1.75 2.41V19H9.96V9.9Z" />
		</svg>
	);
}

export function SocialLinks({
	githubUrl,
	linkedinUrl,
}: {
	githubUrl: string | null;
	linkedinUrl: string | null;
}): ReactElement | null {
	const hasGithub = Boolean(githubUrl);
	const hasLinkedin = Boolean(linkedinUrl);
	if (!hasGithub && !hasLinkedin) {
		return null;
	}

	return (
		<ul aria-label="Redes sociais" className="pf-social-list">
			{hasGithub ? (
				<li>
					<a
						href={githubUrl ?? undefined}
						target="_blank"
						rel="noopener noreferrer"
						className="pf-social-link pf-accent"
					>
						<GithubIcon aria-hidden="true" className="pf-icon size-4" />
						<span>GitHub</span>
					</a>
				</li>
			) : null}
			{hasLinkedin ? (
				<li>
					<a
						href={linkedinUrl ?? undefined}
						target="_blank"
						rel="noopener noreferrer"
						className="pf-social-link pf-accent"
					>
						<LinkedinIcon aria-hidden="true" className="pf-icon size-4" />
						<span>LinkedIn</span>
					</a>
				</li>
			) : null}
		</ul>
	);
}

export function ContactRow({
	location,
	contactEmail,
}: {
	location: string | null;
	contactEmail: string | null;
}): ReactElement | null {
	const hasLocation = Boolean(location?.trim());
	const hasEmail = Boolean(contactEmail?.trim());
	if (!hasLocation && !hasEmail) {
		return null;
	}

	return (
		<ul aria-label="Contato" className="pf-contact-list">
			{hasLocation ? (
				<li className="pf-contact-item">
					<MapPin aria-hidden="true" className="size-4" />
					<span>{location}</span>
				</li>
			) : null}
			{hasEmail ? (
				<li className="pf-contact-item">
					<Mail aria-hidden="true" className="size-4" />
					<a href={`mailto:${contactEmail}`} className="pf-accent">
						{contactEmail}
					</a>
				</li>
			) : null}
		</ul>
	);
}
