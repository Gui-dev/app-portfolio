import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ColorMode, Template } from "@/lib/db/schema";
import { TEMPLATES } from "@/lib/template";
import { AppearanceForm } from "./appearance-form";

type Props = Parameters<typeof AppearanceForm>[0];

function renderForm(overrides: Partial<Props> = {}) {
	const onTemplateChange = vi.fn();
	const onColorModeChange = vi.fn();
	const props: Props = {
		colorMode: "dark",
		onColorModeChange,
		onTemplateChange,
		template: "modern",
		...overrides,
	};

	return { ...render(<AppearanceForm {...props} />), onColorModeChange, onTemplateChange };
}

describe("AppearanceForm", () => {
	it("should render the three templates from the shared template definitions", () => {
		renderForm();

		for (const template of ["minimal", "developer", "modern"] as Template[]) {
			expect(
				screen.getByRole("radio", { name: new RegExp(TEMPLATES[template].name) }),
			).toBeInTheDocument();
		}
		expect(screen.getAllByRole("radio", { name: /Minimal|Developer|Modern/ })).toHaveLength(3);
	});

	it("should mark Modern as active by default", () => {
		renderForm();

		expect(screen.getByRole("radio", { name: /Modern/ })).toBeChecked();
		expect(screen.getByRole("radio", { name: /Minimal/ })).not.toBeChecked();
		expect(screen.getByRole("radio", { name: /Developer/ })).not.toBeChecked();
		expect(screen.getAllByText("Ativo")).toHaveLength(1);
	});

	it("should describe each template using the shared descriptions", () => {
		renderForm();

		for (const template of ["minimal", "developer", "modern"] as Template[]) {
			expect(screen.getByText(TEMPLATES[template].description)).toBeInTheDocument();
		}
	});

	it("should request the selected template when another card is clicked", async () => {
		const user = userEvent.setup();
		const { onTemplateChange } = renderForm();

		await user.click(screen.getByRole("radio", { name: /Developer/ }));

		expect(onTemplateChange).toHaveBeenCalledWith("developer");
	});

	it("should toggle the default color mode", async () => {
		const user = userEvent.setup();
		const { onColorModeChange } = renderForm();

		expect(screen.getByRole("radio", { name: /Dark Mode/ })).toBeChecked();
		expect(screen.getByRole("radio", { name: /Light Mode/ })).not.toBeChecked();

		await user.click(screen.getByRole("radio", { name: /Light Mode/ }));

		expect(onColorModeChange).toHaveBeenCalledWith("light");
	});

	it("should reflect the controlled color mode", () => {
		renderForm({ colorMode: "light" as ColorMode });

		expect(screen.getByRole("radio", { name: /Light Mode/ })).toBeChecked();
		expect(screen.getByRole("radio", { name: /Dark Mode/ })).not.toBeChecked();
	});
});
