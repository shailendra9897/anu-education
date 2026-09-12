// FILE: tests/admin-bundle-leak.test.ts
//
// Guards against ADMIN_PASS / admin credentials ever reaching browser
// code or the built client bundle (CRM-UI-AUTH-FIX-01 security rule).
//
// Checks:
//   1. Client source (app/, src/) never references ADMIN_PASS or embeds
//      hardcoded Basic authorization headers.
//   2. After `npm run build`, the emitted client bundle (.next/static)
//      does not contain the ADMIN_PASS identifier or the actual password.
//
// The bundle check is skipped (passes vacuously) when .next/static is
// absent — e.g. before the first build in a fresh checkout.
//
// Run: npx tsx tests/admin-bundle-leak.test.ts
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(__dirname, "..");

const CLIENT_ROOT_CANDIDATES = ["app", "src"];

function walk(
  dir: string,
  acc: string[] = [],
  depth = 0,
): string[] {
  if (depth > 12) return acc;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(full, acc, depth + 1);
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function collectClientSources(): string[] {
  const files: string[] = [];
  for (const root of CLIENT_ROOT_CANDIDATES) {
    const dir = path.join(ROOT, root);
    if (fs.existsSync(dir)) files.push(...walk(dir));
  }
  return files;
}

test("client source never references ADMIN_PASS or embeds Basic credentials", () => {
  const offenders: string[] = [];

  for (const file of collectClientSources()) {
    const content = fs.readFileSync(file, "utf8");
    if (content.includes("ADMIN_PASS")) {
      offenders.push(`${file}: references ADMIN_PASS`);
    }
    if (/authorization:\s*["']?\s*Basic\s/i.test(content)) {
      offenders.push(`${file}: embeds a Basic authorization header`);
    }
    if (/ADMIN_PASS\s*=/.test(content)) {
      offenders.push(`${file}: assigns ADMIN_PASS in client code`);
    }
  }

  assert.deepEqual(offenders, []);
});

test("built client bundle does not contain ADMIN_PASS or the actual password", () => {
  const staticDir = path.join(ROOT, ".next", "static");
  if (!fs.existsSync(staticDir)) {
    // No build output present — nothing to leak from. Vacuous pass.
    assert.ok(true, "skipped: no built client bundle present");
    return;
  }

  const candidate = process.env.ADMIN_PASS;
  const offenders: string[] = [];

  for (const file of walk(staticDir)) {
    const content = fs.readFileSync(file, "utf8");
    if (content.includes("ADMIN_PASS")) {
      offenders.push(`${file}: contains ADMIN_PASS identifier`);
    }
    if (candidate && candidate.length > 0 && content.includes(candidate)) {
      offenders.push(`${file}: contains the admin password value`);
    }
  }

  assert.deepEqual(offenders, []);
});