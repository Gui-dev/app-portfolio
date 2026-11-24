import { describe, expect, it } from "vitest";
import { initials } from "./initials";

describe("initials", () => {
	it("should return initials for two words", () => {
		expect(initials("Lucas Almeida")).toBe("LA");
	});

	it("should return initials for Bruce Wayne", () => {
		expect(initials("Bruce Wayne")).toBe("BW");
	});

	it("should return one letter for a single word", () => {
		expect(initials("Cher")).toBe("C");
	});

	it("should use first and last words for multiple words", () => {
		expect(initials("Ana Maria Braga")).toBe("AB");
	});

	it("should collapse whitespace", () => {
		expect(initials("  lucas   almeida  ")).toBe("LA");
	});

	it("should return question mark for empty input", () => {
		expect(initials("")).toBe("?");
	});
});
