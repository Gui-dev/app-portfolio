import { describe, expect, it } from "vitest";
import { verificationEmailHtml } from "./email-templates";

describe("email-templates", () => {
	it("should include the verification url", () => {
		const { html } = verificationEmailHtml({
			name: "Lucas",
			url: "https://foliocraft.test/verify?token=abc",
		});

		expect(html).toContain("https://foliocraft.test/verify?token=abc");
	});

	it("should escape a display name containing markup", () => {
		const { html } = verificationEmailHtml({
			name: "<script>alert(1)</script>",
			url: "https://foliocraft.test/verify?token=abc",
		});

		expect(html).not.toContain("<script>alert(1)</script>");
		expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
	});
});
