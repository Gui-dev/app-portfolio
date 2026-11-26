import { getPublicProfileBySlug } from "@/lib/db/queries";
import { env } from "@/lib/env";
import { createPlaywrightRenderer, renderProfilePdfResponse } from "@/lib/pdf";
import { normalizeSlug } from "@/lib/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const renderer = createPlaywrightRenderer();

function notFound(): Response {
	return new Response(null, { status: 404 });
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
	const { slug: rawSlug } = await params;
	const slug = normalizeSlug(rawSlug);
	if (!slug) return notFound();

	const profile = await getPublicProfileBySlug(slug);
	if (!profile) return notFound();

	const currentSlug = profile.slug ?? slug;
	const baseUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
	const printUrl = `${baseUrl}/${currentSlug}/print`;

	return renderProfilePdfResponse(renderer, printUrl, currentSlug);
}
