import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProjectsTab } from "./projects-tab";

describe("ProjectsTab", () => {
	it("should render the section heading, description and Novo Projeto button", () => {
		render(<ProjectsTab />);

		expect(screen.getByRole("heading", { name: "Projetos em Destaque" })).toBeInTheDocument();
		expect(
			screen.getByText("Mostre seus melhores trabalhos com tags de tecnologias e links."),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Novo Projeto" })).toBeInTheDocument();
	});

	it("should render the two mock cards with their values", () => {
		render(<ProjectsTab />);

		const first = screen.getByRole("article", { name: "Projeto #01" });
		const second = screen.getByRole("article", { name: "Projeto #02" });

		expect(within(first).getByText("Projeto #01")).toBeInTheDocument();
		expect(within(first).getByLabelText("Nome do Projeto")).toHaveValue("PulseMetrics SaaS");
		expect(within(first).getByLabelText("Tecnologias (separadas por vírgula)")).toHaveValue(
			"Next.js, TypeScript, Tailwind, PostgreSQL",
		);
		expect(within(first).getByLabelText("Descrição curta")).toHaveValue(
			"Plataforma de analytics em tempo real com ingestão de eventos via Edge Functions e dashboards interativos.",
		);
		expect(within(first).getByLabelText("Link Repositório")).toHaveValue(
			"github.com/lucasalmeida/pulse-metrics",
		);
		expect(within(first).getByLabelText("Link Demo Ao Vivo")).toHaveValue("pulsemetrics.app");

		expect(within(second).getByText("Projeto #02")).toBeInTheDocument();
		expect(within(second).getByLabelText("Nome do Projeto")).toHaveValue("UI Kit Accessible");
		expect(within(second).getByLabelText("Tecnologias (separadas por vírgula)")).toHaveValue(
			"React, ARIA, Vite, Storybook",
		);
		expect(within(second).getByLabelText("Descrição curta")).toHaveValue(
			"Biblioteca de componentes React headless focada em acessibilidade (WAI-ARIA) e zero runtime CSS.",
		);
		expect(within(second).getByLabelText("Link Repositório")).toHaveValue(
			"github.com/lucasalmeida/ui-kit",
		);
		expect(within(second).getByLabelText("Link Demo Ao Vivo")).toHaveValue("uikit-docs.dev");
	});

	it("should add an empty project from the Novo Projeto button", async () => {
		const user = userEvent.setup();
		render(<ProjectsTab />);

		await user.click(screen.getByRole("button", { name: "Novo Projeto" }));

		expect(screen.getAllByRole("article")).toHaveLength(3);
		const third = screen.getByRole("article", { name: "Projeto #03" });
		expect(within(third).getByText("Projeto #03")).toBeInTheDocument();
		expect(within(third).getByLabelText("Nome do Projeto")).toHaveValue("");
	});

	it("should remove a card and renumber the rest", async () => {
		const user = userEvent.setup();
		render(<ProjectsTab />);

		await user.click(screen.getByRole("button", { name: "Remover projeto 01" }));

		expect(screen.getAllByRole("article")).toHaveLength(1);
		const first = screen.getByRole("article", { name: "Projeto #01" });
		expect(within(first).getByLabelText("Nome do Projeto")).toHaveValue("UI Kit Accessible");
	});
});
