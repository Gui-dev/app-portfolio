import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SkillsTab } from "./skills-tab";

describe("SkillsTab", () => {
	it("should add skill on Enter", async () => {
		const user = userEvent.setup();
		const onValuesChange = vi.fn();
		render(<SkillsTab defaultValues={[]} onValuesChange={onValuesChange} />);
		await user.type(screen.getByLabelText("Nova habilidade"), "React{Enter}");
		expect(screen.getByRole("button", { name: "Remover React" })).toBeInTheDocument();
		expect(onValuesChange.mock.calls.at(-1)?.[0]).toContain("React");
	});

	it("should remove skill from chip", async () => {
		const user = userEvent.setup();
		render(<SkillsTab defaultValues={["React", "TypeScript"]} onValuesChange={vi.fn()} />);
		await user.click(screen.getByRole("button", { name: "Remover React" }));
		expect(screen.queryByRole("button", { name: "Remover React" })).not.toBeInTheDocument();
	});

	it("should cap skills at 100", async () => {
		const user = userEvent.setup();
		const defaultValues = Array.from({ length: 100 }, (_, i) => `Skill ${i}`);
		render(<SkillsTab defaultValues={defaultValues} onValuesChange={vi.fn()} />);
		await user.type(screen.getByLabelText("Nova habilidade"), "Overflow{Enter}");
		expect(screen.queryByRole("button", { name: "Remover Overflow" })).not.toBeInTheDocument();
	});
});
