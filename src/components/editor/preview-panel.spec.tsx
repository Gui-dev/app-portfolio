import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ProfileWithRelations } from "@/lib/db/schema";
import { templateStyle } from "@/lib/template";
import { PreviewPanel } from "./preview-panel";

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

describe("PreviewPanel", () => {
	it("should render the name and headline from the profile", () => {
		render(<PreviewPanel profile={makeProfile()} publicSlug="lucas-almeida" />);

		expect(screen.getByRole("heading", { name: "Lucas Almeida" })).toBeInTheDocument();
		expect(screen.getByText("Engenheiro de Software")).toBeInTheDocument();
	});

	it("should expose the selected template in data-template", () => {
		const { container } = render(
			<PreviewPanel profile={makeProfile({ template: "developer" })} publicSlug="lucas-almeida" />,
		);

		expect(container.querySelector("[data-template]")).toHaveAttribute(
			"data-template",
			"developer",
		);
	});

	it("should apply the selected template css variables", () => {
		const { container } = render(
			<PreviewPanel profile={makeProfile({ template: "developer" })} publicSlug="lucas-almeida" />,
		);
		const accent = templateStyle("developer", "dark")["--accent"];

		expect(container.querySelector("[data-template]")?.getAttribute("style")).toContain(
			`--accent: ${accent}`,
		);
	});

	it("should show the active template name in the toolbar", () => {
		render(
			<PreviewPanel profile={makeProfile({ template: "minimal" })} publicSlug="lucas-almeida" />,
		);

		expect(screen.getByText("Minimal")).toBeInTheDocument();
		expect(screen.queryByText("Modern")).not.toBeInTheDocument();
	});

	it("should render the live-preview label and the public URL for the slug", () => {
		const { container } = render(
			<PreviewPanel profile={makeProfile()} publicSlug="lucas-almeida" />,
		);

		expect(screen.getByText("Prévia ao vivo")).toBeInTheDocument();
		expect(container).toHaveTextContent("foliocraft.app/");
		expect(container).toHaveTextContent("lucas-almeida");
	});

	it("should activate the desktop viewport by default and switch to mobile on click", async () => {
		const user = userEvent.setup();
		render(<PreviewPanel profile={makeProfile()} publicSlug="lucas-almeida" />);

		const desktopButton = screen.getByRole("button", { name: "Visualização desktop" });
		const mobileButton = screen.getByRole("button", { name: "Visualização mobile" });

		expect(desktopButton).toHaveAttribute("aria-pressed", "true");
		expect(mobileButton).toHaveAttribute("aria-pressed", "false");

		await user.click(mobileButton);

		expect(desktopButton).toHaveAttribute("aria-pressed", "false");
		expect(mobileButton).toHaveAttribute("aria-pressed", "true");
	});

	it("should reflect a dark profile and request a light preview theme", async () => {
		const user = userEvent.setup();
		const onColorModeChange = vi.fn();
		const { container } = render(
			<PreviewPanel
				onColorModeChange={onColorModeChange}
				profile={makeProfile({ colorMode: "dark" })}
				publicSlug="lucas-almeida"
			/>,
		);

		const themeButton = screen.getByRole("button", { name: /Tema da prévia/ });
		expect(themeButton).toHaveAttribute("aria-pressed", "false");
		expect(container.querySelector("[data-mode]")).toHaveAttribute("data-mode", "dark");
		expect(screen.getByText("Escuro")).toBeInTheDocument();

		await user.click(themeButton);

		expect(onColorModeChange).toHaveBeenCalledWith("light");
	});

	it("should reflect a light profile and request a dark preview theme", async () => {
		const user = userEvent.setup();
		const onColorModeChange = vi.fn();
		const { container } = render(
			<PreviewPanel
				onColorModeChange={onColorModeChange}
				profile={makeProfile({ colorMode: "light" })}
				publicSlug="lucas-almeida"
			/>,
		);

		const themeButton = screen.getByRole("button", { name: /Tema da prévia/ });
		expect(themeButton).toHaveAttribute("aria-pressed", "true");
		expect(container.querySelector("[data-mode]")).toHaveAttribute("data-mode", "light");
		expect(screen.getByText("Claro")).toBeInTheDocument();

		await user.click(themeButton);

		expect(onColorModeChange).toHaveBeenCalledWith("dark");
	});

	it("should render the live portfolio instead of a placeholder", () => {
		render(<PreviewPanel profile={makeProfile()} publicSlug="lucas-almeida" />);

		expect(screen.queryByText("A prévia do portfólio aparecerá aqui.")).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Baixar PDF" })).toBeDisabled();
	});
});
