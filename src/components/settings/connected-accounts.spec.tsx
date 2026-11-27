import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectedAccounts } from "./connected-accounts";

const { linkSocial, listAccounts, unlinkAccount } = vi.hoisted(() => ({
	linkSocial: vi.fn(),
	listAccounts: vi.fn(),
	unlinkAccount: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
	authClient: { linkSocial, listAccounts, unlinkAccount },
}));

const credentialAccount = {
	id: "account-credential",
	providerId: "credential",
	accountId: "marina@example.com",
	userId: "user-1",
};
const githubAccount = {
	id: "account-github",
	providerId: "github",
	accountId: "123456",
	userId: "user-1",
};

function mockAccounts(accounts: Array<typeof credentialAccount | typeof githubAccount>) {
	listAccounts.mockResolvedValue({ data: accounts, error: null });
}

describe("ConnectedAccounts", () => {
	beforeEach(() => {
		linkSocial.mockReset();
		listAccounts.mockReset();
		unlinkAccount.mockReset();
	});

	it("should list the credential account and a linked GitHub account", async () => {
		mockAccounts([credentialAccount, githubAccount]);
		render(<ConnectedAccounts githubEnabled />);

		expect(await screen.findByText("E-mail e senha")).toBeInTheDocument();
		expect(screen.getByText("GitHub")).toBeInTheDocument();
		expect(screen.getAllByText("Conectado")).toHaveLength(2);
	});

	it("should only offer disconnect when another login method remains", async () => {
		mockAccounts([githubAccount]);
		render(<ConnectedAccounts githubEnabled />);

		expect(await screen.findByText("GitHub")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: /Desconectar/ })).not.toBeInTheDocument();
	});

	it("should unlink the GitHub account and reload the list", async () => {
		const user = userEvent.setup();
		listAccounts
			.mockResolvedValueOnce({ data: [credentialAccount, githubAccount], error: null })
			.mockResolvedValueOnce({ data: [credentialAccount], error: null });
		unlinkAccount.mockResolvedValue({ data: { status: true }, error: null });
		render(<ConnectedAccounts githubEnabled />);

		await user.click(await screen.findByRole("button", { name: "Desconectar GitHub" }));

		expect(unlinkAccount).toHaveBeenCalledWith({ accountId: "account-github" });
		expect(await screen.findByRole("button", { name: "Conectar GitHub" })).toBeInTheDocument();
		expect(listAccounts).toHaveBeenCalledTimes(2);
	});

	it("should connect GitHub when enabled and not linked", async () => {
		const user = userEvent.setup();
		mockAccounts([credentialAccount]);
		linkSocial.mockResolvedValue({
			data: { redirect: true, url: "https://github.com" },
			error: null,
		});
		render(<ConnectedAccounts githubEnabled />);

		await user.click(await screen.findByRole("button", { name: "Conectar GitHub" }));

		expect(linkSocial).toHaveBeenCalledWith({
			provider: "github",
			callbackURL: "/dashboard/settings",
		});
	});

	it("should show GitHub as not configured when the provider is disabled", async () => {
		mockAccounts([credentialAccount]);
		render(<ConnectedAccounts githubEnabled={false} />);

		expect(await screen.findByText("GitHub não configurado")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Conectar GitHub" })).not.toBeInTheDocument();
	});

	it("should retry loading accounts after an error", async () => {
		const user = userEvent.setup();
		listAccounts
			.mockResolvedValueOnce({ data: null, error: { code: "FAILED", message: "failed" } })
			.mockResolvedValueOnce({ data: [credentialAccount], error: null });
		render(<ConnectedAccounts githubEnabled />);

		expect(await screen.findByText("Não foi possível carregar suas contas.")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: "Tentar novamente" }));

		expect(await screen.findByText("E-mail e senha")).toBeInTheDocument();
	});
});
