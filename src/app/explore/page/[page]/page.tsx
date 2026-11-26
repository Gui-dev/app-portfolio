import { notFound, permanentRedirect } from "next/navigation";
import type { ReactElement } from "react";
import { EXPLORE_PAGE_SIZE, ExploreList } from "@/components/marketing/explore-list";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { listPublishedProfiles } from "@/lib/db/queries";

export const revalidate = 300;

export async function generateStaticParams(): Promise<Array<{ page: string }>> {
	const { total } = await listPublishedProfiles({ page: 1, pageSize: 1 });
	const totalPages = Math.ceil(total / EXPLORE_PAGE_SIZE);

	return Array.from({ length: Math.max(totalPages - 1, 0) }, (_, index) => ({
		page: String(index + 2),
	}));
}

export default async function ExplorePageNumber({
	params,
}: {
	params: Promise<{ page: string }>;
}): Promise<ReactElement> {
	const { page: rawPage } = await params;
	const page = Number(rawPage);
	if (!Number.isInteger(page) || page < 1) notFound();
	if (page === 1) permanentRedirect("/explore");

	const { items, total } = await listPublishedProfiles({ page });
	const totalPages = Math.ceil(total / EXPLORE_PAGE_SIZE);
	if (page > Math.max(totalPages, 1)) notFound();

	return (
		<div className="flex min-h-screen flex-col">
			<SiteHeader />
			<main className="flex-1">
				<ExploreList items={items} page={page} totalPages={totalPages} />
			</main>
			<SiteFooter />
		</div>
	);
}
