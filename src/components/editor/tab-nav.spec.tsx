import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { type EditorTabId, TabNav } from "./tab-nav";

const labels = ["Perfil", "Experiência", "Projetos", "Skills", "Aparência"] as const;

function ControlledTabNav() {
	const [value, setValue] = useState<EditorTabId>("profile");

	return <TabNav value={value} onValueChange={setValue} />;
}

describe("TabNav", () => {
	it("should render all five tabs in order with the expected labels", () => {
		render(<TabNav value="profile" onValueChange={vi.fn()} />);

		expect(screen.getByRole("navigation", { name: "Seções do editor" })).toBeInTheDocument();
		expect(screen.getByRole("tablist", { name: "Seções do editor" })).toBeInTheDocument();
		expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([...labels]);
	});

	it("should mark only the active tab as selected", () => {
		render(<TabNav value="experience" onValueChange={vi.fn()} />);

		for (const label of labels) {
			expect(screen.getByRole("tab", { name: label })).toHaveAttribute(
				"aria-selected",
				label === "Experiência" ? "true" : "false",
			);
		}
	});

	it("should call onValueChange with the tab id when another tab is clicked", async () => {
		const user = userEvent.setup();
		const onValueChange = vi.fn();
		render(<TabNav value="profile" onValueChange={onValueChange} />);

		await user.click(screen.getByRole("tab", { name: "Projetos" }));

		expect(onValueChange).toHaveBeenCalledWith("projects");
		expect(onValueChange).not.toHaveBeenCalledWith("profile");
	});

	it("should move selection with the arrow keys", async () => {
		const user = userEvent.setup();
		render(<ControlledTabNav />);

		screen.getByRole("tab", { name: "Perfil" }).focus();
		await user.keyboard("{ArrowRight}");

		expect(screen.getByRole("tab", { name: "Experiência" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
		expect(screen.getByRole("tab", { name: "Perfil" })).toHaveAttribute("aria-selected", "false");

		await user.keyboard("{ArrowLeft}");

		expect(screen.getByRole("tab", { name: "Perfil" })).toHaveAttribute("aria-selected", "true");
	});
});
