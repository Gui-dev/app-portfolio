import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ProfileDraft } from "@/lib/validation/profile";
import { ProjectsTab } from "./projects-tab";

type Project = ProfileDraft["projects"][number];

function makeProject(overrides: Partial<Project> = {}): Project {
	return {
		name: "Projeto",
		description: "Descrição",
		repoUrl: "",
		demoUrl: "",
		tags: [],
		sortOrder: 0,
		...overrides,
	};
}

describe("ProjectsTab", () => {
	it("should render heading and add button", () => {
		render(<ProjectsTab defaultValues={[]} onValuesChange={vi.fn()} />);
		expect(screen.getByRole("heading", { name: "Projetos em Destaque" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Novo Projeto" })).toBeInTheDocument();
	});

	it("should split technologies by comma into tags", async () => {
		const user = userEvent.setup();
		const onValuesChange = vi.fn();
		render(<ProjectsTab defaultValues={[makeProject()]} onValuesChange={onValuesChange} />);
		await user.type(
			screen.getByLabelText("Tecnologias (separadas por vírgula)"),
			"Next.js, TypeScript",
		);
		const last = onValuesChange.mock.calls.at(-1)?.[0] as Project[];
		expect(last[0]?.tags).toEqual(["Next.js", "TypeScript"]);
	});

	it("should remove project and renumber", async () => {
		const user = userEvent.setup();
		render(
			<ProjectsTab
				defaultValues={[makeProject({ name: "A" }), makeProject({ name: "B", sortOrder: 1 })]}
				onValuesChange={vi.fn()}
			/>,
		);
		await user.click(screen.getByRole("button", { name: "Remover projeto 01" }));
		expect(screen.getAllByRole("article")).toHaveLength(1);
		expect(screen.getByLabelText("Nome do Projeto")).toHaveValue("B");
	});
});
