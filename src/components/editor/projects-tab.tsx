"use client";

import type { ReactElement } from "react";
import type { ProfileDraft } from "@/lib/validation/profile";
import { ProjectsForm } from "./projects-form";

export function ProjectsTab({
	defaultValues,
	onValuesChange,
	serverFieldErrors,
}: {
	defaultValues: ProfileDraft["projects"];
	onValuesChange: (values: ProfileDraft["projects"]) => void;
	serverFieldErrors?: Partial<Record<string, string>>;
}): ReactElement {
	return (
		<ProjectsForm
			defaultValues={defaultValues}
			onValuesChange={onValuesChange}
			serverFieldErrors={serverFieldErrors}
		/>
	);
}
