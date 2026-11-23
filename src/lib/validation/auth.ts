import { z } from "zod";

const emailSchema = z.email("Informe um e-mail válido.");

export const signupSchema = z
	.object({
		name: z.string().min(1, "Informe seu nome."),
		email: emailSchema,
		password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem.",
		path: ["confirmPassword"],
	});

export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Informe sua senha."),
});

export const forgotPasswordSchema = z.object({
	email: emailSchema,
});

export const resetPasswordSchema = z
	.object({
		password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem.",
		path: ["confirmPassword"],
	});

export type SignupValues = z.infer<typeof signupSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
