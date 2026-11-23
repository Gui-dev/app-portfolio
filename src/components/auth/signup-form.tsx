"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { type SignupValues, signupSchema } from "@/lib/validation/auth";

const labelClass = "mb-1.5 block text-xs font-medium leading-4 text-fg-dim";
const inputClass =
	"h-[42px] w-full rounded-xl border border-border bg-bg px-[14px] py-[10px] text-sm leading-5 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";
const errorClass = "mt-1 text-xs text-danger";

export function SignupForm() {
	const [formMessage, setFormMessage] = useState<string | null>(null);
	const [submitted, setSubmitted] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignupValues>({
		resolver: zodResolver(signupSchema),
		defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
	});

	async function onSubmit(values: SignupValues) {
		setFormMessage(null);
		const { error } = await authClient.signUp.email({
			name: values.name,
			email: values.email,
			password: values.password,
			callbackURL: "/dashboard",
		});
		if (error) {
			setFormMessage("Não foi possível criar sua conta. Tente novamente.");
			return;
		}
		setSubmitted(true);
	}

	if (submitted) {
		return (
			<div className="space-y-3 text-center">
				<h1 className="font-display text-2xl font-bold text-fg">Verifique seu email</h1>
				<p className="text-sm text-muted">
					Enviamos um link de confirmação para o seu endereço de e-mail.
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className="mb-6 text-center">
				<h1 className="font-display text-2xl font-bold text-fg">Criar conta</h1>
				<p className="mt-2 text-sm text-muted">Comece a montar seu portfólio em minutos.</p>
			</div>
			<form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
				<div aria-live="polite" className="min-h-5 text-sm text-danger" role="status">
					{formMessage}
				</div>
				<div>
					<label className={labelClass} htmlFor="signup-name">
						Nome
					</label>
					<input
						aria-invalid={errors.name ? "true" : undefined}
						className={inputClass}
						id="signup-name"
						type="text"
						{...register("name")}
					/>
					{errors.name ? (
						<p className={errorClass} role="alert">
							{errors.name.message}
						</p>
					) : null}
				</div>
				<div>
					<label className={labelClass} htmlFor="signup-email">
						E-mail
					</label>
					<input
						aria-invalid={errors.email ? "true" : undefined}
						className={inputClass}
						id="signup-email"
						type="email"
						{...register("email")}
					/>
					{errors.email ? (
						<p className={errorClass} role="alert">
							{errors.email.message}
						</p>
					) : null}
				</div>
				<div>
					<label className={labelClass} htmlFor="signup-password">
						Senha
					</label>
					<input
						aria-invalid={errors.password ? "true" : undefined}
						className={inputClass}
						id="signup-password"
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
					<label className={labelClass} htmlFor="signup-confirm-password">
						Confirmar senha
					</label>
					<input
						aria-invalid={errors.confirmPassword ? "true" : undefined}
						className={inputClass}
						id="signup-confirm-password"
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
					{isSubmitting ? "Aguarde…" : "Criar conta"}
				</button>
			</form>
			<p className="mt-6 text-center text-sm text-muted">
				Já tem conta?{" "}
				<a className="font-medium text-fg underline-offset-4 hover:underline" href="/login">
					Entrar
				</a>
			</p>
		</div>
	);
}
