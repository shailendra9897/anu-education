import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import 'dotenv/config';
import { Client } from 'pg';

const SQLITE_DB_PATH = path.resolve(process.cwd(), 'prisma/dev.db');
const TABLE_ORDER = [
  'Conversation',
  'Message',
  'HandoffEvent',
  'LeadContext',
  'DemoBooking',
  'PortalAccessRequest',
  'RateLimitLog',
] as const;

const EXPECTED_SOURCE_COUNTS: Record<(typeof TABLE_ORDER)[number], number> = {
  Conversation: 117,
  Message: 312,
  HandoffEvent: 0,
  LeadContext: 0,
  DemoBooking: 11,
  PortalAccessRequest: 5,
  RateLimitLog: 0,
};

const REQUIRED_FIELDS: Record<string, string[]> = {
  Conversation: ['id', 'source', 'status', 'createdAt', 'updatedAt'],
  Message: ['id', 'conversationId', 'role', 'content', 'createdAt'],
  HandoffEvent: ['id', 'conversationId', 'trigger', 'createdAt'],
  LeadContext: ['id', 'conversationId', 'updatedAt'],
  DemoBooking: ['id', 'conversationId', 'status', 'createdAt', 'updatedAt'],
  PortalAccessRequest: ['id', 'studentName', 'email', 'phone', 'status', 'attemptCount', 'createdAt', 'updatedAt'],
  RateLimitLog: ['id', 'identifier', 'endpoint', 'createdAt'],
};

const ENUM_VALUES: Record<string, readonly string[]> = {
  Conversation: ['WEB', 'WHATSAPP'],
  Message: ['USER', 'ASSISTANT', 'SYSTEM'],
  HandoffEvent: [
    'EXPLICIT_HUMAN_REQUEST',
    'PRICING_NEGOTIATION',
    'VISA_REJECTION_DISTRESS',
    'URGENT_TIMELINE',
    'COMPLAINT',
    'LEGAL_MEDICAL_QUESTION',
    'LOW_CONFIDENCE_ANSWER',
    'REPEATED_UNSATISFIED_QUESTION',
    'MANUAL_OVERRIDE',
  ],
  DemoBooking: ['PENDING', 'CONFIRMED', 'ATTENDED', 'CANCELLED'],
  PortalAccessRequest: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
};

function sqliteQuery(sql: string): any[] {
  const output = execFileSync('sqlite3', ['-readonly', '-readonly', '-json', SQLITE_DB_PATH, sql], {
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
  }).trim();

  if (!output) {
    return [];
  }

  const parsed = JSON.parse(output);
  return Array.isArray(parsed) ? parsed : [parsed];
}

function isMissing(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

function isDateTimeCompatible(value: unknown): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      const numeric = Number(trimmed);
      return Number.isFinite(numeric) && numeric >= 0;
    }
  }

  const date = new Date(String(value));
  return !Number.isNaN(date.getTime());
}

function isJsonCompatible(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'object') {
    return true;
  }

  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

function getDuplicateCount(values: string[]): number {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  let duplicateCount = 0;

  for (const value of values) {
    if (value === null || value === undefined || value === '') {
      continue;
    }

    if (seen.has(value)) {
      if (!duplicates.has(value)) {
        duplicates.add(value);
      }
    } else {
      seen.add(value);
    }
  }

  duplicateCount = Array.from(duplicates).length;
  return duplicateCount;
}

const EXECUTE_TRANSFER = process.argv.includes('--execute') || process.env.TRANSFER_MODE === 'execute';

