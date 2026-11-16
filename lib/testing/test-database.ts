// FILE: lib/testing/test-database.ts
//
// Test-database safety guard.
//
// The automated test suite WRITES to a database. Historically two test
// files also deleted WHOLE TABLES, which is harmless only because the
// suite is pointed at a throwaway local database. This module makes it
// impossible for the suite to reach anything else:
//
//   · the database URL is pinned to the approved LOOPBACK test database,
//   · an externally supplied DATABASE_URL is accepted ONLY when it points
//     at that same local test database (loopback host, database "test"),
//   · anything else — a remote host, a different database, an unparseable
//     value — REFUSES the test run.
//
// The module has no imports (no Prisma, no dotenv) so it can run before
// Prisma is initialised, and it never prints credentials: a rejected URL
// is reported by scheme/host/port/database only.
//
// This module is inert outside test mode.

/** The one database the automated test suite is allowed to touch. */
export const APPROVED_TEST_DATABASE_URL =
  "postgresql://test:test@127.0.0.1:5432/test";

/** The database name every approved test URL must use. */
export const APPROVED_TEST_DATABASE_NAME = "test";

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

const POSTGRES_SCHEMES = new Set(["postgres:", "postgresql:"]);

export type TestDatabaseDecision =
  | { ok: true; url: string; source: "pinned" | "accepted-external" }
  | { ok: false; reason: string; target: string };

/**
 * A credential-free description of a database URL, safe to log.
 * `postgresql://user:secret@host:5432/db` → `postgresql://host:5432/db`.
 */
export function describeDatabaseTarget(value: string): string {
  try {
    const url = new URL(value);
    const port = url.port ? `:${url.port}` : "";
    const database = url.pathname.replace(/^\/+/, "");
    return `${url.protocol}//${url.hostname}${port}/${database}`;
  } catch {
    return "<unparseable database url>";
  }
}

function parseDatabaseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function databaseName(url: URL): string {
  return url.pathname.replace(/^\/+/, "").split("/")[0] ?? "";
}

/** True when the URL points at the approved local test database. */
export function isApprovedTestDatabaseUrl(value: string): boolean {
  const url = parseDatabaseUrl(value.trim());
  if (!url) return false;
  if (!POSTGRES_SCHEMES.has(url.protocol)) return false;
  if (!LOOPBACK_HOSTS.has(url.hostname)) return false;
  return databaseName(url) === APPROVED_TEST_DATABASE_NAME;
}

/**
 * Decide which database URL the test run may use.
 *
 * · unset / empty            → the pinned approved URL
 * · loopback + database "test" → accepted (it is the same local test DB)
 * · anything else             → refused
 */
export function decideTestDatabaseUrl(
  existing: string | undefined | null,
): TestDatabaseDecision {
  const raw = (existing ?? "").trim();
  if (!raw) {
    return {
      ok: true,
      url: APPROVED_TEST_DATABASE_URL,
      source: "pinned",
    };
  }

  const url = parseDatabaseUrl(raw);
  if (!url) {
    return {
      ok: false,
      reason: "the value is not a valid database URL",
      target: "<unparseable database url>",
    };
  }

  if (!POSTGRES_SCHEMES.has(url.protocol)) {
    return {
      ok: false,
      reason: `the scheme "${url.protocol}" is not PostgreSQL`,
      target: describeDatabaseTarget(raw),
    };
  }

  if (!LOOPBACK_HOSTS.has(url.hostname)) {
    return {
      ok: false,
      reason:
        "the host is not a loopback address — the test suite must never " +
        "reach a remote or shared database",
      target: describeDatabaseTarget(raw),
    };
  }

  if (databaseName(url) !== APPROVED_TEST_DATABASE_NAME) {
    return {
      ok: false,
      reason:
        `the database name is not "${APPROVED_TEST_DATABASE_NAME}" — the ` +
        "test suite must never touch a database it does not own",
      target: describeDatabaseTarget(raw),
    };
  }

  return { ok: true, url: raw, source: "accepted-external" };
}

/**
 * Apply the guard: pin or validate `process.env.DATABASE_URL` and refuse
 * an unsafe value. Returns the URL the test run will use.
 */
export function applyTestDatabaseGuard(): string {
  const decision = decideTestDatabaseUrl(process.env.DATABASE_URL);
  if (!decision.ok) {
    throw new Error(
      `[test-db-guard] Refusing to run the test suite against ${decision.target}: ` +
        `${decision.reason}. Unset DATABASE_URL to use the approved local test ` +
        `database (${APPROVED_TEST_DATABASE_URL}), or point it at a loopback ` +
        `host with a database named "${APPROVED_TEST_DATABASE_NAME}".`,
    );
  }
  process.env.DATABASE_URL = decision.url;
  return decision.url;
}
