import "dotenv/config";

// Integration tests must run against the dedicated test database. The swap
// happens before loading test helpers because src/lib/env.ts parses
// process.env eagerly at module scope and src/lib/db/client.ts captures the
// DATABASE_URL on import. Static imports are hoisted, so we load helpers
// dynamically after mutating process.env.
process.env.DATABASE_URL = process.env.DATABASE_TEST_URL;

const { ensureTestDatabase, migrateTestDatabase } = await import("./src/lib/db/test-helpers");

await ensureTestDatabase();
await migrateTestDatabase();
