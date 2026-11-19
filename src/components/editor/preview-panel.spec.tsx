import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PreviewPanel } from "./preview-panel";

describe("PreviewPanel", () => {
	it("should render the live-preview label, the `Modern` badge and the public URL for the slug", () => {
		const { container } = render(<PreviewPanel publicSlug="lucas-almeida" />);

		expect(screen.getByText("Prévia ao vivo")).toBeInTheDocument();
		expect(screen.getByText("Modern")).toBeInTheDocument();
		expect(container).toHaveTextContent("foliocraft.app/");
		expect(container).toHaveTextContent("lucas-almeida");
	});

	it("should activate the desktop viewport by default and switch to mobile on click", async () => {
		const user = userEvent.setup();
		render(<PreviewPanel publicSlug="lucas-almeida" />);

		const desktopButton = screen.getByRole("button", { name: "Visualização desktop" });
		const mobileButton = screen.getByRole("button", { name: "Visualização mobile" });

		expect(desktopButton).toHaveAttribute("aria-pressed", "true");
		expect(mobileButton).toHaveAttribute("aria-pressed", "false");

		await user.click(mobileButton);

		expect(desktopButton).toHaveAttribute("aria-pressed", "false");
		expect(mobileButton).toHaveAttribute("aria-pressed", "true");
	});

	it("should start in dark mode and switch to light on click, updating the visible label", async () => {
		const user = userEvent.setup();
		render(<PreviewPanel publicSlug="lucas-almeida" />);

		const themeButton = screen.getByRole("button", { name: "Alternar tema da prévia" });

		expect(themeButton).toHaveAttribute("aria-pressed", "false");
		expect(screen.getByText("Escuro")).toBeInTheDocument();

		await user.click(themeButton);

		expect(themeButton).toHaveAttribute("aria-pressed", "true");
		expect(screen.getByText("Claro")).toBeInTheDocument();
		expect(screen.queryByText("Escuro")).not.toBeInTheDocument();
	});

	it("should render the temporary browser body placeholder", () => {
		render(<PreviewPanel publicSlug="lucas-almeida" />);

		expect(screen.getByText("A prévia do portfólio aparecerá aqui.")).toBeInTheDocument();
	});
});
