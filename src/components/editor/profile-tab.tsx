"use client";

import type { ReactElement } from "react";
import type { ProfileDraft } from "@/lib/validation/profile";
import { ProfileForm } from "./profile-form";

export function ProfileTab({
	defaultValues,
	onValuesChange,
	serverFieldErrors,
}: {
	defaultValues: ProfileDraft;
	onValuesChange: (values: ProfileDraft) => void;
	serverFieldErrors?: Partial<Record<keyof ProfileDraft, string>>;
}): ReactElement {
	return (
		<ProfileForm
			defaultValues={defaultValues}
			onValuesChange={onValuesChange}
			serverFieldErrors={serverFieldErrors}
		/>
	);
}
