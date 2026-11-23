import type { ReactNode } from "react";

type AuthLayoutProps = {
	children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10">
			<div className="w-full max-w-[420px]">
				<p className="mb-8 text-center font-display text-3xl font-bold text-fg">FolioCraft</p>
				<div className="rounded-2xl border border-border bg-surface-3 p-8">{children}</div>
			</div>
		</div>
	);
}
