"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAccount } from "@/app/dashboard/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

function deleteErrorMessage(
	error: "UNAUTHORIZED" | "INVALID_CONFIRMATION" | "SESSION_EXPIRED" | "DELETE_FAILED",
): string {
	switch (error) {
		case "INVALID_CONFIRMATION":
			return "Confirmação inválida. Digite o slug exatamente como exibido.";
		case "SESSION_EXPIRED":
			return "Sua sessão expirou. Entre novamente.";
		case "UNAUTHORIZED":
			return "Sua sessão expirou. Entre novamente.";
		case "DELETE_FAILED":
			return "Não foi possível excluir a conta. Tente novamente.";
	}
}

export function DeleteAccountDialog({ slug }: { slug: string }) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [confirmation, setConfirmation] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);

	const canDelete = slug.length > 0 && confirmation === slug;

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);
		if (!nextOpen) {
			setConfirmation("");
			setError(null);
		}
	}

	async function handleDelete() {
		if (!canDelete) return;

		setError(null);
		setIsPending(true);

		const result = await deleteAccount({ slug: confirmation });

		if (!result.ok) {
			setError(deleteErrorMessage(result.error));
			setIsPending(false);
			return;
		}

		try {
			await authClient.signOut();
		} catch {
			// Best effort: the account is already gone.
		}

		setIsPending(false);
		setOpen(false);
		router.refresh();
		router.push("/login");
	}

	return (
		<section className="rounded-2xl border border-danger/30 bg-danger/5 p-6">
			<h2 className="font-display text-lg font-bold text-fg">Excluir conta</h2>
			<p className="mt-2 text-sm text-muted">
				A exclusão é permanente e remove sua conta, seu perfil público e todos os dados associados.
			</p>
			{slug ? (
				<p className="mt-2 text-sm text-muted">
					Para confirmar, digite o slug do seu perfil:{" "}
					<span className="font-mono text-fg">{slug}</span>
				</p>
			) : (
				<p className="mt-2 text-sm text-muted">
					Crie seu perfil no editor antes de excluir a conta.
				</p>
			)}
			<Dialog.Root onOpenChange={handleOpenChange} open={open}>
				<Dialog.Trigger asChild>
					<Button
						className="mt-4 border-danger/40 text-danger hover:bg-danger/10"
						disabled={!slug}
						variant="outline"
					>
						Excluir conta
					</Button>
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm" />
					<Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-xl focus:outline-none">
						<Dialog.Title className="font-display text-lg font-bold text-fg">
							Excluir conta permanentemente
						</Dialog.Title>
						<Dialog.Description className="mt-2 text-sm text-muted">
							Esta ação não pode ser desfeita. Sua conta e seu perfil público serão removidos
							imediatamente.
						</Dialog.Description>
						<div className="mt-5">
							<Label htmlFor="delete-account-slug">Digite seu slug para confirmar</Label>
							<Input
								autoComplete="off"
								className="mt-1.5"
								id="delete-account-slug"
								onChange={(event) => {
									setConfirmation(event.target.value);
									setError(null);
								}}
								value={confirmation}
							/>
							<p className="mt-2 text-xs text-muted">
								Slug esperado: <span className="font-mono text-fg">{slug}</span>
							</p>
						</div>
						{error ? (
							<p aria-live="polite" className="mt-3 text-sm text-danger" role="alert">
								{error}
							</p>
						) : null}
						<div className="mt-6 flex justify-end gap-3">
							<Dialog.Close asChild>
								<Button disabled={isPending} variant="secondary">
									Cancelar
								</Button>
							</Dialog.Close>
							<Button
								className="bg-danger text-white hover:bg-danger/90"
								disabled={!canDelete || isPending}
								onClick={() => void handleDelete()}
								type="button"
							>
								{isPending ? "Excluindo…" : "Excluir conta permanentemente"}
							</Button>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		</section>
	);
}
