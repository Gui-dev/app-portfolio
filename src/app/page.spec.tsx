import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Landing page", () => {
	it("should render the landing headline", () => {
		render(<Home />);

		expect(
			screen.getByRole("heading", { level: 1, name: /portfólio que abre portas/i }),
		).toBeInTheDocument();
	});

	it("should render the header and hero signup CTAs", () => {
		render(<Home />);

		const ctas = screen.getAllByRole("link", { name: "Criar meu portfólio" });
		expect(ctas).toHaveLength(2);
		expect(ctas.every((cta) => cta.getAttribute("href") === "/signup")).toBe(true);
	});

	it("should expose the explore and login links in the header", () => {
		render(<Home />);

		expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute("href", "/explore");
		expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
	});

	it("should present the three product highlights", () => {
		render(<Home />);

		expect(screen.getByRole("heading", { name: "SEO técnico" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Temas" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "PDF" })).toBeInTheDocument();
	});
});
