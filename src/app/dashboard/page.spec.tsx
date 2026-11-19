import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DashboardPage from "./page";

describe("Dashboard page", () => {
	it("should render the editor header", () => {
		render(<DashboardPage />);

		expect(screen.getByText("FolioCraft")).toBeInTheDocument();
	});

	it("should render the preview panel", () => {
		render(<DashboardPage />);

		expect(screen.getByRole("complementary", { name: "Prévia do portfólio" })).toBeInTheDocument();
		expect(screen.getByText("Prévia ao vivo")).toBeInTheDocument();
	});
});