function normalizeSqliteValue(table: string, field: string, value: unknown): unknown {
  if (value === null || value === undefined || value === '') {
    return value === '' ? null : value;
  }

  if (field === 'toolCalls') {
    if (typeof value === 'string') {
      try {
        return JSON.stringify(JSON.parse(value));
      } catch {
        return JSON.stringify(value);
      }
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return JSON.stringify(value);
  }

  const datetimeFields = new Set([
    'createdAt',
    'updatedAt',
    'deletedAt',
    'acknowledgedAt',
    'preferredDate',
    'reminderSentAt',
    'lastAttemptAt',
    'completedAt',
    'failedAt',
  ]);

  if (datetimeFields.has(field) && (typeof value === 'number' || typeof value === 'string')) {
    const numeric = typeof value === 'number' ? value : Number(String(value).trim());
    if (Number.isFinite(numeric)) {
      return new Date(numeric).toISOString();
    }
  }

  if (typeof value === 'string' && !['id', 'source', 'status', 'role', 'trigger', 'studentName', 'email', 'phone', 'course', 'sessionId', 'name', 'sourcePage', 'leadTier', 'goal', 'targetCountry', 'targetCourse', 'englishLevel', 'budgetRange', 'timeline', 'intake', 'biggestChallenge', 'linkedAssessmentId', 'notes', 'errorMessage', 'processedBy', 'portalStudentId', 'portalLogin', 'identifier', 'endpoint', 'conversationId', 'demoBookingId', 'acknowledgedBy'].includes(field) && value.trim() !== '') {
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }

  return value;
}

async function verifyPostTransfer(client: Client): Promise<{ totalFkViolations: number; totalDuplicateIds: number; whatsappLeadsCount: number; tableCounts: Record<string, number> }> {
  const tableCounts: Record<string, number> = {};
  for (const table of TABLE_ORDER) {
    const { rows } = await client.query<{count: number}>(`SELECT COUNT(*)::int AS count FROM "${table}";`);
    tableCounts[table] = Number(rows[0]?.count ?? 0);
  }

  const whatsappLeadsCount = Number((await client.query<{count: number}>(`SELECT COUNT(*)::int AS count FROM "whatsapp_leads";`)).rows[0]?.count ?? 0);

  const fkQueries = [
    `SELECT COUNT(*)::int AS count FROM "Message" m LEFT JOIN "Conversation" c ON c.id = m."conversationId" WHERE m."conversationId" IS NOT NULL AND c.id IS NULL;`,
    `SELECT COUNT(*)::int AS count FROM "HandoffEvent" h LEFT JOIN "Conversation" c ON c.id = h."conversationId" WHERE h."conversationId" IS NOT NULL AND c.id IS NULL;`,
    `SELECT COUNT(*)::int AS count FROM "LeadContext" l LEFT JOIN "Conversation" c ON c.id = l."conversationId" WHERE l."conversationId" IS NOT NULL AND c.id IS NULL;`,
    `SELECT COUNT(*)::int AS count FROM "DemoBooking" d LEFT JOIN "Conversation" c ON c.id = d."conversationId" WHERE d."conversationId" IS NOT NULL AND c.id IS NULL;`,
    `SELECT COUNT(*)::int AS count FROM "PortalAccessRequest" p LEFT JOIN "Conversation" c ON c.id = p."conversationId" WHERE p."conversationId" IS NOT NULL AND c.id IS NULL;`,
    `SELECT COUNT(*)::int AS count FROM "PortalAccessRequest" p LEFT JOIN "DemoBooking" d ON d.id = p."demoBookingId" WHERE p."demoBookingId" IS NOT NULL AND d.id IS NULL;`,
  ];

  let totalFkViolations = 0;
  for (const query of fkQueries) {
    const result = await client.query<{count: number}>(query);
    totalFkViolations += Number(result.rows[0]?.count ?? 0);
  }

  let totalDuplicateIds = 0;
  for (const table of TABLE_ORDER) {
    const result = await client.query<{count: number}>(`SELECT COUNT(*)::int AS count FROM (SELECT id FROM "${table}" WHERE id IS NOT NULL GROUP BY id HAVING COUNT(*) > 1) AS dup;`);
    totalDuplicateIds += Number(result.rows[0]?.count ?? 0);
  }

  return { totalFkViolations, totalDuplicateIds, whatsappLeadsCount, tableCounts };
}

async function executeTransfer(sqliteData: Map<string, any[]>, client: Client): Promise<{ totalFkViolations: number; totalDuplicateIds: number; whatsappLeadsCount: number; tableCounts: Record<string, number> }> {
  await client.query('BEGIN');

  try {
    for (const table of TABLE_ORDER) {
      const rows = sqliteData.get(table) ?? [];
      if (rows.length === 0) {
        continue;
      }

      const columns = Object.keys(rows[0]);
      const insertSql = `INSERT INTO "${table}" (${columns.map((column) => `"${column}"`).join(', ')}) VALUES (${columns.map((_, index) => `$${index + 1}`).join(', ')})`;

      for (const row of rows) {
        const values = columns.map((column) => normalizeSqliteValue(table, column, row[column]));
        await client.query(insertSql, values);
      }
    }

    const verification = await verifyPostTransfer(client);
    for (const table of TABLE_ORDER) {
      if (verification.tableCounts[table] !== EXPECTED_SOURCE_COUNTS[table]) {
        throw new Error(`Post-transfer count mismatch for ${table}: expected ${EXPECTED_SOURCE_COUNTS[table]}, found ${verification.tableCounts[table]}`);
      }
    }

    if (verification.whatsappLeadsCount !== 22) {
      throw new Error('whatsapp_leads row count changed unexpectedly during transfer.');
    }

    if (verification.totalFkViolations !== 0 || verification.totalDuplicateIds !== 0) {
      throw new Error(`Post-transfer verification failed: FK violations=${verification.totalFkViolations}, duplicate IDs=${verification.totalDuplicateIds}`);
    }

    await client.query('COMMIT');
    return verification;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function main(): Promise<void> {
  if (!existsSync(SQLITE_DB_PATH)) {
    throw new Error('SQLite source database not found at prisma/dev.db');
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set for the PostgreSQL dry-run validation.');
  }

  let fkViolations = 0;
  let duplicateIds = 0;
  let missingRequiredFields = 0;
  let enumIncompatibilities = 0;
  let destinationConflicts = 0;

  const sqliteData = new Map<string, any[]>();

  for (const table of TABLE_ORDER) {
    const rows = sqliteQuery(`SELECT * FROM "${table}" ORDER BY id;`);
    sqliteData.set(table, rows);

    const expectedCount = EXPECTED_SOURCE_COUNTS[table];
    if (rows.length !== expectedCount) {
      throw new Error(`Unexpected source count for ${table}: expected ${expectedCount}, found ${rows.length}`);
    }

    duplicateIds += getDuplicateCount(rows.map((row) => String(row.id ?? '')));

    for (const row of rows) {
      for (const field of REQUIRED_FIELDS[table] ?? []) {
        if (isMissing(row[field])) {
          missingRequiredFields += 1;
        }
      }

      if (table === 'Conversation') {
        const value = row.status ?? row.source;
        if (value && !['ACTIVE', 'HANDED_OFF', 'CLOSED', 'ARCHIVED'].includes(String(value))) {
          enumIncompatibilities += 1;
        }

        if (row.source && !['WEB', 'WHATSAPP'].includes(String(row.source))) {
          enumIncompatibilities += 1;
        }
      }

      if (table === 'Message') {
        if (row.role && !['USER', 'ASSISTANT', 'SYSTEM'].includes(String(row.role))) {
          enumIncompatibilities += 1;
        }

        if (row.toolCalls !== null && row.toolCalls !== undefined && !isJsonCompatible(row.toolCalls)) {
          enumIncompatibilities += 1;
        }
      }

      if (table === 'HandoffEvent') {
        if (row.trigger && !ENUM_VALUES.HandoffEvent.includes(String(row.trigger))) {
          enumIncompatibilities += 1;
        }
      }

      if (table === 'DemoBooking') {
        if (row.status && !ENUM_VALUES.DemoBooking.includes(String(row.status))) {
          enumIncompatibilities += 1;
        }
      }

      if (table === 'PortalAccessRequest') {
        if (row.status && !ENUM_VALUES.PortalAccessRequest.includes(String(row.status))) {
          enumIncompatibilities += 1;
        }
      }

      for (const key of ['createdAt', 'updatedAt', 'deletedAt', 'acknowledgedAt', 'preferredDate', 'reminderSentAt', 'lastAttemptAt', 'completedAt', 'failedAt']) {
        if (row[key] !== null && row[key] !== undefined && row[key] !== '') {
          if (!isDateTimeCompatible(row[key])) {
            throw new Error(`DateTime validation failed in ${table}.${key} for row id ${String(row.id ?? '<unknown>')}`);
          }
        }
      }
    }
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const expectedTables = TABLE_ORDER.map((table) => table.toLowerCase());
    const tableRows = await client.query<{table_name: string}>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name = ANY($1)`,
      [TABLE_ORDER]
    );

    const present = new Set(tableRows.rows.map((row) => row.table_name));
    for (const table of TABLE_ORDER) {
      if (!present.has(table)) {
        throw new Error(`Required PostgreSQL table missing: ${table}`);
      }
    }

    for (const table of TABLE_ORDER) {
      const { rows } = await client.query<{count: number}>(`SELECT COUNT(*)::int AS count FROM "${table}";`);
      const count = Number(rows[0]?.count ?? 0);
      if (count > 0) {
        destinationConflicts += count;
      }
    }

    for (const table of TABLE_ORDER) {
      const { rows } = await client.query<{id: string}>(`SELECT id FROM "${table}" WHERE id IS NOT NULL;`);
      duplicateIds += getDuplicateCount(rows.map((row) => String(row.id ?? '')));
    }

    const conversationIds = new Set((sqliteData.get('Conversation') ?? []).map((row) => String(row.id)));
    const demoBookingIds = new Set((sqliteData.get('DemoBooking') ?? []).map((row) => String(row.id)));

    for (const row of sqliteData.get('Message') ?? []) {
      if (row.conversationId && !conversationIds.has(String(row.conversationId))) {
        fkViolations += 1;
      }
    }

    for (const row of sqliteData.get('HandoffEvent') ?? []) {
      if (row.conversationId && !conversationIds.has(String(row.conversationId))) {
        fkViolations += 1;
      }
    }

    for (const row of sqliteData.get('LeadContext') ?? []) {
      if (row.conversationId && !conversationIds.has(String(row.conversationId))) {
        fkViolations += 1;
      }
    }

    for (const row of sqliteData.get('DemoBooking') ?? []) {
      if (row.conversationId && !conversationIds.has(String(row.conversationId))) {
        fkViolations += 1;
      }
    }

    for (const row of sqliteData.get('PortalAccessRequest') ?? []) {
      if (row.conversationId && !conversationIds.has(String(row.conversationId))) {
        fkViolations += 1;
      }
      if (row.demoBookingId && !demoBookingIds.has(String(row.demoBookingId))) {
        fkViolations += 1;
      }
    }

    if (EXECUTE_TRANSFER) {
      const verification = await executeTransfer(sqliteData, client);

      const totalSource = Object.values(EXPECTED_SOURCE_COUNTS).reduce((sum, value) => sum + value, 0);
      const summary = [
        `Conversation: ${EXPECTED_SOURCE_COUNTS.Conversation}`,
        `Message: ${EXPECTED_SOURCE_COUNTS.Message}`,
        `HandoffEvent: ${EXPECTED_SOURCE_COUNTS.HandoffEvent}`,
        `LeadContext: ${EXPECTED_SOURCE_COUNTS.LeadContext}`,
        `DemoBooking: ${EXPECTED_SOURCE_COUNTS.DemoBooking}`,
        `PortalAccessRequest: ${EXPECTED_SOURCE_COUNTS.PortalAccessRequest}`,
        `RateLimitLog: ${EXPECTED_SOURCE_COUNTS.RateLimitLog}`,
        '',
        `Total: ${totalSource}`,
        '',
        `FK violations: ${verification.totalFkViolations}`,
        `duplicate IDs: ${verification.totalDuplicateIds}`,
        `whatsapp_leads: ${verification.whatsappLeadsCount}`,
      ];

      process.stdout.write(`${summary.join('\n')}\n`);
      return;
    }

    const totalSource = Object.values(EXPECTED_SOURCE_COUNTS).reduce((sum, value) => sum + value, 0);
    const summary = [
      `Conversation: ${EXPECTED_SOURCE_COUNTS.Conversation} → valid`,
      `Message: ${EXPECTED_SOURCE_COUNTS.Message} → valid`,
      `HandoffEvent: ${EXPECTED_SOURCE_COUNTS.HandoffEvent}`,
      `LeadContext: ${EXPECTED_SOURCE_COUNTS.LeadContext}`,
      `DemoBooking: ${EXPECTED_SOURCE_COUNTS.DemoBooking} → valid`,
      `PortalAccessRequest: ${EXPECTED_SOURCE_COUNTS.PortalAccessRequest} → valid`,
      `RateLimitLog: ${EXPECTED_SOURCE_COUNTS.RateLimitLog}`,
      '',
      `Total: ${totalSource}`,
      '',
      `FK violations: ${fkViolations}`,
      `duplicate IDs: ${duplicateIds}`,
      `missing required fields: ${missingRequiredFields}`,
      `enum incompatibilities: ${enumIncompatibilities}`,
      `destination conflicts: ${destinationConflicts}`,
    ];

    process.stdout.write(`${summary.join('\n')}\n`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
