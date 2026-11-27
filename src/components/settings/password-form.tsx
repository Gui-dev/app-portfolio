"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { type ChangePasswordValues, changePasswordSchema } from "@/lib/validation/auth";

const errorClass = "mt-1 text-xs text-danger";

export function PasswordForm() {
	const [formMessage, setFormMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ChangePasswordValues>({
		resolver: zodResolver(changePasswordSchema),
		defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
	});

	async function onSubmit(values: ChangePasswordValues) {
		setFormMessage(null);
		setSuccessMessage(null);

		const { error } = await authClient.changePassword({
			currentPassword: values.currentPassword,
			newPassword: values.newPassword,
			revokeOtherSessions: true,
		});

		if (error) {
			setFormMessage(
				error.code === "INVALID_PASSWORD"
					? "Senha atual incorreta."
					: "Não foi possível alterar a senha.",
			);
			return;
		}

		reset();
		setSuccessMessage("Senha atualizada com sucesso.");
	}

	return (
		<form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
			<div>
				<Label htmlFor="current-password">Senha atual</Label>
				<Input
					aria-invalid={errors.currentPassword ? "true" : undefined}
					autoComplete="current-password"
					className="mt-1.5"
					id="current-password"
					type="password"
					{...register("currentPassword")}
				/>
				{errors.currentPassword ? (
					<p className={errorClass} role="alert">
						{errors.currentPassword.message}
					</p>
				) : null}
			</div>
			<div>
				<Label htmlFor="new-password">Nova senha</Label>
				<Input
					aria-invalid={errors.newPassword ? "true" : undefined}
					autoComplete="new-password"
					className="mt-1.5"
					id="new-password"
					type="password"
					{...register("newPassword")}
				/>
				{errors.newPassword ? (
					<p className={errorClass} role="alert">
						{errors.newPassword.message}
					</p>
				) : null}
			</div>
			<div>
				<Label htmlFor="confirm-new-password">Confirmar nova senha</Label>
				<Input
					aria-invalid={errors.confirmPassword ? "true" : undefined}
					autoComplete="new-password"
					className="mt-1.5"
					id="confirm-new-password"
					type="password"
					{...register("confirmPassword")}
				/>
				{errors.confirmPassword ? (
					<p className={errorClass} role="alert">
						{errors.confirmPassword.message}
					</p>
				) : null}
			</div>
			{formMessage ? (
				<p className="text-sm text-danger" role="alert">
					{formMessage}
				</p>
			) : null}
			{successMessage ? (
				<p aria-live="polite" className="text-sm text-success" role="status">
					{successMessage}
				</p>
			) : null}
			<Button disabled={isSubmitting} type="submit">
				{isSubmitting ? "Salvando…" : "Salvar nova senha"}
			</Button>
		</form>
	);
}
