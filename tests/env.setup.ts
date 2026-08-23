// FILE: tests/env.setup.ts
// Side-effect module: sets deterministic env BEFORE other test imports
// execute (ESM evaluates imports in declaration order).

// Next's type augmentations declare process.env.NODE_ENV as readonly;
// an indexed write is the TypeScript-safe way to set it in tests.
(process.env as Record<string, string | undefined>).NODE_ENV = "test";
process.env.DATABASE_URL ??= "postgresql://test:test@127.0.0.1:5432/test";
process.env.WHATSAPP_TOKEN = "SECRET_TEST_TOKEN_XYZ987";
delete process.env.WHATSAPP_APP_SECRET; // signature tests toggle explicitly
process.env.WHATSAPP_PHONE_NUMBER_ID = "PNID_456789";
delete process.env.PHONE_NUMBER_ID;
process.env.WHATSAPP_VERIFY_TOKEN = "VERIFY_SECRET_ABC";
delete process.env.VERIFY_TOKEN;
process.env.WHATSAPP_GRAPH_API_VERSION = "v21.0";
process.env.GROQ_API_KEY = "test-groq-key-not-used-here";

export {};
