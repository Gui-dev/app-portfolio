import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ProfileWithRelations } from "@/lib/db/schema";
import { PortfolioPage } from "./portfolio-page";

function makeProfile(overrides: Partial<ProfileWithRelations> = {}): ProfileWithRelations {
	return {
		id: "profile-1",
		userId: "user-1",
		slug: "bruce-wayne",
		fullName: "Bruce Wayne",
		headline: "Engenheiro de Software",
		bio: "Construo produtos com foco em qualidade.",
		location: "Gotham, NJ",
		contactEmail: "bruce@wayne.dev",
		githubUrl: "https://github.com/brucewayne",
		linkedinUrl: "https://linkedin.com/in/brucewayne",
		monogramStyle: "gradient",
		template: "modern",
		colorMode: "dark",
		isPublished: true,
		publishedAt: new Date("2026-01-01T00:00:00Z"),
		createdAt: new Date("2026-01-01T00:00:00Z"),
		updatedAt: new Date("2026-01-01T00:00:00Z"),
		experiences: [
			{
				id: "exp-1",
				profileId: "profile-1",
				kind: "formal",
				role: "Senior Engineer",
				company: "Wayne Enterprises",
				period: "2020 - Atual",
				description: "Liderança técnica.",
				sortOrder: 1,
			},
			{
				id: "exp-2",
				profileId: "profile-1",
				kind: "open-source",
				role: "Maintainer",
				company: "Bat OSS",
				period: "2019 - 2020",
				description: "Contribuições open source.",
				sortOrder: 0,
			},
		],
		projects: [
			{
				id: "proj-1",
				profileId: "profile-1",
				name: "Batarang",
				description: "Ferramenta de produtividade.",
				repoUrl: "https://github.com/brucewayne/batarang",
				demoUrl: "https://batarang.dev",
				tags: ["TypeScript", "React"],
				sortOrder: 0,
			},
		],
		skills: [
			{ id: "skill-1", profileId: "profile-1", name: "TypeScript", sortOrder: 0 },
			{ id: "skill-2", profileId: "profile-1", name: "React", sortOrder: 1 },
		],
		...overrides,
	};
}

describe("PortfolioPage", () => {
	it("should render name, headline, bio and initials", () => {
		render(<PortfolioPage profile={makeProfile()} />);

		expect(screen.getByRole("heading", { name: "Bruce Wayne" })).toBeInTheDocument();
		expect(screen.getByText("Engenheiro de Software")).toBeInTheDocument();
		expect(screen.getByText("Construo produtos com foco em qualidade.")).toBeInTheDocument();
		expect(screen.getByText("BW")).toBeInTheDocument();
	});

	it("should render social links with rel noopener", () => {
		render(<PortfolioPage profile={makeProfile()} />);

		const github = screen.getByRole("link", { name: "GitHub" });
		const linkedin = screen.getByRole("link", { name: "LinkedIn" });
		expect(github).toHaveAttribute("href", "https://github.com/brucewayne");
		expect(linkedin).toHaveAttribute("href", "https://linkedin.com/in/brucewayne");
		expect(github).toHaveAttribute("rel", expect.stringContaining("noopener"));
		expect(linkedin).toHaveAttribute("rel", expect.stringContaining("noopener"));
	});

	it("should hide empty sections", () => {
		render(
			<PortfolioPage
				profile={makeProfile({
					experiences: [],
					projects: [],
					skills: [],
				})}
			/>,
		);

		expect(
			screen.queryByRole("heading", { name: "Experiência Profissional" }),
		).not.toBeInTheDocument();
		expect(screen.queryByRole("heading", { name: "Projetos em Destaque" })).not.toBeInTheDocument();
		expect(screen.queryByRole("heading", { name: "Stack & Tecnologias" })).not.toBeInTheDocument();
	});

	it("should render bio and social links without a Sobre heading", () => {
		render(<PortfolioPage profile={makeProfile()} />);

		expect(screen.queryByRole("heading", { name: "Sobre" })).not.toBeInTheDocument();
		expect(screen.getByText("Construo produtos com foco em qualidade.")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "GitHub" })).toBeInTheDocument();
	});

	it("should render 100 skills without crashing", () => {
		const skills = Array.from({ length: 100 }, (_, index) => ({
			id: `skill-${index}`,
			profileId: "profile-1",
			name: `Skill ${index}`,
			sortOrder: index,
		}));

		render(<PortfolioPage profile={makeProfile({ skills })} />);

		const list = screen.getByRole("list", { name: "Habilidades" });
		expect(within(list).getAllByRole("listitem")).toHaveLength(100);
	});

	it("should escape markup in the bio", () => {
		const { container } = render(
			<PortfolioPage profile={makeProfile({ bio: "<script>alert(1)</script>" })} />,
		);

		expect(screen.getByText("<script>alert(1)</script>")).toBeInTheDocument();
		expect(container.querySelector("script")).toBeNull();
	});

	it("should order experiences by sortOrder", () => {
		render(<PortfolioPage profile={makeProfile()} />);

		const headings = screen.getAllByRole("heading", { level: 3 });
		const experienceHeadings = headings.filter((heading) =>
			["Maintainer", "Senior Engineer"].includes(heading.textContent ?? ""),
		);
		expect(experienceHeadings[0]).toHaveTextContent("Maintainer");
	});

	it("should expose the selected template and mode", () => {
		render(<PortfolioPage profile={makeProfile({ template: "developer", colorMode: "light" })} />);

		const article = screen.getByRole("article", { name: "Portfólio de Bruce Wayne" });
		expect(article).toHaveAttribute("data-template", "developer");
		expect(article).toHaveAttribute("data-mode", "light");
	});

	it("should render the experience kind label", () => {
		render(<PortfolioPage profile={makeProfile()} />);

		expect(screen.getByText("Open Source")).toBeInTheDocument();
	});

	it("should keep developer heading accessible name and render decorative prefix", () => {
		const { container } = render(
			<PortfolioPage profile={makeProfile({ template: "developer", colorMode: "dark" })} />,
		);

		expect(screen.getByRole("heading", { name: "Experiência Profissional" })).toBeInTheDocument();
		expect(container.querySelector(".pf-code-prefix")).not.toBeNull();
	});
});
