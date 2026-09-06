// FILE: tests/chatwoot.idempotency.test.ts
//
// Unit tests for lib/chatwoot/idempotency.ts
// Uses injected fake dependencies — no Prisma, no network.

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  claimChatwootMessageProcessing,
  releaseChatwootMessageClaim,
  resetInMemoryClaimsForTests,
} from "../lib/chatwoot/idempotency";

// ── FAKE DEPENDENCIES ──────────────────────────────────────────────

function createFakeDeps() {
  const store = new Map<string, { id: string }[]>();

  return {
    store,
    findMarkers: async (key: string) => {
      return store.get(key) ?? [];
    },
    insertMarker: async (key: string) => {
      const row = { id: `fake-${Date.now()}-${Math.random()}` };
      const existing = store.get(key) ?? [];
      existing.push(row);
      store.set(key, existing);
      return row;
    },
    deleteMarkers: async (key: string) => {
      store.delete(key);
    },
  };
}

function createFailingDbDeps() {
  return {
    findMarkers: async (_key: string) => {
      throw new Error("simulated DB read failure");
    },
    insertMarker: async (_key: string) => {
      throw new Error("simulated DB write failure");
    },
    deleteMarkers: async (_key: string) => {
      throw new Error("simulated DB delete failure");
    },
  };
}

// ── TESTS ──────────────────────────────────────────────────────────

beforeEach(() => {
  resetInMemoryClaimsForTests();
});

describe("Chatwoot idempotency", () => {
  it("first claim returns true", async () => {
    const fake = createFakeDeps();
    const result = await claimChatwootMessageProcessing("msg-001", fake);
    assert.equal(result, true);
  });

  it("second claim returns false", async () => {
    const fake = createFakeDeps();
    await claimChatwootMessageProcessing("msg-002", fake);
    const result = await claimChatwootMessageProcessing("msg-002", fake);
    assert.equal(result, false);
  });

  it("duplicate detected through DB tier when memory is empty", async () => {
    const fake = createFakeDeps();

    // First claim seeds both DB and memory.
    await claimChatwootMessageProcessing("msg-003", fake);

    // Simulate cold restart — clear memory but leave DB intact.
    resetInMemoryClaimsForTests();

    // Second claim should detect the DB marker.
    const result = await claimChatwootMessageProcessing("msg-003", fake);
    assert.equal(result, false);
  });

  it("DB marker is inserted on first claim", async () => {
    const fake = createFakeDeps();
    await claimChatwootMessageProcessing("msg-004", fake);

    assert.equal(fake.store.size, 1);
    const key = `cw-msg:msg-004`;
    const markers = fake.store.get(key);
    assert.ok(markers, "marker should exist for cw-msg:msg-004");
    assert.equal(markers.length, 1);
  });

  it("release removes the claim", async () => {
    const fake = createFakeDeps();

    await claimChatwootMessageProcessing("msg-005", fake);
    assert.equal(fake.store.size, 1);

    await releaseChatwootMessageClaim("msg-005", fake);
    assert.equal(fake.store.size, 0);
  });

  it("released message can be claimed again", async () => {
    const fake = createFakeDeps();

    await claimChatwootMessageProcessing("msg-006", fake);
    const first = await claimChatwootMessageProcessing("msg-006", fake);
    assert.equal(first, false);

    await releaseChatwootMessageClaim("msg-006", fake);

    const second = await claimChatwootMessageProcessing("msg-006", fake);
    assert.equal(second, true);
  });

  it("DB failure does not throw and memory claim still prevents immediate duplicate", async () => {
    const failingDeps = createFailingDbDeps();

    // First claim: DB insert fails, but memory claim succeeds.
    const first = await claimChatwootMessageProcessing(
      "msg-007",
      failingDeps
    );
    assert.equal(first, true);

    // Second call within same process: memory blocks duplicate.
    const second = await claimChatwootMessageProcessing(
      "msg-007",
      failingDeps
    );
    assert.equal(second, false);
  });

  it("resetInMemoryClaimsForTests clears memory state", async () => {
    const fake = createFakeDeps();

    await claimChatwootMessageProcessing("msg-008", fake);
    resetInMemoryClaimsForTests();

    // Memory is cleared; without DB the claim would normally succeed.
    // Since our fake DB still has the marker, this tests the DB path:
    // it should return false because DB still has the row.
    const result = await claimChatwootMessageProcessing("msg-008", fake);
    assert.equal(result, false);
  });

  it("separate message IDs can both be claimed", async () => {
    const fake = createFakeDeps();

    const a = await claimChatwootMessageProcessing("msg-A", fake);
    const b = await claimChatwootMessageProcessing("msg-B", fake);

    assert.equal(a, true);
    assert.equal(b, true);
    assert.equal(fake.store.size, 2);
  });

  it("memory/DB dependency injection works correctly", async () => {
    const calls: string[] = [];

    const customDeps = {
      findMarkers: async (key: string) => {
        calls.push(`find:${key}`);
        return [];
      },
      insertMarker: async (key: string) => {
        calls.push(`insert:${key}`);
        return { id: "custom" };
      },
      deleteMarkers: async (key: string) => {
        calls.push(`delete:${key}`);
      },
    };

    await claimChatwootMessageProcessing("injected-1", customDeps);
    assert.deepEqual(calls, ["find:cw-msg:injected-1", "insert:cw-msg:injected-1"]);

    calls.length = 0;

    await releaseChatwootMessageClaim("injected-1", customDeps);
    assert.deepEqual(calls, ["delete:cw-msg:injected-1"]);
  });
});
