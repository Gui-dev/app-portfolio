import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProfileTab } from "./profile-tab";

describe("ProfileTab", () => {
	it("should render the section heading and description", () => {
		render(<ProfileTab />);

		expect(screen.getByRole("heading", { name: "Informações Pessoais & SEO" })).toBeInTheDocument();
		expect(
			screen.getByText("Estes dados alimentam o cabeçalho do portfólio e as meta tags OpenGraph."),
		).toBeInTheDocument();
	});

	it("should render the mock values in every field", () => {
		render(<ProfileTab />);

		expect(screen.getByLabelText("Nome Completo")).toHaveValue("Lucas Almeida");
		expect(screen.getByLabelText("Slug Público (/seunome)")).toHaveValue("lucas-almeida");
		expect(screen.getByLabelText("Cargo / Headline")).toHaveValue(
			"Engenheiro de Software Fullstack • React, Next.js & Node.js",
		);
		expect(screen.getByLabelText("Bio Resumida")).toHaveValue(
			"Especialista em construir aplicações web escaláveis, rápidas e acessíveis. Apaixonado por arquitetura limpa, Design Systems e experiências de usuário memoráveis.",
		);
		expect(screen.getByLabelText("Localização")).toHaveValue("São Paulo, SP • Remoto");
		expect(screen.getByLabelText("E-mail de Contato")).toHaveValue("lucas.almeida@dev.io");
		expect(screen.getByLabelText("GitHub (usuário)")).toHaveValue("github.com/lucasalmeida");
		expect(screen.getByLabelText("LinkedIn")).toHaveValue("linkedin.com/in/lucasalmeida");
	});

	it("should update the monogram when the name changes", async () => {
		const user = userEvent.setup();
		render(<ProfileTab />);

		const nameInput = screen.getByLabelText("Nome Completo");
		await user.clear(nameInput);
		await user.type(nameInput, "Marina Souza");

		expect(screen.getByRole("img", { name: "Monograma MS" })).toBeInTheDocument();
	});

	it("should select another avatar style on click", async () => {
		const user = userEvent.setup();
		render(<ProfileTab />);

		const indigo = screen.getByRole("button", { name: "Indigo/Cyan" });
		const emerald = screen.getByRole("button", { name: "Emerald Dev" });

		expect(indigo).toHaveAttribute("aria-pressed", "true");
		expect(emerald).toHaveAttribute("aria-pressed", "false");

		await user.click(emerald);

		expect(indigo).toHaveAttribute("aria-pressed", "false");
		expect(emerald).toHaveAttribute("aria-pressed", "true");
	});
});
