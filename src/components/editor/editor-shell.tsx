"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { type ReactElement, useState } from "react";
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
							<section className="flex flex-col gap-1">
								<h2 className="font-display text-base font-bold leading-6 text-fg">{tab.label}</h2>
								<p className="text-xs leading-4 text-muted">
									O formulário desta seção será construído nas próximas etapas.
								</p>
							</section>
						)}
					</TabPanel>
				))}
			</TabsPrimitive.Root>
			<EditorActionBar />
		</>
	);
}
