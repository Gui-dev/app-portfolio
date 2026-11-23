export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
	"api",
	"auth",
	"dashboard",
	"explore",
	"login",
	"signup",
	"forgot-password",
	"reset-password",
	"settings",
	"print",
	"robots.txt",
	"sitemap.xml",
	"favicon.ico",
	"_next",
	"opengraph-image",
]);

export function normalizeSlug(raw: string): string {
	const normalized = raw
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/-{2,}/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 30)
		.replace(/^-+|-+$/g, "");
	return normalized;
}

export function isReservedSlug(slug: string): boolean {
	return RESERVED_SLUGS.has(slug.toLowerCase());
}

export function validateSlug(
	slug: string,
): { ok: true } | { ok: false; reason: "length" | "charset" | "reserved" } {
	if (slug.length < 3 || slug.length > 30) {
		return { ok: false, reason: "length" };
	}
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
		return { ok: false, reason: "charset" };
	}
	if (isReservedSlug(slug)) {
		return { ok: false, reason: "reserved" };
	}
	return { ok: true };
}
