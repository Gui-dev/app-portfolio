"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ReactElement, ReactNode } from "react";
import type { EditorTabId } from "./tab-nav";

export function TabPanel({
	value,
	children,
}: {
	value: EditorTabId;
	children: ReactNode;
}): ReactElement {
	return (
		<TabsPrimitive.Content
			className="flex-1 overflow-y-auto p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
			value={value}
		>
			{children}
		</TabsPrimitive.Content>
	);
}
