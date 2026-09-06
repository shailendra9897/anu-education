// FILE: tests/chatwoot-conversation-isolation.test.ts
//
// Phase 7 — WHATSAPP CONVERSATION ISOLATION (Part 1)
//
// Verifies the source-scoped lookup decision implemented in
// lib/chat/conversation.service.ts (buildPhoneLookupWhere + the pure
// resolveConversation orchestration) WITHOUT a live database: pseudo-RNG
// in-memory conversation store injected through the resolve ports.
//
// Rules under test:
//   • WHATSAPP inbound REUSES an existing ACTIVE/HANDED_OFF WHATSAPP
//     conversation for the phone.
//   • WHATSAPP inbound NEVER reuses a WEB conversation.
//   • WHATSAPP inbound CREATES a new WHATSAPP conversation when none
//     exists.
//   • WEB inbound keeps the existing (cross-source) behavior.
//   • status/deletedAt behavior is preserved (CLOSED/ARCHIVED/deleted
//     conversations are not reused).
// ─────────────────────────────────────────────────────────────────

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buildPhoneLookupWhere,
  resolveConversation,
  type ConversationResolvePorts,
} from "../lib/chat/conversation.service";
import { ConversationSource } from "@prisma/client";

type Row = {
  id: string;
  phone?: string;
  source: "WEB" | "WHATSAPP";
  status: string;
  deletedAt: Date | null;
  updatedAt: Date;
};

function makeStore(rows: Row[]) {
  const store: Row[] = [...rows];
  const created: Row[] = [];

  const db: ConversationResolvePorts = {
    findByPhone: async (where) => {
      // Mirror the real Prisma filter semantics used by
      // buildPhoneLookupWhere against the in-memory rows.
      const matches = store
        .filter((r) => {
          if (r.phone !== (where.phone as string)) return false;
          if ("source" in where && where.source !== undefined) {
            if (r.source !== where.source) return false;
          }
          const st = where.status as { in: string[] };
          if (st?.in && !st.in.includes(r.status)) return false;
          if (r.deletedAt !== null) return false;
          return true;
        })
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      return (matches[0] ?? null) as never;
    },
    findBySession: async () => null,
    create: async (data) => {
      const row: Row = {
        id: `c_${store.length + created.length + 1}`,
        phone: data.phone,
        source: data.source as "WEB" | "WHATSAPP",
        status: "ACTIVE",
        deletedAt: null,
        updatedAt: new Date(),
      };
      created.push(row);
      return row as never;
    },
  };

  return { db, store, created };
}

const PHONE = "+917016497087";

test("WHATSAPP finds and reuses an existing WHATSAPP conversation", async () => {
  const existing: Row = {
    id: "whatsapp-1",
    phone: PHONE,
    source: "WHATSAPP",
    status: "ACTIVE",
    deletedAt: null,
    updatedAt: new Date("2026-08-29T00:00:00Z"),
  };
  const { db, created } = makeStore([existing]);

  const result = await resolveConversation(
    { phone: PHONE, source: ConversationSource.WHATSAPP, sourcePage: "/whatsapp" },
    db
  );

  assert.equal(result.created, false, "reused existing, not created");
  assert.equal(result.conversation.id, "whatsapp-1");
  assert.equal(created.length, 0, "no new conversation created");
});

test("WHATSAPP does NOT reuse a WEB conversation (isolation)", async () => {
  const web: Row = {
    id: "web-1",
    phone: PHONE,
    source: "WEB",
    status: "ACTIVE",
    deletedAt: null,
    updatedAt: new Date("2026-08-29T00:00:00Z"),
  };
  const { db, created } = makeStore([web]);

  const result = await resolveConversation(
    { phone: PHONE, source: ConversationSource.WHATSAPP, sourcePage: "/whatsapp" },
    db
  );

  // A brand-new WHATSAPP conversation must be created; the WEB one is NOT used.
  assert.equal(result.created, true, "created a new WHATSAPP conversation");
  assert.notEqual(result.conversation.id, "web-1");
  assert.equal(created.length, 1, "exactly one new conversation created");
  assert.equal(result.conversation.source, "WHATSAPP");
});

test("WHATSAPP creates a new conversation when none exists", async () => {
  const { db, created } = makeStore([]);

  const result = await resolveConversation(
    { phone: PHONE, source: ConversationSource.WHATSAPP, sourcePage: "/whatsapp" },
    db
  );

  assert.equal(result.created, true);
  assert.equal(created.length, 1);
  assert.equal(result.conversation.source, "WHATSAPP");
});

test("WEB behavior preserved: existing WEB conversation is reused for WEB source", async () => {
  const web: Row = {
    id: "web-1",
    phone: PHONE,
    source: "WEB",
    status: "ACTIVE",
    deletedAt: null,
    updatedAt: new Date("2026-08-29T00:00:00Z"),
  };
  const { db, created } = makeStore([web]);

  const result = await resolveConversation(
    { phone: PHONE, source: ConversationSource.WEB, sourcePage: "/home" },
    db
  );

  assert.equal(result.created, false, "WEB reuses its WEB thread");
  assert.equal(result.conversation.id, "web-1");
  assert.equal(created.length, 0);
});

test("WEB still matches a WHATSAPP conversation by phone (legacy cross-source)", async () => {
  const wa: Row = {
    id: "whatsapp-1",
    phone: PHONE,
    source: "WHATSAPP",
    status: "ACTIVE",
    deletedAt: null,
    updatedAt: new Date("2026-08-29T00:00:00Z"),
  };
  const { db, created } = makeStore([wa]);

  // WEB lookup is unchanged: it may still match a WHATSAPP conversation.
  const result = await resolveConversation(
    { phone: PHONE, source: ConversationSource.WEB, sourcePage: "/home" },
    db
  );

  assert.equal(result.created, false);
  assert.equal(result.conversation.id, "whatsapp-1");
  assert.equal(created.length, 0);
});

test("CLOSED/ARCHIVED or deleted conversations are not reused", async () => {
  const closedWa: Row = {
    id: "closed-wa",
    phone: PHONE,
    source: "WHATSAPP",
    status: "CLOSED",
    deletedAt: null,
    updatedAt: new Date("2026-08-29T00:00:00Z"),
  };
  const archivedWa: Row = {
    id: "archive-wa",
    phone: PHONE,
    source: "WHATSAPP",
    status: "ARCHIVED",
    deletedAt: null,
    updatedAt: new Date("2026-08-29T00:00:00Z"),
  };
  const { db, created } = makeStore([closedWa, archivedWa]);

  const result = await resolveConversation(
    { phone: PHONE, source: ConversationSource.WHATSAPP, sourcePage: "/whatsapp" },
    db
  );

  assert.equal(result.created, true, "non-active threads are not reused");
  assert.equal(created.length, 1);
});

test("deletedAt is always filtered (soft-delete preserved)", () => {
  const where = buildPhoneLookupWhere({
    phone: PHONE,
    source: ConversationSource.WHATSAPP,
  })!;
  assert.equal((where as { deletedAt: unknown }).deletedAt, null);
});

test("WHATSAPP lookup where-clause constrains source; WEB does not", () => {
  const wa = buildPhoneLookupWhere({
    phone: PHONE,
    source: ConversationSource.WHATSAPP,
  })!;
  assert.equal((wa as { source?: unknown }).source, "WHATSAPP");

  const web = buildPhoneLookupWhere({
    phone: PHONE,
    source: ConversationSource.WEB,
  })!;
  assert.equal("source" in web, false, "WEB lookup is NOT source-scoped");
});
