"use client";

import type { ReactElement } from "react";
import type { ColorMode, Template } from "@/lib/db/schema";
import { AppearanceForm } from "./appearance-form";

export function AppearanceTab({
	template,
	colorMode,
	onTemplateChange,
	onColorModeChange,
}: {
	template: Template;
	colorMode: ColorMode;
	onTemplateChange: (template: Template) => void;
	onColorModeChange: (mode: ColorMode) => void;
}): ReactElement {
	return (
		<AppearanceForm
			colorMode={colorMode}
			onColorModeChange={onColorModeChange}
			onTemplateChange={onTemplateChange}
			template={template}
		/>
	);
}
