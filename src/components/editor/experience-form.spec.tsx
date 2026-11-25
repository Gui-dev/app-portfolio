import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ProfileDraft } from "@/lib/validation/profile";
import { ExperienceForm } from "./experience-form";

type Experience = ProfileDraft["experiences"][number];

function makeExperience(overrides: Partial<Experience> = {}): Experience {
	return {
		kind: "formal",
		role: "Desenvolvedor",
		company: "Empresa",
		period: "2024 — Atual",
		description: "Descrição",
		sortOrder: 0,
		...overrides,
	};
}

describe("ExperienceForm", () => {
	it("should add experience of selected kind", async () => {
		const user = userEvent.setup();
		const onValuesChange = vi.fn();
		render(<ExperienceForm defaultValues={[]} onValuesChange={onValuesChange} />);

		await user.selectOptions(
			screen.getByLabelText("Adicionar experiência de outro tipo"),
			"freelance",
		);

		expect(screen.getAllByRole("article")).toHaveLength(1);
		expect(screen.getByLabelText("Tipo da experiência 1")).toHaveValue("freelance");
	});

	it("should remove the second experience", async () => {
		const user = userEvent.setup();
		render(
			<ExperienceForm
				defaultValues={[
					makeExperience({ role: "Primeiro", sortOrder: 0 }),
					makeExperience({ role: "Segundo", sortOrder: 1 }),
				]}
				onValuesChange={vi.fn()}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Remover experiência 02" }));

		expect(screen.getAllByRole("article")).toHaveLength(1);
		expect(screen.getByLabelText("Cargo ou Papel Exercido")).toHaveValue("Primeiro");
	});

	it("should move up/down and renumber sortOrder in visual order", async () => {
		const user = userEvent.setup();
		const onValuesChange = vi.fn();
		render(
			<ExperienceForm
				defaultValues={[
					makeExperience({ role: "Primeiro", sortOrder: 0 }),
					makeExperience({ role: "Segundo", sortOrder: 1 }),
				]}
				onValuesChange={onValuesChange}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Mover Experiência #02 para cima" }));

		const first = screen.getByRole("article", { name: "Experiência #01" });
		expect(within(first).getByLabelText("Cargo ou Papel Exercido")).toHaveValue("Segundo");
		const last = onValuesChange.mock.calls.at(-1)?.[0] as Experience[];
		expect(last.map((e) => [e.role, e.sortOrder])).toEqual([
			["Segundo", 0],
			["Primeiro", 1],
		]);

		await user.click(screen.getByRole("button", { name: "Mover Experiência #01 para baixo" }));
		const afterDown = onValuesChange.mock.calls.at(-1)?.[0] as Experience[];
		expect(afterDown.map((e) => [e.role, e.sortOrder])).toEqual([
			["Primeiro", 0],
			["Segundo", 1],
		]);
	});

	it("should show errors for missing role", async () => {
		const user = userEvent.setup();
		render(
			<ExperienceForm defaultValues={[makeExperience({ role: "" })]} onValuesChange={vi.fn()} />,
		);

		const roleInput = screen.getByLabelText("Cargo ou Papel Exercido");
		await user.click(roleInput);
		await user.tab();

		expect(await screen.findByText("Informe o cargo ou papel.")).toBeInTheDocument();
	});
});
