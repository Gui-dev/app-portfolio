"use client";

import type { ReactElement } from "react";
import type { ProfileDraft } from "@/lib/validation/profile";
import { ExperienceForm } from "./experience-form";

export function ExperienceTab({
	defaultValues,
	onValuesChange,
	serverFieldErrors,
}: {
	defaultValues: ProfileDraft["experiences"];
	onValuesChange: (values: ProfileDraft["experiences"]) => void;
	serverFieldErrors?: Partial<Record<string, string>>;
}): ReactElement {
	return (
		<ExperienceForm
			defaultValues={defaultValues}
			onValuesChange={onValuesChange}
			serverFieldErrors={serverFieldErrors}
		/>
	);
}
