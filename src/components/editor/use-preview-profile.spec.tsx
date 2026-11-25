import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ProfileWithRelations } from "@/lib/db/schema";
import type { ProfileDraft } from "@/lib/validation/profile";
import { usePreviewProfile } from "./use-preview-profile";

function makeProfile(): ProfileWithRelations {
	return {
		id: "profile-1",
		userId: "user-1",
		slug: "lucas-almeida",
		fullName: "Lucas Almeida",
		headline: "Engenheiro de Software",
		bio: "Bio",
		location: "SP",
		contactEmail: "lucas@example.com",
		githubUrl: "",
		linkedinUrl: "",
		monogramStyle: "gradient",
		template: "modern",
		colorMode: "dark",
		isPublished: false,
		publishedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		experiences: [],
		projects: [],
		skills: [],
	};
}

const draft: ProfileDraft = {
	fullName: "Lucas Almeida",
	headline: "Engenheiro de Software",
	bio: "Bio",
	location: "SP",
	contactEmail: "lucas@example.com",
	githubUrl: "",
	linkedinUrl: "",
	monogramStyle: "gradient",
	template: "modern",
	colorMode: "dark",
	slug: "lucas-almeida",
	experiences: [],
	projects: [],
	skills: [],
};

describe("usePreviewProfile", () => {
	it("should override base profile fields with draft values", () => {
		const profile = makeProfile();
		const { result } = renderHook(() =>
			usePreviewProfile(profile, {
				...draft,
				colorMode: "light",
				fullName: "Maria Silva",
				template: "developer",
			}),
		);

		expect(result.current).toMatchObject({
			colorMode: "light",
			fullName: "Maria Silva",
			id: profile.id,
			isPublished: profile.isPublished,
			template: "developer",
			userId: profile.userId,
		});
	});

	it("should map draft children with stable temporary ids and kinds", () => {
		const profile = makeProfile();
		const { result } = renderHook(() =>
			usePreviewProfile(profile, {
				...draft,
				experiences: [
					{
						kind: "freelance",
						role: "Desenvolvedor",
						company: "Startup X",
						period: "2024",
						description: "Entregas",
						sortOrder: 0,
					},
				],
				projects: [
					{
						name: "FolioCraft",
						description: "Gerador de portfólios",
						repoUrl: "",
						demoUrl: "",
						sortOrder: 0,
						tags: ["next"],
					},
				],
				skills: ["TypeScript"],
			}),
		);

		expect(result.current.experiences[0]).toMatchObject({
			id: "preview-experience-0",
			kind: "freelance",
			profileId: profile.id,
			role: "Desenvolvedor",
			sortOrder: 0,
		});
		expect(result.current.projects[0]).toMatchObject({
			id: "preview-project-0",
			name: "FolioCraft",
			profileId: profile.id,
			sortOrder: 0,
			tags: ["next"],
		});
		expect(result.current.skills[0]).toMatchObject({
			id: "preview-skill-0",
			name: "TypeScript",
			profileId: profile.id,
			sortOrder: 0,
		});
	});

	it("should keep the same profile reference when inputs are unchanged", () => {
		const profile = makeProfile();
		const { result, rerender } = renderHook(({ p, d }) => usePreviewProfile(p, d), {
			initialProps: { p: profile, d: draft },
		});
		const first = result.current;

		rerender({ p: profile, d: draft });

		expect(result.current).toBe(first);
	});
});
