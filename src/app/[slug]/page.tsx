import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache, type ReactElement } from "react";
import { PortfolioPage } from "@/components/portfolio/portfolio-page";
import {
	getPublicProfileBySlug,
	listPublishedProfiles,
	resolveSlugRedirect,
} from "@/lib/db/queries";
import { buildPersonJsonLd, buildProfileMetadata, safeJsonLd } from "@/lib/seo";
import { normalizeSlug } from "@/lib/slug";

export const revalidate = 300;
export const dynamicParams = true;

const loadPublicProfile = cache(getPublicProfileBySlug);

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
	const { items } = await listPublishedProfiles({ page: 1, pageSize: 100 });
	return items.flatMap((item) => (item.slug ? [{ slug: item.slug }] : []));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug: rawSlug } = await params;
	const slug = normalizeSlug(rawSlug);
	if (!slug) return {};

	const profile = await loadPublicProfile(slug);
	return profile ? buildProfileMetadata(profile) : {};
}

export default async function PublicProfilePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<ReactElement> {
	const { slug: rawSlug } = await params;
	const slug = normalizeSlug(rawSlug);
	if (!slug) notFound();

	const redirectTarget = await resolveSlugRedirect(slug);
	if (redirectTarget && redirectTarget !== slug) {
		permanentRedirect(`/${redirectTarget}`);
	}

	const profile = await loadPublicProfile(slug);
	if (!profile) notFound();

	return (
		<div className="min-h-screen bg-bg">
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: safeJsonLd escapes markup
				dangerouslySetInnerHTML={{ __html: safeJsonLd(buildPersonJsonLd(profile)) }}
			/>
			<header className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4">
				<span className="font-mono text-xs text-muted">/{profile.slug}</span>
				<button
					className="cursor-not-allowed rounded-xl border border-border-strong px-3 py-2 text-xs font-medium text-fg-soft opacity-60"
					disabled
					type="button"
				>
					Baixar PDF
				</button>
			</header>
			<main className="mx-auto max-w-3xl px-4 pb-16">
				<PortfolioPage profile={profile} />
			</main>
		</div>
	);
}
