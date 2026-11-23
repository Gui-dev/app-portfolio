import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SignupForm } from "./signup-form";

vi.mock("@/lib/auth-client", () => ({
	authClient: {
		signUp: {
			email: vi.fn(),
		},
	},
}));

describe("SignupForm", () => {
	it("should show a field error when passwords differ", async () => {
		const user = userEvent.setup();
		render(<SignupForm />);

		await user.type(screen.getByLabelText("Nome"), "Lucas Almeida");
		await user.type(screen.getByLabelText("E-mail"), "lucas@example.com");
		await user.type(screen.getByLabelText("Senha"), "password123");
		await user.type(screen.getByLabelText("Confirmar senha"), "different123");
		await user.click(screen.getByRole("button", { name: "Criar conta" }));

		expect(await screen.findByText("As senhas não coincidem.")).toBeInTheDocument();
	});

	it("should show a field error for an invalid email", async () => {
		const user = userEvent.setup();
		render(<SignupForm />);

		await user.type(screen.getByLabelText("Nome"), "Lucas Almeida");
		await user.type(screen.getByLabelText("E-mail"), "not-an-email");
		await user.type(screen.getByLabelText("Senha"), "password123");
		await user.type(screen.getByLabelText("Confirmar senha"), "password123");
		await user.click(screen.getByRole("button", { name: "Criar conta" }));

		expect(await screen.findByText("Informe um e-mail válido.")).toBeInTheDocument();
	});
});
