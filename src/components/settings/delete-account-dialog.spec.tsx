import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteAccountDialog } from "./delete-account-dialog";

const { deleteAccount } = vi.hoisted(() => ({ deleteAccount: vi.fn() }));
const { signOut } = vi.hoisted(() => ({ signOut: vi.fn() }));
const { push, refresh } = vi.hoisted(() => ({
	push: vi.fn(),
	refresh: vi.fn(),
}));

vi.mock("@/app/dashboard/settings/actions", () => ({ deleteAccount }));
vi.mock("@/lib/auth-client", () => ({ authClient: { signOut } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

beforeEach(() => {
	deleteAccount.mockReset();
	signOut.mockReset();
	push.mockReset();
	refresh.mockReset();

	Object.defineProperty(window.HTMLElement.prototype, "hasPointerCapture", {
		configurable: true,
		value: vi.fn(),
	});
	Object.defineProperty(window.HTMLElement.prototype, "releasePointerCapture", {
		configurable: true,
		value: vi.fn(),
	});
	Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
		configurable: true,
		value: vi.fn(),
	});
	Object.defineProperty(window, "ResizeObserver", {
		configurable: true,
		value: class ResizeObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	});
});

async function openDialog() {
	const user = userEvent.setup();
	render(<DeleteAccountDialog slug="marina-souza" />);
	await user.click(screen.getByRole("button", { name: "Excluir conta" }));
	await screen.findByRole("dialog");
	return user;
}

describe("DeleteAccountDialog", () => {
	it("should open the confirmation dialog from the delete trigger", async () => {
		await openDialog();

		expect(
			screen.getByRole("heading", { name: "Excluir conta permanentemente" }),
		).toBeInTheDocument();
		expect(screen.getByLabelText("Digite seu slug para confirmar")).toBeInTheDocument();
	});

	it("should keep the destructive button disabled until the slug matches", async () => {
		const user = await openDialog();
		const confirmButton = screen.getByRole("button", {
			name: "Excluir conta permanentemente",
		});

		expect(confirmButton).toBeDisabled();
		await user.type(screen.getByLabelText("Digite seu slug para confirmar"), "marina");
		expect(confirmButton).toBeDisabled();
		await user.type(screen.getByLabelText("Digite seu slug para confirmar"), "-souza");
		expect(confirmButton).toBeEnabled();
	});

	it("should delete the account, sign out and route to login", async () => {
		const user = await openDialog();
		deleteAccount.mockResolvedValue({ ok: true });
		signOut.mockResolvedValue({ data: { success: true }, error: null });

		await user.type(screen.getByLabelText("Digite seu slug para confirmar"), "marina-souza");
		await user.click(screen.getByRole("button", { name: "Excluir conta permanentemente" }));

		await waitFor(() => expect(deleteAccount).toHaveBeenCalledWith({ slug: "marina-souza" }));
		await waitFor(() => expect(signOut).toHaveBeenCalled());
		await waitFor(() => expect(push).toHaveBeenCalledWith("/login"));
		expect(refresh).toHaveBeenCalled();
	});

	it("should show the action error message on failure", async () => {
		const user = await openDialog();
		deleteAccount.mockResolvedValue({ ok: false, error: "DELETE_FAILED" });

		await user.type(screen.getByLabelText("Digite seu slug para confirmar"), "marina-souza");
		await user.click(screen.getByRole("button", { name: "Excluir conta permanentemente" }));

		expect(
			await screen.findByText("Não foi possível excluir a conta. Tente novamente."),
		).toBeInTheDocument();
		expect(push).not.toHaveBeenCalled();
	});

	it("should disable deletion when the profile slug is missing", () => {
		render(<DeleteAccountDialog slug="" />);

		expect(screen.getByRole("button", { name: "Excluir conta" })).toBeDisabled();
		expect(
			screen.getByText(/Crie seu perfil no editor antes de excluir a conta/),
		).toBeInTheDocument();
	});
});
