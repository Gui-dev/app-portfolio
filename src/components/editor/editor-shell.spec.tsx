import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { EditorShell } from "./editor-shell";

describe("EditorShell", () => {
	it("should render the editor header and the tab menu", () => {
		const { container } = render(<EditorShell publicSlug="lucas-almeida" />);

		expect(screen.getByText("FolioCraft")).toBeInTheDocument();
		expect(container).toHaveTextContent("foliocraft.app/lucas-almeida");
		expect(screen.getByRole("navigation", { name: "Seções do editor" })).toBeInTheDocument();
		expect(screen.getByRole("tablist", { name: "Seções do editor" })).toBeInTheDocument();
		expect(screen.getAllByRole("tab")).toHaveLength(5);
	});

	it("should render the action bar with the publish button", () => {
		render(<EditorShell publicSlug="lucas-almeida" />);

		expect(screen.getByRole("contentinfo")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Salvar e Publicar" })).toBeInTheDocument();
	});

	it("should show only the active tab panel", () => {
		render(<EditorShell publicSlug="lucas-almeida" />);

		expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
		expect(screen.getByRole("heading", { name: "Perfil" })).toBeVisible();
		for (const label of ["Experiência", "Projetos", "Skills", "Aparência"]) {
			expect(screen.queryByRole("heading", { name: label })).not.toBeInTheDocument();
		}
	});

	it("should switch the panel when another tab is clicked", async () => {
		const user = userEvent.setup();
		render(<EditorShell publicSlug="lucas-almeida" />);

		await user.click(screen.getByRole("tab", { name: "Experiência" }));

		expect(screen.getByRole("tab", { name: "Experiência" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
		expect(screen.getByRole("tab", { name: "Perfil" })).toHaveAttribute("aria-selected", "false");
		expect(screen.getByRole("tabpanel")).toHaveTextContent("Experiência");
		expect(screen.getByRole("heading", { name: "Experiência" })).toBeVisible();
		expect(screen.queryByRole("heading", { name: "Perfil" })).not.toBeInTheDocument();
	});

	it("should keep keyboard selection and panel in sync", async () => {
		const user = userEvent.setup();
		render(<EditorShell publicSlug="lucas-almeida" />);

		screen.getByRole("tab", { name: "Perfil" }).focus();
		await user.keyboard("{ArrowRight}");

		expect(screen.getByRole("tab", { name: "Experiência" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
		expect(screen.getByRole("tab", { name: "Perfil" })).toHaveAttribute("aria-selected", "false");
		expect(screen.getByRole("tabpanel")).toHaveTextContent("Experiência");
		expect(screen.getByRole("heading", { name: "Experiência" })).toBeVisible();
		expect(screen.queryByRole("heading", { name: "Perfil" })).not.toBeInTheDocument();
	});
});
