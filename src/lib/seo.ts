import type { Metadata } from "next";
import type { ProfileWithRelations } from "@/lib/db/schema";
import { env } from "@/lib/env";

const BASE_URL = env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
const MAX_DESCRIPTION_LENGTH = 160;
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

function absoluteUrl(path: string): string {
	return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function cleanText(value: string | null | undefined): string {
	return (value ?? "")
		.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
}

function truncate(text: string): string {
	return text.length <= MAX_DESCRIPTION_LENGTH
		? text
		: `${text.slice(0, MAX_DESCRIPTION_LENGTH - 1)}…`;
}

function displayName(profile: ProfileWithRelations): string {
	return cleanText(profile.fullName) || "Perfil";
}

function displayHeadline(profile: ProfileWithRelations): string {
	return cleanText(profile.headline) || "Portfólio";
}

function descriptionText(profile: ProfileWithRelations): string {
	const bio = cleanText(profile.bio);
	return truncate(bio || `${displayName(profile)} — ${displayHeadline(profile)}`);
}

export function buildProfileOgAlt(profile: ProfileWithRelations): string {
	return `${displayName(profile)} — ${displayHeadline(profile)} no FolioCraft`;
}

export function buildProfileMetadata(profile: ProfileWithRelations): Metadata {
	const title = `${displayName(profile)} — ${displayHeadline(profile)}`;
	const description = descriptionText(profile);
	const canonical = absoluteUrl(`/${profile.slug}`);
	const imageUrl = absoluteUrl(`/${profile.slug}/opengraph-image`);

	return {
		title: `${title} | FolioCraft`,
		description,
		alternates: { canonical },
		openGraph: {
			type: "profile",
			title,
			description,
			url: canonical,
			siteName: "FolioCraft",
			locale: "pt_BR",
			images: [
				{
					url: imageUrl,
					width: OG_WIDTH,
					height: OG_HEIGHT,
					alt: buildProfileOgAlt(profile),
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [imageUrl],
		},
	};
}

export function buildPersonJsonLd(profile: ProfileWithRelations): Record<string, unknown> {
	const sameAs = [profile.githubUrl, profile.linkedinUrl]
		.map((url) => url?.trim())
		.filter((url): url is string => Boolean(url));
	const payload: Record<string, unknown> = {
		"@context": "https://schema.org",
		"@type": "Person",
		name: displayName(profile),
		jobTitle: displayHeadline(profile),
		description: profile.bio?.trim() || descriptionText(profile),
		url: absoluteUrl(`/${profile.slug}`),
		image: absoluteUrl(`/${profile.slug}/opengraph-image`),
	};

	if (sameAs.length > 0) payload.sameAs = sameAs;
	if (profile.location?.trim()) {
		payload.address = {
			"@type": "PostalAddress",
			addressLocality: cleanText(profile.location),
		};
	}

	return payload;
}

export function safeJsonLd(payload: Record<string, unknown>): string {
	return JSON.stringify(payload).replace(/</g, "\\u003c");
}
