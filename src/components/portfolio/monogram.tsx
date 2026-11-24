import type { ReactElement } from "react";
import { cn } from "@/lib/cn";
import type { MonogramStyle } from "@/lib/db/schema";
import { initials } from "@/lib/initials";

const STYLE_CLASS: Record<MonogramStyle, string> = {
	gradient: "pf-monogram-gradient",
	solid: "pf-monogram-solid",
	outline: "pf-monogram-outline",
};

export function Monogram({
	name,
	style,
	className,
}: {
	name: string | null;
	style: MonogramStyle;
	className?: string;
}): ReactElement {
	const text = initials(name ?? "");
	return (
		<div aria-hidden="true" className={cn("pf-monogram", STYLE_CLASS[style], className)}>
			<span>{text}</span>
		</div>
	);
}
