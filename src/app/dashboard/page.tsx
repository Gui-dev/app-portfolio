import type { Metadata } from "next";
import { EditorHeader } from "@/components/editor/editor-header";

export const metadata: Metadata = {
	title: "Editor — FolioCraft",
};

export default function DashboardPage() {
	return (
		<div className="flex min-h-screen bg-bg">
			<aside className="flex w-full flex-col border-r border-border lg:w-[55%]">
				<EditorHeader publicSlug="lucas-almeida" />
				<main aria-label="Área do editor" className="flex-1" />
			</aside>
			<div aria-hidden="true" className="hidden flex-1 lg:block" />
		</div>
	);
}
