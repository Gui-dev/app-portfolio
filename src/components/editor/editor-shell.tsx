"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type ReactElement, useState } from "react";
import { AppearanceTab } from "./appearance-tab";
import { EditorActionBar } from "./editor-action-bar";
import { EditorHeader } from "./editor-header";
import { ExperienceTab } from "./experience-tab";
import { ProfileTab } from "./profile-tab";
import { ProjectsTab } from "./projects-tab";
import { SkillsTab } from "./skills-tab";
import { EDITOR_TABS, type EditorTabId, TabNav } from "./tab-nav";
import { TabPanel } from "./tab-panel";

export function EditorShell({ publicSlug }: { publicSlug: string }): ReactElement {
	const [activeTab, setActiveTab] = useState<EditorTabId>("profile");

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
							<ProfileTab />
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
			<EditorActionBar />
		</>
	);
}
