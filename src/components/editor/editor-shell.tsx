"use client";

import { type ReactElement, useState } from "react";
import { EditorHeader } from "./editor-header";
import { type EditorTabId, TabNav } from "./tab-nav";

export function EditorShell({ publicSlug }: { publicSlug: string }): ReactElement {
	const [activeTab, setActiveTab] = useState<EditorTabId>("profile");

	return (
		<>
			<EditorHeader publicSlug={publicSlug} />
			<TabNav onValueChange={setActiveTab} value={activeTab} />
			<main aria-label="Área do editor" className="flex-1" />
		</>
	);
}
