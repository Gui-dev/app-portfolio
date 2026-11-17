import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
	it("should render as a link when asChild is used", () => {
		render(
			<Button asChild>
				<a href="/signup">Criar meu portfólio</a>
			</Button>,
		);

		expect(screen.getByRole("link", { name: "Criar meu portfólio" })).toHaveAttribute(
			"href",
			"/signup",
		);
	});

	it("should apply the secondary variant", () => {
		render(<Button variant="secondary">Ver demo</Button>);

		expect(screen.getByRole("button", { name: "Ver demo" })).toHaveClass("bg-surface");
	});
});
