"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Briefcase, Code, Cpu, type LucideIcon, Palette, User } from "lucide-react";
import type { ReactElement } from "react";

export type EditorTabId = "profile" | "experience" | "projects" | "skills" | "appearance";

export const EDITOR_TABS: ReadonlyArray<{
	id: EditorTabId;
	label: string;
	icon: LucideIcon;
}> = [
	{ id: "profile", label: "Perfil", icon: User },
	{ id: "experience", label: "Experiência", icon: Briefcase },
	{ id: "projects", label: "Projetos", icon: Code },
	{ id: "skills", label: "Skills", icon: Cpu },
	{ id: "appearance", label: "Aparência", icon: Palette },
];

const focusRing =
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2";

export function TabNav({
	value,
	onValueChange,
}: {
	value: EditorTabId;
	onValueChange: (value: EditorTabId) => void;
}): ReactElement {
	return (
		<TabsPrimitive.Root
			className="w-full"
			onValueChange={(nextValue) => onValueChange(nextValue as EditorTabId)}
			value={value}
		>
			<nav aria-label="Seções do editor" className="w-full">
				<TabsPrimitive.List
					aria-label="Seções do editor"
					className="flex w-full items-center gap-1 border-b border-border/80 bg-surface-2 px-6 pt-3"
				>
					{EDITOR_TABS.map(({ id, label, icon: Icon }) => (
						<TabsPrimitive.Trigger
							className={`inline-flex shrink-0 items-center justify-center gap-2 border-b-2 border-transparent px-4 py-3 font-sans text-sm font-medium leading-5 text-muted transition-colors hover:text-fg data-[state=active]:border-accent-soft data-[state=active]:text-accent-soft ${focusRing}`}
							key={id}
							value={id}
						>
							<Icon aria-hidden="true" className="size-3.5" />
							{label}
						</TabsPrimitive.Trigger>
					))}
				</TabsPrimitive.List>
			</nav>
		</TabsPrimitive.Root>
	);
}
