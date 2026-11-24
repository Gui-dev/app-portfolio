import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EditorActionBar } from "./editor-action-bar";

describe("EditorActionBar", () => {
	it("should render the default draft status text", () => {
		render(<EditorActionBar />);

		expect(screen.getByText("Rascunho pronto")).toBeInTheDocument();
	});

	it("should render the export and publish buttons with their pt-BR labels", () => {
		render(<EditorActionBar />);

		expect(screen.getByRole("button", { name: "Exportar PDF" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Salvar e Publicar" })).toBeInTheDocument();
	});

	it('should mark both buttons as type="button"', () => {
		render(<EditorActionBar />);

		for (const label of ["Exportar PDF", "Salvar e Publicar"]) {
			expect(screen.getByRole("button", { name: label })).toHaveAttribute("type", "button");
		}
	});
});
