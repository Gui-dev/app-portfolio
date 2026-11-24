import type { Metadata } from "next";
import { EditorShell } from "@/components/editor/editor-shell";
import { PreviewPanel } from "@/components/editor/preview-panel";
import { getSessionUser } from "@/lib/auth-session";
import { ensureProfileForUser } from "./actions";

export const metadata: Metadata = {
	title: "Editor — FolioCraft",
};

export default async function DashboardPage() {
	const user = await getSessionUser();
	if (!user) {
		return null;
	}

	const profile = await ensureProfileForUser(user.id, user.email, user.name);
	const publicSlug = profile.slug ?? "seu-slug";

	return (
		<div className="flex h-screen overflow-hidden bg-bg">
			<aside className="flex w-full flex-col border-r border-border lg:w-[55%]">
				<EditorShell profile={profile} />
			</aside>
			<div className="hidden h-full flex-1 lg:block">
				<PreviewPanel publicSlug={publicSlug} />
			</div>
		</div>
	);
}
