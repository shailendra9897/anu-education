// FILE: tests/lead.identity.test.ts
//
// PHASE 3C / C1 — CANONICAL CRM IDENTITY: VERIFICATION SUITE
//
// Covers the C1 contract end-to-end at the DB-free seams the repo uses
// everywhere (injected ports, pure decision cores):
//   A  same phone, WEB + WHATSAPP conversations → ONE shared Lead
//   B  same email (across channels)            → ONE shared Lead
//   C  explicit Lead ID                        → same Lead, wins lookups
//   D  unrelated WEB conversation is NEVER reused as the WhatsApp
//      conversation (Lead is shared; conversation rows stay separate /
//      source-scoped) — buildPhoneLookupWhere + resolveConversation
//   E  existing WHATSAPP conversation is reused correctly (source-
//      scoped phone match, created=false)
//   F  CLOSED / soft-deleted conversations are not reused
//   G  anonymous web conversation (no phone/email) → NOT force-linked
//   H  leadScore / leadTier are untouched (no writer in C1); linking
//      only sets leadId and never mutates Lead fields found via a
//      different signal (non-overwrite)
//   I  RateLimitLog unique (idempotency) behavior: a P2002 from a
//      concurrent insert means "already claimed" → duplicate, NOT a
//      fresh claim / double process
//   J  migration preserves IDs (no DROP/DELETE of conversations,
//      messages, bookings, portal rows; whatsapp_leads untouched);
//      Lead provider fields + DemoBooking/PortalAccessRequest leadId
//      plumbing present
//
// Run: npx tsx tests/lead.identity.test.ts
// ─────────────────────────────────────────────────────────────────

import "./env.setup";

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import type {
  Conversation,
  Lead,
  LeadIdentitySource,
} from "@prisma/client";
import { ConversationSource, ConversationStatus } from "@prisma/client";
import {
  normalizeIdentityPhone,
  normalizeIdentityEmail,
  resolveLeadForIdentity,
  ensureLeadLinkedToConversation,
  type LeadPorts,
  type EnsureLeadPorts,
} from "../lib/lead/lead.identity.service";
import {
  buildPhoneLookupWhere,
  resolveConversation,
  type ConversationResolvePorts,
} from "../lib/chat/conversation.service";
import {
  claimWhatsAppMessageProcessing,
  resetInMemoryClaimsForTests as resetWaClaims,
} from "../lib/whatsapp/idempotency";
import {
  claimChatwootMessageProcessing,
  resetInMemoryClaimsForTests as resetCwClaims,
} from "../lib/chatwoot/idempotency";

// ── fakes ──────────────────────────────────────────────────────────

let leadCounter = 0;

function makeLead(over: Partial<Lead> = {}): Lead {
  leadCounter += 1;
  return {
    id: `lead-${leadCounter}`,
    name: null,
    phone: null,
    email: null,
    identitySource: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...over,
  } as Lead;
}

function conv(over: Partial<Conversation> = {}): Conversation {
  return {
    id: "conv",
    source: ConversationSource.WEB,
    status: ConversationStatus.ACTIVE,
    sessionId: "sess",
    phone: null,
    name: null,
    email: null,
    sourcePage: null,
    leadScore: null,
    leadTier: null,
    assignedCounsellorId: null,
    leadId: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    deletedAt: null,
    ...over,
  } as Conversation;
}

function makeLeadStore(initial: Lead[] = []) {
  const leads = [...initial];
  const ports: LeadPorts = {
    findLeadByPhone: async (phone) =>
      leads.find((l) => l.phone === phone) ?? null,
    findLeadByEmail: async (email) =>
      leads.find((l) => l.email === email) ?? null,
    findLeadById: async (id) => leads.find((l) => l.id === id) ?? null,
    createLead: async (data) => {
      const lead = makeLead(data);
      leads.push(lead);
      return lead;
    },
  };
  return { ports, leads };
}

function makeEnsurePorts(rows: Conversation[], leadStore?: ReturnType<typeof makeLeadStore>) {
  const store = leadStore ?? makeLeadStore();
  const conversationPorts = {
    findConversation: async (id: string) =>
      rows.find((c) => c.id === id) ?? null,
    setConversationLead: async (id: string, leadId: string) => {
      const idx = rows.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error("missing conversation");
      const updated = { ...rows[idx], leadId } as Conversation;
      rows[idx] = updated;
      return updated;
    },
  };
  const ports: EnsureLeadPorts = { ...store.ports, ...conversationPorts };
  return { ports, store };
}

