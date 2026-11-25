import { describe, expect, it } from "vitest";
import { BEGINNER_SAMPLES } from "./samples";

describe("BEGINNER_SAMPLES", () => {
	it("should provide three beginner experiences with distinct kinds", () => {
		expect(BEGINNER_SAMPLES).toHaveLength(3);
		expect(BEGINNER_SAMPLES.map((s) => s.kind)).toEqual(["freelance", "open-source", "academic"]);
		for (const sample of BEGINNER_SAMPLES) {
			expect(sample.role.length).toBeGreaterThan(0);
			expect(sample.company.length).toBeGreaterThan(0);
			expect(sample.period.length).toBeGreaterThan(0);
			expect(sample.description.length).toBeGreaterThan(0);
			expect(sample.sortOrder).toBeTypeOf("number");
		}
	});
});
