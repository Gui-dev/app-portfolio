import { type Env, parseEnv } from "./env-schema";

/**
 * Validated environment variables for the application.
 *
 * Parsed eagerly at module scope (boot validation per spec): the process
 * fails fast on a missing/malformed variable instead of breaking later at
 * first use.
 *
 * Server-only by discipline: never import this module from a client
 * component. Tests should import `envSchema`/`parseEnv` from
 * `./env-schema` instead, so they never depend on a real environment.
 */
export const env: Env = parseEnv(process.env);
