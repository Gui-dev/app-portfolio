import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ExperienceTab } from "./experience-tab";

describe("ExperienceTab", () => {
	it("should render the section heading, description and helper banner", () => {
		render(<ExperienceTab />);

		expect(
			screen.getByRole("heading", { name: "Experiência & Vivência Prática" }),
		).toBeInTheDocument();
		expect(
			screen.getByText("Adicione empregos formais, freelas, open source ou projetos acadêmicos."),
		).toBeInTheDocument();
		expect(screen.getByText("Procurando o primeiro emprego na área?")).toBeInTheDocument();
		expect(screen.getByText("Quer ver como fica na prática?")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "✨ Carregar Perfil Primeiro Emprego" }),
		).toBeInTheDocument();
	});

	it("should render the two mock cards with their values and kinds", () => {
		render(<ExperienceTab />);

		const first = screen.getByRole("article", { name: "Experiência #01" });
		const second = screen.getByRole("article", { name: "Experiência #02" });

		expect(within(first).getByText("#01")).toBeInTheDocument();
		expect(within(first).getByLabelText("Tipo da experiência 1")).toHaveValue("formal");
		expect(within(first).getByLabelText("Cargo ou Papel Exercido")).toHaveValue(
			"Senior Frontend Engineer",
		);
		expect(within(first).getByLabelText("Empresa, Projeto ou Instituição")).toHaveValue(
			"Nubank (Nu Pagamentos)",
		);
		expect(within(first).getByLabelText("Período")).toHaveValue("2024 — Atual");
		expect(
			within(first).getByLabelText("Entregas e Resultados (Foque no impacto técnico)"),
		).toHaveValue(
			"Liderança técnica na arquitetura de micro-frontends em React/TypeScript, melhorando o Core Web Vitals (LCP) em 38% e mantendo o Design System interno.",
		);

		expect(within(second).getByText("#02")).toBeInTheDocument();
		expect(within(second).getByLabelText("Tipo da experiência 2")).toHaveValue("formal");
		expect(within(second).getByLabelText("Cargo ou Papel Exercido")).toHaveValue(
			"Desenvolvedor Fullstack Pleno",
		);
		expect(within(second).getByLabelText("Empresa, Projeto ou Instituição")).toHaveValue("Vtex");
		expect(within(second).getByLabelText("Período")).toHaveValue("2021 — 2024");
	});

	it("should add a formal experience from the Adicionar button", async () => {
		const user = userEvent.setup();
		render(<ExperienceTab />);

		await user.click(screen.getByRole("button", { name: "Adicionar" }));

		expect(screen.getAllByRole("article")).toHaveLength(3);
		const third = screen.getByRole("article", { name: "Experiência #03" });
		expect(within(third).getByText("#03")).toBeInTheDocument();
		expect(within(third).getByLabelText("Tipo da experiência 3")).toHaveValue("formal");
		expect(within(third).getByLabelText("Cargo ou Papel Exercido")).toHaveValue("");
	});

	it("should add an experience from the kind picker", async () => {
		const user = userEvent.setup();
		render(<ExperienceTab />);

		const picker = screen.getByLabelText("Adicionar experiência de outro tipo");
		await user.selectOptions(picker, "freelance");

		expect(screen.getAllByRole("article")).toHaveLength(3);
		const third = screen.getByRole("article", { name: "Experiência #03" });
		expect(within(third).getByLabelText("Tipo da experiência 3")).toHaveValue("freelance");
		expect(picker).toHaveValue("");
	});

	it("should change the kind of an existing card", async () => {
		const user = userEvent.setup();
		render(<ExperienceTab />);

		const kindSelect = within(
			screen.getByRole("article", { name: "Experiência #01" }),
		).getByLabelText("Tipo da experiência 1");

		await user.selectOptions(kindSelect, "volunteer");

		expect(kindSelect).toHaveValue("volunteer");
	});

	it("should remove a card and renumber the rest", async () => {
		const user = userEvent.setup();
		render(<ExperienceTab />);

		await user.click(screen.getByRole("button", { name: "Remover experiência 01" }));

		expect(screen.getAllByRole("article")).toHaveLength(1);
		const first = screen.getByRole("article", { name: "Experiência #01" });
		expect(within(first).getByLabelText("Cargo ou Papel Exercido")).toHaveValue(
			"Desenvolvedor Fullstack Pleno",
		);
		expect(within(first).getByLabelText("Empresa, Projeto ou Instituição")).toHaveValue("Vtex");
	});

	it("should load the first-job examples", async () => {
		const user = userEvent.setup();
		render(<ExperienceTab />);

		await user.click(screen.getByRole("button", { name: "✨ Carregar Perfil Primeiro Emprego" }));

		expect(screen.getAllByRole("article")).toHaveLength(5);
		expect(
			within(screen.getByRole("article", { name: "Experiência #03" })).getByLabelText(
				"Tipo da experiência 3",
			),
		).toHaveValue("freelance");
		expect(
			within(screen.getByRole("article", { name: "Experiência #04" })).getByLabelText(
				"Tipo da experiência 4",
			),
		).toHaveValue("open-source");
		expect(
			within(screen.getByRole("article", { name: "Experiência #05" })).getByLabelText(
				"Tipo da experiência 5",
			),
		).toHaveValue("academic");
	});
});
