import { describe, expect, it } from "vitest";
import { ProfileDraftSchema, publishableProfileSchema } from "./profile";

function validDraft(overrides: Record<string, unknown> = {}) {
	return {
		fullName: "",
		headline: "",
		bio: "",
		location: "",
		contactEmail: "bruce@wayne.dev",
		githubUrl: "",
		linkedinUrl: "",
		monogramStyle: "gradient",
		template: "modern",
		colorMode: "dark",
		slug: "",
		experiences: [],
		projects: [],
		skills: [],
		...overrides,
	};
}

describe("ProfileDraftSchema", () => {
	it("should reject a javascript url", () => {
		const result = ProfileDraftSchema.safeParse(
			validDraft({
				projects: [
					{
						name: "P",
						description: "D",
						repoUrl: "javascript:alert(1)",
						demoUrl: "",
						tags: [],
						sortOrder: 0,
					},
				],
			}),
		);
		expect(result.success).toBe(false);
	});

	it("should reject non-http social urls", () => {
		for (const overrides of [
			{ githubUrl: "javascript:alert(1)" },
			{ linkedinUrl: "ftp://example.com/profile" },
			{
				projects: [
					{
						name: "P",
						description: "D",
						repoUrl: "",
						demoUrl: "data:text/html,<script>alert(1)</script>",
						tags: [],
						sortOrder: 0,
					},
				],
			},
		]) {
			const result = ProfileDraftSchema.safeParse(validDraft(overrides));
			expect(result.success).toBe(false);
		}
	});

	it("should reject more than 100 skills", () => {
		const result = ProfileDraftSchema.safeParse(
			validDraft({ skills: Array.from({ length: 101 }, (_, i) => `skill-${i}`) }),
		);
		expect(result.success).toBe(false);
	});

	it("should reject more than 20 experiences", () => {
		const result = ProfileDraftSchema.safeParse(
			validDraft({
				experiences: Array.from({ length: 21 }, (_, i) => ({
					kind: "formal",
					role: `Role ${i}`,
					company: "Company",
					period: "2024",
					description: "Desc",
					sortOrder: i,
				})),
			}),
		);
		expect(result.success).toBe(false);
	});

	it("should reject an unknown experience kind", () => {
		const result = ProfileDraftSchema.safeParse(
			validDraft({
				experiences: [
					{
						kind: "unknown",
						role: "Role",
						company: "Company",
						period: "2024",
						description: "Desc",
						sortOrder: 0,
					},
				],
			}),
		);
		expect(result.success).toBe(false);
	});

	it("should accept an empty draft", () => {
		const result = ProfileDraftSchema.safeParse(validDraft({ fullName: "", slug: "" }));
		expect(result.success).toBe(true);
	});

	it("should require a full name to publish", () => {
		const result = publishableProfileSchema.safeParse(
			validDraft({ fullName: "", slug: "bruce-wayne" }),
		);
		expect(result.success).toBe(false);
	});
});
