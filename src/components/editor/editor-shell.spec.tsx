import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ProfileWithRelations } from "@/lib/db/schema";
import { EditorShell } from "./editor-shell";

vi.mock("@/app/dashboard/actions", () => ({
	saveProfileDraft: vi.fn(async () => ({ ok: true, profile: makeProfile() })),
	publishProfile: vi.fn(async () => ({
		ok: true,
		profile: { ...makeProfile(), isPublished: true },
	})),
	unpublishProfile: vi.fn(async () => ({ ok: true, profile: makeProfile() })),
}));

function makeProfile(overrides: Partial<ProfileWithRelations> = {}): ProfileWithRelations {
	return {
		id: "profile-1",
		userId: "user-1",
		slug: "lucas-almeida",
		fullName: "Lucas Almeida",
		headline: "Engenheiro de Software",
		bio: "Bio",
		location: "SP",
		contactEmail: "lucas@example.com",
		githubUrl: "https://github.com/lucas",
		linkedinUrl: "https://linkedin.com/in/lucas",
		monogramStyle: "gradient",
		template: "modern",
		colorMode: "dark",
		isPublished: false,
		publishedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		experiences: [],
		projects: [],
		skills: [],
		...overrides,
	};
}

describe("EditorShell", () => {
	it("should render the editor header and the tab menu", () => {
		const { container } = render(<EditorShell profile={makeProfile()} />);

		expect(screen.getByText("FolioCraft")).toBeInTheDocument();
		expect(container).toHaveTextContent("foliocraft.app/lucas-almeida");
		expect(screen.getByRole("navigation", { name: "Seções do editor" })).toBeInTheDocument();
		expect(screen.getByRole("tablist", { name: "Seções do editor" })).toBeInTheDocument();
		expect(screen.getAllByRole("tab")).toHaveLength(5);
	});

	it("should render the action bar with the publish button", () => {
		render(<EditorShell profile={makeProfile()} />);

		expect(screen.getByRole("contentinfo")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Salvar e Publicar" })).toBeInTheDocument();
	});

	it("should render the profile form in the Perfil tab", () => {
		render(<EditorShell profile={makeProfile()} />);

		expect(screen.getByLabelText("Nome Completo")).toHaveValue("Lucas Almeida");
	});

	it("should show only the active tab panel", () => {
		render(<EditorShell profile={makeProfile()} />);

		expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
		expect(screen.getByLabelText("Nome Completo")).toBeVisible();
		for (const label of ["Experiência", "Projetos", "Skills", "Aparência"]) {
			expect(screen.queryByRole("heading", { name: label })).not.toBeInTheDocument();
		}
	});

	it("should render the experience form in the Experiência tab", async () => {
		const user = userEvent.setup();
		render(<EditorShell profile={makeProfile()} />);

		await user.click(screen.getByRole("tab", { name: "Experiência" }));

		expect(
			screen.getByRole("heading", { name: "Experiência & Vivência Prática" }),
		).toBeInTheDocument();
	});

	it("should render the projects form in the Projetos tab", async () => {
		const user = userEvent.setup();
		render(<EditorShell profile={makeProfile()} />);

		await user.click(screen.getByRole("tab", { name: "Projetos" }));

		expect(screen.getByRole("heading", { name: "Projetos em Destaque" })).toBeInTheDocument();
	});

	it("should render the skills form in the Skills tab", async () => {
		const user = userEvent.setup();
		render(<EditorShell profile={makeProfile()} />);

		await user.click(screen.getByRole("tab", { name: "Skills" }));

		expect(screen.getByRole("heading", { name: "Stack & Habilidades" })).toBeInTheDocument();
		expect(screen.getByLabelText("Nova habilidade")).toBeInTheDocument();
	});

	it("should render the appearance form in the Aparência tab", async () => {
		const user = userEvent.setup();
		render(<EditorShell profile={makeProfile()} />);

		await user.click(screen.getByRole("tab", { name: "Aparência" }));

		expect(
			screen.getByRole("heading", { name: "Personalização Visual do Portfólio" }),
		).toBeInTheDocument();
	});

	it("should switch the panel when another tab is clicked", async () => {
		const user = userEvent.setup();
		render(<EditorShell profile={makeProfile()} />);

		await user.click(screen.getByRole("tab", { name: "Experiência" }));

		expect(screen.getByRole("tab", { name: "Experiência" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
		expect(screen.getByRole("tab", { name: "Perfil" })).toHaveAttribute("aria-selected", "false");
		expect(screen.queryByLabelText("Nome Completo")).not.toBeInTheDocument();
	});

	it("should keep keyboard selection and panel in sync", async () => {
		const user = userEvent.setup();
		render(<EditorShell profile={makeProfile()} />);

		screen.getByRole("tab", { name: "Perfil" }).focus();
		await user.keyboard("{ArrowRight}");

		expect(screen.getByRole("tab", { name: "Experiência" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
		expect(screen.queryByLabelText("Nome Completo")).not.toBeInTheDocument();
	});
});
