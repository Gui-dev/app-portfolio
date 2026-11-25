import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ProfileDraft } from "@/lib/validation/profile";
import { ProjectsForm } from "./projects-form";

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

describe("ProjectsForm", () => {
	it('should split technologies by comma into tags ("Next.js, TypeScript" -> ["Next.js","TypeScript"])', async () => {
		const user = userEvent.setup();
		const onValuesChange = vi.fn();
		render(<ProjectsForm defaultValues={[makeProject()]} onValuesChange={onValuesChange} />);

		const input = screen.getByLabelText("Tecnologias (separadas por vírgula)");
		await user.type(input, "Next.js, TypeScript");

		const last = onValuesChange.mock.calls.at(-1)?.[0] as Project[];
		expect(last[0]?.tags).toEqual(["Next.js", "TypeScript"]);
	});

	it("should remove project", async () => {
		const user = userEvent.setup();
		render(
			<ProjectsForm
				defaultValues={[makeProject({ name: "A" }), makeProject({ name: "B", sortOrder: 1 })]}
				onValuesChange={vi.fn()}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Remover projeto 01" }));

		expect(screen.getAllByRole("article")).toHaveLength(1);
		expect(screen.getByLabelText("Nome do Projeto")).toHaveValue("B");
	});
});
