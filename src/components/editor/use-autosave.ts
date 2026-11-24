"use client";

import { useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutosave<T>({
	values,
	save,
	delay = 800,
	enabled = true,
}: {
	values: T;
	save: (values: T) => Promise<void> | void;
	delay?: number;
	enabled?: boolean;
}): { status: AutosaveStatus; savedAt: Date | null } {
	const [status, setStatus] = useState<AutosaveStatus>("idle");
	const [savedAt, setSavedAt] = useState<Date | null>(null);
	const lastSerializedRef = useRef<string | null>(null);
	const saveRef = useRef(save);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	saveRef.current = save;

	useEffect(() => {
		if (!enabled) return;
		const serialized = JSON.stringify(values);
		if (lastSerializedRef.current === null) {
			lastSerializedRef.current = serialized;
			return;
		}
		if (lastSerializedRef.current === serialized) return;

		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(async () => {
			const snapshot = serialized;
			setStatus("saving");
			try {
				await saveRef.current(values);
				lastSerializedRef.current = snapshot;
				setSavedAt(new Date());
				setStatus("saved");
			} catch {
				setStatus("error");
			}
		}, delay);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [delay, enabled, values]);

	return { status, savedAt };
}
