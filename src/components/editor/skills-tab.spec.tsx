import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SkillsTab } from "./skills-tab";

describe("SkillsTab", () => {
	it("should render the heading, description, input and Adicionar button", () => {
		render(<SkillsTab />);

		expect(screen.getByRole("heading", { name: "Stack & Habilidades" })).toBeInTheDocument();
		expect(
			screen.getByText("Digite uma tecnologia e pressione Enter para adicionar ao seu currículo."),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Nova habilidade")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Adicionar" })).toBeInTheDocument();
	});

	it("should render the eleven active skills", () => {
		render(<SkillsTab />);

		for (const skill of [
			"TypeScript",
			"React",
			"Next.js",
			"Node.js",
			"Tailwind CSS",
			"PostgreSQL",
			"GraphQL",
			"Docker",
			"AWS",
			"SSR / SSG",
			"SEO Técnico",
		]) {
			expect(screen.getByRole("button", { name: `Remover ${skill}` })).toBeInTheDocument();
		}
	});

	it("should add a skill from the Adicionar button (chip appears, input cleared)", async () => {
		const user = userEvent.setup();
		render(<SkillsTab />);

		const input = screen.getByLabelText("Nova habilidade");
		await user.type(input, "Prisma");
		await user.click(screen.getByRole("button", { name: "Adicionar" }));

		expect(screen.getByRole("button", { name: "Remover Prisma" })).toBeInTheDocument();
		expect(input).toHaveValue("");
	});

	it("should add a skill with Enter", async () => {
		const user = userEvent.setup();
		render(<SkillsTab />);

		const input = screen.getByLabelText("Nova habilidade");
		await user.type(input, "Prisma{Enter}");

		expect(screen.getByRole("button", { name: "Remover Prisma" })).toBeInTheDocument();
		expect(input).toHaveValue("");
	});

	it("should ignore empty input and case-insensitive duplicates", async () => {
		const user = userEvent.setup();
		render(<SkillsTab />);

		const input = screen.getByLabelText("Nova habilidade");
		await user.click(screen.getByRole("button", { name: "Adicionar" }));
		expect(screen.getAllByRole("button", { name: /^Remover / })).toHaveLength(11);

		await user.type(input, "   {Enter}");
		expect(screen.getAllByRole("button", { name: /^Remover / })).toHaveLength(11);

		await user.type(input, "typescript{Enter}");
		expect(screen.getAllByRole("button", { name: /^Remover / })).toHaveLength(11);
		expect(input).toHaveValue("");
	});

	it("should remove a skill by clicking its chip", async () => {
		const user = userEvent.setup();
		render(<SkillsTab />);

		await user.click(screen.getByRole("button", { name: "Remover Docker" }));

		expect(screen.queryByRole("button", { name: "Remover Docker" })).not.toBeInTheDocument();
		expect(screen.getAllByRole("button", { name: /^Remover / })).toHaveLength(10);
	});
});
