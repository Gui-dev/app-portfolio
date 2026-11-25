import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SkillsForm } from "./skills-form";

describe("SkillsForm", () => {
	it("should add skill on Enter", async () => {
		const user = userEvent.setup();
		const onValuesChange = vi.fn();
		render(<SkillsForm defaultValues={[]} onValuesChange={onValuesChange} />);

		const input = screen.getByLabelText("Nova habilidade");
		await user.type(input, "React{Enter}");

		expect(screen.getByRole("button", { name: "Remover React" })).toBeInTheDocument();
		expect(onValuesChange).toHaveBeenCalled();
		expect(onValuesChange.mock.calls.at(-1)?.[0]).toContain("React");
	});

	it("should remove skill from chip", async () => {
		const user = userEvent.setup();
		const onValuesChange = vi.fn();
		render(<SkillsForm defaultValues={["React", "TypeScript"]} onValuesChange={onValuesChange} />);

		await user.click(screen.getByRole("button", { name: "Remover React" }));

		expect(screen.queryByRole("button", { name: "Remover React" })).not.toBeInTheDocument();
		expect(onValuesChange.mock.calls.at(-1)?.[0]).toEqual(["TypeScript"]);
	});

	it("should cap skills at 100", async () => {
		const user = userEvent.setup();
		const defaultValues = Array.from({ length: 100 }, (_, i) => `Skill ${i}`);
		const onValuesChange = vi.fn();
		render(<SkillsForm defaultValues={defaultValues} onValuesChange={onValuesChange} />);

		await user.type(screen.getByLabelText("Nova habilidade"), "Overflow{Enter}");

		expect(screen.queryByRole("button", { name: "Remover Overflow" })).not.toBeInTheDocument();
		expect(screen.getAllByRole("button", { name: /^Remover / })).toHaveLength(100);
	});
});
