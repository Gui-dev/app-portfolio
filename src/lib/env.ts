import { z } from "zod";

/**
 * Validated environment variables for the application.
 *
 * `env` below is parsed lazily (on first property access) so that importing
 * this module never fails by itself — e.g. in unit tests or CI jobs that do
 * not provide real secrets. Server code that touches `env` always runs with
 * the real environment present.
 *
 * Server-only by discipline: never import this module from a client
 * component.
 */
export const envSchema = z.object({
	DATABASE_URL: z.url(),
	DATABASE_TEST_URL: z.url(),
	BETTER_AUTH_SECRET: z.string().min(32),
	BETTER_AUTH_URL: z.url(),
	GITHUB_CLIENT_ID: z.string().min(1).optional(),
	GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
	SMTP_HOST: z.string().min(1),
	SMTP_PORT: z.coerce.number().int().positive().default(1025),
	SMTP_FROM: z.string().min(1),
	NEXT_PUBLIC_APP_URL: z.url(),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(source: Record<string, string | undefined> = process.env): Env {
	return envSchema.parse(source);
}

export const env: Env = new Proxy({} as Env, {
	get(_target, key) {
		return parseEnv()[key as keyof Env];
	},
	has(_target, key) {
		return key in parseEnv();
	},
	ownKeys() {
		return Reflect.ownKeys(parseEnv());
	},
	getOwnPropertyDescriptor(_target, key) {
		const parsed = parseEnv();
		if (key in parsed) {
			return {
				configurable: true,
				enumerable: true,
				value: parsed[key as keyof Env],
			};
		}
		return undefined;
	},
});
