import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth-session";

type DashboardLayoutProps = {
	children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
	const user = await getSessionUser();
	if (!user?.emailVerified) {
		redirect("/login");
	}
	return children;
}
