import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, type, ...props }: ComponentProps<"input">) {
	return (
		<input
			type={type}
			className={cn(
				"flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}
