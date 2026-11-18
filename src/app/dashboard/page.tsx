import type { Metadata } from "next";
import { EditorShell } from "@/components/editor/editor-shell";

export const metadata: Metadata = {
	title: "Editor — FolioCraft",
};

export default function DashboardPage() {
	return (
		<div className="flex min-h-screen bg-bg">
			<aside className="flex w-full flex-col border-r border-border lg:w-[55%]">
				<EditorShell publicSlug="lucas-almeida" />
			</aside>
			<div aria-hidden="true" className="hidden flex-1 lg:block" />
		</div>
	);
}
