import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import type { ReactElement } from "react";
import { PortfolioPage } from "@/components/portfolio/portfolio-page";
import { getPublicProfileBySlug, resolveSlugRedirect } from "@/lib/db/queries";
import { normalizeSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Impressão | FolioCraft",
	robots: { index: false, follow: false },
};

export default async function PrintProfilePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<ReactElement> {
	const { slug: rawSlug } = await params;
	const slug = normalizeSlug(rawSlug);
	if (!slug) notFound();

	const redirectTarget = await resolveSlugRedirect(slug);
	if (redirectTarget && redirectTarget !== slug) {
		permanentRedirect(`/${redirectTarget}/print`);
	}

	const profile = await getPublicProfileBySlug(slug);
	if (!profile) notFound();

	return (
		<div className="min-h-screen bg-bg">
			<PortfolioPage profile={profile} />
		</div>
	);
}
