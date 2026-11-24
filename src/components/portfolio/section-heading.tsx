import type { ReactElement } from "react";
import { cn } from "@/lib/cn";

export function SectionHeading({
	children,
	className,
	id,
}: {
	children: string;
	className?: string;
	id?: string;
}): ReactElement {
	return (
		<h2 id={id} className={cn("pf-section-heading pf-display", className)}>
			{children}
		</h2>
	);
}
