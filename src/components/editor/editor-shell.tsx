"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type ReactElement, useCallback, useMemo, useState, useTransition } from "react";
import { publishProfile, saveProfileDraft, unpublishProfile } from "@/app/dashboard/actions";
import type { ColorMode, ProfileWithRelations, Template } from "@/lib/db/schema";
import type { ProfileDraft } from "@/lib/validation/profile";
import { AppearanceTab } from "./appearance-tab";
import { EditorActionBar } from "./editor-action-bar";
import { EditorHeader } from "./editor-header";
import { ExperienceTab } from "./experience-tab";
import { PreviewPanel } from "./preview-panel";
import { ProfileTab } from "./profile-tab";
import { ProjectsTab } from "./projects-tab";
import { SkillsTab } from "./skills-tab";
import { EDITOR_TABS, type EditorTabId, TabNav } from "./tab-nav";
import { TabPanel } from "./tab-panel";
import { useAutosave } from "./use-autosave";
import { usePreviewProfile } from "./use-preview-profile";

type MobileView = "edit" | "preview";

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
	const [mobileView, setMobileView] = useState<MobileView>("edit");
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
	const pdfHref =
		isPublished && !isDirty && status !== "saving" && status !== "error" && draft.slug.trim()
			? `/api/pdf/${draft.slug.trim()}`
			: undefined;
	const previewProfile = usePreviewProfile(profile, draft);

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

	const onProfileValuesChange = useCallback((values: ProfileDraft) => {
		setDraft((current) => ({
			...current,
			bio: values.bio,
			contactEmail: values.contactEmail,
			fullName: values.fullName,
			githubUrl: values.githubUrl,
			headline: values.headline,
			linkedinUrl: values.linkedinUrl,
			location: values.location,
			monogramStyle: values.monogramStyle,
			slug: values.slug,
		}));
	}, []);
	const onExperiencesChange = useCallback((experiences: ProfileDraft["experiences"]) => {
		setDraft((current) =>
			JSON.stringify(current.experiences) === JSON.stringify(experiences)
				? current
				: { ...current, experiences },
		);
	}, []);
	const onProjectsChange = useCallback((projects: ProfileDraft["projects"]) => {
		setDraft((current) =>
			JSON.stringify(current.projects) === JSON.stringify(projects)
				? current
				: { ...current, projects },
		);
	}, []);
	const onSkillsChange = useCallback((skills: ProfileDraft["skills"]) => {
		setDraft((current) =>
			JSON.stringify(current.skills) === JSON.stringify(skills) ? current : { ...current, skills },
		);
	}, []);
	const onTemplateChange = useCallback((template: Template) => {
		setDraft((current) => (current.template === template ? current : { ...current, template }));
	}, []);
	const onColorModeChange = useCallback((colorMode: ColorMode) => {
		setDraft((current) => (current.colorMode === colorMode ? current : { ...current, colorMode }));
	}, []);

	const profileTab = useMemo(
		() => (
			<ProfileTab
				defaultValues={initialDraft}
				key={`profile-${formVersion}`}
				onValuesChange={onProfileValuesChange}
				serverFieldErrors={serverFieldErrors}
			/>
		),
		[formVersion, initialDraft, onProfileValuesChange, serverFieldErrors],
	);

	return (
		<div className="flex h-full min-h-0 flex-col bg-bg" data-mobile-view={mobileView}>
			<div className="flex shrink-0 items-center justify-center gap-2 border-b border-border bg-surface-2 px-4 py-2 lg:hidden">
				<button
					aria-pressed={mobileView === "edit"}
					className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
						mobileView === "edit" ? "bg-accent-strong text-fg" : "text-muted"
					}`}
					onClick={() => setMobileView("edit")}
					type="button"
				>
					Editar
				</button>
				<button
					aria-pressed={mobileView === "preview"}
					className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
						mobileView === "preview" ? "bg-accent-strong text-fg" : "text-muted"
					}`}
					onClick={() => setMobileView("preview")}
					type="button"
				>
					Prévia
				</button>
			</div>

			<div className="flex min-h-0 flex-1 flex-col lg:flex-row">
				<aside
					className={`min-h-0 w-full border-r border-border lg:flex lg:w-[55%] lg:flex-col ${
						mobileView === "edit" ? "flex flex-col" : "hidden"
					}`}
				>
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
									<ExperienceTab
										defaultValues={initialDraft.experiences}
										key={`experience-${formVersion}`}
										onValuesChange={onExperiencesChange}
										serverFieldErrors={serverFieldErrors}
									/>
								) : tab.id === "projects" ? (
									<ProjectsTab
										defaultValues={initialDraft.projects}
										key={`projects-${formVersion}`}
										onValuesChange={onProjectsChange}
										serverFieldErrors={serverFieldErrors}
									/>
								) : tab.id === "skills" ? (
									<SkillsTab
										defaultValues={initialDraft.skills}
										key={`skills-${formVersion}`}
										onValuesChange={onSkillsChange}
									/>
								) : (
									<AppearanceTab
										colorMode={draft.colorMode}
										onColorModeChange={onColorModeChange}
										onTemplateChange={onTemplateChange}
										template={draft.template}
									/>
								)}
							</TabPanel>
						))}
					</TabsPrimitive.Root>
					<EditorActionBar
						isDirty={isDirty}
						isPublished={isPublished}
						onPublish={onPublish}
						pdfHref={pdfHref}
						publishPending={publishPending}
						status={status}
					/>
				</aside>
				<div className={`min-h-0 flex-1 ${mobileView === "preview" ? "block" : "hidden"} lg:block`}>
					<PreviewPanel
						onColorModeChange={onColorModeChange}
						profile={previewProfile}
						publicSlug={publicSlug}
					/>
				</div>
			</div>
		</div>
	);
}
