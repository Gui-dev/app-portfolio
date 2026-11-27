import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PasswordForm } from "./password-form";

const { changePassword } = vi.hoisted(() => ({ changePassword: vi.fn() }));

vi.mock("@/lib/auth-client", () => ({
	authClient: { changePassword },
}));

describe("PasswordForm", () => {
	beforeEach(() => {
		changePassword.mockReset();
	});

	it("should require the current password", async () => {
		const user = userEvent.setup();
		render(<PasswordForm />);

		await user.type(screen.getByLabelText("Nova senha"), "newpassword123");
		await user.type(screen.getByLabelText("Confirmar nova senha"), "newpassword123");
		await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

		expect(await screen.findByText("Informe sua senha atual.")).toBeInTheDocument();
		expect(changePassword).not.toHaveBeenCalled();
	});

	it("should reject mismatched new passwords", async () => {
		const user = userEvent.setup();
		render(<PasswordForm />);

		await user.type(screen.getByLabelText("Senha atual"), "password123");
		await user.type(screen.getByLabelText("Nova senha"), "newpassword123");
		await user.type(screen.getByLabelText("Confirmar nova senha"), "different123");
		await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

		expect(await screen.findByText("As senhas não coincidem.")).toBeInTheDocument();
		expect(changePassword).not.toHaveBeenCalled();
	});

	it("should show success after a valid change", async () => {
		const user = userEvent.setup();
		changePassword.mockResolvedValue({ data: { status: true }, error: null });
		render(<PasswordForm />);

		await user.type(screen.getByLabelText("Senha atual"), "password123");
		await user.type(screen.getByLabelText("Nova senha"), "newpassword123");
		await user.type(screen.getByLabelText("Confirmar nova senha"), "newpassword123");
		await user.click(screen.getByRole("button", { name: "Salvar nova senha" }));

		expect(await screen.findByText("Senha atualizada com sucesso.")).toBeInTheDocument();
		expect(changePassword).toHaveBeenCalledWith({
			currentPassword: "password123",
			newPassword: "newpassword123",
			revokeOtherSessions: true,
		});
	});
});
