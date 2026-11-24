"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type ReactElement, useCallback, useMemo, useState, useTransition } from "react";
import { publishProfile, saveProfileDraft, unpublishProfile } from "@/app/dashboard/actions";
import type { ProfileWithRelations } from "@/lib/db/schema";
import type { ProfileDraft } from "@/lib/validation/profile";
import { AppearanceTab } from "./appearance-tab";
import { EditorActionBar } from "./editor-action-bar";
import { EditorHeader } from "./editor-header";
import { ExperienceTab } from "./experience-tab";
import { ProfileTab } from "./profile-tab";
import { ProjectsTab } from "./projects-tab";
import { SkillsTab } from "./skills-tab";
import { EDITOR_TABS, type EditorTabId, TabNav } from "./tab-nav";
import { TabPanel } from "./tab-panel";
import { useAutosave } from "./use-autosave";

function toDraft(profile: ProfileWithRelations): ProfileDraft {
	return {
		fullName: profile.fullName ?? "",
		headline: profile.headline ?? "",
		bio: profile.bio ?? "",
		location: profile.location ?? "",
		contactEmail: profile.contactEmail ?? "",
		githubUrl: profile.githubUrl ?? "",
		linkedinUrl: profile.linkedinUrl ?? "",
		monogramStyle: profile.monogramStyle,
		template: profile.template,
		colorMode: profile.colorMode,
		slug: profile.slug ?? "",
		experiences: profile.experiences.map((e) => ({
			kind: e.kind,
			role: e.role,
			company: e.company,
			period: e.period,
			description: e.description,
			sortOrder: e.sortOrder,
		})),
		projects: profile.projects.map((p) => ({
			name: p.name,
			description: p.description,
			repoUrl: p.repoUrl ?? "",
			demoUrl: p.demoUrl ?? "",
			tags: p.tags,
			sortOrder: p.sortOrder,
		})),
		skills: profile.skills.map((s) => s.name),
	};
}

export function EditorShell({ profile }: { profile: ProfileWithRelations }): ReactElement {
	const [activeTab, setActiveTab] = useState<EditorTabId>("profile");
	const [formVersion, setFormVersion] = useState(0);
	const [initialDraft, setInitialDraft] = useState<ProfileDraft>(() => toDraft(profile));
	const [draft, setDraft] = useState<ProfileDraft>(() => toDraft(profile));
	const [serverFieldErrors, setServerFieldErrors] = useState<
		Partial<Record<keyof ProfileDraft, string>>
	>({});
	const [isPublished, setIsPublished] = useState(profile.isPublished);
	const [publishPending, startPublish] = useTransition();

	const save = useCallback(async (values: ProfileDraft) => {
		const result = await saveProfileDraft(values);
		if (!result.ok) {
			if (result.fieldErrors) {
				setServerFieldErrors(result.fieldErrors as Partial<Record<keyof ProfileDraft, string>>);
			}
			throw new Error(result.error ?? "Save failed");
		}
		setServerFieldErrors({});
		setIsPublished(result.profile.isPublished);
	}, []);

	const { status, isDirty } = useAutosave({ values: draft, save, delay: 800 });

	const publicSlug = draft.slug?.trim() || profile.slug || "seu-slug";

	const onPublish = () => {
		startPublish(async () => {
			const saveResult = await saveProfileDraft(draft);
			if (!saveResult.ok) {
				if (saveResult.fieldErrors) {
					setServerFieldErrors(
						saveResult.fieldErrors as Partial<Record<keyof ProfileDraft, string>>,
					);
				}
				return;
			}
			setServerFieldErrors({});
			setIsPublished(saveResult.profile.isPublished);

			const result = saveResult.profile.isPublished
				? await unpublishProfile()
				: await publishProfile();
			if (!result.ok) {
				if (result.fieldErrors) {
					setServerFieldErrors(result.fieldErrors as Partial<Record<keyof ProfileDraft, string>>);
				}
				return;
			}

			const nextDraft = toDraft(result.profile);
			setServerFieldErrors({});
			setIsPublished(result.profile.isPublished);
			setInitialDraft(nextDraft);
			setDraft(nextDraft);
			setFormVersion((v) => v + 1);
		});
	};

	const profileTab = useMemo(
		() => (
			<ProfileTab
				defaultValues={initialDraft}
				key={formVersion}
				onValuesChange={setDraft}
				serverFieldErrors={serverFieldErrors}
			/>
		),
		[formVersion, initialDraft, serverFieldErrors],
	);

	return (
		<>
			<EditorHeader publicSlug={publicSlug} />
			<TabsPrimitive.Root
				className="flex min-h-0 w-full flex-1 flex-col"
				onValueChange={(next) => setActiveTab(next as EditorTabId)}
				value={activeTab}
			>
				<TabNav />
				{EDITOR_TABS.map((tab) => (
					<TabPanel key={tab.id} value={tab.id}>
						{tab.id === "profile" ? (
							profileTab
						) : tab.id === "experience" ? (
							<ExperienceTab />
						) : tab.id === "projects" ? (
							<ProjectsTab />
						) : tab.id === "skills" ? (
							<SkillsTab />
						) : (
							<AppearanceTab />
						)}
					</TabPanel>
				))}
			</TabsPrimitive.Root>
			<EditorActionBar
				isDirty={isDirty}
				isPublished={isPublished}
				onPublish={onPublish}
				publishPending={publishPending}
				status={status}
			/>
		</>
	);
}
