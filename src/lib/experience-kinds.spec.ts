import { describe, expect, it } from "vitest";
import { EXPERIENCE_KINDS } from "./experience-kinds";

describe("EXPERIENCE_KINDS", () => {
	it("should label formal as Emprego Formal", () => {
		expect(EXPERIENCE_KINDS.formal.label).toBe("Emprego Formal");
	});

	it("should have non-empty labels for the other kinds", () => {
		for (const kind of ["freelance", "open-source", "academic", "volunteer"] as const) {
			expect(EXPERIENCE_KINDS[kind].label).toEqual(expect.any(String));
			expect(EXPERIENCE_KINDS[kind].label.length).toBeGreaterThan(0);
		}
	});
});
