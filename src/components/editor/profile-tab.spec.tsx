import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ProfileDraft } from "@/lib/validation/profile";
import { ProfileTab } from "./profile-tab";

function makeDraft(overrides: Partial<ProfileDraft> = {}): ProfileDraft {
	return {
		fullName: "Lucas Almeida",
		slug: "lucas-almeida",
		headline: "Engenheiro de Software Fullstack • React, Next.js & Node.js",
		bio: "Especialista em construir aplicações web escaláveis, rápidas e acessíveis. Apaixonado por arquitetura limpa, Design Systems e experiências de usuário memoráveis.",
		location: "São Paulo, SP • Remoto",
		contactEmail: "lucas.almeida@dev.io",
		githubUrl: "github.com/lucasalmeida",
		linkedinUrl: "linkedin.com/in/lucasalmeida",
		monogramStyle: "gradient",
		template: "modern",
		colorMode: "dark",
		experiences: [],
		projects: [],
		skills: [],
		...overrides,
	};
}

describe("ProfileTab", () => {
	it("should render the section heading and description", () => {
		render(<ProfileTab defaultValues={makeDraft()} onValuesChange={vi.fn()} />);

		expect(screen.getByRole("heading", { name: "Informações Pessoais & SEO" })).toBeInTheDocument();
		expect(
			screen.getByText("Estes dados alimentam o cabeçalho do portfólio e as meta tags OpenGraph."),
		).toBeInTheDocument();
	});

	it("should render the mock values in every field", () => {
		render(<ProfileTab defaultValues={makeDraft()} onValuesChange={vi.fn()} />);

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
		render(<ProfileTab defaultValues={makeDraft()} onValuesChange={vi.fn()} />);

		const nameInput = screen.getByLabelText("Nome Completo");
		await user.clear(nameInput);
		await user.type(nameInput, "Marina Souza");

		expect(screen.getByRole("img", { name: "Monograma MS" })).toBeInTheDocument();
	});

	it("should select another avatar style on click", async () => {
		const user = userEvent.setup();
		render(<ProfileTab defaultValues={makeDraft()} onValuesChange={vi.fn()} />);

		const indigo = screen.getByRole("button", { name: "Indigo/Cyan" });
		const emerald = screen.getByRole("button", { name: "Emerald Dev" });

		expect(indigo).toHaveAttribute("aria-pressed", "true");
		expect(emerald).toHaveAttribute("aria-pressed", "false");

		await user.click(emerald);

		expect(indigo).toHaveAttribute("aria-pressed", "false");
		expect(emerald).toHaveAttribute("aria-pressed", "true");
	});

	it("should show the slug preview as the user types", async () => {
		const user = userEvent.setup();
		render(<ProfileTab defaultValues={makeDraft({ slug: "" })} onValuesChange={vi.fn()} />);

		await user.type(screen.getByLabelText("Slug Público (/seunome)"), "novo-slug");
		expect(screen.getByText("novo-slug")).toBeInTheDocument();
		expect(screen.getByText(/foliocraft\.app\//)).toBeInTheDocument();
	});

	it("should surface a slug field error returned by the server", () => {
		render(
			<ProfileTab
				defaultValues={makeDraft()}
				onValuesChange={vi.fn()}
				serverFieldErrors={{ slug: "Este slug já está em uso." }}
			/>,
		);

		expect(screen.getByText("Este slug já está em uso.")).toBeInTheDocument();
	});
});
