import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db/client";
import { sendEmail } from "@/lib/email";
import { resetPasswordEmailHtml, verificationEmailHtml } from "@/lib/email-templates";
import { env } from "@/lib/env";

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: "pg" }),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		minPasswordLength: 8,
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				...resetPasswordEmailHtml({ name: user.name, url }),
			});
		},
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				...verificationEmailHtml({ name: user.name, url }),
			});
		},
		sendOnSignIn: true,
	},
	socialProviders:
		env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
			? {
					github: {
						clientId: env.GITHUB_CLIENT_ID,
						clientSecret: env.GITHUB_CLIENT_SECRET,
					},
				}
			: {},
	user: {
		deleteUser: { enabled: true },
	},
});