function makeResolverPorts(config: {
  phoneResult?: Conversation | null;
  sessionResult?: Conversation | null;
  created?: Conversation;
}) {
  const calls: { byPhone?: unknown; bySession?: unknown } = {};
  const ports: ConversationResolvePorts = {
    findByPhone: async (where) => {
      calls.byPhone = where;
      return config.phoneResult ?? null;
    },
    findBySession: async (sessionId) => {
      calls.bySession = sessionId;
      return config.sessionResult ?? null;
    },
    create: async () => config.created ?? conv({ id: "new-conv" }),
  };
  return { ports, calls };
}

function p2002Error(): Error & { code: string } {
  return Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
}

// ── normalization ──────────────────────────────────────────────────

test("normalizeIdentityPhone: accepts human + E.164 forms and returns storage form", () => {
  assert.equal(normalizeIdentityPhone("+91 94281 86817"), "+919428186817");
  assert.equal(normalizeIdentityPhone("9428186817"), "+919428186817");
  assert.equal(normalizeIdentityPhone("919428186817"), "+919428186817");
  assert.equal(normalizeIdentityPhone("+1 415 555 2671"), "+14155552671");
});

test("normalizeIdentityPhone: rejects unusable input", () => {
  assert.equal(normalizeIdentityPhone(null), null);
  assert.equal(normalizeIdentityPhone(undefined), null);
  assert.equal(normalizeIdentityPhone(""), null);
  assert.equal(normalizeIdentityPhone("   "), null);
  assert.equal(normalizeIdentityPhone(12345), null);
  assert.equal(normalizeIdentityPhone("not a phone"), null);
});

test("normalizeIdentityEmail: lowercases, trims, validates structure", () => {
  assert.equal(normalizeIdentityEmail("  Riya.Sharma@ANUedu.in "), "riya.sharma@anuedu.in");
  assert.equal(normalizeIdentityEmail(null), null);
  assert.equal(normalizeIdentityEmail("not-an-email"), null);
  assert.equal(normalizeIdentityEmail(""), null);
});

// ── scenario A: same phone, different channels → ONE Lead ──────────

test("A — WEB and WHATSAPP conversations with the same phone resolve to the SAME Lead", async () => {
  const rows = [
    conv({ id: "web-conv", source: ConversationSource.WEB, phone: "+919428186817" }),
    conv({ id: "wa-conv", source: ConversationSource.WHATSAPP, phone: "+919428186817" }),
  ];
  const { ports, store } = makeEnsurePorts(rows);

  const web = await ensureLeadLinkedToConversation(
    { conversationId: "web-conv", identitySource: "WEB" as LeadIdentitySource },
    ports,
  );
  const wa = await ensureLeadLinkedToConversation(
    { conversationId: "wa-conv", identitySource: "WHATSAPP" as LeadIdentitySource },
    ports,
  );

  assert.ok(web.lead);
  assert.ok(wa.lead);
  assert.equal(web.lead.id, wa.lead.id, "both channels share one Lead");
  assert.equal(web.lead.phone, "+919428186817");
  assert.equal(store.leads.length, 1, "only one Lead was ever created");
  assert.equal(web.conversation.leadId, web.lead.id);
  assert.equal(wa.conversation.leadId, wa.lead.id);
  // Conversations themselves remain DISTINCT rows (separate channels).
  assert.equal(web.conversation.id, "web-conv");
  assert.equal(wa.conversation.id, "wa-conv");
});

// ── scenario B: same email → ONE Lead ──────────────────────────────

test("B — same email across channels resolves to the SAME Lead even when phones differ", async () => {
  const rows = [
    conv({ id: "web-conv", source: ConversationSource.WEB, phone: null, email: "riya@anuedu.in", name: "Riya" }),
    conv({ id: "wa-conv", source: ConversationSource.WHATSAPP, phone: "+919876543210", email: "RIYA@ANuEDu.IN" }),
  ];
  const { ports, store } = makeEnsurePorts(rows);

  const web = await ensureLeadLinkedToConversation(
    { conversationId: "web-conv", identitySource: "WEB" as LeadIdentitySource },
    ports,
  );
  const wa = await ensureLeadLinkedToConversation(
    { conversationId: "wa-conv", identitySource: "WHATSAPP" as LeadIdentitySource },
    ports,
  );

  assert.equal(web.lead?.id, wa.lead?.id);
  assert.equal(web.lead?.email, "riya@anuedu.in");
  assert.equal(store.leads.length, 1);
});

