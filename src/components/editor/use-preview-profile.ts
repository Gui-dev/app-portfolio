import { useMemo } from "react";
import type { ProfileWithRelations } from "@/lib/db/schema";
import type { ProfileDraft } from "@/lib/validation/profile";

export function usePreviewProfile(
	profile: ProfileWithRelations,
	draft: ProfileDraft,
): ProfileWithRelations {
	return useMemo(
		() => ({
			...profile,
			fullName: draft.fullName,
			headline: draft.headline,
			bio: draft.bio,
			location: draft.location,
			contactEmail: draft.contactEmail,
			githubUrl: draft.githubUrl,
			linkedinUrl: draft.linkedinUrl,
			monogramStyle: draft.monogramStyle,
			template: draft.template,
			colorMode: draft.colorMode,
			slug: draft.slug || profile.slug,
			experiences: draft.experiences.map((experience, index) => ({
				id: `preview-experience-${index}`,
				profileId: profile.id,
				kind: experience.kind,
				role: experience.role,
				company: experience.company,
				period: experience.period,
				description: experience.description,
				sortOrder: experience.sortOrder,
			})),
			projects: draft.projects.map((project, index) => ({
				id: `preview-project-${index}`,
				profileId: profile.id,
				name: project.name,
				description: project.description,
				repoUrl: project.repoUrl,
				demoUrl: project.demoUrl,
				tags: project.tags,
				sortOrder: project.sortOrder,
			})),
			skills: draft.skills.map((name, index) => ({
				id: `preview-skill-${index}`,
				profileId: profile.id,
				name,
				sortOrder: index,
			})),
		}),
		[draft, profile],
	);
}
