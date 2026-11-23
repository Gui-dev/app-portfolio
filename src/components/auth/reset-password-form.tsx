"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { type ResetPasswordValues, resetPasswordSchema } from "@/lib/validation/auth";

const labelClass = "mb-1.5 block text-xs font-medium leading-4 text-fg-dim";
const inputClass =
	"h-[42px] w-full rounded-xl border border-border bg-bg px-[14px] py-[10px] text-sm leading-5 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";
const errorClass = "mt-1 text-xs text-danger";

type ResetPasswordFormProps = {
	token: string | null;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
	const router = useRouter();
	const [formMessage, setFormMessage] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { password: "", confirmPassword: "" },
	});

	if (!token) {
		return (
			<div className="space-y-4 text-center">
				<h1 className="font-display text-2xl font-bold text-fg">Redefinir senha</h1>
				<p className="text-sm text-muted">Link inválido ou expirado.</p>
				<a
					className="font-medium text-fg underline-offset-4 hover:underline"
					href="/forgot-password"
				>
					Solicitar novo link
				</a>
			</div>
		);
	}

	async function onSubmit(values: ResetPasswordValues) {
		setFormMessage(null);
		const { error } = await authClient.resetPassword({
			newPassword: values.password,
			token: token ?? undefined,
		});
		if (error) {
			setFormMessage("Link inválido ou expirado.");
			return;
		}
		router.push("/login");
	}

	return (
		<div>
			<div className="mb-6 text-center">
				<h1 className="font-display text-2xl font-bold text-fg">Redefinir senha</h1>
			</div>
			<form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
				<div aria-live="polite" className="min-h-5 text-sm text-danger" role="status">
					{formMessage}
				</div>
				<div>
					<label className={labelClass} htmlFor="reset-password">
						Nova senha
					</label>
					<input
						aria-invalid={errors.password ? "true" : undefined}
						className={inputClass}
						id="reset-password"
						type="password"
						{...register("password")}
					/>
					{errors.password ? (
						<p className={errorClass} role="alert">
							{errors.password.message}
						</p>
					) : null}
				</div>
				<div>
					<label className={labelClass} htmlFor="reset-confirm-password">
						Confirmar nova senha
					</label>
					<input
						aria-invalid={errors.confirmPassword ? "true" : undefined}
						className={inputClass}
						id="reset-confirm-password"
						type="password"
						{...register("confirmPassword")}
					/>
					{errors.confirmPassword ? (
						<p className={errorClass} role="alert">
							{errors.confirmPassword.message}
						</p>
					) : null}
				</div>
				<button
					className="h-[42px] w-full cursor-pointer rounded-xl bg-accent-strong px-4 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
					disabled={isSubmitting}
					type="submit"
				>
					{isSubmitting ? "Aguarde…" : "Salvar nova senha"}
				</button>
			</form>
		</div>
	);
}
