import type { Metadata } from "next";
import { EditorShell } from "@/components/editor/editor-shell";
import { PreviewPanel } from "@/components/editor/preview-panel";

export const metadata: Metadata = {
	title: "Editor — FolioCraft",
};

export default function DashboardPage() {
	return (
		<div className="flex h-screen overflow-hidden bg-bg">
			<aside className="flex w-full flex-col border-r border-border lg:w-[55%]">
				<EditorShell publicSlug="lucas-almeida" />
			</aside>
			<div className="hidden h-full flex-1 lg:block">
				<PreviewPanel publicSlug="lucas-almeida" />
			</div>
		</div>
	);
}
