import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAutosave } from "./use-autosave";

describe("useAutosave", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should debounce save calls by 800ms", async () => {
		const save = vi.fn(async () => {});
		const { rerender } = renderHook(({ values }) => useAutosave({ values, save }), {
			initialProps: { values: { name: "A" } },
		});

		rerender({ values: { name: "B" } });
		expect(save).not.toHaveBeenCalled();
		await act(async () => {
			await vi.advanceTimersByTimeAsync(799);
		});
		expect(save).not.toHaveBeenCalled();
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1);
		});
		expect(save).toHaveBeenCalledTimes(1);
		expect(save).toHaveBeenCalledWith({ name: "B" });
	});

	it("should not save when values did not change", async () => {
		const save = vi.fn(async () => {});
		const values = { name: "A" };
		const { rerender } = renderHook(({ v }) => useAutosave({ values: v, save }), {
			initialProps: { v: values },
		});
		rerender({ v: values });
		await act(async () => {
			await vi.advanceTimersByTimeAsync(1000);
		});
		expect(save).not.toHaveBeenCalled();
	});

	it("should expose saved status and timestamp after a successful save", async () => {
		const save = vi.fn(async () => {});
		const { result, rerender } = renderHook(({ values }) => useAutosave({ values, save }), {
			initialProps: { values: { name: "A" } },
		});

		rerender({ values: { name: "B" } });
		await act(async () => {
			await vi.advanceTimersByTimeAsync(800);
		});

		expect(result.current.status).toBe("saved");
		expect(result.current.savedAt).toBeInstanceOf(Date);
	});

	it("should expose error status when save rejects", async () => {
		const save = vi.fn(async () => {
			throw new Error("boom");
		});
		const { result, rerender } = renderHook(({ values }) => useAutosave({ values, save }), {
			initialProps: { values: { name: "A" } },
		});

		rerender({ values: { name: "B" } });
		await act(async () => {
			await vi.advanceTimersByTimeAsync(800);
		});

		expect(result.current.status).toBe("error");
	});
});
