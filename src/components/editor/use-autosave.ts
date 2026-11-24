"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
}): { status: AutosaveStatus; savedAt: Date | null; isDirty: boolean } {
	const [status, setStatus] = useState<AutosaveStatus>("idle");
	const [savedAt, setSavedAt] = useState<Date | null>(null);
	const [isDirty, setIsDirty] = useState(false);
	const lastSavedSerializedRef = useRef<string | null>(null);
	const latestSerializedRef = useRef<string>("");
	const latestValuesRef = useRef(values);
	const saveRef = useRef(save);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const inFlightRef = useRef(false);
	const queuedRef = useRef(false);

	saveRef.current = save;
	latestValuesRef.current = values;
	const serialized = JSON.stringify(values);
	latestSerializedRef.current = serialized;

	const flushSave = useCallback(async () => {
		if (inFlightRef.current) {
			queuedRef.current = true;
			return;
		}
		if (!enabled) return;
		const serialized = latestSerializedRef.current;
		if (lastSavedSerializedRef.current === serialized) {
			setIsDirty(false);
			setStatus((s) => (s === "saving" ? "saved" : s));
			return;
		}

		inFlightRef.current = true;
		queuedRef.current = false;
		setStatus("saving");
		const snapshotSerialized = serialized;
		const snapshotValues = latestValuesRef.current;
		try {
			await saveRef.current(snapshotValues);
			lastSavedSerializedRef.current = snapshotSerialized;
			setSavedAt(new Date());
			const currentSerialized = latestSerializedRef.current;
			if (currentSerialized === snapshotSerialized && !queuedRef.current) {
				setIsDirty(false);
				setStatus("saved");
			} else {
				setIsDirty(true);
				queuedRef.current = false;
				inFlightRef.current = false;
				void flushSave();
				return;
			}
		} catch {
			setStatus("error");
			setIsDirty(latestSerializedRef.current !== lastSavedSerializedRef.current);
		} finally {
			inFlightRef.current = false;
			if (queuedRef.current) {
				queuedRef.current = false;
				void flushSave();
			}
		}
	}, [enabled]);

	useEffect(() => {
		if (!enabled) return;
		const currentSerialized = serialized;
		if (lastSavedSerializedRef.current === null) {
			lastSavedSerializedRef.current = currentSerialized;
			setIsDirty(false);
			return;
		}

		const dirty = currentSerialized !== lastSavedSerializedRef.current;
		setIsDirty(dirty);
		if (!dirty) return;

		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			void flushSave();
		}, delay);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [delay, enabled, flushSave, serialized]);

	return { status, savedAt, isDirty };
}