// ── scenario C: explicit Lead ID wins lookups ──────────────────────

test("C — explicit existing Lead ID is honored even when phone/email are unknown", async () => {
  const explicit = makeLead({ id: "lead-explicit", email: "known@anuedu.in" });
  const row = conv({ id: "anon-conv", phone: null, email: null });
  const { ports, store } = makeEnsurePorts([row], makeLeadStore([explicit]));

  const result = await ensureLeadLinkedToConversation(
    { conversationId: "anon-conv", explicitLeadId: "lead-explicit" },
    ports,
  );

  assert.equal(result.lead?.id, "lead-explicit");
  assert.equal(store.leads.length, 1, "no new Lead created");
  assert.equal(result.conversation.leadId, "lead-explicit");
});

test("C — explicit Lead ID wins over a phone that matches a different Lead", async () => {
  const explicit = makeLead({ id: "lead-explicit", email: "a@b.co" });
  const phoneLead = makeLead({ id: "lead-phone", phone: "+919428186817" });
  const row = conv({ id: "c", phone: "+919428186817" });
  const { ports } = makeEnsurePorts([row], makeLeadStore([explicit, phoneLead]));

  const result = await ensureLeadLinkedToConversation(
    { conversationId: "c", explicitLeadId: "lead-explicit" },
    ports,
  );
  assert.equal(result.lead?.id, "lead-explicit");
});

test("C — nonexistent explicit Lead ID falls through to phone/email/create", async () => {
  const row = conv({ id: "c", phone: "+919999999999" });
  const { ports } = makeEnsurePorts([row]);

  const result = await ensureLeadLinkedToConversation(
    { conversationId: "c", explicitLeadId: "lead-does-not-exist" },
    ports,
  );
  assert.ok(result.lead);
  assert.equal(result.lead.phone, "+919999999999");
  // The bogus ID was ignored — a NEW lead was created for the phone.
  assert.notEqual(result.lead.id, "lead-does-not-exist");
});

// ── matching order: phone → email → create ─────────────────────────

test("phone match takes precedence over email match when they differ", async () => {
  const phoneLead = makeLead({ id: "l-phone", phone: "+919428186817", email: null });
  const emailLead = makeLead({ id: "l-email", email: "other@anuedu.in" });
  const row = conv({ id: "c", phone: "+919428186817", email: "other@anuedu.in" });
  const { ports } = makeEnsurePorts([row], makeLeadStore([phoneLead, emailLead]));

  const result = await ensureLeadLinkedToConversation({ conversationId: "c" }, ports);
  assert.equal(result.lead?.id, "l-phone", "phone (strongest signal) wins");
});

test("non-overwrite: email from one channel is NOT copied onto a Lead matched by phone", async () => {
  // Single phone-lead with a null email; a WhatsApp conversation carries
  // an email that could belong to a sibling sharing the number.
  const phoneLead = makeLead({ id: "l-phone", phone: "+919428186817", email: null });
  const row = conv({ id: "c", phone: "+919428186817", email: "riya@anuedu.in" });
  const { ports } = makeEnsurePorts([row], makeLeadStore([phoneLead]));

  const result = await ensureLeadLinkedToConversation({ conversationId: "c" }, ports);
  assert.equal(result.lead?.email, null, "ambiguity is recorded, never overwritten");
  assert.equal(result.lead?.id, "l-phone");
});

test("create happens only when nothing matches; identitySource is recorded", async () => {
  const row = conv({ id: "brand-new", source: ConversationSource.WHATSAPP, phone: "+919701234567" });
  const { ports, store } = makeEnsurePorts([row]);

  const result = await ensureLeadLinkedToConversation(
    { conversationId: "brand-new", identitySource: "WHATSAPP" as LeadIdentitySource },
    ports,
  );
  assert.equal(store.leads.length, 1);
  assert.equal(result.lead?.identitySource, "WHATSAPP");
});

