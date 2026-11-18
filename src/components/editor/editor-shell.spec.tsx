import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { EditorShell } from "./editor-shell";

describe("EditorShell", () => {
	it("should render the editor header and the tab menu", () => {
		const { container } = render(<EditorShell publicSlug="lucas-almeida" />);

		expect(screen.getByText("FolioCraft")).toBeInTheDocument();
		expect(container).toHaveTextContent("foliocraft.app/lucas-almeida");
		expect(screen.getByRole("tab", { name: "Perfil" })).toBeInTheDocument();
		expect(screen.getByRole("main", { name: "Área do editor" })).toBeInTheDocument();
	});

	it("should select the clicked tab", async () => {
		const user = userEvent.setup();
		render(<EditorShell publicSlug="lucas-almeida" />);

		expect(screen.getByRole("tab", { name: "Perfil" })).toHaveAttribute("aria-selected", "true");

		await user.click(screen.getByRole("tab", { name: "Aparência" }));

		expect(screen.getByRole("tab", { name: "Aparência" })).toHaveAttribute("aria-selected", "true");
		expect(screen.getByRole("tab", { name: "Perfil" })).toHaveAttribute("aria-selected", "false");
	});
});
