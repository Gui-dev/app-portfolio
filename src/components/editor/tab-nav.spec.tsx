import * as TabsPrimitive from "@radix-ui/react-tabs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { type EditorTabId, TabNav } from "./tab-nav";

const labels = ["Perfil", "Experiência", "Projetos", "Skills", "Aparência"] as const;

function renderTabNav(value: EditorTabId, onValueChange = vi.fn()) {
	return render(
		<TabsPrimitive.Root onValueChange={onValueChange} value={value}>
			<TabNav />
		</TabsPrimitive.Root>,
	);
}

function ControlledTabNav() {
	const [value, setValue] = useState<EditorTabId>("profile");

	return (
		<TabsPrimitive.Root onValueChange={(next) => setValue(next as EditorTabId)} value={value}>
			<TabNav />
		</TabsPrimitive.Root>
	);
}

describe("TabNav", () => {
	it("should render all five tabs in order with the expected labels", () => {
		renderTabNav("profile");

		expect(screen.getByRole("navigation", { name: "Seções do editor" })).toBeInTheDocument();
		expect(screen.getByRole("tablist", { name: "Seções do editor" })).toBeInTheDocument();
		expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([...labels]);
	});

	it("should mark only the active tab as selected", () => {
		renderTabNav("experience");

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
		renderTabNav("profile", onValueChange);

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
