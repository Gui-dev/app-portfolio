"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { type ForgotPasswordValues, forgotPasswordSchema } from "@/lib/validation/auth";

const labelClass = "mb-1.5 block text-xs font-medium leading-4 text-fg-dim";
const inputClass =
	"h-[42px] w-full rounded-xl border border-border bg-bg px-[14px] py-[10px] text-sm leading-5 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";
const errorClass = "mt-1 text-xs text-danger";

export function ForgotPasswordForm() {
	const [message, setMessage] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: "" },
	});

	async function onSubmit(values: ForgotPasswordValues) {
		await authClient.requestPasswordReset({
			email: values.email,
			redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
		});
		setMessage("Se existir uma conta com esse e-mail, o link de recuperação foi enviado.");
	}

	return (
		<div>
			<div className="mb-6 text-center">
				<h1 className="font-display text-2xl font-bold text-fg">Recuperar senha</h1>
				<p className="mt-2 text-sm text-muted">
					Informe seu e-mail e enviaremos um link para redefinir a senha.
				</p>
			</div>
			<form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
				<div aria-live="polite" className="min-h-5 text-sm text-muted" role="status">
					{message}
				</div>
				<div>
					<label className={labelClass} htmlFor="forgot-email">
						E-mail
					</label>
					<input
						aria-invalid={errors.email ? "true" : undefined}
						className={inputClass}
						id="forgot-email"
						type="email"
						{...register("email")}
					/>
					{errors.email ? (
						<p className={errorClass} role="alert">
							{errors.email.message}
						</p>
					) : null}
				</div>
				<button
					className="h-[42px] w-full cursor-pointer rounded-xl bg-accent-strong px-4 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
					disabled={isSubmitting}
					type="submit"
				>
					{isSubmitting ? "Aguarde…" : "Enviar link"}
				</button>
			</form>
			<p className="mt-6 text-center text-sm text-muted">
				<a className="font-medium text-fg underline-offset-4 hover:underline" href="/login">
					Voltar para o login
				</a>
			</p>
		</div>
	);
}
