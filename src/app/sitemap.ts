import type { MetadataRoute } from "next";
import { listPublishedProfileSlugs } from "@/lib/db/queries";
import { env } from "@/lib/env";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
	const slugs = await listPublishedProfileSlugs();

	return [
		{
			url: `${baseUrl}/`,
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${baseUrl}/explore`,
			changeFrequency: "daily",
			priority: 0.8,
		},
		...slugs.map((slug) => ({
			url: `${baseUrl}/${slug}`,
			changeFrequency: "monthly" as const,
			priority: 0.7,
		})),
	];
}
