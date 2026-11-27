"use client";

import { GitBranch } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type ConnectedAccount = {
	id: string;
	providerId: string;
	accountId: string;
};

const rowClass =
	"flex flex-col gap-3 rounded-xl border border-border bg-bg/40 p-4 sm:flex-row sm:items-center sm:justify-between";
const statusClass = "text-xs font-medium text-success";
const mutedStatusClass = "text-xs font-medium text-muted";

function unlinkErrorMessage(code: string | undefined): string {
	if (code === "FAILED_TO_UNLINK_LAST_ACCOUNT") {
		return "Não é possível desconectar sua única forma de login.";
	}
	if (code === "SESSION_NOT_FRESH" || code === "SESSION_EXPIRED") {
		return "Sua sessão expirou. Entre novamente.";
	}
	return "Não foi possível desconectar a conta. Tente novamente.";
}

export function ConnectedAccounts({ githubEnabled }: { githubEnabled: boolean }) {
	const [accounts, setAccounts] = useState<ConnectedAccount[] | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [pendingAction, setPendingAction] = useState<string | null>(null);

	const loadAccounts = useCallback(async () => {
		setIsLoading(true);
		setLoadError(null);

		const { data, error } = await authClient.listAccounts();

		if (error) {
			setLoadError("Não foi possível carregar suas contas.");
			setIsLoading(false);
			return;
		}

		setAccounts(data ?? []);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		void loadAccounts();
	}, [loadAccounts]);

	async function handleUnlink(account: ConnectedAccount) {
		setActionError(null);
		setPendingAction(account.id);

		const { error } = await authClient.unlinkAccount({ accountId: account.id });

		if (error) {
			setActionError(unlinkErrorMessage(error.code));
			setPendingAction(null);
			return;
		}

		await loadAccounts();
		setPendingAction(null);
	}

	async function handleLinkGithub() {
		setActionError(null);
		setPendingAction("github-link");

		const { error } = await authClient.linkSocial({
			provider: "github",
			callbackURL: "/dashboard/settings",
		});

		if (error) {
			setActionError("Não foi possível conectar o GitHub. Tente novamente.");
		}
		setPendingAction(null);
	}

	if (isLoading && accounts === null) {
		return <p className="text-sm text-muted">Carregando contas conectadas…</p>;
	}

	if (loadError) {
		return (
			<div className="space-y-3">
				<p className="text-sm text-danger" role="alert">
					{loadError}
				</p>
				<Button onClick={() => void loadAccounts()} variant="secondary">
					Tentar novamente
				</Button>
			</div>
		);
	}

	const credential = accounts?.find((account) => account.providerId === "credential");
	const github = accounts?.find((account) => account.providerId === "github");
	const canUnlink = (accounts?.length ?? 0) > 1;

	return (
		<div className="space-y-4">
			{actionError ? (
				<p aria-live="polite" className="text-sm text-danger" role="alert">
					{actionError}
				</p>
			) : null}
			<ul className="space-y-3">
				{credential ? (
					<li className={rowClass}>
						<div>
							<p className="text-sm font-medium text-fg">E-mail e senha</p>
							<p className={statusClass}>Conectado</p>
						</div>
						{canUnlink ? (
							<Button
								aria-label="Desconectar E-mail e senha"
								disabled={pendingAction !== null}
								onClick={() => void handleUnlink(credential)}
								size="sm"
								variant="outline"
							>
								Desconectar
							</Button>
						) : null}
					</li>
				) : null}
				<li className={rowClass}>
					<div className="flex items-center gap-3">
						<GitBranch aria-hidden="true" className="size-5 text-fg-dim" />
						<div>
							<p className="text-sm font-medium text-fg">GitHub</p>
							{github ? (
								<p className={statusClass}>Conectado</p>
							) : (
								<p className={mutedStatusClass}>
									{githubEnabled ? "Não conectado" : "GitHub não configurado"}
								</p>
							)}
						</div>
					</div>
					{github && canUnlink ? (
						<Button
							aria-label="Desconectar GitHub"
							disabled={pendingAction !== null}
							onClick={() => void handleUnlink(github)}
							size="sm"
							variant="outline"
						>
							Desconectar
						</Button>
					) : null}
					{!github && githubEnabled ? (
						<Button
							disabled={pendingAction !== null}
							onClick={() => void handleLinkGithub()}
							size="sm"
							variant="secondary"
						>
							Conectar GitHub
						</Button>
					) : null}
				</li>
			</ul>
		</div>
	);
}