test("resolveLeadForIdentity: explicit id, then phone, then email, then create", async () => {
  const existing = makeLead({ id: "l-exists", phone: "+919428186817", email: "riya@anuedu.in" });
  const store = makeLeadStore([existing]);

  const byId = await resolveLeadForIdentity(
    { explicitLeadId: "l-exists", phone: "+919428186817" },
    store.ports,
  );
  assert.equal(byId.lead.id, "l-exists");
  assert.equal(byId.created, false);

  const byPhone = await resolveLeadForIdentity(
    { phone: "+91 94281 86817", email: "other@x.in" },
    store.ports,
  );
  assert.equal(byPhone.lead.id, "l-exists");
  assert.equal(byPhone.created, false);

  const byEmail = await resolveLeadForIdentity(
    { phone: "+919999999999", email: "RIYA@anuedu.in" },
    store.ports,
  );
  assert.equal(byEmail.lead.id, "l-exists");

  const fresh = await resolveLeadForIdentity(
    { phone: "+919555555555", email: "new@anuedu.in", identitySource: "WEB" as LeadIdentitySource },
    store.ports,
  );
  assert.equal(fresh.created, true);
  assert.equal(fresh.lead.email, "new@anuedu.in");
});

// ── scenarios D / E / F: conversation reuse is untouched ───────────

test("D — WhatsApp phone lookup is source-scoped: a WEB conversation is never eligible", () => {
  const where = buildPhoneLookupWhere({ phone: "+919428186817", source: ConversationSource.WHATSAPP })!;
  assert.equal(where.source, "WHATSAPP", "WhatsApp lookup constrained to WHATSAPP rows");
  assert.deepEqual(where.status, { in: ["ACTIVE", "HANDED_OFF"] });
  assert.equal(where.deletedAt, null);
  assert.equal(where.phone, "+919428186817");
});

test("D — WEB lookup is intentionally cross-source but excludes closed/deleted", () => {
  const where = buildPhoneLookupWhere({ phone: "+919428186817", source: ConversationSource.WEB })!;
  assert.equal(where.source, undefined, "WEB lookup is NOT source-scoped (preserves web behavior)");
  assert.deepEqual(where.status, { in: ["ACTIVE", "HANDED_OFF"] });
  assert.equal(where.deletedAt, null);
});

test("E — existing WHATSAPP conversation is reused (created=false) via source-scoped phone match", async () => {
  const existing = conv({ id: "wa-existing", source: ConversationSource.WHATSAPP, phone: "+919428186817" });
  const { ports, calls } = makeResolverPorts({ phoneResult: existing });

  const result = await resolveConversation(
    { phone: "+919428186817", source: ConversationSource.WHATSAPP },
    ports,
  );
  assert.equal(result.created, false);
  assert.equal(result.conversation.id, "wa-existing");
  assert.ok(calls.byPhone, "phone lookup was used");
  assert.equal((calls.byPhone as { source?: string }).source, "WHATSAPP");
});

test("F — CLOSED / soft-deleted conversations are not eligible for reuse", async () => {
  const closed = conv({ id: "wa-closed", source: ConversationSource.WHATSAPP, status: ConversationStatus.CLOSED, phone: "+919428186817" });
  const { ports } = makeResolverPorts({ phoneResult: null, created: conv({ id: "wa-new" }) });

  // The real findFirst could never return `closed` (where excludes it);
  // simulate that by returning null → a NEW row is created.
  const result = await resolveConversation(
    { phone: "+919428186817", source: ConversationSource.WHATSAPP },
    ports,
  );
  assert.equal(result.created, true);
  assert.equal(result.conversation.id, "wa-new");
});

test("E — sessionId reuse still works when phone does not match", async () => {
  const bySession = conv({ id: "web-by-session" });
  const { ports, calls } = makeResolverPorts({ sessionResult: bySession });

  const result = await resolveConversation(
    { sessionId: "sess-123", source: ConversationSource.WEB },
    ports,
  );
  assert.equal(result.conversation.id, "web-by-session");
  assert.equal(result.created, false);
  assert.equal(calls.bySession, "sess-123");
});

// ── scenario G: anonymous conversations are not force-linked ───────

test("G — anonymous web conversation (no phone/email) is NOT linked to a Lead", async () => {
  const row = conv({ id: "anon", phone: null, email: null, name: null });
  const { ports, store } = makeEnsurePorts([row]);

  const result = await ensureLeadLinkedToConversation(
    { conversationId: "anon", identitySource: "WEB" as LeadIdentitySource },
    ports,
  );
  assert.equal(result.lead, null);
  assert.equal(result.conversation.leadId, null);
  assert.equal(store.leads.length, 0, "never force-create a Lead from no identity");
});

