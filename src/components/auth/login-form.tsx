"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth-client";
import { type LoginValues, loginSchema } from "@/lib/validation/auth";

const labelClass = "mb-1.5 block text-xs font-medium leading-4 text-fg-dim";
const inputClass =
	"h-[42px] w-full rounded-xl border border-border bg-bg px-[14px] py-[10px] text-sm leading-5 text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";
const errorClass = "mt-1 text-xs text-red-500";

type LoginFormProps = {
	githubEnabled: boolean;
};

export function LoginForm({ githubEnabled }: LoginFormProps) {
	const router = useRouter();
	const [formMessage, setFormMessage] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	async function onSubmit(values: LoginValues) {
		setFormMessage(null);
		const { error } = await authClient.signIn.email({
			email: values.email,
			password: values.password,
		});
		if (error) {
			if (error.code === "EMAIL_NOT_VERIFIED") {
				setFormMessage("Confirme seu e-mail antes de entrar.");
			} else {
				setFormMessage("E-mail ou senha inválidos.");
			}
			return;
		}
		router.push("/dashboard");
		router.refresh();
	}

	async function handleGithubSignIn() {
		await authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" });
	}

	return (
		<div>
			<div className="mb-6 text-center">
				<h1 className="font-display text-2xl font-bold text-fg">Entrar</h1>
				<p className="mt-2 text-sm text-muted">Acesse sua conta para editar seu portfólio.</p>
			</div>
			<form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
				<div aria-live="polite" className="min-h-5 text-sm text-red-500" role="status">
					{formMessage}
				</div>
				<div>
					<label className={labelClass} htmlFor="login-email">
						E-mail
					</label>
					<input
						aria-invalid={errors.email ? "true" : undefined}
						className={inputClass}
						id="login-email"
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
					<label className={labelClass} htmlFor="login-password">
						Senha
					</label>
					<input
						aria-invalid={errors.password ? "true" : undefined}
						className={inputClass}
						id="login-password"
						type="password"
						{...register("password")}
					/>
					{errors.password ? (
						<p className={errorClass} role="alert">
							{errors.password.message}
						</p>
					) : null}
				</div>
				<div className="flex justify-end">
					<a
						className="text-sm text-muted underline-offset-4 hover:underline"
						href="/forgot-password"
					>
						Esqueci minha senha
					</a>
				</div>
				<button
					className="h-[42px] w-full cursor-pointer rounded-xl bg-accent-strong px-4 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
					disabled={isSubmitting}
					type="submit"
				>
					{isSubmitting ? "Aguarde…" : "Entrar"}
				</button>
			</form>
			{githubEnabled ? (
				<button
					className="mt-3 h-[42px] w-full cursor-pointer rounded-xl border border-border bg-bg px-4 text-sm font-medium text-fg transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
					onClick={handleGithubSignIn}
					type="button"
				>
					Continuar com GitHub
				</button>
			) : null}
			<p className="mt-6 text-center text-sm text-muted">
				Ainda não tem conta?{" "}
				<a className="font-medium text-fg underline-offset-4 hover:underline" href="/signup">
					Criar conta
				</a>
			</p>
		</div>
	);
}
