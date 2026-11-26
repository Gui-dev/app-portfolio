import { describe, expect, it, vi } from "vitest";
import type { ProfileWithRelations } from "@/lib/db/schema";

vi.mock("@/lib/env", () => ({
	env: { NEXT_PUBLIC_APP_URL: "https://foliocraft.app" },
}));

import { buildPersonJsonLd, buildProfileMetadata, buildProfileOgAlt, safeJsonLd } from "./seo";

function makeProfile(overrides: Partial<ProfileWithRelations> = {}): ProfileWithRelations {
	return {
		id: "profile-id",
		userId: "user-id",
		slug: "bruce-wayne",
		fullName: "Bruce Wayne",
		headline: "CEO & Filantropo",
		bio: "Lidera a Wayne Enterprises e apoia causas sociais.",
		location: "Gotham City",
		contactEmail: "bruce@wayne.dev",
		githubUrl: "https://github.com/bruce-wayne",
		linkedinUrl: "https://www.linkedin.com/in/bruce-wayne",
		monogramStyle: "gradient",
		template: "modern",
		colorMode: "dark",
		isPublished: true,
		publishedAt: new Date("2026-01-01T00:00:00.000Z"),
		createdAt: new Date("2026-01-01T00:00:00.000Z"),
		updatedAt: new Date("2026-01-01T00:00:00.000Z"),
		experiences: [],
		projects: [],
		skills: [],
		...overrides,
	};
}

describe("profile SEO", () => {
	it("should build the profile title", () => {
		expect(buildProfileMetadata(makeProfile()).title).toBe(
			"Bruce Wayne — CEO & Filantropo | FolioCraft",
		);
	});

	it("should truncate the description to exactly 160 characters", () => {
		const metadata = buildProfileMetadata(makeProfile({ bio: "a".repeat(400) }));
		expect(metadata.description).toBe(`${"a".repeat(159)}…`);
		expect(metadata.description).toHaveLength(160);
	});

	it("should remove markup from the description", () => {
		const metadata = buildProfileMetadata(
			makeProfile({ bio: "<script>alert(1)</script> Lidera equipes" }),
		);
		expect(metadata.description).toBe("Lidera equipes");
	});

	it("should set an absolute canonical url", () => {
		expect(buildProfileMetadata(makeProfile()).alternates?.canonical).toBe(
			"https://foliocraft.app/bruce-wayne",
		);
	});

	it("should include the absolute profile og image url", () => {
		const og = buildProfileMetadata(makeProfile()).openGraph as {
			images?: Array<{ url: string; alt: string }>;
		};
		expect(og.images?.[0]?.url).toBe("https://foliocraft.app/bruce-wayne/opengraph-image");
		expect(og.images?.[0]?.alt).toBe(buildProfileOgAlt(makeProfile()));
	});

	it("should build a pt-BR og alt without markup", () => {
		expect(buildProfileOgAlt(makeProfile({ fullName: "<b>Bruce</b> Wayne" }))).toBe(
			"Bruce Wayne — CEO & Filantropo no FolioCraft",
		);
	});

	it("should omit empty sameAs entries from the json-ld", () => {
		const payload = buildPersonJsonLd(makeProfile({ githubUrl: null, linkedinUrl: "  " }));
		expect(payload).not.toHaveProperty("sameAs");
		expect(buildPersonJsonLd(makeProfile()).sameAs).toEqual([
			"https://github.com/bruce-wayne",
			"https://www.linkedin.com/in/bruce-wayne",
		]);
	});

	it("should escape < in the serialized json-ld", () => {
		const json = safeJsonLd(buildPersonJsonLd(makeProfile({ bio: "<script>alert(1)</script>" })));
		expect(json).toContain("\\u003cscript>");
		expect(json).not.toContain("<script>");
		expect(JSON.parse(json).description).toBe("<script>alert(1)</script>");
	});

	it("should include jobTitle and a PostalAddress in the json-ld", () => {
		const payload = buildPersonJsonLd(makeProfile());
		expect(payload.jobTitle).toBe("CEO & Filantropo");
		expect(payload.address).toEqual({
			"@type": "PostalAddress",
			addressLocality: "Gotham City",
		});
		expect(buildPersonJsonLd(makeProfile({ location: null }))).not.toHaveProperty("address");
	});
});
