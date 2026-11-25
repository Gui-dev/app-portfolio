import type { Metadata } from "next";
import { EditorShell } from "@/components/editor/editor-shell";
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

	return (
		<div className="flex h-screen overflow-hidden bg-bg">
			<EditorShell profile={profile} />
		</div>
	);
}
