import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AppearanceTab } from "./appearance-tab";

describe("AppearanceTab", () => {
	it("should render the heading, the description, and both section labels", () => {
		render(<AppearanceTab />);

		expect(
			screen.getByRole("heading", { name: "Personalização Visual do Portfólio" }),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				"Escolha a identidade visual da sua página pública e o esquema de cores padrão.",
			),
		).toBeInTheDocument();
		expect(screen.getByText("1. Escolha o Template")).toBeInTheDocument();
		expect(screen.getByText("2. Esquema de Cores do Portfólio")).toBeInTheDocument();
	});

	it("should render three template radios with Modern checked and a single Ativo badge in Modern", () => {
		render(<AppearanceTab />);

		const minimal = screen.getByRole("radio", { name: /Minimal/ });
		const developer = screen.getByRole("radio", { name: /Developer/ });
		const modern = screen.getByRole("radio", { name: /Modern/ });

		expect(minimal).not.toBeChecked();
		expect(developer).not.toBeChecked();
		expect(modern).toBeChecked();

		expect(screen.getAllByText("Ativo")).toHaveLength(1);
		const modernLabel = modern.closest("label");
		expect(modernLabel).not.toBeNull();
		expect(within(modernLabel as HTMLElement).getByText("Ativo")).toBeInTheDocument();
	});

	it("should select Minimal, uncheck Modern, and move Ativo into the Minimal card", async () => {
		const user = userEvent.setup();
		render(<AppearanceTab />);

		const minimal = screen.getByRole("radio", { name: /Minimal/ });
		const modern = screen.getByRole("radio", { name: /Modern/ });
		await user.click(minimal);

		expect(minimal).toBeChecked();
		expect(modern).not.toBeChecked();
		expect(screen.getAllByText("Ativo")).toHaveLength(1);
		const minimalLabel = minimal.closest("label");
		expect(minimalLabel).not.toBeNull();
		expect(within(minimalLabel as HTMLElement).getByText("Ativo")).toBeInTheDocument();
	});

	it("should render color mode radios with Dark checked by default and switch to Light", async () => {
		const user = userEvent.setup();
		render(<AppearanceTab />);

		const light = screen.getByRole("radio", { name: /Light Mode/ });
		const dark = screen.getByRole("radio", { name: /Dark Mode/ });

		expect(dark).toBeChecked();
		expect(light).not.toBeChecked();

		await user.click(light);
		expect(light).toBeChecked();
		expect(dark).not.toBeChecked();
	});

	it("should keep color mode independent when changing template", async () => {
		const user = userEvent.setup();
		render(<AppearanceTab />);

		const light = screen.getByRole("radio", { name: /Light Mode/ });
		await user.click(light);
		expect(light).toBeChecked();

		await user.click(screen.getByRole("radio", { name: /Developer/ }));
		expect(light).toBeChecked();
		expect(screen.getByRole("radio", { name: /Dark Mode/ })).not.toBeChecked();
	});
});