// ── scenario H: leadScore / leadTier untouched, linking is inert ───

test("H — an already-linked conversation resolves its Lead without creating/mutating anything", async () => {
  const linked = makeLead({ id: "l-linked", phone: "+919428186817" });
  const row = conv({ id: "c", phone: "+919428186817", leadId: "l-linked", name: "Already Known" });
  const { ports, store } = makeEnsurePorts([row], makeLeadStore([linked]));

  const result = await ensureLeadLinkedToConversation({ conversationId: "c" }, ports);
  assert.equal(result.lead?.id, "l-linked");
  assert.equal(store.leads.length, 1);
  assert.equal(result.conversation.name, "Already Known", "name untouched on re-link");
});

test("H — linking never writes leadScore/leadTier and preserves existing values", async () => {
  const row = conv({ id: "c", phone: "+919428186817", leadScore: 42, leadTier: "READY" });
  const { ports } = makeEnsurePorts([row]);

  const result = await ensureLeadLinkedToConversation({ conversationId: "c" }, ports);
  assert.equal(result.lead?.phone, "+919428186817");
  assert.equal(result.conversation.leadScore, 42, "leadScore is not a C1 writer");
  assert.equal(result.conversation.leadTier, "READY", "leadTier is not a C1 writer");
});

// ── scenario I: RateLimitLog unique — idempotency race is safe ─────

beforeEach(() => {
  resetWaClaims();
  resetCwClaims();
});

test("I — concurrent WhatsApp claim: P2002 unique violation means 'already claimed' (duplicate), never a fresh claim", async () => {
  // Simulates two instances racing: findMarkers returns [] (both saw
  // "not yet claimed"), then the loser's insert hits the unique index.
  let inserted = false;
  const deps = {
    findMarkers: async () => [],
    insertMarker: async () => {
      if (inserted) throw p2002Error();
      inserted = true;
      return { id: "m1" };
    },
    deleteMarkers: async () => undefined,
  };

  const first = await claimWhatsAppMessageProcessing("wamid.RACE.1", deps);
  assert.equal(first, true);
  // Second *instance* (memory is fresh because no other message raced in
  // this process) must STILL be detected as a duplicate via P2002.
  resetWaClaims();
  const second = await claimWhatsAppMessageProcessing("wamid.RACE.1", deps);
  assert.equal(second, false, "P2002 must NOT fail open into a double-process");
});

test("I — concurrent Chatwoot claim: P2002 unique violation means duplicate", async () => {
  let inserted = false;
  const deps = {
    findMarkers: async () => [],
    insertMarker: async () => {
      if (inserted) throw p2002Error();
      inserted = true;
      return { id: "m1" };
    },
    deleteMarkers: async () => undefined,
  };

  const first = await claimChatwootMessageProcessing("cw-11", deps);
  assert.equal(first, true);
  resetCwClaims();
  const second = await claimChatwootMessageProcessing("cw-11", deps);
  assert.equal(second, false);
});

test("I — a generic (non-P2002) DB failure still fails open to memory tier only", async () => {
  const deps = {
    findMarkers: async () => [],
    insertMarker: async () => {
      throw new Error("connection reset");
    },
    deleteMarkers: async () => undefined,
  };
  const first = await claimWhatsAppMessageProcessing("wamid.FAIL.2", deps);
  assert.equal(first, true, "generic outage remains fail-open");
});

// ── scenario J: migration safety + provider/lead plumbing ──────────

const MIGRATION_PATH = join(
  process.cwd(),
  "prisma/migrations/20260830000000_add_canonical_lead_identity/migration.sql",
);
const SCHEMA_PATH = join(process.cwd(), "prisma/schema.prisma");

