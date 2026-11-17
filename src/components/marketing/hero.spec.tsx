import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "./hero";

describe("Hero", () => {
	it("should link the primary CTA to signup", () => {
		render(<Hero />);

		expect(screen.getByRole("link", { name: "Criar meu portfólio" })).toHaveAttribute(
			"href",
			"/signup",
		);
	});

	it("should link the demo to the seeded profile", () => {
		render(<Hero />);

		expect(screen.getByRole("link", { name: "Ver demo" })).toHaveAttribute("href", "/bruce-wayne");
	});
});
