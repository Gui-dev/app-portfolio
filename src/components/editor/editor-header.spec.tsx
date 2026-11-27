import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EditorHeader } from "./editor-header";

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");

afterEach(() => {
	if (originalClipboard) {
		Object.defineProperty(navigator, "clipboard", originalClipboard);
	} else {
		Reflect.deleteProperty(navigator, "clipboard");
	}
});

describe("EditorHeader", () => {
	it("should render the brand, subtitle and the SSR + SEO pill", () => {
		render(<EditorHeader publicSlug="marina-souza" />);

		expect(screen.getByText("FolioCraft")).toBeInTheDocument();
		expect(screen.getByText("Gerador de Portfólio & Currículo")).toBeInTheDocument();
		expect(screen.getByText("SSR + SEO")).toBeInTheDocument();
	});

	it("should render the public URL for the given slug", () => {
		const { container } = render(<EditorHeader publicSlug="marina-souza" />);

		expect(container).toHaveTextContent("foliocraft.app/marina-souza");
	});

	it("should copy the public URL when the copy button is clicked", async () => {
		const user = userEvent.setup();
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: { writeText },
		});

		render(<EditorHeader publicSlug="marina-souza" />);
		await user.click(screen.getByRole("button", { name: "Copiar link do portfólio" }));

		expect(writeText).toHaveBeenCalledWith("https://foliocraft.app/marina-souza");
	});

	it("should link to the account settings page", () => {
		render(<EditorHeader publicSlug="marina-souza" />);

		const settingsLink = screen.getByRole("link", { name: "Configurações" });
		expect(settingsLink).toHaveAttribute("href", "/dashboard/settings");
	});

	it("should toggle aria-pressed when the theme button is clicked", async () => {
		const user = userEvent.setup();
		render(<EditorHeader publicSlug="marina-souza" />);

		const themeButton = screen.getByRole("button", { name: "Alternar tema do editor" });
		expect(themeButton).toHaveAttribute("aria-pressed", "false");

		await user.click(themeButton);

		expect(themeButton).toHaveAttribute("aria-pressed", "true");
	});
});
