import { describe, expect, it } from "vitest";
import { TEMPLATES, templateStyle } from "./template";

function styleValue(style: ReturnType<typeof templateStyle>, key: string): string | undefined {
	return (style as Record<string, string | number | undefined>)[key] as string | undefined;
}

describe("template", () => {
	it("should expose the three templates", () =>
		expect(Object.keys(TEMPLATES)).toEqual(["minimal", "developer", "modern"]));
	it("should map the modern template to css variables", () =>
		expect(templateStyle("modern", "dark")).toMatchObject({
			"--accent": "#6366F1",
			"--accent-2": "#22D3EE",
		}));
	it("should use the emerald accent for the developer template", () =>
		expect(styleValue(templateStyle("developer", "dark"), "--accent")).toBe("#10B981"));
	it("should use different backgrounds for light and dark", () =>
		expect(styleValue(templateStyle("modern", "light"), "--bg")).not.toBe(
			styleValue(templateStyle("modern", "dark"), "--bg"),
		));
});
