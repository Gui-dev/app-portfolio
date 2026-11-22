import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
	postgresClient: ReturnType<typeof postgres> | undefined;
};

const postgresClient = globalForDb.postgresClient ?? postgres(env.DATABASE_URL, { max: 10 });

if (process.env.NODE_ENV !== "production") {
	globalForDb.postgresClient = postgresClient;
}

export const db = drizzle(postgresClient, { schema });