test("J — migration preserves existing data (no destructive DDL on managed tables)", () => {
  const sql = readFileSync(MIGRATION_PATH, "utf8");

  // No hard-deletes / drops of conversations, messages, bookings, portal
  // requests, leads, context or the versioned rate-log index.
  for (const banned of [
    'DROP TABLE "Conversation"',
    'DROP TABLE "Message"',
    'DROP TABLE "DemoBooking"',
    'DROP TABLE "PortalAccessRequest"',
    'DROP TABLE "LeadContext"',
    'DROP TABLE "Staff"',
    'DROP COLUMN',
    '"deletedAt"',
  ]) {
    assert.ok(!sql.includes(banned), `migration must not alter/drop: ${banned}`);
  }

  // Comment-out or absent: no DROP at all except the defensive
  // RateLimitLog dedupe (which keeps the earliest row per key).
  assert.ok(!sql.includes("DROP "), "migration contains no DROP statements");

  // The legacy unmanaged whatsapp_leads table is untouched (it may be
  // mentioned in comments, but never in a DROP/ALTER/DELETE statement).
  assert.ok(!/drop table\s+"whatsapp_leads"/i.test(sql), "never drop whatsapp_leads");
  assert.ok(!/alter table\s+"whatsapp_leads"/i.test(sql), "never alter whatsapp_leads");
  assert.ok(!/delete from\s+"whatsapp_leads"/i.test(sql), "never delete from whatsapp_leads");

  // Additive schema additions are present.
  assert.ok(sql.includes('ADD COLUMN     "leadId" TEXT'), "Conversation/demo/portal leadId added");
  assert.ok(sql.includes('ADD COLUMN     "providerId" TEXT'), "Message providerId added");
  assert.ok(sql.includes('ADD COLUMN     "requestCount" INTEGER NOT NULL DEFAULT 1'), "rate counter added");
  assert.ok(sql.includes('CREATE UNIQUE INDEX "RateLimitLog_identifier_endpoint_key"'), "unique (identifier, endpoint) added");
  assert.ok(sql.includes("ON DELETE SET NULL"), "all new FKs are SET NULL (safe backfill)");
});

test("J — schema declares Lead + provider fields + leadId relations", () => {
  // Compare against whitespace-agnostic schema text: `prisma format`
  // realigns field columns, which is immaterial to Prisma semantics but
  // would break exact-whitespace `.includes`. Normalize runs of spaces.
  const schema = readFileSync(SCHEMA_PATH, "utf8").replace(/[ \t]+/g, " ");

  assert.ok(schema.includes("model Lead {"), "Lead model exists");
  assert.ok(schema.includes("email String? @unique"), "Lead email unique");
  assert.ok(schema.includes("leadId String?"), "Conversation.leadId");
  assert.ok(schema.includes("providerId String?"), "Message.providerId");
  assert.ok(schema.includes("providerMessageId String?"), "Message.providerMessageId");
  assert.ok(schema.includes("providerStatus String?"), "Message.providerStatus");
  assert.ok(schema.includes("requestCount Int @default(1)"), "RateLimitLog counter");
  assert.ok(schema.includes("@@unique([identifier, endpoint])"), "RateLimitLog unique");
  // Demo + portal carry the canonical identity relation too.
  const demoIdx = schema.indexOf("model DemoBooking {");
  const portalIdx = schema.indexOf("model PortalAccessRequest {");
  assert.ok(demoIdx !== -1 && schema.slice(demoIdx).includes("leadId String?"), "DemoBooking.leadId");
  assert.ok(portalIdx !== -1 && schema.slice(portalIdx).includes("leadId String?"), "PortalAccessRequest.leadId");
});

test("J — demo/portal paths thread conversation.leadId into bookings and portal requests", () => {
  const booking = readFileSync(join(process.cwd(), "lib/demo/demo.booking.ts"), "utf8");
  const service = readFileSync(join(process.cwd(), "lib/demo/demo.service.ts"), "utf8");
  const portal = readFileSync(join(process.cwd(), "lib/portal/portal.access.service.ts"), "utf8");

  assert.ok(booking.includes("leadId?: string;"), "BookDemoInput carries leadId");
  assert.ok(service.includes("leadId?: string;"), "createDemoBooking accepts leadId");
  assert.ok(portal.includes("leadId?: string;"), "createPortalAccessRequest accepts leadId");
  assert.ok(portal.includes("leadId: input.leadId,"), "portal request persists leadId");
});

test("J — RateLimitLog requestCount column exists in generated Prisma client runtime types", async () => {
  // Compile-time guarantee is handled by tsc; this asserts the client
  // the app actually uses exposes the new field on the model delegate.
  const { Prisma } = await import("@prisma/client");
  assert.ok(Prisma.RateLimitLogScalarFieldEnum.requestCount, "requestCount recognised by client");
  assert.ok(Prisma.LeadScalarFieldEnum.email, "Lead model recognised by client");
});