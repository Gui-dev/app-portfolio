import type { ReactElement } from "react";
import { EXPLORE_PAGE_SIZE, ExploreList } from "@/components/marketing/explore-list";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { listPublishedProfiles } from "@/lib/db/queries";

export const revalidate = 300;

export default async function ExplorePage(): Promise<ReactElement> {
	const { items, total } = await listPublishedProfiles({ page: 1 });

	return (
		<div className="flex min-h-screen flex-col">
			<SiteHeader />
			<main className="flex-1">
				<ExploreList items={items} page={1} totalPages={Math.ceil(total / EXPLORE_PAGE_SIZE)} />
			</main>
			<SiteFooter />
		</div>
	);
}
