"use client";

import type { ReactElement } from "react";
import { SkillsForm } from "./skills-form";

export function SkillsTab({
	defaultValues,
	onValuesChange,
}: {
	defaultValues: string[];
	onValuesChange: (values: string[]) => void;
}): ReactElement {
	return <SkillsForm defaultValues={defaultValues} onValuesChange={onValuesChange} />;
}
