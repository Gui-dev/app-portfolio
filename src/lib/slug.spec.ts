import { describe, expect, it } from "vitest";
import { normalizeSlug, validateSlug } from "./slug";

describe("normalizeSlug", () => {
	it("should normalize spaces and case", () =>
		expect(normalizeSlug("  Lucas Almeida ")).toBe("lucas-almeida"));

	it("should strip invalid characters and collapse dashes", () =>
		expect(normalizeSlug("Lucas_Almeida!!--dev")).toBe("lucas-almeida-dev"));
});

describe("validateSlug", () => {
	it("should reject slugs shorter than 3", () =>
		expect(validateSlug("ab")).toEqual({ ok: false, reason: "length" }));

	it("should reject more than 30 characters", () =>
		expect(validateSlug("a".repeat(31)).ok).toBe(false));

	it("should reject consecutive dashes", () =>
		expect(validateSlug("lucas--almeida")).toEqual({ ok: false, reason: "charset" }));

	it("should reject a leading dash", () =>
		expect(validateSlug("-lucas")).toEqual({ ok: false, reason: "charset" }));

	it("should reject reserved words", () =>
		expect(validateSlug("dashboard")).toEqual({ ok: false, reason: "reserved" }));

	it("should accept a valid slug", () => expect(validateSlug("bruce-wayne")).toEqual({ ok: true }));
});
