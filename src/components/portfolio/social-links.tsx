import { Mail, MapPin } from "lucide-react";
import type { ReactElement, SVGProps } from "react";

function GithubIcon(props: SVGProps<SVGSVGElement>): ReactElement {
	return (
		<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="currentColor" {...props}>
			<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.61-3.37-1.18-3.37-1.18-.46-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .26.18.58.69.48A10 10 0 0 0 12 2Z" />
		</svg>
	);
}

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
						<GithubIcon aria-hidden="true" className="size-4" />
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
						<LinkedinIcon aria-hidden="true" className="size-4" />
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
